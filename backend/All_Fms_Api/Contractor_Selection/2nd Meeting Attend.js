

const express = require('express');
const { sheets, drive, spreadsheetId } = require('../../config/googleSheet');
const { Readable } = require('stream');
const router = express.Router();


async function uploadToGoogleDrive(base64Data, fileName) {
  if (!base64Data || typeof base64Data !== 'string') return '';

  // Extract MIME type aur base64 content
  const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
  if (!match) {
    console.error('[DRIVE] Invalid base64 format');
    return '';
  }

  const mimeType = match[1];
  const base64Content = match[2];

  try {
    const buffer = Buffer.from(base64Content, 'base64');

    const fileStream = new Readable();
    fileStream.push(buffer);
    fileStream.push(null);

    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = { mimeType, body: fileStream };

    const res = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id',
      supportsAllDrives: true,
    });

    const fileId = res.data.id;

    // Public link banate hain
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    });

    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  } catch (err) {
    console.error(`[DRIVE UPLOAD FAILED] ${fileName}:`, err.message);
    return '';
  }
}
// =======================================================
// GET /Get_Meeting_Mom → Pending MOM wale records
// =======================================================
router.get('/Get_Second_Meeting_Attend', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Selection_FMS!A7:AW',
    });

    let data = response.data.values || [];
    if (data.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Skip header row
    data = data.slice(1);

    const filteredData = data
      .filter(row => row[41]?.toString().trim() && !row[42]?.toString().trim()) // planned5 hai, actual5 nahi
      .map(row => ({
        planned6: row[41] || '',
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
        actual6: row[42] || '',
        MeetingScheduleSlot_3: row[21] || '',
        Doer_Name_3: row[22] || '',
        Doer_Name_4: row[28] || '',
        MeetingLocation:row[34] || '',
        MomPdf5:row[36] || '',
        GstCertificate5:row[37] || '',
        BasicTurnOver5:row[38] || '',
        NoOfProject5:row[39] || '',
        NextMeetingSchedule5: row[40] || '',
      
      }));

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('GET /Get_Second_Meeting_Attend Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch MOM data' });
  }
});

router.post('/Post_Second_Meeting_Attend', async (req, res) => {
  try {
    const {
      uid,
      status6 = '',
      DoerName_6 = '',
      momPdfBase64
    } = req.body;

    // Validation
    if (!uid || !momPdfBase64) {
      return res.status(400).json({
        success: false,
        error: !uid ? 'UID is required' : 'MOM PDF (base64) is required'
      });
    }

    const inputUid = uid.toString().trim(); // जैसे "0001"
    const timestamp = Date.now();

    // Upload PDF to Google Drive
    const momPdfUrl = await uploadToGoogleDrive(momPdfBase64, `MOM_${inputUid}_${timestamp}.pdf`);
    if (!momPdfUrl) {
      return res.status(500).json({ success: false, error: 'Failed to upload MOM PDF' });
    }

    // Fetch data from sheet (A8 से शुरू)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Selection_FMS!A8:AT1000', // AT तक काफी है
    });

    const rows = response.data.values || [];
    let targetRow = -1;

    // Column R = index 17 (A=0, B=1, ..., R=17)
    for (let i = 0; i < rows.length; i++) {
      const cellValue = rows[i][17]; // Column R

      if (!cellValue) continue;

      let sheetUid = cellValue.toString().trim();

      // अगर number है तो leading zeros लगा दो (4 digit format में)
      if (!isNaN(sheetUid) && sheetUid !== '') {
        sheetUid = sheetUid.padStart(4, '0'); // 1 → "0001", 23 → "0023"
      }

      // Extra spaces/invisible chars हटाओ
      sheetUid = sheetUid.replace(/\s/g, '');

      // Match करो
      if (sheetUid === inputUid) {
        targetRow = i + 8; // क्योंकि data A8 से शुरू होता है
        break;
      }
    }

    // अगर UID नहीं मिला
    if (targetRow === -1) {
      return res.status(404).json({
        success: false,
        error: 'UID not found in Column R',
        receivedUid: inputUid,
        suggestion: "Make sure UID in Column R is exactly like 0001, 0002 etc."
      });
    }

    // Update AR, AS, AT columns
    const values = [[
      status6,         // AR → Status_6
      DoerName_6,      // AS → Doer Name
      momPdfUrl        // AT → MOM PDF Link
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Contractor_Selection_FMS!AR${targetRow}:AT${targetRow}`,
      valueInputOption: 'RAW',
      resource: { values },
    });

    return res.json({
      success: true,
      message: 'Data saved successfully in row ' + targetRow,
      row: targetRow,
      uid: inputUid,
      momPdfUrl: momPdfUrl,
      status6: status6,
      doer: DoerName_6
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message
    });
  }
});


module.exports = router;