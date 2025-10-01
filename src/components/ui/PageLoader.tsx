'use client';

interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center">
        <div className="relative">
          {/* Main spinner */}
          <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          
          {/* Inner pulsing circle */}
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 border-r-purple-600 rounded-full animate-pulse mx-auto"></div>
        </div>
        
        {/* Loading text */}
        <p className="mt-6 text-lg font-medium text-gray-700">{message}</p>
        
        {/* Subtitle */}
        <p className="mt-2 text-sm text-gray-500">Please wait while we prepare everything for you</p>
        
        {/* Loading dots animation */}
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}
