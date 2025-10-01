'use client';

import { Sidebar } from '@/components/ui/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/ui/Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {


  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation Bar */}
          <Header />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

