



import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export const paymentTallyApi = createApi({
  reducerPath: 'paymentTallyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ['PaymentTally', 'BankNames'],
  endpoints: (builder) => ({
    // 1. Pending Payments GET
    getPendingPayments: builder.query({
      query: () => '/api/Get-Payment',
      providesTags: ['PaymentTally'],
      transformResponse: (response) => {
        if (response?.success) {
          return {
            data: response.data || [],
            uniqueContractors: response.uniqueContractors || [],
            count: response.count || 0,
            message: response.message || '',
          };
        }
        return {
          data: [],
          uniqueContractors: [],
          count: 0,
          message: 'Failed to fetch',
        };
      },
    }),

    // 2. Payment Update POST
    updatePayments: builder.mutation({
      query: (paymentDataArray) => ({
        url: '/api/Update-Payment',
        method: 'POST',
        body: paymentDataArray,
      }),
      invalidatesTags: ['PaymentTally'],
    }),

    // 3. Bank Names GET - Project_Data sheet M column se
    getBankNames: builder.query({
      query: () => '/api/Get-Bank-Names',
      providesTags: ['BankNames'],
      transformResponse: (response) => {
        if (response?.success) {
          return response.bankNames || [];
        }
        return [];
      },
      // 10 minute cache - bank names zyada change nahi hote
      keepUnusedDataFor: 600,
    }),
  }),
});

// Hooks export
export const {
  useGetPendingPaymentsQuery,
  useUpdatePaymentsMutation,
  useGetBankNamesQuery, // ← New hook for bank names
} = paymentTallyApi;