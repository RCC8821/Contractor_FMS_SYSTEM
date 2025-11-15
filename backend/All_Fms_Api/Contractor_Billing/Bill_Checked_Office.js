

// const express = require('express');
// const { sheets, spreadsheetId } = require('../../config/googleSheet');
// const router = express.Router();
// const cloudinary = require('cloudinary').v2;

// // === CLOUDINARY CONFIG ===
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'djncr1nay',
//   api_key: process.env.CLOUDINARY_API_KEY || '747683146821287',
//   api_secret: process.env.CLOUDINARY_API_SECRET || 'WysvIFMUrulOtry9Cmux5IiCWqo',
// });

// // === IMAGE UPLOAD HELPER (100% DEBUGGED & SAFE) ===
// async function uploadToCloudinary(base64Image, fileName) {
//   // Debug: Log start
//   console.log(`[UPLOAD START] ${fileName} | Length: ${base64Image?.length || 0}`);

//   if (!base64Image) {
//     console.warn(`[UPLOAD FAILED] ${fileName} → No base64 provided`);
//     return '';
//   }

//   if (!base64Image.startsWith('data:image')) {
//     console.warn(`[UPLOAD FAILED] ${fileName} → Invalid prefix: ${base64Image.substring(0, 50)}...`);
//     return '';
//   }

//   try {
//     const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
    
//     if (!base64Data || base64Data.length < 50) {
//       console.warn(`[UPLOAD FAILED] ${fileName} → Base64 too short after cleaning`);
//       return '';
//     }

//     const result = await cloudinary.uploader.upload(
//       `data:image/jpeg;base64,${base64Data}`,
//       {
//         public_id: fileName,
//         folder: 'bill-checked',
//         overwrite: true,
//         resource_type: 'image'
//       }
//     );

//     const url = result.secure_url;
//     console.log(`[UPLOAD SUCCESS] ${fileName} → ${url}`);
//     return url;

//   } catch (error) {
//     console.error(`[CLOUDINARY ERROR] ${fileName}:`, {
//       message: error.message,
//       status: error.http_code,
//       name: error.name,
//       fullError: JSON.stringify(error, null, 2)
//     });
//     return '';
//   }
// }

// // === GET: Contractor Bill Checked Office ===
// router.get('/Contractor_Bill_Checked_Office', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Contractor_Billing_FMS!A7:AF',
//     });

//     let data = response.data.values || [];
//     if (data.length > 0) data = data.slice(1);

//     const filteredData = data
//       .filter(row => row[30] && !row[31]) // AE (planned3) filled, AF (actual3) empty
//       .map(row => ({
//         planned3: row[30] || '',
//         UID: row[1] || '',
//         projectId: row[2] || '',
//         projectName: row[3] || '',
//         siteEngineer: row[4] || '',
//         contractorName: row[5] || '',
//         firmName: row[6] || '',
//         workName: row[7] || '',
//         workDesc: row[8] || '',
//         quantity: row[9] || '',
//         unit: row[10] || '',
//         rate: row[11] || '',
//         amount: row[12] || '',
//         billNo: row[13] || '',
//         rccBillNo: row[14] || '',
//         billDate: row[15] || '',
//         billUrl: row[16] || '',
//         prevBillUrl: row[17] || '',
//         remark: row[18] || '',
//         measurementSheetUrl2: row[23] || '',
//         attendanceSheetUrl2: row[24] || '',
//         areaQuantity2: row[25] || '',
//         unit2: row[26] || '',
//         qualityApprove2: row[27] || '',
//         photoEvidenceAfterWork2: row[28] || '',
//         remarks2: row[29] || ''
//       }));

//     res.json({ success: true, data: filteredData });
//   } catch (error) {
//     console.error('GET /Contractor_Bill_Checked_Office Error:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch data' });
//   }
// });

// // === GET: Enquiry Capture Billing ===
// router.get('/enquiry-capture-Billing-Office', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Project_Data!A:F',
//     });

