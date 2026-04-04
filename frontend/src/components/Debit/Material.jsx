// // src/pages/Material.jsx
// import React, { useState, useMemo } from 'react';
// import {
//   useGetPendingDebitMaterialsQuery,
//   useSubmitMaterialDebitMutation,
// } from '../../features/debit/materialSlice';

// const Material = () => {
//   // ─── RTK Query Hooks ────────────────────────────────────────────────────
//   const {
//     data: materials = [],
//     isLoading,
//     isError,
//     refetch,
//   } = useGetPendingDebitMaterialsQuery();

//   const [submitDebit, { isLoading: isSubmitting }] = useSubmitMaterialDebitMutation();

//   // ─── State Management ───────────────────────────────────────────────────
//   const [filters, setFilters] = useState({
//     projectName: '',
//     contractorName: '',
//     vendorFirmName: '',
//     poNo: '',
//   });

//   const [selectedRows, setSelectedRows] = useState([]);
//   const [actualDate, setActualDate] = useState('');
//   const [status, setStatus] = useState('Debit Done');
//   const [showModal, setShowModal] = useState(false);

//   // ─── Cascading Dropdown Options ─────────────────────────────────────────
//   const dropdownOptions = useMemo(() => {
//     // Step 1: All unique projects
//     const projects = [...new Set(materials.map((m) => m.projectName).filter(Boolean))].sort();

//     // Step 2: Contractors based on selected project
//     let filteredForContractors = materials;
//     if (filters.projectName) {
//       filteredForContractors = materials.filter((m) => m.projectName === filters.projectName);
//     }
//     const contractors = [...new Set(filteredForContractors.map((m) => m.contractorName).filter(Boolean))].sort();

//     // Step 3: Vendors based on selected project + contractor
//     let filteredForVendors = materials;
//     if (filters.projectName) {
//       filteredForVendors = filteredForVendors.filter((m) => m.projectName === filters.projectName);
//     }
//     if (filters.contractorName) {
//       filteredForVendors = filteredForVendors.filter((m) => m.contractorName === filters.contractorName);
//     }
//     const vendors = [...new Set(filteredForVendors.map((m) => m.vendorFirmName).filter(Boolean))].sort();

//     // Step 4: PO Numbers based on selected project + contractor + vendor
//     let filteredForPOs = materials;
//     if (filters.projectName) {
//       filteredForPOs = filteredForPOs.filter((m) => m.projectName === filters.projectName);
//     }
//     if (filters.contractorName) {
//       filteredForPOs = filteredForPOs.filter((m) => m.contractorName === filters.contractorName);
//     }
//     if (filters.vendorFirmName) {
//       filteredForPOs = filteredForPOs.filter((m) => m.vendorFirmName === filters.vendorFirmName);
//     }
//     const poNumbers = [...new Set(filteredForPOs.map((m) => m.poNo).filter(Boolean))].sort();

//     return {
//       projects,
//       contractors,
//       vendors,
//       poNumbers,
//     };
//   }, [materials, filters.projectName, filters.contractorName, filters.vendorFirmName]);

//   // ─── Filtered Data for Table ────────────────────────────────────────────
//   const filteredData = useMemo(() => {
//     return materials.filter((row) => {
//       const matchProject = !filters.projectName || row.projectName === filters.projectName;
//       const matchContractor = !filters.contractorName || row.contractorName === filters.contractorName;
//       const matchVendor = !filters.vendorFirmName || row.vendorFirmName === filters.vendorFirmName;
//       const matchPO = !filters.poNo || row.poNo === filters.poNo;

//       return matchProject && matchContractor && matchVendor && matchPO;
//     });
//   }, [materials, filters]);

//   // ─── Handle Filter Change (Cascading Reset) ─────────────────────────────
//   const handleFilterChange = (filterName, value) => {
//     setFilters((prev) => {
//       const newFilters = { ...prev, [filterName]: value };

