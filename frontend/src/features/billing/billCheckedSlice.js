// // src/features/billing/billCheckedSlice.js
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const BASE_URL = import.meta.env.VITE_BACKEND_URL ;

// export const billCheckedApi = createApi({
//   reducerPath: 'billCheckedApi',
//   baseQuery: fetchBaseQuery({ 
//     baseUrl: BASE_URL,
//   }),
//   tagTypes: ['BillChecked', 'EnquiryCapture'],
//   endpoints: (builder) => ({
//     // 1. Get Contractor Bills (Planned2: Yes, Actual2: No)
//     getContractorBillChecked: builder.query({
//       query: () => '/api/Contractor_Bill_Checked',
//       providesTags: ['BillChecked'],
//       transformResponse: (response) => {
//         return response.success ? response.data : [];
//       },
//     }),

//     // 2. Get Enquiry Capture Data (Dropdowns)
//     getEnquiryCaptureBilling: builder.query({
//       query: () => '/api/enquiry-capture-Billing',
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
//   }),
// });

// // Export RTK Query Hooks
// export const {
//   useGetContractorBillCheckedQuery,
//   useGetEnquiryCaptureBillingQuery,
// } = billCheckedApi;








// src/features/billing/billCheckedSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const billCheckedApi = createApi({
  reducerPath: 'billCheckedApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: BASE_URL,
    credentials: 'include', // agar auth cookie/session use kar rahe ho
  }),
  tagTypes: ['BillChecked', 'EnquiryCapture'],
  endpoints: (builder) => ({
    // 1. Get Contractor Bills (Planned2: Yes, Actual2: No)
    getContractorBillChecked: builder.query({
      query: () => '/api/Contractor_Bill_Checked',
      providesTags: ['BillChecked'],
      transformResponse: (response) => {
        return response.success ? response.data : [];
      },
    }),

    // 2. Get Enquiry Capture Data (Dropdowns)
    getEnquiryCaptureBilling: builder.query({
      query: () => '/api/enquiry-capture-Billing',
      providesTags: ['EnquiryCapture'],
      transformResponse: (response) => {
        return response.success 
          ? response.data 
          : {
              projectIds: [],
              projectNames: [],
              contractorNames: [],
              contractorFirmNames: [],
            };
      },
    }),

    // 3. NEW: Save Bill Checked Data (POST /save-Bill-Checked)
    saveBillChecked: builder.mutation({
      query: (payload) => ({
        url: '/api/save-Bill-Checked',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['BillChecked'], // Save hone ke baad list refresh ho jayega
    }),
  }),
});

// Export RTK Query Hooks
export const {
  useGetContractorBillCheckedQuery,
  useGetEnquiryCaptureBillingQuery,
  useSaveBillCheckedMutation, // Yeh naya hook hai
} = billCheckedApi;