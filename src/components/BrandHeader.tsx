import { Building2, TrendingUp, Shield } from 'lucide-react';

interface BrandHeaderProps {
  variant?: 'full' | 'compact' | 'logo-only';
  showTagline?: boolean;
}

export default function BrandHeader({ variant = 'full', showTagline = true }: BrandHeaderProps) {
  if (variant === 'logo-only') {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">MK</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">MK Marketing</h1>
          {showTagline && (
            <p className="text-xs text-gray-500">Expense Management System</p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">MK</span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <h1 className="font-bold text-gray-900">MK Marketing</h1>
          <p className="text-xs text-gray-500">Expense Management</p>
        </div>
      </div>
    );
  }

  // Full variant - for main pages
  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          {/* Logo and Company Name */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-blue-700 text-2xl font-bold">MK</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-3 border-blue-800 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold tracking-tight">MK Marketing</h1>
              {showTagline && (
                <p className="text-blue-100 text-sm mt-1 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Professional Expense Management System
                </p>
              )}
            </div>
          </div>

          {/* Trust Badge */}
          <div className="hidden md:flex items-center gap-3 bg-blue-800/50 px-4 py-2 rounded-lg border border-blue-600/30">
            <Shield className="w-5 h-5 text-blue-200" />
            <div className="text-right">
              <p className="text-xs text-blue-200">Secure & Trusted</p>
              <p className="text-sm font-semibold">Since 2020</p>
            </div>
          </div>
        </div>

        {/* Tagline Bar */}
        {showTagline && (
          <div className="mt-6 flex items-center gap-6 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Real-time Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span>Advance Management</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Settlement Processing</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
