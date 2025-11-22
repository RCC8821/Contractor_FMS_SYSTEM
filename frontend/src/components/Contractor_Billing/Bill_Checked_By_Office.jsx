


// import React, { useState, useMemo, useEffect } from 'react';
// import { ChevronRight, FileText, Loader2, AlertCircle, CheckCircle, X, RefreshCw, Upload } from 'lucide-react';
// import {
//   useGetContractorBillCheckedOfficeQuery,
//   useGetEnquiryCaptureBillingOfficeQuery,
//   useSaveBillCheckedOfficeMutation
// } from '../../features/billing/billCheckedOfficeSlice';

// const Bill_Checked_By_Office = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     projectId: '', projectName: '', contractorFirm: '', contractorName: '', rccBillNo: ''
//   });
//   const [filteredData, setFilteredData] = useState([]);
//   const [editableData, setEditableData] = useState([]);

//   const [globalFiles, setGlobalFiles] = useState({
//     rccSummarySheetNo: '',
//     rccSummarySheetFile: null,
//     rccSummarySheetUrl: '',
//     workOrderFile: null,
//     workOrderUrl: ''
//   });
//   const [globalStatus, setGlobalStatus] = useState('');

//   const { 
//     data: billsData, 
//     isLoading: loadingBills, 
//     error: billsError, 
//     isError: isBillsError,
//     refetch 
//   } = useGetContractorBillCheckedOfficeQuery(null, { refetchOnMountOrArgChange: true });
//   const [saveBill, { isLoading: isSaving }] = useSaveBillCheckedOfficeMutation();

//   useEffect(() => { refetch(); }, [refetch]);

//   const normalize = (str) => String(str || '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '');

//   const projectOptions = useMemo(() => {
//     if (!billsData || billsData.length === 0) return [];
//     const unique = new Map();
//     billsData.forEach(bill => {
//       const key = normalize(bill.projectId);
//       if (key && !unique.has(key)) {
//         unique.set(key, { id: bill.projectId, name: bill.projectName || 'Unknown' });
//       }
//     });
//     return Array.from(unique.values());
//   }, [billsData]);

//   const contractorOptions = useMemo(() => {
//     if (!billsData || !formData.projectId) return [];
//     const unique = new Map();
//     billsData
//       .filter(bill => normalize(bill.projectId) === normalize(formData.projectId))
//       .forEach(bill => {
//         const key = normalize(bill.firmName);
//         if (key && !unique.has(key)) {
//           unique.set(key, { firm: bill.firmName, name: bill.contractorName || 'Unknown' });
//         }
//       });
//     return Array.from(unique.values());
//   }, [billsData, formData.projectId]);

//   const rccBillOptions = useMemo(() => {
//     if (!billsData || !formData.projectId || !formData.contractorFirm) return [];
//     const unique = new Set();
//     billsData
//       .filter(bill =>
//         normalize(bill.projectId) === normalize(formData.projectId) &&
//         normalize(bill.firmName) === normalize(formData.contractorFirm)
//       )
//       .forEach(bill => bill.rccBillNo && unique.add(bill.rccBillNo));
//     return Array.from(unique).map(no => ({ billNo: no }));
//   }, [billsData, formData.projectId, formData.contractorFirm]);

//   const unitOptions = ['Sqft', 'Nos', 'Point', 'Rft', 'Kg', 'Hours', 'KW', 'Ltr', 'Cum', 'RM'];
//   const gstRates = ['0%', '5%', '12%', '18%'];

//   const handleProjectIdChange = (e) => {
//     const id = e.target.value;
//     const selected = projectOptions.find(p => normalize(p.id) === normalize(id));
//     setFormData({
//       projectId: id,
//       projectName: selected?.name || '',
//       contractorFirm: '',
//       contractorName: '',
//       rccBillNo: ''
//     });
//   };

//   const handleContractorFirmChange = (e) => {
//     const firm = e.target.value;
//     const selected = contractorOptions.find(c => normalize(c.firm) === normalize(firm));
//     setFormData(prev => ({
//       ...prev,
//       contractorFirm: firm,
//       contractorName: selected?.name || '',
//       rccBillNo: ''
//     }));
//   };

//   const handleNext = () => {
//     if (!formData.projectId || !formData.contractorFirm || !formData.rccBillNo) {
//       alert('सभी फ़ील्ड भरें');
//       return;
//     }

//     const filter1 = billsData.filter(item =>
//       item.projectId === formData.projectId &&
//       item.firmName === formData.contractorFirm &&
//       item.rccBillNo === formData.rccBillNo
//     );

//     const filter2 = billsData.filter(item => 
//       normalize(item.projectId) === normalize(formData.projectId) &&
//       normalize(item.firmName) === normalize(formData.contractorFirm) &&
//       normalize(item.rccBillNo) === normalize(formData.rccBillNo)
//     );

//     const allMatchingRecords = filter1.length > 0 ? filter1 : filter2;

//     if (allMatchingRecords.length === 0) {
//       alert(`कोई बिल नहीं मिला`);
//       return;
//     }

