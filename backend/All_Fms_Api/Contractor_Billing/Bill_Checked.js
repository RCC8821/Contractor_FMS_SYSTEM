



// ─────────────────────────────────────────────────────────────────────────────
//  /routes/billing/billCheckedRoutes.js   (or wherever you keep the router)
// ─────────────────────────────────────────────────────────────────────────────
const express = require('express');
const { sheets, drive, spreadsheetId } = require('../../config/googleSheet');
const { Readable } = require('stream');               // <-- IMPORTANT
const router = express.Router();

/* -------------------------------------------------------------------------
   Google Drive upload – NO temporary file, works on Vercel
   Accepts:  data:image/...;base64,xxxx   OR   data:application/pdf;base64,xxxx
   ------------------------------------------------------------------------- */
async function uploadToGoogleDrive(base64Data, fileName) {
  if (!base64Data || typeof base64Data !== 'string') return '';

  const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
  if (!match) return '';

  const mimeType = match[1];
  const base64Content = match[2];

  try {
    const buffer = Buffer.from(base64Content, 'base64');

    const fileStream = new Readable();
    fileStream.push(buffer);
    fileStream.push(null);               // end of stream

    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = { mimeType, body: fileStream };

    const res = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, webViewLink',
      supportsAllDrives: true,
      driveId: process.env.GOOGLE_DRIVE_FOLDER_ID,
      corpora: 'drive',
    });

    const fileId = res.data.id;
    const viewUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

    // make it public
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    });

    return viewUrl;
  } catch (err) {
    console.error(`[DRIVE ERROR] ${fileName}:`, err.message);
    return '';
  }
}



router.get('/Contractor_Bill_Checked', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Billing_FMS!A7:U',
    });

    let data = response.data.values || [];
    if (data.length > 0) data = data.slice(1);

    const filteredData = data
      .filter(row => row[19] && !row[20])
      .map(row => ({
        planned2: row[19] || '',
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
      }));

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('Error fetching Contractor_Bill_Checked:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bill data' });
  }
});

