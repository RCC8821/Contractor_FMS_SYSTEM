// const express = require('express');
// const { sheets, drive, DebitID } = require('../../config/googleSheet');
// const { Readable } = require('stream');
// const router = express.Router();

// const { jsPDF } = require('jspdf');
// const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');
// console.log('jsPDF and jspdf-autotable loaded successfully for Labour Debit');

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
// function generateLabourDebitPDF(selectedRows, debitUID, actualDate, status) {
//   const doc = new jsPDF();
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();

//   const clean = (val) =>
//     (val || 'N/A').toString().trim().replace(/[^\x20-\x7E]/g, '');

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
//   doc.text(
//     '310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026',
//     pageWidth / 2,
//     22,
//     { align: 'center' }
//   );
//   doc.text(
//     'Contact: 7869962504 | Email: mayank@rcinfrastructure.com',
//     pageWidth / 2,
//     28,
//     { align: 'center' }
//   );
//   doc.text('GST: 23ABHFR3130L1ZA', pageWidth / 2, 34, { align: 'center' });

//   doc.setDrawColor(200, 200, 200);
//   doc.setLineWidth(0.5);
//   doc.line(15, 38, pageWidth - 15, 38);

//   doc.setFontSize(15);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(220, 53, 69);
//   doc.text(
//     'CONTRACTOR LABOUR DEBIT REPORT',
//     pageWidth / 2,
//     50,
//     { align: 'center' }
//   );

//   doc.setDrawColor(220, 53, 69);
//   doc.setLineWidth(1);
//   doc.line(30, 53, pageWidth - 30, 53);

//   doc.setTextColor(0, 0, 0);
//   doc.setFontSize(10);

//   // ── Get Unique Values ───────────────────────────────────────────────────
//   const uniqueProjects = [
//     ...new Set(selectedRows.map((r) => clean(r.projectName))),
//   ];
//   const uniqueContractors = [
//     ...new Set(selectedRows.map((r) => clean(r.contractorName))),
//   ];
//   const uniqueWorkTypes = [
//     ...new Set(selectedRows.map((r) => clean(r.workType))),
//   ].filter((t) => t && t !== 'N/A');

//   const genDate = new Date()
//     .toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//     })
//     .replace(/ /g, '-');

//   // ── Info Section ────────────────────────────────────────────────────────
//   let infoY = 65;

//   let workTypeDisplay = 'N/A';
//   if (uniqueWorkTypes.length === 1) {
//     workTypeDisplay = uniqueWorkTypes[0];
//   } else if (uniqueWorkTypes.length > 1) {
//     workTypeDisplay = `${uniqueWorkTypes[0]} (+${uniqueWorkTypes.length - 1} more)`;
//   }

//   const infoLines = [
//     {
//       l: 'Project Name:',
//       v:
//         uniqueProjects.length > 1
//           ? `${uniqueProjects[0]} (+${uniqueProjects.length - 1} more)`
//           : uniqueProjects[0] || 'N/A',
//       l2: 'Debit UID:',
//       v2: debitUID,
//     },
//     {
//       l: 'Contractor:',
//       v:
//         uniqueContractors.length > 1
//           ? `${uniqueContractors[0]} (+${uniqueContractors.length - 1} more)`
//           : uniqueContractors[0] || 'N/A',
//       l2: 'Actual Date:',
//       v2: clean(actualDate),
//     },
//     {
//       l: 'Work Type:',
//       v: workTypeDisplay,
//       l2: 'Total Items:',
//       v2: `${selectedRows.length} Item(s)`,
//     },
//     {
//       l: 'Report Date:',
//       v: genDate,
//       l2: 'Status:',
//       v2: clean(status),
//     },
//   ];

//   infoLines.forEach(({ l, v, l2, v2 }) => {
//     doc.setFont('helvetica', 'bold');
//     doc.text(l, 15, infoY);
//     doc.setFont('helvetica', 'normal');
//     doc.text(v.substring(0, 40), 55, infoY);
//     doc.setFont('helvetica', 'bold');
//     doc.text(l2, 115, infoY);
//     doc.setFont('helvetica', 'normal');
//     doc.text(v2.substring(0, 30), 152, infoY);
//     infoY += 7;
//   });

//   // ── Labour Details Table ────────────────────────────────────────────────
//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(220, 53, 69);
//   doc.text('Labour Details', 15, infoY + 5);
//   doc.setTextColor(0, 0, 0);

//   const sortedRows = [...selectedRows].sort((a, b) =>
//     clean(a.projectName).localeCompare(clean(b.projectName))
//   );

//   const tableBody = sortedRows.map((row, i) => [
//     i + 1,
//     clean(row.projectName).substring(0, 18),
//     clean(row.workType).substring(0, 15),
//     clean(row.contractorName).substring(0, 15),
//     clean(row.labourCategory1),
//     clean(row.deployedLabour1),
//     clean(row.labourCategory2),
//     clean(row.deployedLabour2),
//     clean(row.companyHeadAmount),
//     clean(row.contractorHeadAmount),
//   ]);

//   // ── Totals ──────────────────────────────────────────────────────────────
//   const totalCompany = selectedRows.reduce((sum, r) => {
//     const n = parseFloat(
//       (r.companyHeadAmount || '').toString().replace(/,/g, '')
//     );
//     return sum + (isNaN(n) ? 0 : n);
//   }, 0);

//   const totalContractor = selectedRows.reduce((sum, r) => {
//     const n = parseFloat(
//       (r.contractorHeadAmount || '').toString().replace(/,/g, '')
//     );
//     return sum + (isNaN(n) ? 0 : n);
//   }, 0);

//   tableBody.push([
//     '',
//     '',
//     '',
//     'TOTAL',
//     '',
//     '',
//     '',
//     '',
//     totalCompany > 0
//       ? totalCompany.toLocaleString('en-IN', { maximumFractionDigits: 2 })
//       : '',
//     totalContractor > 0
//       ? totalContractor.toLocaleString('en-IN', { maximumFractionDigits: 2 })
//       : '',
//   ]);

//   autoTable(doc, {
//     head: [
//       [
//         'Sr.',
//         'Project',
//         'Work Type',
//         'Contractor',
//         'Labour Cat 1',
//         'Lab No 1',
//         'Labour Cat 2',
//         'Lab No 2',
//         'Co. Amt',
//         'Cont. Amt',
//       ],
//     ],
//     body: tableBody,
//     startY: infoY + 12,
//     theme: 'grid',
//     styles: { fontSize: 7.5, cellPadding: 2.5 },
//     headStyles: {
//       fillColor: [41, 128, 185],
//       textColor: [255, 255, 255],
//       fontStyle: 'bold',
//     },
//     columnStyles: {
//       0: { halign: 'center', cellWidth: 8 },
//       1: { cellWidth: 28 },
//       2: { cellWidth: 22 },
//       3: { cellWidth: 22 },
//       4: { cellWidth: 22 },
//       5: { halign: 'center', cellWidth: 14 },
//       6: { cellWidth: 22 },
//       7: { halign: 'center', cellWidth: 14 },
//       8: { halign: 'right', cellWidth: 20 },
//       9: { halign: 'right', cellWidth: 20 },
//     },
//     didParseCell: function (data) {
//       if (data.row.index === tableBody.length - 1) {
//         data.cell.styles.fontStyle = 'bold';
//         data.cell.styles.fillColor = [240, 240, 240];
//       }
//     },
//   });

