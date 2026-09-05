import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_URL,
  }),
  tagTypes: ['Dropdowns', 'Contractors'],
  endpoints: (builder) => ({
    getProjectDropdowns: builder.query({
      query: () => '/api/project-dropdowns',
      transformResponse: (res) => ({
        projectNames: res.projectNames || [],
        projectTypes: res.projectTypes || [],
        workCategories: res.workCategories || [],
        contractorTypes: res.contractorTypes || [],
        units: res.units || [], // Receive units from backend
      }),
      providesTags: ['Dropdowns'],
    }),

    submitContractorForm: builder.mutation({
      query: (data) => ({
        url: '/api/submit-contractor',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Contractors'],
    }),
  }),
});

export const {
  useGetProjectDropdownsQuery,
  useSubmitContractorFormMutation,
} = apiSlice;