//     const rows = response.data.values || [];
//     if (rows.length <= 1) {
//       return res.json({
//         success: true,
//         data: { projectIds: [], projectNames: [], contractorNames: [], contractorFirmNames: [] }
//       });
//     }

//     const data = rows.slice(1).map(row => ({
//       Project_ID: (row[0] || '').trim(),
//       Project_Name: (row[1] || '').trim(),
//       Contractor_Name: (row[4] || '').trim(),
//       Contractor_Firm_Name: (row[5] || '').trim(),
//     }));

//     const projectIds = [...new Set(data.map(d => d.Project_ID))].filter(Boolean);
//     const projectNames = [...new Set(data.map(d => d.Project_Name))].filter(Boolean);
//     const contractorNames = [...new Set(data.map(d => d.Contractor_Name))].filter(Boolean);
//     const contractorFirmNames = [...new Set(data.map(d => d.Contractor_Firm_Name))].filter(Boolean);

//     res.json({
//       success: true,
//       data: { projectIds, projectNames, contractorNames, contractorFirmNames }
//     });
//   } catch (error) {
//     console.error('GET /enquiry-capture-Billing-Office Error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // === POST: Save Bill Checked Office (100% WORKING) ===
// router.post('/save-BillCheckedOffice', async (req, res) => {
//   try {
//     const {
//       uids,
//       status,
//       Rcc_Summary_Sheet_No,
//       Rcc_Summary_Sheet_Base64,
//       Work_Order_Base64,
//       items
//     } = req.body;

//     // === VALIDATION ===
//     if (!Array.isArray(uids) || uids.length === 0) {
//       return res.status(400).json({ success: false, error: 'uids array required' });
//     }
//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ success: false, error: 'items array required' });
//     }
//     if (items.length !== uids.length) {
//       return res.status(400).json({ success: false, error: 'uids and items count must match' });
//     }
//     if (!status || !Rcc_Summary_Sheet_No) {
//       return res.status(400).json({ success: false, error: 'status and Rcc_Summary_Sheet_No required' });
//     }

//     // === UPLOAD IMAGES (WITH DEBUG) ===
//     let Rcc_Summary_Sheet_URL = '';
//     let Work_Order_URL = '';

//     console.log('[IMAGE UPLOAD] Starting...');
//     Rcc_Summary_Sheet_URL = await uploadToCloudinary(Rcc_Summary_Sheet_Base64, `rcc_summary_${Date.now()}`);
//     Work_Order_URL = await uploadToCloudinary(Work_Order_Base64, `work_order_${Date.now()}`);
//     console.log('[IMAGE UPLOAD] Done:', { Rcc_Summary_Sheet_URL, Work_Order_URL });

//     // === READ SHEET (A:AR → includes B for UID) ===
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Contractor_Billing_FMS!A:AR',
//     });

//     const rows = response.data.values || [];
//     if (rows.length === 0) {
//       return res.status(404).json({ success: false, error: 'No data in sheet' });
//     }

//     // === MAP UID → ROW (1-based) ===
//     const uidToRow = {};
//     for (let i = 1; i < rows.length; i++) {
//       const uid = rows[i][1]?.toString().trim(); // Column B
//       if (uid) uidToRow[uid] = i + 1;
//     }

//     const updates = [];
//     const results = [];
//     const notFound = [];
//     const mismatch = [];

//     // === PROCESS EACH UID ===
//     for (let i = 0; i < uids.length; i++) {
//       const requestUid = uids[i].toString().trim();
//       const item = items[i];

//       if (!item.uid || item.uid.toString().trim() !== requestUid) {
//         mismatch.push({ index: i, requestUid, itemUid: item.uid });
//         results.push({ uid: requestUid, success: false, error: 'UID mismatch' });
//         continue;
//       }

//       const rowNum = uidToRow[requestUid];
//       if (!rowNum) {
//         notFound.push(requestUid);
//         results.push({ uid: requestUid, success: false, error: 'UID not found' });
//         continue;
//       }

