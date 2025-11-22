
// const express = require('express');
// const { sheets, drive, spreadsheetId } = require('../../config/googleSheet');
// const { Readable } = require('stream'); // <-- ADD THIS
// const router = express.Router();

// // === UPLOAD TO GOOGLE DRIVE (NO DISK WRITE - VERCEL SAFE) ===
// async function uploadToGoogleDrive(base64Data, fileName) {
//   console.log(`[DRIVE UPLOAD START] ${fileName}`);

//   if (!base64Data || typeof base64Data !== 'string') {
//     console.warn(`[DRIVE FAILED] ${fileName} → No data`);
//     return '';
//   }

//   const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
//   if (!match) {
//     console.warn(`[DRIVE FAILED] ${fileName} → Invalid data URI`);
//     return '';
//   }

//   const mimeType = match[1];
//   const base64Content = match[2];

//   try {
//     // === NO FILE WRITE — DIRECT BUFFER TO STREAM ===
//     const buffer = Buffer.from(base64Content, 'base64');

//     // Create Readable stream from buffer
//     const fileStream = new Readable();
//     fileStream.push(buffer);
//     fileStream.push(null); // End stream

//     const fileMetadata = {
//       name: fileName,
//       parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
//     };

//     const media = {
//       mimeType,
//       body: fileStream,
//     };

//     const res = await drive.files.create({
//       resource: fileMetadata,
//       media: media,
//       fields: 'id, webViewLink',
//       supportsAllDrives: true,
//       driveId: process.env.GOOGLE_DRIVE_FOLDER_ID,
//       corpora: 'drive'
//     });

//     const fileId = res.data.id;
//     const viewUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

//     // Make public
//     await drive.permissions.create({
//       fileId: fileId,
//       requestBody: { role: 'reader', type: 'anyone' },
//       supportsAllDrives: true
//     });

//     console.log(`[DRIVE SUCCESS] ${fileName} → ${viewUrl}`);
//     return viewUrl;

//   } catch (error) {
//     console.error(`[DRIVE ERROR] ${fileName}:`, error.message);
//     return '';
//   }
// }


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

//     // Validation (same)
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

//     console.log('[SAVE] Starting Google Drive uploads...');
//     console.log('[SAVE] RCC Base64 length:', Rcc_Summary_Sheet_Base64?.length || 0);
//     console.log('[SAVE] Work Order Base64 length:', Work_Order_Base64?.length || 0);

//     // Upload using stream (NO FILE)
//     const timestamp = Date.now();
//     const [Rcc_Summary_Sheet_URL, Work_Order_URL] = await Promise.all([
//       uploadToGoogleDrive(Rcc_Summary_Sheet_Base64, `rcc_summary_${timestamp}.pdf`),
//       uploadToGoogleDrive(Work_Order_Base64, `work_order_${timestamp}.pdf`)
//     ]);

//     console.log('[SAVE] Upload results:', {
//       rcc: Rcc_Summary_Sheet_URL || 'FAILED',
//       workOrder: Work_Order_URL || 'FAILED'
//     });

//     if (!Rcc_Summary_Sheet_URL || !Work_Order_URL) {
//       return res.status(500).json({
//         success: false,
//         error: 'File upload failed to Google Drive',
//         details: { rccUploaded: !!Rcc_Summary_Sheet_URL, workOrderUploaded: !!Work_Order_URL }
//       });
//     }

//     // === SHEET UPDATE (same as before) ===
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Contractor_Billing_FMS!A:AR',
//     });

//     const rows = response.data.values || [];
//     if (rows.length === 0) {
//       return res.status(404).json({ success: false, error: 'No data in sheet' });
//     }

//     const uidToRow = {};
//     for (let i = 1; i < rows.length; i++) {
//       const uid = rows[i][1]?.toString().trim();
//       if (uid) uidToRow[uid] = i + 1;
//     }

//     const updates = [];
//     const results = [];
//     const notFound = [];
//     const mismatch = [];

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

//       const values = [
//         status,
//         '',
//         Rcc_Summary_Sheet_No,
//         Rcc_Summary_Sheet_URL,
//         Work_Order_URL,
//         item.Final_Area_Quantity3 || '',
//         item.Unit3 || '',
//         item.RATE3 || '',
//         item.AMOUNT3 || '',
//         item.CGST3 || '',
//         item.SGST3 || '',
//         item.NET_AMOUNT3 || ''
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

//     if (updates.length > 0) {
//       await Promise.all(updates);
//       console.log(`[SAVE] ${updates.length} rows updated in sheet`);
//     }

//     res.json({
//       success: true,
//       message: 'Data saved successfully',
//       updated: results.filter(r => r.success),
//       notFound,
//       mismatch: mismatch.length > 0 ? mismatch : undefined,
//       totalProcessed: uids.length,
//       uploadedFiles: { Rcc_Summary_Sheet_URL, Work_Order_URL }
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



// ////////////////////////////////////////    TRY ///////////////////////////////////


// All_Fms_Api/Contractor_Billing/Bill_Checked_Office.js
const express = require('express');
const { sheets, drive, spreadsheetId } = require('../../config/googleSheet');
const { Readable } = require('stream');
const router = express.Router();

// Optional: Extra CORS safety (already handled in server.js)
router.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// === UPLOAD TO GOOGLE DRIVE (NO DISK WRITE) ===
async function uploadToGoogleDrive(base64Data, fileName) {
  console.log(`[DRIVE UPLOAD START] ${fileName}`);

  if (!base64Data || typeof base64Data !== 'string') {
    console.warn(`[DRIVE FAILED] ${fileName} → No data`);
    return '';
  }

  const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
  if (!match) {
    console.warn(`[DRIVE FAILED] ${fileName} → Invalid data URI`);
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
      media: media,
      fields: 'id, webViewLink',
      supportsAllDrives: true,
      driveId: process.env.GOOGLE_DRIVE_FOLDER_ID,
      corpora: 'drive'
    });

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

// === GET: Enquiry Capture ===
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

    const timestamp = Date.now();
    const [Rcc_Summary_Sheet_URL, Work_Order_URL] = await Promise.all([
      uploadToGoogleDrive(Rcc_Summary_Sheet_Base64, `rcc_summary_${timestamp}.pdf`),
      uploadToGoogleDrive(Work_Order_Base64, `work_order_${timestamp}.pdf`)
    ]);

    if (!Rcc_Summary_Sheet_URL || !Work_Order_URL) {
      return res.status(500).json({
        success: false,
        error: 'File upload failed to Google Drive',
        details: { rccUploaded: !!Rcc_Summary_Sheet_URL, workOrderUploaded: !!Work_Order_URL }
      });
    }

    // Sheet Update
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
        status, '', Rcc_Summary_Sheet_No, Rcc_Summary_Sheet_URL, Work_Order_URL,
        item.Final_Area_Quantity3 || '', item.Unit3 || '', item.RATE3 || '',
        item.AMOUNT3 || '', item.CGST3 || '', item.SGST3 || '', item.NET_AMOUNT3 || ''
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