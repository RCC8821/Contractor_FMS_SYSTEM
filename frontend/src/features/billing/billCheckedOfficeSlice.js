


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