
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const paymentTallyApi = createApi({
  reducerPath: 'paymentTallyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ['PaymentTally'],
  endpoints: (builder) => ({
    // 1. डेटा GET करने के लिए (मौजूदा)
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
        return { data: [], uniqueContractors: [], count: 0, message: 'Failed to fetch' };
      },
    }),

    // 2. डेटा POST (Update) करने के लिए (नया)
    updatePayments: builder.mutation({
      query: (paymentDataArray) => ({
        url: '/api/Update-Payment', // आपका backend route
        method: 'POST',
        body: paymentDataArray, // यहाँ Array of objects जाएगा
      }),
      // जब पेमेंट सफल हो जाए, तो 'PaymentTally' वाले queries को रिफ्रेश करो
      invalidatesTags: ['PaymentTally'],
    }),
  }),
});

// Hooks एक्सपोर्ट करें
export const {
  useGetPendingPaymentsQuery,
  useUpdatePaymentsMutation, // ← नया हुक
} = paymentTallyApi;