
// // src/features/billing/billCheckedSlice.js
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// export const billCheckedOfficeApi = createApi({
//   reducerPath: 'billCheckedApi',
//   baseQuery: fetchBaseQuery({ 
//     baseUrl: BASE_URL,
//   }),
//   tagTypes: ['BillChecked', 'EnquiryCapture'],
//   endpoints: (builder) => ({
//     // 1. Get Contractor Bills (Planned2: Yes, Actual2: No)
//     getContractorBillCheckedOffice: builder.query({
//       query: () => '/api/Contractor_Bill_Checked_Office',
//       providesTags: ['BillChecked'],
//       transformResponse: (response) => {
//         return response.success ? response.data : [];
//       },
//     }),

//     // 2. Get Enquiry Capture Data (Dropdowns)
//     getEnquiryCaptureBillingOffice: builder.query({
//       query: () => '/api/enquiry-capture-Billing-Office',
//       providesTags: ['EnquiryCapture'],
//       transformResponse: (response) => {
//         return response.success 
//           ? response.data 
//           : {
//               projectIds: [],
//               projectNames: [],
//               contractorNames: [],
//               contractorFirmNames: [],
//             };
//       },
//     }),

//     // 3. Save Bill Checked (POST with Base64 images)
//     // saveBillChecked: builder.mutation({
//     //   query: (payload) => ({
//     //     url: '/api/save-Bill-Checked',
//     //     method: 'POST',
//     //     body: payload,
//     //     // payload structure:
//     //     // {
//     //     //   uids: string[],
//     //     //   status: string,
//     //     //   measurementSheetBase64: string,
//     //     //   attendanceSheetBase64: string,
//     //     //   items: [
//     //     //     {
//     //     //       uid: string,
//     //     //       areaQuantity2: string,
//     //     //       unit2: string,
//     //     //       qualityApprove2: string,
//     //     //       photoEvidenceBase64?: string
//     //     //     }
//     //     //   ]
//     //     // }
//     //   }),
//     //   invalidatesTags: ['BillChecked'],
//     //   transformResponse: (response) => {
//     //     return response;
//     //   },
//     //   transformErrorResponse: (response) => {
//     //     return {
//     //       success: false,
//     //       error: response.data?.error || 'Failed to save bill checked data',
//     //       details: response.data?.details,
//     //     };
//     //   },
//     // }),
//   }),
// });

// // Export RTK Query Hooks
// export const {
//   useGetContractorBillCheckedOfficeQuery,
//   useGetEnquiryCaptureBillingOfficeQuery,
// //   useSaveBillCheckedMutation,
// } = billCheckedOfficeApi;


import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const billCheckedOfficeApi = createApi({
  reducerPath: 'billCheckedOfficeApi', // ✅ UNIQUE NAME
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['BillCheckedOffice'],
  endpoints: (builder) => ({
    getContractorBillCheckedOffice: builder.query({
      query: () => '/api/Contractor_Bill_Checked_Office',
      providesTags: ['BillCheckedOffice'],
      transformResponse: (res) => res.success ? res.data : [],
    }),

    getEnquiryCaptureBillingOffice: builder.query({
      query: () => '/api/enquiry-capture-Billing-Office',
      providesTags: ['BillCheckedOffice'],
      transformResponse: (res) => res.success ? res.data : {
        projectIds: [], projectNames: [], contractorNames: [], contractorFirmNames: []
      },
    }),

    saveBillCheckedOffice: builder.mutation({
      query: (payload) => ({
        url: '/api/save-BillCheckedOffice',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['BillCheckedOffice'],
    }),
  }),
});

export const {
  useGetContractorBillCheckedOfficeQuery,
  useGetEnquiryCaptureBillingOfficeQuery,
  useSaveBillCheckedOfficeMutation,
} = billCheckedOfficeApi;