//     setFilteredData(allMatchingRecords);
//     const newEditableData = {};
//     allMatchingRecords.forEach(item => {
//       newEditableData[item.UID] = {
//         uid: item.UID,
//         Final_Area_Quantity3: '',
//         Unit3: '',
//         RATE3: '',
//         AMOUNT3: '',
//         GST_PERCENT: '0%',
//         CGST3: '',
//         SGST3: '',
//         NET_AMOUNT3: '0.00'
//       };
//     });
//     setEditableData(newEditableData);
//     setStep(2);
//   };

//   const handleBack = () => {
//     setStep(1);
//     setFilteredData([]);
//     setEditableData([]);
//     setGlobalFiles({ rccSummarySheetNo: '', rccSummarySheetFile: null, rccSummarySheetUrl: '', workOrderFile: null, workOrderUrl: '' });
//     setGlobalStatus('');
//   };

//   const calculateRow = (row) => {
//     const qty = parseFloat(row.Final_Area_Quantity3) || 0;
//     const rate = parseFloat(row.RATE3) || 0;
//     const amount = qty * rate;
//     const gstPercent = parseFloat(row.GST_PERCENT) || 0;
//     const gstAmount = amount * (gstPercent / 100);
//     const cgst = gstAmount / 2;
//     const sgst = gstAmount / 2;
//     const net = amount + cgst + sgst;

//     return {
//       ...row,
//       AMOUNT3: amount.toFixed(2),
//       CGST3: cgst.toFixed(2),
//       SGST3: sgst.toFixed(2),
//       NET_AMOUNT3: net.toFixed(2)
//     };
//   };

//   const handleInputChange = (index, field, value) => {
//     const uid = filteredData[index].UID;
//     setEditableData(prev => {
//       const updated = { ...prev[uid], [field]: value };
//       return { ...prev, [uid]: calculateRow(updated) };
//     });
//   };

