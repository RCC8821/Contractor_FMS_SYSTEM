// src/features/meeting_mom/Meeting_Mom_Slice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const meetingMomApi = createApi({
  reducerPath: 'meetingMomApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['MeetingMom'],
  endpoints: (builder) => ({
    // GET: Pending MOM wale records
    getPendingMom: builder.query({
      query: () => '/api/Get_Meeting_Mom',
      providesTags: ['MeetingMom'],
      transformResponse: (response) => {
        if (response?.success) {
          return response.data || [];
        }
        return [];
      },
    }),

    // POST: MOM submit karna & GST upload + data save
    postMeetingMom: builder.mutation({
      query: ({
        uid,
        status5 = 'Done',
        meetingLocation5 = '',
        nextMeetingSchedule5 = '',
        basicTurnover5 = '',
        noOfProjects5 = '',
        momPdfBase64,
        gstCertificateBase64
      }) => ({
        url: '/api/Post_Meeting_Mom',
        method: 'POST',
        body: {
          uid,
          status5,
          meetingLocation5,
          nextMeetingSchedule5,
          basicTurnover5,
          noOfProjects5,
          momPdfBase64,
          gstCertificateBase64: gstCertificateBase64 || undefined
        },
      }),
      invalidatesTags: ['MeetingMom'], // Save karne ke baad list auto refresh
    }),
  }),
});

// Auto-generated hooks
export const {
  useGetPendingMomQuery,
  usePostMeetingMomMutation,
} = meetingMomApi;

export default meetingMomApi;