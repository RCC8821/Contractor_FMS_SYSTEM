const express = require('express');
const { sheets, spreadsheetId } = require('../../config/googleSheet');
const router = express.Router();

router.get('/Bill_Final_By_Office', async (req, res) => {
  try {
    // Range: A7:AB → क्योंकि S (18) तक चाहिए, बाकी के लिए safe
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Payment_FMS!A7:AB',
    });

    let rows = response.data.values || [];

    // Skip header row (row 7)
    if (rows.length > 0) {
      rows = rows.slice(1);
    }

    const filteredData = rows
      .filter(row => {
        // कम से कम 19 कॉलम्स (0 to 18 → A to S)
        // if (row.length <= 18) return false;

        const status5 = (row[18] || '').toString().trim();
        return status5 !== 'Done'; // "Done" नहीं होना चाहिए
      })
      .map(row => ({
        // Timestamp हटाया गया
        rccBillNo: row[1] || '',
        projectId: row[2] || '',
        projectName: row[3] || '',
        siteEngineer: row[4] || '',
        contractorName: row[5] || '',
        firmName: row[6] || '',
        workName: row[7] || '',
        contractorBillNo: row[8] || '',
        billDate: row[9] || '',
        measurementSheetUrl: row[10] || '',
        attendanceSheetUrl: row[11] || '',
        rccSummarySheetNo: row[12] || '',
        rccSummarySheetUrl: row[13] || '',
        workOrderUrl: row[14] || '',
        billAmount: row[15] || '', // BILL_AMOUNT_5
        status5: row[18] || ''     // STATUS_5 (optional, for debug)
        // planned6 हटाया गया
      }));

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('Error in /Bill_Final_By_Office:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
  }
});




router.post('/updateBillFinalByRcc', async (req, res) => {
  try {
    const {
      rccBillNo,
      workOrderValue,
      sdAmount,
      status,
      debitAmount,
      actualBillAmount,
      cgst,
      sgst,
      netAmount,
      remark
    } = req.body;

    if (!rccBillNo) {
      return res.status(400).json({ success: false, error: 'Rcc Bill No is required' });
    }

    // Step 1: Fetch all rows from A7:Z
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Payment_FMS!A7:Z',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No data found in sheet' });
    }

    // Skip header row if exists
    const dataRows = rows.slice(1); // assuming row 7 is header
    const headerRow = rows[0];

    // Step 2: Find row index where column B (index 1) === rccBillNo
    const rowIndex = dataRows.findIndex(row => 
      row[1] && row[1].toString().trim() === rccBillNo.toString().trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({ success: false, error: 'Rcc Bill No not found' });
    }

    const targetRowNumber = 7 + 1 + rowIndex; // +1 for header, +7 for A7 start

    // Step 3: Prepare update values (only the columns we want to update)
    const updateValues = [...dataRows[rowIndex]]; // copy existing row

    // Update only specific columns
    updateValues[16] = workOrderValue || updateValues[16]; // Q
    updateValues[17] = sdAmount || updateValues[17];       // R
    updateValues[18] = status || updateValues[18];         // S
    updateValues[20] = debitAmount || updateValues[20];   // U
    updateValues[21] = actualBillAmount || updateValues[21]; // V
    updateValues[22] = cgst || updateValues[22];           // W
    updateValues[23] = sgst || updateValues[23];           // X
    updateValues[24] = netAmount || updateValues[24];       // Y
    updateValues[25] = remark || updateValues[25];         // Z

    // Step 4: Update the specific row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Contractor_Payment_FMS!A${targetRowNumber}:Z${targetRowNumber}`,
      valueInputOption: 'RAW',
      resource: {
        values: [updateValues],
      },
    });

    res.json({
      success: true,
      message: 'Row updated successfully',
      updatedRow: targetRowNumber - 6, // relative to data
      rccBillNo
    });

  } catch (error) {
    console.error('Error in /updateBillByRcc:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update data' });
  }
});

module.exports = router;