//   const footerY = doc.internal.pageSize.getHeight() - 15;
//   doc.setFontSize(8);
//   doc.setFont('helvetica', 'italic');
//   doc.setTextColor(128, 128, 128);
//   doc.text(
//     `Generated on: ${new Date().toLocaleString('en-IN')} | ${debitUID}`,
//     pageWidth / 2,
//     footerY,
//     { align: 'center' }
//   );

//   return doc.output('arraybuffer');
// }

// // ─── Helper: Generate Next Available UID ──────────────────────────────────────
// function getNextAvailableUID(existingUIDs) {
//   const existingNums = existingUIDs
//     .filter((v) => v && v.toString().trim().startsWith('LDBT'))
//     .map((v) => parseInt(v.toString().replace('LDBT', ''), 10))
//     .filter((n) => !isNaN(n));

//   console.log(
//     `[UID] Existing Labour UIDs: ${
//       existingNums.length > 0
//         ? [...new Set(existingNums)].sort((a, b) => a - b).join(', ')
//         : 'None'
//     }`
//   );

//   let newDebitNum;

//   if (existingNums.length === 0) {
//     newDebitNum = 1;
//   } else {
//     const sortedNums = [...new Set(existingNums)].sort((a, b) => a - b);
//     const maxNum = sortedNums[sortedNums.length - 1];

//     newDebitNum = null;
//     for (let i = 1; i <= maxNum; i++) {
//       if (!sortedNums.includes(i)) {
//         newDebitNum = i;
//         console.log(`[UID] Found missing slot: ${i}`);
//         break;
//       }
//     }

//     if (newDebitNum === null) {
//       newDebitNum = maxNum + 1;
//     }
//   }

//   const newDebitUID = `LDBT${String(newDebitNum).padStart(3, '0')}`;
//   console.log(`[UID] Generated: ${newDebitUID}`);

//   return newDebitUID;
// }

// // ════════════════════════════════════════════════════════════════════════════
// // GET - Fetch Labour Debit Data
// // ════════════════════════════════════════════════════════════════════════════

// router.get('/Contractor_Labour_Debit', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: DebitID,
//       range: 'Contractor_Labour_Debit!A3:P',
//     });

//     const dataRows = response.data.values || [];

//     const mappedData = dataRows.map((row, index) => ({
//       rowIndex: index + 3, // A3 se start
//       timestamp:                    row[0]  || '',
//       UID:                          row[1]  || '',
//       projectName:                  row[2]  || '',
//       workType:                     row[3]  || '',
//       workDescription:              row[4]  || '',
//       dateOfRequired:               row[5]  || '',
//       approvedHead:                 row[6]  || '',
//       contractorName:               row[7]  || '',
//       contractorFirmName:           row[8]  || '',
//       labourContractorName:         row[9]  || '',
//       labourCategory1:              row[10] || '',
//       deployedLabour1:              row[11] || '',
//       labourCategory2:              row[12] || '',
//       deployedLabour2:              row[13] || '',
//       companyHeadAmount:            row[14] || '',
//       contractorHeadAmount:         row[15] || '',
//     }));

//     console.log('Labour Debit - Mapped first 5 rows:', mappedData.slice(0, 5));

//     // ── Filter: must have contractorName, skip already processed ─────────
//     const filteredData = mappedData.filter((row) => {
//       const contractorName = String(row.contractorName || '').trim();
//       const uid = String(row.UID || '').trim().toLowerCase();

//       // keep rows that have a contractor name
//       // and have NOT yet been assigned a debit UID (LDBT...)
//       return contractorName !== '' && !uid.startsWith('ldbt');
//     });

//     console.log(`Labour Debit - Filtered data count: ${filteredData.length}`);

//     res.json({ success: true, data: filteredData });
//   } catch (error) {
//     console.error('Labour Debit GET Error:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch data' });
//   }
// });

// // ════════════════════════════════════════════════════════════════════════════
// // POST - Submit Labour Debit
// // ════════════════════════════════════════════════════════════════════════════
// router.post('/Contractor_Labour_Debit', async (req, res) => {
//   try {
//     const { selectedRows, status, totalAmount } = req.body;

//     if (!Array.isArray(selectedRows) || selectedRows.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, error: 'selectedRows required' });
//     }
//     if (!status) {
//       return res
//         .status(400)
//         .json({ success: false, error: 'status required' });
//     }

//     const now = new Date();
//     const currentDateTime = `${String(now.getDate()).padStart(2, '0')}/${String(
//       now.getMonth() + 1
//     ).padStart(2, '0')}/${now.getFullYear()} ${String(
//       now.getHours()
//     ).padStart(2, '0')}:${String(now.getMinutes()).padStart(
//       2,
//       '0'
//     )}:${String(now.getSeconds()).padStart(2, '0')}`;

//     const frontendTotalAmount = totalAmount || 0;

//     console.log(
//       `\n[LABOUR DEBIT] ═══════════════════════════════════════════════════`
//     );
//     console.log(`[LABOUR DEBIT] DateTime      : ${currentDateTime}`);
//     console.log(`[LABOUR DEBIT] Total Amount  : ₹${frontendTotalAmount}`);
//     console.log(
//       `[LABOUR DEBIT] Selected Rows : ${selectedRows.length}`
//     );

//     const selectedRowIndices = selectedRows.map((r) => r.rowIndex);
//     console.log(
//       `[LABOUR DEBIT] Row Indices   : ${selectedRowIndices.join(', ')}`
//     );

//     // ── Fetch Full Sheet ──────────────────────────────────────────────────
//     const sheetResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId: DebitID,
//       range: 'Contractor_Labour_Debit!A:P',
//     });

//     const allRows = sheetResponse.data.values || [];
//     console.log(`[LABOUR DEBIT] Sheet total rows: ${allRows.length}`);

//     // ── Match Selected Rows ───────────────────────────────────────────────
//     const matchedRows = [];

//     for (const rowIndex of selectedRowIndices) {
//       const sheetRowIndex = rowIndex - 1; // 0-based

//       if (sheetRowIndex >= 0 && sheetRowIndex < allRows.length) {
//         const row = allRows[sheetRowIndex];

