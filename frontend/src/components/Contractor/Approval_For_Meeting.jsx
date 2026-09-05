import React, { useState } from "react";
import {
  useGetApprovalForMeetingQuery,
  usePostApprovalForMeetingMutation,
} from "../../features/api/Approval_For_Meeting_Slice";
import {
  CheckCircle,
  X,
  Pencil,
  MessageCircle,
  ExternalLink,
  Clock,
} from "lucide-react";

function getISTPreview() {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const dd = String(ist.getDate()).padStart(2, "0");
  const mm = String(ist.getMonth() + 1).padStart(2, "0");
  const yyyy = ist.getFullYear();
  const hh = String(ist.getHours()).padStart(2, "0");
  const min = String(ist.getMinutes()).padStart(2, "0");
  const ss = String(ist.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}

const Cell = ({ children, className = "" }) => (
  <td
    className={`border border-gray-200 px-3 py-2.5 align-top text-sm whitespace-pre-wrap break-words ${className}`}
    title={typeof children === "string" ? children : undefined}
  >
    {children === null || children === undefined || children === "" ? "-" : children}
  </td>
);

const Th = ({ children, className = "" }) => (
  <th
    className={`border border-gray-300 px-3 py-3 text-left font-bold uppercase text-xs tracking-wide sticky top-0 z-10 bg-gray-800 text-white ${className}`}
  >
    {children}
  </th>
);

const Approval_For_Meeting = () => {
  const { data: meetings = [], isLoading, isError, refetch } =
    useGetApprovalForMeetingQuery();
  const [updateStatus, { isLoading: isSaving }] =
    usePostApprovalForMeetingMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [status3, setStatus3] = useState("");
  const [remark3, setRemark3] = useState("");

  const openModal = (meeting) => {
    setSelectedMeeting(meeting);
    setStatus3("");
    setRemark3("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMeeting(null);
    setStatus3("");
    setRemark3("");
  };

  const handleSave = async () => {
    if (!selectedMeeting) return;
    if (!status3 || !["Approved", "Reject"].includes(status3)) {
      alert("Please select Status: Approved or Reject");
      return;
    }
    try {
      const res = await updateStatus({
        uid: selectedMeeting.uid,
        status3,
        remark3: remark3.trim(),
      }).unwrap();
      alert(
        `${selectedMeeting.projectName || selectedMeeting.uid} → ${status3}\n` +
          `Actual: ${res?.data?.actual3 || getISTPreview()}`
      );
      closeModal();
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to save: " + (err?.data?.error || "Please try again"));
    }
  };

  // Actual3 / Status3 / Remark3 table se hata diye → 20 data cols + Action
  const colCount = 21;

  return (
    <div className="min-h-screen bg-gray-50 pt-4 px-2 pb-12">
      <div className="max-w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {/* <div className="bg-slate-900 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">Approval For Meeting</h2>
            <p className="text-slate-400 text-sm">
              Sirf Pending (Status empty) · Approved / Reject list me nahi
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-lg font-semibold">
              {isLoading ? "..." : `${meetings.length} pending`}
            </span>
            <button
              onClick={() => refetch()}
              className="text-sm px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl"
            >
              Refresh
            </button>
          </div>
        </div> */}

        <div className="overflow-auto max-h-[calc(100vh-220px)]">
          <table className="w-max min-w-full border-collapse table-fixed">
            <colgroup>
              <col style={{ width: 100 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 180 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 260 }} />
              <col style={{ width: 180 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 90 }} />
            </colgroup>

            <thead>
              <tr>
                <Th>UID</Th>
                <Th>Timestamp</Th>
                <Th>Project Name</Th>
                <Th>Location</Th>
                <Th>Project Type</Th>
                <Th>Work Category</Th>
                <Th>Work Description</Th>
                <Th>Remark (Project)</Th>
                <Th>Contractor Name</Th>
                <Th>Firm Name</Th>
                <Th>Contact</Th>
                <Th>Contractor Type</Th>
                <Th>GST</Th>
                <Th>Turnover</Th>
                <Th>Projects Done</Th>
                <Th>Current Projects</Th>
                <Th>Est. Qty</Th>
                <Th>Unit</Th>
                <Th>Rate</Th>
                <Th>Total Value</Th>
                <Th>Quotation No</Th>
                <Th>PDF</Th>
                <Th className="!bg-indigo-800 text-center">Action</Th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={colCount} className="text-center py-16 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={colCount} className="text-center py-16 text-red-600">
                    Error!{" "}
                    <button onClick={refetch} className="underline font-bold">
                      Retry
                    </button>
                  </td>
                </tr>
              ) : !meetings.length ? (
                <tr>
                  <td colSpan={colCount} className="text-center py-16 text-gray-600">
                    No pending entries
                  </td>
                </tr>
              ) : (
                meetings.map((m, index) => (
                  <tr
                    key={m.uid || index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50"
                    } hover:bg-indigo-50/80`}
                  >
                    <Cell className="font-bold text-indigo-700">{m.uid}</Cell>
                    <Cell className="font-mono text-xs">{m.timestamp}</Cell>
                    <Cell className="font-semibold">{m.projectName}</Cell>
                    <Cell>{m.projectLocation}</Cell>
                    <Cell>{m.projectType}</Cell>
                    <Cell>{m.workCategory}</Cell>
                    <Cell className="text-xs leading-relaxed">{m.workDescription}</Cell>
                    <Cell className="text-xs leading-relaxed">{m.remark1}</Cell>
                    <Cell className="font-medium">{m.contractorName}</Cell>
                    <Cell>{m.firmName}</Cell>
                    <Cell className="font-mono">{m.contractorContact}</Cell>
                    <Cell>{m.contractorType}</Cell>
                    <Cell>{m.gstCertificate}</Cell>
                    <Cell>{m.basicTurnOver}</Cell>
                    <Cell>{m.noOfProject}</Cell>
                    <Cell>{m.noOfCurrentProject}</Cell>
                    <Cell>{m.estimatedQty}</Cell>
                    <Cell>{m.unit}</Cell>
                    <Cell>{m.rate}</Cell>
                    <Cell className="font-bold text-emerald-700">{m.totalValue}</Cell>
                    <Cell className="font-mono font-bold">{m.quotationNo}</Cell>
                    <Cell className="text-center">
                      {m.quotationPdfUrl ? (
                        <a
                          href={m.quotationPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs font-bold"
                        >
                          View <ExternalLink size={12} />
                        </a>
                      ) : (
                        "-"
                      )}
                    </Cell>
                    <td className="border border-gray-200 px-3 py-2.5 text-center bg-indigo-50 align-top">
                      <button
                        onClick={() => openModal(m)}
                        disabled={isSaving}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-110 disabled:opacity-50"
                        title="Approve / Reject"
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

      {/* ===== MODAL: header hamesha dikhe, body scroll ===== */}
      {isModalOpen && selectedMeeting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md max-h-[min(90vh,640px)] flex flex-col rounded-2xl bg-white shadow-2xl border-2 border-indigo-500 overflow-hidden">
            {/* HEADER — fixed, cut nahi hoga */}
            <div className="shrink-0 bg-indigo-600 text-white px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold leading-tight">
                  Approval Decision
                </h2>
                <p className="text-xs text-indigo-100 mt-0.5 truncate">
                  UID: <span className="font-bold text-white">{selectedMeeting.uid}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="shrink-0 rounded-lg p-1.5 hover:bg-white/20"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            {/* BODY — sirf yahan scroll */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
              {/* <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm space-y-1.5">
                <p className="break-words">
                  <span className="text-gray-500">Project:</span>{" "}
                  <b>{selectedMeeting.projectName || "-"}</b>
                </p>
                <p className="break-words">
                  <span className="text-gray-500">Location:</span>{" "}
                  {selectedMeeting.projectLocation || "-"}
                </p>
                <p>
                  <span className="text-gray-500">Type / Category:</span>{" "}
                  {selectedMeeting.projectType || "-"} / {selectedMeeting.workCategory || "-"}
                </p>
                <p className="break-words">
                  <span className="text-gray-500">Contractor:</span>{" "}
                  <b>{selectedMeeting.contractorName || "-"}</b>
                  {selectedMeeting.firmName ? ` (${selectedMeeting.firmName})` : ""}
                </p>
                <p>
                  <span className="text-gray-500">Contact:</span>{" "}
                  {selectedMeeting.contractorContact || "-"}
                </p>
                <p>
                  <span className="text-gray-500">Contractor Type:</span>{" "}
                  {selectedMeeting.contractorType || "-"}
                </p>
                <p>
                  <span className="text-gray-500">Total:</span>{" "}
                  <b className="text-emerald-700">{selectedMeeting.totalValue || "-"}</b>
                  {selectedMeeting.quotationNo
                    ? ` · Quotation: ${selectedMeeting.quotationNo}`
                    : ""}
                </p>
                <p className="break-words whitespace-pre-wrap text-xs text-gray-600 border-t border-slate-200 pt-1.5 mt-1">
                  <span className="text-gray-500">Work:</span>{" "}
                  {selectedMeeting.workDescription || "-"}
                </p>
                <p className="break-words whitespace-pre-wrap text-xs text-gray-600">
                  <span className="text-gray-500">Project Remark:</span>{" "}
                  {selectedMeeting.remark1 || "-"}
                </p>
                {selectedMeeting.quotationPdfUrl ? (
                  <a
                    href={selectedMeeting.quotationPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 text-xs font-bold underline"
                  >
                    View PDF <ExternalLink size={12} />
                  </a>
                ) : null}
              </div> */}

              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <Clock size={14} /> Actual (auto datetime)
                </label>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-mono text-sm font-bold text-emerald-800">
                  {getISTPreview()}
                </div>
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <CheckCircle size={14} /> Status *
                </label>
                <select
                  value={status3}
                  onChange={(e) => setStatus3(e.target.value)}
                  className="w-full rounded-lg border-2 border-indigo-400 px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">----- Select -----</option>
                  <option value="Approved">✅ Approved</option>
                  <option value="Reject">❌ Reject</option>
                </select>
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <MessageCircle size={14} /> Remark
                </label>
                <textarea
                  value={remark3}
                  onChange={(e) => setRemark3(e.target.value)}
                  rows={3}
                  placeholder="Enter remark..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>

            {/* FOOTER — fixed neeche */}
            <div className="shrink-0 flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-bold text-white hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !status3}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approval_For_Meeting;