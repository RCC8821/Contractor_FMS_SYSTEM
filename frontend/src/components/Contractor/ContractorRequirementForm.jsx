import React, { useState, useEffect } from 'react';
import {
  useLazyGetProjectIdsQuery,
  useLazyGetEnquiryByIdQuery,
  useSubmitContractorFormMutation,
} from '../../features/api/apiSlice';

const ContractorRequirementForm = () => {
  const [step, setStep] = useState(1);
  const [projectId, setProjectId] = useState('');
  const [enquiryData, setEnquiryData] = useState(null);

  // Added Status in initial state
  const [contractors, setContractors] = useState([
    { Contractor_Name_2: '', Contractor_Contact_No_2: '', Contractor_Type: '', Remark: '', Status: '-----Select-----' }
  ]);

  // RTK Hooks
  const [getProjectIds, { data: projectIdsData = [], isLoading: loadingIds, isError: errorIds }] = useLazyGetProjectIdsQuery();
  const [getEnquiryById, { isLoading: loadingEnquiry }] = useLazyGetEnquiryByIdQuery();
  const [submitForm, { isLoading: submitting, isSuccess, isError, error, reset }] = useSubmitContractorFormMutation();

  useEffect(() => {
    getProjectIds();
  }, [getProjectIds]);

  const projectIds = projectIdsData || [];

  const handleIdSelect = async () => {
    if (!projectId) {
      alert('Please select a Project ID');
      return;
    }

    try {
      const data = await getEnquiryById(projectId).unwrap();
      if (data) {
        setEnquiryData(data);
        setStep(2);
      } else {
        alert('No data found for this Project ID');
      }
    } catch (err) {
      console.error('Failed to fetch enquiry data:', err);
      alert('Failed to load client data');
    }
  };

  const addContractor = () => {
    setContractors(prev => [
      ...prev,
      { Contractor_Name_2: '', Contractor_Contact_No_2: '', Contractor_Type: '', Remark: '', Status: 'Done' }
    ]);
  };

  const removeContractor = (index) => {
    setContractors(prev => prev.filter((_, i) => i !== index));
  };

  const handleContractorChange = (index, e) => {
    const { name, value } = e.target;
    setContractors(prev => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const validateAll = () => {
    for (let i = 0; i < contractors.length; i++) {
      const c = contractors[i];
      if (!c.Contractor_Name_2.trim()) return `Contractor ${i + 1}: Name is required`;
      if (!c.Contractor_Contact_No_2.trim() || !/^\d{10}$/.test(c.Contractor_Contact_No_2))
        return `Contractor ${i + 1}: Valid 10-digit number required`;
      if (!c.Contractor_Type.trim()) return `Contractor ${i + 1}: Type is required`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateAll();
    if (error) {
      alert(error);
      return;
    }

    // Send only required fields to backend
    const payload = contractors.map(c => ({
      Project_ID: projectId,                    // Must send
      ...enquiryData,                           // ← All original fields (Planned, Actual, etc.)
      ...c,                                     // Contractor fields
      // Timestamp will be auto-added in backend
    }));

    try {
      await submitForm(payload).unwrap();
      alert('All contractors submitted successfully!');
      resetForm();
    } catch (err) {
      console.error('Submit failed:', err);
      alert('Failed to submit. Check console.');
    }
  };

  const resetForm = () => {
    setStep(1);
    setProjectId('');
    setEnquiryData(null);
    setContractors([{ Contractor_Name_2: '', Contractor_Contact_No_2: '', Contractor_Type: '', Remark: '', Status: 'Done' }]);
  };

  useEffect(() => {
    if (isSuccess || isError) {
      const timer = setTimeout(() => reset(), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, isError, reset]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Contractor Requirement Form
        </h2>

        {/* Step 1: Project ID */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Project ID *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={loadingIds}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  {loadingIds ? 'Loading...' : 'Select Project ID'}
                </option>
                {projectIds.map((id) => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
              {errorIds && <p className="text-red-600 text-sm mt-1">Failed to load IDs</p>}
            </div>

            <button
              onClick={handleIdSelect}
              disabled={!projectId || loadingIds || loadingEnquiry}
              className={`w-full py-3 rounded-lg font-semibold text-white ${
                !projectId || loadingIds || loadingEnquiry
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loadingEnquiry ? 'Loading...' : 'Next'}
            </button>
          </div>
        )}

        {/* Step 2: Full Data + Contractors */}
        {step === 2 && enquiryData && (
          <div className="space-y-6">

            {/* Full Enquiry Data - SKIP Status & Contractor Done */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
              <h3 className="font-bold text-blue-900 mb-4 text-lg">Project & Client Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {Object.entries(enquiryData)
                  .filter(([key]) => key !== 'Status' && key !== 'Contractor Done')
                  .map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="font-medium text-gray-600">{key}:</span>
                      <span className="text-gray-900 font-medium break-words">
                        {value || '—'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Multiple Contractors */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Contractors ({contractors.length})</h3>

              {contractors.map((contractor, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 space-y-4 relative">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Contractor {index + 1}</h4>
                    {contractors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContractor(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        name="Contractor_Name_2"
                        value={contractor.Contractor_Name_2}
                        onChange={(e) => handleContractorChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Contractor name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact No. *</label>
                      <input
                        type="tel"
                        name="Contractor_Contact_No_2"
                        value={contractor.Contractor_Contact_No_2}
                        onChange={(e) => handleContractorChange(index, e)}
                        maxLength={10}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="10-digit"
                      />
                    </div>

                    {/* Changed: Dropdown → Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                      <input
                        type="text"
                        name="Contractor_Type"
                        value={contractor.Contractor_Type}
                        onChange={(e) => handleContractorChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Civil, Electrical"
                      />
                    </div>

                    {/* New: Status Dropdown with only "Done" */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                      <select
                        name="Status"
                        value={contractor.Status}
                        onChange={(e) => handleContractorChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Select">Select</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                      <textarea
                        name="Remark"
                        value={contractor.Remark}
                        onChange={(e) => handleContractorChange(index, e)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Notes..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* MOVED: Add Contractor Button Below */}
              <div className="flex justify-center mt-4">
                <button
                  type="button"
                  onClick={addContractor}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  + Add Contractor
                </button>
              </div>
            </div>

            {/* Messages */}
            {isError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {error?.data?.error || 'Submission failed'}
              </div>
            )}
            {isSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
                All contractors saved successfully!
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className={`flex-1 py-3 rounded-lg font-semibold text-white ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                }`}
              >
                {submitting ? 'Submitting...' : `Submit ${contractors.length} Contractor${contractors.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorRequirementForm;