import { createSlice } from '@reduxjs/toolkit';

interface AuthState { token: string | null; user: any | null; }

const initialState: AuthState = { token: localStorage.getItem('admin_token'), user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: any) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('admin_token', action.payload.token);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('admin_token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
