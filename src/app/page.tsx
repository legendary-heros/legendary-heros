'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import PublicRoute from '@/components/auth/PublicRoute';

export default function Home() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Navigation Header */}
        <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
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
              </div>
              <div className="flex items-center space-x-4">
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
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block mb-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                🚀 Made by TobiSmile
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Legendary Heroes
              </span>
            </h1>
            
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
              Experience the power of modern web development with seamless authentication, 
              robust state management, and beautiful design.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105">
                  Get Started Free
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="/signin">
                <Button variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-2 border-gray-300 hover:border-indigo-600 hover:text-indigo-600 transition-all duration-300">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Everything You Need</h2>
              <p className="mt-2 text-lg text-gray-600">Built with modern technologies and best practices</p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    🔐
                  </div>
                  <CardTitle className="text-xl">Secure Authentication</CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Enterprise-grade authentication powered by Supabase with row-level security and JWT tokens
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    ⚡
                  </div>
                  <CardTitle className="text-xl">Redux State Management</CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Predictable state container with Redux Toolkit, middleware, and automatic persistence
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    🎨
                  </div>
                  <CardTitle className="text-xl">Modern UI Design</CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Beautiful, responsive interface built with Tailwind CSS and custom components
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-red-50">
                <CardHeader className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    🚀
                  </div>
                  <CardTitle className="text-xl">API Routes Backend</CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Server-side processing with Next.js API routes for secure backend operations
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-cyan-50 to-blue-50">
                <CardHeader className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    📱
                  </div>
                  <CardTitle className="text-xl">Fully Responsive</CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Mobile-first design that works seamlessly across all devices and screen sizes
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-yellow-50 to-amber-50">
                <CardHeader className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    ⚙️
                  </div>
                  <CardTitle className="text-xl">TypeScript Ready</CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Type-safe development with comprehensive TypeScript definitions and IntelliSense
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-24 text-center">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join thousands of developers building amazing applications with our platform
              </p>
              <Link href="/signup">
                <Button className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-10 py-6 shadow-xl transition-all duration-300 hover:scale-105">
                  Create Your Account
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500">
              © 2025 Legendary Heroes. Made by TobiSmile ❤️
            </p>
          </div>
        </footer>
      </div>
    </PublicRoute>
  );
}