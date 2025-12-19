import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaSearch, FaFilePdf, FaTimes, FaChevronDown, FaArrowDown } from 'react-icons/fa';

const Payment = () => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showData, setShowData] = useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const [siteSearch, setSiteSearch] = useState("");
  const [showVendorList, setShowVendorList] = useState(false);
  const [showSiteList, setShowSiteList] = useState(false);
  const [selectedBills, setSelectedBills] = useState([]);
  const [paidAmounts, setPaidAmounts] = useState({});

  const [bankDetails, setBankDetails] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const vendorRef = useRef(null);
  const siteRef = useRef(null);
  const paymentSectionRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
    const handleClickOutside = (event) => {
      if (vendorRef.current && !vendorRef.current.contains(event.target)) setShowVendorList(false);
      if (siteRef.current && !siteRef.current.contains(event.target)) setShowSiteList(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchInitialData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/Payment');
      if (response.data.success) {
        const processedData = response.data.data.map(item => {
          const parseAmount = (value) => {
            if (!value) return 0;
            const cleaned = value.toString().replace(/,/g, '').trim();
            return cleaned === '' ? 0 : Number(cleaned);
          };

          const netAmount = parseAmount(item.netAmount16 || item.netAmount17 || 0);
          const latestPaid = parseAmount(item.latestPaidAmount || 0);

          return {
            ...item,
            netAmount16: netAmount,
            latestPaidAmount: latestPaid,
            latestBalanceAmount: latestPaid > 0 ? netAmount - latestPaid : netAmount
          };
        });

        setAllData(processedData);
        setVendors(response.data.uniqueVendors);
        setSites(response.data.uniqueSites);
      }
    } catch (error) {
      console.error(error);
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (!vendorSearch) return alert("Please select a vendor");
    const results = allData.filter(item =>
      item.vendorFirmName.toLowerCase() === vendorSearch.toLowerCase() &&
      (siteSearch ? item.siteName.toLowerCase() === siteSearch.toLowerCase() : true)
    );
    setFilteredData(results);
    setShowData(true);
    setSelectedBills([]);
    setPaidAmounts({});
  };

  const toggleBillSelection = (uid) => {
    setSelectedBills(prev => {
      if (prev.includes(uid)) {
        setPaidAmounts(current => {
          const newPaid = { ...current };
          delete newPaid[uid];
          return newPaid;
        });
        return prev.filter(id => id !== uid);
      } else {
        setPaidAmounts(current => ({ ...current, [uid]: 0 }));
        return [...prev, uid];
      }
    });
  };

  const handlePaidAmountChange = (uid, value) => {
    let numValue = value === '' ? 0 : Number(value);
    if (numValue < 0) numValue = 0;

    const bill = filteredData.find(b => b.UID === uid);
    if (!bill) return;

    const currentBalance = calculateCurrentBalance(bill);
    if (numValue > currentBalance) {
      alert(`Cannot pay more than current balance (₹${currentBalance.toLocaleString('en-IN')})`);
      numValue = currentBalance;
    }

    setPaidAmounts(prev => ({ ...prev, [uid]: numValue }));
  };

  const calculateCurrentBalance = (bill) => {
    const netAmount = Number(bill.netAmount16 || 0);
    const previousPaid = Number(bill.latestPaidAmount || 0);
    return previousPaid > 0 ? netAmount - previousPaid : netAmount;
  };

  const calculateNewBalance = (bill) => {
    const currentPaid = paidAmounts[bill.UID] || 0;
    const currentBalance = calculateCurrentBalance(bill);
    return currentBalance - currentPaid;
  };

  const calculateTotalPaidAfter = (bill) => {
    const previousPaid = Number(bill.latestPaidAmount || 0);
    const currentPaid = paidAmounts[bill.UID] || 0;
    return previousPaid + currentPaid;
  };

  const grandTotal = Object.values(paidAmounts).reduce((sum, amt) => sum + amt, 0);

  const paymentDetailsLabel = paymentMode === "Cheque" ? "CHEQUE NUMBER" : "PAYMENT DETAILS";

  const handleSubmit = async () => {
    if (selectedBills.length === 0) return alert('Please select at least one bill');
    if (!bankDetails || !paymentMode || !paymentDetails.trim() || !paymentDate) {
      return alert('Please fill all global payment details');
    }

    const invalidBills = selectedBills.filter(uid => (paidAmounts[uid] || 0) <= 0);
    if (invalidBills.length > 0) {
      if (!window.confirm(`${invalidBills.length} bill(s) have ₹0 paid. Continue?`)) return;
    }

    setSubmitting(true);
    try {
      const payload = selectedBills.map(uid => {
        const bill = filteredData.find(item => item.UID === uid);
        const currentPaid = paidAmounts[uid] || 0;
        const netAmount = Number(bill.netAmount16 || 0);
        const previousPaid = Number(bill.latestPaidAmount || 0);
        const totalPaidAfter = previousPaid + currentPaid;
        const newBalance = netAmount - totalPaidAfter;

        return {
          UID: bill.UID,
          planned17: bill.planned17 || '',
          siteName: bill.siteName || '',
          vendorFirmName16: bill.vendorFirmName || '',
          billNo: bill.invoice13,
          billDate16: bill.billDate || bill.planned16 || '',
          netAmount16: netAmount,
          currentPaid: currentPaid,
          paidAmount17: totalPaidAfter,
          balanceAmount17: newBalance,
          bankDetails17: bankDetails,
          paymentMode17: paymentMode,
          paymentDetails17: paymentDetails,
          paymentDate18: paymentDate,
          grandTotal: grandTotal,
          originalNetAmount: netAmount,
          previousPaidAmount: previousPaid
        };
      });

      const response = await axios.post('http://localhost:5000/api/Update-Payment', payload);
      if (response.data.success) {
        alert(`Success! ${response.data.addedToPaymentSheet} bill(s) recorded.\nFMS Updated: ${response.data.updatedInFMS}`);
        fetchInitialData();
        setSelectedBills([]);
        setPaidAmounts({});
        setBankDetails("");
        setPaymentMode("");
        setPaymentDetails("");
        setPaymentDate("");
        setShowData(false);
      } else {
        alert('Error: ' + response.data.message);
      }
    } catch (error) {
      alert('Failed to submit: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const getPaymentSummary = (bill) => {
    const netAmount = Number(bill.netAmount16 || 0);
    const previousPaid = Number(bill.latestPaidAmount || 0);
    const currentBalance = calculateCurrentBalance(bill);
    const currentPaid = paidAmounts[bill.UID] || 0;
    const newBalance = calculateNewBalance(bill);
    const totalPaidAfter = calculateTotalPaidAfter(bill);

    return { netAmount, previousPaid, currentBalance, currentPaid, newBalance, totalPaidAfter };
  };

  const scrollToPaymentSection = () => {
    paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8 font-sans">
      {/* Selection Area */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 relative" ref={vendorRef}>
            <label className="block text-xs font-bold text-gray-600 mb-2">Viewing Bills for:</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search Vendor..."
                value={vendorSearch}
                onFocus={() => setShowVendorList(true)}
                onChange={(e) => setVendorSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <FaChevronDown className="absolute right-4 top-4 text-gray-500" />
            </div>
            {showVendorList && (
              <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg max-h-52 overflow-y-auto shadow-xl z-50">
                {vendors
                  .filter(v => v.vendorFirmName.toLowerCase().includes(vendorSearch.toLowerCase()))
                  .map((v, i) => (
                    <li
                      key={i}
                      onClick={() => { setVendorSearch(v.vendorFirmName); setShowVendorList(false); }}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      {v.vendorFirmName}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className="flex-1 relative" ref={siteRef}>
            <label className="block text-xs font-bold text-gray-600 mb-2">Site Name:</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search Site..."
                value={siteSearch}
                onFocus={() => setShowSiteList(true)}
                onChange={(e) => setSiteSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <FaChevronDown className="absolute right-4 top-4 text-gray-500" />
            </div>
            {showSiteList && (
              <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg max-h-52 overflow-y-auto shadow-xl z-50">
                {sites
                  .filter(s => s.siteName.toLowerCase().includes(siteSearch.toLowerCase()))
                  .map((s, i) => (
                    <li
                      key={i}
                      onClick={() => { setSiteSearch(s.siteName); setShowSiteList(false); }}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      {s.siteName}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <button
            onClick={handleFilter}
            className="px-10 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <FaSearch /> Filter
          </button>
        </div>
      </div>

      {showData && (
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold">
              {vendorSearch} <span className="text-gray-500 font-normal">| {siteSearch || 'All Sites'}</span>
            </h2>
            <button
              onClick={() => { setShowData(false); setSelectedBills([]); setPaidAmounts({}); }}
              className="text-red-600 font-bold text-lg flex items-center gap-2 hover:underline"
            >
              <FaTimes /> Change Contractor
            </button>
          </div>

          {filteredData.map((item) => {
            const summary = getPaymentSummary(item);
            return (
              <div
                key={item.UID}
                className={`bg-white rounded-xl shadow-md p-6 mb-6 border-l-8 ${selectedBills.includes(item.UID) ? 'border-green-600' : 'border-gray-200'}`}
              >
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div
                      onClick={() => toggleBillSelection(item.UID)}
                      className={`border-2 border-gray-300 rounded-lg px-5 py-3 cursor-pointer flex items-center gap-3 ${selectedBills.includes(item.UID) ? 'bg-green-50' : 'bg-white'}`}
                    >
                      <input type="checkbox" checked={selectedBills.includes(item.UID)} readOnly className="w-5 h-5" />
                      <span className="font-bold">Select Bill</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{item.siteName}</h3>
                      <p className="text-sm text-gray-600">
                        Invoice No: <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">{item.invoice13 || '-'}</span>
                        {item.UID && ` | UID: ${item.UID}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">₹{summary.netAmount.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-gray-500">Planned Date: {item.planned17}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 border-t border-gray-200 pt-6">
                  <DetailItem label="MATERIAL TYPE" value={item.materialType} />
                  <DetailItem label="VENDOR FIRM NAME" value={item.vendorFirmName} />
                  <DetailItem label="INVOICE NO" value={item.invoice13} color="text-blue-600" />
                  <DetailItem label="BILL DATE" value={item.billDate} color="text-blue-600" />
                  <DetailItem label="FINAL INDENT NO" value={item.finalIndentNo} />
                  <DetailItem label="PO NUMBER" value={item.poNumber} />
                  <DetailItem label="MRN NO" value={item.mrnNo} />
                  <DetailItem label="PLANNED 17" value={item.planned17} />
                  <DetailItem label="NET AMOUNT 17" value={`₹${summary.netAmount.toLocaleString('en-IN')}`} />
                  <DetailItem label="Previous Paid Amount" value={`₹${summary.previousPaid.toLocaleString('en-IN')}`} color="text-green-600" />
                  <DetailItem label="Remaining Amount" value={`₹${summary.previousPaid === 0 ? 0 : summary.currentBalance.toLocaleString('en-IN')}`} color="text-green-600" />
                </div>

                <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-200 pt-4">
                  {item.finalIndentPDF && <DocLink icon={<FaFilePdf />} label="Indent PDF" url={item.finalIndentPDF} />}
                  {item.poPDF && <DocLink icon={<FaFilePdf />} label="PO PDF" url={item.poPDF} />}
                  {item.mrnPDF && <DocLink icon={<FaFilePdf />} label="MRN PDF" url={item.mrnPDF} />}
                  {item.approvalQuotationPDF && <DocLink icon={<FaFilePdf />} label="Quotation PDF" url={item.approvalQuotationPDF} />}
                </div>

                {selectedBills.includes(item.UID) && (
                  <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-300">
                    <h4 className="mb-6 text-green-700 font-bold">
                      Payment Details for Invoice: <strong>{item.invoice13}</strong> (UID: {item.UID})
                    </h4>

                    <div className="mb-6 p-4 bg-blue-100 rounded-lg border-l-4 border-blue-500">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div><span className="font-bold text-gray-700">Original Net Amount (17):</span> <span className="ml-3 font-bold text-blue-700 text-lg">₹{summary.netAmount.toLocaleString('en-IN')}</span></div>
                        <div><span className="font-bold text-gray-700">Previously Paid:</span> <span className="ml-3 font-bold text-green-700 text-lg">₹{summary.previousPaid.toLocaleString('en-IN')}</span></div>
                        <div><span className="font-bold text-gray-700">Current Balance:</span> <span className="ml-3 font-bold text-red-600 text-lg">₹{summary.currentBalance.toLocaleString('en-IN')}</span></div>
                        <div><span className="font-bold text-gray-700">Total Paid After:</span> <span className="ml-3 font-bold text-green-700 text-lg">₹{summary.totalPaidAfter.toLocaleString('en-IN')}</span></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">CURRENT PAID AMOUNT ₹</label>
                        <input
                          type="number"
                          value={paidAmounts[item.UID] || ''}
                          onChange={(e) => handlePaidAmountChange(item.UID, e.target.value)}
                          placeholder="Enter amount"
                          min="0"
                          className="w-full px-4 py-3 rounded-lg border-2 border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">NEW BALANCE</label>
                        <input
                          type="number"
                          value={summary.newBalance}
                          readOnly
                          className="w-full px-4 py-3 rounded-lg border-2 border-red-500 bg-red-50 font-bold"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${(summary.totalPaidAfter / summary.netAmount) * 100}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={scrollToPaymentSection}
                      className="mt-6 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <FaArrowDown /> Go to Global Payment Section
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {selectedBills.length > 0 && (
            <div className="bg-green-100 p-6 rounded-xl border-2 border-green-500 mb-8">
              <h3 className="text-green-700 font-bold text-xl">
                Grand Total (Current Payment)
                <span className="float-right text-3xl">₹{grandTotal.toLocaleString('en-IN')}</span>
              </h3>
            </div>
          )}

          {selectedBills.length > 0 && (
            <div ref={paymentSectionRef} className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Global Payment Details ({selectedBills.length} Bill{selectedBills.length > 1 ? 's' : ''} Selected)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">BANK DETAILS</label>
                  <select
                    value={bankDetails}
                    onChange={(e) => setBankDetails(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select --</option>
                    <option value="SVC Main A/C(202)">SVC Main A/C(202)</option>
                    <option value="SVC VENDER PAY A/C(328)">SVC VENDER PAY A/C(328)</option>
                    <option value="HDFC">HDFC Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">PAYMENT MODE</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select --</option>
                    <option value="Cheque">Cheque</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">{paymentDetailsLabel}</label>
                  <input
                    type="text"
                    placeholder={paymentMode === "Cheque" ? "Enter Cheque Number" : "Enter detail"}
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">PAYMENT DATE</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
                <p className="text-yellow-800 font-bold flex items-center gap-2">
                  ⚠️ How it works: First payment = Full amount • Next payments deduct from balance
                </p>
              </div>

              <button
                disabled={submitting}
                onClick={handleSubmit}
                className={`mt-8 px-12 py-4 text-white font-bold text-xl rounded-lg transition ${submitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {submitting ? 'Submitting...' : 'SUBMIT ALL PAYMENT DATA'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value, color = "text-gray-800" }) => (
  <div>
    <div className="text-xs text-gray-500 font-bold mb-1">{label}</div>
    <div className={`text-base font-bold ${color}`}>{value || '-'}</div>
  </div>
);

const DocLink = ({ icon, label, url }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-blue-600 font-bold text-xs px-4 py-2 rounded border border-blue-600 bg-blue-50 hover:bg-blue-100 transition"
  >
    {icon} {label}
  </a>
);

export default Payment;