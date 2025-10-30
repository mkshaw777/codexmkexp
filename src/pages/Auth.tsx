import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Shield, TrendingUp, CheckCircle2, BarChart3, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner@2.0.3';
import { signInWithEmail, getCurrentUser } from '../lib/auth';

export default function Auth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect if already logged in
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user, error } = await signInWithEmail(formData.email, formData.password);
      if (error) {
        toast.error(error);
      } else {
        const roleText = user?.role === 'admin' ? 'Admin' : 'Staff';
        toast.success(`Welcome back, ${user?.name || 'User'}! (${roleText})`);
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col">
      {/* Header with Brand */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-2xl">
                <span className="text-blue-700 text-3xl font-bold">MK</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-2 border-blue-800 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">MK Marketing</h1>
              <p className="text-blue-100">Professional Expense Management System</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Features */}
          <div className="hidden lg:flex flex-col justify-center space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Secure Login Portal
                </h2>
              </div>
              <p className="text-gray-600 text-lg">
                Professional expense management system with role-based access control for Admin and Staff members.
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
          <Card className="shadow-2xl border-2 border-blue-100 bg-white">
            <CardHeader className="space-y-3 text-center pb-8 pt-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl">Welcome Back</CardTitle>
                <CardDescription className="mt-2 text-base">
                  Sign in to access your dashboard
                </CardDescription>
              </div>
            </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@mkmarketing.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={4}
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 text-center font-medium">
              <strong>New Staff Members:</strong> Contact your admin to create an account.
            </p>
          </div>
        </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-8 mt-auto border-t-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-2">
          <p className="text-sm text-gray-300 font-medium">
            © {new Date().getFullYear()} MK Marketing - Professional Expense Management System
          </p>
          <p className="text-xs text-gray-400">
            Secure • Reliable • Professional | All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}

