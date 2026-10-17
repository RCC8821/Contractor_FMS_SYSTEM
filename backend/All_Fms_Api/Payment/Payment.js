// const express = require("express");
// const { sheets, spreadsheetId } = require("../../config/googleSheet");
// const router = express.Router();

// // GET /Get-Bank-Names - Project_Data sheet se M column ka data fetch karo
// router.get("/Get-Bank-Names", async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: "Project_Data!M:M", // Sirf M column
//     });

//     const rows = response.data.values || [];

//     // Header skip karo (row 1), empty values filter karo, duplicates remove karo
//     const bankNames = rows
//       .slice(1) // First row = header skip
//       .map((row) => (row[0] || "").toString().trim())
//       .filter((name) => name !== "") // Empty remove
//       .filter((name, index, self) => self.indexOf(name) === index); // Unique only

//     res.json({
//       success: true,
//       bankNames: bankNames,
//       total: bankNames.length,
//     });
//   } catch (error) {
//     console.error("Error in /Get-Bank-Names:", error.message);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch bank names",
//       details: error.message,
//     });
//   }
// });






// router.get("/Get-Payment", async (req, res) => {
//   try {
//     // ─── Fetch Contractor_Payment_FMS (bills) ───
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: "Contractor_Payment_FMS!A7:BE",
//     });

//     // ─── Fetch Payment_Sheet (previous payments) ───
//     const paymentSheetResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: "Payment_Sheet!A:L",
//     });

//     // ─── ✅ Fetch Advance Data (Column R = "Advance") ───
//     let advanceRows = [];
//     try {
//       const advanceResponse = await sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: "Payment_Sheet!A:R",
//       });
//       advanceRows = advanceResponse.data.values || [];
//       console.log(`Total rows in Payment_Sheet A:R: ${advanceRows.length}`);
//     } catch (advErr) {
//       console.warn("Advance fetch failed:", advErr.message);
//     }

//     let rows = response.data.values || [];
//     let paymentRows = paymentSheetResponse.data.values || [];

//     if (rows.length > 0) rows = rows.slice(1);

//     // ═══════════════════════════════════════════════════════════
//     // ✅ ADVANCE MAP - Column R = "Advance"
//     // Match: C (Project) + E (Contractor Firm Name)
//     // Priority: L (remaining) > K (original)
//     // ═══════════════════════════════════════════════════════════
//     const advanceMap = new Map();

//     for (let i = 1; i < advanceRows.length; i++) {
//       const aRow = advanceRows[i];
//       if (!aRow) continue;

//       // ✅ Column R (index 17) = "Advance" check
//       const colR = (aRow[17] || "").toString().trim();
//       if (colR !== "Advance") continue;

//       const aProject = (aRow[2] || "").toString().trim();      // C - Project
//       const aContractor = (aRow[4] || "").toString().trim();   // ✅ E - Contractor Firm

//       // K = Paid Amount (original), L = Balance (remaining)
//       const aAmountK = parseFloat((aRow[10] || "0").toString().replace(/,/g, "")) || 0;
//       const aAmountL = (aRow[11] || "").toString().replace(/,/g, "").trim();

//       // Priority: L (remaining) > K (original)
//       let advanceRemaining = 0;
//       if (aAmountL !== "" && !isNaN(parseFloat(aAmountL))) {
//         advanceRemaining = parseFloat(aAmountL);
//       } else {
//         advanceRemaining = aAmountK;
//       }

//       if (!aProject || !aContractor) continue;

//       const key = `${aProject.toLowerCase()}|||${aContractor.toLowerCase()}`;
//       if (advanceRemaining > 0) {
//         advanceMap.set(key, (advanceMap.get(key) || 0) + advanceRemaining);
//         console.log(`✅ [Advance] ${aProject} | ${aContractor} | Amount: ${advanceRemaining}`);
//       }
//     }

//     console.log(`[Advance Map] Total Entries: ${advanceMap.size}`);
//     console.log('[Advance Map] All keys:', Array.from(advanceMap.keys()));

//     // ═══════════════════════════════════════════════════════════
//     // Process Bills
//     // ═══════════════════════════════════════════════════════════
//     const filteredData = rows
//       .filter((row) => {
//         const planned7 = (row[47] || "").toString().trim();
//         const bdBalance = (row[55] || "").toString().trim();