//       // Cascading reset: Clear child filters when parent changes
//       if (filterName === 'projectName') {
//         newFilters.contractorName = '';
//         newFilters.vendorFirmName = '';
//         newFilters.poNo = '';
//       } else if (filterName === 'contractorName') {
//         newFilters.vendorFirmName = '';
//         newFilters.poNo = '';
//       } else if (filterName === 'vendorFirmName') {
//         newFilters.poNo = '';
//       }

//       return newFilters;
//     });
//     setSelectedRows([]);
//   };

//   // ─── Clear All Filters ──────────────────────────────────────────────────
//   const clearFilters = () => {
//     setFilters({
//       projectName: '',
//       contractorName: '',
//       vendorFirmName: '',
//       poNo: '',
//     });
//     setSelectedRows([]);
//   };

//   // ─── Handle Row Selection ───────────────────────────────────────────────
//   const handleRowSelect = (row) => {
//     const isSelected = selectedRows.some((r) => r.rowIndex === row.rowIndex);
//     if (isSelected) {
//       setSelectedRows(selectedRows.filter((r) => r.rowIndex !== row.rowIndex));
//     } else {
//       setSelectedRows([...selectedRows, row]);
//     }
//   };

//   // ─── Handle Select All ──────────────────────────────────────────────────
//   const handleSelectAll = () => {
//     if (selectedRows.length === filteredData.length) {
//       setSelectedRows([]);
//     } else {
//       setSelectedRows([...filteredData]);
//     }
//   };

//   // ─── Handle Submit ──────────────────────────────────────────────────────
//   const handleSubmit = async () => {
//     if (selectedRows.length === 0) {
//       alert('Please select at least one row');
//       return;
//     }
//     if (!actualDate) {
//       alert('Please select actual date');
//       return;
//     }

//     try {
//       const result = await submitDebit({
//         selectedRows,
//         actualDate,
//         status,
//       }).unwrap();

//       console.log('Debit Success:', result);
//       alert(
//         `✅ Success!\n\n${result.data.totalMaterials} materials from ${result.data.totalPOs} PO(s) updated.\n\nDebit UID: ${result.data.debitUID}\n\nPDF Generated Successfully!`
//       );

//       setSelectedRows([]);
//       setActualDate('');
//       setShowModal(false);
//     } catch (error) {
//       console.error('Debit Error:', error);
//       alert(error?.data?.error || 'Something went wrong');
//     }
//   };

//   // ─── Calculate Totals ───────────────────────────────────────────────────
//   const selectedTotals = useMemo(() => {
//     const totalAmount = selectedRows.reduce((sum, row) => {
//       const amt = parseFloat((row.netAmount || '0').toString().replace(/,/g, ''));
//       return sum + (isNaN(amt) ? 0 : amt);
//     }, 0);

//     const uniquePOs = [...new Set(selectedRows.map((r) => r.poNo))];

//     return {
//       totalAmount: totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
//       totalPOs: uniquePOs.length,
//       totalMaterials: selectedRows.length,
//     };
//   }, [selectedRows]);

//   // ─── Loading State ──────────────────────────────────────────────────────
//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[400px] gap-5">
//         <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
//         <p className="text-gray-600 text-lg">Loading Materials...</p>
//       </div>
//     );
//   }

//   // ─── Error State ────────────────────────────────────────────────────────
//   if (isError) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[400px] gap-5">
//         <p className="text-red-500 text-xl">❌ Error loading data</p>
//         <button
//           onClick={refetch}
//           className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
//         >
//           🔄 Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
//       {/* ─── Header ─────────────────────────────────────────────────────── */}
//       <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b-2 border-gray-200 gap-4">
//         <h1 className="text-2xl font-bold text-gray-800">📦 Contractor Material Debit</h1>
//         <button
//           onClick={refetch}
//           className="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
//         >
//           🔄 Refresh
//         </button>
//       </div>

