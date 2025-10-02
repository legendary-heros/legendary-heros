import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import endpoints from '@/lib/endpoints';
import { cache } from '@/utils/cacheUtils';
import type { 
  ITeamsState, 
  ITeamWithLeader, 
  ITeamMemberWithUser,
  ITeamInvitationWithDetails,
  ITeamJoinRequestWithDetails,
  IApiResponse,
  TeamMemberRole
} from '@/types';

export const CACHE_PAGE_NAME = 'teams_management';

const initialState: ITeamsState = {
  teams: [],
  currentTeam: null,
  myTeam: null,
  teamMembers: [],
  invitations: [],
  joinRequests: [],
  total: 0,
  page: 1,
  totalPages: 0,
  loading: false,
  updating: false,
  error: null,
};

// Async thunks
export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (params: { page?: number; limit?: number; search?: string; status?: string }, { rejectWithValue }) => {
    try {
      const cacheKey = {
        page: params.page || 1,
        limit: params.limit || 12,
        search: params.search || '',
        status: params.status || ''
      };

      // Check cache first
      const cachedData = cache.get(CACHE_PAGE_NAME, cacheKey);
      if (cachedData) return cachedData;

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`${endpoints.teams.list}?${queryParams.toString()}`);
      const result: IApiResponse = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch teams');
      }

      // Cache the result
      cache.set(CACHE_PAGE_NAME, cacheKey, result.data);

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch teams');
    }
  }
);

export const fetchTeam = createAsyncThunk(
  'teams/fetchTeam',
  async (teamId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(endpoints.teams.get(teamId));
      const result: IApiResponse<ITeamWithLeader> = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch team');
      }

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch team');
    }
  }
);

export const fetchMyTeam = createAsyncThunk(
  'teams/fetchMyTeam',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(endpoints.teams.myTeam);
      const result: IApiResponse<ITeamWithLeader> = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch your team');
      }

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch your team');
    }
  }
);

export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData: { 
    name: string; 
    bio?: string; 
    mark_url?: string; 
    ad_url?: string;
    markFile?: File | null;
    adFile?: File | null;
  }, { rejectWithValue }) => {
    try {
      let response;
      
      // If files are provided, use FormData
      if (teamData.markFile || teamData.adFile) {
        const formData = new FormData();
        formData.append('name', teamData.name);
        if (teamData.bio) formData.append('bio', teamData.bio);
        if (teamData.markFile) formData.append('markFile', teamData.markFile);
        if (teamData.adFile) formData.append('adFile', teamData.adFile);
        
        response = await api.post(endpoints.teams.create, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Use JSON for data without files
        response = await api.post(endpoints.teams.create, {
          name: teamData.name,
          bio: teamData.bio,
          mark_url: teamData.mark_url,
          ad_url: teamData.ad_url,
        });
      }
      
      const result: IApiResponse<ITeamWithLeader> = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to create team');
      }

      // Clear cache after creation
      cache.clearByPage(CACHE_PAGE_NAME);

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create team');
    }
  }
);

export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ teamId, teamData }: { 
    teamId: string; 
    teamData: { name?: string; bio?: string; mark_url?: string; ad_url?: string; status?: string } 
  }, { rejectWithValue }) => {
    try {
      const response = await api.patch(endpoints.teams.update(teamId), teamData);
      const result: IApiResponse<ITeamWithLeader> = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to update team');
      }

      // Clear cache after update
      cache.clearByPage(CACHE_PAGE_NAME);

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update team');
    }
  }
);

export const updateTeamScore = createAsyncThunk(
  'teams/updateTeamScore',
  async ({ teamId, score, reason }: { 
    teamId: string; 
    score: number; 
    reason?: string 
  }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`${endpoints.teams.update(teamId)}/score`, { score, reason });
      const result: IApiResponse<ITeamWithLeader> = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to update team score');
      }

      // Clear cache after update
      cache.clearByPage(CACHE_PAGE_NAME);

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update team score');
    }
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (teamId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(endpoints.teams.delete(teamId));
      const result: IApiResponse = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete team');
      }

      // Clear cache after deletion
      cache.clearByPage(CACHE_PAGE_NAME);

      return teamId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete team');
    }
  }
);

export const fetchTeamMembers = createAsyncThunk(
  'teams/fetchTeamMembers',
  async (teamId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(endpoints.teams.members(teamId));
      const result: IApiResponse<ITeamMemberWithUser[]> = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch team members');
      }

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch team members');
    }
  }
);

