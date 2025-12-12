// src/pages/Meeting_Mom.jsx

import React, { useState } from "react";
import {
  useGetPendingMomQuery,
  usePostMeetingMomMutation,
} from "../../features/api/Meeting_Mom_Slice";
import {
  Pencil,
  X,
  Calendar,
  MapPin,
  FileText,
  User,
  MessageCircle,
} from "lucide-react";

const Meeting_Mom = () => {
  const { data: moms = [], isLoading, isError } = useGetPendingMomQuery();

  const [submitMom, { isLoading: isSaving }] = usePostMeetingMomMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMom, setSelectedMom] = useState(null);

  // Form fields
  const [status5, setStatus5] = useState("Done");
  const [meetingLocation5, setMeetingLocation5] = useState("");
  const [nextMeetingSchedule5, setNextMeetingSchedule5] = useState("");
  const [basicTurnover5, setBasicTurnover5] = useState("");
  const [noOfProjects5, setNoOfProjects5] = useState("");
  const [momFile, setMomFile] = useState(null);
  const [gstFile, setGstFile] = useState(null);

  const openModal = (mom) => {
    setSelectedMom(mom);
    setStatus5("Done");
    setMeetingLocation5("");
    setNextMeetingSchedule5("");
    setBasicTurnover5("");
    setNoOfProjects5("");
    setMomFile(null);
    setGstFile(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setter(reader.result); // base64 string
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedMom?.uid) return;

    if (!momFile) {
      alert("MOM PDF is required!");
      return;
    }

    try {
      await submitMom({
        uid: selectedMom.uid,
        status5,
        meetingLocation5,
        nextMeetingSchedule5,
        basicTurnover5,
        noOfProjects5,
        momPdfBase64: momFile,
        gstCertificateBase64: gstFile || undefined,
      }).unwrap();

      alert(`MOM submitted successfully for ${selectedMom.clientName1}!`);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed: " + (err?.data?.error || "Try again"));
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-8 px-4 pb-20">
        {/* Header */}
        <div className="max-w-full mx-auto mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">Meeting MOM</h1>
          <p className="mt-2 text-lg text-gray-600">
            Submit MOM, GST Certificate & meeting details
          </p>
        </div>

        {/* Table */}
        <div className="max-w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-300">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Planned Date
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    UID
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Project ID
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Client Name
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Mobile
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    City
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Address
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Requirement
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Contractor
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Cont. Mobile
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Cont. Type
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Schedule Slot
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    {" "}
                    Doer Name 3
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    {" "}
                    Doer Name 4
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    {" "}
                    Remark 4
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-center font-bold uppercase bg-indigo-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-20 text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan="9" className="text-center py-20 text-red-600">
                      Error! Retry
                    </td>
                  </tr>
                ) : moms.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center py-20 text-gray-600 text-xl"
                    >
                      No pending MOMs
                    </td>
                  </tr>
                ) : (
                  moms.map((item, i) => (
                    <tr
                      key={item.planned5}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border border-gray-300 px-4 py-3 font-medium text-purple-700">
                        {item.planned5 || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 font-medium text-purple-700">
                        {item.uid || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {item.projectId}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 font-bold text-indigo-700">
                        {item.clientName1}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {item.mobileNumber1}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {item.city}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm">
                        {item.address1}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm">
                        {item.requirement1}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 font-medium text-green-700">
                        {item.contractorName2}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {item.contractorContactNo2}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {item.contractorType2}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 font-medium text-blue-600">
                        {item.MeetingScheduleSlot_3 || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {item.Doer_Name_3 || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {item.Doer_Name_4 || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {item.remark4 || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center bg-indigo-50">
                        <button
                          onClick={() => openModal(item)}
                          className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md hover:scale-110 transition"
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

        {/* MODAL */}
        {isModalOpen && selectedMom && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border-4 border-indigo-600">
              <div className="sticky top-0 bg-white border-b-4 border-indigo-600 p-6 flex justify-between items-center">
                <h2 className="text-3xl font-bold text-indigo-800">
                  Submit Meeting MOM
                </h2>
                <button onClick={() => setIsModalOpen(false)}>
                  <X size={34} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Client Info */}

                {/* Status */}
                <div>
                  <label className="block text-lg font-semibold mb-2">
                    Status
                  </label>
                  <select
                    value={status5}
                    onChange={(e) => setStatus5(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-indigo-500 rounded-xl text-lg"
                  >
                    <option value="Done">Done</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/* Meeting Location */}
                <div>
                  <label className="block text-lg font-semibold mb-2 flex items-center">
                    <MapPin className="mr-2" size={20} /> Meeting Location
                  </label>
                  <input
                    type="text"
                    value={meetingLocation5}
                    onChange={(e) => setMeetingLocation5(e.target.value)}
                    placeholder="e.g. Client Office, Andheri"
                    className="w-full px-5 py-4 border-2 border-gray-400 rounded-xl text-lg"
                  />
                </div>

                {/* Next Meeting */}
                <div>
                  <label className="block text-lg font-semibold mb-2">
                    Next_Meeting_Schedule
                  </label>
                  <input
                    type="datetime-local"
                    step="60"
                    className="w-full px-5 py-4 border-2 border-gray-400 rounded-xl text-lg focus:ring-4 focus:ring-purple-300 focus:outline-none"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setNextMeetingSchedule5("");
                        return;
                      }
                      const d = new Date(val);
                      const formatted = `${String(d.getDate()).padStart(
                        2,
                        "0"
                      )}/${String(d.getMonth() + 1).padStart(
                        2,
                        "0"
                      )}/${d.getFullYear()} ${String(d.getHours()).padStart(
                        2,
                        "0"
                      )}:${String(d.getMinutes()).padStart(2, "0")}`;
                      setNextMeetingSchedule5(formatted);
                    }}
                  />
                  {nextMeetingSchedule5 && (
                    <div className="mt-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg inline-block">
                      Saved in Sheet:{" "}
                      <span className="font-bold">{nextMeetingSchedule5}</span>
                    </div>
                  )}
                </div>

                {/* Turnover & Projects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-semibold mb-2">
                      Basic Turnover
                    </label>
                    <input
                      type="text"
                      value={basicTurnover5}
                      onChange={(e) => setBasicTurnover5(e.target.value)}
                      placeholder="e.g. 50 Lakh"
                      className="w-full px-5 py-4 border-2 border-gray-400 rounded-xl text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold mb-2">
                      No. of Projects
                    </label>
                    <input
                      type="number"
                      value={noOfProjects5}
                      onChange={(e) => setNoOfProjects5(e.target.value)}
                      placeholder="e.g. 12"
                      className="w-full px-5 py-4 border-2 border-gray-400 rounded-xl text-lg"
                    />
                  </div>
                </div>

                {/* MOM PDF (Required) */}
                <div>
                  <label className="block text-lg font-semibold mb-2 flex items-center">
                    <FileText className="mr-2" size={20} /> MOM PDF (Required)
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileChange(e, setMomFile)}
                    className="w-full px-5 py-4 border-2 border-red-500 rounded-xl text-lg"
                    required
                  />
                  {momFile && (
                    <p className="mt-2 text-green-600 text-sm">
                      MOM file selected
                    </p>
                  )}
                </div>

                {/* GST Certificate (Optional) */}
                <div>
                  <label className="block text-lg font-semibold mb-2 flex items-center">
                    <FileText className="mr-2" size={20} /> GST Certificate
                    (Optional)
                  </label>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => handleFileChange(e, setGstFile)}
                    className="w-full px-5 py-4 border-2 border-gray-400 rounded-xl text-lg"
                  />
                  {gstFile && (
                    <p className="mt-2 text-green-600 text-sm">
                      GST file selected
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-4 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !momFile}
                    className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-60"
                  >
                    {isSaving ? "Submitting..." : "Submit MOM"}
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

export default Meeting_Mom;
