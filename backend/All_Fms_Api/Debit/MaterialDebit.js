

// const express = require('express');
// const { sheets, drive, DebitID } = require('../../config/googleSheet');
// const { Readable } = require('stream');
// const router = express.Router();

// const { jsPDF } = require('jspdf');
// const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');
// console.log('jsPDF and jspdf-autotable loaded successfully');

// router.use((req, res, next) => {
//   if (req.method === 'OPTIONS') return res.status(200).end();
//   next();
// });

// // ─── Helper: Upload PDF ───────────────────────────────────────────────────────
// async function uploadPDFToGoogleDrive(pdfBuffer, fileName) {
//   const fileStream = new Readable();
//   fileStream.push(pdfBuffer);
//   fileStream.push(null);

//   const response = await drive.files.create({
//     resource: {
//       name: fileName,
//       parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
//     },
//     media: { mimeType: 'application/pdf', body: fileStream },
//     fields: 'id, webViewLink',
//     supportsAllDrives: true,
//   });

//   await drive.permissions.create({
//     fileId: response.data.id,
//     requestBody: { role: 'reader', type: 'anyone' },
//     supportsAllDrives: true,
//   });

//   return `https://drive.google.com/file/d/${response.data.id}/view?usp=sharing`;
// }

// // ─── Helper: Generate PDF ─────────────────────────────────────────────────────
// function generateDebitPDF(selectedRows, debitUID, actualDate, status) {
//   const doc = new jsPDF();
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();

//   const clean = (val) => (val || 'N/A').toString().trim().replace(/[^\x20-\x7E]/g, '');

//   // ── Header Section ──────────────────────────────────────────────────────
//   doc.setDrawColor(41, 128, 185);
//   doc.setLineWidth(2);
//   doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

//   doc.setTextColor(0, 0, 0);
//   doc.setFontSize(18);
//   doc.setFont('helvetica', 'bold');
//   doc.text('R.C.C Infrastructures', pageWidth / 2, 15, { align: 'center' });

//   doc.setFontSize(9);
//   doc.setFont('helvetica', 'normal');
//   doc.text('310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026', pageWidth / 2, 22, { align: 'center' });
//   doc.text('Contact: 7869962504 | Email: mayank@rcinfrastructure.com', pageWidth / 2, 28, { align: 'center' });
//   doc.text('GST: 23ABHFR3130L1ZA', pageWidth / 2, 34, { align: 'center' });

//   doc.setDrawColor(200, 200, 200);
//   doc.setLineWidth(0.5);
//   doc.line(15, 38, pageWidth - 15, 38);

//   doc.setFontSize(15);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(220, 53, 69);
//   doc.text('CONTRACTOR MATERIAL DEBIT REPORT', pageWidth / 2, 50, { align: 'center' });

//   doc.setDrawColor(220, 53, 69);
//   doc.setLineWidth(1);
//   doc.line(30, 53, pageWidth - 30, 53);

//   doc.setTextColor(0, 0, 0);
//   doc.setFontSize(10);

//   // ── Get Unique Values ───────────────────────────────────────────────────
//   const uniquePOs = [...new Set(selectedRows.map(r => clean(r.poNo)))];
//   const uniqueProjects = [...new Set(selectedRows.map(r => clean(r.projectName)))];
//   const uniqueContractors = [...new Set(selectedRows.map(r => clean(r.contractorName)))];
//   const uniqueVendors = [...new Set(selectedRows.map(r => clean(r.vendorFirmName)))];

//   const genDate = new Date().toLocaleDateString('en-GB', { 
//     day: '2-digit', month: 'short', year: 'numeric' 
//   }).replace(/ /g, '-');

