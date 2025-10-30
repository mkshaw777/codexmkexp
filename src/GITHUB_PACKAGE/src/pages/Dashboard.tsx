import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, User, TrendingUp } from 'lucide-react';
import { getCurrentUser, signOut } from '@/lib/auth';
import { getUserBalance } from '@/lib/data';
import UnsettledAdvances from '@/components/UnsettledAdvances';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import ExpenseListEnhanced from '@/components/ExpenseListEnhanced';
import AdminAdvanceForm from '@/components/AdminAdvanceForm';
import AdvanceList from '@/components/AdvanceList';
import StaffAdvanceList from '@/components/StaffAdvanceList';
import AdminAdvanceListEnhanced from '@/components/AdminAdvanceListEnhanced';
import StaffExpenseForm from '@/components/StaffExpenseForm';
import AdminPersonalExpense from '@/components/AdminPersonalExpense';
import StaffExpenseManagement from '@/components/StaffExpenseManagement';
import StaffManagement from '@/components/StaffManagement';
import PasswordSettings from '@/components/PasswordSettings';
import DebugPanel from '@/components/DebugPanel';
import BrandHeader from '@/components/BrandHeader';
import BrandFooter from '@/components/BrandFooter';
import AdminCollectionManagement from '@/components/AdminCollectionManagement';
import StaffCollectionEntry from '@/components/StaffCollectionEntry';
import { toast } from 'sonner@2.0.3';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [balance, setBalance] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/auth');
    } else {
      setUser(currentUser);
      loadBalance();
    }
  }, [navigate, refreshTrigger]);

  const loadBalance = () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const userBalance = getUserBalance(currentUser.id);
      setBalance(userBalance);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  const handleDataChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Brand Header */}
      <BrandHeader variant="full" showTagline={true} />

      {/* User Info Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-500">
                  {user.role === 'admin' ? '👑 Administrator' : '👤 Staff Member'} • {user.email}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        {user.role === 'admin' ? (
          <Tabs defaultValue="advances" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              <TabsTrigger value="advances">Give Advance</TabsTrigger>
              <TabsTrigger value="settlement">Settlements</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="personal-expense">My Expenses</TabsTrigger>
              <TabsTrigger value="expense-staff">Staff Expense</TabsTrigger>
              <TabsTrigger value="expenses">All Expenses</TabsTrigger>
              <TabsTrigger value="staff-management">Staff Management</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="advances" className="space-y-6">
              <AdminAdvanceForm onSuccess={handleDataChange} />
              <AdvanceList refreshTrigger={refreshTrigger} />
            </TabsContent>

            <TabsContent value="settlement" className="space-y-6">
              <AdminAdvanceListEnhanced refreshTrigger={refreshTrigger} onUpdate={handleDataChange} />
            </TabsContent>

            <TabsContent value="collections" className="space-y-6">
              <AdminCollectionManagement />
            </TabsContent>

            <TabsContent value="personal-expense" className="space-y-6">
              <AdminPersonalExpense />
            </TabsContent>

            <TabsContent value="expense-staff" className="space-y-6">
              <StaffExpenseManagement />
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6">
              <ExpenseListEnhanced refreshTrigger={refreshTrigger} />
            </TabsContent>

            <TabsContent value="staff-management" className="space-y-6">
              <StaffManagement />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <PasswordSettings />
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="advances">My Advances</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="expenses">My Expenses</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <UnsettledAdvances />
            </TabsContent>

            <TabsContent value="advances" className="space-y-6">
              <StaffAdvanceList refreshTrigger={refreshTrigger} />
            </TabsContent>

            <TabsContent value="collections" className="space-y-6">
              <StaffCollectionEntry />
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6">
              <ExpenseListEnhanced userId={user.id} refreshTrigger={refreshTrigger} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <PasswordSettings />
            </TabsContent>
          </Tabs>
        )}
      </main>
      
      {/* Debug Panel - Only for Admin */}
      {user.role === 'admin' && <DebugPanel />}

      {/* Brand Footer */}
      <BrandFooter />
    </div>
  );
}
