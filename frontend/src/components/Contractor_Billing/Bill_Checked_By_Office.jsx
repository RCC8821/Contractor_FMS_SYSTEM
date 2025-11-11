
// import React, { useState, useMemo, useEffect } from 'react';
// import { ChevronRight, FileText, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
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

//   // RTK Queries
//   const { data: enquiryData, isLoading: loadingDropdowns } = useGetEnquiryCaptureBillingOfficeQuery();
//   const { data: billsData, isLoading: loadingBills, refetch } = useGetContractorBillCheckedOfficeQuery();
//   const [saveBill, { isLoading: isSaving }] = useSaveBillCheckedOfficeMutation();

//   // Options
//   const projectOptions = useMemo(() => {
//     if (!enquiryData) return [];
//     return enquiryData.projectIds.map((id, i) => ({
//       id, name: enquiryData.projectNames[i] || 'Unknown'
//     }));
//   }, [enquiryData]);

//   const contractorOptions = useMemo(() => {
//     if (!enquiryData) return [];
//     return enquiryData.contractorFirmNames.map((firm, i) => ({
//       firm, name: enquiryData.contractorNames[i] || 'Unknown'
//     }));
//   }, [enquiryData]);

//   const rccBillOptions = useMemo(() => {
//     if (!billsData) return [];
//     return [...new Set(billsData.map(b => b.rccBillNo))].filter(Boolean)
//       .map(no => ({ billNo: no }));
//   }, [billsData]);

//   const unitOptions = ['Sqft', 'Nos', 'Point', 'Rft', 'Kg', 'Hours', 'KW', 'Ltr', 'Cum'];

//   // Handlers
//   const handleProjectIdChange = (e) => {
//     const id = e.target.value;
//     const selected = projectOptions.find(p => p.id === id);
//     setFormData(prev => ({ ...prev, projectId: id, projectName: selected?.name || '' }));
//   };

//   const handleContractorFirmChange = (e) => {
//     const firm = e.target.value;
//     const selected = contractorOptions.find(c => c.firm === firm);
//     setFormData(prev => ({ ...prev, contractorFirm: firm, contractorName: selected?.name || '' }));
//   };

//   const handleNext = () => {
//     if (!formData.projectId || !formData.contractorFirm || !formData.rccBillNo) {
//       alert('सभी फ़ील्ड भरें');
//       return;
//     }

//     const filtered = billsData.filter(item =>
//       item.projectId === formData.projectId &&
//       item.contractorName.toLowerCase() === formData.contractorName.toLowerCase() &&
//       item.rccBillNo === formData.rccBillNo
//     );

//     if (filtered.length === 0) {
//       alert('कोई बिल नहीं मिला!');
//       return;
//     }

//     setFilteredData(filtered);
//     setEditableData(filtered.map(item => ({
//       uid: item.UID,
//       Final_Area_Quantity3: '',
//       Unit3: '',
//       RATE3: '',
//       AMOUNT3: '',
//       CGST3: '',
//       SGST3: '',
//       NET_AMOUNT3: 0
//     })));
//     setStep(2);
//   };

//   const handleBack = () => {
//     setStep(1);
//     setFilteredData([]);
//     setEditableData([]);
//     setGlobalFiles({ rccSummarySheetNo: '', rccSummarySheetFile: null, rccSummarySheetUrl: '', workOrderFile: null, workOrderUrl: '' });
//     setGlobalStatus('');
//   };

//   // Auto Net Amount
//   useEffect(() => {
//     const updated = [...editableData];
//     updated.forEach((row, i) => {
//       const amount = parseFloat(row.AMOUNT3) || 0;
//       const cgst = parseFloat(row.CGST3) || 0;
//       const sgst = parseFloat(row.SGST3) || 0;
//       updated[i].NET_AMOUNT3 = amount + cgst + sgst;
//     });
//     setEditableData(updated);
//   }, [editableData.map(r => `${r.AMOUNT3}-${r.CGST3}-${r.SGST3}`).join(',')]);

//   const handleInputChange = (index, field, value) => {
//     const updated = [...editableData];
//     updated[index][field] = value;
//     setEditableData(updated);
//   };

//   // File Handlers
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

