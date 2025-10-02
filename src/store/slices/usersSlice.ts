import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import endpoints from '@/lib/endpoints';
import type { IUser, IUserWithTeam, UserStatus, UserRole } from '@/types';
import { cache } from '@/utils/cacheUtils';

export const CACHE_PAGE_NAME = 'users_management';

export interface UsersQueryParams {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    role?: string;
    team?: string;
    teamRole?: string;
    append?: boolean; // For infinite scrolling
}

export interface UsersState {
    users: IUserWithTeam[];
    total: number;
    page: number;
    totalPages: number;
    loading: boolean;
    updating: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    error: string | null;
}

const initialState: UsersState = {
    users: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    updating: false,
    loadingMore: false,
    hasMore: true,
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
                role: params.role || '',
                team: params.team || '',
                teamRole: params.teamRole || ''
            };

            // Check cache first (only for non-append requests)
            if (!params.append) {
                const cachedData = cache.get(CACHE_PAGE_NAME, cacheKey);
                if (cachedData) return cachedData;
            }

            const queryParams = new URLSearchParams({
                page: params.page.toString(),
                limit: params.limit.toString(),
                ...(params.search && { search: params.search }),
                ...(params.status && { status: params.status }),
                ...(params.role && { role: params.role }),
                ...(params.team && { team: params.team }),
                ...(params.teamRole && { teamRole: params.teamRole }),
            });

            const response = await api.get(`${endpoints.users.list}?${queryParams.toString()}`);

            const result = {
                users: response.data.data.users,
                total: response.data.data.pagination.total,
                page: response.data.data.pagination.page,
                totalPages: response.data.data.pagination.totalPages,
                append: params.append || false
            };

            // Cache the result (only for non-append requests)
            if (!params.append) {
                cache.set(CACHE_PAGE_NAME, cacheKey, result);
            }

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
        },
        resetUsers: (state) => {
            state.users = [];
            state.page = 1;
            state.hasMore = true;
            state.loading = false;
            state.loadingMore = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Users
            .addCase(getUsers.pending, (state) => {
                if (state.users.length === 0) {
                    state.loading = true;
                } else {
                    state.loadingMore = true;
                }
                state.error = null;
            })
            .addCase(getUsers.fulfilled, (state, action: any) => {
                state.loading = false;
                state.loadingMore = false;
                
                if (action.payload.append) {
                    // Append to existing users for infinite scroll
                    state.users = [...state.users, ...action.payload.users];
                } else {
                    // Replace users for new search/filter
                    state.users = action.payload.users;
                }
                
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.totalPages = action.payload.totalPages;
                state.hasMore = action.payload.page < action.payload.totalPages;
            })
            .addCase(getUsers.rejected, (state, action) => {
                state.loading = false;
                state.loadingMore = false;
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

export const { clearError, clearCache, resetUsers } = usersSlice.actions;
export default usersSlice.reducer;

