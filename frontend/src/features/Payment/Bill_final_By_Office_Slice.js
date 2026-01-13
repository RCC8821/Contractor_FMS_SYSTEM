
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const billFinalByOfficeApi = createApi({
  reducerPath: 'billFinalByOfficeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // Agar future mein token add karna ho to yahan kar dena
      // const token = localStorage.getItem('token');
      // if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['BillFinalByOffice', 'WorkOrderColumns', 'DoneBills'],

  endpoints: (builder) => ({
    // 1. GET ALL BILL FINAL BY OFFICE
    getBillFinalByOffice: builder.query({
      query: () => '/api/Bill_Final_By_Office',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ rccBillNo }) => ({ type: 'BillFinalByOffice', id: rccBillNo })),
              { type: 'BillFinalByOffice', id: 'LIST' },
            ]
          : [{ type: 'BillFinalByOffice', id: 'LIST' }],

      transformResponse: (response) => {
        console.log("Raw Bill Final Response:", response);

        if (!response.success || !response.data) {
          console.error("API Error - Bill Final:", response);
          return [];
        }

        return response.data.map((bill) => ({
          ...bill,
          WorkOrderNo: bill.WorkOrderNo || bill.previousDoneBill?.WorkOrderNo || "",
          workOrderUrl: bill.workOrderUrl || bill.previousDoneBill?.workOrderUrl || "",
          WorkOrderValue: bill.WorkOrderValue || bill.previousDoneBill?.WorkOrderValue || "",
          PreviousBillAmount: bill.PreviousBillAmount || "0",
          UPToDatePaidAmount: bill.UPToDatePaidAmount || "0",
          BalanceAmount: bill.BalanceAmount || "0",
          NETAMOUNTCurrentAmount: bill.NETAMOUNTCurrentAmount || "0",
          remark: bill.remark || "",
          status5: bill.status5 || "Pending",
          previousDoneBill: bill.previousDoneBill || null,
        }));
      },
    }),

    // 2. UPDATE BILL FINAL BY RCC → YE SABSE ZAROORI FIX HAI!
    updateBillFinalByRcc: builder.mutation({
      query: (payload) => ({
        url: '/api/updateBillFinalByRcc',
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
      }),
      // YE DO TAG INVALIDATE KARNA ZAROORI HAI!
      invalidatesTags: [
        { type: 'BillFinalByOffice', id: 'LIST' },
        { type: 'DoneBills', id: 'LIST' },    
      ],
    }),

    // 3. GET WORK ORDER COLUMNS (for dropdowns)
    getWorkOrderColumns: builder.query({
      query: () => '/api/work-orders',
      providesTags: ['WorkOrderColumns'],
      transformResponse: (response) => {
        if (!response.success || !response.columns) {
          console.error("Work Order Columns API Error:", response);
          return {
            Project_ID: [], Project_Name: [], Contractor_Name: [],
            Contractor_Firm_Name: [], Work_Type: [], Work_Order_No: [],
            Work_Order_Url: [], Work_Order_Value: []
          };
        }
        return response.columns;
      },
    }),
    // 4. GET DONE BILLS - URL CORRECT KAREIN
getDoneBills: builder.query({
  query: () => '/api/Done_Bills',
  providesTags: ['DoneBills'],

  transformResponse: (response) => {
    console.log("Raw Done Bills Response:", response);

    if (!response.success || !response.data) {
      console.warn("No done bills or API failed:", response);
      return [];
    }

    const processed = response.data.map(bill => ({
      rccBillNo: bill.rccBillNo?.toString().trim() || '',
      projectId: bill.projectId?.toString().trim() || '',
      contractorName: bill.contractorName?.toString().trim() || '',
      firmName: bill.firmName?.toString().trim() || '',
      workName: bill.workName?.toString().trim() || '',
      WorkOrderNo: bill.WorkOrderNo?.toString().trim() || '',
      UPToDatePaidAmount: bill.UPToDatePaidAmount || '0',
      BalanceAmount: bill.BalanceAmount || '0',
      workOrderValue: bill.WorkOrderValue || '0',
      netAmount: bill.netAmount || '0',
    }));

    console.log("Processed Done Bills:", processed);
    return processed;
  },
}),
  }),
});

// EXPORT ALL HOOKS
export const {
  useGetBillFinalByOfficeQuery,
  useUpdateBillFinalByRccMutation,
  useGetWorkOrderColumnsQuery,
  useGetDoneBillsQuery,
} = billFinalByOfficeApi;