import React, { useState, useEffect } from "react";
import { useGetPendingPaymentsQuery } from "../../features/Payment/Payment_Tally_Slice";
import { Pencil, X, Search } from "lucide-react";

const Payment_Tally = () => {
  // RTK Query hook - data fetch karne ke liye
  const { data: apiResponse = {}, isLoading, isError, refetch } = useGetPendingPaymentsQuery();

  // Extract data from API response
  const bills = apiResponse.data || [];
  const uniqueContractors = apiResponse.uniqueContractors || [];
  const totalCount = apiResponse.count || 0;
  const message = apiResponse.message || "";

  // Filter states
  const [selectedContractor, setSelectedContractor] = useState("");
  const [selectedFirm, setSelectedFirm] = useState("");
  const [filteredBills, setFilteredBills] = useState([]);
  const [showTable, setShowTable] = useState(false); // Changed: initially false

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [status, setStatus] = useState("Done");
  const [remark, setRemark] = useState("");

  // Auto-populate firm when contractor is selected
  useEffect(() => {
    if (selectedContractor) {
      const contractor = uniqueContractors.find(
        (c) => c.contractorName === selectedContractor
      );
      if (contractor) {
        setSelectedFirm(contractor.firmName);
      }
    } else {
      setSelectedFirm("");
    }
  }, [selectedContractor, uniqueContractors]);

  // Handle fetch/filter button click
  const handleFetch = () => {
    if (selectedContractor && selectedFirm) {
      const filtered = bills.filter(
        (bill) =>
          bill.contractorName === selectedContractor &&
          bill.firmName === selectedFirm
      );
      setFilteredBills(filtered);
      setShowTable(true); // Show table after filtering
    } else {
      alert("Please select Contractor Name to proceed");
    }
  };

  // Clear filters and hide table
  const handleClearFilter = () => {
    setSelectedContractor("");
    setSelectedFirm("");
    setFilteredBills([]);
    setShowTable(false); // Hide table when clearing
  };

  // Format amount for display
  const formatAmount = (value) => {
    if (!value) return 0;
    const num = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // Open modal for editing
  const openModal = (bill) => {
    setSelectedBill(bill);
    setStatus(bill.actual7 || "Done");
    setRemark(bill.remark || "");
    setIsModalOpen(true);
  };

  // Save modal data
  const handleSave = async () => {
    if (!selectedBill) return;

    try {
      alert(`Bill ${selectedBill.rccBillNo} successfully updated!`);
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save: " + (err?.data?.error || "Please try again"));
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-8 px-4 pb-12">
        {/* Header */}
        <div className="max-w-full mx-auto mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-800">Payment Tally</h1>
            {showTable && (
              <div className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">
                Filtered Bills: {filteredBills.length}
              </div>
            )}
          </div>
        </div>

        {/* Main Filter Section - Always visible */}
        {!showTable ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-2xl p-8 border-2 border-blue-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Select Contractor to View Bills
                </h2>
                <p className="text-gray-600">
                  Total Available Bills: <span className="font-bold text-blue-600">{totalCount}</span>
                </p>
              </div>

              <div className="space-y-6">
                {/* Contractor Name Dropdown */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Contractor Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedContractor}
                    onChange={(e) => setSelectedContractor(e.target.value)}
                    className="w-full px-5 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="">-- Select Contractor --</option>
                    {uniqueContractors.map((contractor, index) => (
                      <option key={index} value={contractor.contractorName}>
                        {contractor.contractorName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Firm Name Input (Auto-populated) */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Firm Name
                  </label>
                  <input
                    type="text"
                    value={selectedFirm}
                    readOnly
                    placeholder="Auto-populated based on contractor selection"
                    className="w-full px-5 py-3 text-lg border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Fetch Button */}
                <button
                  onClick={handleFetch}
                  disabled={!selectedContractor || !selectedFirm || isLoading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg"
                >
                  <Search size={24} />
                  View Payment Bills
                </button>
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="mt-6 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading contractors...</p>
                </div>
              )}

              {/* Error state */}
              {isError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-red-600">Failed to load data</p>
                  <button onClick={refetch} className="mt-2 text-blue-600 underline">
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Filter Info Bar - Shows when table is visible */}
            <div className="max-w-full mx-auto mb-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg">
                    Showing bills for: 
                    <span className="font-bold text-blue-600 ml-2">{selectedContractor}</span>
                    <span className="text-gray-500 mx-2">|</span>
                    <span className="font-semibold">{selectedFirm}</span>
                  </p>
                </div>
                <button
                  onClick={handleClearFilter}
                  className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <X size={20} />
                  Change Contractor
                </button>
              </div>
            </div>

            {/* Table Section */}
            <div className="max-w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-300">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Planned7</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">RCC Bill No</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Project ID</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Project Name</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Site Engineer</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Contractor Name</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Firm Name</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Work Name</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Contractor Bill No</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Bill Date</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Bill PDF</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Measurement Sheet</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Attendance Sheet</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">RCC Summary No</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">RCC Summary PDF</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Work Order No</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Work Order PDF</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Work Order Value</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Bill Amount</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">NET Current Amt</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Prev. Bill Amt</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Up-to-date Paid</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Balance Amt</th>
                      <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Remark</th>
                      <th className="border border-gray-300 px-4 py-4 text-center font-bold uppercase bg-indigo-800">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.length === 0 ? (
                      <tr>
                        <td colSpan="25" className="text-center py-20 text-gray-600 text-xl">
                          No bills found for {selectedContractor}
                        </td>
                      </tr>
                    ) : (
                      filteredBills.map((bill, index) => (
                        <tr
                          key={index}
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50 transition-all`}
                        >
                          <td className="border border-gray-300 px-4 py-4">{bill.planned7 || "-"}</td>
                          <td className="border border-gray-300 px-4 py-4 font-medium text-gray-900">{bill.rccBillNo || "-"}</td>
                          <td className="border border-gray-300 px-4 py-4">{bill.projectId || "-"}</td>
                          <td className="border border-gray-300 px-4 py-4 font-medium">{bill.projectName || "-"}</td>
                          <td className="border border-gray-300 px-4 py-4">{bill.siteEngineer || "-"}</td>
                          <td className="border border-gray-300 px-4 py-4">{bill.contractorName || "-"}</td>
                          <td className="border border-gray-300 px-4 py-4">{bill.firmName || "-"}</td>
                          <td className="border border-gray-300 px-4 py-4">{bill.workName || "-"}</td>
                          <td className="border border-gray-300 px-4 py-4">{bill.contractorBillNo || "-"}</td>
                          <td className="border border-gray-300 px-4 py-4">{bill.billDate || "-"}</td>
                          <td className="border border-gray-300 px-4 py-4 text-center">
                            {bill.billUrl ? (
                              <a href={bill.billUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                📄 View
                              </a>
                            ) : "-"}
                          </td>
                          <td className="border border-gray-300 px-4 py-4 text-center">
                            {bill.measurementSheetUrl ? (
                              <a href={bill.measurementSheetUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                📄 View
                              </a>
                            ) : "-"}
                          </td>
                          <td className="border border-gray-300 px-4 py-4 text-center">
                            {bill.attendanceSheetUrl ? (
                              <a href={bill.attendanceSheetUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                📄 View
                              </a>
                            ) : "-"}
                          </td>
                          <td className="border border-gray-300 px-4 py-4 text-center">{bill.rccSummarySheetNo || "-"}</td>
                          <td className="border border-gray-300 px-4 py-4 text-center">
                            {bill.rccSummarySheetUrl ? (
                              <a href={bill.rccSummarySheetUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                📄 View
                              </a>
                            ) : "-"}
                          </td>
                          <td className="border border-gray-300 px-4 py-4">{bill.WorkOrderNo || "-"}</td>
                          <td className="border border-gray-300 px-4 py-4 text-center">
                            {bill.workOrderUrl ? (
                              <a href={bill.workOrderUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                📄 View
                              </a>
                            ) : "-"}
                          </td>
                          <td className="border border-gray-300 px-4 py-4 text-right pr-6">
                            ₹{formatAmount(bill.WorkOrderValue).toLocaleString("en-IN")}
                          </td>
                          <td className="border border-gray-300 px-4 py-4 font-bold text-green-600 text-right pr-6">
                            ₹{formatAmount(bill.billAmount).toLocaleString("en-IN")}
                          </td>
                          <td className="border border-gray-300 px-4 py-4 font-bold text-right pr-6 text-blue-700">
                            ₹{formatAmount(bill.NETAMOUNTCurrentAmount).toLocaleString("en-IN")}
                          </td>
                          <td className="border border-gray-300 px-4 py-4 text-right pr-6">
                            ₹{formatAmount(bill.PreviousBillAmount).toLocaleString("en-IN")}
                          </td>
                          <td className="border border-gray-300 px-4 py-4 text-right pr-6">
                            ₹{formatAmount(bill.UPToDatePaidAmount).toLocaleString("en-IN")}
                          </td>
                          <td className="border border-gray-300 px-4 py-4 font-bold text-right pr-6 text-red-600">
                            ₹{formatAmount(bill.BalanceAmount).toLocaleString("en-IN")}
                          </td>
                          <td className="border border-gray-300 px-4 py-4">{bill.remark || "-"}</td>
                          <td className="border border-gray-300 px-4 py-4 text-center bg-indigo-50">
                            <button
                              onClick={() => openModal(bill)}
                              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition transform hover:scale-110"
                            >
                              <Pencil size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Modal - unchanged */}
        {isModalOpen && selectedBill && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 border-4 border-indigo-600">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-indigo-800">
                  Update Bill: <span className="text-purple-700">{selectedBill.rccBillNo}</span>
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-gray-800">
                  <X size={32} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-5 py-4 border-4 border-indigo-500 rounded-xl font-bold text-xl focus:outline-none focus:ring-4 focus:ring-indigo-300"
                  >
                    <option value="Done">Done</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2">Remark</label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    rows="5"
                    placeholder="Enter remark..."
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 resize-none text-lg"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-4 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition text-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition text-xl"
                  >
                    Save & Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Payment_Tally;




//////////////////////////////////////////////////////


