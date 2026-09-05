const express = require('express');
const { sheets, drive, workSpredSheetIdContractorSelection } = require('../../config/googleSheet');
const { Readable } = require('stream');
const router = express.Router();

const spreadsheetId = workSpredSheetIdContractorSelection;

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

async function uploadToGoogleDrive(base64Data, fileName) {
  if (!base64Data || typeof base64Data !== 'string') return '';
  const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
  if (!match) return '';

  try {
    const buffer = Buffer.from(match[2], 'base64');
    const fileStream = new Readable();
    fileStream.push(buffer);
    fileStream.push(null);

    const res = await drive.files.create({
      resource: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: { mimeType: match[1], body: fileStream },
      fields: 'id',
      supportsAllDrives: true,
    });

    const fileId = res.data.id;
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    });

    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  } catch (err) {
    console.error('[DRIVE ERROR]', err.message);
    return '';
  }
}

// =====================================================
// GET: AG (Planned_4) filled + AH empty
// Poora form data return
// =====================================================
router.get('/Get_1st_Meeting_Attend', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: workSpredSheetIdContractorSelection, // ya spreadsheetId — jo aap use kar rahe ho
      range: 'Contractor_Selection_FMS!A7:AP',
    });

    let rows = response.data.values || [];
    if (rows.length > 0) rows = rows.slice(1); // header skip

    // A=0 ... AP=41
    // AG=32 Planned_4 | AH=33 (agar filled → skip)

    const filteredData = rows
      .filter((row) => {
        const uid = (row[1] || '').toString().trim();
        const planned4 = (row[32] || '').toString().trim(); // AG
        const ah = (row[33] || '').toString().trim();       // AH

        if (!uid) return false;
        if (!planned4) return false; // Planned_4 empty → nahi
        if (ah !== '') return false; // AH me kuch hai → nahi
        return true;
      })
      .map((row) => ({
        // ===== A–H Project (form section 1) =====
        timestamp: (row[0] || '').toString(),
        uid: (row[1] || '').toString(),
        projectName: (row[2] || '').toString(),
        projectLocation: (row[3] || '').toString(),
        projectType: (row[4] || '').toString(),
        workCategory: (row[5] || '').toString(),
        workDescription: (row[6] || '').toString(),
        remark1: (row[7] || '').toString(),

        // ===== L–S Contractor (form section 2) =====
        contractorName: (row[11] || '').toString(),
        firmName: (row[12] || '').toString(),
        contractorContact: (row[13] || '').toString(),
        contractorType: (row[14] || '').toString(),
        gstCertificate: (row[15] || '').toString(),
        basicTurnOver: (row[16] || '').toString(),
        noOfProject: (row[17] || '').toString(),
        noOfCurrentProject: (row[18] || '').toString(),

        // ===== V–AA Estimation / Quotation =====
        estimatedQty: (row[21] || '').toString(),
        unit: (row[22] || '').toString(),
        rate: (row[23] || '').toString(),
        totalValue: (row[24] || '').toString(),
        quotationNo: (row[25] || '').toString(),
        quotationPdfUrl: (row[26] || '').toString(),

        // ===== AB–AD Approval =====
        actual3: (row[27] || '').toString(),
        status3: (row[28] || '').toString(),
        remark3: (row[29] || '').toString(),

        // ===== AE–AF blanks if any; AG Planned_4 =====
        // row[30], row[31] agar blank columns hain
        planned4: (row[32] || '').toString(), // AG
        // AH must be empty for this list
        ahCheck: (row[33] || '').toString(),
      }));

    res.json({
      success: true,
      data: filteredData,
      total: filteredData.length,
    });
  } catch (error) {
    console.error('GET /Get_1st_Meeting_Attend:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
  }
});
// =====================================================
// POST: AI → AP
// Status_4 | Location_4 | Unit_No._4 | Work_Order_No._4 |
// Pdf_Url_4 | Work_Order_Basic_Value_4 | (Time Delay blank) | Remark_4
// =====================================================
router.post('/Post_1st_Meeting_Attend', async (req, res) => {
  try {
    const {
      uid,
      status4,
      location4,
      unitNo4,
      workOrderNo4,
      workOrderBasicValue4,
      remark4,
      pdfBase64,
      pdfFileName,
    } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, error: 'UID is required' });
    }
    if (!status4) {
      return res.status(400).json({ success: false, error: 'Status_4 is required' });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Selection_FMS!A7:B',
    });

    const data = response.data.values || [];
    let targetRowIndex = -1;

    for (let i = 1; i < data.length; i++) {
      const rowUid = (data[i][1] || '').toString().trim();
      if (rowUid === uid.toString().trim()) {
        targetRowIndex = i + 7; // header row 7
        break;
      }
    }

    if (targetRowIndex === -1) {
      return res.status(404).json({ success: false, error: 'UID not found' });
    }

    // PDF → Drive
    let pdfUrl = '';
    if (pdfBase64) {
      const ext = (pdfFileName || '').toLowerCase().endsWith('.pdf') ? 'pdf' : 'jpg';
      const name = `work_order_${uid}_${Date.now()}.${ext}`;
      pdfUrl = await uploadToGoogleDrive(pdfBase64, name);
    }

    // AI=34 ... AP=41
    // AO (Time Delay 5) = blank always
    const updateRange = `Contractor_Selection_FMS!AI${targetRowIndex}:AP${targetRowIndex}`;
    const updateValues = [[
      status4 || '',                    // AI Status_4
      location4 || '',                  // AJ Location_4
      unitNo4 || '',                    // AK Unit_No._4
      workOrderNo4 || '',               // AL Work_Order_No._4
      pdfUrl || '',                     // AM Pdf_Url_4
      workOrderBasicValue4 || '',       // AN Work_Order_Basic_Value_4
      '',                               // AO Time Delay 5 — skip
      remark4 || '',                    // AP Remark_4
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      resource: { values: updateValues },
    });

    res.json({
      success: true,
      message: '1st Meeting Attend saved',
      data: {
        uid,
        status4,
        location4,
        unitNo4,
        workOrderNo4,
        pdfUrl,
        workOrderBasicValue4,
        remark4: remark4 || '',
        savedAt: getISTTimestamp(),
      },
    });
  } catch (error) {
    console.error('POST /Post_1st_Meeting_Attend:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update data' });
  }
});

module.exports = router;