//         // Check col B (index 1) - if already has LDBT uid, skip
//         const existingUID = (row[1] || '').toString().trim().toLowerCase();
//         if (existingUID.startsWith('ldbt')) {
//           console.log(
//             `[SKIP] Row ${rowIndex}: Already processed (UID: ${row[1]})`
//           );
//           continue;
//         }

//         console.log(
//           `[MATCH] ✓ Row ${rowIndex}: Project="${row[2]}" | Contractor="${row[7]}" | WorkType="${row[3]}"`
//         );

//         matchedRows.push({
//           actualRowIndex:       rowIndex,
//           projectName:          row[2]  || '',
//           workType:             row[3]  || '',
//           workDescription:      row[4]  || '',
//           dateOfRequired:       row[5]  || '',
//           approvedHead:         row[6]  || '',
//           contractorName:       row[7]  || '',
//           contractorFirmName:   row[8]  || '',
//           labourContractorName: row[9]  || '',
//           labourCategory1:      row[10] || '',
//           deployedLabour1:      row[11] || '',
//           labourCategory2:      row[12] || '',
//           deployedLabour2:      row[13] || '',
//           companyHeadAmount:    row[14] || '',
//           contractorHeadAmount: row[15] || '',
//         });
//       } else {
//         console.log(`[ERROR] Row ${rowIndex}: Invalid index`);
//       }
//     }

//     console.log(
//       `[LABOUR DEBIT] Matched ${matchedRows.length} / ${selectedRows.length} rows`
//     );

//     if (matchedRows.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'No valid rows found to process',
//         hint: 'Selected rows may already be processed',
//       });
//     }

//     // ── Get Existing UIDs from col B ──────────────────────────────────────
//     const uidResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId: DebitID,
//       range: 'Contractor_Labour_Debit!B:B',
//     });

//     const allUIDs = (uidResponse.data.values || []).flat();
//     const newDebitUID = getNextAvailableUID(allUIDs);

//     // ── Generate PDF ──────────────────────────────────────────────────────
//     console.log(
//       `[LABOUR DEBIT] Generating PDF for ${matchedRows.length} items...`
//     );
//     const pdfBuffer = Buffer.from(
//       generateLabourDebitPDF(matchedRows, newDebitUID, currentDateTime, status)
//     );

//     // ── Upload PDF ────────────────────────────────────────────────────────
//     const pdfUrl = await uploadPDFToGoogleDrive(
//       pdfBuffer,
//       `${newDebitUID}_Labour_Debit.pdf`
//     );
//     console.log(`[LABOUR DEBIT] PDF uploaded: ${pdfUrl}`);

//     // ── Batch Update Sheet (write back to same columns) ───────────────────
//     // We write:
//     //   col B  (index 1)  → newDebitUID
//     //   col Q  (index 16) → currentDateTime  (first free column after P)
//     //   col R  (index 17) → status
//     //   col S  (index 18) → pdfUrl
//     //   col T  (index 19) → frontendTotalAmount

//     const batchData = [];

//     for (const row of matchedRows) {
//       const r = row.actualRowIndex;

//       batchData.push(
//         {
//           range: `Contractor_Labour_Debit!U${r}`,
//           values: [[newDebitUID]],
//         },
//         {
//           range: `Contractor_Labour_Debit!S${r}`,
//           values: [[currentDateTime]],
//         },
//         {
//           range: `Contractor_Labour_Debit!T${r}`,
//           values: [[status]],
//         },
//         {
//           range: `Contractor_Labour_Debit!V${r}`,
//           values: [[pdfUrl]],
//         },
//         {
//           range: `Contractor_Labour_Debit!W${r}`,
//           values: [[frontendTotalAmount]],
//         }
//       );
//     }

//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId: DebitID,
//       resource: { valueInputOption: 'USER_ENTERED', data: batchData },
//     });

//     const uniqueContractors = [
//       ...new Set(matchedRows.map((r) => r.contractorName)),
//     ];

//     console.log(
//       `[LABOUR DEBIT] ✓ Updated ${matchedRows.length} rows | UID: ${newDebitUID}`
//     );
//     console.log(
//       `[LABOUR DEBIT] ✓ Contractors: ${uniqueContractors.join(', ')}`
//     );
//     console.log(
//       `[LABOUR DEBIT] ═══════════════════════════════════════════════════\n`
//     );

//     res.json({
//       success: true,
//       message: `${matchedRows.length} labour items updated successfully`,
//       data: {
//         debitUID:              newDebitUID,
//         pdfUrl,
//         dateTime:              currentDateTime,
//         totalItems:            matchedRows.length,
//         totalContractors:      uniqueContractors.length,
//         totalAmount:           frontendTotalAmount,
//         totalAmountFormatted: `₹${Number(frontendTotalAmount).toLocaleString('en-IN')}`,
//         updatedRows: matchedRows.map((r) => ({
//           row:            r.actualRowIndex,
//           contractor:     r.contractorName,
//           project:        r.projectName,
//           workType:       r.workType,
//         })),
//       },
//     });
//   } catch (error) {
//     console.error('[LABOUR DEBIT] Error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// module.exports = router;







const express = require('express');
const { sheets, drive, DebitID } = require('../../config/googleSheet');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');
const router = express.Router();

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


// ─── Helper: Generate PDF (PDFKit - Landscape) ───────────────────────────────
// function generateLabourDebitPDF(selectedRows, debitUID, actualDate, status) {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
//     const buffers = [];

//     doc.on('data', chunk => buffers.push(chunk));
//     doc.on('end', () => resolve(Buffer.concat(buffers)));
//     doc.on('error', reject);

//     const pageWidth    = 841.89;
//     const margin       = 40;
//     const contentWidth = pageWidth - margin * 2;

//     const clean = (val) =>
//       (val || 'N/A').toString().trim().replace(/[^\x20-\x7E]/g, '');

//     const cleanNum = val => {
//       if (val == null || val === '') return 0;
//       const cleaned = val.toString().replace(/[^0-9.-]/g, '');
//       return parseFloat(cleaned) || 0;
//     };

//     // ─── Company Header ──────────────────────────────────────────────────
//     doc.fontSize(16).font('Helvetica-Bold')
//       .text('R.C.C Infrastructures', margin, 30, {
//         align: 'center', width: contentWidth
//       });

//     doc.fontSize(8).font('Helvetica')
//       .text(
//         '310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026',
//         margin, doc.y + 2,
//         { align: 'center', width: contentWidth }
//       );

//     doc.fontSize(8).font('Helvetica')
//       .text(
//         'Contact: 7869962504 | Email: mayank@rcinfrastructure.com | GST: 23ABHFR3130L1ZA',
//         margin, doc.y + 2,
//         { align: 'center', width: contentWidth }
//       );

//     doc.moveDown(0.4);

