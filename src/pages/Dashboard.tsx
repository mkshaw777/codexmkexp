import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LogOut, User, TrendingUp } from 'lucide-react';
import { getCurrentUser, signOut } from '../lib/auth';
import { getUserBalance } from '../lib/data';
import { cleanupOldData, shouldCleanup } from '../lib/storage-cleanup';
import UnsettledAdvances from '../components/UnsettledAdvances';
import ExpenseListEnhanced from '../components/ExpenseListEnhanced';
import AdminAdvanceForm from '../components/AdminAdvanceForm';
import AdvanceList from '../components/AdvanceList';
import StaffAdvanceList from '../components/StaffAdvanceList';
import AdminAdvanceListEnhanced from '../components/AdminAdvanceListEnhanced';
import AdminPersonalExpense from '../components/AdminPersonalExpense';
import StaffExpenseManagement from '../components/StaffExpenseManagement';
import StaffManagement from '../components/StaffManagement';
import PasswordSettings from '../components/PasswordSettings';
import BrandHeader from '../components/BrandHeader';
import BrandFooter from '../components/BrandFooter';
import AdminCollectionManagement from '../components/AdminCollectionManagement';
import StaffCollectionEntry from '../components/StaffCollectionEntry';
import TransportPaymentTracking from '../components/TransportPaymentTracking';
import StaffTransportEntry from '../components/StaffTransportEntry';
import DataDebugViewer from '../components/DataDebugViewer';
import { toast } from 'sonner@2.0.3';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [balance, setBalance] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/');
    } else {
      setUser(currentUser);
      loadBalance();
      
      // Periodic cleanup check
      if (shouldCleanup()) {
        console.log('Running automatic cleanup...');
        cleanupOldData();
      }
    }
  }, [navigate, refreshTrigger]);

  const loadBalance = () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const userBalance = getUserBalance(currentUser.id); // ⏮️ Sync localStorage call
      setBalance(userBalance);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
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
          <>
            <Tabs defaultValue="advances" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
                <TabsTrigger value="advances" className="text-xs sm:text-sm">Give Advance</TabsTrigger>
                <TabsTrigger value="settlement" className="text-xs sm:text-sm">Settlements</TabsTrigger>
                <TabsTrigger value="collections" className="text-xs sm:text-sm">Collections</TabsTrigger>
                <TabsTrigger value="transport" className="text-xs sm:text-sm">🚚 Transport</TabsTrigger>
                <TabsTrigger value="staff-management" className="text-xs sm:text-sm">Staff Mgmt</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm">⚙️ Settings</TabsTrigger>
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

              <TabsContent value="transport" className="space-y-6">
                <TransportPaymentTracking />
              </TabsContent>

              <TabsContent value="staff-management" className="space-y-6">
                <StaffManagement />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Tabs defaultValue="password" className="space-y-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg sm:text-xl font-semibold">Settings & Reports</h2>
                      <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span>Manage data & access reports</span>
                      </div>
                    </div>
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1">
                      <TabsTrigger value="password" className="text-xs sm:text-sm">Password</TabsTrigger>
                      <TabsTrigger value="personal-expense" className="text-xs sm:text-sm">My Expenses</TabsTrigger>
                      <TabsTrigger value="expense-staff" className="text-xs sm:text-sm">Staff Expense</TabsTrigger>
                      <TabsTrigger value="expenses" className="text-xs sm:text-sm">All Expenses</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="password" className="space-y-6">
                    <PasswordSettings />
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
                </Tabs>

                <div className="bg-white rounded-lg border border-dashed border-gray-300 p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">System Tools</h3>
                    <span className="text-xs sm:text-sm text-blue-600 font-medium">Admin Only</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Access diagnostic data and perform troubleshooting when required.
                  </p>
                  <DataDebugViewer />
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="advances">My Advances</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="transport">🚚 Transport</TabsTrigger>
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

            <TabsContent value="transport" className="space-y-6">
              <StaffTransportEntry />
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
      
      {/* Brand Footer */}
      <BrandFooter />
    </div>
  );
}
