



const express = require('express');
const { sheets, spreadsheetId ,workSpredSheetId} = require('../../config/googleSheet');
const router = express.Router();


router.get('/Bill_Final_By_Office', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Payment_FMS!A7:AE',
    });

    let rows = response.data.values || [];
    if (rows.length <= 1) {
      return res.json({ success: true, data: [] });
    }

    rows = rows.slice(1); // header skip

    // Step 1: Saare "Done" wale bills ko alag se store kar lo (latest per Work Order)
    const latestDoneMap = {};

    rows.forEach(row => {
      const workOrder = (row[16] || '').toString().trim();
      const status5 = (row[30] || '').toString().trim();

      if (workOrder && status5 === 'Done') {
        latestDoneMap[workOrder] = {
          rccBillNo: row[1] || '',
          projectId: row[2] || '',
          projectName: row[3] || '',
          siteEngineer: row[4] || '',
          contractorName: row[5] || '',
          firmName: row[6] || '',
          workName: row[7] || '',
          contractorBillNo: row[8] || '',
          billDate: row[9] || '',
          billUrl: row[10] || '',
          PreviousBillUrl: row[11] || '',
          measurementSheetUrl: row[12] || '',
          attendanceSheetUrl: row[13] || '',
          rccSummarySheetNo: row[14] || '',
          rccSummarySheetUrl: row[15] || '',
          WorkOrderNo: workOrder,
          workOrderUrl: row[17] || '',
          WorkOrderValue: row[18] || '',
          billAmount: row[19] || '',
          NETAMOUNTCurrentAmount: row[25] || '',
          PreviousBillAmount: row[26] || '',
          UPToDatePaidAmount: row[27] || '',
          BalanceAmount: row[28] || '',
          remark: row[29] || '',
          status5: status5
        };
      }
    });

    // Step 2: Sirf Pending Bills (Done nahi hai)
    const filteredData = rows
      .filter(row => {
        const status5 = (row[30] || '').toString().trim();
        return status5 !== 'Done';
      })
      .map(row => {
        const workOrder = (row[16] || '').toString().trim();

        return {
          rccBillNo: row[1] || '',
          projectId: row[2] || '',
          projectName: row[3] || '',
          siteEngineer: row[4] || '',
          contractorName: row[5] || '',
          firmName: row[6] || '',
          workName: row[7] || '',
          contractorBillNo: row[8] || '',
          billDate: row[9] || '',
          billUrl: row[10] || '',
          PreviousBillUrl: row[11] || '',
          measurementSheetUrl: row[12] || '',
          attendanceSheetUrl: row[13] || '',
          rccSummarySheetNo: row[14] || '',
          rccSummarySheetUrl: row[15] || '',
          WorkOrderNo: workOrder,
          workOrderUrl: row[17] || '',
          WorkOrderValue: row[18] || '',
          billAmount: row[19] || '',
          NETAMOUNTCurrentAmount: row[25] || '',
          PreviousBillAmount: row[26] || '',
          UPToDatePaidAmount: row[27] || '',
          BalanceAmount: row[28] || '',
          remark: row[29] || '',
          status5: row[30] || '',
          
          // ← YEH NAYA ADD KIYA — Previous Done Bill
          previousDoneBill: latestDoneMap[workOrder] || null
        };
      });

    res.json({ 
      success: true, 
      totalPending: filteredData.length,
      data: filteredData 
    });

  } catch (error) {
    console.error('Error in /Bill_Final_By_Office:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
  }
});




router.post('/updateBillFinalByRcc', async (req, res) => {
  try {
    const {
      rccBillNo,
      workOrderNo5,                   // Q column
      workOrderUrl,                   // ← R COLUMN (NAYA ADD KIYA)
      workOrderValue,                 // S column
      debitAmount,                    // W column
      actualBillAmount,               // X column
      cgst,                           // Y column
      sgst,                           // Z column
      sdAmount,
      netAmount,                       // T column
      Previous_Bill_Amount_5,         // AA column
      UP_To_Date_Paid_Amount_5,       // AB column
      Balance_Amount_6,               // AC column
      remark  ,                        // AD column
      status,                         // U column (pehle T tha, ab shift ho gaya)
    } = req.body;

    if (!rccBillNo) {
      return res.status(400).json({ success: false, error: 'RCC Bill No is required' });
    }

    // Step 1: Sirf B column se RCC Bill No dhundho
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Payment_FMS!B7:B',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No data found' });
    }

    const rccList = rows.slice(1).map(r => r[0]);
    const rowIndex = rccList.findIndex(val => 
      val && val.toString().trim() === rccBillNo.toString().trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'RCC Bill No not found',
        searched: rccBillNo 
      });
    }

    const targetRowNumber = 8 + rowIndex;

    // Step 2: Batch Update → Sirf required cells → FORMULAS 100% SAFE
    const updates = [];

    if (workOrderNo5 !== undefined)     updates.push({ range: `Contractor_Payment_FMS!Q${targetRowNumber}`, values: [[workOrderNo5]] });
    if (workOrderUrl !== undefined)     updates.push({ range: `Contractor_Payment_FMS!R${targetRowNumber}`, values: [[workOrderUrl]] });     
    if (workOrderValue !== undefined)   updates.push({ range: `Contractor_Payment_FMS!S${targetRowNumber}`, values: [[workOrderValue]] });
    if (debitAmount !== undefined)      updates.push({ range: `Contractor_Payment_FMS!U${targetRowNumber}`, values: [[debitAmount]] });
    if (actualBillAmount !== undefined) updates.push({ range: `Contractor_Payment_FMS!V${targetRowNumber}`, values: [[actualBillAmount]] });
    if (cgst !== undefined)             updates.push({ range: `Contractor_Payment_FMS!W${targetRowNumber}`, values: [[cgst]] });
    if (sgst !== undefined)             updates.push({ range: `Contractor_Payment_FMS!X${targetRowNumber}`, values: [[sgst]] });
    if (sdAmount !== undefined)         updates.push({ range: `Contractor_Payment_FMS!Y${targetRowNumber}`, values: [[sdAmount]] });
    if (netAmount !== undefined)         updates.push({ range: `Contractor_Payment_FMS!Z${targetRowNumber}`, values: [[netAmount]] });
    if (Previous_Bill_Amount_5 !== undefined) updates.push({ range: `Contractor_Payment_FMS!AA${targetRowNumber}`, values: [[Previous_Bill_Amount_5]] });
    if (UP_To_Date_Paid_Amount_5 !== undefined) updates.push({ range: `Contractor_Payment_FMS!AB${targetRowNumber}`, values: [[UP_To_Date_Paid_Amount_5]] });
    if (Balance_Amount_6 !== undefined) updates.push({ range: `Contractor_Payment_FMS!AC${targetRowNumber}`, values: [[Balance_Amount_6]] });
    if (remark !== undefined)           updates.push({ range: `Contractor_Payment_FMS!AD${targetRowNumber}`, values: [[remark]] });
    if (status !== undefined)           updates.push({ range: `Contractor_Payment_FMS!AE${targetRowNumber}`, values: [[status]] });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: updates,
      },
    });

    res.json({
      success: true,
      message: 'Bill updated successfully! Work Order URL (R) included!',
      updatedRow: targetRowNumber,
      rccBillNo,
      updatedFieldsCount: updates.length
    });

  } catch (error) {
    console.error('Error in /updateBillFinalByRcc:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message
    });
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

