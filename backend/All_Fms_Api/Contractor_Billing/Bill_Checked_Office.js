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

// // === BASE64 IMAGE TO CLOUDINARY (Sirf Image – Working Code) ===
// async function uploadToCloudinary(base64Image, fileName) {
//   if (!base64Image || !base64Image.startsWith('data:image')) {
//     console.warn(`Invalid image base64 for ${fileName}`);
//     return '';
//   }

//   try {
//     const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
//     const result = await cloudinary.uploader.upload(
//       `data:image/jpeg;base64,${base64Data}`,
//       {
//         public_id: fileName,
//         folder: 'bill-checked',
//         overwrite: true,
//         resource_type: 'image'
//       }
//     );
//     return result.secure_url || '';
//   } catch (error) {
//     console.error(`Cloudinary upload failed for ${fileName}:`, error.message || 'Unknown error');
//     return '';
//   }
// }

// // === GET: Contractor Bill Checked Office (Pending Office Approval) ===
// router.get('/Contractor_Bill_Checked_Office', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Contractor_Billing_FMS!A8:AF', // Up to AF (0-based: 31)
//     });

//     let data = response.data.values || [];

//     // Skip header (start from row 9 in sheet = index 1 after slice)
//     if (data.length > 0) {
//       data = data.slice(1);
//     }

//     const filteredData = data
//       .filter(row => {
//         const planned3 = row[30] || '';  // AE: Planned 3
//         const actual3 = row[31] || '';   // AF: Actual 3
//         return planned3 && !actual3;
//       })
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
//         measurementSheetUrl2: row[23] || '',     // X
//         attendanceSheetUrl2: row[24] || '',      // Y
//         areaQuantity2: row[25] || '',            // Z
//         unit2: row[26] || '',                    // AA
//         qualityApprove2: row[27] || '',          // AB
//         photoEvidenceAfterWork2: row[28] || '',  // AC
//         remarks2: row[29] || ''                  // AD
//       }));

//     res.json({
//       success: true,
//       data: filteredData
//     });

//   } catch (error) {
//     console.error('Error fetching Contractor_Bill_Checked_Office:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch data'
//     });
//   }
// });

// // === GET: Enquiry Capture Billing (Dropdown Data) ===
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
//         data: {
//           projectIds: [],
//           projectNames: [],
//           contractorNames: [],
//           contractorFirmNames: []
//         }
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
//     console.error('Error fetching enquiry-capture-Billing-Office:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // === POST: Save Bill Checked Office (Bulk Update) ===
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
//       return res.status(400).json({
//         success: false,
//         error: 'status and Rcc_Summary_Sheet_No required'
//       });
//     }

//     // === UPLOAD IMAGES ===
//     let Rcc_Summary_Sheet_URL = '';
//     let Work_Order_URL = '';

//     try {
//       Rcc_Summary_Sheet_URL = await uploadToCloudinary(Rcc_Summary_Sheet_Base64, `rcc_summary_${Date.now()}`);
//       Work_Order_URL = await uploadToCloudinary(Work_Order_Base64, `work_order_${Date.now()}`);
//     } catch (uploadErr) {
//       console.error('Image upload failed:', uploadErr);
//     }

//     // === READ SHEET: MUST INCLUDE COLUMN B (UID) ===
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Contractor_Billing_FMS!A:AR', // A to AR → includes B (UID)
//     });

//     const rows = response.data.values || [];
//     if (rows.length === 0) {
//       return res.status(404).json({ success: false, error: 'No data in sheet' });
//     }

//     // === MAP UID → ROW NUMBER (1-based) ===
//     const uidToRow = {};
//     for (let i = 1; i < rows.length; i++) { // Start from i=1 → skip header
//       const uid = rows[i][1]?.toString().trim(); // Column B = index 1
//       if (uid) {
//         uidToRow[uid] = i + 1; // Google Sheets row number
//       }
//     }

//     const updates = [];
//     const results = [];
//     const notFound = [];
//     const mismatch = [];

//     // === PROCESS EACH UID ===
//     for (let i = 0; i < uids.length; i++) {
//       const requestUid = uids[i].toString().trim();
//       const item = items[i];

//       // UID match
//       if (!item.uid || item.uid.toString().trim() !== requestUid) {
//         mismatch.push({ index: i, requestUid, itemUid: item.uid });
//         results.push({ uid: requestUid, success: false, error: 'UID mismatch' });
//         continue;
//       }

//       const rowNum = uidToRow[requestUid];
//       if (!rowNum) {
//         notFound.push(requestUid);
//         results.push({ uid: requestUid, success: false, error: 'UID not found in sheet' });
//         continue;
//       }

//       // === VALUES: AG to AR (12 columns) ===
//       const values = [
//         status,                         // AG → Status 3
//         '',                             // AH → blank
//         Rcc_Summary_Sheet_No,           // AI → Rcc_Summary_Sheet_No
//         Rcc_Summary_Sheet_URL,          // AJ → Rcc_Summary_Sheet_URL
//         Work_Order_URL,                 // AK → Work_Order_URL
//         item.Final_Area_Quantity3 || '',// AL → Final_Area_/Quantity 3
//         item.Unit3 || '',               // AM → Unit 3
//         item.RATE3 || '',               // AN → RATE 3
//         item.AMOUNT3 || '',             // AO → AMOUNT 3
//         item.CGST3 || '',               // AP → CGST 3
//         item.SGST3 || '',               // AQ → SGST 3
//         item.NET_AMOUNT3 || ''          // AR → NET_AMOUNT 3
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

