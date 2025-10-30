import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, Users, FileText } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MK Marketing - Expense Management
            </span>
          </div>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Expense & Advance Management System
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Streamline your expense tracking, manage staff advances, and maintain complete
              financial transparency with our comprehensive management system.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg px-6 py-3">
              <p className="text-xs font-semibold text-green-800">🎯 Pre-loaded with Demo Data</p>
              <p className="text-xs text-green-700">5 Staff • Advances • Expenses Ready!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-card rounded-lg p-6 shadow-lg border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3>Track Expenses</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Record and categorize all expenses with detailed breakdowns and bill uploads
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-lg border">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3>Manage Advances</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Issue advances to staff and automatically track settlements against expenses
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-lg border">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <h3>Generate Reports</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Get detailed insights with comprehensive reports and export capabilities
              </p>
            </div>
          </div>

          <div className="mt-16 p-6 bg-card rounded-lg border max-w-2xl mx-auto">
            <h3 className="mb-4">Key Features</h3>
            <ul className="text-left space-y-2 text-sm text-muted-foreground">
              <li>✓ Role-based access control (Admin & Staff)</li>
              <li>✓ Category-based expense tracking (Transport, Bazar, Sealdah, Out Station, Paglahat, Others)</li>
              <li>✓ Staff advance management with automatic settlement tracking</li>
              <li>✓ Link expenses directly to advances for seamless settlement</li>
              <li>✓ Mandatory bill uploads for expenses above ₹500</li>
              <li>✓ Admin personal expense tracking with CSV/PDF export</li>
              <li>✓ Image management with monthly download and cleanup</li>
              <li>✓ Real-time balance calculations showing surplus/deficit</li>
              <li>✓ Mobile-friendly responsive design</li>
              <li>✓ Secure authentication with password management</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 MK Marketing - Expense Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
