// File: Contractor_Selection/Approval_For_Meeting.js (ya jahan bhi hai)

const express = require('express');
const { sheets, drive, spreadsheetId } = require('../../config/googleSheet');
const { Readable } = require('stream');
const router = express.Router();

// =======================================================
// GOOGLE DRIVE UPLOAD FUNCTION – SABSE UPAR (ZAROORI)
// =======================================================
// UNIVERSAL UPLOAD – PDF, JPG, PNG, DOCX, ZIP — Sab Chalega!
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
router.get('/Get_Meeting_Mom', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Selection_FMS!A7:AG1000',
    });

    let data = response.data.values || [];
    if (data.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Skip header row
    data = data.slice(1);

    const filteredData = data
      .filter(row => row[31]?.toString().trim() && !row[32]?.toString().trim()) // planned5 hai, actual5 nahi
      .map(row => ({
        planned5: row[31] || '',
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
        actual5: row[32] || '',
        MeetingScheduleSlot_3: row[21] || '',
        Doer_Name_3: row[22] || '',
        Doer_Name_4: row[28] || '',
        remark4: row[30] || '',
      }));

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('GET /Get_Meeting_Mom Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch MOM data' });
  }
});


router.post('/Post_Meeting_Mom', async (req, res) => {
  try {
    const {
      uid,
      status5 = '',
      meetingLocation5 = '',
      nextMeetingSchedule5 = '',
      basicTurnover5 = '',
      noOfProjects5 = '',
      momPdfBase64,
      gstCertificateBase64
    } = req.body;

    // Validation
    if (!uid) return res.status(400).json({ success: false, error: 'UID is required' });
    if (!momPdfBase64) return res.status(400).json({ success: false, error: 'MOM PDF is required' });

    const trimmedUid = uid.toString().trim();
    const timestamp = Date.now();

    // Upload PDFs
    const [momPdfUrl, gstCertUrl] = await Promise.all([
      uploadToGoogleDrive(momPdfBase64, `MOM_${trimmedUid}_${timestamp}.pdf`),
      gstCertificateBase64
        ? uploadToGoogleDrive(gstCertificateBase64, `GST_${trimmedUid}_${timestamp}.pdf`)
        : Promise.resolve('')
    ]);

    if (!momPdfUrl) {
      return res.status(500).json({ success: false, error: 'Failed to upload MOM PDF' });
    }

    // Find row by UID (UID column S hai → index 17)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Selection_FMS!A8:AO',
    });

    const rows = response.data.values || [];
    let targetRow = -1;

    for (let i = 0; i < rows.length; i++) {
      const cellValue = rows[i][17]; // ← Column S (planned3) jahan UID hai
      if (cellValue && cellValue.toString().trim() === trimmedUid) {
        targetRow = i + 8;
        break;
      }
    }

    if (targetRow === -1) {
      return res.status(404).json({
        success: false,
        error: 'UID not found in sheet',
        receivedUid: trimmedUid
      });
    }

    // Update columns AH to AO
    const values = [[
      status5,              // AH
      meetingLocation5,     // AI
      '',                   // AJ
      momPdfUrl,            // AK - MOM_PDF_5
      gstCertUrl || '',     // AL - GST_Certificate_5
      basicTurnover5,       // AM
      noOfProjects5,        // AN
      nextMeetingSchedule5  // AO
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Contractor_Selection_FMS!AH${targetRow}:AO${targetRow}`,
      valueInputOption: 'RAW',
      resource: { values },
    });

    return res.json({
      success: true,
      message: 'MOM & GST saved successfully!',
      updatedRow: targetRow,
      uid: trimmedUid,
      momPdfUrl,
      gstCertificateUrl: gstCertUrl || null
    });

  } catch (error) {
    console.error('POST /Post_Meeting_Mom Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save MOM data',
      details: error.message
    });
  }
});

module.exports = router;