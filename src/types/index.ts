// Global type definitions
export interface IUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface IUserInsert {
  email: string;
}

export interface IUserUpdate {
  email?: string;
}

export interface IDatabase {
  public: {
    Tables: {
      users: {
        Row: IUser;
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
      [_ in never]: never;
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
  email: string;
  password: string;
}

export interface ISignupForm {
  email: string;
  password: string;
  confirmPassword: string;
}
