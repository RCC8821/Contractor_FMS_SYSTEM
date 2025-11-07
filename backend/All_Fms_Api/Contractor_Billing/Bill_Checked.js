
// const express = require('express');
// const { sheets, spreadsheetId } = require('../../config/googleSheet');
// const router = express.Router();

// router.get('/Contractor_Bill_Checked', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Copy of Contractor_Billing_FMS!A8:T',
//     });

//     let data = response.data.values || [];

//     // Row 1 header hai, Row 2 se data shuru → slice(1) se header hatao
//     if (data.length > 0) {
//       data = data.slice(1); // Row 2 se shuru
//     }

//     const filteredData = data
//       .filter(row => {
//         const planned2 = row[18] || '';  // S column (0-based index 18)
//         const actual2 = row[19] || '';   // T column (0-based index 19)
//         return planned2 && !actual2;
//       })
//       .map(row => ({
//         planned2: row[18] || '',
//         UID: row[0] || '',
//         projectId: row[1] || '',
//         projectName: row[2] || '',
//         siteEngineer: row[3] || '',
//         contractorName: row[4] || '',
//         firmName: row[5] || '',
//         workName: row[6] || '',
//         workDesc: row[7] || '',
//         quantity: row[8] || '',
//         unit: row[9] || '',
//         rate: row[10] || '',
//         amount: row[11] || '',
//         billNo: row[12] || '',
//         billDate: row[13] || '',
//         billUrl: row[14] || '',
//         prevBillUrl: row[15] || '',
//         remark: row[16] || '',
//       }));

//     res.json({
//       success: true,
//       data: filteredData
//     });

//   } catch (error) {
//     console.error('Error fetching Contractor_Bill_Checked data:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch Contractor_Bill_Checked data' 
//     });
//   }
// });

// module.exports = router;




const express = require('express');
const { sheets, spreadsheetId } = require('../../config/googleSheet');
const router = express.Router();

// === Contractor Bill Checked ===
router.get('/Contractor_Bill_Checked', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Copy of Contractor_Billing_FMS!A8:T',
    });

    let data = response.data.values || [];
    if (data.length > 0) data = data.slice(1); // Skip header

    const filteredData = data
      .filter(row => row[18] && !row[19]) // planned2 yes, actual2 no
      .map(row => ({
        planned2: row[18] || '',
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
        billDate: row[14] || '',
        billUrl: row[15] || '',
        prevBillUrl: row[16] || '',
        remark: row[17] || '',
      }));

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bill data' });
  }
});

// === NEW: Enquiry Capture - Only Porject_ID & Contractor_Name ===
router.get('/enquiry-capture-Billing', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Project_Data!A:F',
    });
    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return res.json({ success: true, data: { projectIds: [], contractorNames: [] } });
    }
    const data = rows.slice(1).map(row => ({
      Project_ID: (row[0] || '').trim(),           // SAHI
      Contractor_Name: (row[4] || '').trim(),      // SAHI
    }));
    const projectIds = [...new Set(data.map(d => d.Project_ID))].filter(Boolean);
    const contractorNames = [...new Set(data.map(d => d.Contractor_Name))].filter(Boolean);
    res.json({ success: true, data: { projectIds, contractorNames } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
module.exports = router;