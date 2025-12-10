// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async Thunk for Login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Login failed');
      }

      // Map backend userType to frontend
      const userTypeMap = {
        Admin: 'admin',
        'Aakash Chouhan': 'Aakash Chouhan',
        'Govind Ram Nagar':'Govind Ram Nagar'
      };

      const frontendUserType = userTypeMap[result.userType] || 'user';

      // Save to localStorage
      localStorage.setItem('token', result.token);
      localStorage.setItem('userType', frontendUserType);

      return { token: result.token, userType: frontendUserType };
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    userType: localStorage.getItem('userType') || null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.userType = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
    },
    clearError: (state) => {
      state.error = null; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.userType = action.payload.userType;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout,clearError } = authSlice.actions;
export default authSlice.reducer;