

// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// export const billTallyApi = createApi({
//   reducerPath: 'billTallyApi',
//   baseQuery: fetchBaseQuery({ 
//     baseUrl: BASE_URL,
//     prepareHeaders: (headers) => {
//       // Optional: Add auth token if needed
//       // const token = localStorage.getItem('token');
//       // if (token) headers.set('Authorization', `Bearer ${token}`);
//       return headers;
//     },
//   }),
//   tagTypes: ['BillingData'], // For invalidation
//   endpoints: (builder) => ({
//     // Existing: Get Project Data
//     getProjectData: builder.query({
//       query: () => '/api/project-data', // Updated endpoint
//       transformResponse: (response) => {
//         if (!response?.data || !Array.isArray(response.data)) {
//           return { totalRows: 0, data: [] };
//         }

//         const normalized = response.data
//           .map(row => ({
//             projectId: row['Project_ID'] || row['Project ID'] || row.projectId || '',
//             projectName: row['Project_Name'] || row['Project Name'] || row.projectName || '',
//             siteEngineerName: row['Site_Engineer_Name'] || row['Site Engineer Name'] || row.siteEngineerName || '',
//             contractorName: row['Contractor Name'] || row['Contractor_Name'] || row.E || '',
//             contractorFirmName: row['Contractor_Firm_Name'] || row['F'] || '',
//             contractorWorkName: row['Contractor_Work_Name'] || row['I'] || '',
//             unit: row['Single_Unit'] || row['Single Unit'] || '',
//           }))
//           .filter(row => row.projectId);

//         return {
//           totalRows: normalized.length,
//           data: normalized,
//         };
//       },
//       providesTags: ['BillingData'],
//     }),

//     // NEW: Submit Multiple Works (from your backend route)
//     submitMultipleWorks: builder.mutation({
//       query: (payload) => ({
//         url: '/api/submit-multiple',
//         method: 'POST',
//         body: payload,
//       }),
//       invalidatesTags: ['BillingData'], // Refresh project data after submit
//     }),
//   }),
// });

// // Export hooks
// export const { 
//   useGetProjectDataQuery, 
//   useSubmitMultipleWorksMutation 
// } = billTallyApi;


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