//   // ── Info Section (Removed Status & PO Numbers) ──────────────────────────
//   let infoY = 65;
//   const infoLines = [
//     { 
//       l: 'Project Name:', 
//       v: uniqueProjects.length > 1 ? `${uniqueProjects[0]} (+${uniqueProjects.length - 1} more)` : uniqueProjects[0] || 'N/A', 
//       l2: 'Total POs:', 
//       v2: `${uniquePOs.length} PO(s)` 
//     },
//     { 
//       l: 'Contractor:', 
//       v: uniqueContractors.length > 1 ? `${uniqueContractors[0]} (+${uniqueContractors.length - 1} more)` : uniqueContractors[0] || 'N/A', 
//       l2: 'Actual Date:', 
//       v2: clean(actualDate) 
//     },
//     { 
//       l: 'Vendor Firm:', 
//       v: uniqueVendors.length > 1 ? `${uniqueVendors[0]} (+${uniqueVendors.length - 1} more)` : uniqueVendors[0] || 'N/A', 
//       l2: 'Debit UID:', 
//       v2: debitUID 
//     },
//     { 
//       l: 'Report Date:', 
//       v: genDate, 
//       l2: 'Total Materials:', 
//       v2: `${selectedRows.length} Item(s)` 
//     },
//   ];

//   infoLines.forEach(({ l, v, l2, v2 }) => {
//     doc.setFont('helvetica', 'bold'); 
//     doc.text(l, 15, infoY);
//     doc.setFont('helvetica', 'normal'); 
//     doc.text(v.substring(0, 40), 52, infoY);
//     doc.setFont('helvetica', 'bold'); 
//     doc.text(l2, 115, infoY);
//     doc.setFont('helvetica', 'normal'); 
//     doc.text(v2.substring(0, 30), 152, infoY);
//     infoY += 7;
//   });

//   // ── Material Details Table ──────────────────────────────────────────────
//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(220, 53, 69);
//   doc.text('Material Details', 15, infoY + 5);
//   doc.setTextColor(0, 0, 0);

//   // Sort by PO number for grouping
//   const sortedRows = [...selectedRows].sort((a, b) => {
//     return clean(a.poNo).localeCompare(clean(b.poNo));
//   });

//   const tableBody = sortedRows.map((row, i) => [
//     i + 1,
//     clean(row.poNo),
//     clean(row.materialName).substring(0, 25),
//     clean(row.requiredQty),
//     clean(row.finalReceivedQty),
//     clean(row.amount16),
//     clean(row.netAmount),
//   ]);

//   // Calculate totals
//   const totalNet = selectedRows.reduce((sum, r) => {
//     const n = parseFloat((r.netAmount || '').toString().replace(/,/g, ''));
//     return sum + (isNaN(n) ? 0 : n);
//   }, 0);

//   const totalBillAmt = selectedRows.reduce((sum, r) => {
//     const n = parseFloat((r.amount16 || '').toString().replace(/,/g, ''));
//     return sum + (isNaN(n) ? 0 : n);
//   }, 0);

//   // Add total row
//   tableBody.push([
//     '', 
//     '', 
//     'TOTAL', 
//     '', 
//     '', 
//     totalBillAmt > 0 ? totalBillAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '',
//     totalNet > 0 ? totalNet.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : ''
//   ]);

//   autoTable(doc, {
//     head: [['Sr.', 'PO No', 'Material Name', 'Req Qty', 'Rcvd Qty', 'Bill Amt', 'Net Amt']],
//     body: tableBody,
//     startY: infoY + 12,
//     theme: 'grid',
//     styles: { fontSize: 8, cellPadding: 3 },
//     headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: 'bold' },
//     columnStyles: {
//       0: { halign: 'center', cellWidth: 12 },
//       1: { halign: 'center', cellWidth: 25 },
//       2: { cellWidth: 50 },
//       3: { halign: 'center', cellWidth: 20 },
//       4: { halign: 'center', cellWidth: 20 },
//       5: { halign: 'right', cellWidth: 25 },
//       6: { halign: 'right', cellWidth: 25 },
//     },
//     didParseCell: function(data) {
//       // Highlight total row
//       if (data.row.index === tableBody.length - 1) {
//         data.cell.styles.fontStyle = 'bold';
//         data.cell.styles.fillColor = [240, 240, 240];
//       }
//     },
//   });

//   // ── Footer ──────────────────────────────────────────────────────────────
//   const footerY = doc.internal.pageSize.getHeight() - 15;
//   doc.setFontSize(8);
//   doc.setFont('helvetica', 'italic');
//   doc.setTextColor(128, 128, 128);
//   doc.text(`Generated on: ${new Date().toLocaleString('en-IN')} | ${debitUID}`, pageWidth / 2, footerY, { align: 'center' });

//   return doc.output('arraybuffer');
// }