// === GET: Enquiry Capture Billing (Unchanged) ===
router.get('/enquiry-capture-Billing', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Project_Data!A:F',
    });

    const rows = response.data.values || [];

    if (rows.length <= 1) {
      return res.json({
        success: true,
        data: {
          projectIds: [],
          projectNames: [],
          contractorNames: [],
          contractorFirmNames: []
        }
      });
    }

    const data = rows.slice(1).map(row => ({
      Project_ID: (row[0] || '').trim(),
      Project_Name: (row[1] || '').trim(),
      Contractor_Name: (row[4] || '').trim(),
      Contractor_Firm_Name: (row[5] || '').trim(),
    }));

    const projectIds = [...new Set(data.map(d => d.Project_ID))].filter(Boolean);
    const projectNames = [...new Set(data.map(d => d.Project_Name))].filter(Boolean);
    const contractorNames = [...new Set(data.map(d => d.Contractor_Name))].filter(Boolean);
    const contractorFirmNames = [...new Set(data.map(d => d.Contractor_Firm_Name))].filter(Boolean);

    res.json({
      success: true,
      data: { projectIds, projectNames, contractorNames, contractorFirmNames }
    });

  } catch (error) {
    console.error('Error fetching enquiry-capture-Billing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------------------------------------------------------
   POST  /save-Bill-Checked
   ------------------------------------------------------------------------- */
   
router.post('/save-Bill-Checked', async (req, res) => {
  try {
    const {
      uids,
      status,
      measurementSheetBase64,   // REQUIRED
      attendanceSheetBase64,    // OPTIONAL
      items,                    // [{uid, areaQuantity2, unit2, qualityApprove2, photoEvidenceBase64}]
    } = req.body;

    // ────── VALIDATION ──────
    if (!Array.isArray(uids) || uids.length === 0) {
      return res.status(400).json({ success: false, error: 'uids array required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'items array required' });
    }
    if (items.length !== uids.length) {
      return res.status(400).json({ success: false, error: 'uids & items count must match' });
    }
    // if (!status ) {
    //   return res.status(400).json({ success: false, error: 'status & measurementSheetBase64 required' });
    // }

    // ────── UPLOAD GLOBAL FILES ──────
    const timestamp = Date.now();

    const [measurementSheetUrl, attendanceSheetUrl] = await Promise.all([
      uploadToGoogleDrive(
        measurementSheetBase64,
        `measurement_${timestamp}.${measurementSheetBase64.startsWith('data:application/pdf') ? 'pdf' : 'jpg'}`
      ),
      attendanceSheetBase64
        ? uploadToGoogleDrive(
            attendanceSheetBase64,
            `attendance_${timestamp}.${attendanceSheetBase64.startsWith('data:application/pdf') ? 'pdf' : 'jpg'}`
          )
        : Promise.resolve(''),                     // optional
    ]);

    if (!measurementSheetUrl) {
      return res.status(500).json({ success: false, error: 'Failed to upload measurement sheet' });
    }

    // ────── READ SHEET (A:AC) ──────
    const { data: { values: rows = [] } } = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Billing_FMS!A:AC',
    });

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Sheet empty' });
    }

    // UID → row‑index (1‑based for Google‑Sheets)
    const uidToRow = {};
    for (let i = 1; i < rows.length; i++) {
      const uid = rows[i][1]?.toString().trim();
      if (uid) uidToRow[uid] = i + 1;
    }

    const updates = [];
    const results = [];
    const notFound = [];
    const mismatch = [];

    // ────── PROCESS EACH UID ──────
    for (let i = 0; i < uids.length; i++) {
      const requestUid = uids[i].toString().trim();
      const item = items[i];

      // UID sanity check
      if (!item.uid || item.uid.toString().trim() !== requestUid) {
        mismatch.push({ index: i, requestUid, itemUid: item.uid });
        results.push({ uid: requestUid, success: false, error: 'UID mismatch' });
        continue;
      }

      const rowNum = uidToRow[requestUid];
      if (!rowNum) {
        notFound.push(requestUid);
        results.push({ uid: requestUid, success: false, error: 'UID not found' });
        continue;
      }

      // ---- upload per‑row photo (optional) ----
      let photoEvidenceUrl = '';
      if (item.photoEvidenceBase64) {
        photoEvidenceUrl = await uploadToGoogleDrive(
          item.photoEvidenceBase64,
          `evidence_${requestUid}_${timestamp}.jpg`
        );
      }

      // ---- build V:AC values ----
      const values = [
        status,                     // V  – status
        '',                         // W  – blank
        measurementSheetUrl,        // X  – measurement sheet URL
        attendanceSheetUrl || '',   // Y  – attendance sheet URL (optional)
        item.areaQuantity2 || '',   // Z
        item.unit2 || '',           // AA
        item.qualityApprove2 || '', // AB
        photoEvidenceUrl,           // AC – photo evidence
      ];

      updates.push(
        sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Contractor_Billing_FMS!V${rowNum}:AC${rowNum}`,
          valueInputOption: 'RAW',
          resource: { values: [values] },
        })
      );

      results.push({ uid: requestUid, success: true, row: rowNum });
    }

    // ────── EXECUTE ALL SHEET UPDATES ──────
    if (updates.length) await Promise.all(updates);

    // ────── RESPONSE ──────
    res.json({
      success: true,
      message: 'Saved successfully',
      updated: results.filter(r => r.success),
      notFound,
      mismatch: mismatch.length ? mismatch : undefined,
      totalProcessed: uids.length,
      uploadedFiles: {
        measurementSheetUrl,
        attendanceSheetUrl: attendanceSheetUrl || null,
      },
    });
  } catch (err) {
    console.error('[save-Bill-Checked] FATAL:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
});




module.exports = router;