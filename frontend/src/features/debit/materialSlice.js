// src/features/debit/materialSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const materialSliceApi = createApi({
  reducerPath: 'materialSliceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ['MaterialDebit'],
  endpoints: (builder) => ({
    // GET - Fetch Pending Debit Materials
    getPendingDebitMaterials: builder.query({
      query: () => '/api/debit/Contractor_Material_Debit',
      providesTags: ['MaterialDebit'],
      transformResponse: (res) => {
        console.log('[RTK] Material Debit - Pending Materials:', res);
        return res?.success ? res.data : [];
      },
    }),

    // POST - Submit Debit with PDF Generation
    submitMaterialDebit: builder.mutation({
      query: (payload) => ({
        url: '/api/debit/Contractor_Material_Debit',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['MaterialDebit'],
    }),
  }),
});

export const {
  useGetPendingDebitMaterialsQuery,
  useSubmitMaterialDebitMutation,
} = materialSliceApi;