// // ─── Normalize PO Number ──────────────────────────────────────────────────────
// function normalizePO(po) {
//   if (!po) return '';
//   return po.toString().trim().toUpperCase().replace(/[-_\s]/g, '');
// }

// // ─── Helper: Generate Next Available UID (REUSE MISSING UIDs) ─────────────────
// function getNextAvailableUID(existingUIDs) {
//   const existingNums = existingUIDs
//     .filter(v => v && v.toString().trim().startsWith('DBT'))
//     .map(v => parseInt(v.toString().replace('DBT', ''), 10))
//     .filter(n => !isNaN(n));

//   console.log(`[UID] Existing UIDs in sheet: ${existingNums.length > 0 ? [...new Set(existingNums)].sort((a, b) => a - b).join(', ') : 'None'}`);

//   let newDebitNum;

//   if (existingNums.length === 0) {
//     newDebitNum = 1;
//     console.log(`[UID] No existing UIDs, starting from 1`);
//   } else {
//     const sortedNums = [...new Set(existingNums)].sort((a, b) => a - b);
//     const maxNum = sortedNums[sortedNums.length - 1];

//     newDebitNum = null;
//     for (let i = 1; i <= maxNum; i++) {
//       if (!sortedNums.includes(i)) {
//         newDebitNum = i;
//         console.log(`[UID] Found missing UID slot at position: ${i}`);
//         break;
//       }
//     }

//     if (newDebitNum === null) {
//       newDebitNum = maxNum + 1;
//       console.log(`[UID] No gap found, using next number: ${newDebitNum}`);
//     }
//   }

//   const newDebitUID = `DBT${String(newDebitNum).padStart(3, '0')}`;
//   console.log(`[UID] Final Generated UID: ${newDebitUID}`);

//   return newDebitUID;
// }

// // ════════════════════════════════════════════════════════════════════════════
// // GET - Fetch Data
// // ════════════════════════════════════════════════════════════════════════════
// router.get('/Contractor_Material_Debit', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: DebitID,
//       range: 'Contractor_Material_Debit!A:AF',
//     });

//     const allRows = response.data.values || [];

//     // Find header row
//     let headerIndex = 0;
//     for (let i = 0; i < Math.min(5, allRows.length); i++) {
//       if (allRows[i] && allRows[i][0] && allRows[i][0].toString().toLowerCase().includes('date')) {
//         headerIndex = i;
//         break;
//       }
//     }

//     const dataRows = allRows.slice(headerIndex + 1);

//     const filteredData = dataRows
//       .map((row, index) => ({
//         rowIndex: headerIndex + index + 2,
//         requirementDate: row[0] || '',
//         UID: row[1] || '',
//         projectName: row[2] || '',
//         contractorName: row[3] || '',
//         vendorFirmName: row[4] || '',
//         materialType: row[5] || '',
//         materialName: row[6] || '',
//         use: row[7] || '',
//         poNo: row[8] || '',
//         poUrl: row[9] || '',
//         poDate: row[10] || '',
//         mrnNo: row[11] || '',
//         mrnUrl: row[12] || '',
//         requiredQty: row[13] || '',
//         finalReceivedQty: row[14] || '',
//         billNo16: row[15] || '',
//         billUrl16: row[16] || '',
//         billDate16: row[17] || '',
//         amount16: row[18] || '',
//         transportCharges16: row[19] || '',
//         netAmount: row[20] || '',
//         status: row[29] || '',
//       }))
//       .filter(row => row.poNo && row.status !== 'Done' && row.status !== 'Debit Done');

//     res.json({ success: true, data: filteredData });
//   } catch (error) {
//     console.error('GET Error:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch data' });
//   }
// });

// // ════════════════════════════════════════════════════════════════════════════
// // POST - Update Data (MULTIPLE POs SUPPORT)
// // ════════════════════════════════════════════════════════════════════════════
// router.post('/Contractor_Material_Debit', async (req, res) => {
//   try {
//     const { selectedRows, actualDate, status } = req.body;

//     if (!Array.isArray(selectedRows) || selectedRows.length === 0) {
//       return res.status(400).json({ success: false, error: 'selectedRows required' });
//     }
//     if (!actualDate || !status) {
//       return res.status(400).json({ success: false, error: 'actualDate and status required' });
//     }