//   // SUBMIT TO API
//   // SUBMIT TO API
// const handleSubmitData = async () => {
//   if (!globalFiles.rccSummarySheetNo || !globalFiles.rccSummarySheetFile || !globalFiles.workOrderFile || !globalStatus) {
//     alert('सभी Global Inputs भरें');
//     return;
//   }

//   const payload = {
//     uids: filteredData.map(item => item.UID),
//     status: globalStatus,
//     Rcc_Summary_Sheet_No: globalFiles.rccSummarySheetNo,
//     Rcc_Summary_Sheet_Base64: globalFiles.rccSummarySheetUrl,
//     Work_Order_Base64: globalFiles.workOrderUrl,
//     items: editableData.map(row => ({
//       uid: row.uid,
//       Final_Area_Quantity3: row.Final_Area_Quantity3,
//       Unit3: row.Unit3,
//       RATE3: row.RATE3,
//       AMOUNT3: row.AMOUNT3,
//       CGST3: row.CGST3,
//       SGST3: row.SGST3,
//       NET_AMOUNT3: row.NET_AMOUNT3.toString()
//     }))
//   };

//   try {
//     const result = await saveBill(payload).unwrap();
//     console.log('API Response:', result);

//     // Check if API returned success
//     if (result?.success) {
//       const updatedCount = result.updated?.length || 0;
//       alert(`Success! ${updatedCount} records saved.\n${result.message}`);
//       refetch(); // Manual refetch
//       setTimeout(() => handleBack(), 800);
//     } else {
//       alert(result?.error || result?.message || 'Save failed');
//     }
//   } catch (err) {
//     console.error('Save Error:', err);
//     alert('Error: ' + (err?.data?.message || err?.message || 'Save failed'));
//   }
// };

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
//             <ChevronRight />
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>2</div>
//           </div>
//         </div>