//     // ─── Title ───────────────────────────────────────────────────────────
//     doc.fontSize(13).font('Helvetica-Bold')
//       .text('CONTRACTOR LABOUR DEBIT REPORT', margin, doc.y, {
//         align: 'center', width: contentWidth
//       });

//     // ─── Debit Note Badge (RED) ──────────────────────────────────────────
//     doc.moveDown(0.3);

//     const debitText     = 'Debit Note';
//     const debitFontSize = 12;
//     doc.fontSize(debitFontSize).font('Helvetica-Bold');
//     const textWidth  = doc.widthOfString(debitText);
//     const textHeight = doc.currentLineHeight();
//     const textX      = margin + (contentWidth - textWidth) / 2;
//     const textY      = doc.y;
//     const padX       = 12;
//     const padY       = 4;

//     doc.save();
//     doc.roundedRect(
//       textX - padX,
//       textY - padY,
//       textWidth + padX * 2,
//       textHeight + padY * 2,
//       4
//     ).fill('#DC2626');

//     doc.fillColor('#FFFFFF')
//       .fontSize(debitFontSize)
//       .font('Helvetica-Bold')
//       .text(debitText, textX, textY, {
//         width: textWidth, align: 'center', lineBreak: false,
//       });
//     doc.restore();
//     doc.fillColor('#000000');

//     doc.moveDown(0.5);

//     // ─── Divider ─────────────────────────────────────────────────────────
//     doc.moveTo(margin, doc.y)
//       .lineTo(margin + contentWidth, doc.y)
//       .lineWidth(1).stroke();
//     doc.moveDown(0.4);

//     // ─── Info Section ────────────────────────────────────────────────────
//     const headerStartY = doc.y;
//     const col1X        = margin;
//     const col2X        = margin + contentWidth / 2;
//     const labelWidth   = 140;
//     const valueWidth   = 200;
//     const lineHeight   = 16;

//     const uniqueProjects = [
//       ...new Set(selectedRows.map(r => clean(r.projectName)))
//     ];
//     const uniqueContractors = [
//       ...new Set(selectedRows.map(r => clean(r.contractorName)))
//     ];

//     const genDate = new Date()
//       .toLocaleDateString('en-GB', {
//         day: '2-digit', month: 'short', year: 'numeric'
//       })
//       .replace(/ /g, '-');

//     const headerField = (label, value, x, y) => {
//       doc.fontSize(8.5).font('Helvetica-Bold')
//         .text(`${label} :`, x, y, {
//           width: labelWidth, lineBreak: false, ellipsis: false,
//         });
//       doc.fontSize(8.5).font('Helvetica')
//         .text(value || '-', x + labelWidth + 4, y, {
//           width: valueWidth, lineBreak: false, ellipsis: true,
//         });
//     };

//     const projectDisplay = uniqueProjects.length > 1
//       ? `${uniqueProjects[0]} (+${uniqueProjects.length - 1} more)`
//       : uniqueProjects[0] || 'N/A';

//     const contractorDisplay = uniqueContractors.length > 1
//       ? `${uniqueContractors[0]} (+${uniqueContractors.length - 1} more)`
//       : uniqueContractors[0] || 'N/A';

//     // Row 1
//     headerField('Project Name',  projectDisplay,                    col1X, headerStartY);
//     headerField('Debit UID',     debitUID,                          col2X, headerStartY);
//     // Row 2
//     headerField('Contractor',    contractorDisplay,                 col1X, headerStartY + lineHeight);
//     headerField('Report Date',   genDate,                           col2X, headerStartY + lineHeight);
//     // Row 3
//     headerField('Total Items',   `${selectedRows.length} Item(s)`,  col1X, headerStartY + lineHeight * 2);

//     const tableStartY = headerStartY + lineHeight * 2 + 28;

//     doc.moveTo(margin, tableStartY - 8)
//       .lineTo(margin + contentWidth, tableStartY - 8)
//       .lineWidth(0.5).stroke();

//     // ─── Table Columns ────────────────────────────────────────────────────
//     const columns = [
//       { label: 'Sr.\nNo.',           width: 30  },
//       { label: 'Date\nRequired',     width: 70  },
//       { label: 'Work\nDescription',  width: 210 },
//       { label: 'Contractor\nName',   width: 100 },
//       { label: 'Labour\nCategory 1', width: 80  },
//       { label: 'Deployed\nLabour 1', width: 55  },
//       { label: 'Labour\nCategory 2', width: 80  },
//       { label: 'Deployed\nLabour 2', width: 55  },
//       { label: 'Contractor\nHead Amt',  width: 82  },
//     ];

//     const headerHeight = 30;
//     const minRowHeight = 22;
//     const tableX       = margin;
//     let   tableY       = tableStartY;

//     // ─── Table Header Row ─────────────────────────────────────────────────
//     let cx = tableX;
//     columns.forEach(col => {
//       doc.rect(cx, tableY, col.width, headerHeight)
//         .fillAndStroke('#1a3c6e', '#000000');
//       doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
//         .text(col.label, cx + 2, tableY + 4, {
//           width: col.width - 4, align: 'center', lineGap: 1,
//         });
//       doc.fillColor('#000000');
//       cx += col.width;
//     });

//     tableY += headerHeight;

//     // ─── Sort Rows ────────────────────────────────────────────────────────
//     const sortedRows = [...selectedRows].sort((a, b) =>
//       clean(a.dateOfRequired).localeCompare(clean(b.dateOfRequired))
//     );

//     // ─── Data Rows (DYNAMIC HEIGHT) ──────────────────────────────────────
//     sortedRows.forEach((row, i) => {
//       const companyAmt = cleanNum(row.companyHeadAmount);

//       const rowData = [
//         (i + 1).toString(),
//         clean(row.dateOfRequired),
//         clean(row.workDescription),
//         clean(row.contractorName),
//         clean(row.labourCategory1),
//         clean(row.deployedLabour1),
//         clean(row.labourCategory2),
//         clean(row.deployedLabour2),
//         companyAmt > 0 ? companyAmt.toFixed(2) : '-',
//       ];

//       // ✅ Calculate dynamic row height based on text content
//       doc.fontSize(9.5).font('Helvetica');

//       let maxHeight = minRowHeight;

//       rowData.forEach((cell, j) => {
//         const cellText  = String(cell);
//         const cellWidth = columns[j].width - 4;

//         const textHeight = doc.heightOfString(cellText, {
//           width: cellWidth,
//           align: j === 2 ? 'left' : 'center',
//         });

//         const requiredHeight = textHeight + 12; // padding
//         if (requiredHeight > maxHeight) {
//           maxHeight = requiredHeight;
//         }
//       });

//       const bgColor = i % 2 === 0 ? '#f0f5ff' : '#ffffff';
//       cx = tableX;

