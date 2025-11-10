
// import React, { useState, useMemo } from 'react';
// import { ChevronRight, FileText, Loader2, AlertCircle } from 'lucide-react';
// import { useGetContractorBillCheckedQuery, useGetEnquiryCaptureBillingQuery } from '../../features/billing/billCheckedSlice';

// const Bill_Checked = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     projectId: '',
//     projectName: '',
//     contractorFirm: '',
//     contractorName: '',
//     rccBillNo: ''
//   });
//   const [filteredData, setFilteredData] = useState([]);
//   const [editableData, setEditableData] = useState([]);

//   // GLOBAL FIELDS
//   const [globalFiles, setGlobalFiles] = useState({
//     measurementSheet: null,
//     attendanceSheet: null
//   });
//   const [globalStatus, setGlobalStatus] = useState('');

//   // RTK Query
//   const { 
//     data: enquiryData, 
//     isLoading: loadingDropdowns, 
//     error: dropdownError 
//   } = useGetEnquiryCaptureBillingQuery();

//   const { 
//     data: billsData, 
//     isLoading: loadingBills, 
//     error: billsError 
//   } = useGetContractorBillCheckedQuery();

//   // Dropdown Options
//   const projectOptions = useMemo(() => {
//     if (!enquiryData?.projectIds || !enquiryData?.projectNames) return [];
//     return enquiryData.projectIds.map((id, index) => ({
//       id,
//       name: enquiryData.projectNames[index] || 'Unknown Project'
//     }));
//   }, [enquiryData]);

//   const contractorOptions = useMemo(() => {
//     if (!enquiryData?.contractorFirmNames || !enquiryData?.contractorNames) return [];
//     return enquiryData.contractorFirmNames.map((firm, index) => ({
//       firm,
//       name: enquiryData.contractorNames[index] || 'Unknown Contractor'
//     }));
//   }, [enquiryData]);

//   const rccBillOptions = useMemo(() => {
//     if (!billsData) return [];
//     const uniqueBills = [...new Set(billsData.map(item => item.rccBillNo))].filter(Boolean);
//     return uniqueBills.map(billNo => ({ billNo, description: `Bill ${billNo}` }));
//   }, [billsData]);

//   // Handlers
//   const handleProjectIdChange = (e) => {
//     const id = e.target.value;
//     const selected = projectOptions.find(p => p.id === id);
//     setFormData({ ...formData, projectId: id, projectName: selected?.name || '' });
//   };

//   const handleContractorFirmChange = (e) => {
//     const firm = e.target.value;
//     const selected = contractorOptions.find(c => c.firm === firm);
//     setFormData({ ...formData, contractorFirm: firm, contractorName: selected?.name || '' });
//   };

//   const handleRccBillChange = (e) => {
//     setFormData({ ...formData, rccBillNo: e.target.value });
//   };

//   const handleNext = () => {
//     if (!formData.projectId || !formData.contractorFirm || !formData.rccBillNo) {
//       alert('कृपया सभी फ़ील्ड भरें');
//       return;
//     }

//     if (!billsData) {
//       alert('Bills data not loaded yet');
//       return;
//     }

//     const filtered = billsData.filter(item => {
//       return (
//         item.projectId === formData.projectId &&
//         item.contractorName === formData.contractorName &&
//         item.rccBillNo === formData.rccBillNo
//       );
//     });

//     if (filtered.length === 0) {
//       alert('कोई बिल नहीं मिला। कृपया सही जानकारी चुनें।');
//       return;
//     }

//     setFilteredData(filtered);
//     const initialEditableData = filtered.map(item => ({
//       uid: item.UID,
//       areaQuantity: '',
//       unit: '',
//       qualityApprove: '',
//       photoEvidenceAfterWork2: null
//     }));
//     setEditableData(initialEditableData);
//     setStep(2);
//   };