//       // === VALUES: AG to AR ===
//       const values = [
//         status,                         // AG → Status 3
//         '',                             // AH → blank
//         Rcc_Summary_Sheet_No,           // AI → Rcc_Summary_Sheet_No
//         Rcc_Summary_Sheet_URL || '',    // AJ → Rcc_Summary_Sheet_URL
//         Work_Order_URL || '',           // AK → Work_Order_URL
//         item.Final_Area_Quantity3 || '',// AL
//         item.Unit3 || '',               // AM
//         item.RATE3 || '',               // AN
//         item.AMOUNT3 || '',             // AO
//         item.CGST3 || '',               // AP
//         item.SGST3 || '',               // AQ
//         item.NET_AMOUNT3 || ''          // AR
//       ];

//       updates.push(
//         sheets.spreadsheets.values.update({
//           spreadsheetId,
//           range: `Contractor_Billing_FMS!AG${rowNum}:AR${rowNum}`,
//           valueInputOption: 'RAW',
//           resource: { values: [values] }
//         })
//       );

//       results.push({ uid: requestUid, success: true, row: rowNum });
//     }

//     // === EXECUTE UPDATES ===
//     if (updates.length > 0) {
//       await Promise.all(updates);
//       console.log(`[SHEET UPDATE] ${updates.length} rows updated successfully`);
//     }

//     // === RESPONSE ===
//     res.json({
//       success: true,
//       message: 'Data saved successfully',
//       updated: results.filter(r => r.success),
//       notFound,
//       mismatch: mismatch.length > 0 ? mismatch : undefined,
//       totalProcessed: uids.length,
//       debug: {
//         Rcc_Summary_Sheet_URL: Rcc_Summary_Sheet_URL || 'EMPTY',
//         Work_Order_URL: Work_Order_URL || 'EMPTY'
//       }
//     });

//   } catch (error) {
//     console.error('[FATAL ERROR] /save-BillCheckedOffice:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error',
//       details: error.message
//     });
//   }
// });

// module.exports = router;




const express = require('express');
const { sheets, drive, spreadsheetId } = require('../../config/googleSheet'); // ← drive import

const os = require('os');
const path = require('path');
const fs = require('fs');

const router = express.Router();
// === UPLOAD TO GOOGLE DRIVE (PDF + IMAGE) ===
async function uploadToGoogleDrive(base64Data, fileName) {
  console.log(`[DRIVE UPLOAD START] ${fileName}`);

  if (!base64Data || typeof base64Data !== 'string') return '';

  const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
  if (!match) return '';

  const mimeType = match[1];
  const base64Content = match[2];

  try {
    const buffer = Buffer.from(base64Content, 'base64');
    const tempPath = path.join(os.tmpdir(), fileName);
    fs.writeFileSync(tempPath, buffer);

    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType,
      body: fs.createReadStream(tempPath),
    };

    const res = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
      supportsAllDrives: true,
      driveId: process.env.GOOGLE_DRIVE_FOLDER_ID,  // ← ID
      corpora: 'drive'                              // ← जरूरी
    });

    fs.unlinkSync(tempPath);

    const fileId = res.data.id;
    const viewUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

    await drive.permissions.create({
      fileId: fileId,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true
    });

    console.log(`[DRIVE SUCCESS] ${fileName} → ${viewUrl}`);
    return viewUrl;

  } catch (error) {
    console.error(`[DRIVE ERROR] ${fileName}:`, error.message);
    try { fs.unlinkSync(path.join(os.tmpdir(), fileName)); } catch (_) {}
    return '';
  }
}

// === GET: Contractor Bill Checked Office ===
router.get('/Contractor_Bill_Checked_Office', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Billing_FMS!A7:AF',
    });

    let data = response.data.values || [];
    if (data.length > 0) data = data.slice(1);

    const filteredData = data
      .filter(row => row[30] && !row[31])
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

