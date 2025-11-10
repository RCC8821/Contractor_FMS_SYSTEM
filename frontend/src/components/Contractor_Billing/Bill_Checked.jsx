





import React, { useState, useMemo } from 'react';
import { ChevronRight, FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
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
    rccBillNo: ''
  });
  const [filteredData, setFilteredData] = useState([]);
  const [editableData, setEditableData] = useState([]);

  // GLOBAL FIELDS
  const [globalFiles, setGlobalFiles] = useState({
    measurementSheet: null,
    attendanceSheet: null
  });
  const [globalStatus, setGlobalStatus] = useState('');

  // RTK Query
  const { 
    data: enquiryData, 
    isLoading: loadingDropdowns, 
    error: dropdownError 
  } = useGetEnquiryCaptureBillingQuery();

  const { 
    data: billsData, 
    isLoading: loadingBills, 
    error: billsError 
  } = useGetContractorBillCheckedQuery();

  const [saveBillChecked, { isLoading: isSaving }] = useSaveBillCheckedMutation();

  // Helper: Convert File to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Dropdown Options
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
    return uniqueBills.map(billNo => ({ billNo, description: `Bill ${billNo}` }));
  }, [billsData]);

  // Handlers
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
    setFormData({ ...formData, rccBillNo: e.target.value });
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
      areaQuantity2: '',
      unit2: '',
      qualityApprove2: '',
      photoEvidenceBase64: null
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

  // SUBMIT with Base64 conversion
  const handleSubmitData = async () => {
    if (!globalFiles.measurementSheet || !globalFiles.attendanceSheet || !globalStatus) {
      alert('कृपया Measurement Sheet, Attendance Sheet और Status चुनें।');
      return;
    }

    try {
      // Convert global images to base64
      const measurementSheetBase64 = await convertToBase64(globalFiles.measurementSheet);
      const attendanceSheetBase64 = await convertToBase64(globalFiles.attendanceSheet);

      if (!measurementSheetBase64 || !attendanceSheetBase64) {
        alert('Image conversion failed. Please try again.');
        return;
      }

      // Prepare items array with base64 photo evidence
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

      // Extract UIDs
      const uids = editableData.map(item => item.uid);

      // Prepare payload
      const payload = {
        uids,
        status: globalStatus,
        measurementSheetBase64,
        attendanceSheetBase64,
        items: itemsWithBase64
      };

      console.log('Submitting payload:', { 
        uidsCount: uids.length, 
        itemsCount: itemsWithBase64.length,
        status: globalStatus 
      });

      // Call API
      const result = await saveBillChecked(payload).unwrap();

      console.log('API Response:', result);

      if (result.success) {
        alert(`✅ डेटा सफलतापूर्वक सबमिट! (${result.totalProcessed} रिकॉर्ड्स)\n\nUpdated: ${result.updated?.length || 0}\nNot Found: ${result.notFound?.length || 0}`);
        
        // Reset form
        handleBack();
        setFormData({
          projectId: '',
          projectName: '',
          contractorFirm: '',
          contractorName: '',
          rccBillNo: ''
        });
      } else {
        alert('❌ Error: ' + (result.error || 'Unknown error'));
      }

    } catch (error) {
      console.error('Submit Error:', error);
      alert('❌ Failed to submit data: ' + (error?.data?.error || error.message || 'Unknown error'));
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
                        <option key={b.billNo} value={b.billNo}>{b.billNo} - {b.description}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Selected Bill</p>
                      <p className="font-semibold text-blue-800">{formData.rccBillNo || 'Not Selected'}</p>
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
            <div className="flex justify-between items-center mb-6">
              <button onClick={handleBack} className="text-indigo-600 hover:text-indigo-800 font-semibold">← Back</button>
              {isSaving && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Saving...</span>
                </div>
              )}
            </div>

            {/* GLOBAL INPUTS */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">
                Global Inputs (सभी {filteredData.length} UID में लागू)
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Measurement Sheet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setGlobalFiles(prev => ({ ...prev, measurementSheet: e.target.files[0] }))}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
                  />
                  {globalFiles.measurementSheet && (
                    <p className="text-xs text-green-600 mt-1 truncate flex items-center gap-1">
                      <CheckCircle size={12} /> {globalFiles.measurementSheet.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attendance Sheet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setGlobalFiles(prev => ({ ...prev, attendanceSheet: e.target.files[0] }))}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
                  />
                  {globalFiles.attendanceSheet && (
                    <p className="text-xs text-green-600 mt-1 truncate flex items-center gap-1">
                      <CheckCircle size={12} /> {globalFiles.attendanceSheet.name}
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
                ⚠️ ये सभी फील्ड्स सभी UID में एक साथ लागू हो जाएंगी।
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
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
                <p className="font-bold text-lg text-gray-800">{formData.rccBillNo}</p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">UID</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Work Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Work Desc</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Area/Qty 2</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Unit 2</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quality 2</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Photo Evidence 2</th>
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
                          value={editableData[index]?.areaQuantity2 || ''}
                          onChange={(e) => handleInputChange(index, 'areaQuantity2', e.target.value)}
                          placeholder="Qty"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={editableData[index]?.unit2 || ''}
                          onChange={(e) => handleInputChange(index, 'unit2', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                          <option value="">Unit</option>
                          <option value="Sqft">Sqft</option>
                          <option value="Nos">Nos</option>
                          <option value="Point">Point</option>
                          <option value="Rft">Rft</option>
                          <option value="Kg">Kg</option>
                          <option value="Hours">Hours</option>
                          <option value="KW">KW</option>
                          <option value="Ltr">Ltr</option>
                          <option value="Cum">Cum</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={editableData[index]?.qualityApprove2 || ''}
                          onChange={(e) => handleInputChange(index, 'qualityApprove2', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                          <option value="">Status</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoEvidenceChange(index, e.target.files[0])}
                          className="w-full text-sm text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                        />
                        {editableData[index]?.photoEvidenceFile && (
                          <p className="text-xs text-green-600 mt-1 truncate flex items-center gap-1">
                            <CheckCircle size={12} /> {editableData[index].photoEvidenceFile.name}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1 text-xs">
                          {globalFiles.measurementSheet && <p className="text-green-600 truncate">✓ Measurement</p>}
                          {globalFiles.attendanceSheet && <p className="text-green-600 truncate">✓ Attendance</p>}
                          {globalStatus && <p className="font-semibold text-indigo-600">Status: {globalStatus}</p>}
                          {!globalFiles.measurementSheet && !globalFiles.attendanceSheet && !globalStatus && <p className="text-gray-400">—</p>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit */}
            {filteredData.length > 0 && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSubmitData}
                  disabled={!globalFiles.measurementSheet || !globalFiles.attendanceSheet || !globalStatus || isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Saving...
                    </>
                  ) : (
                    <>
                      Submit All ({filteredData.length} Records)
                    </>
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