//   const handleBack = () => {
//     setStep(1);
//     setFilteredData([]);
//     setEditableData([]);
//     setGlobalFiles({ measurementSheet: null, attendanceSheet: null });
//     setGlobalStatus('');
//   };

//   const handleInputChange = (index, field, value) => {
//     const updated = [...editableData];
//     updated[index][field] = value;
//     setEditableData(updated);
//   };

//   const handlePhotoEvidenceChange = (index, file) => {
//     const updated = [...editableData];
//     updated[index].photoEvidenceAfterWork2 = file;
//     setEditableData(updated);
//   };

//   // SUBMIT
//   const handleSubmitData = async () => {
//     if (!globalFiles.measurementSheet || !globalFiles.attendanceSheet || !globalStatus) {
//       alert('कृपया Measurement Sheet, Attendance Sheet और Status चुनें।');
//       return;
//     }

//     const finalData = filteredData.map((item, index) => ({
//       ...item,
//       ...editableData[index],
//       measurementSheetURL2: globalFiles.measurementSheet,
//       attendanceSheetURL2: globalFiles.attendanceSheet,
//       status: globalStatus,
//       photoEvidenceAfterWork2: editableData[index]?.photoEvidenceAfterWork2 || null
//     }));

//     console.log('Final Submitted Data:', finalData);
//     alert(`डेटा सफलतापूर्वक सबमिट! (${finalData.length} रिकॉर्ड्स)`);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
//                 <FileText className="text-indigo-600" size={32} />
//                 Bill Checked Dashboard
//               </h1>
//               <p className="text-gray-600 mt-2">बिल चेकिंग और वेरिफिकेशन सिस्टम</p>
//             </div>
//             <div className="flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full">
//               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
//                 1
//               </div>
//               <ChevronRight className="text-gray-400" size={20} />
//               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
//                 2
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Error */}
//         {(dropdownError || billsError) && (
//           <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-start gap-3">
//             <AlertCircle className="text-red-500 mt-0.5" size={20} />
//             <div>
//               <p className="font-semibold text-red-800">Error loading data</p>
//               <p className="text-sm text-red-600">
//                 {dropdownError?.data?.message || billsError?.data?.message || 'Please check your connection'}
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Step 1 */}
//         {step === 1 && (
//           <div className="bg-white rounded-lg shadow-md p-8">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6">प्रोजेक्ट और कॉन्ट्रैक्टर की जानकारी</h2>
            
//             {loadingDropdowns || loadingBills ? (
//               <div className="flex items-center justify-center py-12">
//                 <Loader2 className="animate-spin text-indigo-600" size={48} />
//                 <span className="ml-4 text-gray-600">Loading...</span>
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 <div className="grid md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Project ID *</label>
//                     <select value={formData.projectId} onChange={handleProjectIdChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
//                       <option value="">Select Project ID</option>
//                       {projectOptions.map(p => (
//                         <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
//                     <input type="text" value={formData.projectName} readOnly className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600" />
//                   </div>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Contractor Firm Name *</label>
//                     <select value={formData.contractorFirm} onChange={handleContractorFirmChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
//                       <option value="">Select Firm</option>
//                       {contractorOptions.map(c => (
//                         <option key={c.firm} value={c.firm}>{c.firm}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Contractor Name</label>
//                     <input type="text" value={formData.contractorName} readOnly className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600" />
//                   </div>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">RCC Bill No *</label>
//                     <select value={formData.rccBillNo} onChange={handleRccBillChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
//                       <option value="">Select Bill</option>
//                       {rccBillOptions.map(b => (
//                         <option key={b.billNo} value={b.billNo}>{b.billNo} - {b.description}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div className="flex items-end">
//                     <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
//                       <p className="text-xs text-gray-600 mb-1">Selected Bill</p>
//                       <p className="font-semibold text-blue-800">{formData.rccBillNo || 'Not Selected'}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex justify-end mt-8">
//                   <button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105">
//                     Next <ChevronRight size={20} />
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Step 2 */}
//         {step === 2 && (
//           <div className="bg-white rounded-lg shadow-md p-8">
//             <div className="flex justify-end mb-6">
//               <button onClick={handleBack} className="text-indigo-600 hover:text-indigo-800 font-semibold">Back</button>
//             </div>

//             {/* GLOBAL INPUTS */}
//             <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-8">
//               <h3 className="text-lg font-bold text-yellow-900 mb-4">
//                 Global Inputs (सभी {filteredData.length} UID में लागू)
//               </h3>
              
//               <div className="grid md:grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Measurement Sheet URL 2 <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => setGlobalFiles(prev => ({ ...prev, measurementSheet: e.target.files[0] }))}
//                     className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
//                   />
//                   {globalFiles.measurementSheet && (
//                     <p className="text-xs text-green-600 mt-1 truncate">Selected: {globalFiles.measurementSheet.name}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Attendance Sheet URL 2 <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => setGlobalFiles(prev => ({ ...prev, attendanceSheet: e.target.files[0] }))}
//                     className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
//                   />
//                   {globalFiles.attendanceSheet && (
//                     <p className="text-xs text-green-600 mt-1 truncate">Selected: {globalFiles.attendanceSheet.name}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Status <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     value={globalStatus}
//                     onChange={(e) => setGlobalStatus(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white"
//                   >
//                     <option value="">Select Status</option>
//                     <option value="Done">Done</option>
//                     <option value="Pending">Pending</option>
//                     <option value="In Progress">In Progress</option>
//                   </select>
//                 </div>
//               </div>

//               <p className="text-xs text-yellow-700 mt-3">
//                 ये सभी फील्ड्स सभी UID में एक साथ लागू हो जाएंगी।
//               </p>
//             </div>

//             {/* Summary Cards */}
//             <div className="grid md:grid-cols-4 gap-4 mb-6">
//               <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
//                 <p className="text-sm text-gray-600">Project</p>
//                 <p className="font-bold text-lg text-gray-800">{formData.projectName}</p>
//               </div>
//               <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
//                 <p className="text-sm text-gray-600">Contractor Firm</p>
//                 <p className="font-bold text-lg text-gray-800">{formData.contractorFirm}</p>
//               </div>
//               <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
//                 <p className="text-sm text-gray-600">Contractor Name</p>
//                 <p className="font-bold text-lg text-gray-800">{formData.contractorName}</p>
//               </div>
//               <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
//                 <p className="text-sm text-gray-600">RCC Bill No</p>
//                 <p className="font-bold text-lg text-gray-800">{formData.rccBillNo}</p>
//               </div>
//             </div>

//             {/* Table - Photo Evidence After Quality */}
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">UID</th>
//                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Work Name</th>
//                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Work Desc</th>
//                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Area/Qty</th>
//                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Unit</th>
//                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quality</th>
//                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
//                       Photo Evidence After Work 2
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Global Data</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredData.map((item, index) => (
//                     <tr key={item.UID} className="hover:bg-gray-50">
//                       <td className="px-4 py-4 whitespace-nowrap font-semibold text-indigo-600">{item.UID}</td>
//                       <td className="px-4 py-4 text-gray-800">{item.workName}</td>
//                       <td className="px-4 py-4 text-gray-600 text-sm max-w-xs">{item.workDesc}</td>
//                       <td className="px-4 py-4">
//                         <input
//                           type="number"
//                           value={editableData[index]?.areaQuantity || ''}
//                           onChange={(e) => handleInputChange(index, 'areaQuantity', e.target.value)}
//                           placeholder="Qty"
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                         />
//                       </td>
//                       <td className="px-4 py-4">
//                         <select
//                           value={editableData[index]?.unit || ''}
//                           onChange={(e) => handleInputChange(index, 'unit', e.target.value)}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white"
//                         >
//                            <option value="">Unit</option>
//                            <option value="sqm">Sqft</option>
//                            <option value="cum">Nos</option>
//                            <option value="rmt">Point</option>
//                            <option value="nos">Rft</option>
//                            <option value="kg">Kg</option>
//                            <option value="ton">Hours</option>
//                            <option value="ton">KW</option>
//                            <option value="ton">Ltr</option>
//                            <option value="ton">Cum</option>
//                         </select>
//                       </td>
//                       <td className="px-4 py-4">
//                         <select
//                           value={editableData[index]?.qualityApprove || ''}
//                           onChange={(e) => handleInputChange(index, 'qualityApprove', e.target.value)}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white"
//                         >
//                           <option value="">Status</option>
//                           <option value="approved">Approved</option>
//                           <option value="rejected">Rejected</option>
//                           <option value="pending">Pending</option>
//                         </select>
//                       </td>

//                       {/* Photo Evidence After Work 2 - After Quality */}
//                       <td className="px-4 py-4">
//                         <input
//                           type="file"
//                           accept="image/*"
//                           onChange={(e) => handlePhotoEvidenceChange(index, e.target.files[0])}
//                           className="w-full text-sm text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
//                         />
//                         {editableData[index]?.photoEvidenceAfterWork2 && (
//                           <p className="text-xs text-green-600 mt-1 truncate">
//                             Selected: {editableData[index].photoEvidenceAfterWork2.name}
//                           </p>
//                         )}
//                       </td>

//                       {/* Global Data - Last */}
//                       <td className="px-4 py-4">
//                         <div className="space-y-1 text-xs">
//                           {globalFiles.measurementSheet && <p className="text-green-600 truncate">M: {globalFiles.measurementSheet.name}</p>}
//                           {globalFiles.attendanceSheet && <p className="text-green-600 truncate">A: {globalFiles.attendanceSheet.name}</p>}
//                           {globalStatus && <p className="font-semibold text-indigo-600">Status: {globalStatus}</p>}
//                           {!globalFiles.measurementSheet && !globalFiles.attendanceSheet && !globalStatus && <p className="text-gray-400">—</p>}
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Submit */}
//             {filteredData.length > 0 && (
//               <div className="flex justify-end mt-6">
//                 <button
//                   onClick={handleSubmitData}
//                   disabled={!globalFiles.measurementSheet || !globalFiles.attendanceSheet || !globalStatus}
//                   className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Submit All ({filteredData.length} Records)
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Bill_Checked;





import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  FileText,
  Loader2,
  AlertCircle,
  Upload,
  CheckCircle
} from 'lucide-react';
import {
  useGetContractorBillCheckedQuery,
  useGetEnquiryCaptureBillingQuery,
  useSaveBillCheckedMutation
} from '../../features/billing/billCheckedSlice';