// === GET: Enquiry Capture Billing ===
router.get('/enquiry-capture-Billing-Office', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Project_Data!A:F',
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return res.json({
        success: true,
        data: { projectIds: [], projectNames: [], contractorNames: [], contractorFirmNames: [] }
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
    console.error('GET /enquiry-capture-Billing-Office Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// === POST: Save Bill Checked Office ===
router.post('/save-BillCheckedOffice', async (req, res) => {
  try {
    const {
      uids,
      status,
      Rcc_Summary_Sheet_No,
      Rcc_Summary_Sheet_Base64,
      Work_Order_Base64,
      items
    } = req.body;

    // Validation
    if (!Array.isArray(uids) || uids.length === 0) {
      return res.status(400).json({ success: false, error: 'uids array required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'items array required' });
    }
    if (items.length !== uids.length) {
      return res.status(400).json({ success: false, error: 'uids and items count must match' });
    }
    if (!status || !Rcc_Summary_Sheet_No) {
      return res.status(400).json({ success: false, error: 'status and Rcc_Summary_Sheet_No required' });
    }

    console.log('[SAVE] Starting Google Drive uploads...');
    console.log('[SAVE] RCC Base64 length:', Rcc_Summary_Sheet_Base64?.length || 0);
    console.log('[SAVE] Work Order Base64 length:', Work_Order_Base64?.length || 0);

    // Upload to Google Drive
    const timestamp = Date.now();
    const [Rcc_Summary_Sheet_URL, Work_Order_URL] = await Promise.all([
      uploadToGoogleDrive(Rcc_Summary_Sheet_Base64, `rcc_summary_${timestamp}.pdf`),
      uploadToGoogleDrive(Work_Order_Base64, `work_order_${timestamp}.pdf`)
    ]);

    console.log('[SAVE] Upload results:', {
      rcc: Rcc_Summary_Sheet_URL || 'FAILED',
      workOrder: Work_Order_URL || 'FAILED'
    });

    if (!Rcc_Summary_Sheet_URL || !Work_Order_URL) {
      return res.status(500).json({
        success: false,
        error: 'File upload failed to Google Drive',
        details: { rccUploaded: !!Rcc_Summary_Sheet_URL, workOrderUploaded: !!Work_Order_URL }
      });
    }

    // Read sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Billing_FMS!A:AR',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No data in sheet' });
    }

    const uidToRow = {};
    for (let i = 1; i < rows.length; i++) {
      const uid = rows[i][1]?.toString().trim();
      if (uid) uidToRow[uid] = i + 1;
    }

    const updates = [];
    const results = [];
    const notFound = [];
    const mismatch = [];

    for (let i = 0; i < uids.length; i++) {
      const requestUid = uids[i].toString().trim();
      const item = items[i];

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

      const values = [
        status,
        '',
        Rcc_Summary_Sheet_No,
        Rcc_Summary_Sheet_URL,
        Work_Order_URL,
        item.Final_Area_Quantity3 || '',
        item.Unit3 || '',
        item.RATE3 || '',
        item.AMOUNT3 || '',
        item.CGST3 || '',
        item.SGST3 || '',
        item.NET_AMOUNT3 || ''
      ];

      updates.push(
        sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Contractor_Billing_FMS!AG${rowNum}:AR${rowNum}`,
          valueInputOption: 'RAW',
          resource: { values: [values] }
        })
      );

      results.push({ uid: requestUid, success: true, row: rowNum });
    }

    if (updates.length > 0) {
      await Promise.all(updates);
      console.log(`[SAVE] ${updates.length} rows updated in sheet`);
    }

    res.json({
      success: true,
      message: 'Data saved successfully',
      updated: results.filter(r => r.success),
      notFound,
      mismatch: mismatch.length > 0 ? mismatch : undefined,
      totalProcessed: uids.length,
      uploadedFiles: { Rcc_Summary_Sheet_URL, Work_Order_URL }
    });

  } catch (error) {
    console.error('[FATAL ERROR] /save-BillCheckedOffice:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message
    });
  }
});

module.exports = router;