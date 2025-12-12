const express = require('express');
const { sheets, spreadsheetId } = require('../../config/googleSheet');
const router = express.Router();

router.get('/Get_1st_Meeting_Attend', async (req, res) => {
  try {
    // Assuming the new data starts from column A (Timestamp) to R (Remark_2), adjust range if needed
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Selection_FMS!A7:AG', // Updated range to cover 17 columns (A to R)
    });

    let data = response.data.values || [];
    if (data.length > 0) data = data.slice(1); // Skip header row

    // Map to the new required columns
    const filteredData = data 
    .filter(row => row[25] && !row[26])
    .map(row => ({
      planned4: row[25] || '',
      uid:row[17] || '',
      projectId: row[1] || '',
      clientName1: row[2] || '',
      mobileNumber1: row[3] || '',
      city: row[4] || '',
      address1: row[5] || '',
      requirement1: row[6] || '',
      contractorName2: row[12] || '',
      contractorContactNo2: row[13] || '',
      contractorType2: row[14] || '',
      actual4: row[26] || '',
      MeetingScheduleSlot_3 : row[21] || '',
      Doer_Name_3:row[22] || '',
      remark3: row[24] || '',
    }));

    // If you need filtering, add it here (e.g., based on some condition). For now, returning all mapped data.
    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('GET /Approval_For_Meeting:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
  }
});







router.post('/Post_1st_Meeting_Attend', async (req, res) => {
  try {
    const { uid, status4,  doerName4, remark4 } = req.body;

    // Validate required fields
    if (!uid) {
      return res.status(400).json({ success: false, error: 'UID is required' });
    }

    // Fetch the data to find the row with matching UID (assuming UID is in column R, index 17)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Selection_FMS!A8:R', // Fetch from row 8 onwards, columns A to R (to get row numbers and UID)
    });

    const data = response.data.values || [];
    let targetRowIndex = -1;

    // Find the row where UID matches (assuming UID is in column R, index 17)
    for (let i = 0; i < data.length; i++) {
      if (data[i][17] === uid) { // data[i][17] is column R (UID)
        targetRowIndex = i + 8; // Row number (since data starts from row 8, index 0 corresponds to row 8)
        break;
      }
    }

    if (targetRowIndex === -1) {
      return res.status(404).json({ success: false, error: 'UID not found' });
    }

    // Prepare the update data for columns T, U, V, X (indices 19, 20, 21, 23)
    const updateRange = `Contractor_Selection_FMS!AB${targetRowIndex}:AE${targetRowIndex}`;
    const updateValues = [
      [
        status4 || '',           
        doerName4 || '',         // Column V (Doer_Name_3)
        '',                      // Column W (skipped)
        remark4 || ''            // Column X (Remark_3)
      ]
    ];

    // Update the sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'RAW',
      resource: { values: updateValues },
    });

    res.json({ success: true, message: 'Data updated successfully' });
  } catch (error) {
    console.error('POST /Post_1st_Meeting_Attend:', error);
    res.status(500).json({ success: false, error: 'Failed to update data' });
  }
});


module.exports = router;