//     // Get ALL unique PO numbers from request
//     const requestedPOs = [...new Set(selectedRows.map(r => normalizePO(r.poNo)))];
//     console.log(`\n[DEBIT] ═══════════════════════════════════════════════════`);
//     console.log(`[DEBIT] Looking for ${requestedPOs.length} PO(s): ${requestedPOs.join(', ')}`);

//     // ── Step 1: Fetch ENTIRE sheet ────────────────────────────────────────
//     const sheetResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId: DebitID,
//       range: 'Contractor_Material_Debit!A:AF',
//     });

//     const allRows = sheetResponse.data.values || [];
//     console.log(`[DEBIT] Sheet has ${allRows.length} total rows`);

//     // ── Step 2: Find ALL rows with matching PO numbers ────────────────────
//     const matchedRows = [];
//     const poMaterialCount = {};

//     for (let i = 0; i < allRows.length; i++) {
//       const row = allRows[i];
//       const sheetPO = normalizePO(row[8]);
//       const sheetStatus = (row[29] || '').toString().trim();

//       // Skip if already done
//       if (sheetStatus === 'Done' || sheetStatus === 'Debit Done') continue;

//       // Check if this PO is in our requested list
//       if (requestedPOs.includes(sheetPO)) {
//         const actualRowNumber = i + 1;
//         const originalPO = row[8] || '';

//         // Count materials per PO
//         if (!poMaterialCount[originalPO]) poMaterialCount[originalPO] = 0;
//         poMaterialCount[originalPO]++;

//         console.log(`[MATCH] ✓ Row ${actualRowNumber}: PO="${originalPO}" | Material="${row[6]}"`);

//         matchedRows.push({
//           actualRowIndex: actualRowNumber,
//           poNo: originalPO,
//           projectName: row[2] || '',
//           contractorName: row[3] || '',
//           vendorFirmName: row[4] || '',
//           materialName: row[6] || '',
//           requiredQty: row[13] || '',
//           finalReceivedQty: row[14] || '',
//           amount16: row[18] || '',
//           netAmount: row[20] || '',
//         });
//       }
//     }

//     console.log(`[DEBIT] ───────────────────────────────────────────────────`);
//     console.log(`[DEBIT] Found ${matchedRows.length} total materials across ${Object.keys(poMaterialCount).length} PO(s)`);
    
//     // Show PO-wise count
//     Object.entries(poMaterialCount).forEach(([po, count]) => {
//       console.log(`[DEBIT]   → ${po}: ${count} material(s)`);
//     });

//     if (matchedRows.length === 0) {
//       const availablePOs = [...new Set(allRows.map(r => r[8]).filter(Boolean))].slice(0, 20);
//       return res.status(400).json({
//         success: false,
//         error: `No rows found for PO: ${requestedPOs.join(', ')}`,
//         availablePOs: availablePOs,
//         hint: 'Check PO number format'
//       });
//     }

//     // ── Step 3: Get ALL existing UIDs from sheet ──────────────────────────
//     const uidResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId: DebitID,
//       range: 'Contractor_Material_Debit!AE:AE',
//     });

//     const allUIDs = (uidResponse.data.values || []).flat();

//     // ── Step 4: Generate Next Available UID ───────────────────────────────
//     const newDebitUID = getNextAvailableUID(allUIDs);

//     // ── Step 5: Generate PDF with ALL matched rows ────────────────────────
//     console.log(`[DEBIT] Generating PDF for ${matchedRows.length} materials...`);
//     const pdfBuffer = Buffer.from(generateDebitPDF(matchedRows, newDebitUID, actualDate, status));

//     // ── Step 6: Upload PDF ────────────────────────────────────────────────
//     const pdfUrl = await uploadPDFToGoogleDrive(pdfBuffer, `${newDebitUID}_Debit.pdf`);
//     console.log(`[DEBIT] PDF uploaded: ${pdfUrl}`);

//     // ── Step 7: Update ALL matched rows with SAME data ────────────────────
//     const batchData = [];

