import { Heart, Shield, Zap } from 'lucide-react';

export default function BrandFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-gray-800">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">MK</span>
              </div>
              <div>
                <h3 className="font-bold text-white">MK Marketing</h3>
                <p className="text-xs text-gray-400">Expense Management</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Professional expense management system for marketing teams. 
              Track advances, expenses, and settlements efficiently.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-white mb-4">Key Features</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Secure Role-based Access</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-400" />
                <span>Real-time Tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-green-400" />
                <span>Easy Settlement Process</span>
              </li>
            </ul>
          </div>

          {/* Contact/Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">System Info</h4>
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">
                <span className="text-white">Version:</span> 2.0.0
              </p>
              <p className="text-gray-400">
                <span className="text-white">Status:</span>{' '}
                <span className="text-green-400">● Online</span>
              </p>
              <p className="text-gray-400">
                <span className="text-white">Last Updated:</span> Oct 2025
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} MK Marketing. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>for Marketing Teams</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
