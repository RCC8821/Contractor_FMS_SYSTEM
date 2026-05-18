// src/features/debit/labourSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const labourSliceApi = createApi({
  reducerPath: 'labourSliceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ['LabourDebit'],
  endpoints: (builder) => ({
    // GET - Fetch Pending Labour Debit Data
    getPendingDebitLabours: builder.query({
      query: () => '/api/debit/Contractor_Labour_Debit',
      providesTags: ['LabourDebit'],
      transformResponse: (res) => {
        console.log('[RTK] Labour Debit - Pending Labours:', res);
        return res?.success ? res.data : [];
      },
    }),

    // POST - Submit Labour Debit with PDF Generation
    submitLabourDebit: builder.mutation({
      query: (payload) => ({
        url: '/api/debit/Contractor_Labour_Debit',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['LabourDebit'],
    }),
  }),
});

export const {
  useGetPendingDebitLaboursQuery,
  useSubmitLabourDebitMutation,
} = labourSliceApi;