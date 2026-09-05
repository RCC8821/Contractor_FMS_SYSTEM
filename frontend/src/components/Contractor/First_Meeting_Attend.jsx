import React, { useState } from "react";
import {
  useGetFirstMeetingAttendQuery,
  usePostFirstMeetingAttendMutation,
} from "../../features/api/first_Meeting_Attend_slice";
import {
  Pencil,
  X,
  ExternalLink,
  CheckCircle,
  MapPin,
  Hash,
  FileText,
  IndianRupee,
  MessageCircle,
} from "lucide-react";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

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

const emptyForm = () => ({
  status4: "",
  location4: "",
  unitNo4: "",
  workOrderNo4: "",
  workOrderBasicValue4: "",
  remark4: "",
  pdfBase64: "",
  pdfFileName: "",
  _fileLabel: "",
});

const First_Meeting_Attend = () => {
  const { data: meetings = [], isLoading, isError, refetch } =
    useGetFirstMeetingAttendQuery();
  const [saveAttend, { isLoading: isSaving }] = usePostFirstMeetingAttendMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const openModal = (row) => {
    setSelected(row);
    setForm(emptyForm());
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
    setForm(emptyForm());
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!ok.includes(file.type)) {
      alert("Only PDF or Image allowed");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Max 10MB");
      e.target.value = "";
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setForm((p) => ({
        ...p,
        pdfBase64: base64,
        pdfFileName: file.name,
        _fileLabel: file.name,
      }));
    } catch {
      alert("File read failed");
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!selected?.uid) return alert("UID missing");
    if (!form.status4) return alert("Select Status");
    if (!form.location4.trim()) return alert("Location required");

    try {
      await saveAttend({
        uid: selected.uid,
        status4: form.status4,
        location4: form.location4.trim(),
        unitNo4: form.unitNo4.trim(),
        workOrderNo4: form.workOrderNo4.trim(),
        workOrderBasicValue4: form.workOrderBasicValue4.trim(),
        remark4: form.remark4.trim(),
        pdfBase64: form.pdfBase64 || undefined,
        pdfFileName: form.pdfFileName || undefined,
      }).unwrap();

      alert(`Saved for ${selected.uid}`);
      closeModal();
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed: " + (err?.data?.error || "Try again"));
    }
  };

  const colCount = 24;

  return (
    <div className="min-h-screen bg-gray-50 pt-4 px-2 pb-12">
      <div className="max-w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        
        {/* Table Header */}
        {/* <div className="bg-slate-900 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">1st Meeting Attend</h2>
            <p className="text-slate-400 text-sm">
              Full form data · AG (Planned_4) filled · AH empty
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-lg font-semibold">
              {isLoading ? "..." : `${meetings.length} pending`}
            </span>
            <button
              onClick={() => refetch()}
              className="text-sm px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
            >
              Refresh
            </button>
          </div>
        </div> */}

        {/* Table Content */}
        <div className="overflow-auto max-h-[calc(100vh-220px)]">
          <table className="w-max min-w-full border-collapse table-fixed">
            <colgroup>
              <col style={{ width: 100 }} />
              <col style={{ width: 140 }} />
              {/* <col style={{ width: 150 }} /> */}
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
              <col style={{ width: 100 }} />
            
            </colgroup>

            <thead>
              <tr>
                <Th>Planned_4</Th>
                <Th>UID</Th>
            
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
                <Th>Quot. PDF</Th>
              
                <Th className="!bg-indigo-800 text-center">Action</Th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={colCount} className="text-center py-16 text-gray-500">
                    Loading full data...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={colCount} className="text-center py-16 text-red-600">
                    Error!{" "}
                    <button onClick={refetch} className="underline font-bold">Retry</button>
                  </td>
                </tr>
              ) : !meetings.length ? (
                <tr>
                  <td colSpan={colCount} className="text-center py-16 text-gray-600">
                    No pending 1st meeting rows
                  </td>
                </tr>
              ) : (
                meetings.map((m, i) => (
                  <tr
                    key={m.uid || i}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-indigo-50 transition`}
                  >
                    <Cell className="font-mono text-xs text-purple-700">{m.planned4}</Cell>
                    <Cell className="font-bold text-indigo-700">{m.uid}</Cell>
                    
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
                          className="inline-flex items-center gap-1 text-blue-600 text-xs font-bold underline"
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
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow hover:scale-105 transition disabled:opacity-50"
                        title="Attend"
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

      {/* ================= MODAL ================= */}
      {isModalOpen && selected && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm">
          
          {/* Box Container - responsive max-height */}
          <div className="w-full max-w-xl flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-indigo-500" style={{ maxHeight: '90vh' }}>
            
            {/* Header (Fixed) */}
            <div className="shrink-0 bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="min-w-0 pr-4">
                <h2 className="text-lg sm:text-xl font-bold truncate">1st Meeting Attend</h2>
                <p className="text-xs sm:text-sm text-indigo-200 truncate mt-1">
                  UID: <b className="text-white">{selected.uid}</b>
                  {selected.planned4 ? ` · Planned: ${selected.planned4}` : ""}
                </p>
              </div>
              <button 
                type="button" 
                onClick={closeModal} 
                className="shrink-0 p-2 bg-white/10 rounded-full hover:bg-white/25 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Summary */}
              {/* <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm space-y-2">
                <p className="break-words">
                  <span className="text-gray-500">Project:</span> <b>{selected.projectName || "-"}</b>
                </p>
                <p className="break-words">
                  <span className="text-gray-500">Contractor:</span> <b>{selected.contractorName || "-"}</b>
                  {selected.firmName ? ` (${selected.firmName})` : ""}
                </p>
                <p>
                  <span className="text-gray-500">Total:</span> <b className="text-emerald-700">{selected.totalValue || "-"}</b>
                </p>
                {selected.workDescription && (
                  <div className="text-xs text-gray-600 break-words whitespace-pre-wrap border-t border-indigo-100 pt-2 mt-2">
                    <span className="text-gray-500 font-medium">Description: </span>
                    {selected.workDescription}
                  </div>
                )}
              </div> */}

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                <div className="sm:col-span-2">
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-gray-700">
                    <CheckCircle size={16} className="text-indigo-500" /> Status_4 *
                  </label>
                  <select
                    name="status4"
                    value={form.status4}
                    onChange={onChange}
                    className="w-full rounded-xl border-2 border-indigo-300 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">----- Select -----</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-gray-700">
                    <MapPin size={16} className="text-blue-500" /> Location_4 *
                  </label>
                  <input
                    name="location4"
                    value={form.location4}
                    onChange={onChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full location"
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-gray-700">
                    <Hash size={16} className="text-purple-500" /> Unit_No._4
                  </label>
                  <input
                    name="unitNo4"
                    value={form.unitNo4}
                    onChange={onChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="E.g. Unit-A"
                  />
                </div>
                
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-gray-700">
                    <FileText size={16} className="text-orange-500" /> Work_Order_No._4
                  </label>
                  <input
                    name="workOrderNo4"
                    value={form.workOrderNo4}
                    onChange={onChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Order Number"
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-gray-700">
                    <IndianRupee size={16} className="text-emerald-600" /> Basic Value_4
                  </label>
                  <input
                    name="workOrderBasicValue4"
                    value={form.workOrderBasicValue4}
                    onChange={onChange}
                    type="number"
                    step="any"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">
                    Pdf_Url_4 (PDF/Photo)
                  </label>
                  {!form._fileLabel ? (
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={onFile}
                      className="w-full text-sm file:mr-2 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold file:cursor-pointer border border-gray-300 rounded-xl cursor-pointer bg-white"
                    />
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
                      <span className="flex-1 truncate text-emerald-800 font-bold">
                        ✅ {form._fileLabel}
                      </span>
                      <button
                        type="button"
                        className="text-red-600 font-bold hover:underline"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            pdfBase64: "",
                            pdfFileName: "",
                            _fileLabel: "",
                          }))
                        }
                      >
                        X
                      </button>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-gray-700">
                    <MessageCircle size={16} className="text-gray-500" /> Remark_4
                  </label>
                  <textarea
                    name="remark4"
                    value={form.remark4}
                    onChange={onChange}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                    placeholder="Any additional remarks..."
                  />
                </div>
              </div>
            </div>

            {/* Footer (Fixed) */}
            <div className="shrink-0 flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl bg-gray-200 text-gray-700 px-6 py-2.5 text-sm font-bold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !form.status4 || !form.location4.trim()}
                className="rounded-xl bg-emerald-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default First_Meeting_Attend;