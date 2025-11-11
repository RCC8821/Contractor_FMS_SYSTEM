// Bill_Checked.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, FileText, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { 
  useGetContractorBillCheckedQuery, 
  useGetEnquiryCaptureBillingQuery,
  useSaveBillCheckedMutation 
} from '../../features/billing/billCheckedSlice'
const Bill_Checked = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    contractorFirm: '',
    contractorName: '',
    rccBillNo: ''
  });
  const [filteredData, setFilteredData] = useState([]);
  const [editableData, setEditableData] = useState([]);
  const [globalFiles, setGlobalFiles] = useState({
    measurementSheet: null,
    attendanceSheet: null
  });
  const [globalStatus, setGlobalStatus] = useState('');

  // RTK Query with REFETCH
 // RTK Query Hooks
const { 
  data: enquiryData, 
  isLoading: loadingDropdowns, 
  error: dropdownError,
  isError: isDropdownError,
  refetch: refetchEnquiry
} = useGetEnquiryCaptureBillingQuery(null, {
  refetchOnMountOrArgChange: true,
});

const { 
  data: billsData, 
  isLoading: loadingBills, 
  error: billsError,
  isError: isBillsError,
  refetch: refetchBills
} = useGetContractorBillCheckedQuery(null, {
  refetchOnMountOrArgChange: true,
});