//     for (const row of matchedRows) {
//       const r = row.actualRowIndex;
//       batchData.push(
//         { range: `Contractor_Material_Debit!AC${r}`, values: [[actualDate]] },
//         { range: `Contractor_Material_Debit!AD${r}`, values: [[status]] },
//         { range: `Contractor_Material_Debit!AE${r}`, values: [[newDebitUID]] },
//         { range: `Contractor_Material_Debit!AF${r}`, values: [[pdfUrl]] },
//       );
//     }

//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId: DebitID,
//       resource: { valueInputOption: 'USER_ENTERED', data: batchData },
//     });

//     console.log(`[DEBIT] ✓ Updated ${matchedRows.length} rows with UID: ${newDebitUID}`);
//     console.log(`[DEBIT] ═══════════════════════════════════════════════════\n`);

//     res.json({
//       success: true,
//       message: `${matchedRows.length} materials from ${Object.keys(poMaterialCount).length} PO(s) updated successfully`,
//       data: {
//         debitUID: newDebitUID,
//         pdfUrl,
//         totalMaterials: matchedRows.length,
//         totalPOs: Object.keys(poMaterialCount).length,
//         poSummary: poMaterialCount,
//         updatedRows: matchedRows.map(r => ({
//           row: r.actualRowIndex,
//           poNo: r.poNo,
//           material: r.materialName
//         }))
//       }
//     });

//   } catch (error) {
//     console.error('[DEBIT] Error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// module.exports = router;









const express = require('express');
const { sheets, drive, DebitID } = require('../../config/googleSheet');
const { Readable } = require('stream');
const router = express.Router();

const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');
console.log('jsPDF and jspdf-autotable loaded successfully');

router.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// ─── Helper: Upload PDF ───────────────────────────────────────────────────────
async function uploadPDFToGoogleDrive(pdfBuffer, fileName) {
  const fileStream = new Readable();
  fileStream.push(pdfBuffer);
  fileStream.push(null);

  const response = await drive.files.create({
    resource: {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    },
    media: { mimeType: 'application/pdf', body: fileStream },
    fields: 'id, webViewLink',
    supportsAllDrives: true,
  });

  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: { role: 'reader', type: 'anyone' },
    supportsAllDrives: true,
  });

  return `https://drive.google.com/file/d/${response.data.id}/view?usp=sharing`;
}

