

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

      // Map backend userType to frontend (अगर जरूरत हो)
      const userTypeMap = {
        Admin: 'admin',
        'Aakash Chouhan': 'Aakash Chouhan',
        'Govind Ram Nagar': 'Govind Ram Nagar',
        'Ashok Sir': 'Ashok Sir',
        'Ravindra Singh': 'Ravindra Singh',
      };

      const frontendUserType = userTypeMap[result.userType] || 'user';

      // sessionStorage में save करो (browser close होते ही delete हो जाएगा)
      sessionStorage.setItem('token', result.token);
      sessionStorage.setItem('userType', frontendUserType);

      return { token: result.token, userType: frontendUserType };
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    // App start पर sessionStorage से load करो
    token: sessionStorage.getItem('token') || null,
    userType: sessionStorage.getItem('userType') || null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.userType = null;
      // sessionStorage से हटाओ
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userType');
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
        state.error = action.payload || 'Login failed';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;