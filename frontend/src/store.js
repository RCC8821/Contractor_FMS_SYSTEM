// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import { apiSlice } from './features/api/apiSlice';
import { billTallyApi } from './features/billing/billTallySlice';
import { billCheckedApi } from './features/billing/billCheckedSlice';
import { billCheckedOfficeApi } from './features/billing/billCheckedOfficeSlice';
// Payment 
import {billFinalByOfficeApi} from './features/Payment/Bill_final_By_Office_Slice'
import {billCheckedByRavindraSirApi} from './features/Payment/BiLL_Checked_BY_RavindraSir_Slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [billTallyApi.reducerPath]: billTallyApi.reducer,
    [billCheckedApi.reducerPath]: billCheckedApi.reducer,
    [billCheckedOfficeApi.reducerPath]: billCheckedOfficeApi.reducer,
    //Payment 
    [billFinalByOfficeApi.reducerPath]: billFinalByOfficeApi.reducer,
     [billCheckedByRavindraSirApi.reducerPath]: billCheckedByRavindraSirApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(billTallyApi.middleware)
      .concat(billCheckedApi.middleware)
      .concat(billCheckedOfficeApi.middleware)
      ///Payment
      .concat(billFinalByOfficeApi.middleware)
      .concat(billCheckedByRavindraSirApi.middleware)
   
});