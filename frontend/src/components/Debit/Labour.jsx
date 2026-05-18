import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  useGetPendingDebitLaboursQuery,
  useSubmitLabourDebitMutation,
} from '../../features/debit/labourSlice';

// ─── Searchable Dropdown Component ────────────────────────────────────────────
const SearchableDropdown = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Search or Select...",
  allLabel = "All"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(opt =>
      opt.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-gray-600 font-medium">
        {label}
        <span className="text-xs text-blue-500 ml-1">({options.length})</span>
      </label>

      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className={`flex items-center justify-between px-3 py-2.5 border rounded-lg bg-white cursor-pointer transition-all ${
            isOpen ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="flex-1 outline-none text-sm bg-transparent"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={`text-sm ${value ? 'text-gray-800' : 'text-gray-400'}`}>
              {value || placeholder}
            </span>
          )}

          <div className="flex items-center gap-1">
            {value && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            )}
            <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              onClick={() => handleSelect('')}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm border-b border-gray-100 ${
                !value ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'
              }`}
            >
              {allLabel}
            </div>

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-gray-400 text-sm">
                No results found
              </div>
            ) : (
              filteredOptions.map((option, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelect(option)}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm ${
                    value === option ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {option}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PDF Actions Modal ─────────────────────────────────────────────────────────
const PdfActionsModal = ({ pdfResult, onClose }) => {
  const pdfUrl = pdfResult?.pdfUrl || pdfResult?.pdf_url || pdfResult?.url || '';

  const handleView = () => {
    if (pdfUrl) window.open(pdfUrl, '_blank');
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Labour_Debit_${pdfResult?.debitUID || 'PDF'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!pdfUrl) return;
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.focus();
        printWindow.print();
      });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                ✅
              </div>
              <div>
                <h2 className="text-xl font-bold">PDF Generated!</h2>
                <p className="text-green-100 text-sm">Your labour debit PDF is ready</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Summary Info */}
        <div className="p-5 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {pdfResult?.debitUID && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Debit UID</p>
                <p className="font-semibold text-gray-800">{pdfResult.debitUID}</p>
              </div>
            )}
            {pdfResult?.totalAmountFormatted && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Total Amount</p>
                <p className="font-semibold text-green-600">{pdfResult.totalAmountFormatted}</p>
              </div>
            )}
            {pdfResult?.totalItems && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Labour Items</p>
                <p className="font-semibold text-gray-800">{pdfResult.totalItems}</p>
              </div>
            )}
            {pdfResult?.totalContractors && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Contractors</p>
                <p className="font-semibold text-gray-800">{pdfResult.totalContractors}</p>
              </div>
            )}
            {pdfResult?.dateTime && (
              <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Date & Time</p>
                <p className="font-semibold text-gray-800">{pdfResult.dateTime}</p>
              </div>
            )}
          </div>
        </div>

        {/* PDF Action Buttons */}
        <div className="p-5 space-y-3">
          <p className="text-sm text-gray-500 font-medium mb-4">What would you like to do with the PDF?</p>

          {/* View PDF */}
          <button
            onClick={handleView}
            disabled={!pdfUrl}
            className="w-full flex items-center gap-4 px-5 py-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-10 h-10 bg-blue-500 group-hover:bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg transition-colors shrink-0">
              👁️
            </div>
            <div className="text-left">
              <p className="font-semibold text-blue-700 text-sm">View PDF</p>
              <p className="text-blue-400 text-xs">Opens in a new browser tab</p>
            </div>
            <span className="ml-auto text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownload}
            disabled={!pdfUrl}
            className="w-full flex items-center gap-4 px-5 py-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-10 h-10 bg-green-500 group-hover:bg-green-600 rounded-lg flex items-center justify-center text-white text-lg transition-colors shrink-0">
              ⬇️
            </div>
            <div className="text-left">
              <p className="font-semibold text-green-700 text-sm">Download PDF</p>
              <p className="text-green-400 text-xs">Save to your device</p>
            </div>
            <span className="ml-auto text-green-400 group-hover:translate-x-1 transition-transform">→</span>
          </button>

          {/* Print PDF */}
          <button
            onClick={handlePrint}
            disabled={!pdfUrl}
            className="w-full flex items-center gap-4 px-5 py-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-400 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-10 h-10 bg-purple-500 group-hover:bg-purple-600 rounded-lg flex items-center justify-center text-white text-lg transition-colors shrink-0">
              🖨️
            </div>
            <div className="text-left">
              <p className="font-semibold text-purple-700 text-sm">Print PDF</p>
              <p className="text-purple-400 text-xs">Send to printer directly</p>
            </div>
            <span className="ml-auto text-purple-400 group-hover:translate-x-1 transition-transform">→</span>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-medium transition-colors mt-2 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const Labour = () => {
  const {
    data: labours = [],
    isLoading,
    isError,
    refetch,
  } = useGetPendingDebitLaboursQuery();

  const [submitDebit, { isLoading: isSubmitting }] = useSubmitLabourDebitMutation();

  const [filters, setFilters] = useState({
    projectName: '',
    contractorName: '',
    workType: '',
    labourCategory1: '',
  });

  const [selectedRows, setSelectedRows] = useState([]);
  const [status, setStatus] = useState('Done');
  const [showModal, setShowModal] = useState(false);
  const [pdfResult, setPdfResult] = useState(null);

  // ─── Dropdown Options (Interdependent) ──────────────────────────────────
  const dropdownOptions = useMemo(() => {
    // Projects
    let projectsData = labours;
    if (filters.contractorName) {
      projectsData = projectsData.filter(m => m.contractorName === filters.contractorName);
    }
    if (filters.workType) {
      projectsData = projectsData.filter(m => m.workType === filters.workType);
    }
    if (filters.labourCategory1) {
      projectsData = projectsData.filter(m => m.labourCategory1 === filters.labourCategory1);
    }
    const projects = [...new Set(projectsData.map(m => m.projectName).filter(Boolean))].sort();

    // Contractors
    let contractorsData = labours;
    if (filters.projectName) {
      contractorsData = contractorsData.filter(m => m.projectName === filters.projectName);
    }
    if (filters.workType) {
      contractorsData = contractorsData.filter(m => m.workType === filters.workType);
    }
    if (filters.labourCategory1) {
      contractorsData = contractorsData.filter(m => m.labourCategory1 === filters.labourCategory1);
    }
    const contractors = [...new Set(contractorsData.map(m => m.contractorName).filter(Boolean))].sort();

    // Work Types
    let workTypesData = labours;
    if (filters.projectName) {
      workTypesData = workTypesData.filter(m => m.projectName === filters.projectName);
    }
    if (filters.contractorName) {
      workTypesData = workTypesData.filter(m => m.contractorName === filters.contractorName);
    }
    if (filters.labourCategory1) {
      workTypesData = workTypesData.filter(m => m.labourCategory1 === filters.labourCategory1);
    }
    const workTypes = [...new Set(workTypesData.map(m => m.workType).filter(Boolean))].sort();

    // Labour Categories
    let labourCatData = labours;
    if (filters.projectName) {
      labourCatData = labourCatData.filter(m => m.projectName === filters.projectName);
    }
    if (filters.contractorName) {
      labourCatData = labourCatData.filter(m => m.contractorName === filters.contractorName);
    }
    if (filters.workType) {
      labourCatData = labourCatData.filter(m => m.workType === filters.workType);
    }
    const labourCategories = [...new Set(labourCatData.map(m => m.labourCategory1).filter(Boolean))].sort();

    return { projects, contractors, workTypes, labourCategories };
  }, [labours, filters]);

  // ─── Filtered Data ──────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    return labours.filter((row) => {
      const matchProject = !filters.projectName || row.projectName === filters.projectName;
      const matchContractor = !filters.contractorName || row.contractorName === filters.contractorName;
      const matchWorkType = !filters.workType || row.workType === filters.workType;
      const matchLabourCat = !filters.labourCategory1 || row.labourCategory1 === filters.labourCategory1;
      return matchProject && matchContractor && matchWorkType && matchLabourCat;
    });
  }, [labours, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setSelectedRows([]);
  };

  const clearFilters = () => {
    setFilters({ projectName: '', contractorName: '', workType: '', labourCategory1: '' });
    setSelectedRows([]);
  };

  const handleRowSelect = (row) => {
    const isSelected = selectedRows.some((r) => r.rowIndex === row.rowIndex);
    if (isSelected) {
      setSelectedRows(selectedRows.filter((r) => r.rowIndex !== row.rowIndex));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows([...filteredData]);
    }
  };

  // ─── Calculate Totals ───────────────────────────────────────────────────
  const selectedTotals = useMemo(() => {
    const totalCompanyAmount = selectedRows.reduce((sum, row) => {
      const amt = parseFloat((row.companyHeadAmount || '0').toString().replace(/,/g, ''));
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);

    const totalContractorAmount = selectedRows.reduce((sum, row) => {
      const amt = parseFloat((row.contractorHeadAmount || '0').toString().replace(/,/g, ''));
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);

    const uniqueContractors = [...new Set(selectedRows.map((r) => r.contractorName))];
    const uniqueProjects = [...new Set(selectedRows.map((r) => r.projectName))];

    return {
      totalCompanyAmount: totalCompanyAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      rawTotalCompanyAmount: totalCompanyAmount,
      totalContractorAmount: totalContractorAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      rawTotalContractorAmount: totalContractorAmount,
      totalContractors: uniqueContractors.length,
      totalProjects: uniqueProjects.length,
      totalItems: selectedRows.length,
    };
  }, [selectedRows]);

  // ─── Handle Submit ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (selectedRows.length === 0) {
      alert('Please select at least one row');
      return;
    }

    try {
      const result = await submitDebit({
        selectedRows,
        status,
        totalAmount: selectedTotals.rawTotalCompanyAmount,
      }).unwrap();

      console.log('Labour Debit Success:', result);

      setShowModal(false);
      setPdfResult(result?.data || result);
      setSelectedRows([]);
      refetch();
    } catch (error) {
      console.error('Labour Debit Error:', error);
      alert(error?.data?.error || 'Something went wrong');
    }
  };

  const handleClosePdfModal = () => {
    setPdfResult(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-5">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-lg">Loading Labour Data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-5">
        <p className="text-red-500 text-xl">❌ Error loading data</p>
        <button onClick={refetch} className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b-2 border-gray-200 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">👷 Contractor Labour Debit</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            Total: <strong className="text-blue-600">{labours.length}</strong>
          </span>
          <button onClick={refetch} className="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-50 p-5 rounded-xl mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-600 font-semibold">🔍 Search & Filter</h3>
          <span className="text-xs text-gray-400">Type to search in any dropdown</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <SearchableDropdown
            label="Project Name"
            value={filters.projectName}
            onChange={(val) => handleFilterChange('projectName', val)}
            options={dropdownOptions.projects}
            placeholder="Search Project..."
            allLabel="All Projects"
          />
          <SearchableDropdown
            label="Contractor Name"
            value={filters.contractorName}
            onChange={(val) => handleFilterChange('contractorName', val)}
            options={dropdownOptions.contractors}
            placeholder="Search Contractor..."
            allLabel="All Contractors"
          />
          <SearchableDropdown
            label="Work Type"
            value={filters.workType}
            onChange={(val) => handleFilterChange('workType', val)}
            options={dropdownOptions.workTypes}
            placeholder="Search Work Type..."
            allLabel="All Work Types"
          />
          <SearchableDropdown
            label="Labour Category"
            value={filters.labourCategory1}
            onChange={(val) => handleFilterChange('labourCategory1', val)}
            options={dropdownOptions.labourCategories}
            placeholder="Search Category..."
            allLabel="All Categories"
          />
        </div>

        {/* Active Filters */}
        {(filters.projectName || filters.contractorName || filters.workType || filters.labourCategory1) && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-600 font-medium">Active Filters:</span>
            {filters.projectName && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                Project: {filters.projectName}
                <button onClick={() => handleFilterChange('projectName', '')} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}
            {filters.contractorName && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                Contractor: {filters.contractorName}
                <button onClick={() => handleFilterChange('contractorName', '')} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}
            {filters.workType && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                Work Type: {filters.workType}
                <button onClick={() => handleFilterChange('workType', '')} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}
            {filters.labourCategory1 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                Labour Cat: {filters.labourCategory1}
                <button onClick={() => handleFilterChange('labourCategory1', '')} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t border-gray-200 gap-3">
          <button onClick={clearFilters} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
            ✖ Clear All Filters
          </button>
          <span className="text-sm text-gray-500">
            Showing <strong className="text-green-600">{filteredData.length}</strong> of <strong>{labours.length}</strong> records
          </span>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedRows.length > 0 && (
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl mb-6 text-white sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-90">Selected:</span>
            <span className="text-lg font-semibold">{selectedTotals.totalItems} Items</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-90">Contractors:</span>
            <span className="text-lg font-semibold">{selectedTotals.totalContractors}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-90">Company Amt:</span>
            <span className="text-lg font-semibold text-yellow-300">₹ {selectedTotals.totalCompanyAmount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-90">Contractor Amt:</span>
            <span className="text-lg font-semibold text-green-300">₹ {selectedTotals.totalContractorAmount}</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="md:ml-auto px-6 py-3 bg-yellow-400 text-gray-800 rounded-lg font-semibold hover:bg-yellow-300 hover:-translate-y-0.5 hover:shadow-lg transition-all w-full md:w-auto"
          >
            📄 Generate Labour Debit PDF
          </button>
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-auto max-h-[600px]">
          <table className="w-full border-collapse bg-white text-sm min-w-[1400px]">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
              <tr>
                <th className="p-3 text-center w-12">
                  <input
                    type="checkbox"
                    checked={filteredData.length > 0 && selectedRows.length === filteredData.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="p-3 text-center font-semibold whitespace-nowrap w-14">Sr.</th>
                <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[140px]">Project Name</th>
                <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[110px]">Work Type</th>
                <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[150px]">Work Description</th>
                <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[90px]">Date Req</th>
                <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[100px]">Approved Head</th>
                <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[120px]">Contractor</th>
                <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[120px]">Contractor Firm</th>
                <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[120px]">Labour Contractor</th>
                <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[110px]">Labour Cat 1</th>
                <th className="p-3 text-center font-semibold whitespace-nowrap min-w-[70px]">Deployed 1</th>
                <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[110px]">Labour Cat 2</th>
                <th className="p-3 text-center font-semibold whitespace-nowrap min-w-[70px]">Deployed 2</th>
                <th className="p-3 text-right font-semibold whitespace-nowrap min-w-[100px]">Contractor Amt</th>
                {/* <th className="p-3 text-right font-semibold whitespace-nowrap min-w-[100px]">Contractor Amt</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="16" className="text-center py-16 text-gray-400 text-lg">
                    {labours.length === 0 ? 'No data available' : 'No data found for selected filters'}
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => {
                  const isSelected = selectedRows.some((r) => r.rowIndex === row.rowIndex);
                  return (
                    <tr
                      key={row.rowIndex || index}
                      onClick={() => handleRowSelect(row)}
                      className={`cursor-pointer border-b border-gray-100 transition-colors ${
                        isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(row)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-center text-gray-500">{index + 1}</td>
                      <td className="p-3">{row.projectName || '-'}</td>
                      <td className="p-3">{row.workType || '-'}</td>
                      <td className="p-3 text-gray-600">{row.workDescription || '-'}</td>
                      <td className="p-3 text-gray-600">{row.dateOfRequired || '-'}</td>
                      <td className="p-3">{row.approvedHead || '-'}</td>
                      <td className="p-3 font-semibold text-blue-600">{row.contractorName || '-'}</td>
                      <td className="p-3">{row.contractorFirmName || '-'}</td>
                      <td className="p-3">{row.labourContractorName || '-'}</td>
                      <td className="p-3 font-medium">{row.labourCategory1 || '-'}</td>
                      <td className="p-3 text-center">{row.deployedLabour1 || '-'}</td>
                      <td className="p-3 font-medium">{row.labourCategory2 || '-'}</td>
                      <td className="p-3 text-center">{row.deployedLabour2 || '-'}</td>
                      <td className="p-3 text-right font-semibold text-green-600">{row.companyHeadAmount || '-'}</td>
                      {/* <td className="p-3 text-right font-semibold text-orange-600">{row.contractorHeadAmount || '-'}</td> */}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Total: <strong>{filteredData.length}</strong> records
          </span>
          {selectedRows.length > 0 && (
            <span className="text-sm text-blue-600 font-medium">
              {selectedRows.length} row(s) selected
            </span>
          )}
        </div>
      </div>

      {/* ── Confirm & Generate Modal ──────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">📄 Generate Labour Debit PDF</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl transition-colors">
                ✖
              </button>
            </div>

            <div className="p-5">
              {/* Selection Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mb-5">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Total Items:</span>
                  <strong>{selectedTotals.totalItems}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Total Contractors:</span>
                  <strong>{selectedTotals.totalContractors}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Total Projects:</span>
                  <strong>{selectedTotals.totalProjects}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Company Head Amount:</span>
                  <strong className="text-green-600">₹ {selectedTotals.totalCompanyAmount}</strong>
                </div>
                {/* <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Contractor Head Amount:</span>
                  <strong className="text-orange-600">₹ {selectedTotals.totalContractorAmount}</strong>
                </div> */}
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Date & Time:</span>
                  <strong className="text-blue-600">Current (Auto)</strong>
                </div>
              </div>

              {/* Selected Contractors List */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-gray-600 mb-3">Selected Contractors:</h4>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {[...new Set(selectedRows.map((r) => r.contractorName))].map((name, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                >
                  <option value="">----- Select -----</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 p-5 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !status}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? '⏳ Processing...' : '✅ Confirm & Generate PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PDF Actions Modal (View / Download / Print) ───────────────────── */}
      {pdfResult && (
        <PdfActionsModal
          pdfResult={pdfResult}
          onClose={handleClosePdfModal}
        />
      )}
    </div>
  );
};

export default Labour;