// ← यहाँ जोड़ो
useEffect(() => {
  console.log('Forcing refetch...');
  refetchEnquiry();
  refetchBills();
}, [refetchEnquiry, refetchBills]);

  const [saveBillChecked, { isLoading: isSaving }] = useSaveBillCheckedMutation();

  // DEBUG
  console.log('Dropdowns:', { loadingDropdowns, isDropdownError, dropdownError, enquiryData });
  console.log('Bills:', { loadingBills, isBillsError, billsError, billsData });

  // Convert File to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Dropdown Options
  const projectOptions = useMemo(() => {
    if (!enquiryData?.projectIds?.length) return [];
    return enquiryData.projectIds.map((id, i) => ({
      id,
      name: enquiryData.projectNames[i] || 'Unknown'
    }));
  }, [enquiryData]);

  const contractorOptions = useMemo(() => {
    if (!enquiryData?.contractorFirmNames?.length) return [];
    return enquiryData.contractorFirmNames.map((firm, i) => ({
      firm,
      name: enquiryData.contractorNames[i] || 'Unknown'
    }));
  }, [enquiryData]);

  const rccBillOptions = useMemo(() => {
    if (!billsData?.length) return [];
    const unique = [...new Set(billsData.map(b => b.rccBillNo))].filter(Boolean);
    return unique.map(billNo => ({ billNo, description: `Bill ${billNo}` }));
  }, [billsData]);

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

  const handleRccBillChange = (e) => {
    setFormData(prev => ({ ...prev, rccBillNo: e.target.value }));
  };

  const handleNext = () => {
    if (!formData.projectId || !formData.contractorFirm || !formData.rccBillNo) {
      alert('सभी फ़ील्ड भरें');
      return;
    }

    const filtered = billsData?.filter(item => 
      item.projectId === formData.projectId &&
      item.contractorName === formData.contractorName &&
      item.rccBillNo === formData.rccBillNo
    ) || [];

    if (filtered.length === 0) {
      alert('कोई बिल नहीं मिला');
      return;
    }

    setFilteredData(filtered);
    setEditableData(filtered.map(item => ({
      uid: item.UID,
      areaQuantity2: '',
      unit2: '',
      qualityApprove2: '',
      photoEvidenceFile: null
    })));
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setFilteredData([]);
    setEditableData([]);
    setGlobalFiles({ measurementSheet: null, attendanceSheet: null });
    setGlobalStatus('');
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...editableData];
    updated[index][field] = value;
    setEditableData(updated);
  };

  const handlePhotoEvidenceChange = (index, file) => {
    const updated = [...editableData];
    updated[index].photoEvidenceFile = file;
    setEditableData(updated);
  };

  const handleSubmitData = async () => {
    if (!globalFiles.measurementSheet || !globalFiles.attendanceSheet || !globalStatus) {
      alert('Measurement Sheet, Attendance Sheet और Status चुनें');
      return;
    }

    try {
      const measurementSheetBase64 = await convertToBase64(globalFiles.measurementSheet);
      const attendanceSheetBase64 = await convertToBase64(globalFiles.attendanceSheet);

      const itemsWithBase64 = await Promise.all(
        editableData.map(async (item) => {
          const photoBase64 = item.photoEvidenceFile 
            ? await convertToBase64(item.photoEvidenceFile)
            : null;
          return {
            uid: item.uid,
            areaQuantity2: item.areaQuantity2 || '',
            unit2: item.unit2 || '',
            qualityApprove2: item.qualityApprove2 || '',
            photoEvidenceBase64: photoBase64
          };
        })
      );

      const payload = {
        uids: editableData.map(i => i.uid),
        status: globalStatus,
        measurementSheetBase64,
        attendanceSheetBase64,
        items: itemsWithBase64
      };

      const result = await saveBillChecked(payload).unwrap();
      if (result.success) {
        alert(`सफल! ${result.totalProcessed} रिकॉर्ड्स`);
        handleBack();
        setFormData({ projectId: '', projectName: '', contractorFirm: '', contractorName: '', rccBillNo: '' });
      }
    } catch (error) {
      alert('Save failed: ' + (error?.data?.error || 'Unknown error'));
    }
  };

  // RETRY BUTTON
  const handleRetry = () => {
    refetchEnquiry();
    refetchBills();
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
              <p className="text-gray-600 mt-2">बिल चेकिंग और वेरिफिकेशन</p>
            </div>
            <div className="flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <ChevronRight className="text-gray-400" size={20} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
            </div>
          </div>
        </div>

        {/* ERROR + RETRY */}
        {(isDropdownError || isBillsError) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-center justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-red-800">डेटा लोड नहीं हुआ</p>
                <p className="text-sm text-red-600">
                  {dropdownError?.data?.message || billsError?.data?.message || 'कनेक्शन समस्या'}
                </p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {/* LOADING */}
        {(loadingDropdowns || loadingBills) && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center py-16">
            <Loader2 className="animate-spin mx-auto text-indigo-600" size={48} />
            <p className="mt-4 text-gray-600">
              {loadingDropdowns && 'Dropdowns लोड हो रहे...'}
              {loadingBills && ' | Bills लोड हो रहे...'}
            </p>
            <button
              onClick={handleRetry}
              className="mt-4 text-indigo-600 underline flex items-center gap-1 mx-auto"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && !(loadingDropdowns || loadingBills) && !isDropdownError && !isBillsError && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">प्रोजेक्ट और कॉन्ट्रैक्टर</h2>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project ID *</label>
                  <select value={formData.projectId} onChange={handleProjectIdChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select</option>
                    {projectOptions.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
                  <input type="text" value={formData.projectName} readOnly className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contractor Firm *</label>
                  <select value={formData.contractorFirm} onChange={handleContractorFirmChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select</option>
                    {contractorOptions.map(c => (
                      <option key={c.firm} value={c.firm}>{c.firm}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contractor Name</label>
                  <input type="text" value={formData.contractorName} readOnly className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">RCC Bill No *</label>
                  <select value={formData.rccBillNo} onChange={handleRccBillChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select</option>
                    {rccBillOptions.map(b => (
                      <option key={b.billNo} value={b.billNo}>{b.billNo}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Selected</p>
                    <p className="font-semibold text-blue-800">{formData.rccBillNo || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2">
                  Next <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <button onClick={handleBack} className="text-indigo-600 hover:text-indigo-800 font-semibold">Back</button>
              {isSaving && <div className="flex items-center gap-2 text-blue-600"><Loader2 className="animate-spin" size={20} /> Saving...</div>}
            </div>

            {/* Global Inputs */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">Global Inputs</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Measurement Sheet *</label>
                  <input type="file" accept="image/*" onChange={e => setGlobalFiles(prev => ({ ...prev, measurementSheet: e.target.files[0] }))} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:bg-yellow-100 file:text-yellow-700" />
                  {globalFiles.measurementSheet && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={12} /> {globalFiles.measurementSheet.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Attendance Sheet *</label>
                  <input type="file" accept="image/*" onChange={e => setGlobalFiles(prev => ({ ...prev, attendanceSheet: e.target.files[0] }))} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:bg-yellow-100 file:text-yellow-700" />
                  {globalFiles.attendanceSheet && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={12} /> {globalFiles.attendanceSheet.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                  <select value={globalStatus} onChange={e => setGlobalStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select</option>
                    <option value="Done">Done</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">UID</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Work Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Area/Qty 2</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Unit 2</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Quality 2</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Photo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item, i) => (
                    <tr key={item.UID}>
                      <td className="px-4 py-4 font-semibold text-indigo-600">{item.UID}</td>
                      <td className="px-4 py-4">{item.workName}</td>
                      <td className="px-4 py-4">
                        <input type="number" value={editableData[i]?.areaQuantity2 || ''} onChange={e => handleInputChange(i, 'areaQuantity2', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                      </td>
                      <td className="px-4 py-4">
                        <select value={editableData[i]?.unit2 || ''} onChange={e => handleInputChange(i, 'unit2', e.target.value)} className="w-full px-3 py-2 border rounded-md">
                          <option value="">Unit</option>
                          <option>Sqft</option><option>Nos</option><option>Rft</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <select value={editableData[i]?.qualityApprove2 || ''} onChange={e => handleInputChange(i, 'qualityApprove2', e.target.value)} className="w-full px-3 py-2 border rounded-md">
                          <option value="">Status</option>
                          <option>Approved</option><option>Rejected</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <input type="file" accept="image/*" onChange={e => handlePhotoEvidenceChange(i, e.target.files[0])} className="text-sm" />
                        {editableData[i]?.photoEvidenceFile && <p className="text-xs text-green-600"><CheckCircle size={12} /> {editableData[i].photoEvidenceFile.name}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSubmitData}
                disabled={isSaving || !globalFiles.measurementSheet || !globalFiles.attendanceSheet || !globalStatus}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <>Saving...</> : <>Submit ({filteredData.length})</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bill_Checked;