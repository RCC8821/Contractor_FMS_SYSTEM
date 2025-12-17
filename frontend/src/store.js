// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
////Contractor selections 
import { apiSlice } from './features/api/apiSlice';
import {approvalForMeetingApi} from './features/api/Approval_For_Meeting_Slice'
import {firstMeetingAttendApi} from './features/api/first_Meeting_Attend_slice'
import {meetingMomApi} from './features/api/Meeting_Mom_Slice'
import {secondMeetingAttendApi} from './features/api/Second_Meeting_Attend_Slice'
/////billing
import { billTallyApi } from './features/billing/billTallySlice';
import { billCheckedApi } from './features/billing/billCheckedSlice';
import { billCheckedOfficeApi } from './features/billing/billCheckedOfficeSlice';
// Payment 
import {billFinalByOfficeApi} from './features/Payment/Bill_final_By_Office_Slice'
import { billCheckedByRavindraSirApi } from './features/Payment/BiLL_Checked_BY_RavindraSir_Slice';
import {billCheckedByAshokSirApi} from './features/Payment/BiLL_Checked_BY_AshokSir_Slice'
import  {paymentTallyApi}  from './features/Payment/Payment_Tally_Slice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [approvalForMeetingApi.reducerPath]: approvalForMeetingApi.reducer,
    [firstMeetingAttendApi.reducerPath]: firstMeetingAttendApi.reducer,
    [meetingMomApi.reducerPath]: meetingMomApi.reducer,
   [secondMeetingAttendApi.reducerPath]: secondMeetingAttendApi.reducer,
    ///billing
    [billTallyApi.reducerPath]: billTallyApi.reducer,
    [billCheckedApi.reducerPath]: billCheckedApi.reducer,
    [billCheckedOfficeApi.reducerPath]: billCheckedOfficeApi.reducer,
    //Payment 
    [billFinalByOfficeApi.reducerPath]: billFinalByOfficeApi.reducer,
    [billCheckedByRavindraSirApi.reducerPath]: billCheckedByRavindraSirApi.reducer,
    [billCheckedByAshokSirApi.reducerPath]: billCheckedByAshokSirApi.reducer,
    [paymentTallyApi.reducerPath]: paymentTallyApi.reducer,
    

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(approvalForMeetingApi.middleware)
      .concat(firstMeetingAttendApi.middleware)
      .concat(meetingMomApi.middleware)
      .concat(secondMeetingAttendApi.middleware)
      ///billing
      .concat(billTallyApi.middleware)
      .concat(billCheckedApi.middleware)
      .concat(billCheckedOfficeApi.middleware)
      ///Payment
      .concat(billFinalByOfficeApi.middleware)
      .concat(billCheckedByRavindraSirApi.middleware)
      .concat(billCheckedByAshokSirApi.middleware)
      .concat(paymentTallyApi.middleware)
   
});