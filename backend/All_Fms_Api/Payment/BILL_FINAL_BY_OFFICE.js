
const express = require('express');
const { sheets, spreadsheetId ,workSpredSheetId} = require('../../config/googleSheet');
const router = express.Router();



router.get('/Done_Bills', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Payment_FMS!A7:AF',
    });

    let rows = response.data.values || [];
    if (rows.length <= 1) {
      return res.json({ success: true, data: [] });
    }

    rows = rows.slice(1);

    const doneBills = rows
      .filter(row => (row[31] || '').toString().trim() === 'Done')
      .map(row => ({
        rccBillNo: row[1] || '',
        projectId: (row[2] || '').toString().trim(),
        contractorName: (row[5] || '').toString().trim(),
        firmName: (row[6] || '').toString().trim(),
        workName: (row[7] || '').toString().trim(),
        WorkOrderNo: (row[16] || '').toString().trim(),
        UPToDatePaidAmount: row[28] || '0',
        BalanceAmount: row[29] || '0',
      }));

    res.json({
      success: true,
      data: doneBills
    });

  } catch (error) {
    console.error('Error in /Done_Bills:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
  }
});

router.get('/Bill_Final_By_Office', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Payment_FMS!A7:AF',
    });

    let rows = response.data.values || [];
    if (rows.length <= 1) {
      return res.json({ success: true, data: [], totalPending: 0 });
    }

    rows = rows.slice(1); // Header skip

    // ✅ Parse all rows (Done + Pending dono)
    const allBills = rows.map(row => ({
      rccBillNo: row[1] || '',
      projectId: (row[2] || '').toString().trim(),
      projectName: (row[3] || '').toString().trim(),
      siteEngineer: row[4] || '',
      contractorName: (row[5] || '').toString().trim(),
      firmName: (row[6] || '').toString().trim(),
      workName: (row[7] || '').toString().trim(),
      contractorBillNo: row[8] || '',
      billDate: row[9] || '',
      billUrl: row[10] || '',
      PreviousBillUrl: row[11] || '',
      measurementSheetUrl: row[12] || '',
      attendanceSheetUrl: row[13] || '',
      rccSummarySheetNo: row[14] || '',
      rccSummarySheetUrl: row[15] || '',
      WorkOrderNo: (row[16] || '').toString().trim(),
      workOrderUrl: row[17] || '',
      WorkOrderValue: row[18] || '',
      billAmount: row[19] || '',
      NETAMOUNTCurrentAmount: row[26] || '',
      PreviousBillAmount: row[27] || '',
      UPToDatePaidAmount: row[28] || '',
      BalanceAmount: row[29] || '',
      remark: row[30] || '',
      status5: (row[31] || '').toString().trim(),
    }));

    // ✅ Separate Done and Pending bills
    const doneBills = allBills.filter(bill => bill.status5 === 'Done');
    const pendingBills = allBills.filter(bill => bill.status5 !== 'Done');

    // ✅ Attach previous done bill to each pending bill
    const billsWithPrevious = pendingBills.map(bill => {
      const previousDoneBill = doneBills
        .filter(done => 
          done.projectId === bill.projectId &&
          done.contractorName === bill.contractorName &&
          done.firmName === bill.firmName &&
          done.workName === bill.workName &&
          done.WorkOrderNo === bill.WorkOrderNo
        )
        .sort((a, b) => {
          // Latest done bill first (by RCC Bill No descending)
          return b.rccBillNo.localeCompare(a.rccBillNo);
        })[0]; // Get the latest match

      return {
        ...bill,
        previousDoneBill: previousDoneBill || null
      };
    });

    res.json({
      success: true,
      totalPending: billsWithPrevious.length,
      data: billsWithPrevious
    });

  } catch (error) {
    console.error('Error in /Bill_Final_By_Office:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
  }
});




