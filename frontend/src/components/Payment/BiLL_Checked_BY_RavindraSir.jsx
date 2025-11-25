import React from 'react';
import {
  useGetPendingFinalBillsQuery,
  usePostFinalBillCheckedMutation,
} from '../../features/Payment/BiLL_Checked_BY_RavindraSir_Slice';

const BiLL_Checked_BY_RavindraSir = () => {
  // Automatic API call on mount
  const {
    data: billData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPendingFinalBillsQuery();

  const [postFinalBillChecked, { isLoading: isPosting }] =
    usePostFinalBillCheckedMutation();

  // Handle Mark as Checked
  const handleMarkAsChecked = async (rccBillNo) => {
    if (!rccBillNo) return alert('RCC Bill No. missing!');

    const confirm = window.confirm(
      `Are you sure you want to mark RCC Bill No: ${rccBillNo} as FINAL CHECKED by Ravinder Sir?`
    );
    if (!confirm) return;

    try {
      await postFinalBillChecked({
        rccBillNo,
        status6: 'Checked',
        remark6: 'Final Bill Verified & Approved by Ravinder Sir',
      }).unwrap();

      alert(`Success: RCC Bill ${rccBillNo} marked as CHECKED!`);
      // Auto refetch ho jayega due to invalidatesTags
    } catch (err) {
      console.error('Check failed:', err);
      alert('Failed: ' + (err?.data?.message || 'Server error'));
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-2xl font-semibold text-blue-600 animate-pulse">
          Loading pending final bills...
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 text-xl mb-4">
          Error: {error?.data?.message || 'Failed to load data'}
        </p>
        <button
          onClick={refetch}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const bills = billData?.data || [];
  const totalCount = billData?.count || 0;

  // No Pending Bills
  if (bills.length === 0) {
    return (
      <div className="p-10 text-center">
        <div className="text-4xl font-bold text-green-600 mb-4">
          All Final Bills Already Checked!
        </div>
        <p className="text-gray-600 text-lg">
          Great job, Ravinder Sir! No pending bills for final approval.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Final Bill Approval - Ravinder Sir
          </h1>
          <p className="text-gray-600 mt-1">Review and approve final contractor bills</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold text-red-600">
            {totalCount} Pending
          </p>
          <button
            onClick={refetch}
            className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            Refresh List
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <tr>
                <th className="py-4 px-6 text-left">Sr. No</th>
                <th className="py-4 px-6 text-left">RCC Bill No</th>
                <th className="py-4 px-6 text-left">Project</th>
                <th className="py-4 px-6 text-left">Contractor</th>
                <th className="py-4 px-6 text-right">Bill Amount</th>
                <th className="py-4 px-6 text-right">Net Payable</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bills.map((bill, index) => (
                <tr
                  key={bill.rccBillNo}
                  className="hover:bg-gray-50 transition duration-200"
                >
                  <td className="py-4 px-6 font-medium">{index + 1}</td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-indigo-700 text-lg">
                      {bill.rccBillNo}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold">{bill.projectName}</p>
                      <p className="text-sm text-gray-500">{bill.projectId}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold">{bill.contractorName}</p>
                      <p className="text-sm text-gray-500">{bill.firmName}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-medium">
                    ₹{Number(bill.billAmount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-green-600">
                    ₹{Number(bill.NETAMOUNTCurrentAmount || bill.netAmount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleMarkAsChecked(bill.rccBillNo)}
                      disabled={isPosting}
                      className={`px-6 py-3 rounded-lg font-bold text-white transition ${
                        isPosting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isPosting ? 'Saving...' : 'Mark as Checked'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-600">
        <p className="text-lg">
          Total Pending Final Bills for Approval:{' '}
          <span className="font-bold text-red-600 text-2xl">{totalCount}</span>
        </p>
      </div>
    </div>
  );
};

export default BiLL_Checked_BY_RavindraSir;