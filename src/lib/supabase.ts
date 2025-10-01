import { createClient } from '@supabase/supabase-js';
import type { IDatabase, IUserInsert, IUserUpdate } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<IDatabase>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  },
  
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  
  getSession: async () => {
    return await supabase.auth.getSession();
  },
  
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database helpers - will be implemented once Supabase tables are set up
export const db = {
  // Users
  getUsers: async () => {
    // TODO: Implement once users table is created in Supabase
    return { data: [], error: null };
  },
  
  getUser: async (id: string) => {
    // TODO: Implement once users table is created in Supabase
    return { data: null, error: null };
  },
  
  createUser: async (userData: any) => {
    // TODO: Implement once users table is created in Supabase
    return { data: null, error: null };
  },
  
  updateUser: async (id: string, userData: any) => {
    // TODO: Implement once users table is created in Supabase
    return { data: null, error: null };
  },
  
  deleteUser: async (id: string) => {
    // TODO: Implement once users table is created in Supabase
    return { data: null, error: null };
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
