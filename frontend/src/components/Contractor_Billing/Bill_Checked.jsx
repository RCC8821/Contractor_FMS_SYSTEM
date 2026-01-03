import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronRight,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import {
  useGetContractorBillCheckedQuery,
  useSaveBillCheckedMutation,
} from "../../features/billing/billCheckedSlice";

const Bill_Checked = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectId: "",
    projectName: "",
    contractorFirm: "",
    contractorName: "",
    rccBillNo: "",
  });
  const [filteredData, setFilteredData] = useState([]);
  const [editableData, setEditableData] = useState([]);
  const [globalFiles, setGlobalFiles] = useState({
    measurementSheet: null,
    attendanceSheet: null,
  });
  const [globalStatus, setGlobalStatus] = useState("");

  // RTK Queries
  const {
    data: billsData,
    isLoading: loadingBills,
    error: billsError,
    isError: isBillsError,
    refetch: refetchBills,
  } = useGetContractorBillCheckedQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const [saveBillChecked, { isLoading: isSaving }] =
    useSaveBillCheckedMutation();

  useEffect(() => {
    refetchBills();
  }, [refetchBills]);

  console.log("Bills Data:", billsData);

  // Normalize function
  const normalize = (str) =>
    String(str || "")
      .trim()
      .toLowerCase();

  // Convert File to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // UNIQUE Project IDs (1 time each in dropdown)
  const projectOptions = useMemo(() => {
    if (!billsData || billsData.length === 0) return [];

    const uniqueProjects = new Map();

    billsData.forEach((bill) => {
      const key = normalize(bill.projectId);
      if (key && !uniqueProjects.has(key)) {
        uniqueProjects.set(key, {
          id: bill.projectId,
          name: bill.projectName || "Unknown",
        });
      }
    });

    const result = Array.from(uniqueProjects.values());
    console.log("Unique Projects:", result);
    return result;
  }, [billsData]);

  // UNIQUE Contractors for selected Project (1 time each in dropdown)
  const contractorOptions = useMemo(() => {
    if (!billsData || !formData.projectId) return [];

    const uniqueContractors = new Map();

    billsData
      .filter(
        (bill) => normalize(bill.projectId) === normalize(formData.projectId)
      )
      .forEach((bill) => {
        const key = normalize(bill.firmName);
        if (key && !uniqueContractors.has(key)) {
          uniqueContractors.set(key, {
            firm: bill.firmName,
            name: bill.contractorName || "Unknown",
          });
        }
      });

    const result = Array.from(uniqueContractors.values());
    console.log("Unique Contractors:", result);
    return result;
  }, [billsData, formData.projectId]);

  // UNIQUE RCC Bill Numbers for selected Project + Contractor (1 time each in dropdown)
  const rccBillOptions = useMemo(() => {
    if (!billsData || !formData.projectId || !formData.contractorFirm)
      return [];

    const uniqueBills = new Set();

    billsData
      .filter(
        (bill) =>
          normalize(bill.projectId) === normalize(formData.projectId) &&
          normalize(bill.firmName) === normalize(formData.contractorFirm)
      )
      .forEach((bill) => {
        if (bill.rccBillNo) {
          uniqueBills.add(bill.rccBillNo);
        }
      });

    const result = Array.from(uniqueBills).map((no) => ({ billNo: no }));
    console.log("Unique Bill Numbers:", result);
    return result;
  }, [billsData, formData.projectId, formData.contractorFirm]);

  const unitOptions = [
    "Sqft",
    "Nos",
    "Point",
    "Rft",
    "Kg",
    "Hours",
    "KW",
    "Ltr",
    "Cum",
    "RM",
    "Sqmt",
    "Cu.ft"
  ];

  // Handlers
  const handleProjectIdChange = (e) => {
    const id = e.target.value;
    const selected = projectOptions.find(
      (p) => normalize(p.id) === normalize(id)
    );
    setFormData({
      projectId: id,
      projectName: selected?.name || "",
      contractorFirm: "",
      contractorName: "",
      rccBillNo: "",
    });
  };

  const handleContractorFirmChange = (e) => {
    const firm = e.target.value;
    const selected = contractorOptions.find(
      (c) => normalize(c.firm) === normalize(firm)
    );
    setFormData((prev) => ({
      ...prev,
      contractorFirm: firm,
      contractorName: selected?.name || "",
      rccBillNo: "",
    }));
  };

  // Step 1 -> Step 2: Get ALL matching UIDs
  const handleNext = () => {
    if (
      !formData.projectId ||
      !formData.contractorFirm ||
      !formData.rccBillNo
    ) {
      alert("सभी फ़ील्ड भरें");
      return;
    }

    console.log("🔍 Searching with:", formData);

    // Get ALL matching records (multiple UIDs possible)
    const allMatchingRecords = billsData.filter(
      (item) =>
        normalize(item.projectId) === normalize(formData.projectId) &&
        normalize(item.firmName) === normalize(formData.contractorFirm) &&
        normalize(item.rccBillNo) === normalize(formData.rccBillNo)
    );

    console.log("✅ Found Records:", allMatchingRecords.length);
    console.log(
      "📋 UIDs Found:",
      allMatchingRecords.map((r) => r.UID)
    );

    if (allMatchingRecords.length === 0) {
      alert(
        `❌ कोई बिल नहीं मिला\n\nचेक करें:\n• Project ID: ${formData.projectId}\n• Firm: ${formData.contractorFirm}\n• RCC Bill No: ${formData.rccBillNo}`
      );
      return;
    }

    // Show ALL matching UIDs in Step 2
    setFilteredData(allMatchingRecords);
    setEditableData(
      allMatchingRecords.map((item) => ({
        uid: item.UID,
        areaQuantity2: "",
        unit2: "",
        qualityApprove2: "",
        photoEvidenceFile: null,
      }))
    );

    // alert(`✅ ${allMatchingRecords.length} UIDs मिले!\n\nUIDs: ${allMatchingRecords.map(f => f.UID).join(', ')}`);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setFilteredData([]);
    setEditableData([]);
    setGlobalFiles({ measurementSheet: null, attendanceSheet: null });
    setGlobalStatus("");
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...editableData];
    updated[index][field] = value;
    setEditableData(updated);
  };

  const handlePhotoEvidenceChange = (index, file) => {
    const updated = [...editableData];
    updated[index].photoEvidenceFile = file;
    setEditableData(updated);
  };

  const handleSubmitData = async () => {
    if (!globalFiles.measurementSheet || !globalStatus) {
      alert("Measurement Sheet और Status चुनें (Required)");
      return;
    }

    try {
      // Only convert measurementSheet (required)
      const measurementSheetBase64 = await convertToBase64(
        globalFiles.measurementSheet
      );

      // Convert attendanceSheet only if file is selected (optional)
      const attendanceSheetBase64 = globalFiles.attendanceSheet
        ? await convertToBase64(globalFiles.attendanceSheet)
        : null;

      const itemsWithBase64 = await Promise.all(
        editableData.map(async (item) => {
          const photoBase64 = item.photoEvidenceFile
            ? await convertToBase64(item.photoEvidenceFile)
            : null;
          return {
            uid: item.uid,
            areaQuantity2: item.areaQuantity2 || "",
            unit2: item.unit2 || "",
            qualityApprove2: item.qualityApprove2 || "",
            photoEvidenceBase64: photoBase64,
          };
        })
      );

      // Payload: attendanceSheetBase64 को optional भेजें
      const payload = {
        uids: editableData.map((i) => i.uid),
        status: globalStatus,
        measurementSheetBase64,
        // Only include if file exists
        ...(globalFiles.attendanceSheet && { attendanceSheetBase64 }),
        items: itemsWithBase64,
      };

      console.log("Submitting Payload:", payload);

      const result = await saveBillChecked(payload).unwrap();

      if (result.success) {
        alert(`सफल! ${result.totalProcessed} रिकॉर्ड्स`);
        refetchBills();
        setTimeout(() => {
          handleBack();
          setFormData({
            projectId: "",
            projectName: "",
            contractorFirm: "",
            contractorName: "",
            rccBillNo: "",
          });
        }, 800);
      } else {
        alert(result?.error || result?.message || "Save failed");
      }
    } catch (err) {
      console.error("Save Error:", err);
      alert("Error: " + (err?.data?.message || err?.message || "Save failed"));
    }
  };

  const handleRetry = () => {
    refetchBills();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FileText className="text-indigo-600" size={32} />
                Bill Checked By SITE ENGINEER Dashboard
              </h1>
              <p className="text-gray-600 mt-2">बिल चेकिंग और वेरिफिकेशन</p>
            </div>
            <div className="flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step >= 1 ? "bg-indigo-600 text-white" : "bg-gray-300"
                }`}
              >
                1
              </div>
              <ChevronRight className="text-gray-400" size={20} />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step >= 2 ? "bg-indigo-600 text-white" : "bg-gray-300"
                }`}
              >
                2
              </div>
            </div>
          </div>
        </div>

        {isBillsError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-center justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-red-800">डेटा लोड नहीं हुआ</p>
                <p className="text-sm text-red-600">
                  {billsError?.data?.message || "कनेक्शन समस्या"}
                </p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {loadingBills && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center py-16">
            <Loader2
              className="animate-spin mx-auto text-indigo-600"
              size={48}
            />
            <p className="mt-4 text-gray-600">Bills लोड हो रहे...</p>
            <button
              onClick={handleRetry}
              className="mt-4 text-indigo-600 underline flex items-center gap-1 mx-auto"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {step === 1 && !loadingBills && !isBillsError && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              प्रोजेक्ट और कॉन्ट्रैक्टर
            </h2>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project ID *
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={handleProjectIdChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Project</option>
                    {projectOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} - {p.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {projectOptions.length} unique projects available
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    value={formData.projectName}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contractor Firm *
                  </label>
                  <select
                    value={formData.contractorFirm}
                    onChange={handleContractorFirmChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    disabled={!formData.projectId}
                  >
                    <option value="">Select Contractor</option>
                    {contractorOptions.map((c) => (
                      <option key={c.firm} value={c.firm}>
                        {c.firm}
                      </option>
                    ))}
                  </select>
                  {formData.projectId ? (
                    <p className="text-xs text-gray-500 mt-1">
                      {contractorOptions.length} unique contractors for this
                      project
                    </p>
                  ) : (
                    <p className="text-xs text-red-500 mt-1">
                      ⚠️ पहले Project ID चुनें
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contractor Name
                  </label>
                  <input
                    value={formData.contractorName}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    RCC Bill No *
                  </label>
                  <select
                    value={formData.rccBillNo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        rccBillNo: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    disabled={!formData.contractorFirm}
                  >
                    <option value="">Select Bill Number</option>
                    {rccBillOptions.map((b) => (
                      <option key={b.billNo} value={b.billNo}>
                        {b.billNo}
                      </option>
                    ))}
                  </select>
                  {formData.contractorFirm ? (
                    <p className="text-xs text-gray-500 mt-1">
                      {rccBillOptions.length} unique bills for this contractor
                    </p>
                  ) : (
                    <p className="text-xs text-red-500 mt-1">
                      ⚠️ पहले Contractor चुनें
                    </p>
                  )}
                </div>
                <div className="flex items-end">
                  <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Selected Bill</p>
                    <p className="font-semibold text-blue-800">
                      {formData.rccBillNo || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={handleNext}
                  disabled={
                    !formData.projectId ||
                    !formData.contractorFirm ||
                    !formData.rccBillNo
                  }
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handleBack}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                ← Back
              </button>
              {isSaving && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="animate-spin" size={20} /> Saving...
                </div>
              )}
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="font-semibold text-blue-900">
                📋 Showing {filteredData.length} UID(s) for Bill:{" "}
                {formData.rccBillNo}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                UIDs: {filteredData.map((d) => d.UID).join(", ")}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">
                Global Inputs (Apply to All UIDs)
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Measurement Sheet <span className="text-red-500">*</span>
                  </label>
                  {/* <input type="file" accept="image/*" onChange={e => setGlobalFiles(prev => ({ ...prev, measurementSheet: e.target.files[0] }))} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:bg-yellow-100 file:text-yellow-700" /> */}
                  <input
                    type="file"
                    accept="image/*,application/pdf" // ← यहाँ PDF allowed
                    onChange={(e) =>
                      setGlobalFiles((prev) => ({
                        ...prev,
                        measurementSheet: e.target.files?.[0] ?? null,
                      }))
                    }
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:bg-yellow-100 file:text-yellow-700"
                  />
                  {globalFiles.measurementSheet && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle size={12} />{" "}
                      {globalFiles.measurementSheet.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attendance Sheet{" "}
                    <span className="text-gray-400">(Optional)</span>
                  </label>
                  {/* <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setGlobalFiles((prev) => ({
                        ...prev,
                        attendanceSheet: e.target.files[0],
                      }))
                    }
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:bg-yellow-100 file:text-yellow-700"
                  /> */}
                  <input
                    type="file"
                    accept="image/*,application/pdf" // ← यहाँ भी PDF allowed
                    onChange={(e) =>
                      setGlobalFiles((prev) => ({
                        ...prev,
                        attendanceSheet: e.target.files?.[0] ?? null,
                      }))
                    }
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:bg-yellow-100 file:text-yellow-700"
                  />
                  {globalFiles.attendanceSheet && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle size={12} />{" "}
                      {globalFiles.attendanceSheet.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={globalStatus}
                    onChange={(e) => setGlobalStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select</option>
                    <option value="Done">Done</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 border">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 border">
                      UID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 border">
                      Work Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 border">
                      Work Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 border">
                      Area/Qty 2
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 border">
                      Unit 2
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 border">
                      Quality 2
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 border">
                      Photo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item, i) => (
                    <tr key={`${item.UID}-${i}`} className="hover:bg-blue-50">
                      <td className="px-4 py-4 text-sm font-bold text-gray-600 border">
                        {i + 1}
                      </td>
                      <td className="px-4 py-4 font-semibold text-indigo-600 border">
                        {item.UID}
                      </td>
                      <td className="px-4 py-4 border">{item.workName}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 border max-w-xs">
                        {item.workDesc || item.workDescription || "-"}
                      </td>
                      <td className="px-4 py-4 border">
                        <input
                          type="number"
                          value={editableData[i]?.areaQuantity2 || ""}
                          onChange={(e) =>
                            handleInputChange(
                              i,
                              "areaQuantity2",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-4 border">
                        <select
                          value={editableData[i]?.unit2 || ""}
                          onChange={(e) =>
                            handleInputChange(i, "unit2", e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="">Unit</option>
                          {unitOptions.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4 border">
                        <select
                          value={editableData[i]?.qualityApprove2 || ""}
                          onChange={(e) =>
                            handleInputChange(
                              i,
                              "qualityApprove2",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="">Status</option>
                          <option>Approved</option>
                          <option>Rejected</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 border">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handlePhotoEvidenceChange(i, e.target.files[0])
                          }
                          className="text-sm"
                        />
                        {editableData[i]?.photoEvidenceFile && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle size={12} />{" "}
                            {editableData[i].photoEvidenceFile.name}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSubmitData}
                disabled={
                  isSaving || !globalFiles.measurementSheet || !globalStatus
                }
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving
                  ? "Saving..."
                  : `Submit All ${filteredData.length} UID(s)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bill_Checked;
