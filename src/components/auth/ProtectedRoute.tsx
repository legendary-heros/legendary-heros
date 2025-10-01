'use client';

import { useAppSelector } from '@/hooks/useRedux';
import PageLoader from '@/components/ui/PageLoader';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface IProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/signin' 
}: IProtectedRouteProps) {
  const { isAuthenticated, isPageLoading } = useAppSelector((state: any) => state.auth);
  const router = useRouter();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, redirectTo]);

  // Show loading page while verifying authentication
  if (isPageLoading) {
    return <PageLoader message="Verifying your session..." />;
  }

  // Redirect to signin if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Render children components if authenticated
  return <>{children}</>;
}
