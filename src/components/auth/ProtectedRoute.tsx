'use client';

import { useAppSelector } from '@/hooks/useRedux';
import PageLoader from '@/components/ui/PageLoader';

interface IProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/signin' 
}: IProtectedRouteProps) {
  const { isAuthenticated, isPageLoading } = useAppSelector((state: any) => state.auth);

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
