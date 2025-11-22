
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// export const billFinalByOfficeApi = createApi({
//   reducerPath: 'billFinalByOfficeApi',
//   baseQuery: fetchBaseQuery({ 
//     baseUrl: BASE_URL,
//   }),
//   tagTypes: ['BillFinalByOffice', 'WorkOrderColumns'],  // ← Naya tag add kiya

//   endpoints: (builder) => ({
//     // ← Pehle waale dono endpoints (unchanged)
//     getBillFinalByOffice: builder.query({
//       query: () => '/api/Bill_Final_By_Office',
//       providesTags: (result) =>
//         result
//           ? [
//               ...result.map(({ rccBillNo }) => ({ type: 'BillFinalByOffice', id: rccBillNo })),
//               { type: 'BillFinalByOffice', id: 'LIST' },
//             ]
//           : [{ type: 'BillFinalByOffice', id: 'LIST' }],
      
//       transformResponse: (response) => {
//         console.log(response.data)
//         return response.success ? response.data : [];
//       },
//     }),

//     updateBillFinalByRcc: builder.mutation({
//       query: (payload) => ({
//         url: '/api/updateBillFinalByRcc',
//         method: 'POST',
//         body: payload,
//       }),
//       invalidatesTags: [{ type: 'BillFinalByOffice', id: 'LIST' }],
//     }),

//     // ←←←←← TUMHARA NAYA API (column-wise dropdown data) ←←←←←
//     getWorkOrderColumns: builder.query({
//       query: () => '/api/work-orders',   // ← Exact same style, no /contractor/
//       providesTags: ['WorkOrderColumns'],

//       transformResponse: (response) => {
//         if (!response.success || !response.columns) {
//           return {
//             Project_ID: [],
//             Project_Name: [],
//             Contractor_Name: [],
//             Contractor_Firm_Name: [],
//             Work_Type: [],
//             Work_Order_No: [],
//             Work_Order_Url: [],
//             Work_Order_Value: []
//           };
//         }
//         console.log(response.columns)
//         return response.columns;
//       },
//     }),
//   }),
// });

// // ← Sirf ek hook aur add kar diya
// export const {
//   useGetBillFinalByOfficeQuery,
//   useUpdateBillFinalByRccMutation,
//   useGetWorkOrderColumnsQuery,   
// } = billFinalByOfficeApi;




////////////////////////////////////////////////////////////////////////////////


import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const billFinalByOfficeApi = createApi({
  reducerPath: 'billFinalByOfficeApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // Agar authentication chahiye to yahan add karo
      // headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['BillFinalByOffice', 'WorkOrderColumns'],

  endpoints: (builder) => ({
    // ✅ GET BILL FINAL BY OFFICE - UPDATED
    getBillFinalByOffice: builder.query({
      query: () => '/api/Bill_Final_By_Office',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ rccBillNo }) => ({ type: 'BillFinalByOffice', id: rccBillNo })),
              { type: 'BillFinalByOffice', id: 'LIST' },
            ]
          : [{ type: 'BillFinalByOffice', id: 'LIST' }],
      
      transformResponse: (response) => {
        console.log("🔥 Raw API Response:", response);
        
        if (!response.success || !response.data) {
          console.error("❌ API Error:", response);
          return [];
        }

        // Data ko properly process karo
        const processedData = response.data.map((bill) => {
          // Empty strings ko null ya proper values se replace karo
          return {
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
            // PreviousDoneBill ko bhi ensure karo
            previousDoneBill: bill.previousDoneBill || null,
          };
        });

        console.log("✅ Processed Bills Data:", processedData);
        return processedData;
      },
      
      // ✅ Error handling
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error("❌ Query Failed:", error);
        }
      },
    }),

    // ✅ UPDATE BILL FINAL BY RCC - UPDATED
    updateBillFinalByRcc: builder.mutation({
      query: (payload) => {
        console.log("📤 Sending Payload:", payload);
        return {
          url: '/api/updateBillFinalByRcc',
          method: 'POST',
          body: payload,
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      invalidatesTags: [{ type: 'BillFinalByOffice', id: 'LIST' }],
      
      // ✅ Success/Error handling
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          console.log("✅ Update Success:", data);
        } catch (error) {
          console.error("❌ Update Failed:", error);
        }
      },
    }),

    // ✅ GET WORK ORDER COLUMNS - UPDATED
    getWorkOrderColumns: builder.query({
      query: () => '/api/work-orders',
      providesTags: ['WorkOrderColumns'],

      transformResponse: (response) => {
        console.log("🔥 Work Order Raw Response:", response);

        if (!response.success || !response.columns) {
          console.error("❌ Work Order API Error:", response);
          return {
            Project_ID: [],
            Project_Name: [],
            Contractor_Name: [],
            Contractor_Firm_Name: [],
            Work_Type: [],
            Work_Order_No: [],
            Work_Order_Url: [],
            Work_Order_Value: []
          };
        }

        console.log("✅ Work Order Columns:", response.columns);
        return response.columns;
      },

      // ✅ Error handling
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error("❌ Work Order Query Failed:", error);
        }
      },
    }),
  }),
});

export const {
  useGetBillFinalByOfficeQuery,
  useUpdateBillFinalByRccMutation,
  useGetWorkOrderColumnsQuery,   
} = billFinalByOfficeApi;