//         // Rule 1: planned7 empty hai to skip
//         if (planned7 === "") return false;

//         // Rule 2: BD column 0 hai to skip
//         if (
//           bdBalance === "0" ||
//           bdBalance === "0.00" ||
//           parseFloat(bdBalance) === 0
//         ) {
//           return false;
//         }

//         return true;
//       })
//       .map((row) => {
//         const currentBillNo = (row[1] || "").toString().trim();
//         const projectName = (row[3] || "").toString().trim();
//         const contractorName = (row[5] || "").toString().trim();
//         const firmName = (row[6] || "").toString().trim();

//         // ═══════════════════════════════════════════════
//         // Previous Paid/Balance/TDS from Payment_Sheet
//         // Match: F column (index 5) = RccBillNo
//         // ═══════════════════════════════════════════════
//         let latestPaidAmount = "0";
//         let latestBalanceAmount = "0";
//         let latestTDSAmount = "0";

//         for (let i = paymentRows.length - 1; i >= 0; i--) {
//           const pRow = paymentRows[i];
//           if (!pRow) continue;

//           const pBillNo = (pRow[5] || "").toString().trim();
//           if (pBillNo === currentBillNo) {
//             latestPaidAmount = pRow[10] || "0";   // K
//             latestBalanceAmount = pRow[11] || "0"; // L
//             latestTDSAmount = pRow[8] || "0";      // I
//             break;
//           }
//         }

//         // ✅ Advance amount - MATCH WITH FIRM NAME (E column)
//         const advanceKey = `${projectName.toLowerCase()}|||${firmName.toLowerCase()}`;
//         const advanceAmount = advanceMap.get(advanceKey) || 0;

//         if (advanceAmount > 0) {
//           console.log(`💰 Bill ${currentBillNo}: Project=${projectName}, Firm=${firmName}, Advance=${advanceAmount}`);
//         }

//         return {
//           rccBillNo: currentBillNo,
//           projectId: row[2] || "",
//           projectName: projectName,
//           siteEngineer: row[4] || "",
//           contractorName: contractorName,
//           firmName: firmName,
//           workName: row[7] || "",
//           contractorBillNo: row[8] || "",
//           billDate: row[9] || "",
//           billUrl: row[10] || "",
//           WorkOrderNo: row[16] || "",
//           WorkOrderValue: row[18] || "",
//           billAmount: row[51] || "",
//           NETAMOUNTCurrentAmount: row[26] || "",
//           planned7: row[47] || "",
//           actual7: row[48] || "",

//           // Previous payments
//           latestPaidAmount8: latestPaidAmount,
//           latestBalanceAmount8: latestBalanceAmount,
//           latestTDSAmount8: latestTDSAmount,

//           // ✅ Advance amount
//           advanceAmount: advanceAmount,
//         };
//       });

//     const uniqueContractors = [];
//     const seen = new Set();
//     filteredData.forEach((item) => {
//       const key = `${item.contractorName}||${item.firmName}`;
//       if (!seen.has(key) && item.contractorName && item.firmName) {
//         seen.add(key);
//         uniqueContractors.push({
//           contractorName: item.contractorName,
//           firmName: item.firmName,
//         });
//       }
//     });

//     res.json({
//       success: true,
//       data: filteredData,
//       uniqueContractors: uniqueContractors,
//     });
//   } catch (error) {
//     console.error("Error in /Get-Payment:", error.message);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch payment data",
//       details: error.message,
//     });
//   }
// });




// router.post("/Update-Payment", async (req, res) => {
//   try {
//     const paymentDataArray = req.body;

//     if (!Array.isArray(paymentDataArray) || paymentDataArray.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: "Request body must be an array of payment objects.",
//       });
//     }

//     const rccBillNosToFind = paymentDataArray.map((item) => item.RccBillNo);

//     const findRowRes = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: "Contractor_Payment_FMS!B7:B",
//     });

//     const sheetRows = findRowRes.data.values || [];
//     const sheetDataRows = sheetRows.slice(1);
//     const rowMap = new Map();

