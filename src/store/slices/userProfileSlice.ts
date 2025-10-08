import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import endpoints from '@/lib/endpoints';
import type { IUser } from '@/types';
import { cache } from '@/utils/cacheUtils';
import { CACHE_PAGE_NAME as USERS_CACHE_PAGE_NAME } from './usersSlice';

export const CACHE_PAGE_NAME = 'user_profile';

export interface UserProfileState {
    user: IUser | null;
    loading: boolean;
    voting: boolean;
    hasVoted: boolean;
    checkingVote: boolean;
    error: string | null;
}

const initialState: UserProfileState = {
    user: null,
    loading: false,
    voting: false,
    hasVoted: false,
    checkingVote: false,
    error: null
};

export const getUserByUsername = createAsyncThunk(
    'userProfile/getByUsername',
    async (username: string, { rejectWithValue }) => {
        try {
            const cacheKey = { username };

            // Check cache first
            const cachedData = cache.get(CACHE_PAGE_NAME, cacheKey);
            if (cachedData) return cachedData;

            const response = await api.get(endpoints.users.getByUsername(username));

            if (response.data.success && response.data.data) {
                const result = response.data.data;
                // Cache the result
                cache.set(CACHE_PAGE_NAME, cacheKey, result);
                return result;
            } else {
                return rejectWithValue('User not found');
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch user profile');
        }
    }
);

export const checkVoteStatus = createAsyncThunk(
    'userProfile/checkVote',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(endpoints.users.checkVote(userId));
            
            if (response.data.success) {
                return response.data.data.hasVoted;
            } else {
                return false;
            }
        } catch (error: any) {
            // If not authenticated or error, return false
            return false;
        }
    }
);

export const voteUser = createAsyncThunk(
    'userProfile/vote',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await api.post(endpoints.users.vote(userId));
            
            // Clear cache after voting to get updated data
            cache.clearByPage(CACHE_PAGE_NAME);
            cache.clearByPage(USERS_CACHE_PAGE_NAME)
            
            if (response.data.success && response.data.data) {
                return response.data.data;
            } else {
                return rejectWithValue('Failed to vote');
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to vote for user');
        }
    }
);

const userProfileSlice = createSlice({
    name: 'userProfile',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearProfile: (state) => {
            state.user = null;
            state.error = null;
            state.hasVoted = false;
        },
        clearCache: () => {
            cache.clearByPage(CACHE_PAGE_NAME);
        }
    },
    extraReducers: (builder) => {
        builder
            // Get User by Username
            .addCase(getUserByUsername.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserByUsername.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(getUserByUsername.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.user = null;
            })
            // Vote User
            .addCase(voteUser.pending, (state) => {
                state.voting = true;
                state.error = null;
            })
            .addCase(voteUser.fulfilled, (state, action) => {
                state.voting = false;
                state.hasVoted = true; // Mark as voted
                // Update the user data with new vote count and score
                if (state.user) {
                    state.user = action.payload;
                }
            })
            .addCase(voteUser.rejected, (state, action) => {
                state.voting = false;
            })
            // Check Vote Status
            .addCase(checkVoteStatus.pending, (state) => {
                state.checkingVote = true;
            })
            .addCase(checkVoteStatus.fulfilled, (state, action) => {
                state.checkingVote = false;
                state.hasVoted = action.payload;
            })
            .addCase(checkVoteStatus.rejected, (state) => {
                state.checkingVote = false;
                state.hasVoted = false;
            });
    }
});

export const { clearError, clearProfile, clearCache } = userProfileSlice.actions;
export default userProfileSlice.reducer;

