import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const approvalForMeetingApi = createApi({
  reducerPath: 'approvalForMeetingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['ApprovalForMeeting'],
  endpoints: (builder) => ({
    getApprovalForMeeting: builder.query({
      query: () => '/api/Approval_For_Meeting',
      providesTags: ['ApprovalForMeeting'],
      transformResponse: (response) => {
        if (response?.success) return response.data || [];
        return [];
      },
    }),

    postApprovalForMeeting: builder.mutation({
      query: ({ uid, status3, remark3 }) => ({
        url: '/api/Post_Approval_For_Meeting',
        method: 'POST',
        body: { uid, status3, remark3 },
      }),
      invalidatesTags: ['ApprovalForMeeting'],
    }),
  }),
});

export const {
  useGetApprovalForMeetingQuery,
  usePostApprovalForMeetingMutation,
} = approvalForMeetingApi;

export default approvalForMeetingApi;