export const removeTeamMember = createAsyncThunk(
  'teams/removeTeamMember',
  async ({ teamId, userId }: { teamId: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`${endpoints.teams.members(teamId)}?userId=${userId}`);
      const result: IApiResponse = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to remove team member');
      }

      // Clear cache after member removal
      cache.clearByPage(CACHE_PAGE_NAME);

      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to remove team member');
    }
  }
);

export const updateTeamMemberRole = createAsyncThunk(
  'teams/updateTeamMemberRole',
  async ({ teamId, memberId, role }: { teamId: string; memberId: string; role: TeamMemberRole }, { rejectWithValue }) => {
    try {
      const response = await api.patch(endpoints.teams.members(teamId), { memberId, role });
      const result: IApiResponse = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to update member role');
      }

      // Clear cache after role update
      cache.clearByPage(CACHE_PAGE_NAME);

      return { memberId, role };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update member role');
    }
  }
);

export const fetchInvitations = createAsyncThunk(
  'teams/fetchInvitations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(endpoints.teams.invitations);
      const result: IApiResponse<ITeamInvitationWithDetails[]> = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch invitations');
      }

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch invitations');
    }
  }
);

export const sendInvitation = createAsyncThunk(
  'teams/sendInvitation',
  async ({ teamId, inviteeId }: { teamId: string; inviteeId: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(endpoints.teams.invitations, { team_id: teamId, invitee_id: inviteeId });
      const result: IApiResponse<ITeamInvitationWithDetails> = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to send invitation');
      }

      // Clear cache after sending invitation
      cache.clearByPage(CACHE_PAGE_NAME);

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to send invitation');
    }
  }
);

export const respondToInvitation = createAsyncThunk(
  'teams/respondToInvitation',
  async ({ invitationId, action }: { invitationId: string; action: 'accept' | 'reject' }, { rejectWithValue }) => {
    try {
      const response = await api.patch(endpoints.teams.invitation(invitationId), { action });
      const result: IApiResponse<ITeamInvitationWithDetails> = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to respond to invitation');
      }

      // Clear cache after responding to invitation
      cache.clearByPage(CACHE_PAGE_NAME);

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to respond to invitation');
    }
  }
);

export const fetchJoinRequests = createAsyncThunk(
  'teams/fetchJoinRequests',
  async (teamId: string | undefined, { rejectWithValue }) => {
    try {
      const url = teamId ? `${endpoints.teams.joinRequests}?teamId=${teamId}` : endpoints.teams.joinRequests;
      const response = await api.get(url);
      const result: IApiResponse<ITeamJoinRequestWithDetails[]> = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch join requests');
      }

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch join requests');
    }
  }
);

export const createJoinRequest = createAsyncThunk(
  'teams/createJoinRequest',
  async ({ teamId, message }: { teamId: string; message?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(endpoints.teams.joinRequests, { team_id: teamId, message });
      const result: IApiResponse<ITeamJoinRequestWithDetails> = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to create join request');
      }

      // Clear cache after creating join request
      cache.clearByPage(CACHE_PAGE_NAME);

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create join request');
    }
  }
);

export const respondToJoinRequest = createAsyncThunk(
  'teams/respondToJoinRequest',
  async ({ requestId, action }: { requestId: string; action: 'approve' | 'reject' }, { rejectWithValue }) => {
    try {
      const response = await api.patch(endpoints.teams.joinRequest(requestId), { action });
      const result: IApiResponse<ITeamJoinRequestWithDetails> = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to respond to join request');
      }

      // Clear cache after responding to join request
      cache.clearByPage(CACHE_PAGE_NAME);

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to respond to join request');
    }
  }
);

export const uploadTeamImage = createAsyncThunk(
  'teams/uploadTeamImage',
  async ({ teamId, file, imageType }: { teamId: string; file: File; imageType: 'mark' | 'ad' }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', imageType);

      const response = await api.post(endpoints.teams.uploadImage(teamId), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result: IApiResponse<ITeamWithLeader> = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to upload team image');
      }

      // Clear cache after image upload
      cache.clearByPage(CACHE_PAGE_NAME);

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to upload team image');
    }
  }
);

// Slice
const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearTeamsError: (state) => {
      state.error = null;
    },
    clearCurrentTeam: (state) => {
      state.currentTeam = null;
      state.teamMembers = [];
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    clearCache: () => {
      cache.clearByPage(CACHE_PAGE_NAME);
    },
  },
  extraReducers: (builder) => {
    // Fetch teams
    builder.addCase(fetchTeams.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTeams.fulfilled, (state, action) => {
      state.loading = false;
      state.teams = action.payload.teams;
      state.total = action.payload.pagination.total;
      state.page = action.payload.pagination.page;
      state.totalPages = action.payload.pagination.totalPages;
    });
    builder.addCase(fetchTeams.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to fetch teams';
    });

    // Fetch team
    builder.addCase(fetchTeam.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTeam.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTeam = action.payload;
    });
    builder.addCase(fetchTeam.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to fetch team';
    });

    // Fetch my team
    builder.addCase(fetchMyTeam.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMyTeam.fulfilled, (state, action) => {
      state.loading = false;
      state.myTeam = action.payload;
    });
    builder.addCase(fetchMyTeam.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to fetch your team';
    });

    // Create team
    builder.addCase(createTeam.pending, (state) => {
      state.updating = true;
      state.error = null;
    });
    builder.addCase(createTeam.fulfilled, (state, action) => {
      state.updating = false;
      state.myTeam = action.payload;
    });
    builder.addCase(createTeam.rejected, (state, action) => {
      state.updating = false;
      state.error = action.payload as string || 'Failed to create team';
    });

    // Update team
    builder.addCase(updateTeam.pending, (state) => {
      state.updating = true;
      state.error = null;
    });
    builder.addCase(updateTeam.fulfilled, (state, action) => {
      state.updating = false;
      if (state.currentTeam?.id === action.payload?.id) {
        state.currentTeam = action.payload;
      }
      if (state.myTeam?.id === action.payload?.id) {
        state.myTeam = action.payload;
      }
    });
    builder.addCase(updateTeam.rejected, (state, action) => {
      state.updating = false;
      state.error = action.payload as string || 'Failed to update team';
    });
    builder.addCase(updateTeamScore.pending, (state) => {
      state.updating = true;
      state.error = null;
    });
    builder.addCase(updateTeamScore.fulfilled, (state, action) => {
      state.updating = false;
      if (state.currentTeam?.id === action.payload?.id) {
        state.currentTeam = action.payload;
      }
      if (state.myTeam?.id === action.payload?.id) {
        state.myTeam = action.payload;
      }
    });
    builder.addCase(updateTeamScore.rejected, (state, action) => {
      state.updating = false;
      state.error = action.payload as string || 'Failed to update team score';
    });

    // Delete team
    builder.addCase(deleteTeam.pending, (state) => {
      state.updating = true;
      state.error = null;
    });
    builder.addCase(deleteTeam.fulfilled, (state, action) => {
      state.updating = false;
      if (state.currentTeam?.id === action.payload) {
        state.currentTeam = null;
      }
      if (state.myTeam?.id === action.payload) {
        state.myTeam = null;
      }
      state.teams = state.teams.filter(team => team.id !== action.payload);
    });
    builder.addCase(deleteTeam.rejected, (state, action) => {
      state.updating = false;
      state.error = action.payload as string || 'Failed to delete team';
    });

    // Fetch team members
    builder.addCase(fetchTeamMembers.fulfilled, (state, action) => {
      state.teamMembers = action.payload || [];
    });

    // Remove team member
    builder.addCase(removeTeamMember.fulfilled, (state, action) => {
      state.teamMembers = state.teamMembers.filter(member => member.user_id !== action.payload);
    });

    // Update team member role
    builder.addCase(updateTeamMemberRole.fulfilled, (state, action) => {
      const { memberId, role } = action.payload;
      const member = state.teamMembers.find(m => m.id === memberId);
      if (member) {
        member.role = role;
      }
    });

    // Fetch invitations
    builder.addCase(fetchInvitations.fulfilled, (state, action) => {
      state.invitations = action.payload || [];
    });

    // Respond to invitation
    builder.addCase(respondToInvitation.fulfilled, (state, action) => {
      state.invitations = state.invitations.filter(inv => inv.id !== action.payload?.id);
    });

    // Fetch join requests
    builder.addCase(fetchJoinRequests.fulfilled, (state, action) => {
      state.joinRequests = action.payload || [];
    });

    // Respond to join request
    builder.addCase(respondToJoinRequest.fulfilled, (state, action) => {
      state.joinRequests = state.joinRequests.filter(req => req.id !== action.payload?.id);
    });

    // Upload team image
    builder.addCase(uploadTeamImage.pending, (state) => {
      state.updating = true;
      state.error = null;
    });
    builder.addCase(uploadTeamImage.fulfilled, (state, action) => {
      state.updating = false;
      if (state.currentTeam?.id === action.payload?.id) {
        state.currentTeam = action.payload;
      }
      if (state.myTeam?.id === action.payload?.id) {
        state.myTeam = action.payload;
      }
    });
    builder.addCase(uploadTeamImage.rejected, (state, action) => {
      state.updating = false;
      state.error = action.payload as string || 'Failed to upload team image';
    });
  },
});

export const { clearTeamsError, clearCurrentTeam, setPage, clearCache } = teamsSlice.actions;

export default teamsSlice.reducer;

