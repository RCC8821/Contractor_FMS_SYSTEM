// routes/contractor.js
const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');

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
        if (contractorDone !== '') return null;

        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = padded[i]?.toString().trim() || '';
        });

        // FORCE: Ensure Project_ID exists
        if (!obj['Project_ID'] && obj['Project ID']) {
          obj['Project_ID'] = obj['Project ID'];
        }

        return obj;
      })
      .filter(Boolean);

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
router.post('/submit-contractor', async (req, res) => {
  const contractors = Array.isArray(req.body) ? req.body : [req.body];

  if (!contractors || contractors.length === 0) {
    return res.status(400).json({ success: false, message: 'No contractor data provided' });
  }

  try {
    // Read sheet to find last row (for append)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Selection_FMS!A8:Q',
    });

    const rows = response.data.values || [];
    const startRow = 8;
    const lastRow = rows.length > 0 ? startRow + rows.length : startRow;

    // Prepare values — SIRF frontend se jo aaya, wahi
    const values = contractors.map(c => [
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
      c['Remark'] || ''             // Q
    ]);

    // Append at the end
    const appendStartRow = lastRow;
    const appendEndRow = appendStartRow + values.length - 1;
    const targetRange = `Contractor_Selection_FMS!A${appendStartRow}:Q${appendEndRow}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: targetRange,
      valueInputOption: 'RAW',
      resource: { values },
    });

    res.json({
      success: true,
      message: 'Contractor data appended exactly as in frontend',
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