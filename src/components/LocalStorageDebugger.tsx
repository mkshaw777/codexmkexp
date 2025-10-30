import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { RefreshCw, Database, AlertTriangle, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';

export default function LocalStorageDebugger() {
  const [showData, setShowData] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const getStorageData = () => {
    try {
      const users = JSON.parse(localStorage.getItem('mk_marketing_users') || '[]');
      const advances = JSON.parse(localStorage.getItem('mk_marketing_advances') || '[]');
      const expenses = JSON.parse(localStorage.getItem('mk_marketing_expenses') || '[]');
      const collections = JSON.parse(localStorage.getItem('mk_marketing_collections') || '[]');
      const currentUser = JSON.parse(localStorage.getItem('mk_marketing_current_user') || 'null');

      return {
        users,
        advances,
        expenses,
        collections,
        currentUser,
      };
    } catch (err) {
      console.error('Error reading localStorage:', err);
      return null;
    }
  };

  const data = getStorageData();

  const exportData = () => {
    if (!data) return;
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mk-marketing-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (confirm('⚠️ WARNING: Ye saara localStorage data delete kar dega! Continue?')) {
      localStorage.clear();
      setRefreshKey(prev => prev + 1);
      window.location.reload();
    }
  };

  if (!data) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <XCircle className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Error reading localStorage data!
        </AlertDescription>
      </Alert>
    );
  }

  const stats = {
    users: data.users.length,
    advances: data.advances.length,
    expenses: data.expenses.length,
    collections: data.collections.length,
  };

  const totalAdvanceAmount = data.advances.reduce((sum: number, a: any) => sum + (a.amount || 0), 0);
  const totalExpenseAmount = data.expenses.reduce((sum: number, a: any) => sum + (a.total || 0), 0);
  const totalCollectionAmount = data.collections.reduce((sum: number, a: any) => sum + (a.amount || 0), 0);

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-orange-600" />
            <span>localStorage Data Status</span>
          </div>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            ⚠️ Browser-Only Data (No Cloud Sync)
          </Badge>
        </CardTitle>
        <CardDescription>
          Aapka current data sirf is browser mein saved hai - cloud mein nahi!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current User */}
        {data.currentUser && (
          <Alert className="bg-blue-50 border-blue-200">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Logged in as:</strong> {data.currentUser.fullName} ({data.currentUser.role})
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-white rounded-lg border text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.users}</div>
            <div className="text-sm text-muted-foreground">Users</div>
          </div>
          <div className="p-3 bg-white rounded-lg border text-center">
            <div className="text-2xl font-bold text-green-600">{stats.advances}</div>
            <div className="text-sm text-muted-foreground">Advances</div>
            <div className="text-xs text-muted-foreground">₹{totalAdvanceAmount.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 bg-white rounded-lg border text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.expenses}</div>
            <div className="text-sm text-muted-foreground">Expenses</div>
            <div className="text-xs text-muted-foreground">₹{totalExpenseAmount.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 bg-white rounded-lg border text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.collections}</div>
            <div className="text-sm text-muted-foreground">Collections</div>
            <div className="text-xs text-muted-foreground">₹{totalCollectionAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Warning */}
        <Alert className="bg-yellow-50 border-yellow-300">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            <strong>⚠️ Important:</strong> Ye data sirf aapke is browser mein hai!
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Admin ka browser ≠ Staff ka browser</li>
              <li>Dusre device par nahi dikhega</li>
              <li>Browser clear = data lost</li>
              <li>Cloud backup nahi hai</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setRefreshKey(prev => prev + 1);
              window.location.reload();
            }}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          
          <Button
            onClick={() => setShowData(!showData)}
            variant="outline"
            size="sm"
          >
            {showData ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showData ? 'Hide' : 'Show'} Raw Data
          </Button>

          <Button onClick={exportData} variant="outline" size="sm">
            <Database className="w-4 h-4 mr-2" />
            Export Backup
          </Button>

          <Button onClick={clearAllData} variant="destructive" size="sm">
            <XCircle className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>
        </div>

        {/* Raw Data Display */}
        {showData && (
          <div className="mt-4 p-3 bg-gray-900 text-green-400 rounded-lg overflow-auto max-h-96 text-xs font-mono">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}

        {/* Instructions */}
        <div className="pt-4 border-t">
          <p className="text-sm font-semibold mb-2">🔧 Kya karna chahiye?</p>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p><strong>Option 1:</strong> Testing ke liye - Same browser/device use karein</p>
            <p><strong>Option 2:</strong> Production ke liye - Supabase enable karein (cloud sync)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
