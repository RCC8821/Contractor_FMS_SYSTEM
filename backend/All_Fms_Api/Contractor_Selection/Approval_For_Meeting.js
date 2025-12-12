const express = require('express');
const { sheets, spreadsheetId } = require('../../config/googleSheet');
const router = express.Router();

router.get('/Approval_For_Meeting', async (req, res) => {
  try {
    // Assuming the new data starts from column A (Timestamp) to R (Remark_2), adjust range if needed
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Selection_FMS!A7:T', 
    });

    let data = response.data.values || [];
    if (data.length > 0) data = data.slice(1); // Skip header row

    // Map to the new required columns
    const filteredData = data 
    .filter(row => row[18] && !row[19])
    .map(row => ({
      planned3: row[18] || '',
      uid: row[17] || '',
      projectId: row[1] || '',
      clientName1: row[2] || '',
      mobileNumber1: row[3] || '',
      city: row[4] || '',
      address1: row[5] || '',
      requirement1: row[6] || '',
      contractorName2: row[12] || '',
      contractorContactNo2: row[13] || '',
      contractorType2: row[14] || '',
      remark2: row[16] || '',
      actual3: row[19] || '',

    }));

    // If you need filtering, add it here (e.g., based on some condition). For now, returning all mapped data.
    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('GET /Approval_For_Meeting:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
  }
});







router.post('/Post_Approval_For_Meeting', async (req, res) => {
  try {
    const { uid, status3, meetingScheduleSlot3, doerName3, remark3 } = req.body;

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
    const updateRange = `Contractor_Selection_FMS!U${targetRowIndex}:Y${targetRowIndex}`;
    const updateValues = [
      [
        status3 || '',           // Column T (Status_3)
        meetingScheduleSlot3 || '', // Column U (Meeting_Schedule_Slot_3)
        doerName3 || '',         // Column V (Doer_Name_3)
        '',                      // Column W (skipped)
        remark3 || ''            // Column X (Remark_3)
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
    console.error('POST /Post_Approval_For_Meeting:', error);
    res.status(500).json({ success: false, error: 'Failed to update data' });
  }
});



module.exports = router;
