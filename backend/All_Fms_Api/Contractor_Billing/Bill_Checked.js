



const express = require('express');
const { sheets, spreadsheetId } = require('../../config/googleSheet');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// === CLOUDINARY CONFIG ===
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'djncr1nay',
  api_key: process.env.CLOUDINARY_API_KEY || '747683146821287',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'WysvIFMUrulOtry9Cmux5IiCWqo',
});

// === BASE64 TO CLOUDINARY UPLOAD HELPER ===
async function uploadToCloudinary(base64Image, fileName) {
  if (!base64Image || !base64Image.startsWith('data:image')) return '';

  try {
    const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Data}`,
      {
        public_id: fileName,
        folder: 'bill-checked',
        overwrite: true,
        resource_type: 'image'
      }
    );
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed:', error.message);
    throw new Error(`Upload failed: ${error.message}`);
  }
}

// === GET: Contractor Bill Checked (Unchanged) ===
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

// === POST: Save Bill Checked (WITH BASE64 UPLOAD) ===
router.post('/save-Bill-Checked', async (req, res) => {
  try {
    const {
      uids,
      status,
      measurementSheetBase64,   // Base64 string
      attendanceSheetBase64,    // Base64 string
      items                     // array of { uid, areaQuantity2, unit2, qualityApprove2, photoEvidenceBase64 }
    } = req.body;

    // === VALIDATION ===
    if (!Array.isArray(uids) || uids.length === 0) {
      return res.status(400).json({ success: false, error: 'uids array required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'items array required' });
    }
    if (items.length !== uids.length) {
      return res.status(400).json({ success: false, error: 'uids and items count must match' });
    }
    if (!status || !measurementSheetBase64 || !attendanceSheetBase64) {
      return res.status(400).json({ success: false, error: 'status, measurementSheetBase64, attendanceSheetBase64 required' });
    }

    // === UPLOAD GLOBAL IMAGES ===
    const measurementSheetUrl2 = await uploadToCloudinary(
      measurementSheetBase64,
      `measurement_${Date.now()}`
    );

    const attendanceSheetUrl2 = await uploadToCloudinary(
      attendanceSheetBase64,
      `attendance_${Date.now()}`
    );

    if (!measurementSheetUrl2 || !attendanceSheetUrl2) {
      return res.status(500).json({ success: false, error: 'Global image upload failed' });
    }

    // === READ SHEET ===
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Billing_FMS!A:AC',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No data in sheet' });
    }

    // UID → Row Number (1-based index for sheet)
    const uidToRow = {};
    for (let i = 1; i < rows.length; i++) {
      const uid = rows[i][1]?.toString().trim();
      if (uid) uidToRow[uid] = i + 1;
    }

    const updates = [];
    const results = [];
    const notFound = [];
    const mismatch = [];

    // === PROCESS EACH ITEM ===
    for (let i = 0; i < uids.length; i++) {
      const requestUid = uids[i].toString().trim();
      const item = items[i];

      // Validate item.uid
      if (!item.uid || item.uid.toString().trim() !== requestUid) {
        mismatch.push({ index: i, requestUid, itemUid: item.uid });
        results.push({ uid: requestUid, success: false, error: 'UID mismatch' });
        continue;
      }

      const rowNum = uidToRow[requestUid];
      if (!rowNum) {
        notFound.push(requestUid);
        results.push({ uid: requestUid, success: false, error: 'Not found' });
        continue;
      }

      // === UPLOAD INDIVIDUAL PHOTO (if provided) ===
      let photoEvidence2 = '';
      if (item.photoEvidenceBase64) {
        photoEvidence2 = await uploadToCloudinary(
          item.photoEvidenceBase64,
          `evidence_${requestUid}_${Date.now()}`
        );
      }

      // === V:AC VALUES ===
      const values = [
        status || '',                    // V
        '',                              // W
        measurementSheetUrl2,            // X
        attendanceSheetUrl2,             // Y
        item.areaQuantity2 || '',        // Z
        item.unit2 || '',                // AA
        item.qualityApprove2 || '',      // AB
        photoEvidence2                   // AC
      ];

      updates.push(
        sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Contractor_Billing_FMS!V${rowNum}:AC${rowNum}`,
          valueInputOption: 'RAW',
          resource: { values: [values] }
        })
      );

      results.push({ uid: requestUid, success: true, row: rowNum });
    }

    // === EXECUTE ALL UPDATES ===
    await Promise.all(updates);

    // === RESPONSE ===
    res.json({
      success: true,
      message: 'Smart bulk update completed with image upload',
      updated: results.filter(r => r.success),
      notFound,
      mismatch: mismatch.length > 0 ? mismatch : undefined,
      totalProcessed: uids.length
    });

  } catch (error) {
    console.error('Error in save-Bill-Checked:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update',
      details: error.message
    });
  }
});

module.exports = router;