// router.post('/updateBillFinalByRcc', async (req, res) => {
//   try {
//     const {
//       rccBillNo,
//       workOrderNo5,                   // Q column
//       workOrderUrl,                   // R column  
//       workOrderValue,                 // S column
//       debitAmount,                    // W column
//       actualBillAmount,               // X column
//       sdAmount,                       // ✅ Column Y me
//       materialDebitAmount5,           // ✅ Column Z me  
//       cgst,                           // AA column
//       sgst,                           // AB column
//       netAmount,                      // AC column
//       Previous_Bill_Amount_5,         // AD column
//       UP_To_Date_Paid_Amount_5,       // AE column
//       Balance_Amount_6,               // AF column
//       remark,                         // AG column
//       status,                         // AH column
//     } = req.body;

    
  
//     if (!rccBillNo) {
//       return res.status(400).json({ success: false, error: 'RCC Bill No is required' });
//     }

//     // Step 1: Sirf B column se RCC Bill No dhundho
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Contractor_Payment_FMS!B7:B',
//     });

//     const rows = response.data.values || [];
//     if (rows.length === 0) {
//       return res.status(404).json({ success: false, error: 'No data found' });
//     }

//     const rccList = rows.slice(1).map(r => r[0]);
//     const rowIndex = rccList.findIndex(val => 
//       val && val.toString().trim() === rccBillNo.toString().trim()
//     );

//     if (rowIndex === -1) {
//       return res.status(404).json({ 
//         success: false, 
//         error: 'RCC Bill No not found',
//         searched: rccBillNo 
//       });
//     }

//     const targetRowNumber = 8 + rowIndex;
//     console.log(`📍 Updating row ${targetRowNumber} for ${rccBillNo}`);

//     // Step 2: Batch Update → Sirf required cells
//     const updates = [];

//     if (workOrderNo5 !== undefined)     updates.push({ range: `Contractor_Payment_FMS!Q${targetRowNumber}`, values: [[workOrderNo5]] });
//     if (workOrderUrl !== undefined)     updates.push({ range: `Contractor_Payment_FMS!R${targetRowNumber}`, values: [[workOrderUrl]] });     
//     if (workOrderValue !== undefined)   updates.push({ range: `Contractor_Payment_FMS!S${targetRowNumber}`, values: [[workOrderValue]] });
    
//     // T, U, V columns skip karein (contractor/firm/workType nahi hain)
    
//     if (debitAmount !== undefined)      updates.push({ range: `Contractor_Payment_FMS!U${targetRowNumber}`, values: [[debitAmount]] });
//     if (actualBillAmount !== undefined) updates.push({ range: `Contractor_Payment_FMS!V${targetRowNumber}`, values: [[actualBillAmount]] });

//     if (cgst !== undefined)             updates.push({ range: `Contractor_Payment_FMS!W${targetRowNumber}`, values: [[cgst]] });
//     if (sgst !== undefined)             updates.push({ range: `Contractor_Payment_FMS!X${targetRowNumber}`, values: [[sgst]] });
//     if (materialDebitAmount5 !== undefined) {
//       console.log(`✅ Material Debit "${materialDebitAmount5}" → Column Y (Y${targetRowNumber})`);
//       updates.push({ range: `Contractor_Payment_FMS!Y${targetRowNumber}`, values: [[materialDebitAmount5]] });
//     } else {
//       console.log("❌ materialDebitAmount5 is undefined!");
//     }
//     // ✅ CRITICAL FIX: SD Amount Y column me
//     if (sdAmount !== undefined) {
//       console.log(`✅ SD Amount "${sdAmount}" → Column Z (Z${targetRowNumber})`);
//       updates.push({ range: `Contractor_Payment_FMS!Z${targetRowNumber}`, values: [[sdAmount]] });
//     } else {
//       console.log("❌ sdAmount is undefined!");
//     }
    
    
//     // ✅ Net Amount AC column me
//     if (netAmount !== undefined) {
//       console.log(`✅ Net Amount "${netAmount}" → Column AA (AA${targetRowNumber})`);
//       updates.push({ range: `Contractor_Payment_FMS!AA${targetRowNumber}`, values: [[netAmount]] });
//     } else {
//       console.log("❌ netAmount is undefined!");
//     }
    
