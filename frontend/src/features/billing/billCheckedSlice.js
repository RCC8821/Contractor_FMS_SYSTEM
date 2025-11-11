// src/features/billing/billCheckedSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const billCheckedApi = createApi({
  reducerPath: 'billCheckedApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ['BillChecked', 'EnquiryCapture'],
  endpoints: (builder) => ({
    getEnquiryCaptureBilling: builder.query({
      query: () => '/api/enquiry-capture-Billing',
      providesTags: ['EnquiryCapture'],
      transformResponse: (response) => {
        console.log('[RTK] Enquiry Raw:', response);
        if (response?.success && response?.data) {
          return response.data;
        }
        return {
          projectIds: [],
          projectNames: [],
          contractorFirmNames: [],
          contractorNames: [],
        };
      },
    }),

    getContractorBillChecked: builder.query({
      query: () => '/api/Contractor_Bill_Checked',
      providesTags: ['BillChecked'],
      transformResponse: (response) => {
        console.log('[RTK] Bills Raw:', response);
        return response?.success ? response.data : [];
      },
    }),

    saveBillChecked: builder.mutation({
      query: (payload) => ({
        url: '/api/save-Bill-Checked',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['BillChecked'],
    }),
  }),
});

export const {
  useGetEnquiryCaptureBillingQuery,
  useGetContractorBillCheckedQuery,
  useSaveBillCheckedMutation,
} = billCheckedApi;