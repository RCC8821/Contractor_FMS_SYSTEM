import React, { useState } from "react";
import {
  useGetSecondMeetingPendingQuery,
  usePostSecondMeetingMomMutation,
} from "../../features/api/Second_Meeting_Attend_Slice";
import { Pencil, X, FileText, User, MapPin } from "lucide-react";

const Second_Meeting_Attend = () => {
  const {
    data: meetings = [],
    isLoading,
    isError,
  } = useGetSecondMeetingPendingQuery();

  const [submitMom, { isLoading: isSaving }] = usePostSecondMeetingMomMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMom, setSelectedMom] = useState(null);

  const [status6, setStatus6] = useState("");
  const [doerName6, setDoerName6] = useState(" ");
  const [momFile, setMomFile] = useState(null);

  const openModal = (row) => {
    setSelectedMom(row);
    setStatus6("Done"); 
    setDoerName6(" ");
    setMomFile(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setMomFile(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!selectedMom?.uid || !momFile) {
      alert("MOM PDF required");
      return;
    }

    try {
      await submitMom({
        uid: selectedMom.uid,
        status6,
        DoerName_6: doerName6,
        momPdfBase64: momFile,
      }).unwrap();

      alert("Second Meeting MOM submitted");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed: " + (err?.data?.error || "Try again"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 px-4 pb-20">
      {/* Header */}
      {/* <div className="max-w-full mx-auto mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Second Meeting Attendance</h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage and submit second meeting attendance details
        </p>
      </div> */}

      {/* Table Container */}
      <div className="max-w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-300">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">Planned Date</th>
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">UID</th>
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">Project ID</th>
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">Client Name</th>
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">Mobile</th>
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">City</th>
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">Address</th>
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">Requirement</th>
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">Contractor</th>
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">Cont. Mobile</th>
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">Cont. Type</th>
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">Schedule Slot</th>
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">Doer 3</th>
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">Doer 4</th>
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">Location</th>
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">Turnover</th>
                <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase text-xs">Next Meeting</th>
                <th className="border border-gray-300 px-4 py-4 text-center font-bold uppercase bg-indigo-900 text-xs">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="18" className="text-center py-20 text-gray-500 text-xl">Loading...</td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="18" className="text-center py-20 text-red-600 text-xl">Error! Failed to load data.</td>
                </tr>
              ) : meetings.length === 0 ? (
                <tr>
                  <td colSpan="18" className="text-center py-20 text-gray-600 text-xl">No Pending Records</td>
                </tr>
              ) : (
                meetings.map((item, i) => (
                  <tr key={item.uid} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-4 py-3 font-medium text-purple-700">{item.planned6 || "-"}</td>
                    <td className="border border-gray-300 px-4 py-3 font-medium text-purple-700">{item.uid}</td>
                    <td className="border border-gray-300 px-4 py-3">{item.projectId}</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-indigo-700">{item.clientName1}</td>
                    <td className="border border-gray-300 px-4 py-3">{item.mobileNumber1}</td>
                    <td className="border border-gray-300 px-4 py-3">{item.city}</td>
                    <td className="border border-gray-300 px-4 py-3 text-xs">{item.address1}</td>
                    <td className="border border-gray-300 px-4 py-3 text-xs">{item.requirement1}</td>
                    <td className="border border-gray-300 px-4 py-3 font-medium text-green-700">{item.contractorName2}</td>
                    <td className="border border-gray-300 px-4 py-3">{item.contractorContactNo2}</td>
                    <td className="border border-gray-300 px-4 py-3">{item.contractorType2}</td>
                    <td className="border border-gray-300 px-4 py-3 font-medium text-blue-600">{item.MeetingScheduleSlot_3}</td>
                    <td className="border border-gray-300 px-4 py-3">{item.Doer_Name_3}</td>
                    <td className="border border-gray-300 px-4 py-3">{item.Doer_Name_4}</td>
                    <td className="border border-gray-300 px-4 py-3">{item.MeetingLocation}</td>
                    <td className="border border-gray-300 px-4 py-3">{item.BasicTurnOver5}</td>
                    <td className="border border-gray-300 px-4 py-3">{item.NextMeetingSchedule5}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center bg-indigo-50">
                      <button
                        onClick={() => openModal(item)}
                        className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md hover:scale-110 transition mx-auto"
                      >
                        <Pencil size={18} />
                      </button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && selectedMom && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4 border-indigo-600">
            <div className="sticky top-0 bg-white border-b-4 border-indigo-600 p-6 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-indigo-800">Submit Second Meeting MOM</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:text-red-500 transition">
                <X size={34} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Status Section */}
              <div>
                <label className="block text-lg font-semibold mb-2">Status</label>
                <select
                  value={status6}
                  onChange={(e) => setStatus6(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-indigo-500 rounded-xl text-lg focus:outline-none focus:ring-4 focus:ring-indigo-200"
                >
                  <option value="Done">Done</option>
                
                </select>
              </div>

              {/* Doer Name Section */}
              <div>
                <label className="block text-lg font-semibold mb-2 flex items-center">
                  <User className="mr-2 text-indigo-600" size={20} /> Doer Name 6
                </label>
                <input
                  type="text"
                  value={doerName6}
                  onChange={(e) => setDoerName6(e.target.value)}
                  placeholder="Enter doer name"
                  className="w-full px-5 py-4 border-2 border-gray-400 rounded-xl text-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* File Upload Section */}
              <div>
                <label className="block text-lg font-semibold mb-2 flex items-center">
                  <FileText className="mr-2 text-red-600" size={20} /> MOM PDF (Required)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full px-5 py-4 border-2 border-red-500 rounded-xl text-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
                {momFile && (
                  <p className="mt-2 text-green-600 font-medium flex items-center">
                    ✓ MOM file selected
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !momFile}
                  className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {isSaving ? "Submitting..." : "Submit MOM"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Second_Meeting_Attend;