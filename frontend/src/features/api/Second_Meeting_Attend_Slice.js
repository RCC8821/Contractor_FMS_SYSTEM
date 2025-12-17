import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Backend URL को environment variable से उठाएँ
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const secondMeetingAttendApi = createApi({
  // Slice का नाम जो आपने बताया
  reducerPath: 'secondMeetingAttendApi',
  
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
  
  // Tag type for caching and invalidation
  tagTypes: ['SecondMeetingAttend'],
  
  endpoints: (builder) => ({
    // =======================================================
    // 1. GET: Pending Second Meeting Attend records
    // Route: /api/Get_Second_Meeting_Attend
    // =======================================================
    getSecondMeetingPending: builder.query({
      query: () => '/api/Get_Second_Meeting_Attend',
      providesTags: ['SecondMeetingAttend'],
      
      // Response को क्लीन और यूज़ेबल फॉर्मेट में बदलें
      transformResponse: (response) => {
        if (response?.success) {
          return response.data || [];
        }
        return [];
      },
    }),

    // =======================================================
    // 2. POST: Second Meeting MOM submit karna
    // Route: /api/Post_Second_Meeting_Attend
    // =======================================================
    postSecondMeetingMom: builder.mutation({
      query: ({
        uid,
        status6 = 'Attended', // default value अगर आप form में नहीं भेज रहे हैं
        DoerName_6,
        momPdfBase64
      }) => ({
        url: '/api/Post_Second_Meeting_Attend',
        method: 'POST',
        body: {
          uid,
          status6,
          DoerName_6,
          momPdfBase64,
        },
      }),
      
      // Save करने के बाद pending list को automatically refresh करने के लिए
      invalidatesTags: ['SecondMeetingAttend'], 
    }),
  }),
});

// Auto-generated hooks को एक्सपोर्ट करें
export const {
  useGetSecondMeetingPendingQuery, // GET के लिए
  usePostSecondMeetingMomMutation, // POST के लिए
} = secondMeetingAttendApi;

export default secondMeetingAttendApi;