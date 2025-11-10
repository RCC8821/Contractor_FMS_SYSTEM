// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import { apiSlice } from './features/api/apiSlice';
import { billTallyApi } from './features/billing/billTallySlice';
import { billCheckedApi } from './features/billing/billCheckedSlice'; // ADD

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [billTallyApi.reducerPath]: billTallyApi.reducer,
    [billCheckedApi.reducerPath]: billCheckedApi.reducer, // ADD
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(billTallyApi.middleware)
      .concat(billCheckedApi.middleware), // ADD
});