//       rowData.forEach((cell, j) => {
//         // ✅ Use dynamic maxHeight
//         doc.rect(cx, tableY, columns[j].width, maxHeight)
//           .fillAndStroke(bgColor, '#cccccc');

//         // ✅ Work Description = left align, baaki center
//         const alignStyle = j === 2 ? 'left' : 'center';

//         doc.fillColor('#000000').fontSize(9.5).font('Helvetica')
//           .text(String(cell), cx + 2, tableY + 6, {
//             width:     columns[j].width - 4,
//             align:     alignStyle,
//             lineBreak: true, // ✅ Text wrap allow
//           });
//         cx += columns[j].width;
//       });

//       tableY += maxHeight; // ✅ Dynamic height add
//     });

//     // ─── Total Row ────────────────────────────────────────────────────────
//     const totalCompanyHead = selectedRows.reduce(
//       (s, r) => s + cleanNum(r.companyHeadAmount), 0
//     );

//     const totalRowData = [
//       '', '', '', '', '', '', '', '',
//       totalCompanyHead.toFixed(2),
//     ];

//     cx = tableX;
//     totalRowData.forEach((cell, j) => {
//       doc.rect(cx, tableY, columns[j].width, minRowHeight)
//         .fillAndStroke('#cfe2ff', '#000000');
//       doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold')
//         .text(cell || '', cx + 2, tableY + 7, {
//           width: columns[j].width - 4, align: 'center', lineBreak: false,
//         });
//       cx += columns[j].width;
//     });

//     tableY += minRowHeight + 12;

//     // ─── Summary Box ──────────────────────────────────────────────────────
//     const boxWidth = 290;
//     const boxX     = margin + contentWidth - boxWidth;
//     const boxRowH  = 22;

//     doc.rect(boxX, tableY, boxWidth / 2, boxRowH)
//       .fillAndStroke('#0d2b4e', '#000000');
//     doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold')
//       .text('Total Company Head Amt', boxX + 5, tableY + 6, {
//         width: boxWidth / 2 - 10, align: 'left', lineBreak: false,
//       });

//     doc.rect(boxX + boxWidth / 2, tableY, boxWidth / 2, boxRowH)
//       .fillAndStroke('#cfe2ff', '#000000');
//     doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold')
//       .text(totalCompanyHead.toFixed(2), boxX + boxWidth / 2 + 5, tableY + 5, {
//         width: boxWidth / 2 - 10, align: 'right', lineBreak: false,
//       });

//     tableY += boxRowH + 30;

//     // ─── Signatures ──────────────────────────────────────────────────────
//     doc.fontSize(9).font('Helvetica-Bold')
//       .text('Prepared By: _____________________', margin,       tableY)
//       .text('Checked By:  _____________________', margin + 240, tableY)
//       .text('Approved By: _____________________', margin + 490, tableY);

//     // ─── Footer ──────────────────────────────────────────────────────────
//     doc.fontSize(8).font('Helvetica-Oblique')
//       .fillColor('#808080')
//       .text(
//         `Generated on: ${new Date().toLocaleString('en-IN')} | ${debitUID}`,
//         margin, 555,
//         { align: 'center', width: contentWidth }
//       );
//     doc.fillColor('#000000');

//     doc.end();
//   });
// }