//     rccBillNosToFind.forEach((rccBillNo) => {
//       const rowIndex = sheetDataRows.findIndex(
//         (r) => r[0]?.toString().trim() === rccBillNo.toString().trim()
//       );
//       if (rowIndex !== -1) {
//         rowMap.set(rccBillNo, 8 + rowIndex);
//       }
//     });

//     const fmsUpdates = [];
//     const paymentSheetAppendData = [];
//     let missingBills = [];

//     for (const item of paymentDataArray) {
//       const {
//         RccBillNo,
//         Timestamp,
//         Planned_8,
//         Project_Name,
//         Contractor_Name_5,
//         Contractor_Firm_Name_5,
//         Bill_Date_5,
//         hasPreviousData,
//         isAdvanceBill = false,      // ✅ NEW
//         tdsAmount8,
//         payableAmount8,
//         paidAmount8,
//         balanceAmount8,
//         PAID_AMOUNT_8,
//         ACTUAL_PAID_AMOUNT_8,
//         GRAND_TOTAL_AMOUNT,
//         bankDetails8,
//         paymentMode8,
//         paymentDetails8,
//         paymentDate8,
//         status8,
//       } = item;

//       const targetRow = rowMap.get(RccBillNo);

//       if (targetRow) {
//         // Status hamesha update
//         fmsUpdates.push({
//           range: `Contractor_Payment_FMS!AX${targetRow}`,
//           values: [[status8]],
//         });

//         // ✅ ADVANCE BILL - BA, BB, BC, BD sab update
//         if (isAdvanceBill) {
//           console.log(`💰 Advance Bill ${RccBillNo}: TDS=${tdsAmount8}, Payable=${payableAmount8}, Paid=${paidAmount8}, Balance=${balanceAmount8}`);

//           fmsUpdates.push({
//             range: `Contractor_Payment_FMS!BA${targetRow}`,   // TDS
//             values: [[tdsAmount8]],
//           });
//           fmsUpdates.push({
//             range: `Contractor_Payment_FMS!BB${targetRow}`,   // Payable (Bill - TDS)
//             values: [[payableAmount8]],
//           });
//           fmsUpdates.push({
//             range: `Contractor_Payment_FMS!BC${targetRow}`,   // Paid (same as payable)
//             values: [[paidAmount8]],
//           });
//           fmsUpdates.push({
//             range: `Contractor_Payment_FMS!BD${targetRow}`,   // Balance (0)
//             values: [[balanceAmount8]],
//           });
//         }
//         // Previous data wale - sirf paid + balance
//         else if (hasPreviousData) {
//           console.log(`Bill ${RccBillNo} has previous data - only PAID & BALANCE`);
//           fmsUpdates.push({
//             range: `Contractor_Payment_FMS!BC${targetRow}`,
//             values: [[paidAmount8]],
//           });
//           fmsUpdates.push({
//             range: `Contractor_Payment_FMS!BD${targetRow}`,
//             values: [[balanceAmount8]],
//           });
//         }
//         // New bill - sab kuch update
//         else {
//           console.log(`Bill ${RccBillNo} is new - updating all`);
//           fmsUpdates.push({
//             range: `Contractor_Payment_FMS!BA${targetRow}`,
//             values: [[tdsAmount8]],
//           });
//           fmsUpdates.push({
//             range: `Contractor_Payment_FMS!BB${targetRow}`,
//             values: [[payableAmount8]],
//           });
//           fmsUpdates.push({
//             range: `Contractor_Payment_FMS!BC${targetRow}`,
//             values: [[paidAmount8]],
//           });
//           fmsUpdates.push({
//             range: `Contractor_Payment_FMS!BD${targetRow}`,
//             values: [[balanceAmount8]],
//           });
//         }

//         // Payment_Sheet append data
//         paymentSheetAppendData.push([
//           Timestamp,              // A
//           Planned_8,              // B
//           Project_Name,           // C
//           Contractor_Name_5,      // D
//           Contractor_Firm_Name_5, // E
//           RccBillNo,              // F
//           Bill_Date_5,            // G
//           ACTUAL_PAID_AMOUNT_8,   // H
//           tdsAmount8,             // I
//           payableAmount8,         // J
//           PAID_AMOUNT_8,          // K
//           balanceAmount8,         // L
//           bankDetails8,           // M
//           paymentMode8,           // N
//           paymentDetails8,        // O
//           paymentDate8,           // P
//           GRAND_TOTAL_AMOUNT,     // Q
//         ]);
//       } else {
//         missingBills.push(RccBillNo);
//       }
//     }