const Bill_Checked = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    contractorFirm: '',
    contractorName: '',
    rccBillNo: '',
    rccBillDescription: '',
    vendorBillNo: ''
  });
  const [filteredData, setFilteredData] = useState([]);
  const [editableData, setEditableData] = useState([]);
  const [globalFiles, setGlobalFiles] = useState({
    measurementSheet: null,
    attendanceSheet: null
  });
  const [globalStatus, setGlobalStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // RTK Query Hooks
  const {
    data: enquiryData,
    isLoading: loadingDropdowns,
    error: dropdownError
  } = useGetEnquiryCaptureBillingQuery();

  const {
    data: billsData,
    isLoading: loadingBills,
    error: billsError,
    refetch
  } = useGetContractorBillCheckedQuery();

  const [saveBillChecked] = useSaveBillCheckedMutation();

  // === FILE TO BASE64 HELPER ===
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // === MEMOIZED OPTIONS ===
  const projectOptions = useMemo(() => {
    if (!enquiryData?.projectIds || !enquiryData?.projectNames) return [];
    return enquiryData.projectIds.map((id, index) => ({
      id,
      name: enquiryData.projectNames[index] || 'Unknown Project'
    }));
  }, [enquiryData]);

  const contractorOptions = useMemo(() => {
    if (!enquiryData?.contractorFirmNames || !enquiryData?.contractorNames) return [];
    return enquiryData.contractorFirmNames.map((firm, index) => ({
      firm,
      name: enquiryData.contractorNames[index] || 'Unknown Contractor'
    }));
  }, [enquiryData]);

  const rccBillOptions = useMemo(() => {
    if (!billsData) return [];
    const uniqueBills = [...new Set(billsData.map(item => item.rccBillNo))].filter(Boolean);
    return uniqueBills.map(billNo => ({
      billNo,
      description: `Bill ${billNo}`,
      vendorBillNo: billsData.find(item => item.rccBillNo === billNo)?.vendorBillNo || ''
    }));
  }, [billsData]);

  // === HANDLERS ===
  const handleProjectIdChange = (e) => {
    const id = e.target.value;
    const selected = projectOptions.find(p => p.id === id);
    setFormData({ ...formData, projectId: id, projectName: selected?.name || '' });
  };

  const handleContractorFirmChange = (e) => {
    const firm = e.target.value;
    const selected = contractorOptions.find(c => c.firm === firm);
    setFormData({ ...formData, contractorFirm: firm, contractorName: selected?.name || '' });
  };

  const handleRccBillChange = (e) => {
    const billNo = e.target.value;
    const selectedBill = rccBillOptions.find(b => b.billNo === billNo);
    setFormData({
      ...formData,
      rccBillNo: billNo,
      rccBillDescription: selectedBill?.description || '',
      vendorBillNo: selectedBill?.vendorBillNo || ''
    });
  };

  const handleNext = () => {
    if (!formData.projectId || !formData.contractorFirm || !formData.rccBillNo) {
      alert('कृपया सभी फ़ील्ड भरें');
      return;
    }

    if (!billsData) {
      alert('Bills data not loaded yet');
      return;
    }

    const filtered = billsData.filter(item => {
      return (
        item.projectId === formData.projectId &&
        item.contractorName === formData.contractorName &&
        item.rccBillNo === formData.rccBillNo
      );
    });

    if (filtered.length === 0) {
      alert('कोई बिल नहीं मिला। कृपया सही जानकारी चुनें।');
      return;
    }

    setFilteredData(filtered);
    const initialEditableData = filtered.map(item => ({
      uid: item.UID,
      areaQuantity: '',
      unit: '',
      qualityApprove: '',
      photoEvidenceAfterWork2: null
    }));
    setEditableData(initialEditableData);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setFilteredData([]);
    setEditableData([]);
    setGlobalFiles({ measurementSheet: null, attendanceSheet: null });
    setGlobalStatus('');
    setSaveSuccess(false);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...editableData];
    updated[index][field] = value;
    setEditableData(updated);
  };

  const handlePhotoEvidenceChange = (index, file) => {
    const updated = [...editableData];
    updated[index].photoEvidenceAfterWork2 = file;
    setEditableData(updated);
  };

  // === SUBMIT WITH BASE64 UPLOAD ===
  const handleSubmitData = async () => {
    if (!globalFiles.measurementSheet || !globalFiles.attendanceSheet || !globalStatus) {
      alert('कृपया Measurement Sheet, Attendance Sheet और Status चुनें।');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Convert Global Files to Base64
      const measurementSheetBase64 = await fileToBase64(globalFiles.measurementSheet);
      const attendanceSheetBase64 = await fileToBase64(globalFiles.attendanceSheet);

      // Convert Per-row Photos to Base64
      const itemsWithBase64 = await Promise.all(
        editableData.map(async (item, index) => {
          const photoBase64 = item.photoEvidenceAfterWork2
            ? await fileToBase64(item.photoEvidenceAfterWork2)
            : null;

          return {
            uid: filteredData[index].UID,
            areaQuantity2: item.areaQuantity || '',
            unit2: item.unit || '',
            qualityApprove2: item.qualityApprove || '',
            photoEvidenceBase64: photoBase64
          };
        })
      );

      // Prepare Final Payload
      const payload = {
        uids: filteredData.map(item => item.UID),
        status: globalStatus,
        measurementSheetBase64,
        attendanceSheetBase64,
        items: itemsWithBase64
      };

      // Call API
      const result = await saveBillChecked(payload).unwrap();

      // Success
      setSaveSuccess(true);
      alert(`सफलतापूर्वक अपडेट! ${result.updated?.length || 0} रिकॉर्ड्स अपडेट हुए।`);
      refetch(); // Refresh list

      setTimeout(() => {
        handleBack();
      }, 2000);

    } catch (error) {
      console.error('Save failed:', error);
      const msg = error?.data?.error || error.message || 'Unknown error';
      alert('सेव करने में त्रुटि: ' + msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FileText className="text-indigo-600" size={32} />
                Bill Checked Dashboard
              </h1>
              <p className="text-gray-600 mt-2">बिल चेकिंग और वेरिफिकेशन सिस्टम</p>
            </div>
            <div className="flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <ChevronRight className="text-gray-400" size={20} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-600" size={24} />
            <p className="font-semibold text-green-800">Data saved successfully!</p>
          </div>
        )}

        {/* Error */}
        {(dropdownError || billsError) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-red-800">Error loading data</p>
              <p className="text-sm text-red-600">
                {dropdownError?.data?.message || billsError?.data?.message || 'Please check your connection'}
              </p>
            </div>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">प्रोजेक्ट और कॉन्ट्रैक्टर की जानकारी</h2>

            {loadingDropdowns || loadingBills ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
                <span className="ml-4 text-gray-600">Loading...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Project ID *</label>
                    <select value={formData.projectId} onChange={handleProjectIdChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                      <option value="">Select Project ID</option>
                      {projectOptions.map(p => (
                        <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
                    <input type="text" value={formData.projectName} readOnly className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contractor Firm Name *</label>
                    <select value={formData.contractorFirm} onChange={handleContractorFirmChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                      <option value="">Select Firm</option>
                      {contractorOptions.map(c => (
                        <option key={c.firm} value={c.firm}>{c.firm}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contractor Name</label>
                    <input type="text" value={formData.contractorName} readOnly className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">RCC Bill No *</label>
                    <select value={formData.rccBillNo} onChange={handleRccBillChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                      <option value="">Select Bill</option>
                      {rccBillOptions.map(b => (
                        <option key={b.billNo} value={b.billNo}>
                          {b.billNo} - {b.description} {b.vendorBillNo ? `| Vendor: ${b.vendorBillNo}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Selected Bill</p>
                      <p className="font-semibold text-blue-800">
                        {formData.rccBillNo || 'Not Selected'}
                        {formData.rccBillDescription && (
                          <span className="block text-sm font-normal text-blue-700">
                            ({formData.rccBillDescription})
                          </span>
                        )}
                        {formData.vendorBillNo && (
                          <span className="block text-xs font-medium text-blue-900 mt-1">
                            Vendor Bill: {formData.vendorBillNo}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105">
                    Next <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-end mb-6">
              <button onClick={handleBack} className="text-indigo-600 hover:text-indigo-800 font-semibold">Back</button>
            </div>

            {/* GLOBAL INPUTS */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">
                Global Inputs (सभी {filteredData.length} UID में लागू)
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Measurement Sheet URL 2 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setGlobalFiles(prev => ({ ...prev, measurementSheet: e.target.files[0] }))}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
                  />
                  {globalFiles.measurementSheet && (
                    <p className="text-xs text-green-600 mt-1 truncate flex items-center gap-1">
                      <Upload size={14} /> {globalFiles.measurementSheet.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attendance Sheet URL 2 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setGlobalFiles(prev => ({ ...prev, attendanceSheet: e.target.files[0] }))}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
                  />
                  {globalFiles.attendanceSheet && (
                    <p className="text-xs text-green-600 mt-1 truncate flex items-center gap-1">
                      <Upload size={14} /> {globalFiles.attendanceSheet.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={globalStatus}
                    onChange={(e) => setGlobalStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Select Status</option>
                    <option value="Done">Done</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-yellow-700 mt-3">
                ये सभी फील्ड्स सभी UID में एक साथ लागू हो जाएंगी।
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-gray-600">Project</p>
                <p className="font-bold text-lg text-gray-800">{formData.projectName}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <p className="text-sm text-gray-600">Contractor Firm</p>
                <p className="font-bold text-lg text-gray-800">{formData.contractorFirm}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                <p className="text-sm text-gray-600">Contractor Name</p>
                <p className="font-bold text-lg text-gray-800">{formData.contractorName}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                <p className="text-sm text-gray-600">RCC Bill No</p>
                <p className="font-bold text-lg text-gray-800">
                  {formData.rccBillNo || '—'}
                  {formData.rccBillDescription && (
                    <span className="block text-sm font-normal text-orange-700 mt-1">
                      {formData.rccBillDescription}
                    </span>
                  )}
                </p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500">
                <p className="text-sm text-gray-600">Vendor Bill No</p>
                <p className="font-bold text-lg text-gray-800">
                  {formData.vendorBillNo || '—'}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">UID</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Work Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Work Desc</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Area/Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quality</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Photo Evidence After Work 2</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Global Data</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item, index) => (
                    <tr key={item.UID} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap font-semibold text-indigo-600">{item.UID}</td>
                      <td className="px-4 py-4 text-gray-800">{item.workName}</td>
                      <td className="px-4 py-4 text-gray-600 text-sm max-w-xs">{item.workDesc}</td>
                      <td className="px-4 py-4">
                        <input
                          type="number"
                          value={editableData[index]?.areaQuantity || ''}
                          onChange={(e) => handleInputChange(index, 'areaQuantity', e.target.value)}
                          placeholder="Qty"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={editableData[index]?.unit || ''}
                          onChange={(e) => handleInputChange(index, 'unit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                          <option value="">Unit</option>
                          <option value="sqm">Sqft</option>
                          <option value="cum">Nos</option>
                          <option value="rmt">Point</option>
                          <option value="nos">Rft</option>
                          <option value="kg">Kg</option>
                          <option value="ton">Hours</option>
                          <option value="ton">KW</option>
                          <option value="ton">Ltr</option>
                          <option value="ton">Cum</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={editableData[index]?.qualityApprove || ''}
                          onChange={(e) => handleInputChange(index, 'qualityApprove', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                          <option value="">Status</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="pending">Pending</option>
                        </select>
                      </td>

                      <td className="px-4 py-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoEvidenceChange(index, e.target.files[0])}
                          className="w-full text-sm text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                        />
                        {editableData[index]?.photoEvidenceAfterWork2 && (
                          <p className="text-xs text-green-600 mt-1 truncate flex items-center gap-1">
                            <Upload size={14} /> {editableData[index].photoEvidenceAfterWork2.name}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1 text-xs">
                          {globalFiles.measurementSheet && <p className="text-green-600 truncate">M: {globalFiles.measurementSheet.name}</p>}
                          {globalFiles.attendanceSheet && <p className="text-green-600 truncate">A: {globalFiles.attendanceSheet.name}</p>}
                          {globalStatus && <p className="font-semibold text-indigo-600">Status: {globalStatus}</p>}
                          {!globalFiles.measurementSheet && !globalFiles.attendanceSheet && !globalStatus && <p className="text-gray-400">—</p>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit Button */}
            {filteredData.length > 0 && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSubmitData}
                  disabled={isSaving || !globalFiles.measurementSheet || !globalFiles.attendanceSheet || !globalStatus}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Saving...
                    </>
                  ) : (
                    <>Submit All ({filteredData.length} Records)</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bill_Checked;