function generateLabourDebitPDF(selectedRows, debitUID, actualDate, status) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      margin: 40, 
      size: 'A4', 
      layout: 'landscape',
      autoFirstPage: true,
      bufferPages: true  // ✅ Buffer pages enable - footer baad me add karenge
    });
    
    const buffers = [];
    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth    = 841.89;
    const pageHeight   = 595.28; // ✅ A4 Landscape height
    const margin       = 40;
    const contentWidth = pageWidth - margin * 2;
    const footerHeight = 30; // ✅ Footer ke liye reserved space
    const bottomMargin = margin + footerHeight; // ✅ Content yahan tak hi jayega

    const clean = (val) =>
      (val || 'N/A').toString().trim().replace(/[^\x20-\x7E]/g, '');

    const cleanNum = val => {
      if (val == null || val === '') return 0;
      const cleaned = val.toString().replace(/[^0-9.-]/g, '');
      return parseFloat(cleaned) || 0;
    };

    // ✅ Footer draw karne ka function - har page pe call hoga
    const drawFooter = (pageNum, totalPages) => {
      doc.fontSize(8).font('Helvetica-Oblique')
        .fillColor('#808080')
        // .text(
        //   // `Generated on: ${new Date().toLocaleString('en-IN')} | ${debitUID} | Page ${pageNum} of ${totalPages}`,
        //   margin, 
        //   pageHeight - 25, // ✅ Fixed position - page ke bilkul neeche
        //   { align: 'center', width: contentWidth, lineBreak: false }
        // );
      doc.fillColor('#000000');
    };

    // ✅ Header draw karne ka function - har page pe call hoga
    const drawPageHeader = () => {
      // Company Header
      doc.fontSize(16).font('Helvetica-Bold')
        .text('R.C.C Infrastructures', margin, 30, {
          align: 'center', width: contentWidth
        });

      doc.fontSize(8).font('Helvetica')
        .text(
          '310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026',
          margin, doc.y + 2,
          { align: 'center', width: contentWidth }
        );

      doc.fontSize(8).font('Helvetica')
        .text(
          'Contact: 7869962504 | Email: mayank@rcinfrastructure.com | GST: 23ABHFR3130L1ZA',
          margin, doc.y + 2,
          { align: 'center', width: contentWidth }
        );

      doc.moveDown(0.4);

      // Title
      doc.fontSize(13).font('Helvetica-Bold')
        .text('CONTRACTOR LABOUR DEBIT REPORT', margin, doc.y, {
          align: 'center', width: contentWidth
        });

      // Debit Note Badge (RED)
      doc.moveDown(0.3);

      const debitText     = 'Debit Note';
      const debitFontSize = 12;
      doc.fontSize(debitFontSize).font('Helvetica-Bold');
      const textWidth  = doc.widthOfString(debitText);
      const textHeight = doc.currentLineHeight();
      const textX      = margin + (contentWidth - textWidth) / 2;
      const textY      = doc.y;
      const padX       = 12;
      const padY       = 4;

      doc.save();
      doc.roundedRect(
        textX - padX,
        textY - padY,
        textWidth + padX * 2,
        textHeight + padY * 2,
        4
      ).fill('#DC2626');

      doc.fillColor('#FFFFFF')
        .fontSize(debitFontSize)
        .font('Helvetica-Bold')
        .text(debitText, textX, textY, {
          width: textWidth, align: 'center', lineBreak: false,
        });
      doc.restore();
      doc.fillColor('#000000');

      doc.moveDown(0.5);

      // Divider
      doc.moveTo(margin, doc.y)
        .lineTo(margin + contentWidth, doc.y)
        .lineWidth(1).stroke();
      doc.moveDown(0.4);
    };

    // ✅ Info Section draw karne ka function (sirf pehle page pe)
    const drawInfoSection = () => {
      const headerStartY = doc.y;
      const col1X        = margin;
      const col2X        = margin + contentWidth / 2;
      const labelWidth   = 140;
      const valueWidth   = 200;
      const lineHeight   = 16;

      const uniqueProjects = [
        ...new Set(selectedRows.map(r => clean(r.projectName)))
      ];
      const uniqueContractors = [
        ...new Set(selectedRows.map(r => clean(r.contractorName)))
      ];

      const genDate = new Date()
        .toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        })
        .replace(/ /g, '-');

      const headerField = (label, value, x, y) => {
        doc.fontSize(8.5).font('Helvetica-Bold')
          .text(`${label} :`, x, y, {
            width: labelWidth, lineBreak: false, ellipsis: false,
          });
        doc.fontSize(8.5).font('Helvetica')
          .text(value || '-', x + labelWidth + 4, y, {
            width: valueWidth, lineBreak: false, ellipsis: true,
          });
      };

      const projectDisplay = uniqueProjects.length > 1
        ? `${uniqueProjects[0]} (+${uniqueProjects.length - 1} more)`
        : uniqueProjects[0] || 'N/A';

      const contractorDisplay = uniqueContractors.length > 1
        ? `${uniqueContractors[0]} (+${uniqueContractors.length - 1} more)`
        : uniqueContractors[0] || 'N/A';

      headerField('Project Name',  projectDisplay,                    col1X, headerStartY);
      headerField('Debit UID',     debitUID,                          col2X, headerStartY);
      headerField('Contractor',    contractorDisplay,                 col1X, headerStartY + lineHeight);
      headerField('Report Date',   genDate,                           col2X, headerStartY + lineHeight);
      headerField('Total Items',   `${selectedRows.length} Item(s)`,  col1X, headerStartY + lineHeight * 2);

      return headerStartY + lineHeight * 2 + 28;
    };

    // ─── Table Columns ────────────────────────────────────────────────────
    const columns = [
      { label: 'Sr.\nNo.',           width: 30  },
      { label: 'Date\nRequired',     width: 70  },
      { label: 'Work\nDescription',  width: 210 },
      { label: 'Contractor\nName',   width: 100 },
      { label: 'Labour\nCategory 1', width: 80  },
      { label: 'Deployed\nLabour 1', width: 55  },
      { label: 'Labour\nCategory 2', width: 80  },
      { label: 'Deployed\nLabour 2', width: 55  },
      { label: 'Contractor\nHead Amt',  width: 82  },
    ];

    const headerHeight = 30;
    const minRowHeight = 22;

    // ✅ Table Header draw karne ka function
    const drawTableHeader = (y) => {
      let cx = margin;
      columns.forEach(col => {
        doc.rect(cx, y, col.width, headerHeight)
          .fillAndStroke('#1a3c6e', '#000000');
        doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
          .text(col.label, cx + 2, y + 4, {
            width: col.width - 4, align: 'center', lineGap: 1,
          });
        doc.fillColor('#000000');
        cx += col.width;
      });
      return y + headerHeight;
    };

    // ════════════════════════════════════════════════════════════
    // ✅ PAGE 1 - Header + Info + Table Start
    // ════════════════════════════════════════════════════════════
    drawPageHeader();
    
    const tableStartY = drawInfoSection();

    // Info section ke baad divider
    doc.moveTo(margin, tableStartY - 8)
      .lineTo(margin + contentWidth, tableStartY - 8)
      .lineWidth(0.5).stroke();

    let tableY = drawTableHeader(tableStartY);

    // Sort rows
    const sortedRows = [...selectedRows].sort((a, b) =>
      clean(a.dateOfRequired).localeCompare(clean(b.dateOfRequired))
    );

    // ════════════════════════════════════════════════════════════
    // ✅ DATA ROWS - Page break handling ke saath
    // ════════════════════════════════════════════════════════════
    sortedRows.forEach((row, i) => {
      const companyAmt = cleanNum(row.companyHeadAmount);

      const rowData = [
        (i + 1).toString(),
        clean(row.dateOfRequired),
        clean(row.workDescription),
        clean(row.contractorName),
        clean(row.labourCategory1),
        clean(row.deployedLabour1),
        clean(row.labourCategory2),
        clean(row.deployedLabour2),
        companyAmt > 0 ? companyAmt.toFixed(2) : '-',
      ];

      // Dynamic row height calculate karo
      doc.fontSize(9.5).font('Helvetica');
      let maxHeight = minRowHeight;

      rowData.forEach((cell, j) => {
        const cellText  = String(cell);
        const cellWidth = columns[j].width - 4;
        const textHeight = doc.heightOfString(cellText, {
          width: cellWidth,
          align: j === 2 ? 'left' : 'center',
        });
        const requiredHeight = textHeight + 12;
        if (requiredHeight > maxHeight) maxHeight = requiredHeight;
      });

      // ✅ Check: kya is row ke liye page pe jagah hai?
      // Footer + Total row + Summary box ke liye bhi jagah chahiye
      const spaceNeededBelow = minRowHeight + 80; // total row + summary
      const availableSpace = pageHeight - bottomMargin - spaceNeededBelow;

      if (tableY + maxHeight > availableSpace) {
        // ✅ New page add karo
        doc.addPage();
        
        // Naye page pe compact header
        drawPageHeader();
        
        // Divider
        doc.moveTo(margin, doc.y)
          .lineTo(margin + contentWidth, doc.y)
          .lineWidth(0.5).stroke();
        doc.moveDown(0.3);

        // Table header repeat karo naye page pe
        tableY = drawTableHeader(doc.y);
      }

      // Row draw karo
      const bgColor = i % 2 === 0 ? '#f0f5ff' : '#ffffff';
      let cx = margin;

      rowData.forEach((cell, j) => {
        doc.rect(cx, tableY, columns[j].width, maxHeight)
          .fillAndStroke(bgColor, '#cccccc');

        const alignStyle = j === 2 ? 'left' : 'center';

        doc.fillColor('#000000').fontSize(9.5).font('Helvetica')
          .text(String(cell), cx + 2, tableY + 6, {
            width:     columns[j].width - 4,
            align:     alignStyle,
            lineBreak: true,
          });
        cx += columns[j].width;
      });

      tableY += maxHeight;
    });

    // ════════════════════════════════════════════════════════════
    // ✅ Total Row + Summary - Check karo page pe fit ho
    // ════════════════════════════════════════════════════════════
    const summaryHeight = minRowHeight + 22 + 30 + 20; // total + box + signatures
    
    if (tableY + summaryHeight > pageHeight - bottomMargin) {
      doc.addPage();
      drawPageHeader();
      doc.moveTo(margin, doc.y)
        .lineTo(margin + contentWidth, doc.y)
        .lineWidth(0.5).stroke();
      doc.moveDown(0.3);
      tableY = doc.y;
    }

    // ─── Total Row ────────────────────────────────────────────────────────
    const totalCompanyHead = selectedRows.reduce(
      (s, r) => s + cleanNum(r.companyHeadAmount), 0
    );

    const totalRowData = [
      '', '', '', '', '', '', '', '',
      totalCompanyHead.toFixed(2),
    ];

    let cx = margin;
    totalRowData.forEach((cell, j) => {
      doc.rect(cx, tableY, columns[j].width, minRowHeight)
        .fillAndStroke('#cfe2ff', '#000000');
      doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold')
        .text(cell || '', cx + 2, tableY + 7, {
          width: columns[j].width - 4, align: 'center', lineBreak: false,
        });
      cx += columns[j].width;
    });

    tableY += minRowHeight + 12;

    // ─── Summary Box ──────────────────────────────────────────────────────
    const boxWidth = 290;
    const boxX     = margin + contentWidth - boxWidth;
    const boxRowH  = 22;

    doc.rect(boxX, tableY, boxWidth / 2, boxRowH)
      .fillAndStroke('#0d2b4e', '#000000');
    doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold')
      .text('Total Company Head Amt', boxX + 5, tableY + 6, {
        width: boxWidth / 2 - 10, align: 'left', lineBreak: false,
      });

    doc.rect(boxX + boxWidth / 2, tableY, boxWidth / 2, boxRowH)
      .fillAndStroke('#cfe2ff', '#000000');
    doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold')
      .text(totalCompanyHead.toFixed(2), boxX + boxWidth / 2 + 5, tableY + 5, {
        width: boxWidth / 2 - 10, align: 'right', lineBreak: false,
      });

    tableY += boxRowH + 30;

    // ─── Signatures ──────────────────────────────────────────────────────
    doc.fontSize(9).font('Helvetica-Bold')
      .text('Prepared By: _____________________', margin,       tableY)
      .text('Checked By:  _____________________', margin + 240, tableY)
      .text('Approved By: _____________________', margin + 490, tableY);

    // ════════════════════════════════════════════════════════════
    // ✅ FOOTER - bufferPages use karke SAHI footer add karo
    // ════════════════════════════════════════════════════════════
    const totalPages = doc.bufferedPageRange().count;
    
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      drawFooter(i + 1, totalPages);
    }

    doc.end();
  });
}


