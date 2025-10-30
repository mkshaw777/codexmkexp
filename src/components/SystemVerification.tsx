import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { initializeDefaultUsers } from '../lib/auth';
import { getAllStaff } from '../lib/data';
import { toast } from 'sonner@2.0.3';

export default function SystemVerification() {
  const [results, setResults] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const runVerification = () => {
    setIsChecking(true);
    console.log('🔍 Starting system verification...');

    const checks: any = {
      localStorage: false,
      usersExist: false,
      userCount: 0,
      adminCount: 0,
      staffCount: 0,
      expectedStaff: 5,
      staffDetails: [],
      issues: [],
    };

    try {
      // Check 1: localStorage accessible
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        checks.localStorage = true;
        console.log('✅ localStorage accessible');
      } catch (e) {
        checks.issues.push('localStorage not accessible');
        console.error('❌ localStorage not accessible:', e);
      }

      // Check 2: Users in localStorage
      const usersStr = localStorage.getItem('mk_marketing_users');
      if (usersStr) {
        checks.usersExist = true;
        const users = JSON.parse(usersStr);
        checks.userCount = users.length;
        console.log('✅ Users found:', users.length);

        // Check 3: Count users by role
        const admins = users.filter((u: any) => u.role === 'admin');
        const staff = users.filter((u: any) => u.role === 'staff');
        
        checks.adminCount = admins.length;
        checks.staffCount = staff.length;
        checks.staffDetails = staff.map((s: any) => ({
          id: s.id,
          name: s.fullName,
          email: s.email,
          code: s.staffCode,
          hasAllFields: !!(s.id && s.fullName && s.email && s.staffCode && s.role),
        }));

        console.log('📊 Admin count:', checks.adminCount);
        console.log('📊 Staff count:', checks.staffCount);

        // Check for issues
        if (checks.userCount !== 6) {
          checks.issues.push(`Expected 6 users, found ${checks.userCount}`);
        }
        if (checks.adminCount !== 1) {
          checks.issues.push(`Expected 1 admin, found ${checks.adminCount}`);
        }
        if (checks.staffCount !== 5) {
          checks.issues.push(`Expected 5 staff, found ${checks.staffCount}`);
        }

        // Check each staff for missing fields
        staff.forEach((s: any, index: number) => {
          const missingFields = [];
          if (!s.fullName) missingFields.push('fullName');
          if (!s.email) missingFields.push('email');
          if (!s.staffCode) missingFields.push('staffCode');
          if (!s.role) missingFields.push('role');
          
          if (missingFields.length > 0) {
            checks.issues.push(`Staff ${index + 1} missing: ${missingFields.join(', ')}`);
          }
        });

      } else {
        checks.issues.push('No users in localStorage');
        console.warn('⚠️ No users found in localStorage');
      }

      // Check 4: getAllStaff() function
      const staffFromFunction = getAllStaff();
      console.log('📋 getAllStaff() returned:', staffFromFunction.length, 'staff');
      
      if (staffFromFunction.length !== checks.staffCount) {
        checks.issues.push(`getAllStaff() returned ${staffFromFunction.length}, but ${checks.staffCount} exist`);
      }

    } catch (error) {
      checks.issues.push(`Verification error: ${error}`);
      console.error('❌ Verification error:', error);
    }

    setResults(checks);
    setIsChecking(false);
    console.log('📋 Verification complete:', checks);
  };

  useEffect(() => {
    runVerification();
  }, []);

  const handleForceInit = () => {
    console.log('🔧 Force initializing users...');
    initializeDefaultUsers();
    toast.success('Users initialized!');
    setTimeout(() => {
      runVerification();
    }, 500);
  };

  const handleClearAndReload = () => {
    console.log('🗑️ Clearing all data...');
    localStorage.clear();
    toast.success('Data cleared! Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (!results) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p>Checking system...</p>
        </CardContent>
      </Card>
    );
  }

  const isHealthy = results.issues.length === 0 && 
                    results.userCount === 6 && 
                    results.staffCount === 5 && 
                    results.adminCount === 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Verification</CardTitle>
          <Button onClick={runVerification} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Re-check
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <Alert variant={isHealthy ? "default" : "destructive"}>
          <AlertDescription className="flex items-center gap-2">
            {isHealthy ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">System is healthy! ✅</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Issues detected! ⚠️</span>
              </>
            )}
          </AlertDescription>
        </Alert>

        {/* Checks Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">localStorage:</span>
              <Badge variant={results.localStorage ? "default" : "destructive"}>
                {results.localStorage ? '✓' : '✗'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Users Exist:</span>
              <Badge variant={results.usersExist ? "default" : "destructive"}>
                {results.usersExist ? '✓' : '✗'}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Users:</span>
              <Badge variant={results.userCount === 6 ? "default" : "destructive"}>
                {results.userCount} / 6
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Staff Users:</span>
              <Badge variant={results.staffCount === 5 ? "default" : "destructive"}>
                {results.staffCount} / 5
              </Badge>
            </div>
          </div>
        </div>

        {/* Staff Details */}
        {results.staffDetails.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Staff Members:</p>
            <div className="space-y-1 text-xs">
              {results.staffDetails.map((staff: any, idx: number) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                  {staff.hasAllFields ? (
                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{staff.name || 'No name'}</p>
                    <p className="text-muted-foreground truncate">{staff.email || 'No email'}</p>
                    <p className="text-muted-foreground">{staff.code || 'No code'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues List */}
        {results.issues.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-destructive">Issues Found:</p>
            <ul className="text-xs space-y-1 list-disc list-inside text-destructive">
              {results.issues.map((issue: string, idx: number) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        {!isHealthy && (
          <div className="grid grid-cols-2 gap-2 pt-4 border-t">
            <Button onClick={handleForceInit} variant="outline" size="sm">
              Force Initialize
            </Button>
            <Button onClick={handleClearAndReload} variant="destructive" size="sm">
              Clear & Reload
            </Button>
          </div>
        )}

        {/* Console Tip */}
        <div className="p-3 bg-muted rounded text-xs space-y-1">
          <p className="font-medium">💡 Console Commands:</p>
          <code className="block">localStorage.clear() // Clear all data</code>
          <code className="block">console.table(JSON.parse(localStorage.getItem('mk_marketing_users')))</code>
        </div>
      </CardContent>
    </Card>
  );
}
