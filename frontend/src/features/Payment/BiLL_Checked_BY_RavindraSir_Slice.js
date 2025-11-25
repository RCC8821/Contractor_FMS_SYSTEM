// src/features/Payment/BiLL_Checked_BY_RavindraSir_Slice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Yeh bilkul tere working slice jaisa
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const billCheckedByRavindraSirApi = createApi({
  reducerPath: 'billCheckedByRavindraSirApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include', // agar cookie chahiye (tere working mein nahi tha, par safe hai)
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['FinalBillPending'],

  endpoints: (builder) => ({
    // GET: Pending Final Bills (exactly tere working slice jaisa)
    getPendingFinalBills: builder.query({
      query: () => '/api/Payment_final_bill_Checked_RavinderSir',
      providesTags: ['FinalBillPending'],

      transformResponse: (response) => {
        // Yeh line sabse important — tere working slice mein bhi hai!
        console.log('[RTK] Ravinder Sir Raw Response:', response);

        // Agar backend success: true bhejta hai to data return karo
        if (response?.success && Array.isArray(response.data)) {
          return {
            count: response.count || response.data.length,
            data: response.data,
          };
        }

        // Fallback (agar kuch galat ho)
        return {
          count: 0,
          data: [],
        };
      },
    }),

    // POST: Mark as Checked
    postFinalBillChecked: builder.mutation({
      query: ({ rccBillNo, status6, remark6 }) => ({
        url: '/Post-Final-Bill-Checked-RavinderSir',
        method: 'POST',
        body: { rccBillNo, status6, remark6 },
      }),
      invalidatesTags: ['FinalBillPending'], // list auto refresh ho jayegi
    }),
  }),
});

// Auto-generated hooks
export const {
  useGetPendingFinalBillsQuery,
  usePostFinalBillCheckedMutation,
} = billCheckedByRavindraSirApi;

export default billCheckedByRavindraSirApi;