// src/pages/First_Meeting_Attend.jsx   (ya jahan bhi rakhna hai)

import React, { useState } from "react";
import {
  useGetFirstMeetingAttendQuery,
  usePostFirstMeetingAttendMutation,
} from "../../features/api/first_Meeting_Attend_slice";
import { Pencil, X, Calendar, User, MessageCircle, CheckCircle } from "lucide-react";

const First_Meeting_Attend = () => {
  const {
    data: meetings = [],
    isLoading,
    isError,
  } = useGetFirstMeetingAttendQuery();

  const [attendMeeting, { isLoading: isSaving }] = usePostFirstMeetingAttendMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const [status4, setStatus4] = useState(" ");
  const [doerName4, setDoerName4] = useState("");
  const [remark4, setRemark4] = useState("");

  const openModal = (meeting) => {
    setSelectedMeeting(meeting);
    setStatus4(" ");
    setDoerName4("");
    setRemark4("");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedMeeting?.planned4) {
      alert("Meeting data missing!");
      return;
    }
    if (!doerName4) {
      alert("Please select who attended the meeting.");
      return;
    }

    try {
      await attendMeeting({
        uid: selectedMeeting.uid,    // Column Z ka timestamp = unique identifier
        status4: status4,
        doerName4: doerName4,
        remark4: remark4,
      }).unwrap();

      alert(`1st Meeting attended successfully for ${selectedMeeting.clientName1}!`);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed: " + (err?.data?.error || "UID not found / Try again"));
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-8 px-4 pb-20">
        {/* Header */}
        {/* <div className="max-w-full mx-auto mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">1st Meeting Attend</h1>
          <p className="mt-2 text-lg text-gray-600">Mark attendance after meeting with client & contractor</p>
        </div> */}

        {/* Table */}
        <div className="max-w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-300">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Planned Date</th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">UID</th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Project ID</th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Client Name</th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Mobile</th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">City</th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Address</th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Requirement</th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Contractor</th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Cont. Mobile</th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Cont. Type</th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">Schedule Slot</th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase"> Doer Name 3</th>
                  <th className="border border-gray-300 px-4 py-4 text-center font-bold uppercase bg-indigo-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="12" className="text-center py-20 text-gray-500">Loading...</td></tr>
                ) : isError ? (
                  <tr><td colSpan="12" className="text-center py-20 text-red-600">Error! Retry</td></tr>
                ) : meetings.length === 0 ? (
                  <tr><td colSpan="12" className="text-center py-20 text-gray-600 text-xl">No pending meetings to attend</td></tr>
                ) : (
                  meetings.map((item, i) => (
                    <tr key={item.planned4} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 px-4 py-3 font-medium text-purple-700">
                        {item.planned4 || "-"}
                      </td><td className="border border-gray-300 px-4 py-3 font-medium text-purple-700">
                        {item.uid || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">{item.projectId}</td>
                      <td className="border border-gray-300 px-4 py-3 font-bold text-indigo-700">{item.clientName1}</td>
                      <td className="border border-gray-300 px-4 py-3">{item.mobileNumber1}</td>
                      <td className="border border-gray-300 px-4 py-3">{item.city}</td>
                      <td className="border border-gray-300 px-4 py-3 text-sm">{item.address1}</td>
                      <td className="border border-gray-300 px-4 py-3 text-sm">{item.requirement1}</td>
                      <td className="border border-gray-300 px-4 py-3 font-medium text-green-700">{item.contractorName2}</td>
                      <td className="border border-gray-300 px-4 py-3">{item.contractorContactNo2}</td>
                      <td className="border border-gray-300 px-4 py-3">{item.contractorType2}</td>
                      <td className="border border-gray-300 px-4 py-3 font-medium text-blue-600">
                        {item.MeetingScheduleSlot_3 || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">{item.Doer_Name_3 || "-"}</td>
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

        {/* MODAL - Always on Top + Scrollable */}
        {isModalOpen && selectedMeeting && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border-4 border-indigo-600">
              <div className="sticky top-0 bg-white border-b-4 border-indigo-600 p-6 flex justify-between items-center">
                <h2 className="text-3xl font-bold text-indigo-800">
                  1st Meeting Attend
                </h2>
                <button onClick={() => setIsModalOpen(false)}>
                  <X size={34} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Client Info Box */}
               

                {/* Status */}
                <div>
                  <label className="block text-lg font-semibold mb-2 flex items-center">
                    Status
                  </label>
                  <select
                    value={status4}
                    onChange={(e) => setStatus4(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-indigo-500 rounded-xl font-medium text-lg"
                  >
                    <option value="Select">----- Select ----- </option>
                    <option value="Done">Done </option>
                   
                  </select>
                </div>

                {/* Doer Name Dropdown */}
                <div>
                  <label className="block text-lg font-semibold mb-2 flex items-center">
                    <User className="mr-2" /> Who Attended This Meeting?
                  </label>
                  <select
                    value={doerName4}
                    onChange={(e) => setDoerName4(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-green-500 rounded-xl font-medium text-lg"
                    required
                  >
                    <option value="" disabled>-- Select Person --</option>
                    <option value="Mayank Sir">Mayank Sir</option>
                    <option value="Ravindra Sir">Ravindra Sir</option>
                    <option value="Ashok Sir">Ashok Sir</option>
                   
                  </select>
                </div>

                {/* Remark */}
                <div>
                  <label className="block text-lg font-semibold mb-2 flex items-center">
                    <MessageCircle className="mr-2" /> Remark
                  </label>
                  <textarea
                    value={remark4}
                    onChange={(e) => setRemark4(e.target.value)}
                    rows="4"
                    placeholder="Meeting feedback, client response, next steps..."
                    className="w-full px-5 py-4 border-2 border-gray-400 rounded-xl resize-none text-lg"
                  />
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
                    disabled={isSaving || !doerName4}
                    className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Mark as Attended"}
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

export default First_Meeting_Attend;