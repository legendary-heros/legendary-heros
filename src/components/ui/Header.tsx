import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { signOut } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/Button';
import { Path, RouteTitle } from '@/constants/enums';

// Helper function to get page title from pathname
const getPageTitle = (pathname: string): string => {
    const pathToTitle: Record<string, string> = {
      [Path.Dashboard]: RouteTitle.Dashboard,
      [Path.Profile]: RouteTitle.Profile,
      [Path.Settings]: RouteTitle.Settings,
      [Path.Analytics]: RouteTitle.Analytics,
      [Path.Team]: RouteTitle.Team,
      [Path.Projects]: RouteTitle.Projects,
      [Path.Documentation]: RouteTitle.Documentation,
      [Path.Help]: RouteTitle.Help,
    };
    
    return pathToTitle[pathname] || 'Dashboard';
  };

export function Header () {

    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
  

    const { user } = useAppSelector((state: any) => state.auth);
  
    const pageTitle = getPageTitle(pathname);
  
    const handleSignOut = async () => {
      await dispatch(signOut());
      router.push('/');
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-20">
            <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              {/* Mobile spacing for hamburger button */}
              <div className="lg:hidden w-12"></div>
              
              {/* Desktop title or breadcrumb */}
              <div className="hidden lg:block">
                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {pageTitle}
                </h2>
              </div>

              {/* Right side - User info and sign out */}
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700">{user?.email}</span>
                </div>
                <Button 
                  onClick={handleSignOut} 
                  variant="outline"
                  className="border-gray-300 hover:border-red-500 hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
        </header>
    )
}