//       {/* ─── Filter Section (Cascading) ─────────────────────────────────── */}
//       <div className="bg-gray-50 p-5 rounded-xl mb-6 shadow-sm">
//         <h3 className="text-gray-600 font-semibold mb-4">🔍 Filters (Cascading)</h3>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//           {/* 1. Project Name Filter */}
//           <div className="flex flex-col gap-1.5">
//             <label className="text-sm text-gray-600 font-medium">
//               1. Project Name
//               <span className="text-xs text-gray-400 ml-1">({dropdownOptions.projects.length})</span>
//             </label>
//             <select
//               value={filters.projectName}
//               onChange={(e) => handleFilterChange('projectName', e.target.value)}
//               className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 cursor-pointer"
//             >
//               <option value="">All Projects</option>
//               {dropdownOptions.projects.map((project, idx) => (
//                 <option key={idx} value={project}>
//                   {project}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* 2. Contractor Name Filter */}
//           <div className="flex flex-col gap-1.5">
//             <label className="text-sm text-gray-600 font-medium">
//               2. Contractor Name
//               <span className="text-xs text-gray-400 ml-1">({dropdownOptions.contractors.length})</span>
//             </label>
//             <select
//               value={filters.contractorName}
//               onChange={(e) => handleFilterChange('contractorName', e.target.value)}
//               disabled={!filters.projectName}
//               className={`px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 cursor-pointer ${
//                 !filters.projectName ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
//               }`}
//             >
//               <option value="">
//                 {filters.projectName ? 'All Contractors' : 'Select Project First'}
//               </option>
//               {dropdownOptions.contractors.map((contractor, idx) => (
//                 <option key={idx} value={contractor}>
//                   {contractor}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* 3. Vendor Firm Name Filter */}
//           <div className="flex flex-col gap-1.5">
//             <label className="text-sm text-gray-600 font-medium">
//               3. Vendor Firm Name
//               <span className="text-xs text-gray-400 ml-1">({dropdownOptions.vendors.length})</span>
//             </label>
//             <select
//               value={filters.vendorFirmName}
//               onChange={(e) => handleFilterChange('vendorFirmName', e.target.value)}
//               disabled={!filters.contractorName}
//               className={`px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 cursor-pointer ${
//                 !filters.contractorName ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
//               }`}
//             >
//               <option value="">
//                 {filters.contractorName ? 'All Vendors' : 'Select Contractor First'}
//               </option>
//               {dropdownOptions.vendors.map((vendor, idx) => (
//                 <option key={idx} value={vendor}>
//                   {vendor}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* 4. PO Number Filter */}
//           <div className="flex flex-col gap-1.5">
//             <label className="text-sm text-gray-600 font-medium">
//               4. PO Number
//               <span className="text-xs text-gray-400 ml-1">({dropdownOptions.poNumbers.length})</span>
//             </label>
//             <select
//               value={filters.poNo}
//               onChange={(e) => handleFilterChange('poNo', e.target.value)}
//               disabled={!filters.vendorFirmName}
//               className={`px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 cursor-pointer ${
//                 !filters.vendorFirmName ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
//               }`}
//             >
//               <option value="">
//                 {filters.vendorFirmName ? 'All PO Numbers' : 'Select Vendor First'}
//               </option>
//               {dropdownOptions.poNumbers.map((po, idx) => (
//                 <option key={idx} value={po}>
//                   {po}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Active Filters Display */}
//         {(filters.projectName || filters.contractorName || filters.vendorFirmName || filters.poNo) && (
//           <div className="flex flex-wrap gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
//             <span className="text-sm text-blue-600 font-medium">Active Filters:</span>
//             {filters.projectName && (
//               <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
//                 Project: {filters.projectName}
//               </span>
//             )}
//             {filters.contractorName && (
//               <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
//                 Contractor: {filters.contractorName}
//               </span>
//             )}
//             {filters.vendorFirmName && (
//               <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
//                 Vendor: {filters.vendorFirmName}
//               </span>
//             )}
//             {filters.poNo && (
//               <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
//                 PO: {filters.poNo}
//               </span>
//             )}
//           </div>
//         )}

//         {/* Filter Actions */}
//         <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t border-gray-200 gap-3">
//           <button
//             onClick={clearFilters}
//             className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
//           >
//             ✖ Clear All Filters
//           </button>
//           <span className="text-sm text-gray-500">
//             Showing <strong className="text-green-600">{filteredData.length}</strong> of{' '}
//             <strong>{materials.length}</strong> records
//           </span>
//         </div>
//       </div>

