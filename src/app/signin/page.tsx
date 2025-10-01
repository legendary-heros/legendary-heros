'use client';

import LoginForm from '@/components/forms/LoginForm';
import { Header } from '@/components/ui/Header';
import Link from 'next/link';
import PublicRoute from '@/components/auth/PublicRoute';
import { useAppSelector } from '@/hooks/useRedux';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);
  const router = useRouter();
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
        {/* Navigation Header */}
        <Header variant="public" showBackButton={true} />

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-4xl font-extrabold text-gray-900">
                Welcome Back
              </h2>
              <p className="mt-3 text-lg text-gray-600">
                Sign in to continue to your dashboard
              </p>
            </div>

            {/* Form */}
            <div className="mt-8">
              <LoginForm />
            </div>

            {/* Footer Links */}
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}