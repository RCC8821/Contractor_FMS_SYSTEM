// src/features/first_Meeting_Attend/first_Meeting_Attend_Slice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const firstMeetingAttendApi = createApi({
  reducerPath: 'firstMeetingAttendApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['FirstMeetingAttend'],
  endpoints: (builder) => ({
    // GET: Pending 1st Meeting Attend (jo abhi attend nahi hue)
    getFirstMeetingAttend: builder.query({
      query: () => '/api/Get_1st_Meeting_Attend',
      providesTags: ['FirstMeetingAttend'],
      transformResponse: (response) => {
        if (response?.success) {
          return response.data || [];
        }
        return [];
      },
    }),

    // POST: 1st Meeting Attend karne ke baad update karo
    postFirstMeetingAttend: builder.mutation({
      query: ({ uid, status4, doerName4, remark4 }) => ({
        url: '/api/Post_1st_Meeting_Attend',
        method: 'POST',
        body: {
          uid,
          status4: status4 || 'Done',
          doerName4,
          remark4: remark4 || '',
        },
      }),
      invalidatesTags: ['FirstMeetingAttend'], // Auto refresh list after update
    }),
  }),
});

// Auto-generated hooks
export const {
  useGetFirstMeetingAttendQuery,
  usePostFirstMeetingAttendMutation,
} = firstMeetingAttendApi;

export default firstMeetingAttendApi;