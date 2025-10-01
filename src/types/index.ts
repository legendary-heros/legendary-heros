// Enums
export type UserStatus = 'allow' | 'waiting' | 'block';
export type UserRole = 'superadmin' | 'admin' | 'leader' | 'member';

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

export interface IDatabase {
  public: {
    Tables: {
      users: {
        Row: IUserDB;
        Insert: IUserInsert;
        Update: IUserUpdate;
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
    };
  };
}

// Redux store types
export interface IRootState {
  auth: IAuthState;
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

// API response types
export interface IApiResponse<T = any> {
  data: T | null;
  error: string | null;
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
