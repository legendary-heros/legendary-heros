import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { IUser, IAuthState } from '@/types';
import api from '@/lib/api';
import endpoints from '@/lib/endpoints';

// Async thunks that use configured API utilities
export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try { 
      const response = await api.post(endpoints.auth.signUp, { email, password });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Sign up failed');
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try { 
      const response = await api.post(endpoints.auth.signIn, { email, password });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Sign in failed');
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post(endpoints.auth.signOut);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Sign out failed');
    }
  }
);

export const getSession = createAsyncThunk(
  'auth/getSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(endpoints.auth.getSession);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to get session');
    }
  }
);

const initialState: IAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isPageLoading: false,
  isFormLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.isPageLoading = action.payload;
    },
    setFormLoading: (state, action: PayloadAction<boolean>) => {
      state.isFormLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Sign Up
    builder
      .addCase(signUp.pending, (state) => {
        state.isFormLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isFormLoading = false;
        state.user = action.payload.data?.user as IUser;
        state.isAuthenticated = !!action.payload.data?.user;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isFormLoading = false;
        state.error = (action?.payload as any)?.message || 'Sign up failed';
      });

    // Sign In
    builder
      .addCase(signIn.pending, (state) => {
        state.isFormLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isFormLoading = false;
        state.user = action.payload.data?.user as IUser;
        state.isAuthenticated = !!action.payload.data?.user;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isFormLoading = false;
        state.error = (action?.payload as any)?.message || 'Sign in failed';
      });

    // Sign Out
    builder
      .addCase(signOut.pending, (state) => {
        state.isFormLoading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isFormLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isFormLoading = false;
        state.error = (action?.payload as any)?.message || 'Sign out failed';
      });

    // Get Session
    builder
      .addCase(getSession.pending, (state) => {
        state.isPageLoading = true;
        state.error = null;
      })
      .addCase(getSession.fulfilled, (state, action) => {
        state.isPageLoading = false;
        state.user = action.payload.data?.user as IUser || null;
        state.isAuthenticated = !!action.payload.data?.user;
        state.error = null;
      })
      .addCase(getSession.rejected, (state, action) => {
        state.isPageLoading = false;
        state.error = (action?.payload as any)?.message || 'Failed to get session';
      });
  },
});

export const { setUser, clearError, setLoading, setPageLoading, setFormLoading } = authSlice.actions;
export default authSlice.reducer;
