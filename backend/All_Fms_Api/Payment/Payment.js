const express = require("express");
const { sheets, spreadsheetId } = require("../../config/googleSheet");
const router = express.Router();



router.get("/Get-Payment", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Contractor_Payment_FMS!A7:BE",
    });

    const paymentSheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Payment_Sheet!A:L", 
    });

    let rows = response.data.values || [];
    let paymentRows = paymentSheetResponse.data.values || [];

    // Remove header row if exists
    if (rows.length > 0) rows = rows.slice(1);

    const filteredData = rows
      .filter((row) => {
        const planned7 = (row[47] || "").toString().trim();
        const currentBillNo = (row[1] || "").toString().trim();

        if (planned7 === "") return false;

        let isBalanceZero = false;

        // Check latest balance for this bill no (reverse loop = latest first)
        for (let i = paymentRows.length - 1; i >= 0; i--) {
          const pRow = paymentRows[i];
          const pBillNo = (pRow[5] || "").toString().trim();   // Col F → Bill No
          const pBalance = (pRow[11] || "").toString().trim(); // Col L → Balance

          if (pBillNo === currentBillNo) {
            if (pBalance === "0" || pBalance === "0.00" || parseFloat(pBalance || 0) === 0) {
              isBalanceZero = true;
            }
            break;
          }
        }
        return !isBalanceZero;
      })
      .map((row) => {
        const currentBillNo = (row[1] || "").toString().trim();

        // Default values
        let latestPaidAmount = "0";
        let latestBalanceAmount = "0";
        let latestTDSAmount = "0";        // ← TDS from Column I

        // Find the LATEST entry for this RCC Bill No in Payment_Sheet
        for (let i = paymentRows.length - 1; i >= 0; i--) {
          const pRow = paymentRows[i];
          if ((pRow[5] || "").toString().trim() === currentBillNo) {
            latestPaidAmount    = pRow[10] || "0";   // Col K → PAID_AMOUNT_8
            latestBalanceAmount = pRow[11] || "0";   // Col L → BALANCE_AMOUNT_8
            latestTDSAmount     = pRow[8]  || "0";   // Col I → TDS_AMOUNT_8  (index 8)
            break;
          }
        }

        return {
          rccBillNo: currentBillNo,
          projectId: row[2] || "",
          projectName: row[3] || "",
          siteEngineer: row[4] || "",
          contractorName: row[5] || "",
          firmName: row[6] || "",
          workName: row[7] || "",
          contractorBillNo: row[8] || "",
          billDate: row[9] || "",
          billUrl: row[10] || "",
          WorkOrderNo: row[16] || "",
          WorkOrderValue: row[18] || "",
          billAmount: row[51] || "",
          NETAMOUNTCurrentAmount: row[26] || "",
          planned7: row[47] || "",
          actual7: row[48] || "",

          // Latest payment details from Payment_Sheet
          latestPaidAmount8: latestPaidAmount,
          latestBalanceAmount8: latestBalanceAmount,
          latestTDSAmount8: latestTDSAmount      // ← Now correct (Column I)
        };
      });

    // Unique Contractors (for dropdown/filter)
    const uniqueContractors = [];
    const seen = new Set();
    filteredData.forEach(item => {
      const key = `${item.contractorName}||${item.firmName}`;
      if (!seen.has(key) && item.contractorName && item.firmName) {
        seen.add(key);
        uniqueContractors.push({
          contractorName: item.contractorName,
          firmName: item.firmName
        });
      }
    });

    res.json({
      success: true,
      data: filteredData,
      uniqueContractors: uniqueContractors,
    });

  } catch (error) {
    console.error("Error in /Get-Payment:", error.message);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch payment data",
      details: error.message 
    });
  }
});




