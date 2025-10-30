import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Building2, Shield, TrendingUp, CheckCircle2, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner@2.0.3';
import { signInWithEmail } from '@/lib/auth';

export default function Auth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user, error } = await signInWithEmail(formData.email, formData.password);
      if (error) {
        toast.error(error);
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header with Brand */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-xl">
                <span className="text-blue-700 text-2xl font-bold">MK</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full border-2 border-blue-800 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">MK Marketing</h1>
              <p className="text-blue-100 text-sm">Professional Expense Management System</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Features */}
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Streamline Your Expense Management
              </h2>
              <p className="text-gray-600 text-lg">
                Complete solution for tracking advances, expenses, and settlements with role-based access control.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Secure & Role-Based</h3>
                  <p className="text-sm text-gray-600">Admin and Staff roles with specific permissions</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Real-time Tracking</h3>
                  <p className="text-sm text-gray-600">Track expenses and advances in real-time</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Easy Settlement</h3>
                  <p className="text-sm text-gray-600">Simplified expense settlement process</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">100%</p>
                <p className="text-sm text-gray-600">Secure</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">24/7</p>
                <p className="text-sm text-gray-600">Available</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">5+</p>
                <p className="text-sm text-gray-600">Staff Members</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <Card className="shadow-2xl border-2 border-gray-100">
            <CardHeader className="space-y-3 text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                <CardDescription className="mt-2">
                  Sign in to your account
                </CardDescription>
              </div>
            </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={4}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 text-center">
              👤 <strong>Staff members:</strong> Contact admin to create your account
            </p>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg text-xs space-y-2">
            <p className="font-semibold text-blue-900">🎯 Demo Accounts (Pre-loaded with test data):</p>
            <div className="space-y-1">
              <p className="font-medium text-gray-700">👤 Admin:</p>
              <p className="text-gray-600">📧 admin@mkmarketing.com</p>
              <p className="text-gray-600">🔑 admin123</p>
            </div>
            <div className="pt-2 border-t border-blue-200 space-y-1">
              <p className="font-medium text-gray-700">👥 Staff (all use: staff123):</p>
              <p className="text-gray-600">• rajesh@mkmarketing.com</p>
              <p className="text-gray-600">• priya@mkmarketing.com</p>
              <p className="text-gray-600">• amit@mkmarketing.com</p>
              <p className="text-gray-600">• sneha@mkmarketing.com</p>
              <p className="text-gray-600">• vikram@mkmarketing.com</p>
            </div>
            <p className="text-xs text-gray-500 pt-1">✨ 5 staff with advances & expenses pre-loaded!</p>
          </div>
        </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} MK Marketing. All rights reserved. | Professional Expense Management System
          </p>
        </div>
      </div>
    </div>
  );
}