//   const handleFile = (file, type) => {
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setGlobalFiles(prev => ({
//         ...prev,
//         [type === 'rcc' ? 'rccSummarySheetFile' : 'workOrderFile']: file,
//         [type === 'rcc' ? 'rccSummarySheetUrl' : 'workOrderUrl']: reader.result
//       }));
//     };
//     reader.readAsDataURL(file);
//   };

//   const removeFile = (type) => {
//     setGlobalFiles(prev => ({
//       ...prev,
//       [type === 'rcc' ? 'rccSummarySheetFile' : 'workOrderFile']: null,
//       [type === 'rcc' ? 'rccSummarySheetUrl' : 'workOrderUrl']: ''
//     }));
//   };

//   const handleSubmitData = async () => {
//     if (!globalFiles.rccSummarySheetNo || !globalFiles.rccSummarySheetFile || !globalFiles.workOrderFile || !globalStatus) {
//       alert('सभी Global Inputs भरें');
//       return;
//     }

//     const payload = {
//       uids: filteredData.map(item => item.UID),
//       status: globalStatus,
//       Rcc_Summary_Sheet_No: globalFiles.rccSummarySheetNo,
//       Rcc_Summary_Sheet_Base64: globalFiles.rccSummarySheetUrl,
//       Work_Order_Base64: globalFiles.workOrderUrl,
//       items: filteredData.map(item => {
//         const d = editableData[item.UID];
//         return {
//           uid: item.UID,
//           Final_Area_Quantity3: d.Final_Area_Quantity3,
//           Unit3: d.Unit3,
//           RATE3: d.RATE3,
//           AMOUNT3: d.AMOUNT3,
//           CGST3: d.CGST3,
//           SGST3: d.SGST3,
//           NET_AMOUNT3: d.NET_AMOUNT3
//         };
//       })
//     };

//     try {
//       const result = await saveBill(payload).unwrap();
//       if (result?.success) {
//         alert(`Success! ${result.updated?.length || 0} records saved.`);
//         refetch();
//         setTimeout(() => handleBack(), 800);
//       }
//     } catch (err) {
//       alert('Error: ' + (err?.data?.message || 'Save failed'));
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
//             <FileText className="text-indigo-600" size={32} />
//             Bill Checked By Office
//           </h1>
//           <div className="flex items-center gap-2 mt-4">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>1</div>
//             <ChevronRight className="text-gray-400" size={20} />
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>2</div>
//           </div>
//         </div>

//         {loadingBills && (
//           <div className="bg-white rounded-lg shadow-md p-8 text-center py-16">
//             <Loader2 className="animate-spin mx-auto text-indigo-600" size={48} />
//             <p className="mt-4 text-gray-600">Bills लोड हो रहे...</p>
//           </div>
//         )}

//         {isBillsError && (
//           <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-center justify-between">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="text-red-500 mt-0.5" size={20} />
//               <div>
//                 <p className="font-semibold text-red-800">डेटा लोड नहीं हुआ</p>
//                 <p className="text-sm text-red-600">{billsError?.data?.message || 'कनेक्शन समस्या'}</p>
//               </div>
//             </div>
//             <button onClick={refetch} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
//               <RefreshCw size={16} /> Retry
//             </button>
//           </div>
//         )}

//         {step === 1 && !loadingBills && !isBillsError && (
//           <div className="bg-white rounded-lg shadow-md p-8">
//             <h2 className="text-2xl font-bold mb-6">Filter Bills</h2>
//             <div className="space-y-6">
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block font-semibold mb-2">Project ID *</label>
//                   <select value={formData.projectId} onChange={handleProjectIdChange} className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
//                     <option value="">Select Project</option>
//                     {projectOptions.map(p => (
//                       <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
//                     ))}
//                   </select>
//                   <p className="text-xs text-gray-500 mt-1">{projectOptions.length} projects</p>
//                 </div>
//                 <div>
//                   <label className="block font-semibold mb-2">Project Name</label>
//                   <input value={formData.projectName} readOnly className="w-full p-3 border bg-gray-50 rounded-lg" />
//                 </div>
//               </div>

//               <div className="grid md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block font-semibold mb-2">Contractor Firm *</label>
//                   <select
//                     value={formData.contractorFirm}
//                     onChange={handleContractorFirmChange}
//                     disabled={!formData.projectId}
//                     className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
//                   >
//                     <option value="">Select Contractor</option>
//                     {contractorOptions.map(c => (
//                       <option key={c.firm} value={c.firm}>{c.firm}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block font-semibold mb-2">Contractor Name</label>
//                   <input value={formData.contractorName} readOnly className="w-full p-3 border bg-gray-50 rounded-lg" />
//                 </div>
//               </div>

//               <div className="grid md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block font-semibold mb-2">RCC Bill No *</label>
//                   <select
//                     value={formData.rccBillNo}
//                     onChange={e => setFormData(prev => ({ ...prev, rccBillNo: e.target.value }))}
//                     disabled={!formData.contractorFirm}
//                     className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
//                   >
//                     <option value="">Select Bill No</option>
//                     {rccBillOptions.map(b => (
//                       <option key={b.billNo} value={b.billNo}>{b.billNo}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="flex items-end">
//                   <button
//                     onClick={handleNext}
//                     disabled={!formData.projectId || !formData.contractorFirm || !formData.rccBillNo}
//                     className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 disabled:opacity-50"
//                   >
//                     Next <ChevronRight size={20} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {step === 2 && (
//           <div className="bg-white rounded-lg shadow-md p-8">
//             <div className="flex justify-between items-center mb-6">
//               <button onClick={handleBack} className="text-indigo-600 hover:text-indigo-800 font-semibold">Back</button>
//               {isSaving && <div className="flex items-center gap-2 text-blue-600"><Loader2 className="animate-spin" size={20} /> Saving...</div>}
//             </div>

//             <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
//               <p className="font-semibold text-blue-900">Showing {filteredData.length} UID(s) for Bill: {formData.rccBillNo}</p>
//             </div>

//             <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-lg mb-8">
//               <h3 className="font-bold text-yellow-900 mb-4">Global Inputs</h3>
//               <div className="grid md:grid-cols-4 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium">Rcc_Summary_Sheet_No *</label>
//                   <input type="text" value={globalFiles.rccSummarySheetNo} onChange={e => setGlobalFiles(prev => ({ ...prev, rccSummarySheetNo: e.target.value }))} className="w-full mt-1 p-2 border rounded" placeholder="RCC-001" />
//                 </div>

//                 {/* RCC SUMMARY SHEET - IMAGE + PDF */}
//                 <div className="space-y-3">
//                   <label className="block text-sm font-medium text-gray-700">Rcc_Summary_Sheet_Photo * (Image/PDF)</label>
//                   <label className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-all ${globalFiles.rccSummarySheetFile ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-indigo-400'}`}>
//                     {globalFiles.rccSummarySheetFile ? (
//                       <div className="p-4 text-center w-full">
//                         {globalFiles.rccSummarySheetFile.type === 'application/pdf' ? (
//                           <div className="flex flex-col items-center">
//                             <FileText className="text-red-600 mb-2" size={40} />
//                             <p className="text-xs text-red-700 font-medium truncate block max-w-xs">{globalFiles.rccSummarySheetFile.name}</p>
//                           </div>
//                         ) : (
//                           <>
//                             <img src={globalFiles.rccSummarySheetUrl} alt="Preview" className="mx-auto max-h-24 rounded-lg shadow-md object-cover" />
//                             <p className="mt-2 text-xs text-green-700 font-medium truncate block">{globalFiles.rccSummarySheetFile.name}</p>
//                           </>
//                         )}
//                       </div>
//                     ) : (
//                       <div className="text-center p-6">
//                         <Upload className="mx-auto mb-3 text-gray-400" size={40} />
//                         <p className="text-sm text-gray-600">Click to upload</p>
//                         <p className="text-xs text-gray-500">Image or PDF</p>
//                       </div>
//                     )}
//                     <input type="file" accept="image/*,.pdf" onChange={e => e.target.files[0] && handleFile(e.target.files[0], 'rcc')} className="hidden" />
//                   </label>
//                   {globalFiles.rccSummarySheetFile && (
//                     <div className="flex items-center justify-between bg-green-100 border border-green-300 rounded-lg p-2 text-xs">
//                       <span className="flex items-center gap-1 text-green-700"><CheckCircle size={14} /> {globalFiles.rccSummarySheetFile.name}</span>
//                       <button onClick={() => removeFile('rcc')} className="text-red-600 hover:bg-red-200 p-1 rounded"><X size={14} /></button>
//                     </div>
//                   )}
//                 </div>

//                 {/* WORK ORDER - IMAGE + PDF */}
//                 <div className="space-y-3">
//                   <label className="block text-sm font-medium text-gray-700">Work Order * (Image/PDF)</label>
//                   <label className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-all ${globalFiles.workOrderFile ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-indigo-400'}`}>
//                     {globalFiles.workOrderFile ? (
//                       <div className="p-4 text-center w-full">
//                         {globalFiles.workOrderFile.type === 'application/pdf' ? (
//                           <div className="flex flex-col items-center">
//                             <FileText className="text-red-600 mb-2" size={40} />
//                             <p className="text-xs text-red-700 font-medium truncate block max-w-xs">{globalFiles.workOrderFile.name}</p>
//                           </div>
//                         ) : (
//                           <>
//                             <img src={globalFiles.workOrderUrl} alt="Preview" className="mx-auto max-h-24 rounded-lg shadow-md object-cover" />
//                             <p className="mt-2 text-xs text-green-700 font-medium truncate block">{globalFiles.workOrderFile.name}</p>
//                           </>
//                         )}
//                       </div>
//                     ) : (
//                       <div className="text-center p-6">
//                         <Upload className="mx-auto mb-3 text-gray-400" size={40} />
//                         <p className="text-sm text-gray-600">Click to upload</p>
//                         <p className="text-xs text-gray-500">Image or PDF</p>
//                       </div>
//                     )}
//                     <input type="file" accept="image/*,.pdf" onChange={e => e.target.files[0] && handleFile(e.target.files[0], 'wo')} className="hidden" />
//                   </label>
//                   {globalFiles.workOrderFile && (
//                     <div className="flex items-center justify-between bg-green-100 border border-green-300 rounded-lg p-2 text-xs">
//                       <span className="flex items-center gap-1 text-green-700"><CheckCircle size={14} /> {globalFiles.workOrderFile.name}</span>
//                       <button onClick={() => removeFile('wo')} className="text-red-600 hover:bg-red-200 p-1 rounded"><X size={14} /></button>
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium">Status *</label>
//                   <select value={globalStatus} onChange={e => setGlobalStatus(e.target.value)} className="w-full mt-1 p-2 border rounded">
//                     <option value="">Select</option>
//                     <option>Done</option>
//                     <option>Pending</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full text-xs border-collapse">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="p-2 text-left border">#</th>
//                     <th className="p-2 text-left border">UID</th>
//                     <th className="p-2 text-left border">Work</th>
//                     <th className="p-2 text-left border">Desc</th>
//                     <th className="p-2 text-left border">Qty</th>
//                     <th className="p-2 text-left border">Unit</th>
//                     <th className="p-2 text-left border">Rate</th>
//                     <th className="p-2 text-left border bg-yellow-100">Amt (Auto)</th>
//                     <th className="p-2 text-left border bg-orange-100">GST %</th>
//                     <th className="p-2 text-left border">CGST</th>
//                     <th className="p-2 text-left border">SGST</th>
//                     <th className="p-2 text-left border">Net</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredData.map((item, i) => {
//                     const row = editableData[item.UID] || {};
//                     return (
//                       <tr key={item.UID} className="hover:bg-gray-50">
//                         <td className="p-2 font-bold text-gray-600 border">{i + 1}</td>
//                         <td className="p-2 font-semibold text-indigo-600 border">{item.UID}</td>
//                         <td className="p-2 text-sm border">{item.workName}</td>
//                         <td className="p-2 text-xs max-w-xs border">{item.workDesc || item.workDescription || '-'}</td>
//                         <td className="p-2 border"><input type="number" value={row.Final_Area_Quantity3 || ''} onChange={e => handleInputChange(i, 'Final_Area_Quantity3', e.target.value)} className="w-16 p-1 border rounded focus:bg-yellow-50" /></td>
//                         <td className="p-2 border">
//                           <select value={row.Unit3 || ''} onChange={e => handleInputChange(i, 'Unit3', e.target.value)} className="w-16 p-1 border rounded text-xs">
//                             <option value="">Unit</option>
//                             {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
//                           </select>
//                         </td>
//                         <td className="p-2 border"><input type="number" value={row.RATE3 || ''} onChange={e => handleInputChange(i, 'RATE3', e.target.value)} className="w-16 p-1 border rounded focus:bg-yellow-50" /></td>
//                         <td className="p-2 border bg-yellow-50 text-green-700 font-medium text-right">{row.AMOUNT3 || '0.00'}</td>
//                         <td className="p-2 border bg-orange-50">
//                           <select value={row.GST_PERCENT || '0%'} onChange={e => handleInputChange(i, 'GST_PERCENT', e.target.value)} className="w-full p-1 border rounded text-xs font-semibold">
//                             {gstRates.map(r => <option key={r} value={r}>{r}</option>)}
//                           </select>
//                         </td>
//                         <td className="p-2 border bg-orange-50 text-right">{row.CGST3 || '0.00'}</td>
//                         <td className="p-2 border bg-orange-50 text-right">{row.SGST3 || '0.00'}</td>
//                         <td className="p-2 text-right font-bold text-green-600 border bg-green-50">{row.NET_AMOUNT3 || '0.00'}</td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex justify-end mt-6">
//               <button onClick={handleSubmitData} disabled={isSaving || !globalFiles.rccSummarySheetNo || !globalFiles.rccSummarySheetFile || !globalFiles.workOrderFile || !globalStatus}
//                 className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50 flex items-center gap-2">
//                 {isSaving ? 'Saving...' : `Submit All ${filteredData.length} UID(s)`}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Bill_Checked_By_Office;



import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, FileText, Loader2, AlertCircle, CheckCircle, X, RefreshCw, Upload } from 'lucide-react';
import {
  useGetContractorBillCheckedOfficeQuery,
  useGetEnquiryCaptureBillingOfficeQuery,
  useSaveBillCheckedOfficeMutation
} from '../../features/billing/billCheckedOfficeSlice';

const Bill_Checked_By_Office = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectId: '', projectName: '', contractorFirm: '', contractorName: '', rccBillNo: ''
  });
  const [filteredData, setFilteredData] = useState([]);
  const [editableData, setEditableData] = useState([]);

  const [globalFiles, setGlobalFiles] = useState({
    rccSummarySheetNo: '',
    rccSummarySheetFile: null,
    rccSummarySheetUrl: '',
    workOrderFile: null,
    workOrderUrl: ''
  });
  const [globalStatus, setGlobalStatus] = useState('');

  const { 
    data: billsData, 
    isLoading: loadingBills, 
    error: billsError, 
    isError: isBillsError,
    refetch 
  } = useGetContractorBillCheckedOfficeQuery(null, { refetchOnMountOrArgChange: true });
  const [saveBill, { isLoading: isSaving }] = useSaveBillCheckedOfficeMutation();

  useEffect(() => { refetch(); }, [refetch]);

  const normalize = (str) => String(str || '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '');

  const projectOptions = useMemo(() => {
    if (!billsData || billsData.length === 0) return [];
    const unique = new Map();
    billsData.forEach(bill => {
      const key = normalize(bill.projectId);
      if (key && !unique.has(key)) {
        unique.set(key, { id: bill.projectId, name: bill.projectName || 'Unknown' });
      }
    });
    return Array.from(unique.values());
  }, [billsData]);

  const contractorOptions = useMemo(() => {
    if (!billsData || !formData.projectId) return [];
    const unique = new Map();
    billsData
      .filter(bill => normalize(bill.projectId) === normalize(formData.projectId))
      .forEach(bill => {
        const key = normalize(bill.firmName);
        if (key && !unique.has(key)) {
          unique.set(key, { firm: bill.firmName, name: bill.contractorName || 'Unknown' });
        }
      });
    return Array.from(unique.values());
  }, [billsData, formData.projectId]);

  const rccBillOptions = useMemo(() => {
    if (!billsData || !formData.projectId || !formData.contractorFirm) return [];
    const unique = new Set();
    billsData
      .filter(bill =>
        normalize(bill.projectId) === normalize(formData.projectId) &&
        normalize(bill.firmName) === normalize(formData.contractorFirm)
      )
      .forEach(bill => bill.rccBillNo && unique.add(bill.rccBillNo));
    return Array.from(unique).map(no => ({ billNo: no }));
  }, [billsData, formData.projectId, formData.contractorFirm]);

  const unitOptions = ['Sqft', 'Nos', 'Point', 'Rft', 'Kg', 'Hours', 'KW', 'Ltr', 'Cum', 'RM'];
  const gstRates = ['0%', '5%', '12%', '18%'];

  const handleProjectIdChange = (e) => {
    const id = e.target.value;
    const selected = projectOptions.find(p => normalize(p.id) === normalize(id));
    setFormData({
      projectId: id,
      projectName: selected?.name || '',
      contractorFirm: '',
      contractorName: '',
      rccBillNo: ''
    });
  };

  const handleContractorFirmChange = (e) => {
    const firm = e.target.value;
    const selected = contractorOptions.find(c => normalize(c.firm) === normalize(firm));
    setFormData(prev => ({
      ...prev,
      contractorFirm: firm,
      contractorName: selected?.name || '',
      rccBillNo: ''
    }));
  };

  const handleNext = () => {
    if (!formData.projectId || !formData.contractorFirm || !formData.rccBillNo) {
      alert('सभी फ़ील्ड भरें');
      return;
    }

    const filter1 = billsData.filter(item =>
      item.projectId === formData.projectId &&
      item.firmName === formData.contractorFirm &&
      item.rccBillNo === formData.rccBillNo
    );

    const filter2 = billsData.filter(item => 
      normalize(item.projectId) === normalize(formData.projectId) &&
      normalize(item.firmName) === normalize(formData.contractorFirm) &&
      normalize(item.rccBillNo) === normalize(formData.rccBillNo)
    );

    const allMatchingRecords = filter1.length > 0 ? filter1 : filter2;

    if (allMatchingRecords.length === 0) {
      alert(`कोई बिल नहीं मिला`);
      return;
    }

    setFilteredData(allMatchingRecords);
    const newEditableData = {};
    allMatchingRecords.forEach(item => {
      newEditableData[item.UID] = {
        uid: item.UID,
        Final_Area_Quantity3: '',
        Unit3: '',
        RATE3: '',
        AMOUNT3: '',
        GST_PERCENT: '0%',
        CGST3: '',
        SGST3: '',
        NET_AMOUNT3: '0.00'
      };
    });
    setEditableData(newEditableData);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setFilteredData([]);
    setEditableData([]);
    setGlobalFiles({ rccSummarySheetNo: '', rccSummarySheetFile: null, rccSummarySheetUrl: '', workOrderFile: null, workOrderUrl: '' });
    setGlobalStatus('');
  };

  const calculateRow = (row) => {
    const qty = parseFloat(row.Final_Area_Quantity3) || 0;
    const rate = parseFloat(row.RATE3) || 0;
    const amount = qty * rate;
    const gstPercent = parseFloat(row.GST_PERCENT) || 0;
    const gstAmount = amount * (gstPercent / 100);
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    const net = amount + cgst + sgst;

    return {
      ...row,
      AMOUNT3: amount.toFixed(2),
      CGST3: cgst.toFixed(2),
      SGST3: sgst.toFixed(2),
      NET_AMOUNT3: net.toFixed(2)
    };
  };

  const handleInputChange = (index, field, value) => {
    const uid = filteredData[index].UID;
    setEditableData(prev => {
      const updated = { ...prev[uid], [field]: value };
      return { ...prev, [uid]: calculateRow(updated) };
    });
  };

  const handleFile = (file, type) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setGlobalFiles(prev => ({
        ...prev,
        [type === 'rcc' ? 'rccSummarySheetFile' : 'workOrderFile']: file,
        [type === 'rcc' ? 'rccSummarySheetUrl' : 'workOrderUrl']: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (type) => {
    setGlobalFiles(prev => ({
      ...prev,
      [type === 'rcc' ? 'rccSummarySheetFile' : 'workOrderFile']: null,
      [type === 'rcc' ? 'rccSummarySheetUrl' : 'workOrderUrl']: ''
    }));
  };

  const handleSubmitData = async () => {
    if (!globalFiles.rccSummarySheetNo || !globalFiles.rccSummarySheetFile || !globalFiles.workOrderFile || !globalStatus) {
      alert('सभी Global Inputs भरें');
      return;
    }

    const payload = {
      uids: filteredData.map(item => item.UID),
      status: globalStatus,
      Rcc_Summary_Sheet_No: globalFiles.rccSummarySheetNo,
      Rcc_Summary_Sheet_Base64: globalFiles.rccSummarySheetUrl,
      Work_Order_Base64: globalFiles.workOrderUrl,
      items: filteredData.map(item => {
        const d = editableData[item.UID];
        return {
          uid: item.UID,
          Final_Area_Quantity3: d.Final_Area_Quantity3,
          Unit3: d.Unit3,
          RATE3: d.RATE3,
          AMOUNT3: d.AMOUNT3,
          CGST3: d.CGST3,
          SGST3: d.SGST3,
          NET_AMOUNT3: d.NET_AMOUNT3
        };
      })
    };

    try {
      const result = await saveBill(payload).unwrap();
      if (result?.success) {
        alert(`Success! ${result.updated?.length || 0} records saved.`);
        refetch();
        setTimeout(() => handleBack(), 800);
      }
    } catch (err) {
      alert('Error: ' + (err?.data?.message || 'Save failed'));
    }
  };

  // TOTAL NET AMOUNT CALCULATION
  const totalNetAmount = useMemo(() => {
    return filteredData.reduce((sum, item) => {
      const net = parseFloat(editableData[item.UID]?.NET_AMOUNT3 || 0);
      return sum + (isNaN(net) ? 0 : net);
    }, 0);
  }, [filteredData, editableData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FileText className="text-indigo-600" size={32} />
            Bill Checked By Office
          </h1>
          <div className="flex items-center gap-2 mt-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>1</div>
            <ChevronRight className="text-gray-400" size={20} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>2</div>
          </div>
        </div>

        {loadingBills && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center py-16">
            <Loader2 className="animate-spin mx-auto text-indigo-600" size={48} />
            <p className="mt-4 text-gray-600">Bills लोड हो रहे...</p>
          </div>
        )}

        {isBillsError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-center justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-red-800">डेटा लोड नहीं हुआ</p>
                <p className="text-sm text-red-600">{billsError?.data?.message || 'कनेक्शन समस्या'}</p>
              </div>
            </div>
            <button onClick={refetch} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}

        {step === 1 && !loadingBills && !isBillsError && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Filter Bills</h2>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-2">Project ID *</label>
                  <select value={formData.projectId} onChange={handleProjectIdChange} className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select Project</option>
                    {projectOptions.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">{projectOptions.length} projects</p>
                </div>
                <div>
                  <label className="block font-semibold mb-2">Project Name</label>
                  <input value={formData.projectName} readOnly className="w-full p-3 border bg-gray-50 rounded-lg" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-2">Contractor Firm *</label>
                  <select
                    value={formData.contractorFirm}
                    onChange={handleContractorFirmChange}
                    disabled={!formData.projectId}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="">Select Contractor</option>
                    {contractorOptions.map(c => (
                      <option key={c.firm} value={c.firm}>{c.firm}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-2">Contractor Name</label>
                  <input value={formData.contractorName} readOnly className="w-full p-3 border bg-gray-50 rounded-lg" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-2">RCC Bill No *</label>
                  <select
                    value={formData.rccBillNo}
                    onChange={e => setFormData(prev => ({ ...prev, rccBillNo: e.target.value }))}
                    disabled={!formData.contractorFirm}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="">Select Bill No</option>
                    {rccBillOptions.map(b => (
                      <option key={b.billNo} value={b.billNo}>{b.billNo}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleNext}
                    disabled={!formData.projectId || !formData.contractorFirm || !formData.rccBillNo}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    Next <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <button onClick={handleBack} className="text-indigo-600 hover:text-indigo-800 font-semibold">Back</button>
              {isSaving && <div className="flex items-center gap-2 text-blue-600"><Loader2 className="animate-spin" size={20} /> Saving...</div>}
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
              <p className="font-semibold text-blue-900">Showing {filteredData.length} UID(s) for Bill: {formData.rccBillNo}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-lg mb-8">
              <h3 className="font-bold text-yellow-900 mb-4">Global Inputs</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium">Rcc_Summary_Sheet_No *</label>
                  <input type="text" value={globalFiles.rccSummarySheetNo} onChange={e => setGlobalFiles(prev => ({ ...prev, rccSummarySheetNo: e.target.value }))} className="w-full mt-1 p-2 border rounded" placeholder="RCC-001" />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Rcc_Summary_Sheet_Photo * (Image/PDF)</label>
                  <label className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-all ${globalFiles.rccSummarySheetFile ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-indigo-400'}`}>
                    {globalFiles.rccSummarySheetFile ? (
                      <div className="p-4 text-center w-full">
                        {globalFiles.rccSummarySheetFile.type === 'application/pdf' ? (
                          <div className="flex flex-col items-center">
                            <FileText className="text-red-600 mb-2" size={40} />
                            <p className="text-xs text-red-700 font-medium truncate block max-w-xs">{globalFiles.rccSummarySheetFile.name}</p>
                          </div>
                        ) : (
                          <>
                            <img src={globalFiles.rccSummarySheetUrl} alt="Preview" className="mx-auto max-h-24 rounded-lg shadow-md object-cover" />
                            <p className="mt-2 text-xs text-green-700 font-medium truncate block">{globalFiles.rccSummarySheetFile.name}</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <Upload className="mx-auto mb-3 text-gray-400" size={40} />
                        <p className="text-sm text-gray-600">Click to upload</p>
                        <p className="text-xs text-gray-500">Image or PDF</p>
                      </div>
                    )}
                    <input type="file" accept="image/*,.pdf" onChange={e => e.target.files[0] && handleFile(e.target.files[0], 'rcc')} className="hidden" />
                  </label>
                  {globalFiles.rccSummarySheetFile && (
                    <div className="flex items-center justify-between bg-green-100 border border-green-300 rounded-lg p-2 text-xs">
                      <span className="flex items-center gap-1 text-green-700"><CheckCircle size={14} /> {globalFiles.rccSummarySheetFile.name}</span>
                      <button onClick={() => removeFile('rcc')} className="text-red-600 hover:bg-red-200 p-1 rounded"><X size={14} /></button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Work Order * (Image/PDF)</label>
                  <label className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-all ${globalFiles.workOrderFile ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-indigo-400'}`}>
                    {globalFiles.workOrderFile ? (
                      <div className="p-4 text-center w-full">
                        {globalFiles.workOrderFile.type === 'application/pdf' ? (
                          <div className="flex flex-col items-center">
                            <FileText className="text-red-600 mb-2" size={40} />
                            <p className="text-xs text-red-700 font-medium truncate block max-w-xs">{globalFiles.workOrderFile.name}</p>
                          </div>
                        ) : (
                          <>
                            <img src={globalFiles.workOrderUrl} alt="Preview" className="mx-auto max-h-24 rounded-lg shadow-md object-cover" />
                            <p className="mt-2 text-xs text-green-700 font-medium truncate block">{globalFiles.workOrderFile.name}</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <Upload className="mx-auto mb-3 text-gray-400" size={40} />
                        <p className="text-sm text-gray-600">Click to upload</p>
                        <p className="text-xs text-gray-500">Image or PDF</p>
                      </div>
                    )}
                    <input type="file" accept="image/*,.pdf" onChange={e => e.target.files[0] && handleFile(e.target.files[0], 'wo')} className="hidden" />
                  </label>
                  {globalFiles.workOrderFile && (
                    <div className="flex items-center justify-between bg-green-100 border border-green-300 rounded-lg p-2 text-xs">
                      <span className="flex items-center gap-1 text-green-700"><CheckCircle size={14} /> {globalFiles.workOrderFile.name}</span>
                      <button onClick={() => removeFile('wo')} className="text-red-600 hover:bg-red-200 p-1 rounded"><X size={14} /></button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">Status *</label>
                  <select value={globalStatus} onChange={e => setGlobalStatus(e.target.value)} className="w-full mt-1 p-2 border rounded">
                    <option value="">Select</option>
                    <option>Done</option>
                    <option>Pending</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left border">#</th>
                    <th className="p-2 text-left border">UID</th>
                    <th className="p-2 text-left border">Work</th>
                    <th className="p-2 text-left border">Desc</th>
                    <th className="p-2 text-left border">Qty</th>
                    <th className="p-2 text-left border">Unit</th>
                    <th className="p-2 text-left border">Rate</th>
                    <th className="p-2 text-left border bg-yellow-100">Amt (Auto)</th>
                    <th className="p-2 text-left border bg-orange-100">GST %</th>
                    <th className="p-2 text-left border">CGST</th>
                    <th className="p-2 text-left border">SGST</th>
                    <th className="p-2 text-left border">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, i) => {
                    const row = editableData[item.UID] || {};
                    return (
                      <tr key={item.UID} className="hover:bg-gray-50">
                        <td className="p-2 font-bold text-gray-600 border">{i + 1}</td>
                        <td className="p-2 font-semibold text-indigo-600 border">{item.UID}</td>
                        <td className="p-2 text-sm border">{item.workName}</td>
                        <td className="p-2 text-xs max-w-xs border">{item.workDesc || item.workDescription || '-'}</td>
                        <td className="p-2 border"><input type="number" value={row.Final_Area_Quantity3 || ''} onChange={e => handleInputChange(i, 'Final_Area_Quantity3', e.target.value)} className="w-16 p-1 border rounded focus:bg-yellow-50" /></td>
                        <td className="p-2 border">
                          <select value={row.Unit3 || ''} onChange={e => handleInputChange(i, 'Unit3', e.target.value)} className="w-16 p-1 border rounded text-xs">
                            <option value="">Unit</option>
                            {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </td>
                        <td className="p-2 border"><input type="number" value={row.RATE3 || ''} onChange={e => handleInputChange(i, 'RATE3', e.target.value)} className="w-16 p-1 border rounded focus:bg-yellow-50" /></td>
                        <td className="p-2 border bg-yellow-50 text-green-700 font-medium text-right">{row.AMOUNT3 || '0.00'}</td>
                        <td className="p-2 border bg-orange-50">
                          <select value={row.GST_PERCENT || '0%'} onChange={e => handleInputChange(i, 'GST_PERCENT', e.target.value)} className="w-full p-1 border rounded text-xs font-semibold">
                            {gstRates.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td className="p-2 border bg-orange-50 text-right">{row.CGST3 || '0.00'}</td>
                        <td className="p-2 border bg-orange-50 text-right">{row.SGST3 || '0.00'}</td>
                        <td className="p-2 text-right font-bold text-green-600 border bg-green-50">{row.NET_AMOUNT3 || '0.00'}</td>
                      </tr>
  );
  })}
                </tbody>

                {/* GRAND TOTAL ROW */}
                <tfoot>
                  <tr className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-bold">
                    <td colSpan={11} className="p-4 text-right text-lg">
                      कुल नेट राशि (Total Net Amount):
                    </td>
                    <td className="p-4 text-right text-2xl font-extrabold">
                      ₹ {totalNetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-end mt-8">
              <button 
                onClick={handleSubmitData} 
                disabled={isSaving || !globalFiles.rccSummarySheetNo || !globalFiles.rccSummarySheetFile || !globalFiles.workOrderFile || !globalStatus}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-lg disabled:opacity-50 flex items-center gap-3 text-lg shadow-lg"
              >
                {isSaving ? <>Saving... <Loader2 className="animate-spin" /></> : `Submit All ${filteredData.length} UID(s)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bill_Checked_By_Office;