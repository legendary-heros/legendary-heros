'use client';

import Image from 'next/image';
import SignupForm from '@/components/forms/SignupForm';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import PublicRoute from '@/components/auth/PublicRoute';

export default function SignUpPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
        {/* Navigation Header */}
        <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <Link href="/" className="flex items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 ">
                    <Image 
                      src="/favicon.ico" 
                      alt="Menu" 
                      width={35} 
                      height={35}
                      className={`rounded-lg flex items-center justify-center`}
                    />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Legendary Heroes
                  </h1>
                </div>
              </Link>
              <div className="flex items-center">
                <Link href="/">
                  <Button variant="ghost" className="text-gray-700">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-4xl font-extrabold text-gray-900">
                Create Your Account
              </h2>
              <p className="mt-3 text-lg text-gray-600">
                Join us and start your journey today
              </p>
            </div>

            {/* Form */}
            <div className="mt-8">
              <SignupForm />
            </div>

            {/* Footer Links */}
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/signin" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}