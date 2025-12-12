
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useGetPendingPaymentsQuery, useUpdatePaymentsMutation } from "../../features/Payment/Payment_Tally_Slice";
import { Search, X, CheckSquare, Square, FileText, ChevronDown } from "lucide-react";

// =================================================================
// HELPER FUNCTIONS & COMPONENTS 
// =================================================================

const formatAmount = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
};

const PaymentInputComponent = ({
    label,
    id,
    initialValue,
    onValueChange,
    color = "gray",
    isDate = false,
    isNumeric = true,
    options = null,
    readOnly = false,
    placeholder = ""
}) => {
    const [localValue, setLocalValue] = useState(initialValue || "");

    useEffect(() => {
        if (initialValue !== localValue) {
            setLocalValue(initialValue || "");
        }
    }, [initialValue]);

    const handleChange = (e) => {
        if (readOnly) return;
        
        let value = e.target.value;
        let finalValue = value;

        if (options === null && isNumeric) {
            finalValue = value.replace(/[^0-9.]/g, '');
        }

        setLocalValue(finalValue);
        if (options !== null) {
            onValueChange(id, finalValue);
        }
    };

    const handleBlur = () => {
        if (readOnly) return;
        
        if (options === null) {
            onValueChange(id, localValue);
        }
    };

    const isDropdown = options !== null;
    const inputStyle = `w-full text-lg font-semibold border-b-2 outline-none py-1 transition duration-150 
        ${color === "blue" ? "border-blue-300 focus:border-blue-600 text-blue-700" : (color === "green" ? "border-green-300 focus:border-green-600 text-green-700" : "border-gray-300 focus:border-blue-500")}
        ${isDropdown ? 'appearance-none' : ''}
        ${readOnly ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}
    `;

    return (
        <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm relative">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
            {isDropdown ? (
                <div className="relative">
                    <select 
                        className={`${inputStyle} h-10 bg-white`} 
                        value={localValue} 
                        onChange={handleChange}
                        disabled={readOnly}
                    >
                        <option value="">-- Select --</option>
                        {options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"/>
                </div>
            ) : (
                <input
                    type={isDate ? "date" : "text"}
                    inputMode={isNumeric ? "decimal" : "text"}
                    className={inputStyle}
                    placeholder={placeholder || (isDate ? "" : (isNumeric ? "0.00" : "Enter detail"))}
                    value={localValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    readOnly={readOnly}
                />
            )}
        </div>
    );
};

const PaymentInput = ({ label, value, color = "gray" }) => {
    const displayValue = formatAmount(value).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const inputStyle = `w-full text-lg font-semibold border-b-2 outline-none py-1 transition duration-150 cursor-default
        ${color === "green" ? "border-green-300 text-green-700 bg-gray-50" : "border-red-300 text-red-700 bg-gray-50"}`;

    return (
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
            <input type="text" className={inputStyle} value={displayValue} readOnly />
        </div>
    );
};

const InfoField = ({ label, value, isMoney = false, colorClass = "text-gray-800" }) => (
    <div className="flex flex-col border-b border-gray-100 pb-1">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</span>
        <span className={`text-sm font-medium ${colorClass} truncate`} title={isMoney ? `₹${formatAmount(value).toLocaleString("en-IN")}` : value || "-"}>
            {isMoney ? `₹${formatAmount(value).toLocaleString("en-IN")}` : value || "-"}
        </span>
    </div>
);

const DocLink = ({ label, url }) => {
    if (!url) return null;
    return (
        <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 border border-blue-200 transition">
            <FileText size={12} /> {label}
        </a>
    );
};

// =================================================================
// MAIN COMPONENT: Payment_Tally 
// =================================================================

const Payment_Tally = () => {
    const { data: apiResponse = {}, isLoading, refetch } = useGetPendingPaymentsQuery();
    const [updatePayments, { isLoading: isSubmitting, isSuccess, isError, error }] = useUpdatePaymentsMutation();

    const globalPaymentRef = useRef(null);
    const bills = apiResponse.data || [];
    const uniqueContractors = apiResponse.uniqueContractors || [];

    const [selectedContractor, setSelectedContractor] = useState("");
    const [selectedFirm, setSelectedFirm] = useState("");
    const [filteredBills, setFilteredBills] = useState([]);
    const [showData, setShowData] = useState(false);

    const [selectedBillIds, setSelectedBillIds] = useState([]);
    const [billInputData, setBillInputData] = useState({});

    const [paymentDetailsLabel, setPaymentDetailsLabel] = useState("PAYMENT DETAILS (8)");

    const [globalPaymentData, setGlobalPaymentData] = useState({
        BANK_DETAILS_8: "",
        PAYMENT_MODE_8: "",
        PAYMENT_DETAILS_8: "",
        PAYMENT_DATE_8: "",
    });

    const bankOptions = ["SVC Main A/C(202)","SVC VENDER PAY A/C(328)", "HDFC Bank"];
    const modeOptions = ["Cheque", "NEFT", "RTGS"];

    // Sync Firm Name
    useEffect(() => {
        if (selectedContractor) {
            const contractor = uniqueContractors.find((c) => c.contractorName === selectedContractor);
            if (contractor) setSelectedFirm(contractor.firmName);
        } else {
            setSelectedFirm("");
        }
    }, [selectedContractor, uniqueContractors]);

    // Dynamic Label for Payment Details
    const handleGlobalInputChange = (field, value) => {
        setGlobalPaymentData(prev => ({ ...prev, [field]: value }));

        if (field === "PAYMENT_MODE_8") {
            if (value === "Cheque") setPaymentDetailsLabel("CHEQUE NO.");
            else if (value === "NEFT" || value === "RTGS") setPaymentDetailsLabel("UTR NO.");
            else setPaymentDetailsLabel("PAYMENT DETAILS (8)");
        }
    };

    const handleFetch = () => {
        if (selectedContractor && selectedFirm) {
            const filtered = bills.filter(b => b.contractorName === selectedContractor && b.firmName === selectedFirm);
            setFilteredBills(filtered);
            setShowData(true);
            setSelectedBillIds([]);
            setBillInputData({});
        } else {
            alert("Please select Contractor Name");
        }
    };

    const handleClearFilter = () => {
        setSelectedContractor("");
        setSelectedFirm("");
        setFilteredBills([]);
        setShowData(false);
        setSelectedBillIds([]);
        setBillInputData({});
        setGlobalPaymentData({ BANK_DETAILS_8: "", PAYMENT_MODE_8: "", PAYMENT_DETAILS_8: "", PAYMENT_DATE_8: "" });
        setPaymentDetailsLabel("PAYMENT DETAILS (8)");
    };

    const getNumericValue = (billId, field) => formatAmount(billInputData[billId]?.[field]);

    const toggleBillSelection = (billId) => {
        if (selectedBillIds.includes(billId)) {
            setSelectedBillIds(prev => prev.filter(id => id !== billId));
            setBillInputData(prev => { const { [billId]: _, ...rest } = prev; return rest; });
        } else {
            setSelectedBillIds(prev => [...prev, billId]);
            const bill = filteredBills.find(b => (b._id || b.rccBillNo) === billId);
            const latestPaid = formatAmount(bill?.latestPaidAmount8 || 0);
            const latestBalance = formatAmount(bill?.latestBalanceAmount8 || 0);
            const latestTDS = formatAmount(bill?.latestTDSAmount8 || 0);
            const billAmount = formatAmount(bill?.billAmount || 0);
            
            // NEW: अगर previous TDS है तो TDS input में 0 डालें
            const tdsValue = latestTDS > 0 ? "0" : "";
            
            setBillInputData(prev => ({
                ...prev,
                [billId]: { 
                    tds_amount_8: tdsValue,
                    paid_amount_8: prev[billId]?.paid_amount_8 || "",
                    latestPaidAmount8: latestPaid,
                    latestBalanceAmount8: latestBalance,
                    latestTDSAmount8: latestTDS,
                    billAmount8: billAmount,
                    hasPreviousTDS: latestTDS > 0,
                    hasPreviousPayment: latestPaid > 0,
                    hasPreviousBalance: latestBalance > 0,
                    // NEW: Check if any previous data exists
                    hasAnyPreviousData: latestPaid > 0 || latestTDS > 0 || latestBalance > 0
                }
            }));
        }
    };

    const handleInputChange = (billId, field, value) => {
        setBillInputData(prev => ({
            ...prev,
            [billId]: { ...prev[billId], [field]: value },
        }));
    };

    const handleSaveAndScroll = (billId) => {
        if (!selectedBillIds.includes(billId)) toggleBillSelection(billId);
        globalPaymentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const calculatedBillsData = useMemo(() => {
        const data = {};
        filteredBills.forEach(bill => {
            const uniqueId = bill._id || bill.rccBillNo;
            const billAmount = formatAmount(bill.billAmount);
            const latestPaid = formatAmount(bill.latestPaidAmount8 || 0);
            const latestBalance = formatAmount(bill.latestBalanceAmount8 || 0);
            const latestTDS = formatAmount(bill.latestTDSAmount8 || 0);
            const inputs = billInputData[uniqueId] || {};
            
            // Check if any previous data exists
            const hasAnyPreviousData = latestPaid > 0 || latestTDS > 0 || latestBalance > 0;
            
            // TDS Amount: अगर previous TDS है तो 0, वरना input value
            let tdsAmount = 0;
            if (latestTDS > 0) {
                tdsAmount = 0; // Previous TDS होने पर हमेशा 0
            } else {
                tdsAmount = getNumericValue(uniqueId, 'tds_amount_8');
            }
            
            const currentPaidAmount = getNumericValue(uniqueId, 'paid_amount_8');
            
            // Payable Amount: अगर previous balance है तो previous balance, वरना (Bill Amount - TDS)
            let payableAmount = 0;
            if (latestBalance > 0) {
                payableAmount = latestBalance; // Previous balance को payable amount मानें
            } else {
                payableAmount = billAmount - tdsAmount;
            }
            
            // Total Paid = Latest Paid + Current Paid Amount
            const totalPaid = latestPaid + currentPaidAmount;
            
            // NEW CORRECT BALANCE CALCULATION:
            // Balance = Bill Amount - (Total Paid + TDS Amount)
            // यानी: Balance = Bill Amount - (Previous Paid + Current Paid + TDS Amount)
            let balanceAmount = billAmount - (totalPaid + tdsAmount);
            
            // NEW: AUTOMATIC ZERO CONDITION
            // अगर Previous Paid + Current Paid + Latest TDS = Bill Amount
            // तो Balance = 0
            const totalAllAmounts = latestPaid + currentPaidAmount + latestTDS;
            const tolerance = 0.01;
            
            if (Math.abs(totalAllAmounts - billAmount) <= tolerance) {
                balanceAmount = 0;
            }

            // NEW: PAID_AMOUNT_8 का value decide करें
            // अगर previous data है तो Payable Amount भेजें
            // अगर previous data नहीं है तो Total Paid Amount भेजें
            let paidAmount8Value = totalPaid; // Default: Total Paid Amount
            if (hasAnyPreviousData) {
                paidAmount8Value = payableAmount; // Previous data होने पर Payable Amount भेजें
            }

            data[uniqueId] = {
                billAmount,
                tdsAmount,
                currentPaidAmount,
                latestPaid,
                latestBalance,
                latestTDS,
                payableAmount,
                totalPaid,
                balanceAmount,
                totalAllAmounts,
                // NEW: For PAID_AMOUNT_8
                paidAmount8Value,
                hasAnyPreviousData,
                // For display purposes
                displayLatestPaid: latestPaid,
                displayPayableAmount: payableAmount,
                displayTotalPaid: totalPaid,
                displayBalance: balanceAmount,
                displayTDS: tdsAmount,
                displayBillAmount: billAmount,
                hasPreviousTDS: latestTDS > 0,
                hasPreviousPayment: latestPaid > 0,
                hasPreviousBalance: latestBalance > 0,
                // For ACTUAL_PAID_AMOUNT_8 - हमेशा Bill Amount भेजें
                actualPaidAmount8: billAmount
            };
        });
        return data;
    }, [filteredBills, billInputData]);

    const grandTotalCurrentPaidAmount = useMemo(() => {
        return selectedBillIds.reduce((sum, billId) => {
            const calc = calculatedBillsData[billId];
            return sum + (calc?.currentPaidAmount || 0);
        }, 0);
    }, [selectedBillIds, calculatedBillsData]);

   const handleSubmitAll = async () => {
    if (!globalPaymentData.BANK_DETAILS_8 || !globalPaymentData.PAYMENT_MODE_8 || !globalPaymentData.PAYMENT_DATE_8) {
        alert("Please fill all Global Payment Details (Bank, Mode, Date)");
        return;
    }

    const timestamp = new Date().toLocaleString("en-IN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
    });

    const grandTotalValue = grandTotalCurrentPaidAmount;

    const payload = selectedBillIds.map(billId => {
        const bill = filteredBills.find(b => (b._id || b.rccBillNo) === billId);
        const inputs = billInputData[billId] || {};
        const calc = calculatedBillsData[billId] || {};

        // Check if this specific bill has previous data
        const hasAnyPreviousData = calc.latestPaid > 0 || calc.latestTDS > 0 || calc.latestBalance > 0;
        
        // Payment_Sheet के लिए PAID_AMOUNT_8 का value
        const paidForPaymentSheet = hasAnyPreviousData ? 
            calc.payableAmount || 0 : 
            calc.totalPaid || 0;

        return {
            RccBillNo: bill.rccBillNo,
            Timestamp: timestamp,
            Planned_8: bill.planned7 || "",
            Project_Name: bill.projectName,
            Contractor_Name_5: bill.contractorName,
            Contractor_Firm_Name_5: bill.firmName,
            Bill_Date_5: bill.billDate,

            // Previous data (for reference)
            latestPaidAmount8: calc.latestPaid || 0,
            latestBalanceAmount8: calc.latestBalance || 0,
            latestTDSAmount8: calc.latestTDS || 0,
            
            // IMPORTANT: ये सभी values भेजें, backend decide करेगा क्या update करना है
            // FMS के लिए सभी values भेजें
            tdsAmount8: calc.tdsAmount || 0,           // TDS amount
            payableAmount8: calc.payableAmount || 0,   // Payable amount
            paidAmount8: (calc.latestPaid || 0) + (calc.currentPaidAmount || 0), // Previous + Current Paid
            balanceAmount8: calc.balanceAmount || 0,   // New balance
            
            // Payment_Sheet के लिए
            PAID_AMOUNT_8: paidForPaymentSheet,       // Payment Sheet के लिए value
            
            ACTUAL_PAID_AMOUNT_8: calc.billAmount || 0,
            GRAND_TOTAL_AMOUNT: grandTotalValue,

            bankDetails8: globalPaymentData.BANK_DETAILS_8,
            paymentMode8: globalPaymentData.PAYMENT_MODE_8,
            paymentDetails8: globalPaymentData.PAYMENT_DETAILS_8 || "",
            paymentDate8: globalPaymentData.PAYMENT_DATE_8,
            status8: "Done",
            
            // IMPORTANT: इस specific bill के लिए previous data है या नहीं
            hasPreviousData: hasAnyPreviousData
        };
    });

    console.log('Payload sample:', payload[0]);
    console.log('Bill has previous data:', payload[0]?.hasPreviousData);

    try {
        await updatePayments(payload).unwrap();
        alert(`Success! ${payload.length} bills processed successfully!\nGrand Total: ₹${grandTotalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`);
        handleClearFilter();
        refetch();
    } catch (err) {
        console.error("Submit failed:", err);
        alert("Failed: " + (err?.data?.error || "Please try again"));
    }
};
    return (
        <div className="min-h-screen bg-gray-100 pt-8 px-2 md:px-6 pb-20">
            {isLoading && (
                <div className="max-w-xl mx-auto p-10 mt-20 text-center bg-white rounded-lg shadow-xl">
                    <p className="text-xl font-semibold text-blue-600">Loading Payment Data...</p>
                </div>
            )}

            {!isLoading && (
                <div>
                    {!showData ? (
                        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-10">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Select Contractor to View Bills</h2>
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Contractor Name</label>
                                <select value={selectedContractor} onChange={(e) => setSelectedContractor(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50">
                                    <option value="">-- Select Contractor --</option>
                                    {uniqueContractors.map((c, i) => (
                                        <option key={i} value={c.contractorName}>{c.contractorName}</option>
                                    ))}
                                </select>
                                <label className="block text-sm font-medium text-gray-700">Contractor Firm</label>
                                <input value={selectedFirm} readOnly className="w-full p-3 border rounded-lg bg-gray-200 text-gray-600" />
                                <button onClick={handleFetch} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">View Bills</button>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-[1600px] mx-auto">
                            <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center sticky top-2 z-10 border border-gray-300">
                                <div>
                                    <div className="text-gray-500 text-sm">Viewing Bills for:</div>
                                    <span className="font-bold text-gray-900 ml-2 text-xl">{selectedContractor}</span>
                                    <span className="mx-2 text-gray-300">|</span>
                                    <span className="text-gray-600 font-medium">{selectedFirm}</span>
                                </div>
                                <button onClick={handleClearFilter} className="text-red-600 font-semibold hover:underline flex items-center gap-1">
                                    <X size={16} /> Change Contractor
                                </button>
                            </div>

                            <div className="space-y-6">
                                {filteredBills.map((bill) => {
                                    const uniqueId = bill._id || bill.rccBillNo;
                                    const isSelected = selectedBillIds.includes(uniqueId);
                                    const billCalculations = calculatedBillsData[uniqueId] || {};
                                    const inputs = billInputData[uniqueId] || {};
                                    
                                    const hasPreviousPayment = formatAmount(bill.latestPaidAmount8) > 0;
                                    const hasPreviousTDS = formatAmount(bill.latestTDSAmount8) > 0;
                                    const hasPreviousBalance = formatAmount(bill.latestBalanceAmount8) > 0;
                                    const hasAnyPreviousData = hasPreviousPayment || hasPreviousTDS || hasPreviousBalance;

                                    // Check if Previous Paid + Current Paid + Latest TDS = Bill Amount
                                    const totalAllAmounts = billCalculations.latestPaid + billCalculations.currentPaidAmount + billCalculations.latestTDS;
                                    const isBalanceZeroCondition = Math.abs(totalAllAmounts - billCalculations.billAmount) <= 0.01;

                                    return (
                                        <div key={uniqueId} className={`bg-white rounded-xl shadow-md border-2 overflow-hidden transition-all duration-200 ${isSelected ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-200 hover:border-blue-300"}`}>
                                            <div className={`p-4 flex items-center justify-between ${isSelected ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                                <div className="flex items-center gap-4">
                                                    <button onClick={() => toggleBillSelection(uniqueId)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold shadow-sm border transition-all ${isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}`}>
                                                        {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                                        {isSelected ? "Bill Selected" : "Select Bill"}
                                                    </button>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-800">{bill.projectName}</h3>
                                                        <p className="text-xs text-gray-500 font-mono">Bill No: {bill.rccBillNo}</p>
                                                        {hasAnyPreviousData && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {hasPreviousPayment && (
                                                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Prev Paid: ₹{formatAmount(bill.latestPaidAmount8).toLocaleString("en-IN")}</span>
                                                                )}
                                                                {hasPreviousTDS && (
                                                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Prev TDS: ₹{formatAmount(bill.latestTDSAmount8).toLocaleString("en-IN")}</span>
                                                                )}
                                                                {hasPreviousBalance && (
                                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Prev Balance: ₹{formatAmount(bill.latestBalanceAmount8).toLocaleString("en-IN")}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-green-700">₹{formatAmount(bill.billAmount).toLocaleString("en-IN")}</div>
                                                    <div className="text-xs text-gray-500">Bill Date: {bill.billDate}</div>
                                                </div>
                                            </div>

                                            <div className="p-5">
                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-4 mb-4">
                                                    <InfoField label="Contractor Bill No" value={bill.contractorBillNo} />
                                                    <InfoField label="Work Name" value={bill.workName} className="col-span-2" />
                                                    <InfoField label="Contractor Name" value={bill.contractorName} className="col-span-2" />
                                                    <InfoField label="Firm Name" value={bill.firmName} />
                                                    <InfoField label="Project ID" value={bill.projectId} />
                                                    <InfoField label="RCC Summary No" value={bill.rccSummarySheetNo} />
                                                    <InfoField label="Work Order No" value={bill.WorkOrderNo} />
                                                    <InfoField label="Work Order Value" value={bill.WorkOrderValue} isMoney={true} />
                                                    <InfoField label="Remark" value={bill.remark} />
                                                    <InfoField label="Planned 7" value={bill.planned7} />
                                                    <InfoField label="Net Amount Current" value={bill.NETAMOUNTCurrentAmount} isMoney={true} />
                                                    <InfoField label="Previous Bill Amt" value={bill.PreviousBillAmount} isMoney={true} />
                                                    <InfoField label="Up To Date Paid" value={bill.UPToDatePaidAmount} isMoney={true} />
                                                    <InfoField label="Balance Amount (API)" value={bill.BalanceAmount} isMoney={true} />
                                                    {(hasPreviousPayment || hasPreviousTDS) && (
                                                        <>
                                                            {hasPreviousPayment && (
                                                                <>
                                                                    <InfoField 
                                                                        label="Latest Paid Amt (8)" 
                                                                        value={bill.latestPaidAmount8} 
                                                                        isMoney={true} 
                                                                        colorClass="text-blue-600 font-bold" 
                                                                    />
                                                                    <InfoField 
                                                                        label="Latest Balance Amt (8)" 
                                                                        value={bill.latestBalanceAmount8} 
                                                                        isMoney={true} 
                                                                        colorClass="text-red-600 font-bold" 
                                                                    />
                                                                </>
                                                            )}
                                                            {hasPreviousTDS && (
                                                                <InfoField 
                                                                    label="Latest TDS Amt (8)" 
                                                                    value={bill.latestTDSAmount8} 
                                                                    isMoney={true} 
                                                                    colorClass="text-purple-600 font-bold" 
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-3 items-center pt-2 border-t pt-4">
                                                    <span className="text-xs font-bold text-gray-400 uppercase mr-2">Document Links:</span>
                                                    <DocLink label="Bill PDF" url={bill.billUrl} />
                                                    <DocLink label="Previous Bill PDF" url={bill.PreviousBillUrl} />
                                                    <DocLink label="Measurement Sheet" url={bill.measurementSheetUrl} />
                                                    <DocLink label="Attendance Sheet" url={bill.attendanceSheetUrl} />
                                                    <DocLink label="RCC Summary Sheet" url={bill.rccSummarySheetUrl} />
                                                    <DocLink label="Work Order" url={bill.workOrderUrl} />
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="bg-blue-50 border-t-2 border-blue-200 p-6">
                                                    <h3 className="text-blue-800 font-bold mb-4">Local Payment Inputs for Bill: {bill.rccBillNo}</h3>
                                                    
                                                    {hasAnyPreviousData && (
                                                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                {hasPreviousPayment && (
                                                                    <div className="text-center">
                                                                        <div className="text-xs font-bold text-gray-500 uppercase">PREVIOUS PAID AMOUNT</div>
                                                                        <div className="text-lg font-bold text-blue-700">
                                                                            ₹{formatAmount(bill.latestPaidAmount8).toLocaleString("en-IN")}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {hasPreviousBalance && (
                                                                    <div className="text-center">
                                                                        <div className="text-xs font-bold text-gray-500 uppercase">PREVIOUS BALANCE</div>
                                                                        <div className="text-lg font-bold text-red-700">
                                                                            ₹{formatAmount(bill.latestBalanceAmount8).toLocaleString("en-IN")}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {hasPreviousTDS && (
                                                                    <div className="text-center">
                                                                        <div className="text-xs font-bold text-gray-500 uppercase">PREVIOUS TDS AMOUNT</div>
                                                                        <div className="text-lg font-bold text-purple-700">
                                                                            ₹{formatAmount(bill.latestTDSAmount8).toLocaleString("en-IN")}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                                                        <PaymentInputComponent 
                                                            label="TDS Amount (8)" 
                                                            id={uniqueId} 
                                                            initialValue={inputs.tds_amount_8} 
                                                            onValueChange={(id, v) => handleInputChange(id, "tds_amount_8", v)} 
                                                            color="blue" 
                                                            isNumeric={true} 
                                                            placeholder={hasPreviousTDS ? "0 (Previous TDS Applied)" : "Enter TDS Amount"}
                                                            readOnly={hasPreviousTDS}
                                                        />
                                                        <PaymentInput 
                                                            label="Payable Amount" 
                                                            value={billCalculations.payableAmount || 0} 
                                                            color="green" 
                                                        />
                                                        <PaymentInputComponent 
                                                            label="Current Paid Amount (8)" 
                                                            id={uniqueId} 
                                                            initialValue={inputs.paid_amount_8} 
                                                            onValueChange={(id, v) => handleInputChange(id, "paid_amount_8", v)} 
                                                            color="blue" 
                                                            isNumeric={true} 
                                                            placeholder="Enter Paid Amount"
                                                        />
                                                        <PaymentInput 
                                                            label="New Balance Amount" 
                                                            value={billCalculations.balanceAmount || 0} 
                                                            color={billCalculations.balanceAmount === 0 ? "green" : "red"} 
                                                        />
                                                    </div>
                                                    
                                                    {/* Balance Zero Condition Indicator */}
                                                    {isBalanceZeroCondition && billCalculations.balanceAmount === 0 && (
                                                        <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded-lg">
                                                            <div className="flex items-center gap-2">
                                                                <div className="text-green-700 font-bold">✓ AUTOMATIC ZERO BALANCE</div>
                                                                <div className="text-green-600 text-sm">
                                                                    Prev Paid (₹{billCalculations.latestPaid.toLocaleString("en-IN")}) + 
                                                                    Current Paid (₹{billCalculations.currentPaidAmount.toLocaleString("en-IN")}) + 
                                                                    Prev TDS (₹{billCalculations.latestTDS.toLocaleString("en-IN")}) = 
                                                                    Bill Amount (₹{billCalculations.billAmount.toLocaleString("en-IN")})
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* PAID_AMOUNT_8 Information */}
                                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-300 rounded-lg">
                                                        <div className="text-blue-700 font-bold">PAID_AMOUNT_8 Information:</div>
                                                        <div className="text-sm text-blue-600 mt-1">
                                                            {hasAnyPreviousData ? (
                                                                <>
                                                                    <span className="font-semibold">✓ Previous Data Exists</span>
                                                                    <div className="ml-2">PAID_AMOUNT_8 = Payable Amount (₹{billCalculations.payableAmount.toLocaleString("en-IN")})</div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="font-semibold">✓ New Bill (No Previous Data)</span>
                                                                    <div className="ml-2">PAID_AMOUNT_8 = Total Paid Amount (₹{billCalculations.totalPaid.toLocaleString("en-IN")})</div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-6">
                                                        <button 
                                                            onClick={() => handleSaveAndScroll(uniqueId)} 
                                                            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition"
                                                        >
                                                            Save & Proceed to Global Payment
                                                        </button>
                                                    </div>
                                                    
                                                    
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedBillIds.length > 0 && (
                                <div className="max-w-[1600px] mx-auto bg-green-50 p-6 rounded-xl shadow-lg border-2 border-green-400 my-8">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold text-green-800">Grand Total (Current Paid Amount)</h2>
                                        <div className="text-4xl font-extrabold text-green-700">
                                            ₹{grandTotalCurrentPaidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <p className="text-green-600 mt-1">Sum of <strong>Current Paid Amount</strong> from {selectedBillIds.length} selected bills.</p>
                                </div>
                            )}

                            {selectedBillIds.length > 0 && (
                                <div className="mt-8 mb-12" ref={globalPaymentRef}>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                                        <span className="text-blue-600">Global Payment Details</span> ({selectedBillIds.length} Bills Selected)
                                    </h2>

                                    {isSuccess && <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">Payment submitted successfully!</div>}
                                    {isError && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">Error: {error?.data?.error || "Submission failed"}</div>}

                                    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <PaymentInputComponent label="BANK DETAILS (8)" id="BANK_DETAILS_8" initialValue={globalPaymentData.BANK_DETAILS_8} onValueChange={(id, v) => handleGlobalInputChange(id, v)} color="green" options={bankOptions} />
                                            <PaymentInputComponent label="PAYMENT MODE (8)" id="PAYMENT_MODE_8" initialValue={globalPaymentData.PAYMENT_MODE_8} onValueChange={(id, v) => handleGlobalInputChange(id, v)} color="green" options={modeOptions} />
                                            <PaymentInputComponent label={paymentDetailsLabel} id="PAYMENT_DETAILS_8" initialValue={globalPaymentData.PAYMENT_DETAILS_8} onValueChange={(id, v) => handleGlobalInputChange(id, v)} color="green" isNumeric={false} />
                                            <PaymentInputComponent label="PAYMENT DATE (8)" id="PAYMENT_DATE_8" initialValue={globalPaymentData.PAYMENT_DATE_8} onValueChange={(id, v) => handleGlobalInputChange(id, v)} color="green" isDate={true} isNumeric={false} />
                                        </div>

                                        <div className="mt-8 flex justify-end">
                                            <button
                                                onClick={handleSubmitAll}
                                                disabled={isSubmitting || selectedBillIds.length === 0}
                                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? "Submitting..." : "SUBMIT ALL PAYMENT DATA"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedBillIds.length === 0 && filteredBills.length > 0 && (
                                <div className="bg-yellow-50 p-4 text-center rounded-lg border border-yellow-300 text-yellow-800 font-medium mt-8">
                                    Please select at least one bill to proceed.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Payment_Tally;