// ─── Helper: Generate Next Available UID (Column U se read karta hai) ─────────
async function getNextAvailableUID() {
  // ✅ Column U se read karo (jahan LDBT UIDs likhte hain)
  const uidResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: DebitID,
    range: 'Contractor_Labour_Debit!U:U',
  });

  const existingUIDs = (uidResponse.data.values || []).flat();

  console.log(
    '[UID] Raw UIDs from Column U:',
    existingUIDs.filter(v => v && v.toString().trim().startsWith('LDBT'))
  );

  const existingNums = existingUIDs
    .filter((v) => v && v.toString().trim().startsWith('LDBT'))
    .map((v) => parseInt(v.toString().replace('LDBT', ''), 10))
    .filter((n) => !isNaN(n));

  console.log(
    `[UID] Existing Labour UIDs: ${
      existingNums.length > 0
        ? [...new Set(existingNums)].sort((a, b) => a - b).join(', ')
        : 'None'
    }`
  );

  let newDebitNum;

  if (existingNums.length === 0) {
    newDebitNum = 1;
  } else {
    const sortedNums = [...new Set(existingNums)].sort((a, b) => a - b);
    const maxNum     = sortedNums[sortedNums.length - 1];

    newDebitNum = null;
    for (let i = 1; i <= maxNum; i++) {
      if (!sortedNums.includes(i)) {
        newDebitNum = i;
        console.log(`[UID] Found missing slot: ${i}`);
        break;
      }
    }

    if (newDebitNum === null) {
      newDebitNum = maxNum + 1;
    }
  }

  const newDebitUID = `LDBT${String(newDebitNum).padStart(3, '0')}`;
  console.log(`[UID] Generated: ${newDebitUID}`);

  return newDebitUID;
}

