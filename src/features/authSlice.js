// authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: false,
  user: null,
  token: null,
  role: null, // 'user' or 'admin'
  error: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.role = user.role; // Set role based on user data
      state.status = true;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.status = false;
      state.user = null;
      state.token = null;
      state.role = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const { setCredentials, setError, setLoading, logout } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.status;
export const selectUserRole = (state) => state.auth.role;
export const selectIsAdmin = (state) => state.auth.role === 'admin';
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer;