// ─── Helper: Generate PDF (WITH PO DATE) ──────────────────────────────────────
function generateDebitPDF(selectedRows, debitUID, actualDate, status) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const clean = (val) => (val || 'N/A').toString().trim().replace(/[^\x20-\x7E]/g, '');

  // ── Header Section ──────────────────────────────────────────────────────
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(2);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('R.C.C Infrastructures', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026', pageWidth / 2, 22, { align: 'center' });
  doc.text('Contact: 7869962504 | Email: mayank@rcinfrastructure.com', pageWidth / 2, 28, { align: 'center' });
  doc.text('GST: 23ABHFR3130L1ZA', pageWidth / 2, 34, { align: 'center' });

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, 38, pageWidth - 15, 38);

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69);
  doc.text('CONTRACTOR MATERIAL DEBIT REPORT', pageWidth / 2, 50, { align: 'center' });

  doc.setDrawColor(220, 53, 69);
  doc.setLineWidth(1);
  doc.line(30, 53, pageWidth - 30, 53);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  // ── Get Unique Values ───────────────────────────────────────────────────
  const uniquePOs = [...new Set(selectedRows.map(r => clean(r.poNo)))];
  const uniqueProjects = [...new Set(selectedRows.map(r => clean(r.projectName)))];
  const uniqueContractors = [...new Set(selectedRows.map(r => clean(r.contractorName)))];
  const uniqueVendors = [...new Set(selectedRows.map(r => clean(r.vendorFirmName)))];

  const genDate = new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', month: 'short', year: 'numeric' 
  }).replace(/ /g, '-');

  // ── Info Section ────────────────────────────────────────────────────────
  let infoY = 65;
  const infoLines = [
    { 
      l: 'Project Name:', 
      v: uniqueProjects.length > 1 ? `${uniqueProjects[0]} (+${uniqueProjects.length - 1} more)` : uniqueProjects[0] || 'N/A', 
      l2: 'Total POs:', 
      v2: `${uniquePOs.length} PO(s)` 
    },
    { 
      l: 'Contractor:', 
      v: uniqueContractors.length > 1 ? `${uniqueContractors[0]} (+${uniqueContractors.length - 1} more)` : uniqueContractors[0] || 'N/A', 
      l2: 'Actual Date:', 
      v2: clean(actualDate) 
    },
    { 
      l: 'Vendor Firm:', 
      v: uniqueVendors.length > 1 ? `${uniqueVendors[0]} (+${uniqueVendors.length - 1} more)` : uniqueVendors[0] || 'N/A', 
      l2: 'Debit UID:', 
      v2: debitUID 
    },
    { 
      l: 'Report Date:', 
      v: genDate, 
      l2: 'Total Materials:', 
      v2: `${selectedRows.length} Item(s)` 
    },
  ];

  infoLines.forEach(({ l, v, l2, v2 }) => {
    doc.setFont('helvetica', 'bold'); 
    doc.text(l, 15, infoY);
    doc.setFont('helvetica', 'normal'); 
    doc.text(v.substring(0, 40), 52, infoY);
    doc.setFont('helvetica', 'bold'); 
    doc.text(l2, 115, infoY);
    doc.setFont('helvetica', 'normal'); 
    doc.text(v2.substring(0, 30), 152, infoY);
    infoY += 7;
  });

  // ── Material Details Table ──────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69);
  doc.text('Material Details', 15, infoY + 5);
  doc.setTextColor(0, 0, 0);

  // Sort by PO number for grouping
  const sortedRows = [...selectedRows].sort((a, b) => {
    return clean(a.poNo).localeCompare(clean(b.poNo));
  });

  // Table body with PO Date added
  const tableBody = sortedRows.map((row, i) => [
    i + 1,
    clean(row.poNo),
    clean(row.poDate),  // PO Date added
    clean(row.materialName).substring(0, 22),
    clean(row.requiredQty),
    clean(row.finalReceivedQty),
    clean(row.amount16),
    clean(row.netAmount),
  ]);

  // Calculate totals
  const totalNet = selectedRows.reduce((sum, r) => {
    const n = parseFloat((r.netAmount || '').toString().replace(/,/g, ''));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const totalBillAmt = selectedRows.reduce((sum, r) => {
    const n = parseFloat((r.amount16 || '').toString().replace(/,/g, ''));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  // Add total row
  tableBody.push([
    '', 
    '', 
    '',  // Empty for PO Date column
    'TOTAL', 
    '', 
    '', 
    totalBillAmt > 0 ? totalBillAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '',
    totalNet > 0 ? totalNet.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : ''
  ]);

  autoTable(doc, {
    head: [['Sr.', 'PO No', 'PO Date', 'Material Name', 'Req Qty', 'Rcvd Qty', 'Bill Amt', 'Net Amt']],
    body: tableBody,
    startY: infoY + 12,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },   // Sr.
      1: { halign: 'center', cellWidth: 22 },   // PO No
      2: { halign: 'center', cellWidth: 22 },   // PO Date
      3: { cellWidth: 45 },                      // Material Name
      4: { halign: 'center', cellWidth: 18 },   // Req Qty
      5: { halign: 'center', cellWidth: 18 },   // Rcvd Qty
      6: { halign: 'right', cellWidth: 22 },    // Bill Amt
      7: { halign: 'right', cellWidth: 22 },    // Net Amt
    },
    didParseCell: function(data) {
      // Highlight total row
      if (data.row.index === tableBody.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    },
  });

  // ── Footer ──────────────────────────────────────────────────────────────
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')} | ${debitUID}`, pageWidth / 2, footerY, { align: 'center' });

  return doc.output('arraybuffer');
}

// ─── Normalize PO Number ──────────────────────────────────────────────────────
function normalizePO(po) {
  if (!po) return '';
  return po.toString().trim().toUpperCase().replace(/[-_\s]/g, '');
}

// ─── Helper: Generate Next Available UID (REUSE MISSING UIDs) ─────────────────
function getNextAvailableUID(existingUIDs) {
  const existingNums = existingUIDs
    .filter(v => v && v.toString().trim().startsWith('DBT'))
    .map(v => parseInt(v.toString().replace('DBT', ''), 10))
    .filter(n => !isNaN(n));

  console.log(`[UID] Existing UIDs in sheet: ${existingNums.length > 0 ? [...new Set(existingNums)].sort((a, b) => a - b).join(', ') : 'None'}`);

  let newDebitNum;

  if (existingNums.length === 0) {
    newDebitNum = 1;
    console.log(`[UID] No existing UIDs, starting from 1`);
  } else {
    const sortedNums = [...new Set(existingNums)].sort((a, b) => a - b);
    const maxNum = sortedNums[sortedNums.length - 1];

    newDebitNum = null;
    for (let i = 1; i <= maxNum; i++) {
      if (!sortedNums.includes(i)) {
        newDebitNum = i;
        console.log(`[UID] Found missing UID slot at position: ${i}`);
        break;
      }
    }

    if (newDebitNum === null) {
      newDebitNum = maxNum + 1;
      console.log(`[UID] No gap found, using next number: ${newDebitNum}`);
    }
  }

  const newDebitUID = `DBT${String(newDebitNum).padStart(3, '0')}`;
  console.log(`[UID] Final Generated UID: ${newDebitUID}`);

  return newDebitUID;
}

// ════════════════════════════════════════════════════════════════════════════
// GET - Fetch Data
// ════════════════════════════════════════════════════════════════════════════
router.get('/Contractor_Material_Debit', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: DebitID,
      range: 'Contractor_Material_Debit!A:AF',
    });

    const allRows = response.data.values || [];

    // Find header row
    let headerIndex = 0;
    for (let i = 0; i < Math.min(5, allRows.length); i++) {
      if (allRows[i] && allRows[i][0] && allRows[i][0].toString().toLowerCase().includes('date')) {
        headerIndex = i;
        break;
      }
    }

    const dataRows = allRows.slice(headerIndex + 1);

    const filteredData = dataRows
      .map((row, index) => ({
        rowIndex: headerIndex + index + 2,
        requirementDate: row[0] || '',
        UID: row[1] || '',
        projectName: row[2] || '',
        contractorName: row[3] || '',
        vendorFirmName: row[4] || '',
        materialType: row[5] || '',
        materialName: row[6] || '',
        use: row[7] || '',
        poNo: row[8] || '',
        poUrl: row[9] || '',
        poDate: row[10] || '',
        mrnNo: row[11] || '',
        mrnUrl: row[12] || '',
        requiredQty: row[13] || '',
        finalReceivedQty: row[14] || '',
        billNo16: row[15] || '',
        billUrl16: row[16] || '',
        billDate16: row[17] || '',
        amount16: row[18] || '',
        transportCharges16: row[19] || '',
        netAmount: row[20] || '',
        status: row[29] || '',
      }))
      .filter(row => row.poNo && row.status !== 'Done' && row.status !== 'Debit Done');

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('GET Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// POST - Update Data (MULTIPLE POs SUPPORT)
// ════════════════════════════════════════════════════════════════════════════
router.post('/Contractor_Material_Debit', async (req, res) => {
  try {
    const { selectedRows, actualDate, status } = req.body;

    if (!Array.isArray(selectedRows) || selectedRows.length === 0) {
      return res.status(400).json({ success: false, error: 'selectedRows required' });
    }
    if (!actualDate || !status) {
      return res.status(400).json({ success: false, error: 'actualDate and status required' });
    }

    // Get ALL unique PO numbers from request
    const requestedPOs = [...new Set(selectedRows.map(r => normalizePO(r.poNo)))];
    console.log(`\n[DEBIT] ═══════════════════════════════════════════════════`);
    console.log(`[DEBIT] Looking for ${requestedPOs.length} PO(s): ${requestedPOs.join(', ')}`);

    // ── Step 1: Fetch ENTIRE sheet ────────────────────────────────────────
    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: DebitID,
      range: 'Contractor_Material_Debit!A:AF',
    });

    const allRows = sheetResponse.data.values || [];
    console.log(`[DEBIT] Sheet has ${allRows.length} total rows`);

    // ── Step 2: Find ALL rows with matching PO numbers ────────────────────
    const matchedRows = [];
    const poMaterialCount = {};

    for (let i = 0; i < allRows.length; i++) {
      const row = allRows[i];
      const sheetPO = normalizePO(row[8]);
      const sheetStatus = (row[29] || '').toString().trim();

      // Skip if already done
      if (sheetStatus === 'Done' || sheetStatus === 'Debit Done') continue;

      // Check if this PO is in our requested list
      if (requestedPOs.includes(sheetPO)) {
        const actualRowNumber = i + 1;
        const originalPO = row[8] || '';

        // Count materials per PO
        if (!poMaterialCount[originalPO]) poMaterialCount[originalPO] = 0;
        poMaterialCount[originalPO]++;

        console.log(`[MATCH] ✓ Row ${actualRowNumber}: PO="${originalPO}" | Material="${row[6]}"`);

        matchedRows.push({
          actualRowIndex: actualRowNumber,
          poNo: originalPO,
          poDate: row[10] || '',  // PO Date added
          projectName: row[2] || '',
          contractorName: row[3] || '',
          vendorFirmName: row[4] || '',
          materialName: row[6] || '',
          requiredQty: row[13] || '',
          finalReceivedQty: row[14] || '',
          amount16: row[18] || '',
          netAmount: row[20] || '',
        });
      }
    }

    console.log(`[DEBIT] ───────────────────────────────────────────────────`);
    console.log(`[DEBIT] Found ${matchedRows.length} total materials across ${Object.keys(poMaterialCount).length} PO(s)`);
    
    // Show PO-wise count
    Object.entries(poMaterialCount).forEach(([po, count]) => {
      console.log(`[DEBIT]   → ${po}: ${count} material(s)`);
    });

    if (matchedRows.length === 0) {
      const availablePOs = [...new Set(allRows.map(r => r[8]).filter(Boolean))].slice(0, 20);
      return res.status(400).json({
        success: false,
        error: `No rows found for PO: ${requestedPOs.join(', ')}`,
        availablePOs: availablePOs,
        hint: 'Check PO number format'
      });
    }

    // ── Step 3: Get ALL existing UIDs from sheet ──────────────────────────
    const uidResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: DebitID,
      range: 'Contractor_Material_Debit!AE:AE',
    });

    const allUIDs = (uidResponse.data.values || []).flat();

    // ── Step 4: Generate Next Available UID ───────────────────────────────
    const newDebitUID = getNextAvailableUID(allUIDs);

    // ── Step 5: Generate PDF with ALL matched rows ────────────────────────
    console.log(`[DEBIT] Generating PDF for ${matchedRows.length} materials...`);
    const pdfBuffer = Buffer.from(generateDebitPDF(matchedRows, newDebitUID, actualDate, status));

    // ── Step 6: Upload PDF ────────────────────────────────────────────────
    const pdfUrl = await uploadPDFToGoogleDrive(pdfBuffer, `${newDebitUID}_Debit.pdf`);
    console.log(`[DEBIT] PDF uploaded: ${pdfUrl}`);

    // ── Step 7: Update ALL matched rows with SAME data ────────────────────
    const batchData = [];

    for (const row of matchedRows) {
      const r = row.actualRowIndex;
      batchData.push(
        { range: `Contractor_Material_Debit!AC${r}`, values: [[actualDate]] },
        { range: `Contractor_Material_Debit!AD${r}`, values: [[status]] },
        { range: `Contractor_Material_Debit!AE${r}`, values: [[newDebitUID]] },
        { range: `Contractor_Material_Debit!AF${r}`, values: [[pdfUrl]] },
      );
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: DebitID,
      resource: { valueInputOption: 'USER_ENTERED', data: batchData },
    });

    console.log(`[DEBIT] ✓ Updated ${matchedRows.length} rows with UID: ${newDebitUID}`);
    console.log(`[DEBIT] ═══════════════════════════════════════════════════\n`);

    res.json({
      success: true,
      message: `${matchedRows.length} materials from ${Object.keys(poMaterialCount).length} PO(s) updated successfully`,
      data: {
        debitUID: newDebitUID,
        pdfUrl,
        totalMaterials: matchedRows.length,
        totalPOs: Object.keys(poMaterialCount).length,
        poSummary: poMaterialCount,
        updatedRows: matchedRows.map(r => ({
          row: r.actualRowIndex,
          poNo: r.poNo,
          poDate: r.poDate,
          material: r.materialName
        }))
      }
    });

  } catch (error) {
    console.error('[DEBIT] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;