import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RefreshCw, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { initializeDefaultUsers } from '../lib/auth';
import { toast } from 'sonner@2.0.3';

export default function DebugPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadUsers = () => {
    const usersStr = localStorage.getItem('mk_marketing_users');
    if (usersStr) {
      const parsedUsers = JSON.parse(usersStr);
      console.log('🔍 DebugPanel: Users loaded:', parsedUsers.length);
      setUsers(parsedUsers);
    } else {
      console.warn('⚠️ DebugPanel: No users in localStorage');
      setUsers([]);
    }
  };

  const forceInitialize = () => {
    console.log('🔧 Force Initialize: Starting...');
    initializeDefaultUsers();
    loadUsers();
    toast.success('Users re-initialized! Please refresh the page.');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const staffUsers = users.filter(u => u.role === 'staff');
  const adminUsers = users.filter(u => u.role === 'admin');

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        <Button
          onClick={() => {
            setIsExpanded(true);
            loadUsers();
          }}
          variant="outline"
          size="sm"
          className="shadow-lg"
        >
          🔍 Debug Info
        </Button>
      ) : (
        <Card className="w-96 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">System Debug Info</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={loadUsers}
                  variant="ghost"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setIsExpanded(false)}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {/* Users Count */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Users:</span>
                <Badge variant={users.length === 6 ? "default" : "destructive"}>
                  {users.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Admin Users:</span>
                <Badge variant={adminUsers.length === 1 ? "default" : "destructive"}>
                  {adminUsers.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Staff Users:</span>
                <Badge variant={staffUsers.length === 5 ? "default" : "destructive"}>
                  {staffUsers.length}
                </Badge>
              </div>
            </div>

            {/* Staff List */}
            {staffUsers.length > 0 && (
              <div className="space-y-1">
                <p className="font-medium">Staff Members:</p>
                <div className="space-y-1 pl-2">
                  {staffUsers.map((staff, index) => (
                    <div key={staff.id} className="flex items-start gap-2">
                      {staff.email && staff.fullName && staff.staffCode ? (
                        <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{staff.fullName || 'No name'}</p>
                        <p className="text-muted-foreground">{staff.email || 'No email'}</p>
                        <p className="text-muted-foreground">{staff.staffCode || 'No code'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expected Staff */}
            {staffUsers.length !== 5 && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                <p className="font-medium">⚠️ Expected 5 Staff Members</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    onClick={forceInitialize}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Force Init
                  </Button>
                  <Button
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}

            {/* Admin Info */}
            {adminUsers.length > 0 && (
              <div className="space-y-1">
                <p className="font-medium">Admin:</p>
                <div className="pl-2">
                  {adminUsers.map(admin => (
                    <div key={admin.id}>
                      <p>{admin.fullName}</p>
                      <p className="text-muted-foreground">{admin.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="pt-2 border-t">
              {users.length === 6 && staffUsers.length === 5 && adminUsers.length === 1 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">System OK</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-4 h-4" />
                  <span className="font-medium">System Issue Detected</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
