// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import { apiSlice } from './features/api/apiSlice';                    // old generic api
import { billTallyApi } from './features/billing/billTallySlice';       // existing billing api
import { billCheckedApi } from './features/billing/billCheckedSlice';     // NEW: add this

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [billTallyApi.reducerPath]: billTallyApi.reducer,
    [billCheckedApi.reducerPath]: billCheckedApi.reducer,           // ADD THIS
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(billTallyApi.middleware)
      .concat(billCheckedApi.middleware),                           // ADD THIS
});