//         {step === 1 && (
//           <div className="bg-white rounded-lg shadow-md p-8">
//             <h2 className="text-2xl font-bold mb-6">Filter Bills</h2>
//             {(loadingDropdowns || loadingBills) ? (
//               <div className="flex justify-center py-12"><Loader2 className="animate-spin" size={48} /></div>
//             ) : (
//               <div className="space-y-6">
//                 <div className="grid md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block font-semibold mb-2">Project ID *</label>
//                     <select value={formData.projectId} onChange={handleProjectIdChange} className="w-full p-3 border rounded-lg">
//                       <option value="">Select</option>
//                       {projectOptions.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name}</option>)}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block font-semibold mb-2">Project Name</label>
//                     <input value={formData.projectName} readOnly className="w-full p-3 border bg-gray-50 rounded-lg" />
//                   </div>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block font-semibold mb-2">Contractor Firm *</label>
//                     <select value={formData.contractorFirm} onChange={handleContractorFirmChange} className="w-full p-3 border rounded-lg">
//                       <option value="">Select</option>
//                       {contractorOptions.map(c => <option key={c.firm} value={c.firm}>{c.firm}</option>)}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block font-semibold mb-2">Contractor Name</label>
//                     <input value={formData.contractorName} readOnly className="w-full p-3 border bg-gray-50 rounded-lg" />
//                   </div>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block font-semibold mb-2">RCC Bill No *</label>
//                     <select value={formData.rccBillNo} onChange={e => setFormData(prev => ({ ...prev, rccBillNo: e.target.value }))} className="w-full p-3 border rounded-lg">
//                       <option value="">Select</option>
//                       {rccBillOptions.map(b => <option key={b.billNo} value={b.billNo}>{b.billNo}</option>)}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="flex justify-end">
//                   <button onClick={handleNext} className="bg-indigo-600 text-white py-3 px-8 rounded-lg flex items-center gap-2">
//                     Next <ChevronRight />
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {step === 2 && (
//           <div className="bg-white rounded-lg shadow-md p-8">
//             <button onClick={handleBack} className="text-indigo-600 mb-6">Back</button>

//             <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-lg mb-8">
//               <h3 className="font-bold text-yellow-900 mb-4">Global Inputs</h3>
//               <div className="grid md:grid-cols-4 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium">RCC Sheet No *</label>
//                   <input
//                     type="text"
//                     value={globalFiles.rccSummarySheetNo}
//                     onChange={e => setGlobalFiles(prev => ({ ...prev, rccSummarySheetNo: e.target.value }))}
//                     className="w-full mt-1 p-2 border rounded"
//                     placeholder="RCC-001"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium">RCC Sheet *</label>
//                   <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0], 'rcc')} className="w-full mt-1" />
//                   {globalFiles.rccSummarySheetFile && (
//                     <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
//                       <CheckCircle size={12} /> {globalFiles.rccSummarySheetFile.name}
//                       <button onClick={() => removeFile('rcc')} className="text-red-500"><X size={12} /></button>
//                     </div>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium">Work Order *</label>
//                   <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0], 'wo')} className="w-full mt-1" />
//                   {globalFiles.workOrderFile && (
//                     <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
//                       <CheckCircle size={12} /> {globalFiles.workOrderFile.name}
//                       <button onClick={() => removeFile('wo')} className="text-red-500"><X size={12} /></button>
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
//               <table className="w-full text-xs">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="p-2 text-left">UID</th>
//                     <th className="p-2 text-left">Work</th>
//                     <th className="p-2 text-left">Qty</th>
//                     <th className="p-2 text-left">Unit</th>
//                     <th className="p-2 text-left">Rate</th>
//                     <th className="p-2 text-left">Amt</th>
//                     <th className="p-2 text-left">CGST</th>
//                     <th className="p-2 text-left">SGST</th>
//                     <th className="p-2 text-left">Net</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredData.map((item, i) => (
//                     <tr key={item.UID}>
//                       <td className="p-2 font-semibold">{item.UID}</td>
//                       <td className="p-2">{item.workName}</td>
//                       <td className="p-2"><input type="number" value={editableData[i]?.Final_Area_Quantity3 || ''} onChange={e => handleInputChange(i, 'Final_Area_Quantity3', e.target.value)} className="w-16 p-1 border" /></td>
//                       <td className="p-2"><select value={editableData[i]?.Unit3 || ''} onChange={e => handleInputChange(i, 'Unit3', e.target.value)} className="w-16 p-1 border text-xs">{unitOptions.map(u => <option key={u}>{u}</option>)}</select></td>
//                       <td className="p-2"><input type="number" value={editableData[i]?.RATE3 || ''} onChange={e => handleInputChange(i, 'RATE3', e.target.value)} className="w-16 p-1 border" /></td>
//                       <td className="p-2"><input type="number" value={editableData[i]?.AMOUNT3 || ''} onChange={e => handleInputChange(i, 'AMOUNT3', e.target.value)} className="w-16 p-1 border" /></td>
//                       <td className="p-2"><input type="number" value={editableData[i]?.CGST3 || ''} onChange={e => handleInputChange(i, 'CGST3', e.target.value)} className="w-16 p-1 border" /></td>
//                       <td className="p-2"><input type="number" value={editableData[i]?.SGST3 || ''} onChange={e => handleInputChange(i, 'SGST3', e.target.value)} className="w-16 p-1 border" /></td>
//                       <td className="p-2 text-right font-bold text-green-600">{editableData[i]?.NET_AMOUNT3?.toFixed(2) || '0'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex justify-end mt-6">
//               <button
//                 onClick={handleSubmitData}
//                 disabled={isSaving}
//                 className="bg-indigo-600 text-white py-3 px-8 rounded-lg flex items-center gap-2 disabled:opacity-50"
//               >
//                 {isSaving ? 'Saving...' : `Submit (${filteredData.length})`}
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
import { ChevronRight, FileText, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
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

  // RTK Queries
  const { data: enquiryData, isLoading: loadingDropdowns } = useGetEnquiryCaptureBillingOfficeQuery();
  const { data: billsData, isLoading: loadingBills, refetch } = useGetContractorBillCheckedOfficeQuery();
  const [saveBill, { isLoading: isSaving }] = useSaveBillCheckedOfficeMutation();

  // Options
  const projectOptions = useMemo(() => {
    if (!enquiryData) return [];
    return enquiryData.projectIds.map((id, i) => ({
      id, name: enquiryData.projectNames[i] || 'Unknown'
    }));
  }, [enquiryData]);

  const contractorOptions = useMemo(() => {
    if (!enquiryData) return [];
    return enquiryData.contractorFirmNames.map((firm, i) => ({
      firm, name: enquiryData.contractorNames[i] || 'Unknown'
    }));
  }, [enquiryData]);

  const rccBillOptions = useMemo(() => {
    if (!billsData) return [];
    return [...new Set(billsData.map(b => b.rccBillNo))].filter(Boolean)
      .map(no => ({ billNo: no }));
  }, [billsData]);

  const unitOptions = ['Sqft', 'Nos', 'Point', 'Rft', 'Kg', 'Hours', 'KW', 'Ltr', 'Cum'];

  // Handlers
  const handleProjectIdChange = (e) => {
    const id = e.target.value;
    const selected = projectOptions.find(p => p.id === id);
    setFormData(prev => ({ ...prev, projectId: id, projectName: selected?.name || '' }));
  };

  const handleContractorFirmChange = (e) => {
    const firm = e.target.value;
    const selected = contractorOptions.find(c => c.firm === firm);
    setFormData(prev => ({ ...prev, contractorFirm: firm, contractorName: selected?.name || '' }));
  };

  const handleNext = () => {
    if (!formData.projectId || !formData.contractorFirm || !formData.rccBillNo) {
      alert('सभी फ़ील्ड भरें');
      return;
    }

    const filtered = billsData.filter(item =>
      item.projectId === formData.projectId &&
      item.contractorName.toLowerCase() === formData.contractorName.toLowerCase() &&
      item.rccBillNo === formData.rccBillNo
    );

    if (filtered.length === 0) {
      alert('कोई बिल नहीं मिला!');
      return;
    }

    setFilteredData(filtered);
    setEditableData(filtered.map(item => ({
      uid: item.UID,
      Final_Area_Quantity3: '',
      Unit3: '',
      RATE3: '',
      AMOUNT3: '',
      CGST3: '',
      SGST3: '',
      NET_AMOUNT3: 0
    })));
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setFilteredData([]);
    setEditableData([]);
    setGlobalFiles({ rccSummarySheetNo: '', rccSummarySheetFile: null, rccSummarySheetUrl: '', workOrderFile: null, workOrderUrl: '' });
    setGlobalStatus('');
  };

  // Auto Net Amount
  useEffect(() => {
    const updated = [...editableData];
    updated.forEach((row, i) => {
      const amount = parseFloat(row.AMOUNT3) || 0;
      const cgst = parseFloat(row.CGST3) || 0;
      const sgst = parseFloat(row.SGST3) || 0;
      updated[i].NET_AMOUNT3 = amount + cgst + sgst;
    });
    setEditableData(updated);
  }, [editableData.map(r => `${r.AMOUNT3}-${r.CGST3}-${r.SGST3}`).join(',')]);

  const handleInputChange = (index, field, value) => {
    const updated = [...editableData];
    updated[index][field] = value;
    setEditableData(updated);
  };

  // File Handlers
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

  // SUBMIT TO API
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
      items: editableData.map(row => ({
        uid: row.uid,
        Final_Area_Quantity3: row.Final_Area_Quantity3,
        Unit3: row.Unit3,
        RATE3: row.RATE3,
        AMOUNT3: row.AMOUNT3,
        CGST3: row.CGST3,
        SGST3: row.SGST3,
        NET_AMOUNT3: row.NET_AMOUNT3.toString()
      }))
    };

    try {
      const result = await saveBill(payload).unwrap();
      console.log('API Response:', result);

      if (result?.success) {
        const updatedCount = result.updated?.length || 0;
        alert(`Success! ${updatedCount} records saved.\n${result.message}`);
        refetch();
        setTimeout(() => handleBack(), 800);
      } else {
        alert(result?.error || result?.message || 'Save failed');
      }
    } catch (err) {
      console.error('Save Error:', err);
      alert('Error: ' + (err?.data?.message || err?.message || 'Save failed'));
    }
  };

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
            <ChevronRight />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>2</div>
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Filter Bills</h2>
            {(loadingDropdowns || loadingBills) ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin" size={48} /></div>
            ) : (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-semibold mb-2">Project ID *</label>
                    <select value={formData.projectId} onChange={handleProjectIdChange} className="w-full p-3 border rounded-lg">
                      <option value="">Select</option>
                      {projectOptions.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">Project Name</label>
                    <input value={formData.projectName} readOnly className="w-full p-3 border bg-gray-50 rounded-lg" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-semibold mb-2">Contractor Firm *</label>
                    <select value={formData.contractorFirm} onChange={handleContractorFirmChange} className="w-full p-3 border rounded-lg">
                      <option value="">Select</option>
                      {contractorOptions.map(c => <option key={c.firm} value={c.firm}>{c.firm}</option>)}
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
                    <select value={formData.rccBillNo} onChange={e => setFormData(prev => ({ ...prev, rccBillNo: e.target.value }))} className="w-full p-3 border rounded-lg">
                      <option value="">Select</option>
                      {rccBillOptions.map(b => <option key={b.billNo} value={b.billNo}>{b.billNo}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={handleNext} className="bg-indigo-600 text-white py-3 px-8 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
                    Next <ChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <button onClick={handleBack} className="text-indigo-600 mb-6 font-semibold hover:text-indigo-800">← Back</button>

            <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-lg mb-8">
              <h3 className="font-bold text-yellow-900 mb-4">Global Inputs</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium">RCC Sheet No *</label>
                  <input
                    type="text"
                    value={globalFiles.rccSummarySheetNo}
                    onChange={e => setGlobalFiles(prev => ({ ...prev, rccSummarySheetNo: e.target.value }))}
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="RCC-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">RCC Sheet *</label>
                  <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0], 'rcc')} className="w-full mt-1" />
                  {globalFiles.rccSummarySheetFile && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                      <CheckCircle size={12} /> {globalFiles.rccSummarySheetFile.name}
                      <button onClick={() => removeFile('rcc')} className="text-red-500"><X size={12} /></button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">Work Order *</label>
                  <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0], 'wo')} className="w-full mt-1" />
                  {globalFiles.workOrderFile && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                      <CheckCircle size={12} /> {globalFiles.workOrderFile.name}
                      <button onClick={() => removeFile('wo')} className="text-red-500"><X size={12} /></button>
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
                    <th className="p-2 text-left border">UID</th>
                    <th className="p-2 text-left border">Work</th>
                    <th className="p-2 text-left border">Desc</th>
                    <th className="p-2 text-left border">Qty</th>
                    <th className="p-2 text-left border">Unit</th>
                    <th className="p-2 text-left border">Rate</th>
                    <th className="p-2 text-left border">Amt</th>
                    <th className="p-2 text-left border">CGST</th>
                    <th className="p-2 text-left border">SGST</th>
                    <th className="p-2 text-left border">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, i) => (
                    <tr key={item.UID} className="hover:bg-gray-50">
                      <td className="p-2 font-semibold text-sm border">{item.UID}</td>
                      <td className="p-2 text-sm border">{item.workName}</td>
                      <td className="p-2 text-xs max-w-xs border">{item.workDesc || '-'}</td>
                      <td className="p-2 border"><input type="number" value={editableData[i]?.Final_Area_Quantity3 || ''} onChange={e => handleInputChange(i, 'Final_Area_Quantity3', e.target.value)} className="w-16 p-1 border rounded" /></td>
                      <td className="p-2 border"><select value={editableData[i]?.Unit3 || ''} onChange={e => handleInputChange(i, 'Unit3', e.target.value)} className="w-16 p-1 border rounded text-xs">{unitOptions.map(u => <option key={u} value={u}>{u}</option>)}</select></td>
                      <td className="p-2 border"><input type="number" value={editableData[i]?.RATE3 || ''} onChange={e => handleInputChange(i, 'RATE3', e.target.value)} className="w-16 p-1 border rounded" /></td>
                      <td className="p-2 border"><input type="number" value={editableData[i]?.AMOUNT3 || ''} onChange={e => handleInputChange(i, 'AMOUNT3', e.target.value)} className="w-16 p-1 border rounded" /></td>
                      <td className="p-2 border"><input type="number" value={editableData[i]?.CGST3 || ''} onChange={e => handleInputChange(i, 'CGST3', e.target.value)} className="w-16 p-1 border rounded" /></td>
                      <td className="p-2 border"><input type="number" value={editableData[i]?.SGST3 || ''} onChange={e => handleInputChange(i, 'SGST3', e.target.value)} className="w-16 p-1 border rounded" /></td>
                      <td className="p-2 text-right font-bold text-green-600 border">{editableData[i]?.NET_AMOUNT3?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSubmitData}
                disabled={isSaving}
                className="bg-indigo-600 text-white py-3 px-8 rounded-lg flex items-center gap-2 disabled:opacity-50 hover:bg-indigo-700"
              >
                {isSaving ? 'Saving...' : `Submit (${filteredData.length})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bill_Checked_By_Office;