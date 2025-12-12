// src/features/Approval_For_Meeting/Approval_For_Meeting_Slice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// VITE se backend URL le rahe hain (tumhare payment wale slice jaisa hi)
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const approvalForMeetingApi = createApi({
  reducerPath: 'approvalForMeetingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    // Agar token use karte ho toh yeh add kar lena (optional)
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['ApprovalForMeeting'],
  endpoints: (builder) => ({
    // GET: Jo meetings approval ke liye pending hain
    getApprovalForMeeting: builder.query({
      query: () => '/api/Approval_For_Meeting',
      providesTags: ['ApprovalForMeeting'],
      transformResponse: (response) => {
        if (response?.success) {
          return response.data || [];
        }
        return [];
      },
    }),

    // POST: Meeting approve/reject + schedule + remark daalo
    postApprovalForMeeting: builder.mutation({
      query: ({ uid, status3, meetingScheduleSlot3, doerName3, remark3 }) => ({
        url: '/api/Post_Approval_For_Meeting',
        method: 'POST',
        body: {
          uid,
          status3,
          meetingScheduleSlot3,
          doerName3,
          remark3,
        },
      }),
      invalidatesTags: ['ApprovalForMeeting'], // Update ke baad list auto refresh
    }),
  }),
});

// Auto-generated hooks (tumhare payment wale slice jaisa hi)
export const {
  useGetApprovalForMeetingQuery,
  usePostApprovalForMeetingMutation,
} = approvalForMeetingApi;

export default approvalForMeetingApi;