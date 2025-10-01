'use client';

import { useAppSelector } from '@/hooks/useRedux';
import PageLoader from '@/components/ui/PageLoader';

interface IPublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function PublicRoute({ 
  children, 
  redirectTo = '/dashboard' 
}: IPublicRouteProps) {
  const { isAuthenticated, isPageLoading } = useAppSelector((state: any) => state.auth);

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