//     // === EXECUTE ALL UPDATES ===
//     if (updates.length > 0) {
//       await Promise.all(updates);
//     }

//     // === RESPONSE ===
//     res.json({
//       success: true,
//       message: 'Data saved successfully',
//       updated: results.filter(r => r.success),
//       notFound,
//       mismatch: mismatch.length > 0 ? mismatch : undefined,
//       totalProcessed: uids.length
//     });

//   } catch (error) {
//     console.error('Error in /save-BillCheckedOffice:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error',
//       details: error.message
//     });
//   }
// });

// module.exports = router;






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

// === IMAGE UPLOAD HELPER (100% DEBUGGED & SAFE) ===
async function uploadToCloudinary(base64Image, fileName) {
  // Debug: Log start
  console.log(`[UPLOAD START] ${fileName} | Length: ${base64Image?.length || 0}`);

  if (!base64Image) {
    console.warn(`[UPLOAD FAILED] ${fileName} → No base64 provided`);
    return '';
  }

  if (!base64Image.startsWith('data:image')) {
    console.warn(`[UPLOAD FAILED] ${fileName} → Invalid prefix: ${base64Image.substring(0, 50)}...`);
    return '';
  }

  try {
    const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
    
    if (!base64Data || base64Data.length < 50) {
      console.warn(`[UPLOAD FAILED] ${fileName} → Base64 too short after cleaning`);
      return '';
    }

    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Data}`,
      {
        public_id: fileName,
        folder: 'bill-checked',
        overwrite: true,
        resource_type: 'image'
      }
    );

    const url = result.secure_url;
    console.log(`[UPLOAD SUCCESS] ${fileName} → ${url}`);
    return url;

  } catch (error) {
    console.error(`[CLOUDINARY ERROR] ${fileName}:`, {
      message: error.message,
      status: error.http_code,
      name: error.name,
      fullError: JSON.stringify(error, null, 2)
    });
    return '';
  }
}

// === GET: Contractor Bill Checked Office ===
router.get('/Contractor_Bill_Checked_Office', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Billing_FMS!A8:AF',
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

// === POST: Save Bill Checked Office (100% WORKING) ===
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
    if (!status || !Rcc_Summary_Sheet_No) {
      return res.status(400).json({ success: false, error: 'status and Rcc_Summary_Sheet_No required' });
    }

    // === UPLOAD IMAGES (WITH DEBUG) ===
    let Rcc_Summary_Sheet_URL = '';
    let Work_Order_URL = '';

    console.log('[IMAGE UPLOAD] Starting...');
    Rcc_Summary_Sheet_URL = await uploadToCloudinary(Rcc_Summary_Sheet_Base64, `rcc_summary_${Date.now()}`);
    Work_Order_URL = await uploadToCloudinary(Work_Order_Base64, `work_order_${Date.now()}`);
    console.log('[IMAGE UPLOAD] Done:', { Rcc_Summary_Sheet_URL, Work_Order_URL });

    // === READ SHEET (A:AR → includes B for UID) ===
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Billing_FMS!A:AR',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No data in sheet' });
    }

    // === MAP UID → ROW (1-based) ===
    const uidToRow = {};
    for (let i = 1; i < rows.length; i++) {
      const uid = rows[i][1]?.toString().trim(); // Column B
      if (uid) uidToRow[uid] = i + 1;
    }

    const updates = [];
    const results = [];
    const notFound = [];
    const mismatch = [];

    // === PROCESS EACH UID ===
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

      // === VALUES: AG to AR ===
      const values = [
        status,                         // AG → Status 3
        '',                             // AH → blank
        Rcc_Summary_Sheet_No,           // AI → Rcc_Summary_Sheet_No
        Rcc_Summary_Sheet_URL || '',    // AJ → Rcc_Summary_Sheet_URL
        Work_Order_URL || '',           // AK → Work_Order_URL
        item.Final_Area_Quantity3 || '',// AL
        item.Unit3 || '',               // AM
        item.RATE3 || '',               // AN
        item.AMOUNT3 || '',             // AO
        item.CGST3 || '',               // AP
        item.SGST3 || '',               // AQ
        item.NET_AMOUNT3 || ''          // AR
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

    // === EXECUTE UPDATES ===
    if (updates.length > 0) {
      await Promise.all(updates);
      console.log(`[SHEET UPDATE] ${updates.length} rows updated successfully`);
    }

    // === RESPONSE ===
    res.json({
      success: true,
      message: 'Data saved successfully',
      updated: results.filter(r => r.success),
      notFound,
      mismatch: mismatch.length > 0 ? mismatch : undefined,
      totalProcessed: uids.length,
      debug: {
        Rcc_Summary_Sheet_URL: Rcc_Summary_Sheet_URL || 'EMPTY',
        Work_Order_URL: Work_Order_URL || 'EMPTY'
      }
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