// Enums
export type UserStatus = 'allow' | 'waiting' | 'block';
export type UserRole = 'superadmin' | 'admin' | 'leader' | 'member';
export type TeamStatus = 'waiting' | 'approved' | 'blocked';
export type TeamMemberRole = 'leader' | 'Orb Hero' | 'King Creep' | 'Bird Buyer' | 'Bounty';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected';
export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

// Database user type (includes password)
export interface IUserDB {
  id: string;
  email: string;
  password: string;
  username: string;
  slackname?: string | null;
  dotaname?: string | null;
  status: UserStatus;
  role: UserRole;
  score: string;
  vote_count: string;
  bio?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

// Client user type (excludes password)
export interface IUser {
  id: string;
  email: string;
  username: string;
  slackname?: string | null;
  dotaname?: string | null;
  status: UserStatus;
  role: UserRole;
  score: string;
  vote_count: string;
  bio?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

// User with team information
export interface IUserWithTeam extends IUser {
  team?: {
    team: ITeamWithLeader;
    role: TeamMemberRole;
    joined_at: string;
  } | null;
}

export interface IUserInsert {
  email: string;
  password: string;
  username: string;
  slackname?: string;
  dotaname?: string;
  status?: UserStatus;
  role?: UserRole;
  score?: string;
  vote_count?: string;
  bio?: string;
}

export interface IUserUpdate {
  email?: string;
  password?: string;
  username?: string;
  slackname?: string;
  dotaname?: string;
  status?: UserStatus;
  role?: UserRole;
  score?: string;
  vote_count?: string;
  bio?: string;
  avatar_url?: string;
}

export interface IVote {
  id: string;
  voter_id: string;
  voted_for_id: string;
  created_at: string;
}

export interface IVoteInsert {
  voter_id: string;
  voted_for_id: string;
}

// Redux store types
export interface IRootState {
  auth: IAuthState;
  users: IUsersState;
  userProfile: IUserProfileState;
  teams: ITeamsState;
  // Add other slice states here
}

export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPageLoading: boolean;
  isFormLoading: boolean;
  error: string | null;
}

export interface IUsersState {
  users: Omit<IUser, 'password'>[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  updating: boolean;
  error: string | null;
}

export interface IUserProfileState {
  user: IUser | null;
  loading: boolean;
  voting: boolean;
  hasVoted: boolean;
  checkingVote: boolean;
  error: string | null;
}

export interface ITeamsState {
  teams: ITeamWithLeader[];
  currentTeam: ITeamWithLeader | null;
  myTeam: ITeamWithLeader | null;
  teamMembers: ITeamMemberWithUser[];
  invitations: ITeamInvitationWithDetails[];
  joinRequests: ITeamJoinRequestWithDetails[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  updating: boolean;
  error: string | null;
}

// API response types
export interface IApiResponse<T = any> {
  data: T | null;
  message: string | null;
  success: boolean;
}

// Form types
export interface ILoginForm {
  identifier: string; // Can be email or username
  password: string;
}

export interface ISignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

export interface IProfileForm {
  username: string;
  email: string;
  slackname?: string;
  dotaname?: string;
  bio?: string;
  password?: string;
  confirmPassword?: string;
}

// Team types
export interface ITeam {
  id: string;
  name: string;
  slug: string;
  mark_url?: string | null;
  ad_url?: string | null;
  bio?: string | null;
  leader_id: string;
  status: TeamStatus;
  score: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface ITeamWithLeader extends ITeam {
  leader: IUser;
}

export interface ITeamInsert {
  name: string;
  slug: string;
  mark_url?: string;
  ad_url?: string;
  bio?: string;
  leader_id: string;
  status?: TeamStatus;
}

export interface ITeamUpdate {
  name?: string;
  slug?: string;
  mark_url?: string;
  ad_url?: string;
  bio?: string;
  status?: TeamStatus;
  score?: string;
}

export interface ITeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamMemberRole;
  joined_at: string;
}

export interface ITeamMemberWithUser extends ITeamMember {
  user: IUser;
}

export interface ITeamMemberInsert {
  team_id: string;
  user_id: string;
  role?: TeamMemberRole;
}

export interface ITeamMemberUpdate {
  role?: TeamMemberRole;
}

export interface ITeamInvitation {
  id: string;
  team_id: string;
  inviter_id: string;
  invitee_id: string;
  status: InvitationStatus;
  created_at: string;
  updated_at: string;
}

export interface ITeamInvitationWithDetails extends ITeamInvitation {
  team: ITeam;
  inviter: IUser;
  invitee: IUser;
}

export interface ITeamInvitationInsert {
  team_id: string;
  inviter_id: string;
  invitee_id: string;
}

export interface ITeamJoinRequest {
  id: string;
  team_id: string;
  user_id: string;
  status: JoinRequestStatus;
  message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ITeamJoinRequestWithDetails extends ITeamJoinRequest {
  team: ITeam;
  user: IUser;
}

export interface ITeamJoinRequestInsert {
  team_id: string;
  user_id: string;
  message?: string;
}

export interface ITeamForm {
  name: string;
  bio?: string;
  mark?: File | null;
  ad?: File | null;
}

// Level types
export interface TeamLevel {
  name: string;
  tier: string;
  stars: number;
  description: string;
  color: string;
  textColor: string;
  bgColor: string;
}

// Extended database interface
export interface IDatabase {
  public: {
    Tables: {
      users: {
        Row: IUserDB;
        Insert: IUserInsert;
        Update: IUserUpdate;
      };
      votes: {
        Row: IVote;
        Insert: IVoteInsert;
        Update: never;
      };
      teams: {
        Row: ITeam;
        Insert: ITeamInsert;
        Update: ITeamUpdate;
      };
      team_members: {
        Row: ITeamMember;
        Insert: ITeamMemberInsert;
        Update: ITeamMemberUpdate;
      };
      team_invitations: {
        Row: ITeamInvitation;
        Insert: ITeamInvitationInsert;
        Update: never;
      };
      team_join_requests: {
        Row: ITeamJoinRequest;
        Insert: ITeamJoinRequestInsert;
        Update: never;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_status: UserStatus;
      user_role: UserRole;
      team_status: TeamStatus;
      team_member_role: TeamMemberRole;
      invitation_status: InvitationStatus;
      join_request_status: JoinRequestStatus;
    };
  };
}
