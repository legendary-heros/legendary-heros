export const API_URL = process.env.API_URL || '';
export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds