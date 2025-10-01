'use client';

import { useAppSelector } from '@/hooks/useRedux';
import PageLoader from '@/components/ui/PageLoader';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface IPublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function PublicRoute({ 
  children, 
  redirectTo = '/dashboard' 
}: IPublicRouteProps) {
  const { isAuthenticated, isPageLoading } = useAppSelector((state: any) => state.auth);
  const router = useRouter();
  
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, redirectTo]);

  // Show loading page while verifying authentication
  if (isPageLoading) {
    return <PageLoader message="Checking authentication..." />;
  }

  // Redirect to dashboard if authenticated
  if (isAuthenticated) {
    return null;
  }

  // Render children components if not authenticated
  return <>{children}</>;
}
