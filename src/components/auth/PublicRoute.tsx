'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getSession } from '@/store/slices/authSlice';
import PageLoader from '@/components/ui/PageLoader';

interface IPublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function PublicRoute({ 
  children, 
  redirectTo = '/dashboard' 
}: IPublicRouteProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isPageLoading } = useAppSelector((state: any) => state.auth);

  useEffect(() => {
    dispatch(getSession());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && !isPageLoading) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isPageLoading, router, redirectTo]);

  if (isPageLoading) {
    return <PageLoader message="Checking authentication..." />;
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return <>{children}</>;
}
