const express = require('express');
const { sheets, drive, workSpredSheetIdContractorSelection } = require('../../config/googleSheet');
const { Readable } = require('stream');

const router = express.Router();

// Helper: Get IST Timestamp in DD/MM/YYYY HH:mm:ss format
function getISTTimestamp() {
  const now = new Date();
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  const day = String(istDate.getDate()).padStart(2, '0');
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const year = istDate.getFullYear();
  
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  const seconds = String(istDate.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Helper: Upload file to Google Drive
async function uploadToGoogleDrive(base64Data, fileName) {
  if (!base64Data || typeof base64Data !== 'string') return '';

  const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
  if (!match) return '';

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
    });

    const fileId = res.data.id;
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    });

    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  } catch (error) {
    console.error(`[DRIVE ERROR] ${fileName}:`, error.message);
    return '';
  }
}

// =====================================================
// GET: Dropdowns from Project_Data sheet (Including UNITS)
// =====================================================
router.get('/project-dropdowns', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: workSpredSheetIdContractorSelection,
      range: 'Project_Data!A1:Z',
    });

    const rows = response.data.values || [];
    if (rows.length < 2) {
      return res.json({
        success: true,
        projectNames: [],
        projectTypes: [],
        workCategories: [],
        contractorTypes: [],
        units: [],
      });
    }

    const headers = rows[0].map((h) => (h || '').toString().trim().toLowerCase());
    const dataRows = rows.slice(1);

    const findCol = (...possibleNames) => {
      for (const name of possibleNames) {
        const idx = headers.findIndex(
          (h) => h === name.toLowerCase() || h.includes(name.toLowerCase())
        );
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const colProjectName = findCol('project_name', 'project name');
    const colProjectType = findCol('project_type', 'project type');
    const colWorkCategory = findCol('work_category', 'work category');
    const colContractorType = findCol('contractor_type', 'contractor type');
    
    // Column J (Index 9) se Unit ayega
    let colUnit = findCol('unit', 'units', 'uom');
    if (colUnit < 0) colUnit = 9; 

    const extractUnique = (colIndex) => {
      if (colIndex < 0) return [];
      return [
        ...new Set(
          dataRows
            .map((row) => (row[colIndex] || '').toString().trim())
            .filter((v) => v !== '')
        ),
      ].sort();
    };

    res.json({
      success: true,
      projectNames: extractUnique(colProjectName),
      projectTypes: extractUnique(colProjectType),
      workCategories: extractUnique(colWorkCategory),
      contractorTypes: extractUnique(colContractorType),
      units: extractUnique(colUnit), // Send Units to frontend
    });
  } catch (error) {
    console.error('GET /project-dropdowns Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch dropdowns' });
  }
});

// =====================================================
// POST: Submit Contractor Form
// =====================================================
router.post('/submit-contractor', async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [req.body];

    if (!payload.length) {
      return res.status(400).json({ success: false, message: 'No data provided' });
    }

    const sheetRes = await sheets.spreadsheets.values.get({
      spreadsheetId: workSpredSheetIdContractorSelection,
      range: 'Contractor_Selection_FMS!A7:AD',
    });

    const existingRows = sheetRes.data.values || [];

    // Auto UID
    const existingUIDNums = existingRows
      .map((row) => row[1])
      .filter(Boolean)
      .map((val) => {
        const m = val.toString().match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      });
    let nextUID = (existingUIDNums.length ? Math.max(...existingUIDNums) : 0) + 1;

    // Auto Quotation No
    const existingQuoteNums = existingRows
      .map((row) => row[25])
      .filter(Boolean)
      .map((val) => {
        const m = val.toString().match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      });
    let nextQuoteNo = (existingQuoteNums.length ? Math.max(...existingQuoteNums) : 0) + 1;

    const values = [];

    for (let i = 0; i < payload.length; i++) {
      const c = payload[i];

      const currentUID = `UID-${String(nextUID).padStart(3, '0')}`;
      nextUID++;

      const currentQuoteNo = String(nextQuoteNo).padStart(2, '0');
      nextQuoteNo++;

      const timestamp = getISTTimestamp();

      let quotationUrl = c.Quotation_Pdf_Url_3 || '';
      if (c.Quotation_Pdf_Base64) {
        const ext = (c.Quotation_File_Name || '').toLowerCase().endsWith('.pdf') ? 'pdf' : 'jpg';
        const fileName = `quotation_${currentUID}_${Date.now()}.${ext}`;
        quotationUrl = await uploadToGoogleDrive(c.Quotation_Pdf_Base64, fileName);
      }

      const row = new Array(30).fill('');
      row[0]  = timestamp;                        
      row[1]  = currentUID;                       
      row[2]  = c.Project_Name_1 || '';           
      row[3]  = c.Project_Location_1 || '';       
      row[4]  = c.Project_Type_1 || '';           
      row[5]  = c.Work_Category_1 || '';          
      row[6]  = c.Work_Description_1 || '';       
      row[7]  = c.Remark_1 || '';                 
      row[8]  = '';                               
      row[9]  = '';                               
      row[10] = '';                               
      row[11] = c.Contractor_Name_2 || '';        
      row[12] = c.Contractor_Firm_Name_2 || '';   
      row[13] = c.Contractor_Contact_No_2 || '';  
      row[14] = c.Contractor_Type_2 || '';        
      row[15] = c.GST_Certificate_2 || '';        
      row[16] = c.Basic_Turn_Over_2 || '';        
      row[17] = c.No_Of_Project_2 || '';          
      row[18] = c.No_Of_Current_Project_2 || '';  
      row[19] = '';                               
      row[20] = '';                               
      row[21] = c.Estimated_Area_Qty_3 || '';     
      row[22] = c.Unit_3 || '';                   
      row[23] = c.Rate_3 || '';                   
      row[24] = c.Total_Value_3 || '';            
      row[25] = currentQuoteNo;                   
      row[26] = quotationUrl;                     
      row[27] = '';                               
      row[28] = '';                               
      row[29] = '';                               

      values.push(row);
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: workSpredSheetIdContractorSelection,
      range: 'Contractor_Selection_FMS!A:AD',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values },
    });

    res.json({
      success: true,
      message: 'Contractor data saved successfully',
      rowsAdded: values.length,
    });
  } catch (error) {
    console.error('[FATAL] /submit-contractor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save data',
      error: error.message,
    });
  }
});

module.exports = router;