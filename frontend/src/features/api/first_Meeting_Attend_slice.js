import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const firstMeetingAttendApi = createApi({
  reducerPath: 'firstMeetingAttendApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['FirstMeetingAttend'],
  endpoints: (builder) => ({
    getFirstMeetingAttend: builder.query({
      query: () => '/api/Get_1st_Meeting_Attend',
      providesTags: ['FirstMeetingAttend'],
      transformResponse: (response) =>
        response?.success ? response.data || [] : [],
    }),

    postFirstMeetingAttend: builder.mutation({
      query: (body) => ({
        url: '/api/Post_1st_Meeting_Attend',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FirstMeetingAttend'],
    }),
  }),
});

export const {
  useGetFirstMeetingAttendQuery,
  usePostFirstMeetingAttendMutation,
} = firstMeetingAttendApi;

export default firstMeetingAttendApi;