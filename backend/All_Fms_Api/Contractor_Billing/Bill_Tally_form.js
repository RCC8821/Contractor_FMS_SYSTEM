
// const express = require('express');
// const { sheets, spreadsheetId } = require('../../config/googleSheet');
// const cloudinary = require('cloudinary').v2;
// const router = express.Router();

// // CLOUDINARY CONFIG
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // GET PROJECT DATA

// router.get('/project-data', async (req, res) => {
//   try {
//     const sheetInfo = await sheets.spreadsheets.get({
//       spreadsheetId,
//       fields: 'sheets.properties.gridProperties',
//     });
//     const sheet = sheetInfo.data.sheets.find(s => s.properties.title === 'Project_Data');
//     const maxRows = sheet?.properties?.gridProperties?.rowCount || 10000;

//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: `Project_Data!A1:K${maxRows}`,
//     });

//     const rows = response.data.values || [];
//     if (!rows.length) return res.json({ message: 'No data', totalRows: 0, columns: {} });

//     const headers = rows[0];
//     const dataRows = rows.slice(1).filter(row => row.some(cell => cell)); // skip empty rows

//     // Initialize columns object
//     const columns = {};
//     headers.forEach(header => {
//       columns[header] = [];
//     });

//     // Fill each column
//     dataRows.forEach(row => {
//       headers.forEach((header, idx) => {
//         const value = row[idx] !== undefined ? row[idx] : "";
//         columns[header].push(value);
//       });
//     });

//     res.json({
//       message: "Data fetched - Column wise",
//       totalRows: dataRows.length,
//       columns
//     });

//   } catch (error) {
//     console.error('GET /project-data error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // HELPER: Upload base64 to Cloudinary (Fixed)
// const uploadBase64ToCloudinary = async (base64) => {
//   if (!base64 || typeof base64 !== 'string' || !base64.includes(';base64,')) return '';

//   try {
//     const result = await cloudinary.uploader.upload(base64, {
//       folder: 'bill_tally',
//       resource_type: 'image',
//       format: 'jpg', // Force jpg to avoid issues
//     });
//     return result.secure_url || '';
//   } catch (err) {
//     console.error('Cloudinary upload failed:', err.message);
//     return '';
//   }
// };

// // HELPER: Get next UID
// const getNextUID = async () => {
//   try {
//     const res = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Contracotr_Bill_Entry_HTML!B2:B',
//     });
//     const rows = res.data.values || [];
//     if (rows.length === 0) return 'A1';

//     const uids = rows
//       .map(r => r[0])
//       .filter(id => /^A\d+$/.test(id))
//       .map(id => parseInt(id.slice(1)))
//       .filter(n => n > 0);

//     const maxNum = uids.length ? Math.max(...uids) : 0;
//     return `A${maxNum + 1}`;
//   } catch (err) {
//     console.error('getNextUID error:', err);
//     return 'A1';
//   }
// };

// // HELPER: Generate IST timestamp
// const getISTTimestamp = () => {
//   const now = new Date();
//   const offset = 5.5 * 60 * 60 * 1000;
//   const ist = new Date(now.getTime() + offset);

//   const pad = n => n.toString().padStart(2, '0');

//   return `${pad(ist.getUTCDate())}/${pad(ist.getUTCMonth() + 1)}/${ist.getUTCFullYear()} ${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}`;
// };

// // === NEW: Generate RCC Bill No ===
// const getNextRCCBillNo = async () => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Contracotr_Bill_Entry_HTML!O2:O', // Column O = RCC Bill No
//     });

//     const existing = (response.data.values || []).flat().filter(Boolean);
//     if (existing.length === 0) return 'RCCBill01';

//     const numbers = existing
//       .map(val => {
//         const match = val.match(/RCCBill(\d+)/);
//         return match ? parseInt(match[1], 10) : 0;
//       })
//       .filter(n => n > 0);

//     const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
//     return `RCCBill${String(nextNum).padStart(2, '0')}`;
//   } catch (err) {
//     console.warn('Could not read RCC Bill No, starting from RCCBill01');
//     return 'RCCBill01';
//   }
// };

// // POST /submit-multiple – With RCC Bill No
// router.post('/submit-multiple', async (req, res) => {
//   try {
//     const {
//       projectId,
//       projectName,
//       siteEngineerName,
//       contractorName,
//       contractorFirmName,
//       billCopy,
//       works,
//       timestamp
//     } = req.body;

//     // Validation
//     if (!projectId || !Array.isArray(works) || works.length === 0) {
//       return res.status(400).json({ error: 'projectId and works[] are required' });
//     }

