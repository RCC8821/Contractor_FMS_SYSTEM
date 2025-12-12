// routes/contractor.js
const express = require('express');
const { sheets, spreadsheetId } = require('../../config/googleSheet');

const router = express.Router();

// routes/api.js or similar
router.get('/enquiry-capture', async (req, res) => {
  try {
    const range = 'Enquiry Capture Data!A:K';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.json({ totalRows: 0, data: [] });
    }

    // Header row
    const headerRow = rows[0];
    const headers = headerRow.map(h => h.trim());

    const dataRows = rows.slice(1);

    const filteredData = dataRows
      .map(row => {
        const padded = [...row];
        while (padded.length < 11) padded.push('');

        const contractorDone = padded[10]?.toString().trim();
        // Filters out rows that are marked as 'Done' by the contractor
        if (contractorDone !== '') return null;

        const obj = {};
        // 1. Map all data based on sheet headers
        headers.forEach((h, i) => {
          obj[h] = padded[i]?.toString().trim() || '';
        });

        // 2. CRITICAL FIX: Explicitly ensure Project_ID exists 
        // (Assuming Project ID is always in Column B, Index 1)
        const potentialProjectIdValue = padded[1]?.toString().trim();
        
        if (potentialProjectIdValue) {
            obj['Project_ID'] = potentialProjectIdValue;
        } 
        // Keep original fallback for Project ID vs Project_ID consistency
        else if (obj['Project ID']) {
             obj['Project_ID'] = obj['Project ID'];
        }


        // Ensure the Project_ID field is never empty if a row is returned
        if (!obj['Project_ID']) {
            // If we reach here, and there is no ID, we usually skip this row, 
            // but since the frontend expects non-empty IDs, we keep the data row only if ID exists.
            if (!potentialProjectIdValue) {
                return null;
            }
        }

        return obj;
      })
      .filter(Boolean); // Filter out rows that returned null (empty Contractor Done or missing Project ID)

    res.json({
      totalRows: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
})

// POST: Submit Contractor Requirement to HTML_FORM sheet (NO req_no)
// router.post('/submit-contractor', async (req, res) => {
//   const contractors = Array.isArray(req.body) ? req.body : [req.body];

//   if (!contractors || contractors.length === 0) {
//     return res.status(400).json({ success: false, message: 'No contractor data provided' });
//   }

//   try {
//     // Read sheet to find last row (for append)
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Contractor_Selection_FMS!A8:Q',
//     });

//     const rows = response.data.values || [];
//     const startRow = 8;
//     const lastRow = rows.length > 0 ? startRow + rows.length : startRow;

//     // Prepare values — SIRF frontend se jo aaya, wahi
//     const values = contractors.map(c => [
//       c['Timestamp'] || '',         // A: Exactly from frontend
//       c['Project_ID'] || '',        // B
//       c['Client Name'] || '',       // C
//       c['Mobile Number'] || '',     // D
//       c['City'] || '',              // E
//       c['Address'] || '',           // F
//       c['Requirement'] || '',       // G
//       c['Planned'] || '',           // H: Exactly from frontend
//       c['Actual'] || '',            // I: Exactly from frontend
//       '',                           // J: blank
//       '',                           // K: blank
//       c['Status'] || '',            // L: Only if sent
//       c['Contractor_Name_2'] || '', // M
//       c['Contractor_Contact_No_2'] || '', // N
//       c['Contractor_Type'] || '',   // O
//       '',                           // P: blank
//       c['Remark'] || ''             // Q
//     ]);

//     // Append at the end
//     const appendStartRow = lastRow;
//     const appendEndRow = appendStartRow + values.length - 1;
//     const targetRange = `Contractor_Selection_FMS!A${appendStartRow}:Q${appendEndRow}`;

//     await sheets.spreadsheets.values.update({
//       spreadsheetId,
//       range: targetRange,
//       valueInputOption: 'RAW',
//       resource: { values },
//     });

//     res.json({
//       success: true,
//       message: 'Contractor data appended exactly as in frontend',
//       rowsAdded: contractors.length,
//       startingFromRow: appendStartRow
//     });

//   } catch (error) {
//     console.error('Error appending contractor data:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to save data',
//       error: error.message
//     });
//   }
// });



/////////////////////////////////////////////




router.post('/submit-contractor', async (req, res) => {
  const contractors = Array.isArray(req.body) ? req.body : [req.body];

  if (!contractors || contractors.length === 0) {
    return res.status(400).json({ success: false, message: 'No contractor data provided' });
  }

  try {
    // Read sheet to find last row (for append) and get existing UIDs from column R
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Selection_FMS!A8:R', // Updated to include column R
    });

    const rows = response.data.values || [];
    const startRow = 8;
    const lastRow = rows.length > 0 ? startRow + rows.length : startRow;

    // Extract existing UIDs from column R (index 17)
    const existingUIDs = rows.map(row => row[17]).filter(uid => uid && uid.trim() !== '');
    const maxUID = existingUIDs.length > 0 ? Math.max(...existingUIDs.map(uid => parseInt(uid, 10) || 0)) : 0;
    let nextUID = maxUID + 1;

    // Prepare values — SIRF frontend se jo aaya, wahi, plus auto-generated UID
    const values = contractors.map(c => {
      const uid = String(nextUID).padStart(4, '0'); // Generate UID as 0001, 0002, etc.
      nextUID++; // Increment for next contractor
      return [
        c['Timestamp'] || '',         // A: Exactly from frontend
        c['Project_ID'] || '',        // B
        c['Client Name'] || '',       // C
        c['Mobile Number'] || '',     // D
        c['City'] || '',              // E
        c['Address'] || '',           // F
        c['Requirement'] || '',       // G
        c['Planned'] || '',           // H: Exactly from frontend
        c['Actual'] || '',            // I: Exactly from frontend
        '',                           // J: blank
        '',                           // K: blank
        c['Status'] || '',            // L: Only if sent
        c['Contractor_Name_2'] || '', // M
        c['Contractor_Contact_No_2'] || '', // N
        c['Contractor_Type'] || '',   // O
        '',                           // P: blank
        c['Remark'] || '',            // Q
        uid                           // R: Auto-generated unique UID
      ];
    });

    // Append at the end
    const appendStartRow = lastRow;
    const appendEndRow = appendStartRow + values.length - 1;
    const targetRange = `Contractor_Selection_FMS!A${appendStartRow}:R${appendEndRow}`; // Updated to R

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: targetRange,
      valueInputOption: 'RAW',
      resource: { values },
    });

    res.json({
      success: true,
      message: 'Contractor data appended exactly as in frontend with auto-generated UID',
      rowsAdded: contractors.length,
      startingFromRow: appendStartRow
    });

  } catch (error) {
    console.error('Error appending contractor data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save data',
      error: error.message
    });
  }
});








module.exports = router;