//     // FMS batch update
//     if (fmsUpdates.length > 0) {
//       await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId,
//         resource: {
//           valueInputOption: "USER_ENTERED",
//           data: fmsUpdates,
//         },
//       });
//       console.log(`FMS updated: ${fmsUpdates.length} cells`);
//     }

//     // Payment_Sheet: first empty row mein data insert
//     if (paymentSheetAppendData.length > 0) {
//       const getRes = await sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: "Payment_Sheet!A:Q",
//       });

//       const rows = getRes.data.values || [];
//       let firstEmptyRowIndex = -1;

//       for (let i = 0; i < rows.length; i++) {
//         const row = rows[i] || [];
//         const isEmpty = row.every(cell =>
//           cell === undefined || cell === null || String(cell).trim() === ''
//         );
//         if (isEmpty) {
//           firstEmptyRowIndex = i;
//           break;
//         }
//       }

//       if (firstEmptyRowIndex === -1) {
//         firstEmptyRowIndex = rows.length;
//       }

//       const startRow = Math.max(firstEmptyRowIndex + 1, 2);
//       const endRow = startRow + paymentSheetAppendData.length - 1;
//       const updateRange = `Payment_Sheet!A${startRow}:Q${endRow}`;

//       console.log(`Payment_Sheet → writing to: ${updateRange}`);

//       await sheets.spreadsheets.values.update({
//         spreadsheetId,
//         range: updateRange,
//         valueInputOption: "USER_ENTERED",
//         resource: {
//           values: paymentSheetAppendData,
//         },
//       });

//       console.log(`Payment_Sheet updated successfully`);
//     }

//     // ═══════════════════════════════════════════════════════════
//     // ✅ Update Advance L column (Deduct actual paid amount)
//     // ═══════════════════════════════════════════════════════════
//     try {
//       const advResponse = await sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: "Payment_Sheet!A:R",
//       });

//       const advRows = advResponse.data.values || [];
//       const advUpdates = [];

//       for (const item of paymentDataArray) {
//         const advanceUsed = parseFloat(item.advanceUsedForThisBill || 0);
//         if (advanceUsed <= 0) continue;

//         const projName = (item.Project_Name || "").toString().trim().toLowerCase();
//         const firmName = (item.Contractor_Firm_Name_5 || "").toString().trim().toLowerCase();

//         let remainingToDeduct = advanceUsed;

//         for (let i = 1; i < advRows.length; i++) {
//           if (remainingToDeduct <= 0) break;

//           const aRow = advRows[i];
//           if (!aRow) continue;

//           const colR = (aRow[17] || "").toString().trim();
//           if (colR !== "Advance") continue;

//           const rowProj = (aRow[2] || "").toString().trim().toLowerCase();
//           const rowFirm = (aRow[4] || "").toString().trim().toLowerCase();

//           if (rowProj !== projName || rowFirm !== firmName) continue;

//           const kValue = parseFloat((aRow[10] || "0").toString().replace(/,/g, "")) || 0;
//           const lValue = (aRow[11] || "").toString().replace(/,/g, "").trim();
//           const currentBalance = (lValue !== "" && !isNaN(parseFloat(lValue))) ? parseFloat(lValue) : kValue;

//           if (currentBalance <= 0) continue;

//           const deductAmount = Math.min(remainingToDeduct, currentBalance);
//           const newBalance = currentBalance - deductAmount;
//           remainingToDeduct -= deductAmount;

//           const rowNumber = i + 1;
//           advUpdates.push({
//             range: `Payment_Sheet!L${rowNumber}`,
//             values: [[newBalance]],
//           });

//           console.log(`💰 Advance Row ${rowNumber}: L = ${newBalance} (deducted ${deductAmount})`);
//         }
//       }

//       if (advUpdates.length > 0) {
//         await sheets.spreadsheets.values.batchUpdate({
//           spreadsheetId,
//           resource: {
//             valueInputOption: "USER_ENTERED",
//             data: advUpdates,
//           },
//         });
//         console.log(`✅ Advance updated: ${advUpdates.length} rows`);
//       }
//     } catch (advErr) {
//       console.error("Advance update error:", advErr.message);
//     }

//     res.json({
//       success: true,
//       message: `Payment processed successfully! Grand Total: ₹${paymentDataArray[0]?.GRAND_TOTAL_AMOUNT || 0}`,
//       updatedInFMS: fmsUpdates.length,
//       addedToPaymentSheet: paymentSheetAppendData.length,
//       grandTotal: paymentDataArray[0]?.GRAND_TOTAL_AMOUNT || 0,
//       missingBills,
//     });
//   } catch (error) {
//     console.error("Error during batch update:", error.response?.data || error.message);
//     res.status(500).json({
//       success: false,
//       error: "Server error during batch processing",
//       details: error.response?.data || error.message,
//     });
//   }
// });






// module.exports = router;









const express = require("express");
const { sheets, spreadsheetId } = require("../../config/googleSheet");
const router = express.Router();

// GET /Get-Bank-Names - Project_Data sheet se M column ka data fetch karo
router.get("/Get-Bank-Names", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Project_Data!M:M", // Sirf M column
    });

    const rows = response.data.values || [];

    // Header skip karo (row 1), empty values filter karo, duplicates remove karo
    const bankNames = rows
      .slice(1) // First row = header skip
      .map((row) => (row[0] || "").toString().trim())
      .filter((name) => name !== "") // Empty remove
      .filter((name, index, self) => self.indexOf(name) === index); // Unique only

    res.json({
      success: true,
      bankNames: bankNames,
      total: bankNames.length,
    });
  } catch (error) {
    console.error("Error in /Get-Bank-Names:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch bank names",
      details: error.message,
    });
  }
});

