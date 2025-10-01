import { createClient } from '@supabase/supabase-js';
import type { IDatabase, IUserDB, IUserInsert, IUserUpdate } from '@/types';

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
