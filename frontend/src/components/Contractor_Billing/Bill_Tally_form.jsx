
import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2, User, HardHat, FileText, Calendar,
  Calculator, Edit3, DollarSign, Package, ClipboardList,
  Search, ChevronDown, Plus, Trash2
} from 'lucide-react';
import {
  useGetProjectDataQuery,
  useSubmitMultipleWorksMutation
} from '../../features/billing/billTallySlice';

const Bill_Tally_form = () => {
  // 1. API Hooks
  const { data: projectResponse, isLoading, isFetching, error } = useGetProjectDataQuery();
  const [submitMultipleWorks, {
    isLoading: submitLoading,
    isSuccess: submitSuccess,
    isError: submitError,
    error: submitErr,
    data: submitRes
  }] = useSubmitMultipleWorksMutation();

  // 2. Project Options
  const projectOptions = useMemo(() => {
    if (!projectResponse?.data || !Array.isArray(projectResponse.data)) return [];
    return projectResponse.data
      .map(row => ({
        projectId: (row.projectId || row.Project_ID || row['Project_ID'] || '').toString(),
        projectName: (row.projectName || row.Project_name || row['Project_name'] || '').toString(),
        siteEngineerName: (row.siteEngineerName || row.Site_Engineer_Name || row['Site_Engineer_Name'] || '').toString(),
        contractorName: (row.contractorName || row['Contractor Name'] || row.E || '').toString(),
        contractorFirmName: (row.contractorFirmName || row['Contractor_Firm_Name'] || row.F || '').toString(),
        contractorWorkName: (row.contractorWorkName || row['Contractor Work Name'] || row.I || '').toString(),
        unit: (row.unit || row['Single_Unit'] || row['Single Unit'] || '').toString(),
      }))
      .filter(row => row.projectId);
  }, [projectResponse]);

  // 3. Shared State (Bill No. & Bill Date added here)
  const [shared, setShared] = useState({
    projectId: '',
    projectName: '',
    siteEngineerName: '',
    contractorName: '',
    contractorFirmName: '',
    billCopy: null,
    billNo: '',     // ← Shared for all works
    billDate: '',   // ← Shared for all works
  });

  // Auto-fill project details
  useEffect(() => {
    if (!shared.projectId) {
      setShared(p => ({ ...p, projectName: '', siteEngineerName: '' }));
      return;
    }
    const sel = projectOptions.find(p => p.projectId === shared.projectId);
    if (sel) {
      setShared(p => ({
        ...p,
        projectName: sel.projectName,
        siteEngineerName: sel.siteEngineerName,
      }));
    }
  }, [shared.projectId, projectOptions]);

  // Auto-fill Contractor Firm from Contractor Name
  useEffect(() => {
    if (!shared.contractorName) {
      setShared(p => ({ ...p, contractorFirmName: '' }));
      return;
    }
    const match = projectOptions.find(p => p.contractorName === shared.contractorName);
    if (match && match.contractorFirmName) {
      setShared(p => ({ ...p, contractorFirmName: match.contractorFirmName }));
    }
  }, [shared.contractorName, projectOptions]);

  // 4. Works (billNo & billDate removed)
  const [works, setWorks] = useState([{
    workName: '',
    workDescription: '',
    quantity: '',
    unit: '',
    rate: '',
    previousBillCopy: null,
    remark: '',
  }]);

  const addWork = () => setWorks(p => [...p, {
    workName: '', workDescription: '', quantity: '', unit: '', rate: '',
    previousBillCopy: null, remark: ''
  }]);

  const removeWork = (idx) => {
    if (works.length === 1) return;
    setWorks(p => p.filter((_, i) => i !== idx));
  };

  const updateWork = (idx, field, value) => {
    setWorks(p => p.map((w, i) => i === idx ? { ...w, [field]: value } : w));
  };

  // 5. File to Base64
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // 6. Format Timestamp: 03/11/2025 12:39:34
  const formatTimestamp = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };

  // 7. Submit Handler
  const handleSubmit = async (e) => {
  e.preventDefault();

  const billCopyBase64 = shared.billCopy ? await fileToBase64(shared.billCopy) : '';

  const worksPayload = await Promise.all(
    works.map(async (w) => ({
      workName: w.workName,
      workDescription: w.workDescription,
      quantity: w.quantity,
      unit: w.unit,
      rate: w.rate,
      amount: (parseFloat(w.quantity || '0') * parseFloat(w.rate || '0')).toFixed(2),
      previousBillCopy: w.previousBillCopy ? await fileToBase64(w.previousBillCopy) : '',
      remark: w.remark,
      billNo: shared.billNo,        // ← यहाँ जोड़ा
      billDate: shared.billDate,    // ← यहाँ जोड़ा
    }))
  );

  const payload = {
    projectId: shared.projectId,
    projectName: shared.projectName,
    siteEngineerName: shared.siteEngineerName,
    contractorName: shared.contractorName,
    contractorFirmName: shared.contractorFirmName,
    billCopy: billCopyBase64,
    works: worksPayload,
    timestamp: formatTimestamp()
  };

  try {
    const result = await submitMultipleWorks(payload).unwrap();

    if (result?.success) {
      setShared({
        projectId: '',
        projectName: '',
        siteEngineerName: '',
        contractorName: '',
        contractorFirmName: '',
        billCopy: null,
        billNo: '',
        billDate: ''
      });

      setWorks([{
        workName: '', workDescription: '', quantity: '', unit: '', rate: '',
        previousBillCopy: null, remark: ''
      }]);
    }
  } catch (err) {
    console.error('Submission failed:', err);
  }
};

  // 8. Helpers
  const getColumnValues = (field) =>
    [...new Set(projectOptions.map(r => r[field]).filter(Boolean))].sort();

  const calculateAmount = (qty, rate) => {
    const q = parseFloat(qty) || 0;
    const r = parseFloat(rate) || 0;
    return (q * r).toFixed(2);
  };

  // 9. Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <ClipboardList className="w-10 h-10 text-blue-600" />
            Bill Tally Form
          </h1>
          <p className="text-gray-600 mt-2">Submit contractor bill details</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-8">

          {/* Shared Section */}
          <div className="space-y-6">
            {/* Project ID */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                <Building2 className="w-5 h-5 text-blue-600" /> Project ID *
              </label>
              {isLoading || isFetching ? (
                <div className="px-4 py-3 bg-gray-100 rounded-lg">Loading projects...</div>
              ) : error ? (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  Failed to load projects
                </div>
              ) : (
                <ProjectDropdown
                  options={projectOptions}
                  value={shared.projectId}
                  onSelect={v => setShared(p => ({ ...p, projectId: v }))}
                />
              )}
            </div>

            {/* Project Name & Site Engineer */}
            <div className="grid md:grid-cols-2 gap-6">
              <InputWithIcon icon={<FileText className="w-5 h-5 text-blue-600" />} label="Project Name *" value={shared.projectName} readOnly />
              <InputWithIcon icon={<HardHat className="w-5 h-5 text-yellow-600" />} label="Site Engineer *" value={shared.siteEngineerName} readOnly />
            </div>

            {/* Contractor Name & Firm */}
            <div className="grid md:grid-cols-2 gap-6">
              <ReusableDropdown
                label="Contractor Name *"
                value={shared.contractorName}
                onSelect={v => setShared(p => ({ ...p, contractorName: v }))}
                options={getColumnValues('contractorName')}
                placeholder="Select Contractor"
                icon={<User className="w-5 h-5 text-green-600" />}
              />
              <InputWithIcon
                icon={<Building2 className="w-5 h-5 text-purple-600" />}
                label="Contractor Firm *"
                value={shared.contractorFirmName}
                readOnly
              />
            </div>

            {/* Bill No. & Bill Date (Shared) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <InputWithIcon
                icon={<FileText className="w-5 h-5 text-red-600" />}
                label="Bill No. *"
                value={shared.billNo}
                onChange={e => setShared(p => ({ ...p, billNo: e.target.value }))}
                placeholder="BILL-2025-001"
                required
              />
              <InputWithIcon
                icon={<Calendar className="w-5 h-5 text-blue-600" />}
                label="Bill Date *"
                type="date"
                value={shared.billDate}
                onChange={e => setShared(p => ({ ...p, billDate: e.target.value }))}
                required
              />
            </div>

            {/* Bill Copy */}
            <FileUploadField
              label="Bill Copy (Upload Photo) *"
              onFileSelect={f => setShared(p => ({ ...p, billCopy: f }))}
              currentFile={shared.billCopy}
              required
            />
          </div>

          <hr className="border-gray-300" />

          {/* Works Section */}
          {works.map((work, idx) => (
            <div key={idx} className="relative p-4 sm:p-6 border border-gray-300 rounded-xl bg-gray-50">
              {works.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWork(idx)}
                  className="absolute top-3 right-3 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}

              {/* Work Name */}
              <div className="mb-5">
                <ReusableDropdown
                  label="Work Name *"
                  value={work.workName}
                  onSelect={v => updateWork(idx, 'workName', v)}
                  options={getColumnValues('contractorWorkName')}
                  placeholder="Select Work"
                  icon={<Edit3 className="w-5 h-5 text-indigo-600" />}
                />
              </div>

              {/* Work Description */}
              <div className="mb-5">
                <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                  <FileText className="w-5 h-5 text-gray-600" /> Work Description
                </label>
                <textarea
                  value={work.workDescription}
                  onChange={e => updateWork(idx, 'workDescription', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description..."
                />
              </div>

              {/* Quantity, Unit, Rate, Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
                <InputWithIcon
                  icon={<Package className="w-5 h-5 text-teal-600" />}
                  label="Quantity *"
                  type="number"
                  step="0.01"
                  value={work.quantity}
                  onChange={e => updateWork(idx, 'quantity', e.target.value)}
                  placeholder="0.00"
                />
                <ReusableDropdown
                  label="Unit *"
                  value={work.unit}
                  onSelect={v => updateWork(idx, 'unit', v)}
                  options={getColumnValues('unit')}
                  placeholder="Select"
                  icon={<Package className="w-5 h-5 text-teal-600" />}
                />
                <InputWithIcon
                  icon={<DollarSign className="w-5 h-5 text-green-600" />}
                  label="Rate *"
                  type="number"
                  step="0.01"
                  value={work.rate}
                  onChange={e => updateWork(idx, 'rate', e.target.value)}
                  placeholder="0.00"
                />
                <div className="flex flex-col">
                  <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                    <Calculator className="w-5 h-5 text-orange-600" /> Amount
                  </label>
                  <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg font-bold text-green-700">
                    ₹{calculateAmount(work.quantity, work.rate)}
                  </div>
                </div>
              </div>

              {/* Previous Bill Copy */}
              <div className="mb-5">
                <FileUploadField
                  label="Previous Bill Copy"
                  onFileSelect={f => updateWork(idx, 'previousBillCopy', f)}
                  currentFile={work.previousBillCopy}
                />
              </div>

              {/* Remark */}
              <div className="mb-5">
                <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                  <Edit3 className="w-5 h-5 text-gray-600" /> Remark
                </label>
                <textarea
                  value={work.remark}
                  onChange={e => updateWork(idx, 'remark', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Any notes..."
                />
              </div>
            </div>
          ))}

          {/* Add More Work */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={addWork}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" /> Add More Work
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col items-center gap-3 pt-6">
            <button
              type="submit"
              disabled={submitLoading}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:scale-105 transition disabled:opacity-60"
            >
              <FileText className="w-6 h-6" />
              {submitLoading ? 'Submitting...' : 'Submit All Bills'}
            </button>

            {/* SUCCESS MESSAGE WITH RCC BILL NO. */}
{submitSuccess && (
  <div className="w-full max-w-md">
    <div className="p-4 bg-green-50 border border-green-200 rounded-xl shadow-md">
      <p className="text-green-800 font-medium text-center mb-2">
        {submitRes?.message || 'Data submitted successfully'}
      </p>
      <div className="mt-3 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-300">
        <p className="text-sm font-semibold text-green-900 text-center">
          RCC Bill No: 
          <span className="ml-2 text-lg font-bold text-green-700 font-mono">
            {submitRes?.rccBillNo || 'N/A'}
          </span>
        </p>
      </div>
    </div>
  </div>
)}
            {submitError && (
              <p className="text-red-600 font-medium">
                Error: {submitErr?.data?.error || 'Submission failed'}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==================== REUSABLE COMPONENTS ==================== */

const ProjectDropdown = ({ options, value, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = options.filter(o =>
    o.projectId.toLowerCase().includes(search.toLowerCase()) ||
    o.projectName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate">
          {value ? `${value} → ${options.find(o => o.projectId === value)?.projectName || ''}` : 'Select Project'}
        </span>
        <ChevronDown className={`w-5 h-5 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="sticky top-0 p-2 bg-white border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border rounded"
                autoFocus
              />
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">No projects found</div>
          ) : (
            filtered.map(opt => (
              <button
                key={opt.projectId}
                type="button"
                onClick={() => { onSelect(opt.projectId); setOpen(false); setSearch(''); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex justify-between"
              >
                <span className="font-medium">{opt.projectId}</span>
                <span className="text-xs text-gray-500">{opt.projectName}</span>
              </button>
            ))
          )}
        </div>
      )}
      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}
    </div>
  );
};

const ReusableDropdown = ({ label, value, onSelect, options, placeholder, icon }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">{icon} {label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex justify-between items-center px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronDown className={`w-5 h-5 transition ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
            <div className="sticky top-0 p-2 bg-white border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border rounded"
                  autoFocus
                />
              </div>
            </div>
            {filtered.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { onSelect(opt); setOpen(false); setSearch(''); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
        {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}
      </div>
    </div>
  );
};

const InputWithIcon = ({ icon, label, readOnly, required, ...props }) => (
  <div>
    <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">{icon} {label}</label>
    <input
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${readOnly ? 'bg-gray-50' : ''}`}
      readOnly={readOnly}
      required={required}
      {...props}
    />
  </div>
);

const FileUploadField = ({ label, onFileSelect, currentFile, required }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      onFileSelect(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else setPreview(null);
    } else {
      alert('Only images & PDF allowed');
    }
  };

  const remove = () => {
    onFileSelect(null);
    setPreview(null);
  };

  return (
    <div>
      <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
        <FileText className="w-5 h-5 text-red-600" /> {label}
      </label>

      {!currentFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={e => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={e => handleFile(e.target.files?.[0] ?? null)}
            className="hidden"
            id={`file-${label}`}
            required={required}
          />
          <label htmlFor={`file-${label}`} className="cursor-pointer">
            <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm"><span className="text-blue-600 font-semibold">Click to upload</span> or drag & drop</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF</p>
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg">
          <div className="flex items-center gap-3">
            {preview ? <img src={preview} alt="preview" className="w-12 h-12 object-cover rounded" /> :
              <FileText className="w-12 h-12 text-red-600" />}
            <div>
              <p className="text-sm font-medium truncate max-w-xs">{currentFile.name}</p>
              <p className="text-xs text-gray-500">{(currentFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button type="button" onClick={remove} className="text-red-600">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Bill_Tally_form;