router.get("/Get-Payment", async (req, res) => {
  try {
    // ─── Fetch Contractor_Payment_FMS (bills) ───
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Contractor_Payment_FMS!A7:BE",
    });

    // ─── Fetch Payment_Sheet (previous payments) ───
    const paymentSheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Payment_Sheet!A:L",
    });

    // ─── ✅ Fetch Advance Data (Column R = "Advance") ───
    let advanceRows = [];
    try {
      const advanceResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Payment_Sheet!A:R",
      });
      advanceRows = advanceResponse.data.values || [];
      console.log(`Total rows in Payment_Sheet A:R: ${advanceRows.length}`);
    } catch (advErr) {
      console.warn("Advance fetch failed:", advErr.message);
    }

    let rows = response.data.values || [];
    let paymentRows = paymentSheetResponse.data.values || [];

    if (rows.length > 0) rows = rows.slice(1);

    // ═══════════════════════════════════════════════════════════
    // ✅ ADVANCE MAP - Column R = "Advance"
    // Match: C (Project) + E (Contractor Firm Name)
    // Priority: L (remaining) > K (original)
    // ═══════════════════════════════════════════════════════════
    const advanceMap = new Map();

    for (let i = 1; i < advanceRows.length; i++) {
      const aRow = advanceRows[i];
      if (!aRow) continue;

      // ✅ Column R (index 17) = "Advance" check
      const colR = (aRow[17] || "").toString().trim();
      if (colR !== "Advance") continue;

      const aProject = (aRow[2] || "").toString().trim();      // C - Project
      const aContractor = (aRow[4] || "").toString().trim();   // ✅ E - Contractor Firm

      // K = Paid Amount (original), L = Balance (remaining)
      const aAmountK = parseFloat((aRow[10] || "0").toString().replace(/,/g, "")) || 0;
      const aAmountL = (aRow[11] || "").toString().replace(/,/g, "").trim();

      // Priority: L (remaining) > K (original)
      let advanceRemaining = 0;
      if (aAmountL !== "" && !isNaN(parseFloat(aAmountL))) {
        advanceRemaining = parseFloat(aAmountL);
      } else {
        advanceRemaining = aAmountK;
      }

      if (!aProject || !aContractor) continue;

      const key = `${aProject.toLowerCase()}|||${aContractor.toLowerCase()}`;
      if (advanceRemaining > 0) {
        advanceMap.set(key, (advanceMap.get(key) || 0) + advanceRemaining);
        console.log(`✅ [Advance] ${aProject} | ${aContractor} | Amount: ${advanceRemaining}`);
      }
    }

    console.log(`[Advance Map] Total Entries: ${advanceMap.size}`);
    console.log('[Advance Map] All keys:', Array.from(advanceMap.keys()));

    // ═══════════════════════════════════════════════════════════
    // Process Bills
    // ═══════════════════════════════════════════════════════════
    const filteredData = rows
      .filter((row) => {
        const planned7 = (row[47] || "").toString().trim();
        const bdBalance = (row[55] || "").toString().trim();

        // Rule 1: planned7 empty hai to skip
        if (planned7 === "") return false;

        // Rule 2: BD column 0 hai to skip
        if (
          bdBalance === "0" ||
          bdBalance === "0.00" ||
          parseFloat(bdBalance) === 0
        ) {
          return false;
        }

        return true;
      })
      .map((row) => {
        const currentBillNo = (row[1] || "").toString().trim();
        const projectName = (row[3] || "").toString().trim();
        const contractorName = (row[5] || "").toString().trim();
        const firmName = (row[6] || "").toString().trim();

        // ═══════════════════════════════════════════════
        // Previous Paid/Balance/TDS from Payment_Sheet
        // Match: F column (index 5) = RccBillNo
        // ═══════════════════════════════════════════════
        let latestPaidAmount = "0";
        let latestBalanceAmount = "0";
        let latestTDSAmount = "0";

        for (let i = paymentRows.length - 1; i >= 0; i--) {
          const pRow = paymentRows[i];
          if (!pRow) continue;

          const pBillNo = (pRow[5] || "").toString().trim();
          if (pBillNo === currentBillNo) {
            latestPaidAmount = pRow[10] || "0";   // K
            latestBalanceAmount = pRow[11] || "0"; // L
            latestTDSAmount = pRow[8] || "0";      // I
            break;
          }
        }

        // ✅ Advance amount - MATCH WITH FIRM NAME (E column)
        const advanceKey = `${projectName.toLowerCase()}|||${firmName.toLowerCase()}`;
        const advanceAmount = advanceMap.get(advanceKey) || 0;

        if (advanceAmount > 0) {
          console.log(`💰 Bill ${currentBillNo}: Project=${projectName}, Firm=${firmName}, Advance=${advanceAmount}`);
        }

        return {
          rccBillNo: currentBillNo,
          projectId: row[2] || "",
          projectName: projectName,
          siteEngineer: row[4] || "",
          contractorName: contractorName,
          firmName: firmName,
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

          // Previous payments
          latestPaidAmount8: latestPaidAmount,
          latestBalanceAmount8: latestBalanceAmount,
          latestTDSAmount8: latestTDSAmount,

          // ✅ Advance amount
          advanceAmount: advanceAmount,
        };
      });

    const uniqueContractors = [];
    const seen = new Set();
    filteredData.forEach((item) => {
      const key = `${item.contractorName}||${item.firmName}`;
      if (!seen.has(key) && item.contractorName && item.firmName) {
        seen.add(key);
        uniqueContractors.push({
          contractorName: item.contractorName,
          firmName: item.firmName,
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
      details: error.message,
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

    const rccBillNosToFind = paymentDataArray.map((item) => item.RccBillNo);

    const findRowRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Contractor_Payment_FMS!B7:B",
    });

    const sheetRows = findRowRes.data.values || [];
    const sheetDataRows = sheetRows.slice(1);
    const rowMap = new Map();

    rccBillNosToFind.forEach((rccBillNo) => {
      const rowIndex = sheetDataRows.findIndex(
        (r) => r[0]?.toString().trim() === rccBillNo.toString().trim()
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
        RccBillNo,
        Timestamp,
        Planned_8,
        Project_Name,
        Contractor_Name_5,
        Contractor_Firm_Name_5,
        Bill_Date_5,
        hasPreviousData,
        isAdvanceBill = false,      // ✅ NEW
        tdsAmount8,
        payableAmount8,
        paidAmount8,
        balanceAmount8,
        PAID_AMOUNT_8,
        ACTUAL_PAID_AMOUNT_8,
        GRAND_TOTAL_AMOUNT,
        bankDetails8,
        paymentMode8,
        paymentDetails8,
        paymentDate8,
        status8,
      } = item;

      const targetRow = rowMap.get(RccBillNo);

      if (targetRow) {
        // Status hamesha update
        fmsUpdates.push({
          range: `Contractor_Payment_FMS!AX${targetRow}`,
          values: [[status8]],
        });

        // ✅ ADVANCE BILL - BA, BB, BC, BD sab update
        if (isAdvanceBill) {
          console.log(`💰 Advance Bill ${RccBillNo}: TDS=${tdsAmount8}, Payable=${payableAmount8}, Paid=${paidAmount8}, Balance=${balanceAmount8}`);

          fmsUpdates.push({
            range: `Contractor_Payment_FMS!BA${targetRow}`,   // TDS
            values: [[tdsAmount8]],
          });
          fmsUpdates.push({
            range: `Contractor_Payment_FMS!BB${targetRow}`,   // Payable (Bill - TDS)
            values: [[payableAmount8]],
          });
          fmsUpdates.push({
            range: `Contractor_Payment_FMS!BC${targetRow}`,   // Paid (same as payable)
            values: [[paidAmount8]],
          });
          fmsUpdates.push({
            range: `Contractor_Payment_FMS!BD${targetRow}`,   // Balance (0)
            values: [[balanceAmount8]],
          });
        }
        // Previous data wale - sirf paid + balance
        else if (hasPreviousData) {
          console.log(`Bill ${RccBillNo} has previous data - only PAID & BALANCE`);
          fmsUpdates.push({
            range: `Contractor_Payment_FMS!BC${targetRow}`,
            values: [[paidAmount8]],
          });
          fmsUpdates.push({
            range: `Contractor_Payment_FMS!BD${targetRow}`,
            values: [[balanceAmount8]],
          });
        }
        // New bill - sab kuch update
        else {
          console.log(`Bill ${RccBillNo} is new - updating all`);
          fmsUpdates.push({
            range: `Contractor_Payment_FMS!BA${targetRow}`,
            values: [[tdsAmount8]],
          });
          fmsUpdates.push({
            range: `Contractor_Payment_FMS!BB${targetRow}`,
            values: [[payableAmount8]],
          });
          fmsUpdates.push({
            range: `Contractor_Payment_FMS!BC${targetRow}`,
            values: [[paidAmount8]],
          });
          fmsUpdates.push({
            range: `Contractor_Payment_FMS!BD${targetRow}`,
            values: [[balanceAmount8]],
          });
        }

        // ═══════════════════════════════════════════════════════════
        // ✅ NEW: BE se BI Tak Payment Details Update (Bank, Mode, Txn, Date, Grand Total)
        // BE = Bank Details
        // BF = Payment Mode
        // BG = Payment Details
        // BH = Payment Date
        // BI = Grand Total
        // ═══════════════════════════════════════════════════════════
        fmsUpdates.push({
          range: `Contractor_Payment_FMS!BE${targetRow}:BI${targetRow}`,
          values: [[
            bankDetails8 || "", 
            paymentMode8 || "", 
            paymentDetails8 || "", 
            paymentDate8 || "", 
            GRAND_TOTAL_AMOUNT || 0
          ]],
        });

        // Payment_Sheet append data
        paymentSheetAppendData.push([
          Timestamp,              // A
          Planned_8,              // B
          Project_Name,           // C
          Contractor_Name_5,      // D
          Contractor_Firm_Name_5, // E
          RccBillNo,              // F
          Bill_Date_5,            // G
          ACTUAL_PAID_AMOUNT_8,   // H
          tdsAmount8,             // I
          payableAmount8,         // J
          PAID_AMOUNT_8,          // K
          balanceAmount8,         // L
          bankDetails8,           // M
          paymentMode8,           // N
          paymentDetails8,        // O
          paymentDate8,           // P
          GRAND_TOTAL_AMOUNT,     // Q
        ]);
      } else {
        missingBills.push(RccBillNo);
      }
    }

    // FMS batch update
    if (fmsUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: {
          valueInputOption: "USER_ENTERED",
          data: fmsUpdates,
        },
      });
      console.log(`FMS updated: ${fmsUpdates.length} cells`);
    }

    // Payment_Sheet: first empty row mein data insert
    if (paymentSheetAppendData.length > 0) {
      const getRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Payment_Sheet!A:Q",
      });

      const rows = getRes.data.values || [];
      let firstEmptyRowIndex = -1;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] || [];
        const isEmpty = row.every(cell =>
          cell === undefined || cell === null || String(cell).trim() === ''
        );
        if (isEmpty) {
          firstEmptyRowIndex = i;
          break;
        }
      }

      if (firstEmptyRowIndex === -1) {
        firstEmptyRowIndex = rows.length;
      }

      const startRow = Math.max(firstEmptyRowIndex + 1, 2);
      const endRow = startRow + paymentSheetAppendData.length - 1;
      const updateRange = `Payment_Sheet!A${startRow}:Q${endRow}`;

      console.log(`Payment_Sheet → writing to: ${updateRange}`);

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: updateRange,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: paymentSheetAppendData,
        },
      });

      console.log(`Payment_Sheet updated successfully`);
    }

    // ═══════════════════════════════════════════════════════════
    // ✅ Update Advance L column (Deduct actual paid amount)
    // ═══════════════════════════════════════════════════════════
    try {
      const advResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Payment_Sheet!A:R",
      });

      const advRows = advResponse.data.values || [];
      const advUpdates = [];

      for (const item of paymentDataArray) {
        const advanceUsed = parseFloat(item.advanceUsedForThisBill || 0);
        if (advanceUsed <= 0) continue;

        const projName = (item.Project_Name || "").toString().trim().toLowerCase();
        const firmName = (item.Contractor_Firm_Name_5 || "").toString().trim().toLowerCase();

        let remainingToDeduct = advanceUsed;

        for (let i = 1; i < advRows.length; i++) {
          if (remainingToDeduct <= 0) break;

          const aRow = advRows[i];
          if (!aRow) continue;

          const colR = (aRow[17] || "").toString().trim();
          if (colR !== "Advance") continue;

          const rowProj = (aRow[2] || "").toString().trim().toLowerCase();
          const rowFirm = (aRow[4] || "").toString().trim().toLowerCase();

          if (rowProj !== projName || rowFirm !== firmName) continue;

          const kValue = parseFloat((aRow[10] || "0").toString().replace(/,/g, "")) || 0;
          const lValue = (aRow[11] || "").toString().replace(/,/g, "").trim();
          const currentBalance = (lValue !== "" && !isNaN(parseFloat(lValue))) ? parseFloat(lValue) : kValue;

          if (currentBalance <= 0) continue;

          const deductAmount = Math.min(remainingToDeduct, currentBalance);
          const newBalance = currentBalance - deductAmount;
          remainingToDeduct -= deductAmount;

          const rowNumber = i + 1;
          advUpdates.push({
            range: `Payment_Sheet!L${rowNumber}`,
            values: [[newBalance]],
          });

          console.log(`💰 Advance Row ${rowNumber}: L = ${newBalance} (deducted ${deductAmount})`);
        }
      }

      if (advUpdates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          resource: {
            valueInputOption: "USER_ENTERED",
            data: advUpdates,
          },
        });
        console.log(`✅ Advance updated: ${advUpdates.length} rows`);
      }
    } catch (advErr) {
      console.error("Advance update error:", advErr.message);
    }

    res.json({
      success: true,
      message: `Payment processed successfully! Grand Total: ₹${paymentDataArray[0]?.GRAND_TOTAL_AMOUNT || 0}`,
      updatedInFMS: fmsUpdates.length,
      addedToPaymentSheet: paymentSheetAppendData.length,
      grandTotal: paymentDataArray[0]?.GRAND_TOTAL_AMOUNT || 0,
      missingBills,
    });
  } catch (error) {
    console.error("Error during batch update:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Server error during batch processing",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;