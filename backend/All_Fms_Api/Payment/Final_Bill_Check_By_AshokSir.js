const express = require("express");
const { sheets, spreadsheetId } = require("../../config/googleSheet");
const router = express.Router();

// NEW API NAME: Payment_final_bill_Checked
router.get("/Payment_final_bill_Checked_AshokSir", async (req, res) => {
  try {
    // Range: A7:AB → 28 columns (A=1, AB=28)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Contractor_Payment_FMS!A7:AS",
    });

    let rows = response.data.values || [];

    // Skip header row (Row 7 is header)
    if (rows.length > 0) {
      rows = rows.slice(1);
    }

    const filteredData = rows
      .filter((row) => {
        // Row में कम से कम 28 कॉलम्स होने चाहिए (A to AB)
        // if (row.length < 28) return false;

        const planned7 = (row[40] || "").toString().trim(); // Column AA → PLANNED_6
        const actual7 = (row[41] || "").toString().trim(); // Column AB → ACTUAL_6

        // Filter: PLANNED_6 filled AND ACTUAL_6 empty
        return planned7 !== "" && actual7 === "";
      })
      .map((row) => ({
        rccBillNo: row[1] || "",
        projectId: row[2] || "",
        projectName: row[3] || "",
        siteEngineer: row[4] || "",
        contractorName: row[5] || "",
        firmName: row[6] || "",
        workName: row[7] || "",
        contractorBillNo: row[8] || "",
        billDate: row[9] || "",
        billUrl: row[10] || "",
        PreviousBillUrl: row[11] || "",
        measurementSheetUrl: row[12] || "",
        attendanceSheetUrl: row[13] || "",
        rccSummarySheetNo: row[14] || "",
        rccSummarySheetUrl: row[15] || "",
        WorkOrderNo: row[16] || "",
        workOrderUrl: row[17] || "",
        WorkOrderValue: row[18] || "",
        billAmount: row[19] || "",
        NETAMOUNTCurrentAmount: row[25] || "",
        PreviousBillAmount: row[26] || "",
        UPToDatePaidAmount: row[27] || "",
        BalanceAmount: row[28] || "",
        remark: row[38] || "",
        planned7: row[40] || "",
        actual7: row[41] || "",
      }));

    res.json({
      success: true,
      message: "Pending final bills fetched successfully",
      count: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    console.error("Error in /Payment_final_bill_Checked:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch data",
      details: error.message,
    });
  }
});



router.post('/Post_Final_Bill_Checked_AshokSir', async (req, res) => {
  try {
    const {
      rccBillNo,
      status7,
      remark7
    } = req.body;

    if (!rccBillNo) {
      return res.status(400).json({ success: false, error: 'Rcc Bill No is required' });
    }

    
    const valuesRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Payment_FMS!A7:AS',
    });

    const rows = valuesRes.data.values || [];
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'No data' });

    const dataRows = rows.slice(1);
    const rowIndex = dataRows.findIndex(r => 
      r[1]?.toString().trim() === rccBillNo.toString().trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({ success: false, error: 'RCC Bill No not found' });
    }

    const targetRowNum = 8 + rowIndex;

    // 2. सिर्फ़ उन columns को अपडेट करो जो blank हैं या formula नहीं है
    const updates = [];

    const addUpdate = (colLetter, value) => {
      if (value !== undefined && value !== null && value !== '') {
        updates.push({
          range: `Contractor_Payment_FMS!${colLetter}${targetRowNum}`,
          values: [[value]]
        });
      }
    };

    addUpdate('AQ', status7);              
    addUpdate('AS', remark7);             

    if (updates.length === 0) {
      return res.json({ success: true, message: 'No fields to update' });
    }

    // 3. Batch Update → हर cell अलग-अलग → formula कभी नहीं हटेगा
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    res.json({
      success: true,
      message: 'Final bill checked & updated successfully (formulas safe)',
      rccBillNo,
      updatedCells: updates.map(u => u.range)
    });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;