//       {/* ─── Selection Summary ──────────────────────────────────────────── */}
//       {selectedRows.length > 0 && (
//         <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl mb-6 text-white">
//           <div className="flex items-center gap-2">
//             <span className="text-sm opacity-90">Selected:</span>
//             <span className="text-lg font-semibold">{selectedTotals.totalMaterials} Materials</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="text-sm opacity-90">POs:</span>
//             <span className="text-lg font-semibold">{selectedTotals.totalPOs}</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="text-sm opacity-90">Total Amount:</span>
//             <span className="text-lg font-semibold text-yellow-300">₹ {selectedTotals.totalAmount}</span>
//           </div>
//           <button
//             onClick={() => setShowModal(true)}
//             className="md:ml-auto px-6 py-3 bg-yellow-400 text-gray-800 rounded-lg font-semibold hover:bg-yellow-300 hover:-translate-y-0.5 hover:shadow-lg transition-all w-full md:w-auto"
//           >
//             📄 Generate Debit PDF
//           </button>
//         </div>
//       )}

//       {/* ─── Data Table ─────────────────────────────────────────────────── */}
//       <div className="overflow-x-auto rounded-xl shadow-md">
//         <table className="w-full border-collapse bg-white text-sm">
//           <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
//             <tr>
//               <th className="p-3 text-center w-10">
//                 <input
//                   type="checkbox"
//                   checked={filteredData.length > 0 && selectedRows.length === filteredData.length}
//                   onChange={handleSelectAll}
//                   className="w-4 h-4 cursor-pointer"
//                 />
//               </th>
//               <th className="p-3 text-left font-semibold whitespace-nowrap">Sr.</th>
//               <th className="p-3 text-left font-semibold whitespace-nowrap">Project Name</th>
//               <th className="p-3 text-left font-semibold whitespace-nowrap">Contractor</th>
//               <th className="p-3 text-left font-semibold whitespace-nowrap">Vendor Firm</th>
//               <th className="p-3 text-left font-semibold whitespace-nowrap">PO No</th>
//               <th className="p-3 text-left font-semibold whitespace-nowrap">Material Name</th>
//               <th className="p-3 text-center font-semibold whitespace-nowrap">Req Qty</th>
//               <th className="p-3 text-center font-semibold whitespace-nowrap">Rcvd Qty</th>
//               <th className="p-3 text-right font-semibold whitespace-nowrap">Bill Amt</th>
//               <th className="p-3 text-right font-semibold whitespace-nowrap">Net Amt</th>
//               <th className="p-3 text-center font-semibold whitespace-nowrap">PO Link</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredData.length === 0 ? (
//               <tr>
//                 <td colSpan="12" className="text-center py-10 text-gray-400 text-lg">
//                   {filters.projectName ? 'No data found for selected filters' : 'No data found'}
//                 </td>
//               </tr>
//             ) : (
//               filteredData.map((row, index) => {
//                 const isSelected = selectedRows.some((r) => r.rowIndex === row.rowIndex);
//                 return (
//                   <tr
//                     key={row.rowIndex || index}
//                     onClick={() => handleRowSelect(row)}
//                     className={`cursor-pointer border-b border-gray-100 transition-colors ${
//                       isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
//                     }`}
//                   >
//                     <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
//                       <input
//                         type="checkbox"
//                         checked={isSelected}
//                         onChange={() => handleRowSelect(row)}
//                         className="w-4 h-4 cursor-pointer"
//                       />
//                     </td>
//                     <td className="p-3">{index + 1}</td>
//                     <td className="p-3">{row.projectName || '-'}</td>
//                     <td className="p-3">{row.contractorName || '-'}</td>
//                     <td className="p-3">{row.vendorFirmName || '-'}</td>
//                     <td className="p-3 font-semibold text-blue-600">{row.poNo || '-'}</td>
//                     <td className="p-3">{row.materialName || '-'}</td>
//                     <td className="p-3 text-center">{row.requiredQty || '-'}</td>
//                     <td className="p-3 text-center">{row.finalReceivedQty || '-'}</td>
//                     <td className="p-3 text-right">{row.amount16 || '-'}</td>
//                     <td className="p-3 text-right font-semibold text-green-600">{row.netAmount || '-'}</td>
//                     <td className="p-3 text-center">
//                       {row.poUrl ? (
//                         <a
//                           href={row.poUrl}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           onClick={(e) => e.stopPropagation()}
//                           className="text-blue-500 hover:underline"
//                         >
//                           📎 View
//                         </a>
//                       ) : (
//                         '-'
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* ─── Submit Modal ───────────────────────────────────────────────── */}
//       {showModal && (
//         <div
//           className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4"
//           onClick={() => setShowModal(false)}
//         >
//           <div
//             className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Modal Header */}
//             <div className="flex justify-between items-center p-5 border-b border-gray-200">
//               <h2 className="text-xl font-bold text-gray-800">📄 Generate Debit PDF</h2>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
//               >
//                 ✖
//               </button>
//             </div>

