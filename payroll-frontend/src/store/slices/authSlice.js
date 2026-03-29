import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const signup = createAsyncThunk('auth/signup', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/signup', userData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Signup failed');
  }
});

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  try { await api.post('/auth/logout'); } catch {}
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
    extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(signup.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .addMatcher(
        (action) => action.type === login.fulfilled.type || action.type === signup.fulfilled.type,
        (state, action) => {
          state.loading = false;
          state.token = action.payload.accessToken;
          state.user = {
            id: action.payload.userId,
            name: action.payload.name,
            email: action.payload.email,
            role: action.payload.role,
            employeeId: action.payload.employeeId,
            employeeCode: action.payload.employeeCode,
          };
          localStorage.setItem('token', action.payload.accessToken);
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      )
      .addMatcher(
        (action) => action.type === login.rejected.type || action.type === signup.rejected.type,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
