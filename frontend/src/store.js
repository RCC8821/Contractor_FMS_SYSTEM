import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import { apiSlice } from './features/api/apiSlice';
import { billTallyApi } from './features/billing/billTallySlice';
import { billCheckedApi } from './features/billing/billCheckedSlice';
import { billCheckedOfficeApi } from './features/billing/billCheckedOfficeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [billTallyApi.reducerPath]: billTallyApi.reducer,
    [billCheckedApi.reducerPath]: billCheckedApi.reducer, // reducerPath: 'billCheckedApi'
    [billCheckedOfficeApi.reducerPath]: billCheckedOfficeApi.reducer, // reducerPath: 'billCheckedOfficeApi'
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(billTallyApi.middleware)
      .concat(billCheckedApi.middleware)
      .concat(billCheckedOfficeApi.middleware),
});