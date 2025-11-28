import React, { useState } from "react";
import {
  useGetPendingFinalBillsQuery,
  useMarkFinalBillCheckedMutation,
} from "../../features/Payment/BiLL_Checked_BY_RavindraSir_Slice";
import { Pencil, X } from "lucide-react";

const BILL_Checked_BY_RavindraSir = () => {
  const { data: bills = [], isLoading, isError, refetch } = useGetPendingFinalBillsQuery();
  const [updateStatus, { isLoading: isSaving }] = useMarkFinalBillCheckedMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [status, setStatus] = useState("Done");
  const [remark, setRemark] = useState("");

  const formatAmount = (value) => {
    if (!value) return 0;
    const num = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const openModal = (bill) => {
    setSelectedBill(bill);
    setStatus(bill.ravindraStatus || "Done");
    setRemark(bill.ravindraRemark || "");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedBill) return;

    const payload = {
      rccBillNo: selectedBill.rccBillNo,
      status6: status,     // Column AK
      remark6: remark,     // Column AM
    };

    try {
      await updateStatus(payload).unwrap();
      alert(`Bill ${selectedBill.rccBillNo} successfully checked by Ravindra Sir!`);
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
        <div className="max-w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-300">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase ">Planned</th>
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
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Bill Amount</th>

                  {/* ---------- NEW COLUMNS AFTER BILL AMOUNT ---------- */}
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase ">NET Current Amt</th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase ">Prev. Bill Amt</th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase ">Up-to-date Paid</th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase ">Balance Amt</th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase ">Remark</th>

                  {/* Action - moved to last */}
                  <th className="border border-gray-300 px-4 py-4 text-center font-bold uppercase bg-indigo-800">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="21" className="text-center py-20 text-gray-500 text-lg">Loading...</td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan="21" className="text-center py-20 text-red-600 text-xl">
                      Error! <button onClick={refetch} className="underline">Retry</button>
                    </td>
                  </tr>
                ) : !bills || bills.length === 0 ? (
                  <tr>
                    <td colSpan="21" className="text-center py-20 text-gray-600 text-xl">No bills found</td>
                  </tr>
                ) : (
                  bills.map((bill, index) => (
                    <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50 transition-all`}>
                      <td className="border border-gray-300 px-4 py-4">{bill.planned6 || "-"}</td>
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
                        {bill.billUrl ? <a href={bill.billUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View PDF</a> : "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 text-center">
                        {bill.measurementSheetUrl ? <a href={bill.measurementSheetUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View PDF</a> : "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 text-center">
                        {bill.attendanceSheetUrl ? <a href={bill.attendanceSheetUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View PDF</a> : "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 text-center">{bill.rccSummarySheetNo || "-"}</td>
                      <td className="border border-gray-300 px-4 py-4 text-center">
                        {bill.rccSummarySheetUrl ? <a href={bill.rccSummarySheetUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View PDF</a> : "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 font-bold text-green-600 text-right pr-6">
                        ₹{formatAmount(bill.billAmount).toLocaleString("en-IN")}
                      </td>

                      {/* ---------- NEW DATA COLUMNS ---------- */}
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

                      {/* Action - now last */}
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

        {/* ==================== MODAL (unchanged) ==================== */}
        {isModalOpen && selectedBill && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 border-4 border-indigo-600">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-indigo-800">
                   Check: <span className="text-purple-700">{selectedBill.rccBillNo}</span>
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
                    disabled={isSaving}
                    className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition text-xl disabled:opacity-70"
                  >
                    {isSaving ? "Saving..." : "Save & Confirm"}
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

export default BILL_Checked_BY_RavindraSir;