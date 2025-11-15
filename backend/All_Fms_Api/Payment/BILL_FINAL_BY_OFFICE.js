
const express = require('express');
const { sheets, spreadsheetId } = require('../../config/googleSheet');
const router = express.Router();

router.get('/Bill_Final_Checked_Office', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Billing_FMS!A7:AF',
    });

    let data = response.data.values || [];
    if (data.length > 0) data = data.slice(1);

    const filteredData = data
      .filter(row => row[30] && !row[31]) // AE (planned3) filled, AF (actual3) empty
      .map(row => ({
        planned3: row[30] || '',
        UID: row[1] || '',
        projectId: row[2] || '',
        projectName: row[3] || '',
        siteEngineer: row[4] || '',
        contractorName: row[5] || '',
        firmName: row[6] || '',
        workName: row[7] || '',
        workDesc: row[8] || '',
        quantity: row[9] || '',
        unit: row[10] || '',
        rate: row[11] || '',
        amount: row[12] || '',
        billNo: row[13] || '',
        rccBillNo: row[14] || '',
        billDate: row[15] || '',
        billUrl: row[16] || '',
        prevBillUrl: row[17] || '',
        remark: row[18] || '',
        measurementSheetUrl2: row[23] || '',
        attendanceSheetUrl2: row[24] || '',
        areaQuantity2: row[25] || '',
        unit2: row[26] || '',
        qualityApprove2: row[27] || '',
        photoEvidenceAfterWork2: row[28] || '',
        remarks2: row[29] || ''
      }));

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('GET /Contractor_Bill_Checked_Office Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
  }
});




module.exports = router   