// ════════════════════════════════════════════════════════════════════════════
// GET - Fetch Labour Debit Data
// ════════════════════════════════════════════════════════════════════════════
router.get('/Contractor_Labour_Debit', async (req, res) => {
  try {
    // ✅ A3:W tak read karo taaki Column U (debitUID) bhi mile
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: DebitID,
      range: 'Contractor_Labour_Debit!A3:W',
    });

    const dataRows = response.data.values || [];

    const mappedData = dataRows.map((row, index) => ({
      rowIndex:             index + 3,
      timestamp:            row[0]  || '',
      UID:                  row[1]  || '',
      projectName:          row[2]  || '',
      workType:             row[3]  || '',
      workDescription:      row[4]  || '',
      dateOfRequired:       row[5]  || '',
      approvedHead:         row[6]  || '',
      contractorName:       row[7]  || '',
      contractorFirmName:   row[8]  || '',
      labourContractorName: row[9]  || '',
      labourCategory1:      row[10] || '',
      deployedLabour1:      row[11] || '',
      labourCategory2:      row[12] || '',
      deployedLabour2:      row[13] || '',
      companyHeadAmount:    row[14] || '',
      contractorHeadAmount: row[15] || '',
      status:               row[19] || '', // ✅ Column T = index 19
      debitUID:             row[20] || '', // ✅ Column U = index 20
    }));

    console.log('Labour Debit - Mapped first 5 rows:', mappedData.slice(0, 5));

    // ✅ Filter: contractorName ho + debitUID na ho + status "Done" na ho
    const filteredData = mappedData.filter((row) => {
      const contractorName = String(row.contractorName || '').trim();
      const debitUID       = String(row.debitUID || '').trim().toLowerCase();
      const status         = String(row.status || '').trim().toLowerCase();

      return (
        contractorName !== '' &&        // ✅ contractor name hona chahiye
        !debitUID.startsWith('ldbt') && // ✅ LDBT UID nahi hona chahiye
        status !== 'done'               // ✅ status "Done" nahi hona chahiye
      );
    });

    console.log(`Labour Debit - Filtered data count: ${filteredData.length}`);

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('Labour Debit GET Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// POST - Submit Labour Debit
// ════════════════════════════════════════════════════════════════════════════
router.post('/Contractor_Labour_Debit', async (req, res) => {
  try {
    const { selectedRows, status, totalAmount } = req.body;

    console.log('[DEBUG] Request received:', {
      selectedRowsCount: selectedRows?.length,
      status,
      totalAmount,
    });

    if (!Array.isArray(selectedRows) || selectedRows.length === 0) {
      return res.status(400).json({ success: false, error: 'selectedRows required' });
    }
    if (!status) {
      return res.status(400).json({ success: false, error: 'status required' });
    }

    const now             = new Date();
    const currentDateTime = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(
      now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()).padStart(2, '0')}:${String(
      now.getSeconds()).padStart(2, '0')}`;

    const frontendTotalAmount = totalAmount || 0;
    const selectedRowIndices  = selectedRows.map((r) => r.rowIndex);

    console.log(`\n[LABOUR DEBIT] ═══════════════════════════════════════`);
    console.log(`[LABOUR DEBIT] DateTime      : ${currentDateTime}`);
    console.log(`[LABOUR DEBIT] Total Amount  : ₹${frontendTotalAmount}`);
    console.log(`[LABOUR DEBIT] Selected Rows : ${selectedRows.length}`);
    console.log(`[LABOUR DEBIT] Row Indices   : ${selectedRowIndices.join(', ')}`);

    // ── Step 1: Fetch Full Sheet ──────────────────────────────────────────
    console.log('[DEBUG] Step 1: Fetching sheet...');
    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: DebitID,
      range: 'Contractor_Labour_Debit!A:W',
    });

    const allRows = sheetResponse.data.values || [];
    console.log(`[DEBUG] Step 2: Sheet fetched - ${allRows.length} rows`);

    // ── Step 2: Match Selected Rows ───────────────────────────────────────
    const matchedRows = [];

    for (const rowIndex of selectedRowIndices) {
      const sheetRowIndex = rowIndex - 1;

      if (sheetRowIndex >= 0 && sheetRowIndex < allRows.length) {
        const row = allRows[sheetRowIndex];

        // ✅ Column U (index 20) se check karo
        const existingDebitUID = (row[20] || '').toString().trim().toLowerCase();
        if (existingDebitUID.startsWith('ldbt')) {
          console.log(`[SKIP] Row ${rowIndex}: Already processed (UID: ${row[20]})`);
          continue;
        }

        console.log(
          `[MATCH] ✓ Row ${rowIndex}: Project="${row[2]}" | Contractor="${row[7]}"`
        );

        matchedRows.push({
          actualRowIndex:       rowIndex,
          projectName:          row[2]  || '',
          workType:             row[3]  || '',
          workDescription:      row[4]  || '',
          dateOfRequired:       row[5]  || '',
          approvedHead:         row[6]  || '',
          contractorName:       row[7]  || '',
          contractorFirmName:   row[8]  || '',
          labourContractorName: row[9]  || '',
          labourCategory1:      row[10] || '',
          deployedLabour1:      row[11] || '',
          labourCategory2:      row[12] || '',
          deployedLabour2:      row[13] || '',
          companyHeadAmount:    row[14] || '',
          contractorHeadAmount: row[15] || '',
        });
      } else {
        console.log(`[ERROR] Row ${rowIndex}: Invalid index`);
      }
    }

    console.log(`[DEBUG] Step 3: Matched ${matchedRows.length} rows`);

    if (matchedRows.length === 0) {
      return res.status(400).json({
        success: false,
        error:   'No valid rows found to process',
        hint:    'Selected rows may already be processed',
      });
    }

    // ── Step 3: Generate UID ──────────────────────────────────────────────
    console.log('[DEBUG] Step 4: Generating UID...');
    const newDebitUID = await getNextAvailableUID();
    console.log(`[DEBUG] Step 5: UID = ${newDebitUID} | Type = ${typeof newDebitUID}`);

    // ── Step 4: Generate PDF ──────────────────────────────────────────────
    console.log('[DEBUG] Step 6: Generating PDF...');
    const pdfBuffer = await generateLabourDebitPDF(
      matchedRows, newDebitUID, currentDateTime, status
    );
    console.log(`[DEBUG] Step 7: PDF ready - ${pdfBuffer.length} bytes`);

    // ── Step 5: Upload PDF ────────────────────────────────────────────────
    console.log('[DEBUG] Step 8: Uploading PDF...');
    const pdfUrl = await uploadPDFToGoogleDrive(
      pdfBuffer,
      `${newDebitUID}_Labour_Debit.pdf`
    );
    console.log(`[DEBUG] Step 9: PDF URL = ${pdfUrl}`);

    // ── Step 6: Batch Update Sheet ────────────────────────────────────────
    console.log('[DEBUG] Step 10: Updating sheet...');
    const batchData = [];

    for (const row of matchedRows) {
      const r = row.actualRowIndex;

      batchData.push(
        {
          range:  `Contractor_Labour_Debit!U${r}`,
          values: [[String(newDebitUID)]],          // ✅ String ensure
        },
        {
          range:  `Contractor_Labour_Debit!S${r}`,
          values: [[String(currentDateTime)]],      // ✅ String ensure
        },
        {
          range:  `Contractor_Labour_Debit!T${r}`,
          values: [[String(status)]],               // ✅ String ensure
        },
        {
          range:  `Contractor_Labour_Debit!V${r}`,
          values: [[String(pdfUrl)]],               // ✅ String ensure
        },
        {
          range:  `Contractor_Labour_Debit!W${r}`,
          values: [[String(frontendTotalAmount)]],  // ✅ String ensure
        }
      );
    }

    console.log('[DEBUG] Batch sample:', JSON.stringify(batchData[0]));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: DebitID,
      resource: { valueInputOption: 'USER_ENTERED', data: batchData },
    });

    console.log('[DEBUG] Step 11: Sheet updated!');

    const uniqueContractors = [
      ...new Set(matchedRows.map((r) => r.contractorName)),
    ];

    console.log(`[LABOUR DEBIT] ✓ Updated ${matchedRows.length} rows | UID: ${newDebitUID}`);
    console.log(`[LABOUR DEBIT] ✓ Contractors: ${uniqueContractors.join(', ')}`);
    console.log(`[LABOUR DEBIT] ═══════════════════════════════════════\n`);

    res.json({
      success: true,
      message: `${matchedRows.length} labour items updated successfully`,
      data: {
        debitUID:             newDebitUID,
        pdfUrl,
        dateTime:             currentDateTime,
        totalItems:           matchedRows.length,
        totalContractors:     uniqueContractors.length,
        totalAmount:          frontendTotalAmount,
        totalAmountFormatted: `₹${Number(frontendTotalAmount).toLocaleString('en-IN')}`,
        updatedRows: matchedRows.map((r) => ({
          row:        r.actualRowIndex,
          contractor: r.contractorName,
          project:    r.projectName,
          workType:   r.workType,
        })),
      },
    });

  } catch (error) {
    console.error('[LABOUR DEBIT] ❌ Error:', error.message);
    console.error('[LABOUR DEBIT] Stack:', error.stack);
    res.status(500).json({
      success: false,
      error:   error.message,
    });
  }
});

module.exports = router;