//             {/* Modal Body */}
//             <div className="p-5">
//               {/* Selection Summary */}
//               <div className="bg-gray-50 p-4 rounded-lg mb-5">
//                 <div className="flex justify-between py-2 border-b border-gray-200">
//                   <span className="text-gray-600">Total Materials:</span>
//                   <strong>{selectedTotals.totalMaterials}</strong>
//                 </div>
//                 <div className="flex justify-between py-2 border-b border-gray-200">
//                   <span className="text-gray-600">Total POs:</span>
//                   <strong>{selectedTotals.totalPOs}</strong>
//                 </div>
//                 <div className="flex justify-between py-2">
//                   <span className="text-gray-600">Total Amount:</span>
//                   <strong className="text-green-600">₹ {selectedTotals.totalAmount}</strong>
//                 </div>
//               </div>

//               {/* Selected POs List */}
//               <div className="mb-5">
//                 <h4 className="text-sm font-semibold text-gray-600 mb-3">Selected PO Numbers:</h4>
//                 <div className="flex flex-wrap gap-2">
//                   {[...new Set(selectedRows.map((r) => r.poNo))].map((po, idx) => (
//                     <span
//                       key={idx}
//                       className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium"
//                     >
//                       {po}
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               {/* Form Fields */}
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-600 mb-2">Actual Date *</label>
//                 <input
//                   type="date"
//                   value={actualDate}
//                   onChange={(e) => setActualDate(e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
//                   required
//                 />
//               </div>

//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-600 mb-2">Status *</label>
//                 <select
//                   value={status}
//                   onChange={(e) => setStatus(e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
//                 >
//                   <option value="Debit Done">Debit Done</option>
//                   <option value="Done">Done</option>
//                 </select>
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="flex flex-col sm:flex-row justify-end gap-3 p-5 border-t border-gray-200">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 disabled={isSubmitting || !actualDate}
//                 className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
//               >
//                 {isSubmitting ? '⏳ Processing...' : '✅ Confirm & Generate PDF'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Material;



/////



