// src/features/billing/billCheckedSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const billCheckedApi = createApi({
  reducerPath: 'billCheckedApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ['BillChecked', 'ProjectEnquiry'],
  endpoints: (builder) => ({
    // === Bill Data ===
    getContractorBillChecked: builder.query({
      query: () => '/api/Contractor_Bill_Checked',
      transformResponse: (response) => {
        if (!response?.success || !Array.isArray(response.data))
          return { totalRows: 0, data: [] };

        const normalized = response.data.map((row) => ({
          UID: row.UID ?? '',
          projectId: row.projectId ?? '',
          projectName: row.projectName ?? '',
          siteEngineer: row.siteEngineer ?? '',
          contractorName: row.contractorName ?? '',
          firmName: row.firmName ?? '',
          workName: row.workName ?? '',
          workDesc: row.workDesc ?? '',
          quantity: row.quantity ?? '',
          unit: row.unit ?? '',
          rate: row.rate ?? '',
          amount: row.amount ?? '',
          billNo: row.billNo ?? '',
          billDate: row.billDate ?? '',
          billUrl: row.billUrl ?? '',
          prevBillUrl: row.prevBillUrl ?? '',
          remark: row.remark ?? '',
          planned2: row.planned2 ?? '',
        }));

        return { totalRows: normalized.length, data: normalized };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ UID }) => ({ type: 'BillChecked', id: UID })),
              { type: 'BillChecked', id: 'LIST' },
            ]
          : [{ type: 'BillChecked', id: 'LIST' }],
    }),

    // === DROPDOWN DATA — FIX: response.data is an object, not an array ===
    getProjectDropdownData: builder.query({
      query: () => '/api/enquiry-capture-Billing',
      transformResponse: (response) => {
        console.log('Raw API Response (Dropdown):', response); // DEBUG

        // FIX: Check karo ki response.data ek object hai with projectIds and contractorNames
        if (!response?.success || !response?.data) {
          return { projectIds: [], contractorNames: [] };
        }

        // DIRECT RETURN - data pehle se hi arrays contain kar raha hai
        const projectIds = response.data.projectIds || [];
        const contractorNames = response.data.contractorNames || [];

        console.log('Dropdown Data:', { projectIds, contractorNames }); // DEBUG

        return { projectIds, contractorNames };
      },
      providesTags: [{ type: 'ProjectEnquiry', id: 'DROPDOWNS' }],
    }),
  }),
});

export const {
  useGetContractorBillCheckedQuery,
  useLazyGetProjectDropdownDataQuery,
} = billCheckedApi;