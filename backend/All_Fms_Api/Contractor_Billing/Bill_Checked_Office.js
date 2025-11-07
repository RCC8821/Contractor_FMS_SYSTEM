
const express = require('express');
const { sheets, spreadsheetId } = require('../../config/googleSheet');
const router = express.Router();

router.get('/Contractor_Bill_Checked_Office', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Copy of Contractor_Billing_FMS!A8:AF', // AE tak (index 30 = AE, 31 = AF)
    });

    let data = response.data.values || [];

    // Skip header row (Row 1)
    if (data.length > 0) {
      data = data.slice(1); // Row 2 se data shuru
    }

    const filteredData = data
      .filter(row => {
        const planned3 = row[30] || '';  // Column AE (0-based index 30)
        const actual3 = row[31] || '';   // Column AF (0-based index 31)
        return planned3 && !actual3;
      })
      .map(row => ({
        planned3: row[30] || '',
        UID: row[1] || '',
        projectId: row[2] || '',
        projectName: row[3] || '',
        siteEngineer: row[4] || '',
        contractorName: row[4] || '',
        firmName: row[6] || '',
        workName: row[7] || '',
        workDesc: row[8] || '',
        quantity: row[9] || '',
        unit: row[10] || '',
        rate: row[11] || '',
        amount: row[12] || '',
        billNo: row[13] || '',
        billDate: row[14] || '',
        billUrl: row[15] || '',
        prevBillUrl: row[16] || '',
        remark: row[17] || '',
        
        // Extra columns (after T)
        measurementSheetUrl2: row[23] || '',     // U
        attendanceSheetUrl2: row[24] || '',      // V
        areaQuantity2: row[25] || '',            // W
        unit2: row[26] || '',                    // X
        qualityApprove2: row[27] || '',          // Y
        photoEvidenceAfterWork2: row[28] || '',  // Z
        remarks2: row[29] || ''                  // AA
      }));

    res.json({
      success: true,
      data: filteredData
    });

  } catch (error) {
    console.error('Error fetching Contractor_Bill_Checked data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch Contractor_Bill_Checked data' 
    });
  }
});

module.exports = router;