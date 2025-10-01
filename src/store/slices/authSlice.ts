import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { IUser, IAuthState } from '@/types';
import api from '@/lib/api';
import endpoints from '@/lib/endpoints';

// Async thunks that use configured API utilities
export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, username }: { email: string; password: string; username: string }, { rejectWithValue }) => {
    try { 
      const response = await api.post(endpoints.auth.signUp, { email, password, username });
      // Store token in localStorage
      if (response.data.data?.token) {
        localStorage.setItem('legendary_token', response.data.data.token);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Sign up failed');
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ identifier, password }: { identifier: string; password: string }, { rejectWithValue }) => {
    try { 
      const response = await api.post(endpoints.auth.signIn, { identifier, password });
      // Store token in localStorage
      if (response.data.data?.token) {
        localStorage.setItem('legendary_token', response.data.data.token);
      }
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
      // Remove token from localStorage
      localStorage.removeItem('legendary_token');
      return response.data;
    } catch (error: any) {
      // Even if the request fails, remove the token
      localStorage.removeItem('legendary_token');
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
      // If session check fails, remove token
      localStorage.removeItem('legendary_token');
      return rejectWithValue(error.response?.data || 'Failed to get session');
    }
  }
);

// Check token and authenticate user on app startup
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { getState, dispatch }) => {
    const state = getState() as { auth: IAuthState };
    const token = state.auth.token;
    
    if (token) {
      try {
        // If token exists, fetch user information
        return await dispatch(getSession()).unwrap();
      } catch (error) {
        // If token is invalid, logout
        dispatch(logout());
        return null;
      }
    }
    return null;
  }
);

const initialState: IAuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('legendary_token') : null,
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
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('legendary_token');
      }
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
        state.token = action.payload.data?.token;
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
        state.token = action.payload.data?.token;
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
        state.token = null;
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
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = (action?.payload as any)?.message || 'Failed to get session';
      });

    // Check Auth Status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isPageLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state) => {
        state.isPageLoading = false;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isPageLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { setUser, logout, clearError, setLoading, setPageLoading, setFormLoading } = authSlice.actions;
export default authSlice.reducer;
