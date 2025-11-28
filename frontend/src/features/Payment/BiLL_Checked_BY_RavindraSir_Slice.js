// src/features/payment/BillCheckedByRavindraSirSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const billCheckedByRavindraSirApi = createApi({
  reducerPath: 'billCheckedByRavindraSirApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ['RavindraFinalBill'],
  endpoints: (builder) => ({
    getPendingFinalBills: builder.query({
      query: () => '/api/Payment_final_bill_Checked_RavinderSir',
      providesTags: ['RavindraFinalBill'],
      transformResponse: (res) => {
        console.log('[RTK] Ravinder Sir - Pending Bills:', res);
        return res?.success ? res.data : [];
      },
    }),
    markFinalBillChecked: builder.mutation({
      query: (payload) => ({
        url: '/api/Post-Final-Bill-Checked-RavinderSir',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['RavindraFinalBill'],
    }),
  }),
});

export const {
  useGetPendingFinalBillsQuery,
  useMarkFinalBillCheckedMutation,
} = billCheckedByRavindraSirApi;