//     // Timestamp
//     const finalTimestamp = (timestamp && typeof timestamp === 'string' && timestamp.includes('/'))
//       ? timestamp
//       : getISTTimestamp();

//     // Generate RCC Bill No (same for all rows in this batch)
//     const rccBillNo = await getNextRCCBillNo();

//     // Upload main bill
//     const billCopyUrl = billCopy ? await uploadBase64ToCloudinary(billCopy) : '';
//     if (billCopy && !billCopyUrl) {
//       return res.status(500).json({
//         error: 'Failed to upload main bill copy',
//         tip: 'Check Cloudinary credentials or Base64 format'
//       });
//     }

//     // Upload previous bills
//     const previousUrls = await Promise.all(
//       works.map(w => w.previousBillCopy ? uploadBase64ToCloudinary(w.previousBillCopy) : Promise.resolve(''))
//     );

//     // Get UID
//     const startUID = await getNextUID();
//     const startNum = parseInt(startUID.slice(1));

//     // Build rows — 19 columns: A to S
//     const dataRows = works.map((w, i) => [
//   finalTimestamp,                     // A
//   `A${startNum + i}`,                 // B – UID
//   projectId || '',                    // C
//   projectName || '',                  // D
//   siteEngineerName || '',             // E
//   contractorName || '',               // F
//   contractorFirmName || '',           // G
//   w.workName || '',                   // H
//   w.workDescription || '',            // I
//   w.quantity || '',                   // J
//   w.unit || '',                       // K
//   w.rate || '',                       // L
//   w.amount || '',                     // M
//   w.billNo || '',                     // N – Bill No. (अब आएगा!)
//   rccBillNo,                          // O – RCC Bill No
//   w.billDate || '',                   // P – Bill Date (अब आएगा!)
//   billCopyUrl || '',                  // Q – Main Bill
//   previousUrls[i] || '',              // R – Previous Bill
//   w.remark || ''                      // S – Remark
// ]);
//     // Append to sheet
//     await sheets.spreadsheets.values.append({
//       spreadsheetId,
//       range: 'Contracotr_Bill_Entry_HTML!A2',
//       valueInputOption: 'RAW',
//       insertDataOption: 'INSERT_ROWS',
//       requestBody: { values: dataRows }
//     });

//     // Success
//     res.json({
//       success: true,
//       message: `${dataRows.length} rows saved!`,
//       UID: `A${startNum} to A${startNum + dataRows.length - 1}`,
//       rccBillNo,
//       billCopyUrl,
//       previousBillUrls: previousUrls.filter(Boolean),
//       sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`
//     });

//   } catch (error) {
//     console.error('POST /submit-multiple error:', error);
//     res.status(500).json({
//       error: error.message,
//       tip: 'Check server logs and Cloudinary config'
//     });
//   }
// });

// module.exports = router;






const express = require('express');
const { sheets, spreadsheetId } = require('../../config/googleSheet');
const cloudinary = require('cloudinary').v2;
const router = express.Router();

// CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET PROJECT DATA  (unchanged)
router.get('/project-data', async (req, res) => {
  try {
    const sheetInfo = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.gridProperties',
    });
    const sheet = sheetInfo.data.sheets.find(s => s.properties.title === 'Project_Data');
    const maxRows = sheet?.properties?.gridProperties?.rowCount || 10000;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Project_Data!A1:K${maxRows}`,
    });

    const rows = response.data.values || [];
    if (!rows.length) return res.json({ message: 'No data', totalRows: 0, columns: {} });

    const headers = rows[0];
    const dataRows = rows.slice(1).filter(row => row.some(cell => cell));

    const columns = {};
    headers.forEach(header => { columns[header] = []; });

    dataRows.forEach(row => {
      headers.forEach((header, idx) => {
        const value = row[idx] !== undefined ? row[idx] : "";
        columns[header].push(value);
      });
    });

    res.json({
      message: "Data fetched - Column wise",
      totalRows: dataRows.length,
      columns
    });

  } catch (error) {
    console.error('GET /project-data error:', error);
    res.status(500).json({ error: error.message });
  }
});

// HELPER: Upload base64 to Cloudinary
const uploadBase64ToCloudinary = async (base64) => {
  if (!base64 || typeof base64 !== 'string' || !base64.includes(';base64,')) return '';
  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'bill_tally',
      resource_type: 'image',
      format: 'jpg',
    });
    return result.secure_url || '';
  } catch (err) {
    console.error('Cloudinary upload failed:', err.message);
    return '';
  }
};

/* -------------------------------------------------
   NEW: Get next **numeric** UID (e.g. 1, 2, 3 …)
   ------------------------------------------------- */
const getNextUID = async () => {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contracotr_Bill_Entry_HTML!B2:B',
    });
    const rows = res.data.values || [];

    // If sheet is empty → start from 1
    if (rows.length === 0) return 1;

    const numbers = rows
      .flat()
      .map(v => parseInt(v, 10))
      .filter(n => !isNaN(n) && n > 0);

    const maxNum = numbers.length ? Math.max(...numbers) : 0;
    return maxNum + 1;               // ← simple number
  } catch (err) {
    console.error('getNextUID error:', err);
    return 1;
  }
};

/* -------------------------------------------------
   NEW: Generate RCC Bill No → RCCBill001, RCCBill002 …
   ------------------------------------------------- */
const getNextRCCBillNo = async () => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contracotr_Bill_Entry_HTML!O2:O', // Column O = RCC Bill No
    });

    const existing = (response.data.values || []).flat().filter(Boolean);
    if (existing.length === 0) return 'RCCBill001';

    const numbers = existing
      .map(val => {
        const match = val.match(/RCCBill(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);

    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `RCCBill${String(nextNum).padStart(3, '0')}`;   // ← 3-digit padding
  } catch (err) {
    console.warn('Could not read RCC Bill No, starting from RCCBill001');
    return 'RCCBill001';
  }
};

// HELPER: Generate IST timestamp
const getISTTimestamp = () => {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + offset);

  const pad = n => n.toString().padStart(2, '0');

  return `${pad(ist.getUTCDate())}/${pad(ist.getUTCMonth() + 1)}/${ist.getUTCFullYear()} ${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}`;
};

/* -------------------------------------------------
   POST /submit-multiple – Updated UID & RCCBillNo
   ------------------------------------------------- */
router.post('/submit-multiple', async (req, res) => {
  try {
    const {
      projectId,
      projectName,
      siteEngineerName,
      contractorName,
      contractorFirmName,
      billCopy,
      works,
      timestamp
    } = req.body;

    // Validation
    if (!projectId || !Array.isArray(works) || works.length === 0) {
      return res.status(400).json({ error: 'projectId and works[] are required' });
    }

    const finalTimestamp = (timestamp && typeof timestamp === 'string' && timestamp.includes('/'))
      ? timestamp
      : getISTTimestamp();

    // ---- RCC Bill No (same for whole batch) ----
    const rccBillNo = await getNextRCCBillNo();

    // ---- Upload main bill ----
    const billCopyUrl = billCopy ? await uploadBase64ToCloudinary(billCopy) : '';
    if (billCopy && !billCopyUrl) {
      return res.status(500).json({
        error: 'Failed to upload main bill copy',
        tip: 'Check Cloudinary credentials or Base64 format'
      });
    }

    // ---- Upload previous bill copies ----
    const previousUrls = await Promise.all(
      works.map(w => w.previousBillCopy ? uploadBase64ToCloudinary(w.previousBillCopy) : Promise.resolve(''))
    );

    // ---- Get starting UID (numeric) ----
    const startUID = await getNextUID();          // e.g. 57

    // ---- Build rows (19 columns A-S) ----
    const dataRows = works.map((w, i) => [
      finalTimestamp,                     // A – Timestamp
      startUID + i,                       // B – UID (numeric)
      projectId || '',                    // C
      projectName || '',                  // D
      siteEngineerName || '',             // E
      contractorName || '',               // F
      contractorFirmName || '',           // G
      w.workName || '',                   // H
      w.workDescription || '',            // I
      w.quantity || '',                   // J
      w.unit || '',                       // K
      w.rate || '',                       // L
      w.amount || '',                     // M
      w.billNo || '',                     // N – Bill No.
      rccBillNo,                          // O – RCC Bill No (RCCBill001 …)
      w.billDate || '',                   // P – Bill Date
      billCopyUrl || '',                  // Q – Main Bill
      previousUrls[i] || '',              // R – Previous Bill
      w.remark || ''                      // S – Remark
    ]);

    // ---- Append to Google Sheet ----
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Contracotr_Bill_Entry_HTML!A2',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: dataRows }
    });

    // ---- Success response ----
    res.json({
      success: true,
      message: `${dataRows.length} rows saved!`,
      UID: `${startUID} to ${startUID + dataRows.length - 1}`,
      rccBillNo,
      billCopyUrl,
      previousBillUrls: previousUrls.filter(Boolean),
      sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`
    });

  } catch (error) {
    console.error('POST /submit-multiple error:', error);
    res.status(500).json({
      error: error.message,
      tip: 'Check server logs and Cloudinary config'
    });
  }
});

module.exports = router;