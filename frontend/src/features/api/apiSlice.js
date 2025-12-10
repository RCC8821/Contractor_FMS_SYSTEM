// src/features/api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_URL,
  }),
  endpoints: (builder) => ({
    getProjectIds: builder.query({
      query: () => '/api/enquiry-capture',
      transformResponse: (response) => {
        const rows = response.data || [];

        // Correctly accessing 'Project_ID'
        const ids = rows
          .map(row => row.Project_ID) 
          .filter(id => id && id.toString().trim() !== '')
          .map(id => id.toString().trim())
          .filter((v, i, a) => a.indexOf(v) === i)
          .sort();

        console.log('Final Dropdown IDs:', ids);
        return ids;
      },
    }),

    getEnquiryById: builder.query({
      query: () => '/api/enquiry-capture',
      transformResponse: (response, meta, arg) => {
        const projectId = arg?.toString().trim();
        const rows = response.data || [];
        // Correctly comparing with 'Project_ID'
        return rows.find(r => r.Project_ID?.toString().trim() === projectId) || null;
      },
    }),

    submitContractorForm: builder.mutation({
      query: (data) => ({
        url: '/api/submit-contractor',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useLazyGetProjectIdsQuery,
  useLazyGetEnquiryByIdQuery,
  useSubmitContractorFormMutation,
} = apiSlice;