//     if (Previous_Bill_Amount_5 !== undefined) updates.push({ range: `Contractor_Payment_FMS!AB${targetRowNumber}`, values: [[Previous_Bill_Amount_5]] });
//     if (UP_To_Date_Paid_Amount_5 !== undefined) updates.push({ range: `Contractor_Payment_FMS!AC${targetRowNumber}`, values: [[UP_To_Date_Paid_Amount_5]] });
//     if (Balance_Amount_6 !== undefined) updates.push({ range: `Contractor_Payment_FMS!AD${targetRowNumber}`, values: [[Balance_Amount_6]] });
//     if (remark !== undefined)           updates.push({ range: `Contractor_Payment_FMS!AE${targetRowNumber}`, values: [[remark]] });
//     if (status !== undefined)           updates.push({ range: `Contractor_Payment_FMS!AF${targetRowNumber}`, values: [[status]] });

//     console.log(`📋 Total updates: ${updates.length}`);
//     console.log("Updates to be made:", updates.map(u => u.range));

//     if (updates.length === 0) {
//       return res.status(400).json({ success: false, error: 'No fields to update' });
//     }

//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId,
//       resource: {
//         valueInputOption: 'USER_ENTERED',
//         data: updates,
//       },
//     });

//     res.json({
//       success: true,
//       message: 'Bill updated successfully!',
//       updatedRow: targetRowNumber,
//       rccBillNo,
//       updatedFieldsCount: updates.length,
//       criticalFields: {
//         sdAmount: { column: 'Y', cell: `Y${targetRowNumber}`, value: sdAmount },
//         materialDebitAmount5: { column: 'Z', cell: `Z${targetRowNumber}`, value: materialDebitAmount5 },
//         netAmount: { column: 'AC', cell: `AC${targetRowNumber}`, value: netAmount }
//       }
//     });

//   } catch (error) {
//     console.error('❌ Error in /updateBillFinalByRcc:', error.message);
//     console.error('Error stack:', error.stack);
//     res.status(500).json({
//       success: false,
//       error: 'Server error',
//       details: error.message
//     });
//   }
// });



router.post('/updateBillFinalByRcc', async (req, res) => {
  try {
    const {
      rccBillNo,
      workOrderNo5,                   // Q column
      workOrderUrl,                   // R column  
      workOrderValue,                 // S column
      debitAmount,                    // U column
      actualBillAmount,               // V column
      sdAmount,                       // Z column (neeche wale code ke hisab se)
      materialDebitAmount5,           // Y column
      cgst,                           // W column
      sgst,                           // X column
      netAmount,                      // AA column
      Previous_Bill_Amount_5,         // AB column
      UP_To_Date_Paid_Amount_5,       // AC column
      Balance_Amount_6,               // AD column
      remark,                         // AE column
      status                          // AF column
    } = req.body;

    if (!rccBillNo) {
      return res.status(400).json({ success: false, error: 'RCC Bill No is required' });
    }

    // Step 1: B7 se neeche tak B column fetch karo
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Payment_FMS!B7:B',
    });

    const rows = response.data.values || [];

    // Step 2: Exact match dhundho (trim karke)
    const rowIndex = rows.findIndex(val => 
      val && val[0] && val[0].toString().trim() === rccBillNo.toString().trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: `RCC Bill No "${rccBillNo}" not found in the sheet.` 
      });
    }

    // Sahi row number calculate karo (B7 se shuru → index 0 = row 7)
    const targetRowNumber = 7 + rowIndex;
    console.log(`✅ Updating Row: ${targetRowNumber} for Bill: ${rccBillNo}`);

    // Step 3: Updates array banao
    const updates = [];
    const addUpdate = (col, value) => {
      if (value !== undefined && value !== null && value !== '') {
        updates.push({
          range: `Contractor_Payment_FMS!${col}${targetRowNumber}`,
          values: [[value]]
        });
      }
    };

    // ✅ Exact mapping neeche wale code ke according
    addUpdate('Q', workOrderNo5);
    addUpdate('R', workOrderUrl);
    addUpdate('S', workOrderValue);

    addUpdate('U', debitAmount);          // Debit Amount → U
    addUpdate('V', actualBillAmount);      // Actual Bill Amount → V

    addUpdate('W', cgst);                 // CGST → W
    addUpdate('X', sgst);                 // SGST → X

    addUpdate('Y', materialDebitAmount5); // Material Debit → Y
    addUpdate('Z', sdAmount);             // SD Amount → Z

    addUpdate('AA', netAmount);           // Net Amount → AA

    addUpdate('AB', Previous_Bill_Amount_5);
    addUpdate('AC', UP_To_Date_Paid_Amount_5);
    addUpdate('AD', Balance_Amount_6);
    addUpdate('AE', remark);
    addUpdate('AF', status);

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields provided to update' });
    }

    // Batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: updates,
      },
    });

    res.json({
      success: true,
      message: `Row ${targetRowNumber} updated successfully!`,
      rccBillNo,
      rowNumber: targetRowNumber,
      updatedFields: updates.length
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});




