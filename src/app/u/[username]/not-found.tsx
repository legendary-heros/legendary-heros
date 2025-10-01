'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header variant="public" showBackButton={true} />
      <div className="flex items-center justify-center px-4 h-[calc(100vh-4rem)]">
        <Card className="border-0 shadow-2xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Not Found</h1>
            <p className="text-gray-600 mb-6">
              The user profile you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Go to Homepage
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
