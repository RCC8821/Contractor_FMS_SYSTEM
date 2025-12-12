import React, { useState } from "react";
import {
  useGetApprovalForMeetingQuery,
  usePostApprovalForMeetingMutation,
} from "../../features/api/Approval_For_Meeting_Slice";
import { Calendar, User, Phone, MapPin, MessageCircle, CheckCircle, X, Pencil } from "lucide-react";

const Approval_For_Meeting = () => {
  const { data: meetings = [], isLoading, isError, refetch } = useGetApprovalForMeetingQuery();
  const [updateStatus, { isLoading: isSaving }] = usePostApprovalForMeetingMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [status3, setStatus3] = useState("");
  const [meetingScheduleSlot3, setMeetingScheduleSlot3] = useState("");
  const [doerName3, setDoerName3] = useState(""); 
  const [remark3, setRemark3] = useState("");

  // Modal open karne ke liye
  const openModal = (meeting) => {
    setSelectedMeeting(meeting);
    setStatus3(meeting.actual3 || " ");
    setMeetingScheduleSlot3("");
    setDoerName3(""); // Resetting for new meeting
    setRemark3(meeting.remark2 || "");
    setIsModalOpen(true);
  };

  // Save handler
  const handleSave = async () => {
    if (!selectedMeeting) return;

    // Check if Doer Name is selected/entered (especially important for dropdown now)
    if (!doerName3) {
        alert("Please select the Meeting Attendant.");
        return;
    }

    const payload = {
      uid: selectedMeeting.uid, 
      status3: status3,
      meetingScheduleSlot3: meetingScheduleSlot3,
      doerName3: doerName3, // Now comes from dropdown
      remark3: remark3,
    };

    try {
      await updateStatus(payload).unwrap();
      alert(`Meeting for ${selectedMeeting.clientName1} successfully ${status3.toLowerCase()}!`);
      setIsModalOpen(false);
      setSelectedMeeting(null);
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
                  {/* Icons Hata Diye Gaye Hain */}
                   <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    planned3
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
                    Contractor Name
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Contractor Contact
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Contractor Type
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Remark
                  </th>
                  {/* <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Status
                  </th> */}
                  <th className="border border-gray-300 px-4 py-4 text-center font-bold uppercase bg-indigo-800">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="13" className="text-center py-20 text-gray-500 text-lg">
                      Loading meetings...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan="13" className="text-center py-20 text-red-600 text-xl">
                      Error loading meetings! <button onClick={refetch} className="underline">Retry</button>
                    </td>
                  </tr>
                ) : !meetings || meetings.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="text-center py-20 text-gray-600 text-xl">
                      No pending meetings for approval
                    </td>
                  </tr>
                ) : (
                  meetings.map((meeting, index) => (
                    <tr
                      key={meeting.planned3 || index}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-indigo-50 transition-all`}
                    >
                      <td className="border border-gray-300 px-4 py-4 font-medium text-gray-900">
                        {meeting.planned3 || "-"}
                      </td>
                       <td className="border border-gray-300 px-4 py-4 font-medium text-gray-900">
                        {meeting.uid || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4">
                        {meeting.projectId || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 font-bold text-indigo-700">
                        {meeting.clientName1 || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4">
                        {meeting.mobileNumber1 || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 font-medium">
                        {meeting.city || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 text-sm">
                        {meeting.address1 || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 text-sm max-w-xs truncate">
                        {meeting.requirement1 || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 font-medium">
                        {meeting.contractorName2 || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4">
                        {meeting.contractorContactNo2 || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4">
                        {meeting.contractorType2 || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 text-sm max-w-xs truncate">
                        {meeting.remark2 || "-"}
                      </td>
                      {/* <td className="border border-gray-300 px-4 py-4">
                        {/* <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            meeting.actual3 === "Approved"
                              ? "bg-green-100 text-green-800"
                              : meeting.actual3
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {meeting.actual3 || "Pending"}
                        </span> */}
                      {/* </td> } */}
                      <td className="border border-gray-300 px-4 py-4 text-center bg-indigo-50">
                        <button
                          onClick={() => openModal(meeting)}
                          disabled={isSaving}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition transform hover:scale-110 disabled:opacity-50"
                          title="Schedule Meeting"
                        >
                          {/* Pencil icon lagaya gaya hai */}
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

        {/* ==================== APPROVAL MODAL (Optimized for centering and scrolling) ==================== */}
        {isModalOpen && selectedMeeting && (
          // flex items-center justify-center ensures modal is centered. overflow-y-auto enables scrolling for the entire screen overlay.
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto"> 
            {/* my-8 provides space for scrolling if content exceeds viewport height */}
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 border-4 border-indigo-600 my-8 transform transition-all">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-indigo-800">
                  <Calendar className="inline mr-2" size={28} /> Schedule Meeting
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 p-2"
                >
                  <X size={32} />
                </button>
              </div>

             

              <div className="space-y-6">
                {/* Status */}
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2 flex items-center">
                    <CheckCircle className="mr-2" size={20} /> Status
                  </label>
                  <select
                    value={status3}
                    onChange={(e) => setStatus3(e.target.value)}
                    className="w-full px-5 py-4 border-4 border-indigo-500 rounded-xl font-bold text-xl focus:outline-none focus:ring-4 focus:ring-indigo-300"
                  >
                    <option value="Select">----- Select ----</option>
                    <option value="Done">✅ Done</option>
                    
                  </select>
                </div>

                {/* Meeting Schedule */}
                {/* <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2 flex items-center">
                    <Calendar className="mr-2" size={20} /> Meeting Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={meetingScheduleSlot3}
                    onChange={(e) => setMeetingScheduleSlot3(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 text-lg"
                  />
                </div> */}

                <div>
  <label className="block text-lg font-semibold mb-2">Meeting Date & Time</label>
  <input
    type="datetime-local"
    step="60"
    className="w-full px-5 py-4 border-2 border-gray-400 rounded-xl text-lg focus:ring-4 focus:ring-purple-300 focus:outline-none"
    onChange={(e) => {
      const val = e.target.value;
      if (!val) {
        setMeetingScheduleSlot3("");
        return;
      }
      const d = new Date(val);
      const formatted = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      setMeetingScheduleSlot3(formatted);
    }}
  />
  {meetingScheduleSlot3 && (
    <div className="mt-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg inline-block">
      Saved in Sheet: <span className="font-bold">{meetingScheduleSlot3}</span>
    </div>
  )}
</div>

                {/* Doer Name (Dropdown added) */}
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2 flex items-center">
                    <User className="mr-2" size={20} /> Meeting Attendant
                  </label>
                  <select
                    value={doerName3}
                    onChange={(e) => setDoerName3(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-300 text-lg"
                  >
                    <option value="" disabled>-- Select Attendant --</option>
                    <option value="Mayank Sir">Mayank Sir</option>
                    <option value="Ravindra Sir">Ravindra Sir</option>
                    <option value="Ashok Sir">Ashok Sir</option>
                  </select>
                </div>

                {/* Remark */}
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2 flex items-center">
                    <MessageCircle className="mr-2" size={20} /> Remark
                  </label>
                  <textarea
                    value={remark3}
                    onChange={(e) => setRemark3(e.target.value)}
                    rows="4"
                    placeholder="Enter additional remarks..."
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
                    // Validation updated to check if doerName3 is selected/set
                    disabled={isSaving || !doerName3 || !meetingScheduleSlot3}
                    className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition text-xl disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Scheduling..." : "Schedule & Confirm"}
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

export default Approval_For_Meeting;