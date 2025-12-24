import React, { useState, useEffect } from "react";
import { Pencil, X, Search } from "lucide-react";
import {
  useGetBillFinalByOfficeQuery,
  useUpdateBillFinalByRccMutation,
  useGetWorkOrderColumnsQuery,
  useGetDoneBillsQuery,
} from "../../features/Payment/Bill_final_By_Office_Slice";

const formatAmount = (value) => {
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const BILL_FINAL_BY_OFFICE = () => {
  const {
    data: bills,
    isLoading,
    isError,
    refetch,
  } = useGetBillFinalByOfficeQuery();

  const [updateBillFinalByRcc, { isLoading: isSaving }] =
    useUpdateBillFinalByRccMutation();
  const { data: workOrderColumns } = useGetWorkOrderColumnsQuery();
  const { data: doneBills = [] } = useGetDoneBillsQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [availableContractors, setAvailableContractors] = useState([]);
  const [availableFirms, setAvailableFirms] = useState([]);
  const [availableWorkTypes, setAvailableWorkTypes] = useState([]);
  const [matchingContractorRows, setMatchingContractorRows] = useState([]);
  const [matchingFirmRows, setMatchingFirmRows] = useState([]);

  const [formData, setFormData] = useState({
    contractorName: "",
    firmName: "",
    workType: "",
    workOrderNo: "",
    workOrderUrl: "",
    workOrderValue: "",
    sdAmount5: "",
    debitAmount: "",
    materialDebitAmount5: "",
    gstPercent: "0",
    cgst: "0",
    sgst: "0",
    netAmount: " ",
    previousBillAmount: " ",
    upToDatePaidAmount: " ",
    balanceAmount: " ",
    remark5: "",
    status5: "Select",
  });

  // ✅ STRICT METHOD: Previous bill sirf tabhi find karein jab sab kuch match kare
  const findPreviousBillData = (
    currentRccBillNo,
    currentContractor,
    currentFirm,
    currentWorkType,
    currentWorkOrderNo,
    currentProjectId
  ) => {
    if (!doneBills || doneBills.length === 0) {
      console.log("❌ No done bills available");
      return null;
    }

    const currentBillNum = parseInt(currentRccBillNo?.replace("RCCBill", ""));
    if (isNaN(currentBillNum)) {
      console.log("❌ Invalid current bill number:", currentRccBillNo);
      return null;
    }

    console.log("🔍 STRICT Search Previous Bill for:", {
      currentRccBillNo,
      currentProjectId,
      currentContractor,
      currentFirm,
      currentWorkType,
      currentWorkOrderNo,
      totalDoneBills: doneBills.length,
      currentBillNum,
    });

    // ✅ STRICT FILTERING: Sirf wahi bills jo puri tarah match karein
    const matchingBills = doneBills.filter((doneBill) => {
      const doneBillNum = parseInt(doneBill.rccBillNo?.replace("RCCBill", ""));

      // ✅ Basic validation
      if (isNaN(doneBillNum) || doneBillNum >= currentBillNum) {
        return false;
      }

      // ✅ Sab fields ka strict comparison
      const isProjectMatch =
        String(doneBill.projectId || "").trim() ===
        String(currentProjectId || "").trim();
      const isContractorMatch =
        String(doneBill.contractorName || "")
          .trim()
          .toLowerCase() ===
        String(currentContractor || "")
          .trim()
          .toLowerCase();
      const isFirmMatch =
        String(doneBill.firmName || "")
          .trim()
          .toLowerCase() ===
        String(currentFirm || "")
          .trim()
          .toLowerCase();
      const isWorkMatch =
        String(doneBill.workName || "")
          .trim()
          .toLowerCase() ===
        String(currentWorkType || "")
          .trim()
          .toLowerCase();

      // ✅ Work order comparison (optional, lekin agar available ho toh check karein)
      let isWorkOrderMatch = true;
      if (
        currentWorkOrderNo &&
        currentWorkOrderNo !== "" &&
        currentWorkOrderNo !== " "
      ) {
        isWorkOrderMatch =
          String(doneBill.WorkOrderNo || "").trim() ===
          String(currentWorkOrderNo || "").trim();
      }

      // ✅ Sab conditions true hone chahiye
      const isMatch =
        isProjectMatch &&
        isContractorMatch &&
        isFirmMatch &&
        isWorkMatch &&
        isWorkOrderMatch;

      if (isMatch) {
        console.log("✅ Found Matching Previous Bill:", {
          doneBillNo: doneBill.rccBillNo,
          doneProjectId: doneBill.projectId,
          doneContractor: doneBill.contractorName,
          doneFirm: doneBill.firmName,
          doneWork: doneBill.workName,
          doneWorkOrder: doneBill.WorkOrderNo,
        });
      }

      return isMatch;
    });

    console.log(
      "📋 Strict Matching Previous Bills Found:",
      matchingBills.length
    );

    if (matchingBills.length === 0) {
      console.log("❌ No strictly matching previous bills found");
      return null;
    }

    // ✅ Sabse highest bill number wala select karo
    const closestBill = matchingBills.reduce((prev, current) => {
      const prevNum = parseInt(prev.rccBillNo.replace("RCCBill", ""));
      const currentNum = parseInt(current.rccBillNo.replace("RCCBill", ""));
      return currentNum > prevNum ? current : prev;
    });

    console.log("✅ Closest Strict Match Previous Bill:", closestBill);
    return closestBill;
  };

  // ✅ Filtered bills for search
  const filteredBills =
    bills?.filter((bill) =>
      bill.rccBillNo?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // ✅ Search modal mein bill select karne ka function
  const handleSearchBillSelect = (bill) => {
    setSelectedBill(bill);
    setIsSearchModalOpen(false);
    setIsModalOpen(true);

    const workOrderNo = bill.WorkOrderNo || "";
    const workOrderUrl = bill.workOrderUrl || "";
    const workOrderValue = bill.WorkOrderValue || "";

    // ✅ Previous bill data fetch karo
    let previousBillAmount = "0";

    if (
      bill.contractorName &&
      bill.firmName &&
      bill.workName &&
      bill.projectId
    ) {
      const previousBillData = findPreviousBillData(
        bill.rccBillNo,
        bill.contractorName,
        bill.firmName,
        bill.workName,
        workOrderNo,
        bill.projectId
      );

      if (previousBillData) {
        previousBillAmount = previousBillData.UPToDatePaidAmount || "0";
      }
    }

    // Fallback: Agar existing bill mein data hai toh use karein
    if (previousBillAmount === "0" && bill.PreviousBillAmount) {
      previousBillAmount = bill.PreviousBillAmount;
    }

    setFormData({
      contractorName: "",
      firmName: "",
      workType: "",
      workOrderNo: workOrderNo,
      workOrderUrl: workOrderUrl,
      workOrderValue: workOrderValue,
      sdAmount5: "",
      debitAmount: "",
      materialDebitAmount5: "",
      gstPercent: "0",
      cgst: "0.00",
      sgst: "0.00",
      netAmount: " ",
      previousBillAmount: String(previousBillAmount).replace(/,/g, ""),
      upToDatePaidAmount: " ",
      balanceAmount: " ",
      remark5: bill.remark || "",
      status5: bill.status5 || "Select",
    });

    setAvailableContractors([]);
    setAvailableFirms([]);
    setAvailableWorkTypes([]);
    setMatchingContractorRows([]);
    setMatchingFirmRows([]);
  };

  // ✅ Jab bill select ho, tab available contractors fetch karo
  useEffect(() => {
    if (!selectedBill || !workOrderColumns || !workOrderColumns.Project_ID) {
      setAvailableContractors([]);
      setAvailableFirms([]);
      setAvailableWorkTypes([]);
      setMatchingContractorRows([]);
      setMatchingFirmRows([]);
      return;
    }

    const projectId = String(selectedBill.projectId).trim();
    const contractors = [];

    for (let i = 0; i < workOrderColumns.Project_ID.length; i++) {
      const pid = String(workOrderColumns.Project_ID[i]).trim();
      if (pid === projectId) {
        const name = workOrderColumns.Contractor_Name[i];
        if (name && name.trim() && !contractors.includes(name.trim())) {
          contractors.push(name.trim());
        }
      }
    }

    setAvailableContractors(contractors);
    setAvailableFirms([]);
    setAvailableWorkTypes([]);
    setMatchingContractorRows([]);
    setMatchingFirmRows([]);
  }, [selectedBill, workOrderColumns]);

  // ✅ Contractor select karne par firms fetch karo
  const handleContractorChange = (e) => {
    const contractor = e.target.value;

    setFormData((prev) => ({
      ...prev,
      contractorName: contractor,
      firmName: "",
      workType: "",
      workOrderNo: "",
      workOrderUrl: "",
      workOrderValue: "",
      previousBillAmount: "0",
    }));

    setAvailableFirms([]);
    setAvailableWorkTypes([]);
    setMatchingContractorRows([]);
    setMatchingFirmRows([]);

    if (!contractor || !selectedBill || !workOrderColumns) return;

    const projectId = String(selectedBill.projectId).trim();
    const rows = [];
    const firms = new Set();

    for (let i = 0; i < workOrderColumns.Project_ID.length; i++) {
      const pid = String(workOrderColumns.Project_ID[i]).trim();
      const name = workOrderColumns.Contractor_Name[i];

      if (pid === projectId && name === contractor) {
        const firm = workOrderColumns.Contractor_Firm_Name[i] || "";
        rows.push({
          firmName: firm,
          workType: workOrderColumns.Work_Type[i] || "",
          workOrderNo: workOrderColumns.Work_Order_No[i] || "",
          workOrderUrl: workOrderColumns.Work_Order_Url[i] || "",
          workOrderValue: workOrderColumns.Work_Order_Value[i] || "",
        });
        if (firm) firms.add(firm);
      }
    }

    const firmList = Array.from(firms);
    setMatchingContractorRows(rows);
    setAvailableFirms(firmList);
  };

  // ✅ Firm select karne par work types fetch karo
  const handleFirmChange = (selectedFirm) => {
    setFormData((prev) => ({
      ...prev,
      firmName: selectedFirm,
      workType: "",
      workOrderNo: "",
      workOrderUrl: "",
      workOrderValue: "",
      previousBillAmount: "0",
    }));

    setAvailableWorkTypes([]);
    setMatchingFirmRows([]);

    if (!selectedFirm) return;

    const firmRows = matchingContractorRows.filter(
      (row) => row.firmName === selectedFirm
    );
    const workTypes = new Set();

    firmRows.forEach((row) => {
      if (row.workType) workTypes.add(row.workType);
    });

    const workTypeList = Array.from(workTypes);
    setMatchingFirmRows(firmRows);
    setAvailableWorkTypes(workTypeList);

    if (workTypeList.length === 1) {
      handleWorkTypeChange(workTypeList[0]);
    }
  };

  // ✅ Work Type select karne par work order details + previous bill auto-fill
  const handleWorkTypeChange = (selectedWorkType) => {
    const selectedRow = matchingFirmRows.find(
      (row) => row.workType === selectedWorkType
    );

    if (selectedRow) {
      console.log("🔍 Selected Row:", selectedRow);

      // ✅ STRICT METHOD: Done Bills API se previous bill data find karein
      const previousBillData = findPreviousBillData(
        selectedBill.rccBillNo,
        formData.contractorName,
        formData.firmName,
        selectedWorkType,
        selectedRow.workOrderNo,
        selectedBill.projectId
      );

      let previousBillAmount = "0";

      if (previousBillData) {
        previousBillAmount = previousBillData.UPToDatePaidAmount || "0";
        console.log(
          "✅ Previous Bill Amount from Done Bills API:",
          previousBillAmount
        );
      } else {
        console.log("❌ No Previous Bill Found in Done Bills");
      }

      setFormData((prev) => ({
        ...prev,
        workType: selectedRow.workType,
        workOrderNo: selectedRow.workOrderNo,
        workOrderUrl: selectedRow.workOrderUrl,
        workOrderValue: selectedRow.workOrderValue || "0",
        previousBillAmount: String(previousBillAmount).replace(/,/g, ""),
      }));
    }
  };

  // ✅ Edit button click - Modal open with previous bill data
  const handleEdit = (bill) => {
    console.log("🖊️ Editing Bill:", bill);
    console.log("📋 Done Bills Available:", doneBills);

    setSelectedBill(bill);

    const workOrderNo = bill.WorkOrderNo || "";
    const workOrderUrl = bill.workOrderUrl || "";
    const workOrderValue = bill.WorkOrderValue || "";

    // ✅ STRICT METHOD: Done Bills API se previous bill amount fetch karein
    let previousBillAmount = "0";

    if (
      bill.contractorName &&
      bill.firmName &&
      bill.workName &&
      bill.projectId
    ) {
      const previousBillData = findPreviousBillData(
        bill.rccBillNo,
        bill.contractorName,
        bill.firmName,
        bill.workName,
        workOrderNo,
        bill.projectId
      );

      if (previousBillData) {
        previousBillAmount = previousBillData.UPToDatePaidAmount || "0";
        console.log(
          "✅ Previous Bill from Done Bills API:",
          previousBillAmount
        );
      } else {
        console.log("❌ No previous bill data found for:", {
          currentBill: bill.rccBillNo,
          projectId: bill.projectId,
          contractor: bill.contractorName,
          firm: bill.firmName,
          work: bill.workName,
        });
      }
    }

    // Fallback: Agar existing bill mein data hai toh use karein
    if (previousBillAmount === "0" && bill.PreviousBillAmount) {
      previousBillAmount = bill.PreviousBillAmount;
      console.log("🔄 Using existing PreviousBillAmount:", previousBillAmount);
    }

    setFormData({
      contractorName: "",
      firmName: "",
      workType: "",
      workOrderNo: workOrderNo,
      workOrderUrl: workOrderUrl,
      workOrderValue: workOrderValue,
      debitAmount: "",
      materialDebitAmount5: "",
      sdAmount5: "",
      gstPercent: "0",
      cgst: "0.00",
      sgst: "0.00",
      netAmount: "0",
      previousBillAmount: String(previousBillAmount).replace(/,/g, ""),
      upToDatePaidAmount: "0",
      balanceAmount: "0",
      remark5: bill.remark || "",
      status5: bill.status5 || "Select",
    });

    setAvailableContractors([]);
    setAvailableFirms([]);
    setAvailableWorkTypes([]);
    setMatchingContractorRows([]);
    setMatchingFirmRows([]);
    setIsModalOpen(true);
  };
useEffect(() => {
  if (!selectedBill) return;

  const billAmount = formatAmount(selectedBill.billAmount);
  const debitAmountVal = parseFloat(formData.debitAmount) || 0;
  const gstRate = parseFloat(formData.gstPercent) || 0;

  // ✅ 1. Actual Amount = Bill Amount - Debit Amount
  const actualAmount = billAmount - debitAmountVal;

  // ✅ 2. GST सिर्फ Actual Amount पर लगेगी
  const gstOnActual = (actualAmount * gstRate) / 100;
  const cgst = gstOnActual / 2;
  const sgst = gstOnActual / 2;

  // 3. SD & Material Debit
  const sd = parseFloat(formData.sdAmount5) || 0;
  const materialDebit = parseFloat(formData.materialDebitAmount5) || 0;

  // 4. Amount with GST
  const amountWithGst = actualAmount + gstOnActual;

  // 5. Final Net Amount (Paid Amount after deductions)
  const finalNetAmount = amountWithGst - sd - materialDebit;

  // ———————————————————————————————————————
  // UP TO DATE PAID AMOUNT
  // ———————————————————————————————————————
  const previousPaid = parseFloat(String(formData.previousBillAmount).replace(/,/g, "") || "0");

  // Base: Previous + Actual Amount (after debit) + GST on Actual
  let upToDatePaidAmount = previousPaid + actualAmount + gstOnActual;

  // Note: Debit Amount का GST पहले से include है क्योंकि हम actualAmount पर GST लगा रहे हैं
  // इसलिए debit पर अलग से GST add करने की जरूरत नहीं

  upToDatePaidAmount = upToDatePaidAmount.toFixed(2);

  // Balance Amount
  let balanceAmount = "0";
  if (formData.workOrderValue && formData.workOrderValue !== "0" && formData.contractorName) {
    const workOrderValue = formatAmount(formData.workOrderValue);
    balanceAmount = (workOrderValue - parseFloat(upToDatePaidAmount)).toFixed(2);
  }

  // Update FormData
  setFormData(prev => ({
    ...prev,
    cgst: cgst.toFixed(2),
    sgst: sgst.toFixed(2),
    netAmount: finalNetAmount.toFixed(2),
    upToDatePaidAmount: upToDatePaidAmount,
    balanceAmount: balanceAmount,
  }));
}, [
  formData.sdAmount5,
  formData.debitAmount,
  formData.materialDebitAmount5,
  formData.gstPercent,
  formData.workOrderValue,
  formData.previousBillAmount,
  formData.contractorName,
  selectedBill,
]);
  // useEffect(() => {
  //   if (!selectedBill) return;

  //   const billAmount = formatAmount(selectedBill.billAmount);
  //   const gstRate = parseFloat(formData.gstPercent) || 0;

  //   // 1. GST on Original Bill
  //   const gstOnBill = (billAmount * gstRate) / 100;
  //   const cgst = gstOnBill / 2;
  //   const sgst = gstOnBill / 2;

  //   // 2. Debit Amount (yeh sirf bill se kata jaayega)
  //   const debitAmount = parseFloat(formData.debitAmount) || 0;

  //   // 3. Actual Amount after Debit (for display & net calculation)
  //   const actualAmount = billAmount - debitAmount;

  //   // 4. Net Amount after SD & Material Debit
  //   const sd = parseFloat(formData.sdAmount5) || 0;
  //   const materialDebit = parseFloat(formData.materialDebitAmount5) || 0;
  //   const amountWithGst = actualAmount + gstOnBill;
  //   const finalNetAmount = amountWithGst - sd - materialDebit;

  //   // ———————————————————————————————————————
  //   // UP TO DATE PAID AMOUNT — SIRF YEHI ADD HOGA
  //   // ———————————————————————————————————————
  //   const previousPaid = parseFloat(
  //     String(formData.previousBillAmount).replace(/,/g, "") || "0"
  //   );

  //   // Base: Previous + Current Bill + GST on Bill
  //   let upToDatePaidAmount = previousPaid + billAmount + gstOnBill;

  //   // Sirf Debit Amount ka GST add karo (full debit nahi!)
  //   if (gstRate > 0 && debitAmount > 0) {
  //     const gstOnDebit = (debitAmount * gstRate) / 100; // ← Sirf yeh add hoga
  //     upToDatePaidAmount += gstOnDebit;
  //   }

  //   upToDatePaidAmount = upToDatePaidAmount.toFixed(2);

  //   // Balance Amount
  //   let balanceAmount = "0";
  //   if (
  //     formData.workOrderValue &&
  //     formData.workOrderValue !== "0" &&
  //     formData.contractorName
  //   ) {
  //     const workOrderValue = formatAmount(formData.workOrderValue);
  //     balanceAmount = (workOrderValue - parseFloat(upToDatePaidAmount)).toFixed(
  //       2
  //     );
  //   }

  //   // Update FormData
  //   setFormData((prev) => ({
  //     ...prev,
  //     cgst: cgst.toFixed(2),
  //     sgst: sgst.toFixed(2),
  //     netAmount: finalNetAmount.toFixed(2),
  //     upToDatePaidAmount: upToDatePaidAmount,
  //     balanceAmount: balanceAmount,
  //   }));
  // }, [
  //   formData.sdAmount5,
  //   formData.debitAmount,
  //   formData.materialDebitAmount5,
  //   formData.gstPercent,
  //   formData.workOrderValue,
  //   formData.previousBillAmount,
  //   formData.contractorName,
  //   selectedBill,
  // ]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ FIXED: handleSave function with correct payload structure
  const handleSave = async () => {
    if (!selectedBill) return;

    const billAmount = formatAmount(selectedBill.billAmount);
    const debit = parseFloat(formData.debitAmount) || 0;
    const materialDebit = parseFloat(formData.materialDebitAmount5) || 0;
    const actualAmount = billAmount - debit;

    // ✅ CORRECT PAYLOAD STRUCTURE matching backend API
    const payload = {
      rccBillNo: selectedBill.rccBillNo,
      workOrderNo5: formData.workOrderNo || "",
      workOrderUrl: formData.workOrderUrl || "",
      workOrderValue: formData.workOrderValue || "0",

      // ✅ CRITICAL FIXES:
      sdAmount: formatAmount(formData.sdAmount5), // Goes to Column Y
      debitAmount: formatAmount(formData.debitAmount), // Goes to Column W
      materialDebitAmount5: formatAmount(formData.materialDebitAmount5), // Goes to Column Z
      actualBillAmount: actualAmount.toString(), // Goes to Column X

      // GST amounts
      cgst: formData.cgst, // Goes to Column AA
      sgst: formData.sgst, // Goes to Column AB

      // Net Amount (should be calculated correctly)
      netAmount: formData.netAmount, // Goes to Column AC

      // Previous amounts
      Previous_Bill_Amount_5: formData.previousBillAmount || "0", // Column AD
      UP_To_Date_Paid_Amount_5: formData.upToDatePaidAmount || "0", // Column AE
      Balance_Amount_6: formData.balanceAmount || "0", // Column AF

      // Remark and Status
      remark: formData.remark5 || "", // Column AG
      status: formData.status5 || "Done", // Column AH
    };

    // ✅ DEBUG: Console me check karein ki sab values sahi hain
    console.log("🔍 DEBUG - Frontend Payload Structure:");
    console.log("sdAmount (should go to Column Y):", payload.sdAmount);
    console.log(
      "materialDebitAmount5 (should go to Column Z):",
      payload.materialDebitAmount5
    );
    console.log("netAmount (should go to Column AC):", payload.netAmount);
    console.log("Full payload structure:", JSON.stringify(payload, null, 2));

    try {
      const result = await updateBillFinalByRcc(payload).unwrap();
      console.log("✅ Save successful:", result);
      alert(`✅ Bill ${selectedBill.rccBillNo} Successfully Finalized!`);
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      console.error("❌ Save failed:", err);
      console.error("Error details:", err.data || err.message);
      alert("Failed to save bill. Check console for details.");
    }
  };

  const billAmount = selectedBill ? formatAmount(selectedBill.billAmount) : 0;
  const debitAmount = parseFloat(formData.debitAmount) || 0;
  const actualAmount = billAmount - debitAmount;

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-8 px-4 pb-12">
        {/* ✅ SEARCH BUTTON SECTION - TOP RIGHT */}
        <div className="max-w-full mx-auto mb-6 flex justify-end">
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
          >
            <Search size={20} />
            Search RCC Bill No
          </button>
        </div>

        <div className="max-w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-300">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    RCC Bill No
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Project ID
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Project Name
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Site Engineer
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Contractor Name
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Firm Name
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Work Name
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Contractor Bill No
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Bill Date
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Bill PDF
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Measurement Sheet
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Attendance Sheet
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    RCC Summary No
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    RCC Summary PDF
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-left font-bold uppercase">
                    Bill Amount
                  </th>
                  <th className="border border-gray-300 px-4 py-4 text-center font-bold uppercase bg-indigo-800">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="16"
                      className="text-center py-20 text-gray-500 text-lg"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan="16"
                      className="text-center py-20 text-red-600 text-xl"
                    >
                      Error!{" "}
                      <button onClick={refetch} className="underline">
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : !bills || bills.length === 0 ? (
                  <tr>
                    <td
                      colSpan="16"
                      className="text-center py-20 text-gray-600 text-xl"
                    >
                      No bills found
                    </td>
                  </tr>
                ) : (
                  bills.map((bill, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-indigo-50 transition-all`}
                    >
                      <td className="border border-gray-300 px-4 py-4 font-medium text-gray-900">
                        {bill.rccBillNo || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4">
                        {bill.projectId || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 font-medium">
                        {bill.projectName || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4">
                        {bill.siteEngineer || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4">
                        {bill.contractorName || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4">
                        {bill.firmName || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4">
                        {bill.workName || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4">
                        {bill.contractorBillNo || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4">
                        {bill.billDate || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 text-center">
                        {bill.billUrl ? (
                          <a
                            href={bill.billUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View PDF
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 text-center">
                        {bill.measurementSheetUrl ? (
                          <a
                            href={bill.measurementSheetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View PDF
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 text-center">
                        {bill.attendanceSheetUrl ? (
                          <a
                            href={bill.attendanceSheetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View PDF
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 text-center">
                        {bill.rccSummarySheetNo || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 text-center">
                        {bill.rccSummarySheetUrl ? (
                          <a
                            href={bill.rccSummarySheetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View PDF
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 font-bold text-green-600 text-right pr-6">
                        ₹{formatAmount(bill.billAmount).toLocaleString("en-IN")}
                      </td>
                      <td className="border border-gray-300 px-4 py-4 text-center bg-indigo-50">
                        <button
                          onClick={() => handleEdit(bill)}
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

        {/* ✅ SEARCH MODAL */}
        {isSearchModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60">
            <div className="min-h-screen px-2 sm:px-4 pt-4 sm:pt-10 pb-12 sm:pb-24">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-300 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center">
                    <h2 className="text-lg sm:text-2xl md:text-3xl font-bold">
                      Search RCC Bill No
                    </h2>
                    <button
                      onClick={() => setIsSearchModalOpen(false)}
                      className="bg-white/20 hover:bg-white/30 rounded-full p-2 sm:p-3 transition backdrop-blur-sm shrink-0"
                    >
                      <X className="w-6 h-6 sm:w-8 sm:h-8" />
                    </button>
                  </div>

                  <div className="p-4 sm:p-6 md:p-8">
                    {/* Search Input */}
                    <div className="mb-6">
                      <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                        Search RCC Bill No ({filteredBills.length} bills found)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Type RCC Bill No to search..."
                          className="w-full px-4 py-3 pl-12 border-2 border-blue-500 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                    </div>

                    {/* Bills List */}
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                      {isLoading ? (
                        <div className="text-center py-8 text-gray-500">
                          Loading bills...
                        </div>
                      ) : filteredBills.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          {searchTerm
                            ? "No bills found matching your search"
                            : "No bills available"}
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {filteredBills.map((bill, index) => (
                            <div
                              key={index}
                              onClick={() => handleSearchBillSelect(bill)}
                              className="p-4 hover:bg-blue-50 cursor-pointer transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="font-bold text-lg text-blue-700">
                                    {bill.rccBillNo}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {bill.contractorName} • {bill.firmName} •{" "}
                                    {bill.workName}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-green-600 text-lg">
                                    ₹
                                    {formatAmount(
                                      bill.billAmount
                                    ).toLocaleString("en-IN")}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {bill.projectName}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => setIsSearchModalOpen(false)}
                        className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ MAIN EDIT MODAL */}
        {isModalOpen && selectedBill && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60">
            <div className="min-h-screen px-2 sm:px-4 pt-4 sm:pt-10 pb-12 sm:pb-24">
              <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-300 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center">
                    <h2 className="text-lg sm:text-2xl md:text-3xl font-bold">
                      Finalize Bill:{" "}
                      <span className="text-yellow-300 block sm:inline mt-1 sm:mt-0">
                        {selectedBill.rccBillNo}
                      </span>
                    </h2>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="bg-white/20 hover:bg-white/30 rounded-full p-2 sm:p-3 transition backdrop-blur-sm shrink-0"
                    >
                      <X className="w-6 h-6 sm:w-8 sm:h-8" />
                    </button>
                  </div>

                  <div className="p-4 sm:p-6 md:p-8 max-h-[85vh] sm:max-h-screen overflow-y-auto">
                    <div className="space-y-4 sm:space-y-6 md:space-y-8">
                      {/* ✅ STRICT SECTION: Done Bills API se Previous Bill Display - Sirf tabhi show karein jab sab match kare */}
                      {(() => {
                        // ✅ STRICT CHECK: Sirf tabhi show karein jab sab kuch match kare
                        const hasRequiredData =
                          formData.contractorName &&
                          formData.firmName &&
                          formData.workType &&
                          selectedBill?.projectId;

                        if (!hasRequiredData) {
                          return (
                            <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-gray-300 shadow-lg">
                              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-700 mb-3 sm:mb-4">
                                📋 Previous Bill Information
                              </h3>
                              <div className="text-center p-4">
                                <p className="text-gray-600 text-sm sm:text-base">
                                  <span className="font-bold">Note:</span>{" "}
                                  Previous bill information will appear only
                                  when you select{" "}
                                  <span className="font-bold text-blue-600">
                                    Contractor, Firm, and Work Type
                                  </span>{" "}
                                  that match with a previous bill having the{" "}
                                  <span className="font-bold text-blue-600">
                                    same Project ID
                                  </span>
                                  .
                                </p>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                  <div className="bg-white p-3 rounded-lg border">
                                    <span className="font-bold text-gray-700">
                                      Required Fields:
                                    </span>
                                    <ul className="mt-2 text-sm text-gray-600 space-y-1">
                                      <li
                                        className={`flex items-center ${
                                          formData.contractorName
                                            ? "text-green-600"
                                            : "text-red-500"
                                        }`}
                                      >
                                        {formData.contractorName ? "✓" : "✗"}{" "}
                                        Contractor Name
                                      </li>
                                      <li
                                        className={`flex items-center ${
                                          formData.firmName
                                            ? "text-green-600"
                                            : "text-red-500"
                                        }`}
                                      >
                                        {formData.firmName ? "✓" : "✗"} Firm
                                        Name
                                      </li>
                                      <li
                                        className={`flex items-center ${
                                          formData.workType
                                            ? "text-green-600"
                                            : "text-red-500"
                                        }`}
                                      >
                                        {formData.workType ? "✓" : "✗"} Work
                                        Type
                                      </li>
                                      <li
                                        className={`flex items-center ${
                                          selectedBill?.projectId
                                            ? "text-green-600"
                                            : "text-red-500"
                                        }`}
                                      >
                                        {selectedBill?.projectId ? "✓" : "✗"}{" "}
                                        Project ID ({selectedBill?.projectId})
                                      </li>
                                    </ul>
                                  </div>
                                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <span className="font-bold text-blue-700">
                                      Matching Criteria:
                                    </span>
                                    <ul className="mt-2 text-sm text-blue-600 space-y-1">
                                      <li>• Same Project ID</li>
                                      <li>• Same Contractor</li>
                                      <li>• Same Firm</li>
                                      <li>• Same Work Type</li>
                                      <li>• Same Work Order (if available)</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // ✅ Jab sab data available ho tabhi previous bill search karein
                        const previousBillData = findPreviousBillData(
                          selectedBill.rccBillNo,
                          formData.contractorName,
                          formData.firmName,
                          formData.workType,
                          formData.workOrderNo,
                          selectedBill.projectId
                        );

                        if (previousBillData) {
                          return (
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-amber-400 shadow-lg">
                              <h3 className="text-base sm:text-lg md:text-xl font-bold text-amber-900 mb-3 sm:mb-4">
                                📋 Previous Bill Found (RCC No:{" "}
                                {previousBillData.rccBillNo})
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                                <div className="bg-white p-3 sm:p-4 rounded-xl border border-amber-300">
                                  <label className="block text-xs sm:text-sm font-bold text-amber-700 mb-2">
                                    Previous RCC Bill No
                                  </label>
                                  <p className="text-base sm:text-lg md:text-xl font-black text-amber-900 break-all">
                                    {previousBillData.rccBillNo || "N/A"}
                                  </p>
                                </div>
                                <div className="bg-white p-3 sm:p-4 rounded-xl border border-amber-300">
                                  <label className="block text-xs sm:text-sm font-bold text-amber-700 mb-2">
                                    Project ID
                                  </label>
                                  <p className="text-base sm:text-lg md:text-xl font-black text-amber-900 break-all">
                                    {previousBillData.projectId || "N/A"}
                                  </p>
                                </div>
                                <div className="bg-white p-3 sm:p-4 rounded-xl border border-amber-300">
                                  <label className="block text-xs sm:text-sm font-bold text-amber-700 mb-2">
                                    Work Order No
                                  </label>
                                  <p className="text-base sm:text-lg md:text-xl font-black text-amber-900 break-all">
                                    {previousBillData.WorkOrderNo || "N/A"}
                                  </p>
                                </div>
                                <div className="bg-white p-3 sm:p-4 rounded-xl border border-green-300 bg-green-50">
                                  <label className="block text-xs sm:text-sm font-bold text-green-700 mb-2">
                                    Up To Date Paid
                                  </label>
                                  <p className="text-base sm:text-lg md:text-xl font-black text-green-700">
                                    ₹
                                    {parseFloat(
                                      String(
                                        previousBillData.UPToDatePaidAmount || 0
                                      ).replace(/,/g, "")
                                    ).toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 text-xs text-amber-700 font-semibold">
                                ✅ Showing data from bill no:{" "}
                                {previousBillData.rccBillNo} (Current bill:{" "}
                                {selectedBill.rccBillNo}) -{" "}
                                <span className="text-green-600">
                                  All fields match ✓
                                </span>
                              </div>
                            </div>
                          );
                        }

                        // ✅ Agar data hai lekin match nahi hua
                        return (
                          <div className="bg-gradient-to-r from-red-50 to-pink-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-red-300 shadow-lg">
                            <h3 className="text-base sm:text-lg md:text-xl font-bold text-red-800 mb-3 sm:mb-4">
                              ⚠️ No Matching Previous Bill Found
                            </h3>
                            <div className="text-center p-3">
                              <p className="text-red-700 text-sm sm:text-base mb-4">
                                No previous bill found with{" "}
                                <span className="font-bold">
                                  exact matching criteria
                                </span>{" "}
                                for:
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="font-bold text-gray-600">
                                    Project ID:
                                  </span>
                                  <p className="font-bold text-gray-800">
                                    {selectedBill.projectId}
                                  </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="font-bold text-gray-600">
                                    Contractor:
                                  </span>
                                  <p className="font-bold text-gray-800">
                                    {formData.contractorName}
                                  </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="font-bold text-gray-600">
                                    Firm:
                                  </span>
                                  <p className="font-bold text-gray-800">
                                    {formData.firmName}
                                  </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="font-bold text-gray-600">
                                    Work Type:
                                  </span>
                                  <p className="font-bold text-gray-800">
                                    {formData.workType}
                                  </p>
                                </div>
                              </div>
                              <p className="mt-4 text-xs text-gray-600">
                                Previous bill section will only appear when all
                                fields exactly match a previous bill with
                                smaller RCC number.
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Current Project Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-blue-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-blue-400">
                        <div>
                          <label className="block text-sm sm:text-base md:text-lg font-bold text-blue-900">
                            Project ID
                          </label>
                          <p className="text-xl sm:text-2xl md:text-3xl font-black text-blue-900">
                            {selectedBill.projectId}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm sm:text-base md:text-lg font-bold text-blue-900">
                            Project Name
                          </label>
                          <p className="text-base sm:text-xl md:text-2xl font-bold text-blue-900">
                            {selectedBill.projectName || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Contractor, Firm, Work Type Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        <div className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-indigo-300">
                          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                            Contractor ({availableContractors.length})
                          </label>
                          <select
                            value={formData.contractorName}
                            onChange={handleContractorChange}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-indigo-500 rounded-lg font-semibold text-sm sm:text-base"
                          >
                            <option value="">-- Select --</option>
                            {availableContractors.map((name, idx) => (
                              <option key={idx} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {formData.contractorName &&
                          availableFirms.length > 0 && (
                            <div className="bg-blue-50 p-4 sm:p-5 rounded-xl border-2 border-blue-400">
                              <label className="block text-xs sm:text-sm font-bold text-blue-800 mb-2">
                                Firm ({availableFirms.length})
                              </label>
                              <select
                                value={formData.firmName}
                                onChange={(e) =>
                                  handleFirmChange(e.target.value)
                                }
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-blue-500 rounded-lg font-bold text-sm sm:text-base"
                              >
                                <option value="">-- Select --</option>
                                {availableFirms.map((firm, idx) => (
                                  <option key={idx} value={firm}>
                                    {firm}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                        {formData.firmName && availableWorkTypes.length > 0 && (
                          <div className="bg-purple-50 p-4 sm:p-5 rounded-xl border-2 border-purple-400">
                            <label className="block text-xs sm:text-sm font-bold text-purple-800 mb-2">
                              Work Type ({availableWorkTypes.length})
                            </label>
                            <select
                              value={formData.workType}
                              onChange={(e) =>
                                handleWorkTypeChange(e.target.value)
                              }
                              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-500 rounded-lg font-bold text-sm sm:text-base"
                            >
                              <option value="">-- Select --</option>
                              {availableWorkTypes.map((type, idx) => (
                                <option key={idx} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Work Order Details */}
                      {formData.workType && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                          <div className="bg-green-50 p-4 sm:p-5 rounded-xl border-2 border-green-500">
                            <label className="block text-xs sm:text-sm font-bold text-green-800 mb-2">
                              Work Order No
                            </label>
                            <input
                              type="text"
                              value={formData.workOrderNo}
                              readOnly
                              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/70 rounded-lg font-bold text-green-900 text-sm sm:text-base"
                            />
                          </div>

                          <div className="bg-green-50 p-4 sm:p-5 rounded-xl border-2 border-green-500 flex items-center justify-center">
                            <div className="text-center">
                              <label className="block text-xs sm:text-sm font-bold text-green-800 mb-2">
                                Work Order PDF
                              </label>
                              {formData.workOrderUrl ? (
                                <a
                                  href={formData.workOrderUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm sm:text-base"
                                >
                                  VIEW PDF
                                </a>
                              ) : (
                                <p className="text-red-600 text-sm">
                                  Not Available
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="bg-green-50 p-4 sm:p-5 rounded-xl border-2 border-green-500">
                            <label className="block text-xs sm:text-sm font-bold text-green-800 mb-2">
                              Work Order Value
                            </label>
                            <div className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/70 rounded-lg font-bold text-green-900 text-base sm:text-lg text-right">
                              ₹
                              {formatAmount(
                                formData.workOrderValue
                              ).toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bill Amount */}
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 sm:p-8 rounded-xl text-center">
                        <p className="text-sm sm:text-base font-bold mb-2">
                          BILL AMOUNT
                        </p>
                        <p className="text-3xl sm:text-4xl md:text-5xl font-black">
                          ₹{billAmount.toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* Debit Amount */}
                      <div className="bg-red-50 p-4 sm:p-5 rounded-xl border-2 border-red-300">
                        <label className="block text-xs sm:text-sm font-bold text-red-700 mb-2">
                          {" "}
                          Other Debit Amount (Without Material)
                        </label>
                        <input
                          type="number"
                          name="debitAmount"
                          value={formData.debitAmount}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-red-400 rounded-lg text-red-700 font-bold text-sm sm:text-base"
                          placeholder="0"
                        />
                      </div>

                      {/* Actual Amount */}
                      <div className="bg-gradient-to-br from-orange-600 to-red-700 text-white p-6 sm:p-8 rounded-xl text-center">
                        <p className="text-sm sm:text-base font-bold mb-2">
                          ACTUAL AMOUNT
                        </p>
                        <p className="text-3xl sm:text-4xl md:text-5xl font-black">
                          ₹{actualAmount.toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* GST */}
                      <div className="bg-gray-50 p-4 sm:p-5 rounded-xl">
                        <label className="block text-xs sm:text-sm font-bold mb-2">
                          GST %
                        </label>
                        <select
                          name="gstPercent"
                          value={formData.gstPercent}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                        >
                          <option value="0">No GST (0%)</option>
                          {/* <option value="5">5%</option>
                          <option value="12">12%</option> */}
                          <option value="18">18%</option>
                          {/* <option value="28">28%</option> */}
                        </select>
                      </div>

                      {/* CGST & SGST */}
                      <div className="grid grid-cols-2 gap-4 sm:gap-6">
                        <div className="bg-green-50 p-4 sm:p-6 rounded-xl border-2 border-green-400 text-center">
                          <p className="text-green-700 font-bold text-sm sm:text-base">
                            CGST
                          </p>
                          <p className="text-2xl sm:text-3xl font-black text-green-700">
                            ₹{formData.cgst}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 sm:p-6 rounded-xl border-2 border-green-400 text-center">
                          <p className="text-green-700 font-bold text-sm sm:text-base">
                            SGST
                          </p>
                          <p className="text-2xl sm:text-3xl font-black text-green-700">
                            ₹{formData.sgst}
                          </p>
                        </div>
                      </div>

                      {/* SD Amount and Material Debit */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="bg-yellow-50 p-4 sm:p-5 rounded-xl border-2 border-yellow-400">
                          <label className="block text-xs sm:text-sm font-bold text-yellow-800 mb-2">
                            SD Amount
                          </label>
                          <input
                            type="number"
                            name="sdAmount5"
                            value={formData.sdAmount5}
                            onChange={handleChange}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-yellow-500 rounded-lg text-yellow-800 font-bold text-sm sm:text-base"
                            placeholder="0"
                          />
                        </div>

                        <div className="bg-red-50 p-4 sm:p-5 rounded-xl border-2 border-red-400">
                          <label className="block text-xs sm:text-sm font-bold text-red-800 mb-2">
                            Material Debit Amount
                          </label>
                          <input
                            type="number"
                            name="materialDebitAmount5"
                            value={formData.materialDebitAmount5}
                            onChange={handleChange}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-red-500 rounded-lg text-red-800 font-bold text-sm sm:text-base"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Final Net Amount */}
                      <div className="bg-gradient-to-br from-emerald-600 to-green-700 text-white p-6 sm:p-8 rounded-xl text-center">
                        <p className="text-base sm:text-lg font-bold mb-2">
                          PAID AMOUNT
                          <br />
                          <span className="text-sm">
                            (After SD & Material Debit)
                          </span>
                        </p>
                        <p className="text-4xl sm:text-5xl md:text-6xl font-black">
                          ₹
                          {parseFloat(formData.netAmount).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      {/* Previous Bill Amount */}
                      <div className="bg-purple-50 p-4 sm:p-5 rounded-xl border-2 border-purple-300">
                        <label className="block text-xs sm:text-sm font-bold text-purple-700 mb-2">
                          Previous Bill Amount
                        </label>
                        <div className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-400 rounded-lg text-purple-700 font-bold text-sm sm:text-base bg-gray-100">
                          ₹
                          {parseFloat(
                            String(formData.previousBillAmount || 0).replace(
                              /,/g,
                              ""
                            )
                          ).toLocaleString("en-IN")}
                        </div>
                      </div>

                      {/* Up To Date Paid Amount */}
                      <div className="bg-indigo-50 p-4 sm:p-5 rounded-xl border-2 border-indigo-300">
                        <label className="block text-xs sm:text-sm font-bold text-indigo-700 mb-2">
                          Up To Date Paid Amount
                          <span className="text-xs text-gray-600 ml-2">
                            (Previous + Current Bill + GST)
                          </span>
                        </label>
                        <div className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-indigo-400 rounded-lg text-indigo-700 font-bold text-sm sm:text-base bg-gray-100">
                          ₹
                          {parseFloat(
                            formData.upToDatePaidAmount || 0
                          ).toLocaleString("en-IN")}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          *SD, Material Debit & Debit Amount se unaffected
                        </div>
                      </div>

                      {/* Balance Amount */}
                      <div className="bg-pink-50 p-4 sm:p-5 rounded-xl border-2 border-pink-300">
                        <label className="block text-xs sm:text-sm font-bold text-pink-700 mb-2">
                          Balance Amount
                        </label>
                        <div className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-pink-400 rounded-lg text-pink-700 font-bold text-sm sm:text-base bg-gray-100">
                          ₹
                          {parseFloat(
                            formData.balanceAmount || 0
                          ).toLocaleString("en-IN")}
                        </div>
                      </div>

                      {/* Remark & Status */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold mb-2">
                            Remark
                          </label>
                          <textarea
                            name="remark5"
                            value={formData.remark5}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg resize-none text-sm sm:text-base"
                            placeholder="Any note..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-bold mb-2">
                            Status
                          </label>
                          <select
                            name="status5"
                            value={formData.status5}
                            onChange={handleChange}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base font-semibold"
                          >
                            <option value="Select">!----- Select -----!</option>
                            <option value="Done">Done</option>
                          </select>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                        <button
                          onClick={() => setIsModalOpen(false)}
                          className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition text-sm sm:text-base"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="w-full sm:w-auto px-6 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold text-base sm:text-xl rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-70"
                        >
                          {isSaving ? "Saving..." : "SAVE & FINALIZE"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BILL_FINAL_BY_OFFICE;