// src/pages/Material.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  useGetPendingDebitMaterialsQuery,
  useSubmitMaterialDebitMutation,
} from '../../features/debit/materialSlice';

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

  // Close dropdown when clicking outside
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

  // Filter options based on search term
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
        {/* Input Field */}
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

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {/* All Option */}
            <div
              onClick={() => handleSelect('')}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm border-b border-gray-100 ${
                !value ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'
              }`}
            >
              {allLabel}
            </div>

            {/* Filtered Options */}
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

const Material = () => {
  // ─── RTK Query Hooks ────────────────────────────────────────────────────
  const {
    data: materials = [],
    isLoading,
    isError,
    refetch,
  } = useGetPendingDebitMaterialsQuery();

  const [submitDebit, { isLoading: isSubmitting }] = useSubmitMaterialDebitMutation();

  // ─── State Management ───────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    projectName: '',
    contractorName: '',
    vendorFirmName: '',
    poNo: '',
  });

  const [selectedRows, setSelectedRows] = useState([]);
  const [actualDate, setActualDate] = useState('');
  const [status, setStatus] = useState('Debit Done');
  const [showModal, setShowModal] = useState(false);

  // ─── Independent Dropdown Options (Based on other filters) ──────────────
  const dropdownOptions = useMemo(() => {
    // Get filtered data based on OTHER filters (not current one)
    
    // Projects - filter by contractor, vendor, PO
    let projectsData = materials;
    if (filters.contractorName) {
      projectsData = projectsData.filter(m => m.contractorName === filters.contractorName);
    }
    if (filters.vendorFirmName) {
      projectsData = projectsData.filter(m => m.vendorFirmName === filters.vendorFirmName);
    }
    if (filters.poNo) {
      projectsData = projectsData.filter(m => m.poNo === filters.poNo);
    }
    const projects = [...new Set(projectsData.map(m => m.projectName).filter(Boolean))].sort();

    // Contractors - filter by project, vendor, PO
    let contractorsData = materials;
    if (filters.projectName) {
      contractorsData = contractorsData.filter(m => m.projectName === filters.projectName);
    }
    if (filters.vendorFirmName) {
      contractorsData = contractorsData.filter(m => m.vendorFirmName === filters.vendorFirmName);
    }
    if (filters.poNo) {
      contractorsData = contractorsData.filter(m => m.poNo === filters.poNo);
    }
    const contractors = [...new Set(contractorsData.map(m => m.contractorName).filter(Boolean))].sort();

    // Vendors - filter by project, contractor, PO
    let vendorsData = materials;
    if (filters.projectName) {
      vendorsData = vendorsData.filter(m => m.projectName === filters.projectName);
    }
    if (filters.contractorName) {
      vendorsData = vendorsData.filter(m => m.contractorName === filters.contractorName);
    }
    if (filters.poNo) {
      vendorsData = vendorsData.filter(m => m.poNo === filters.poNo);
    }
    const vendors = [...new Set(vendorsData.map(m => m.vendorFirmName).filter(Boolean))].sort();

    // PO Numbers - filter by project, contractor, vendor
    let posData = materials;
    if (filters.projectName) {
      posData = posData.filter(m => m.projectName === filters.projectName);
    }
    if (filters.contractorName) {
      posData = posData.filter(m => m.contractorName === filters.contractorName);
    }
    if (filters.vendorFirmName) {
      posData = posData.filter(m => m.vendorFirmName === filters.vendorFirmName);
    }
    const poNumbers = [...new Set(posData.map(m => m.poNo).filter(Boolean))].sort();

    return {
      projects,
      contractors,
      vendors,
      poNumbers,
    };
  }, [materials, filters]);

  // ─── Filtered Data for Table ────────────────────────────────────────────
  const filteredData = useMemo(() => {
    return materials.filter((row) => {
      const matchProject = !filters.projectName || row.projectName === filters.projectName;
      const matchContractor = !filters.contractorName || row.contractorName === filters.contractorName;
      const matchVendor = !filters.vendorFirmName || row.vendorFirmName === filters.vendorFirmName;
      const matchPO = !filters.poNo || row.poNo === filters.poNo;

      return matchProject && matchContractor && matchVendor && matchPO;
    });
  }, [materials, filters]);

  // ─── Handle Filter Change (Independent - No Cascading Reset) ────────────
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
    setSelectedRows([]);
  };

  // ─── Clear All Filters ──────────────────────────────────────────────────
  const clearFilters = () => {
    setFilters({
      projectName: '',
      contractorName: '',
      vendorFirmName: '',
      poNo: '',
    });
    setSelectedRows([]);
  };

  // ─── Handle Row Selection ───────────────────────────────────────────────
  const handleRowSelect = (row) => {
    const isSelected = selectedRows.some((r) => r.rowIndex === row.rowIndex);
    if (isSelected) {
      setSelectedRows(selectedRows.filter((r) => r.rowIndex !== row.rowIndex));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  // ─── Handle Select All ──────────────────────────────────────────────────
  const handleSelectAll = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows([...filteredData]);
    }
  };

  // ─── Handle Submit ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (selectedRows.length === 0) {
      alert('Please select at least one row');
      return;
    }
    if (!actualDate) {
      alert('Please select actual date');
      return;
    }

    try {
      const result = await submitDebit({
        selectedRows,
        actualDate,
        status,
      }).unwrap();

      console.log('Debit Success:', result);
      alert(
        `✅ Success!\n\n${result.data.totalMaterials} materials from ${result.data.totalPOs} PO(s) updated.\n\nDebit UID: ${result.data.debitUID}\n\nPDF Generated Successfully!`
      );

      setSelectedRows([]);
      setActualDate('');
      setShowModal(false);
    } catch (error) {
      console.error('Debit Error:', error);
      alert(error?.data?.error || 'Something went wrong');
    }
  };

  // ─── Calculate Totals ───────────────────────────────────────────────────
  const selectedTotals = useMemo(() => {
    const totalAmount = selectedRows.reduce((sum, row) => {
      const amt = parseFloat((row.netAmount || '0').toString().replace(/,/g, ''));
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);

    const uniquePOs = [...new Set(selectedRows.map((r) => r.poNo))];

    return {
      totalAmount: totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      totalPOs: uniquePOs.length,
      totalMaterials: selectedRows.length,
    };
  }, [selectedRows]);

  // ─── Loading State ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-5">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-lg">Loading Materials...</p>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-5">
        <p className="text-red-500 text-xl">❌ Error loading data</p>
        <button
          onClick={refetch}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b-2 border-gray-200 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">📦 Contractor Material Debit</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            Total: <strong className="text-blue-600">{materials.length}</strong>
          </span>
          <button
            onClick={refetch}
            className="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* ─── Filter Section (Searchable & Independent) ──────────────────── */}
      <div className="bg-gray-50 p-5 rounded-xl mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-600 font-semibold">🔍 Search & Filter</h3>
          <span className="text-xs text-gray-400">Type to search in any dropdown</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Project Name Filter */}
          <SearchableDropdown
            label="Project Name"
            value={filters.projectName}
            onChange={(val) => handleFilterChange('projectName', val)}
            options={dropdownOptions.projects}
            placeholder="Search Project..."
            allLabel="All Projects"
          />

          {/* Contractor Name Filter */}
          <SearchableDropdown
            label="Contractor Name"
            value={filters.contractorName}
            onChange={(val) => handleFilterChange('contractorName', val)}
            options={dropdownOptions.contractors}
            placeholder="Search Contractor..."
            allLabel="All Contractors"
          />

          {/* Vendor Firm Name Filter */}
          <SearchableDropdown
            label="Vendor Firm Name"
            value={filters.vendorFirmName}
            onChange={(val) => handleFilterChange('vendorFirmName', val)}
            options={dropdownOptions.vendors}
            placeholder="Search Vendor..."
            allLabel="All Vendors"
          />

          {/* PO Number Filter */}
          <SearchableDropdown
            label="PO Number"
            value={filters.poNo}
            onChange={(val) => handleFilterChange('poNo', val)}
            options={dropdownOptions.poNumbers}
            placeholder="Search PO..."
            allLabel="All PO Numbers"
          />
        </div>

        {/* Active Filters Display */}
        {(filters.projectName || filters.contractorName || filters.vendorFirmName || filters.poNo) && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-600 font-medium">Active Filters:</span>
            {filters.projectName && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                Project: {filters.projectName}
                <button
                  onClick={() => handleFilterChange('projectName', '')}
                  className="hover:text-red-500 ml-1"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.contractorName && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                Contractor: {filters.contractorName}
                <button
                  onClick={() => handleFilterChange('contractorName', '')}
                  className="hover:text-red-500 ml-1"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.vendorFirmName && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                Vendor: {filters.vendorFirmName}
                <button
                  onClick={() => handleFilterChange('vendorFirmName', '')}
                  className="hover:text-red-500 ml-1"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.poNo && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                PO: {filters.poNo}
                <button
                  onClick={() => handleFilterChange('poNo', '')}
                  className="hover:text-red-500 ml-1"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}

        {/* Filter Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t border-gray-200 gap-3">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            ✖ Clear All Filters
          </button>
          <span className="text-sm text-gray-500">
            Showing <strong className="text-green-600">{filteredData.length}</strong> of{' '}
            <strong>{materials.length}</strong> records
          </span>
        </div>
      </div>

      {/* ─── Selection Summary ──────────────────────────────────────────── */}
      {selectedRows.length > 0 && (
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl mb-6 text-white sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-90">Selected:</span>
            <span className="text-lg font-semibold">{selectedTotals.totalMaterials} Materials</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-90">POs:</span>
            <span className="text-lg font-semibold">{selectedTotals.totalPOs}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-90">Total Amount:</span>
            <span className="text-lg font-semibold text-yellow-300">₹ {selectedTotals.totalAmount}</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="md:ml-auto px-6 py-3 bg-yellow-400 text-gray-800 rounded-lg font-semibold hover:bg-yellow-300 hover:-translate-y-0.5 hover:shadow-lg transition-all w-full md:w-auto"
          >
            📄 Generate Debit PDF
          </button>
        </div>
      )}

      {/* ─── Data Table ─────────────────────────────────────────────────── */}
      <div className="rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-auto max-h-[600px]">
          <table className="w-full border-collapse bg-white text-sm min-w-[1200px]">
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
                <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[150px]">Project Name</th>
                <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[130px]">Contractor</th>
                <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[130px]">Vendor Firm</th>
                <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[100px]">PO No</th>
                <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[90px]">PO Date</th>
                <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[150px]">Material Name</th>
                <th className="p-3 text-center font-semibold whitespace-nowrap min-w-[80px]">Req Qty</th>
                <th className="p-3 text-center font-semibold whitespace-nowrap min-w-[80px]">Rcvd Qty</th>
                <th className="p-3 text-right font-semibold whitespace-nowrap min-w-[100px]">Bill Amt</th>
                <th className="p-3 text-right font-semibold whitespace-nowrap min-w-[100px]">Net Amt</th>
                <th className="p-3 text-center font-semibold whitespace-nowrap min-w-[80px]">PO Link</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="13" className="text-center py-16 text-gray-400 text-lg">
                    {materials.length === 0 ? 'No data available' : 'No data found for selected filters'}
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
                      <td className="p-3">{row.contractorName || '-'}</td>
                      <td className="p-3">{row.vendorFirmName || '-'}</td>
                      <td className="p-3 font-semibold text-blue-600">{row.poNo || '-'}</td>
                      <td className="p-3 text-gray-600">{row.poDate || '-'}</td>
                      <td className="p-3 font-medium">{row.materialName || '-'}</td>
                      <td className="p-3 text-center">{row.requiredQty || '-'}</td>
                      <td className="p-3 text-center">{row.finalReceivedQty || '-'}</td>
                      <td className="p-3 text-right">{row.amount16 || '-'}</td>
                      <td className="p-3 text-right font-semibold text-green-600">{row.netAmount || '-'}</td>
                      <td className="p-3 text-center">
                        {row.poUrl ? (
                          <a
                            href={row.poUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-500 hover:underline"
                          >
                            📎 View
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
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

      {/* ─── Submit Modal ───────────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">📄 Generate Debit PDF</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              >
                ✖
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {/* Selection Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mb-5">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Total Materials:</span>
                  <strong>{selectedTotals.totalMaterials}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Total POs:</span>
                  <strong>{selectedTotals.totalPOs}</strong>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Total Amount:</span>
                  <strong className="text-green-600">₹ {selectedTotals.totalAmount}</strong>
                </div>
              </div>

              {/* Selected POs List */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-gray-600 mb-3">Selected PO Numbers:</h4>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {[...new Set(selectedRows.map((r) => r.poNo))].map((po, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium"
                    >
                      {po}
                    </span>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">Actual Date *</label>
                <input
                  type="date"
                  value={actualDate}
                  onChange={(e) => setActualDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                >
                  <option value="Debit Done">Debit Done</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 p-5 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !actualDate}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? '⏳ Processing...' : '✅ Confirm & Generate PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Material;