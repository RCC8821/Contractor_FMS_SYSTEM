
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const billTallyApi = createApi({
  reducerPath: 'billTallyApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: BASE_URL,
  }),
  tagTypes: ['BillingData'],
  endpoints: (builder) => ({
    getProjectData: builder.query({
      query: () => '/api/project-data?format=column', // Must be column
      providesTags: ['BillingData'],
    }),

    submitMultipleWorks: builder.mutation({
      query: (payload) => ({
        url: '/api/submit-multiple',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['BillingData'],
    }),
  }),
});

export const { 
  useGetProjectDataQuery, 
  useSubmitMultipleWorksMutation 
} = billTallyApi;