router.post("/Update-Payment", async (req, res) => {
    try {
        const paymentDataArray = req.body; 

        if (!Array.isArray(paymentDataArray) || paymentDataArray.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Request body must be an array of payment objects.",
            });
        }

        const rccBillNosToFind = paymentDataArray.map(item => item.RccBillNo);

        const findRowRes = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Contractor_Payment_FMS!B7:B', 
        });

        const sheetRows = findRowRes.data.values || [];
        const sheetDataRows = sheetRows.slice(1);
        const rowMap = new Map();

        rccBillNosToFind.forEach(rccBillNo => {
            const rowIndex = sheetDataRows.findIndex(r => 
                r[0]?.toString().trim() === rccBillNo.toString().trim()
            );
            if (rowIndex !== -1) {
                rowMap.set(rccBillNo, 8 + rowIndex);
            }
        });

        const fmsUpdates = [];
        const paymentSheetAppendData = [];
        let missingBills = [];

        for (const item of paymentDataArray) {
            const {
                RccBillNo, Timestamp, Planned_8, Project_Name, Contractor_Name_5, 
                Contractor_Firm_Name_5, Bill_Date_5, hasPreviousData,
                // FMS के लिए सभी values
                tdsAmount8, payableAmount8, paidAmount8, balanceAmount8,
                // Payment Sheet के लिए
                PAID_AMOUNT_8,
                ACTUAL_PAID_AMOUNT_8, GRAND_TOTAL_AMOUNT,
                bankDetails8, paymentMode8, paymentDetails8, paymentDate8, status8
            } = item;

            const targetRow = rowMap.get(RccBillNo);

            if (targetRow) {
                // Status हमेशा update करें
                fmsUpdates.push({
                    range: `Contractor_Payment_FMS!AX${targetRow}`,
                    values: [[status8]]
                });
                
                // IMPORTANT: Check करें कि यह bill previous data है या नहीं
                if (hasPreviousData) {
                    // Previous data है → सिर्फ PAID और BALANCE update करें
                    console.log(`Bill ${RccBillNo} has previous data - only updating PAID and BALANCE`);
                    
                    fmsUpdates.push({
                        range: `Contractor_Payment_FMS!BC${targetRow}`, // PAID_AMOUNT_8
                        values: [[paidAmount8]]
                    });
                    
                    fmsUpdates.push({
                        range: `Contractor_Payment_FMS!BD${targetRow}`, // BALANCE_AMOUNT_8
                        values: [[balanceAmount8]]
                    });
                    
                    // TDS और PAYABLE को update नहीं करना
                    console.log(`Skipping TDS and PAYABLE for ${RccBillNo} (has previous data)`);
                } else {
                    // New bill है → सभी columns update करें
                    console.log(`Bill ${RccBillNo} is new - updating all columns`);
                    
                    fmsUpdates.push({
                        range: `Contractor_Payment_FMS!BA${targetRow}`, // TDS_AMOUNT_8
                        values: [[tdsAmount8]]
                    });
                    
                    fmsUpdates.push({
                        range: `Contractor_Payment_FMS!BB${targetRow}`, // PAYABLE_AMOUNT_8
                        values: [[payableAmount8]]
                    });
                    
                    fmsUpdates.push({
                        range: `Contractor_Payment_FMS!BC${targetRow}`, // PAID_AMOUNT_8
                        values: [[paidAmount8]]
                    });
                    
                    fmsUpdates.push({
                        range: `Contractor_Payment_FMS!BD${targetRow}`, // BALANCE_AMOUNT_8
                        values: [[balanceAmount8]]
                    });
                }

                // Payment_Sheet में पूरा data append करें
                paymentSheetAppendData.push([
                    Timestamp,                    // A
                    Planned_8,                    // B
                    Project_Name,                 // C
                    Contractor_Name_5,            // D
                    Contractor_Firm_Name_5,       // E
                    RccBillNo,                    // F
                    Bill_Date_5,                  // G
                    ACTUAL_PAID_AMOUNT_8,         // H
                    tdsAmount8,                   // I
                    payableAmount8,               // J
                    PAID_AMOUNT_8,                // K
                    balanceAmount8,               // L
                    bankDetails8,                 // M
                    paymentMode8,                 // N
                    paymentDetails8,              // O
                    paymentDate8,                 // P
                    GRAND_TOTAL_AMOUNT            // Q
                ]);
            } else {
                missingBills.push(RccBillNo);
            }
        }

        console.log('==================================');
        console.log('FMS Update Summary:');
        console.log(`Total bills: ${paymentDataArray.length}`);
        console.log(`FMS updates: ${fmsUpdates.length}`);
        console.log('==================================');

        // Batch Update FMS
        if (fmsUpdates.length > 0) {
            await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId,
                resource: {
                    valueInputOption: 'USER_ENTERED',
                    data: fmsUpdates
                }
            });
            console.log('FMS updated with conditional logic');
        }

        // Append to Payment_Sheet
        if (paymentSheetAppendData.length > 0) {
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `Payment_Sheet!A:Q`,
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                resource: { 
                    values: paymentSheetAppendData,
                    majorDimension: 'ROWS'
                }
            });
            console.log('Payment Sheet updated successfully');
        }

        res.json({
            success: true,
            message: `Payment processed successfully! Grand Total: ₹${paymentDataArray[0]?.GRAND_TOTAL_AMOUNT || 0}`,
            updatedInFMS: fmsUpdates.length,
            addedToPaymentSheet: paymentSheetAppendData.length,
            grandTotal: paymentDataArray[0]?.GRAND_TOTAL_AMOUNT || 0,
            missingBills
        });

    } catch (error) {
        console.error('Error during batch update:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Server error during batch processing',
            details: error.response?.data || error.message
        });
    }
});


module.exports = router;









