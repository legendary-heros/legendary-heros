import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import endpoints from '@/lib/endpoints';
import type { IUser, UserStatus, UserRole } from '@/types';
import { cache } from '@/utils/cacheUtils';

export const CACHE_PAGE_NAME = 'users_management';

export interface UsersQueryParams {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    role?: string;
}

export interface UsersState {
    users: Omit<IUser, 'password'>[];
    total: number;
    page: number;
    totalPages: number;
    loading: boolean;
    updating: boolean;
    error: string | null;
}

const initialState: UsersState = {
    users: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    updating: false,
    error: null
};

export const getUsers = createAsyncThunk(
    'users/getAll',
    async (params: UsersQueryParams, { rejectWithValue }) => {
        try {
            const cacheKey = {
                page: params.page,
                limit: params.limit,
                search: params.search || '',
                status: params.status || '',
                role: params.role || ''
            };

            // Check cache first
            const cachedData = cache.get(CACHE_PAGE_NAME, cacheKey);
            if (cachedData) return cachedData;

            const queryParams = new URLSearchParams({
                page: params.page.toString(),
                limit: params.limit.toString(),
                ...(params.search && { search: params.search }),
                ...(params.status && { status: params.status }),
                ...(params.role && { role: params.role }),
            });

            const response = await api.get(`${endpoints.users.list}?${queryParams.toString()}`);

            const result = {
                users: response.data.data.users,
                total: response.data.data.pagination.total,
                page: response.data.data.pagination.page,
                totalPages: response.data.data.pagination.totalPages
            };

            // Cache the result
            cache.set(CACHE_PAGE_NAME, cacheKey, result);

            return result;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch users');
        }
    }
);

export const updateUserStatus = createAsyncThunk(
    'users/updateStatus',
    async ({ userId, status }: { userId: string; status: UserStatus }, { rejectWithValue }) => {
        try {
            const response = await api.patch(endpoints.users.updateStatus(userId), { status });
            // Clear cache after update
            cache.clearByPage(CACHE_PAGE_NAME);
            return { userId, status };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update status');
        }
    }
);

export const updateUserScore = createAsyncThunk(
    'users/updateScore',
    async ({ userId, score }: { userId: string; score: string }, { rejectWithValue }) => {
        try {
            const response = await api.patch(endpoints.users.updateScore(userId), { score });
            // Clear cache after update
            cache.clearByPage(CACHE_PAGE_NAME);
            return { userId, score };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update score');
        }
    }
);

export const updateUserRole = createAsyncThunk(
    'users/updateRole',
    async ({ userId, role }: { userId: string; role: UserRole }, { rejectWithValue }) => {
        try {
            const response = await api.patch(endpoints.users.updateRole(userId), { role });
            // Clear cache after update
            cache.clearByPage(CACHE_PAGE_NAME);
            return { userId, role };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update role');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/delete',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await api.delete(endpoints.users.delete(userId));
            // Clear cache after deletion
            cache.clearByPage(CACHE_PAGE_NAME);
            return userId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete user');
        }
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCache: () => {
            cache.clearByPage(CACHE_PAGE_NAME);
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Users
            .addCase(getUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUsers.fulfilled, (state, action: any) => {
                state.loading = false;
                state.users = action.payload.users;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(getUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Status
            .addCase(updateUserStatus.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateUserStatus.fulfilled, (state, action) => {
                state.updating = false;
                const { userId, status } = action.payload;
                const user = state.users.find(u => u.id === userId);
                if (user) {
                    user.status = status;
                }
            })
            .addCase(updateUserStatus.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload as string;
            })
            // Update Score
            .addCase(updateUserScore.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateUserScore.fulfilled, (state, action) => {
                state.updating = false;
                const { userId, score } = action.payload;
                const user = state.users.find(u => u.id === userId);
                if (user) {
                    user.score = score;
                }
            })
            .addCase(updateUserScore.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload as string;
            })
            // Update Role
            .addCase(updateUserRole.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.updating = false;
                const { userId, role } = action.payload;
                const user = state.users.find(u => u.id === userId);
                if (user) {
                    user.role = role;
                }
            })
            .addCase(updateUserRole.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload as string;
            })
            // Delete User
            .addCase(deleteUser.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.updating = false;
                state.users = state.users.filter(u => u.id !== action.payload);
                state.total = state.total - 1;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearError, clearCache } = usersSlice.actions;
export default usersSlice.reducer;

