import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: false,
  adminData: null,
  error: null,
  loading: false
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminCredentials: (state, action) => {
      state.status = true;
      state.adminData = action.payload;
      state.error = null;
    },
    setAdminError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setAdminLoading: (state, action) => {
      state.loading = action.payload;
    },
    adminLogout: (state) => {
      state.status = false;
      state.adminData = null;
      state.error = null;
    }
  }
});

export const { 
  setAdminCredentials, 
  setAdminError, 
  setAdminLoading, 
  adminLogout 
} = adminSlice.actions;

export const selectAdminStatus = (state) => state.admin.status;
export const selectAdminData = (state) => state.admin.adminData;
export const selectAdminError = (state) => state.admin.error;
export const selectAdminLoading = (state) => state.admin.loading;
export const selectIsAdmin = (state) => state.admin.status;

export default adminSlice.reducer;