router.get('/work-orders', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: workSpredSheetId,
      range: 'Contractor_Work_Order!B:I',
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return res.json({
        success: true,
        message: 'No data found',
        columns: {
          Project_ID: [],
          Project_Name: [],
          Contractor_Name: [],
          Contractor_Firm_Name: [],
          Work_Type: [],
          Work_Order_No: [],
          Work_Order_Url: [],
          Work_Order_Value: []
        }
      });
    }

    // Header skip karo
    const dataRows = rows.slice(1);

    // YEHI CHANGE KARNA HAI — NO SET, NO SORT, RAW DATA BHEJO!
    const columns = {
      Project_ID:          dataRows.map(r => (r[0] || '').trim()),
      Project_Name:        dataRows.map(r => (r[1] || '').trim()),
      Contractor_Name:     dataRows.map(r => (r[2] || '').trim()),
      Contractor_Firm_Name:dataRows.map(r => (r[3] || '').trim()),
      Work_Type:           dataRows.map(r => (r[4] || '').trim()),
      Work_Order_No:       dataRows.map(r => (r[5] || '').trim()),
      Work_Order_Url:      dataRows.map(r => (r[6] || '').trim()),
      Work_Order_Value:    dataRows.map(r => r[7] || '')
    };

    // Optional: Sirf non-empty rows bhejo
    const filteredIndices = columns.Project_ID
      .map((pid, i) => pid ? i : -1)
      .filter(i => i !== -1);

    const filteredColumns = {
      Project_ID:          filteredIndices.map(i => columns.Project_ID[i]),
      Project_Name:        filteredIndices.map(i => columns.Project_Name[i]),
      Contractor_Name:     filteredIndices.map(i => columns.Contractor_Name[i]),
      Contractor_Firm_Name:filteredIndices.map(i => columns.Contractor_Firm_Name[i]),
      Work_Type:           filteredIndices.map(i => columns.Work_Type[i]),
      Work_Order_No:       filteredIndices.map(i => columns.Work_Order_No[i]),
      Work_Order_Url:      filteredIndices.map(i => columns.Work_Order_Url[i]),
      Work_Order_Value:    filteredIndices.map(i => columns.Work_Order_Value[i])
    };

    res.json({
      success: true,
      totalRows: filteredColumns.Project_ID.length,
      columns: filteredColumns  // ← Ab relation safe hai!
    });

  } catch (error) {
    console.error('Error in /work-orders:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data',
      details: error.message
    });
  }
});


module.exports = router;




