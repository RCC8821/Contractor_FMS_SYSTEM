import React, { useState } from 'react';
import {
  useGetProjectDropdownsQuery,
  useSubmitContractorFormMutation,
} from '../../features/api/apiSlice';

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const emptyContractor = () => ({
  Contractor_Name_2: '',
  Contractor_Firm_Name_2: '',
  Contractor_Contact_No_2: '',
  Contractor_Type_2: '',
  GST_Certificate_2: '',
  Basic_Turn_Over_2: '',
  No_Of_Project_2: '',
  No_Of_Current_Project_2: '',
  Estimated_Area_Qty_3: '',
  Unit_3: '',
  Rate_3: '',
  Total_Value_3: '',
  Quotation_Pdf_Base64: '',
  Quotation_File_Name: '',
  Quotation_Pdf_Url_3: '',
  _fileName: '',
});

const ContractorRequirementForm = () => {
  const {
    data: dropdowns = {
      projectNames: [],
      projectTypes: [],
      workCategories: [],
      contractorTypes: [],
      units: [],
    },
    isLoading: loadingDropdowns,
    isError: dropdownError,
  } = useGetProjectDropdownsQuery();

  const [submitForm, { isLoading: submitting }] = useSubmitContractorFormMutation();

  const [projectData, setProjectData] = useState({
    Project_Name_1: '',
    Project_Location_1: '',
    Project_Type_1: '',
    Work_Category_1: '',
    Work_Description_1: '',
    Remark_1: '',
  });

  const [contractors, setContractors] = useState([emptyContractor()]);

  const handleProjectChange = (e) => {
    setProjectData({ ...projectData, [e.target.name]: e.target.value });
  };

  const handleContractorChange = (index, e) => {
    const { name, value } = e.target;
    setContractors((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: value };

      // Auto Calculation Logic: Qty * Rate
      if (name === 'Estimated_Area_Qty_3' || name === 'Rate_3') {
        const qty = parseFloat(name === 'Estimated_Area_Qty_3' ? value : updated[index].Estimated_Area_Qty_3) || 0;
        const rate = parseFloat(name === 'Rate_3' ? value : updated[index].Rate_3) || 0;
        updated[index].Total_Value_3 = qty && rate ? (qty * rate).toFixed(2) : '';
      }
      return updated;
    });
  };

  const handleFileSelect = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Only PDF or Image (JPG/PNG/WEBP) allowed');
      e.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10MB');
      e.target.value = '';
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setContractors((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          Quotation_Pdf_Base64: base64,
          Quotation_File_Name: file.name,
          _fileName: file.name,
          Quotation_Pdf_Url_3: '',
        };
        return updated;
      });
    } catch (err) {
      console.error(err);
      alert('Failed to read file');
      e.target.value = '';
    }
  };

  const clearFile = (index) => {
    setContractors((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        Quotation_Pdf_Base64: '',
        Quotation_File_Name: '',
        Quotation_Pdf_Url_3: '',
        _fileName: '',
      };
      return updated;
    });
  };

  const addContractor = () => setContractors((prev) => [...prev, emptyContractor()]);
  const removeContractor = (index) => setContractors((prev) => prev.filter((_, i) => i !== index));

  const validateAll = () => {
    if (!projectData.Project_Name_1.trim()) return 'Project Name is required';
    if (!projectData.Project_Type_1.trim()) return 'Project Type is required';
    if (!projectData.Work_Category_1.trim()) return 'Work Category is required';
    if (!projectData.Project_Location_1.trim()) return 'Project Location is required';
    if (!projectData.Work_Description_1.trim()) return 'Work Description is required';

    for (let i = 0; i < contractors.length; i++) {
      const c = contractors[i];
      const n = i + 1;

      if (!c.Contractor_Name_2.trim()) return `Contractor ${n}: Name is required`;
      if (!c.Contractor_Firm_Name_2.trim()) return `Contractor ${n}: Firm Name is required`;
      if (!/^\d{10}$/.test(c.Contractor_Contact_No_2)) return `Contractor ${n}: Valid 10-digit Contact No is required`;
      if (!c.Contractor_Type_2.trim()) return `Contractor ${n}: Contractor Type is required`;
      if (!c.GST_Certificate_2.trim()) return `Contractor ${n}: GST Certificate is required`;
      if (!c.Basic_Turn_Over_2.toString().trim()) return `Contractor ${n}: Turnover is required`;
      if (!c.No_Of_Project_2.toString().trim()) return `Contractor ${n}: No. of Projects Done is required`;
      if (!c.No_Of_Current_Project_2.toString().trim()) return `Contractor ${n}: Current Running Projects is required`;
      if (!c.Estimated_Area_Qty_3.toString().trim()) return `Contractor ${n}: Est. Area/Qty is required`;
      if (!c.Unit_3.trim()) return `Contractor ${n}: Unit is required`;
      if (!c.Rate_3.toString().trim()) return `Contractor ${n}: Rate is required`;
      if (!c.Total_Value_3.toString().trim()) return `Contractor ${n}: Total Value is required`;
      if (!c.Quotation_Pdf_Base64 && !c._fileName) return `Contractor ${n}: Quotation File (PDF/Photo) is required`;
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

    const payload = contractors.map(({ _fileName, ...c }) => ({
      ...projectData,
      ...c,
    }));

    try {
      await submitForm(payload).unwrap();
      alert('Form submitted successfully! UID & Quotation No auto-generated.');
      setProjectData({
        Project_Name_1: '', Project_Location_1: '', Project_Type_1: '', Work_Category_1: '', Work_Description_1: '', Remark_1: '',
      });
      setContractors([emptyContractor()]);
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || 'Submit failed');
    }
  };

  const req = <span className="text-red-500">*</span>;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-slate-900 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Contractor Requirement Form</h2>
          <p className="text-slate-400 text-sm mt-1">Sab fields required · Sirf Remark optional</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8" noValidate>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-blue-600 border-b border-blue-100 pb-2 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm">1</span>
              Project Information
            </h3>

            {dropdownError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                Dropdown load fail. Check: <b>GET /api/project-dropdowns</b>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Name {req}</label>
                <select name="Project_Name_1" value={projectData.Project_Name_1} onChange={handleProjectChange} required className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500">
                  <option value="">{loadingDropdowns ? 'Loading...' : 'Select Project'}</option>
                  {dropdowns.projectNames.map((n, i) => <option key={i} value={n}>{n}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Type {req}</label>
                <select name="Project_Type_1" value={projectData.Project_Type_1} onChange={handleProjectChange} required className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Type</option>
                  {dropdowns.projectTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Work Category {req}</label>
                <select name="Work_Category_1" value={projectData.Work_Category_1} onChange={handleProjectChange} required className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Category</option>
                  {dropdowns.workCategories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Location {req}</label>
                <input type="text" name="Project_Location_1" value={projectData.Project_Location_1} onChange={handleProjectChange} required className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Enter location" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Work Description {req}</label>
                <textarea name="Work_Description_1" value={projectData.Work_Description_1} onChange={handleProjectChange} required rows={2} placeholder="Describe the work..." className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Remark <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea name="Remark_1" value={projectData.Remark_1} onChange={handleProjectChange} rows={2} placeholder="Any additional remarks..." className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-emerald-600 border-b border-emerald-100 pb-2 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-sm">2</span>
              Contractor & Quotation Details
            </h3>

            {contractors.map((contractor, index) => (
              <div key={index} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative">
                {contractors.length > 1 && (
                  <button type="button" onClick={() => removeContractor(index)} className="absolute top-4 right-4 bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-200">Remove</button>
                )}

                <h4 className="font-bold text-slate-700 mb-4">Contractor {index + 1}</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Contractor Name {req}</label>
                    <input type="text" name="Contractor_Name_2" value={contractor.Contractor_Name_2} onChange={(e) => handleContractorChange(index, e)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Firm Name {req}</label>
                    <input type="text" name="Contractor_Firm_Name_2" value={contractor.Contractor_Firm_Name_2} onChange={(e) => handleContractorChange(index, e)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Contact No {req}</label>
                    <input type="tel" maxLength="10" name="Contractor_Contact_No_2" value={contractor.Contractor_Contact_No_2} onChange={(e) => handleContractorChange(index, e)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Contractor Type {req}</label>
                    <select name="Contractor_Type_2" value={contractor.Contractor_Type_2} onChange={(e) => handleContractorChange(index, e)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                      <option value="">Select Type</option>
                      {dropdowns.contractorTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">GST Certificate {req}</label>
                    <select name="GST_Certificate_2" value={contractor.GST_Certificate_2} onChange={(e) => handleContractorChange(index, e)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Turnover {req}</label>
                    <input type="text" name="Basic_Turn_Over_2" value={contractor.Basic_Turn_Over_2} onChange={(e) => handleContractorChange(index, e)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Projects Done {req}</label>
                    <input type="number" name="No_Of_Project_2" value={contractor.No_Of_Project_2} onChange={(e) => handleContractorChange(index, e)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Current Projects {req}</label>
                    <input type="number" name="No_Of_Current_Project_2" value={contractor.No_Of_Current_Project_2} onChange={(e) => handleContractorChange(index, e)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-4 border-b pb-2 mb-1">
                    <h5 className="text-sm font-bold text-slate-600">Estimation & Quotation</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5">Quotation No backend pe auto · File required</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Est. Area/Qty {req}</label>
                    <input type="number" step="any" name="Estimated_Area_Qty_3" value={contractor.Estimated_Area_Qty_3} onChange={(e) => handleContractorChange(index, e)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  
                  {/* ====== UNIT DROPDOWN ====== */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Unit {req}</label>
                    <select name="Unit_3" value={contractor.Unit_3} onChange={(e) => handleContractorChange(index, e)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                      <option value="">Select Unit</option>
                      {dropdowns.units?.map((u, i) => (
                        <option key={i} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Rate {req}</label>
                    <input type="number" step="any" name="Rate_3" value={contractor.Rate_3} onChange={(e) => handleContractorChange(index, e)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-600 mb-1">Total Value {req}</label>
                    <input type="text" readOnly value={contractor.Total_Value_3} placeholder="Auto" className="w-full px-3 py-2 border border-emerald-200 bg-emerald-50 rounded-lg text-sm font-bold text-emerald-700" />
                  </div>

                  <div className="lg:col-span-2 md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Quotation File (PDF / Photo) {req}</label>
                    {!contractor._fileName ? (
                      <input type="file" accept=".pdf,image/jpeg,image/png,image/jpg,image/webp" onChange={(e) => handleFileSelect(index, e)} required className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100 border border-gray-300 rounded-lg cursor-pointer" />
                    ) : (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <span className="text-xs text-green-700 font-medium truncate flex-1">✅ {contractor._fileName}</span>
                        <button type="button" onClick={() => clearFile(index)} className="text-xs text-red-600 font-bold">Remove</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button type="submit" disabled={submitting} className={`w-full md:w-auto px-10 py-3.5 rounded-xl font-bold text-white text-lg shadow-lg ${submitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {submitting ? 'Uploading & Saving...' : 'Submit Form Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractorRequirementForm;