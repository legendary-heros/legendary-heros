'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/useRedux';
import { checkAuthStatus } from '@/store/slices/authSlice';

/**
 * AuthProvider - Checks authentication status when app starts
 * This component verifies if a stored token is still valid
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check auth status on app mount
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return <>{children}</>;
}


