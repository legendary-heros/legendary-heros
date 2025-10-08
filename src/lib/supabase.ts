import { createClient } from '@supabase/supabase-js';
import type { 
  IDatabase, 
  IUserDB, 
  IUserInsert, 
  IUserUpdate,
  ITeamInsert,
  ITeamUpdate,
  ITeamMemberInsert,
  ITeamMemberUpdate,
  ITeamInvitationInsert,
  ITeamJoinRequestInsert,
  TeamMemberRole
} from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<IDatabase>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database helpers for custom authentication
export const db = {
  // Users
  getUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  getUsersWithPagination: async (params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    role?: string;
  }) => {
    const { page, limit, search, status, role } = params;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search && search.trim()) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply role filter
    if (role) {
      query = query.eq('role', role);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    
    return { data, error, count };
  },

  getUsersWithPaginationAndTeams: async (params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    role?: string;
    sortBy?: string;
  }) => {
    const { page, limit, search, status, role, sortBy } = params;
    const offset = (page - 1) * limit;

    // Get users with pagination
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search && search.trim()) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply role filter
    if (role) {
      query = query.eq('role', role);
    }

    // Apply sorting and pagination
    if (sortBy === 'score') {
      query = query
        .order('score', { ascending: false })
        .range(offset, offset + limit - 1);
    } else {
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    }

    const { data: users, error, count } = await query;
    
    if (error || !users) {
      return { data: null, error, count };
    }

    // For each user, get their team information
    const usersWithTeams = await Promise.all(
      users.map(async (user: any) => {
        // Type assertion to help TypeScript understand the user structure
        const userData = user as IUserDB;
        
        // Check if user is a team leader
        const { data: leaderTeam } = await supabase
          .from('teams')
          .select(`
            *,
            leader:users!teams_leader_id_fkey(*)
          `)
          .eq('leader_id', userData.id)
          .maybeSingle();

        if (leaderTeam) {
          // Type assertion for leaderTeam
          const teamData = leaderTeam as any;
          return {
            ...userData,
            team_members: [{
              team: teamData,
              role: 'leader',
              joined_at: teamData.created_at
            }]
          };
        }

        // If not a leader, check if user is a team member
        const { data: memberData } = await supabase
          .from('team_members')
          .select(`
            *,
            team:teams(
              *,
              leader:users!teams_leader_id_fkey(*)
            )
          `)
          .eq('user_id', userData.id)
          .maybeSingle();

        return {
          ...userData,
          team_members: memberData ? [memberData] : []
        };
      })
    );

    return { data: usersWithTeams, error: null, count };
  },
  
  getUser: async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  },

  getUserByEmail: async (email: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    return { data, error };
  },

  getUserByUsername: async (username: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    return { data, error };
  },

  getUserByUsernameWithTeam: async (username: string) => {
    // First, get the user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return { data: null, error: userError };
    }

    // Type assertion to help TypeScript understand the user structure
    const userData = user as IUserDB;

    // Check if user is a team leader
    const { data: leaderTeam, error: leaderError } = await supabase
      .from('teams')
      .select(`
        *,
        leader:users!teams_leader_id_fkey(*)
      `)
      .eq('leader_id', userData.id)
      .maybeSingle();

    if (leaderError) {
      return { data: null, error: leaderError };
    }

    // If user is a leader, return with team info
    if (leaderTeam) {
      // Type assertion for leaderTeam
      const teamData = leaderTeam as any;
      return {
        data: {
          ...userData,
          team_members: [{
            team: teamData,
            role: 'leader',
            joined_at: teamData.created_at
          }]
        },
        error: null
      };
    }

    // If not a leader, check if user is a team member
    const { data: memberData, error: memberError } = await supabase
      .from('team_members')
      .select(`
        *,
        team:teams(
          *,
          leader:users!teams_leader_id_fkey(*)
        )
      `)
      .eq('user_id', userData.id)
      .maybeSingle();

    if (memberError) {
      return { data: null, error: memberError };
    }

    // Return user with team member info or no team
    return {
      data: {
        ...userData,
        team_members: memberData ? [memberData] : []
      },
      error: null
    };
  },

  getUserWithTeam: async (id: string) => {
    // First, get the user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return { data: null, error: userError };
    }

    // Type assertion to help TypeScript understand the user structure
    const userData = user as IUserDB;

    // Check if user is a team leader
    const { data: leaderTeam, error: leaderError } = await supabase
      .from('teams')
      .select(`
        *,
        leader:users!teams_leader_id_fkey(*)
      `)
      .eq('leader_id', userData.id)
      .maybeSingle();

    if (leaderError) {
      return { data: null, error: leaderError };
    }

    // If user is a leader, return with team info
    if (leaderTeam) {
      // Type assertion for leaderTeam
      const teamData = leaderTeam as any;
      return {
        data: {
          ...userData,
          team_members: [{
            team: teamData,
            role: 'leader',
            joined_at: teamData.created_at
          }]
        },
        error: null
      };
    }

    // If not a leader, check if user is a team member
    const { data: memberData, error: memberError } = await supabase
      .from('team_members')
      .select(`
        *,
        team:teams(
          *,
          leader:users!teams_leader_id_fkey(*)
        )
      `)
      .eq('user_id', userData.id)
      .maybeSingle();

    if (memberError) {
      return { data: null, error: memberError };
    }

    // Return user with team member info or no team
    return {
      data: {
        ...userData,
        team_members: memberData ? [memberData] : []
      },
      error: null
    };
  },
  
  createUser: async (userData: IUserInsert) => {
    const { data, error } = await supabase
      .from('users')
      // @ts-ignore - Type compatibility issue with Supabase strict typing
      .insert(userData)
      .select()
      .single();
    
    return { data, error };
  },
  
  updateUser: async (id: string, userData: IUserUpdate) => {
    const { data, error } = await supabase
      .from('users')
      // @ts-ignore - Type compatibility issue with Supabase strict typing
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },
  
  deleteUser: async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    return { data, error };
  },

  // Votes
  checkVote: async (voterId: string, votedForId: string) => {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('voter_id', voterId)
      .eq('voted_for_id', votedForId)
      .maybeSingle();
    
    return { data, error };
  },

  createVote: async (voterId: string, votedForId: string) => {
    const { data, error } = await supabase
      .from('votes')
      // @ts-ignore - Type compatibility issue with Supabase strict typing
      .insert({
        voter_id: voterId,
        voted_for_id: votedForId
      })
      .select()
      .single();
    
    return { data, error };
  },

  getVotesByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('votes')
      .select('voted_for_id')
      .eq('voter_id', userId);
    
    return { data, error };
  },

  getVotesForUser: async (userId: string) => {
    const { data, error, count } = await supabase
      .from('votes')
      .select('*', { count: 'exact' })
      .eq('voted_for_id', userId);
    
    return { data, error, count };
  },

  // Teams
  getTeams: async () => {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        leader:users!teams_leader_id_fkey(*)
      `)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  getTeamsWithPagination: async (params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
  }) => {
    const { page, limit, search, status } = params;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('teams')
      .select(`
        *,
        leader:users!teams_leader_id_fkey(*)
      `, { count: 'exact' });

    if (search && search.trim()) {
      query = query.ilike('name', `%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    
    return { data, error, count };
  },

  getTeam: async (id: string) => {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        leader:users!teams_leader_id_fkey(*)
      `)
      .eq('id', id)
      .single();
    
    return { data, error };
  },

  getTeamBySlug: async (slug: string) => {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        leader:users!teams_leader_id_fkey(*)
      `)
      .eq('slug', slug)
      .single();
    
    return { data, error };
  },

  getTeamByLeaderId: async (leaderId: string) => {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        leader:users!teams_leader_id_fkey(*)
      `)
      .eq('leader_id', leaderId)
      .maybeSingle();
    
    return { data, error };
  },

  createTeam: async (teamData: ITeamInsert) => {
    const { data, error } = await supabase
      .from('teams')
      // @ts-ignore
      .insert(teamData)
      .select(`
        *,
        leader:users!teams_leader_id_fkey(*)
      `)
      .single();
    
    return { data, error };
  },

  updateTeam: async (id: string, teamData: ITeamUpdate) => {
    const { data, error } = await supabase
      .from('teams')
      // @ts-ignore
      .update(teamData)
      .eq('id', id)
      .select(`
        *,
        leader:users!teams_leader_id_fkey(*)
      `)
      .single();
    
    return { data, error };
  },

  deleteTeam: async (id: string) => {
    const { data, error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);
    
    return { data, error };
  },

  // Team Members
  getTeamMembers: async (teamId: string) => {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        user:users(*)
      `)
      .eq('team_id', teamId)
      .order('joined_at', { ascending: false });
    
    return { data, error };
  },

  getTeamMember: async (teamId: string, userId: string) => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .maybeSingle();
    
    return { data, error };
  },

  getUserTeams: async (userId: string) => {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        team:teams(
          *,
          leader:users!teams_leader_id_fkey(*)
        )
      `)
      .eq('user_id', userId);
    
    return { data, error };
  },

  addTeamMember: async (memberData: ITeamMemberInsert) => {
    const { data, error } = await supabase
      .from('team_members')
      // @ts-ignore
      .insert(memberData)
      .select(`
        *,
        user:users(*)
      `)
      .single();
    
    return { data, error };
  },

  updateTeamMember: async (id: string, memberData: ITeamMemberUpdate) => {
    const { data, error } = await supabase
      .from('team_members')
      // @ts-ignore
      .update(memberData)
      .eq('id', id)
      .select(`
        *,
        user:users(*)
      `)
      .single();
    
    return { data, error };
  },

  removeTeamMember: async (teamId: string, userId: string) => {
    const { data, error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);
    
    return { data, error };
  },

  // Update team member role
  updateTeamMemberRole: async (memberId: string, role: TeamMemberRole) => {
    const { data, error } = await supabase
      .from('team_members')
      // @ts-ignore - Type compatibility issue with Supabase strict typing
      .update({ role })
      .eq('id', memberId);
    
    return { data, error };
  },

  // Team Invitations
  getTeamInvitations: async (teamId: string) => {
    const { data, error } = await supabase
      .from('team_invitations')
      .select(`
        *,
        team:teams(*),
        inviter:users!team_invitations_inviter_id_fkey(*),
        invitee:users!team_invitations_invitee_id_fkey(*)
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  getUserInvitations: async (userId: string) => {
    const { data, error } = await supabase
      .from('team_invitations')
      .select(`
        *,
        team:teams(
          *,
          leader:users!teams_leader_id_fkey(*)
        ),
        inviter:users!team_invitations_inviter_id_fkey(*),
        invitee:users!team_invitations_invitee_id_fkey(*)
      `)
      .eq('invitee_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  getInvitation: async (id: string) => {
    const { data, error } = await supabase
      .from('team_invitations')
      .select(`
        *,
        team:teams(*),
        inviter:users!team_invitations_inviter_id_fkey(*),
        invitee:users!team_invitations_invitee_id_fkey(*)
      `)
      .eq('id', id)
      .single();
    
    return { data, error };
  },

  checkExistingInvitation: async (teamId: string, inviteeId: string) => {
    const { data, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('team_id', teamId)
      .eq('invitee_id', inviteeId)
      .eq('status', 'pending')
      .maybeSingle();
    
    return { data, error };
  },

  createInvitation: async (invitationData: ITeamInvitationInsert) => {
    const { data, error } = await supabase
      .from('team_invitations')
      // @ts-ignore
      .insert(invitationData)
      .select(`
        *,
        team:teams(*),
        inviter:users!team_invitations_inviter_id_fkey(*),
        invitee:users!team_invitations_invitee_id_fkey(*)
      `)
      .single();
    
    return { data, error };
  },

  updateInvitationStatus: async (id: string, status: 'accepted' | 'rejected') => {
    const { data, error } = await supabase
      .from('team_invitations')
      // @ts-ignore - Type compatibility issue with Supabase strict typing
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        team:teams(*),
        inviter:users!team_invitations_inviter_id_fkey(*),
        invitee:users!team_invitations_invitee_id_fkey(*)
      `)
      .single();
    
    return { data, error };
  },

  // Team Join Requests
  getTeamJoinRequests: async (teamId: string) => {
    const { data, error } = await supabase
      .from('team_join_requests')
      .select(`
        *,
        team:teams(*),
        user:users(*)
      `)
      .eq('team_id', teamId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  getUserJoinRequests: async (userId: string) => {
    const { data, error } = await supabase
      .from('team_join_requests')
      .select(`
        *,
        team:teams(
          *,
          leader:users!teams_leader_id_fkey(*)
        ),
        user:users(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  getJoinRequest: async (id: string) => {
    const { data, error } = await supabase
      .from('team_join_requests')
      .select(`
        *,
        team:teams(*),
        user:users(*)
      `)
      .eq('id', id)
      .single();
    
    return { data, error };
  },

  checkExistingJoinRequest: async (teamId: string, userId: string) => {
    const { data, error } = await supabase
      .from('team_join_requests')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .maybeSingle();
    
    return { data, error };
  },

  createJoinRequest: async (requestData: ITeamJoinRequestInsert) => {
    const { data, error } = await supabase
      .from('team_join_requests')
      // @ts-ignore
      .insert(requestData)
      .select(`
        *,
        team:teams(*),
        user:users(*)
      `)
      .single();
    
    return { data, error };
  },

  updateJoinRequestStatus: async (id: string, status: 'approved' | 'rejected') => {
    const { data, error } = await supabase
      .from('team_join_requests')
      // @ts-ignore - Type compatibility issue with Supabase strict typing
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        team:teams(*),
        user:users(*)
      `)
      .single();
    
    return { data, error };
  },
};

// Storage helpers
export const storage = {
  uploadFile: async (bucket: string, path: string, file: File) => {
    return await supabase.storage.from(bucket).upload(path, file);
  },
  
  downloadFile: async (bucket: string, path: string) => {
    return await supabase.storage.from(bucket).download(path);
  },
  
  deleteFile: async (bucket: string, path: string) => {
    return await supabase.storage.from(bucket).remove([path]);
  },
  
  getPublicUrl: (bucket: string, path: string) => {
    return supabase.storage.from(bucket).getPublicUrl(path);
  },
};
