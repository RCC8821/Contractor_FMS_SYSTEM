// src/features/payment/BillCheckedByRavindraSirSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const billCheckedByAshokSirApi = createApi({
  reducerPath: 'billCheckedByAshokSirApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ['AshokFinalBill'],
  endpoints: (builder) => ({
    getPendingFinalBills: builder.query({
      query: () => '/api/Payment_final_bill_Checked_AshokSir',
      providesTags: ['RavindraFinalBill'],
      transformResponse: (res) => {
        console.log('[RTK] Ashok Sir - Pending Bills:', res);
        return res?.success ? res.data : [];
      },
    }),
    markFinalBillChecked: builder.mutation({
      query: (payload) => ({
        url: '/api/Post_Final_Bill_Checked_AshokSir',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['AshokFinalBill'],
    }),
  }),
});

export const {
  useGetPendingFinalBillsQuery,
  useMarkFinalBillCheckedMutation,
} = billCheckedByAshokSirApi;