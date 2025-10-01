'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
      [Path.Users]: RouteTitle.Users,
      [Path.Documentation]: RouteTitle.Documentation,
      [Path.Help]: RouteTitle.Help,
    };
    
    return pathToTitle[pathname] || 'Dashboard';
  };

interface HeaderProps {
  variant?: 'public' | 'authenticated';
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
}

export function Header({ 
  variant = 'authenticated',
  showBackButton = false,
  backButtonText = 'Back to Home',
  backButtonHref = '/'
}: HeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state: any) => state.auth);
  
    const pageTitle = getPageTitle(pathname);
  
    const handleSignOut = async () => {
      await dispatch(signOut());
      router.push('/');
    };

    // Public variant (for landing, signin, signup, public profiles)
    if (variant === 'public') {
      return (
        <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <Link href="/" className="flex items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8">
                    <Image 
                      src="/favicon.ico" 
                      alt="Legendary Heroes" 
                      width={35} 
                      height={35}
                      className="rounded-lg flex items-center justify-center"
                    />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Legendary Heroes
                  </h1>
                </div>
              </Link>
              <div className="flex items-center space-x-4">
                {showBackButton ? (
                  <Link href={backButtonHref}>
                    <Button variant="ghost" className="text-gray-700">
                      {backButtonText}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signin">
                      <Button variant="ghost" className="text-gray-700 hover:text-indigo-600">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      );
    }

    // Authenticated variant (for dashboard and protected pages)
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