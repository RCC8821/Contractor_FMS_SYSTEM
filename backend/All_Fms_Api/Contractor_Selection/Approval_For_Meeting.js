const express = require('express');
const { sheets, workSpredSheetIdContractorSelection } = require('../../config/googleSheet');

const router = express.Router();

// IST Timestamp → DD/MM/YYYY HH:mm:ss
function getISTTimestamp() {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

  const dd = String(ist.getDate()).padStart(2, '0');
  const mm = String(ist.getMonth() + 1).padStart(2, '0');
  const yyyy = ist.getFullYear();

  const hh = String(ist.getHours()).padStart(2, '0');
  const min = String(ist.getMinutes()).padStart(2, '0');
  const ss = String(ist.getSeconds()).padStart(2, '0');

  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}

// =====================================================
// GET: Contractor Selection data
// Rule:
// AC Status_3 empty      → fetch hoga
// AC Status_3 Approved   → fetch hoga
// AC Status_3 Reject     → fetch nahi hoga
// AC Status_3 Rejected   → fetch nahi hoga
// =====================================================
router.get('/Approval_For_Meeting', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: workSpredSheetIdContractorSelection,
      range: 'Contractor_Selection_FMS!A7:AD',
    });

    let rows = response.data.values || [];

    // Row 7 header hai, isliye skip
    if (rows.length > 0) rows = rows.slice(1);

    // Column index map:
    // A=0 Timestamp
    // B=1 UID
    // C=2 Project_Name_1
    // D=3 Project_Location_1
    // E=4 Project_Type_1
    // F=5 Work_Category_1
    // G=6 Work_Description_1
    // H=7 Remark_1
    // I=8 Blank
    // J=9 Blank
    // K=10 Blank
    // L=11 Contractor_Name_2
    // M=12 Contractor_Firm_Name_2
    // N=13 Contractor_Contact_No_2
    // O=14 Contractor_Type_2
    // P=15 GST_Certificate_2
    // Q=16 Basic_Turn_Over_2
    // R=17 No._Of_Project_2
    // S=18 No._Of_Current_Project_2
    // T=19 Blank
    // U=20 Blank
    // V=21 Estimated_Area/Qty_3
    // W=22 Unit_3
    // X=23 Rate_3
    // Y=24 Total_Value_3
    // Z=25 Quotation_No._3
    // AA=26 Quotation_Pdf_Url_3
    // AB=27 Actual_3
    // AC=28 Status_3
    // AD=29 Remark_3

   const filteredData = rows
  .filter((row) => {
    const uid = (row[1] || '').toString().trim();
    const statusRaw = (row[28] || '').toString().trim(); // AC = Status_3
    const s = statusRaw.toLowerCase();

    if (!uid) return false;

    // Approved / Reject → fetch MAT karo
    if (
      s === 'reject' ||
      s === 'rejected' ||
      s === 'approved'
    ) {
      return false;
    }

    // Sirf Status_3 EMPTY (Pending)
    return statusRaw === '';
  })
      .map((row) => ({
        timestamp: (row[0] || '').toString(),
        uid: (row[1] || '').toString(),

        projectName: (row[2] || '').toString(),
        projectLocation: (row[3] || '').toString(),
        projectType: (row[4] || '').toString(),
        workCategory: (row[5] || '').toString(),
        workDescription: (row[6] || '').toString(),
        remark1: (row[7] || '').toString(),

        contractorName: (row[11] || '').toString(),
        firmName: (row[12] || '').toString(),
        contractorContact: (row[13] || '').toString(),
        contractorType: (row[14] || '').toString(),
        gstCertificate: (row[15] || '').toString(),
        basicTurnOver: (row[16] || '').toString(),
        noOfProject: (row[17] || '').toString(),
        noOfCurrentProject: (row[18] || '').toString(),

        estimatedQty: (row[21] || '').toString(),
        unit: (row[22] || '').toString(),
        rate: (row[23] || '').toString(),
        totalValue: (row[24] || '').toString(),
        quotationNo: (row[25] || '').toString(),
        quotationPdfUrl: (row[26] || '').toString(),

        actual3: (row[27] || '').toString(),
        status3: (row[28] || '').toString(),
        remark3: (row[29] || '').toString(),
      }));

    res.json({
      success: true,
      data: filteredData,
      total: filteredData.length,
    });
  } catch (error) {
    console.error('GET /Approval_For_Meeting:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data',
    });
  }
});

// =====================================================
// POST: Update AB–AD
// AB = Actual_3 auto current IST datetime
// AC = Status_3 Approved / Reject
// AD = Remark_3
// =====================================================
router.post('/Post_Approval_For_Meeting', async (req, res) => {
  try {
    const { uid, status3, remark3 } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'UID is required',
      });
    }

    if (!status3 || !['Approved', 'Reject'].includes(status3)) {
      return res.status(400).json({
        success: false,
        error: 'status3 must be Approved or Reject',
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: workSpredSheetIdContractorSelection,
      range: 'Contractor_Selection_FMS!A7:AD',
    });

    const data = response.data.values || [];

    let targetRowIndex = -1;

    // data[0] header row 7 hai
    // data[1] sheet row 8 hai
    for (let i = 1; i < data.length; i++) {
      const rowUid = (data[i][1] || '').toString().trim();

      if (rowUid === uid.toString().trim()) {
        targetRowIndex = i + 7;
        break;
      }
    }

    if (targetRowIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'UID not found',
      });
    }

    const actual3 = getISTTimestamp();

    const updateRange = `Contractor_Selection_FMS!AB${targetRowIndex}:AD${targetRowIndex}`;
    const updateValues = [
      [
        actual3,          // AB = Actual_3
        status3,          // AC = Status_3
        remark3 || '',    // AD = Remark_3
      ],
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: workSpredSheetIdContractorSelection,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      resource: { values: updateValues },
    });

    res.json({
      success: true,
      message: 'Approval data updated successfully',
      data: {
        uid,
        actual3,
        status3,
        remark3: remark3 || '',
      },
    });
  } catch (error) {
    console.error('POST /Post_Approval_For_Meeting:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update data',
    });
  }
});

module.exports = router;