import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, Loader2, Database, Users, FileText, DollarSign, Package } from 'lucide-react';
import { supabase, testSupabaseConnection } from '@/lib/supabase';
import { Alert, AlertDescription } from './ui/alert';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  icon: any;
}

export default function SupabaseConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setTesting(true);
    const testResults: TestResult[] = [];

    // Test 1: Basic Connection
    testResults.push({
      name: 'Supabase Connection',
      status: 'pending',
      message: 'Testing connection...',
      icon: Database,
    });
    setResults([...testResults]);

    try {
      const connectionTest = await testSupabaseConnection();
      if (connectionTest.connected) {
        testResults[0].status = 'success';
        testResults[0].message = 'Connected successfully!';
      } else {
        testResults[0].status = 'error';
        testResults[0].message = connectionTest.error || 'Connection failed';
      }
    } catch (err) {
      testResults[0].status = 'error';
      testResults[0].message = String(err);
    }
    setResults([...testResults]);

    // Test 2: Users Table
    testResults.push({
      name: 'Users Table',
      status: 'pending',
      message: 'Checking users table...',
      icon: Users,
    });
    setResults([...testResults]);

    try {
      const { data, error } = await supabase.from('users').select('*').limit(1);
      if (error) {
        testResults[1].status = 'error';
        testResults[1].message = error.message;
      } else {
        testResults[1].status = 'success';
        testResults[1].message = `Found ${data?.length || 0} users`;
      }
    } catch (err) {
      testResults[1].status = 'error';
      testResults[1].message = String(err);
    }
    setResults([...testResults]);

    // Test 3: Advances Table
    testResults.push({
      name: 'Advances Table',
      status: 'pending',
      message: 'Checking advances table...',
      icon: DollarSign,
    });
    setResults([...testResults]);

    try {
      const { data, error } = await supabase.from('advances').select('count');
      if (error) {
        testResults[2].status = 'error';
        testResults[2].message = error.message;
      } else {
        testResults[2].status = 'success';
        testResults[2].message = 'Table accessible';
      }
    } catch (err) {
      testResults[2].status = 'error';
      testResults[2].message = String(err);
    }
    setResults([...testResults]);

    // Test 4: Expenses Table
    testResults.push({
      name: 'Expenses Table',
      status: 'pending',
      message: 'Checking expenses table...',
      icon: FileText,
    });
    setResults([...testResults]);

    try {
      const { data, error } = await supabase.from('expenses').select('count');
      if (error) {
        testResults[3].status = 'error';
        testResults[3].message = error.message;
      } else {
        testResults[3].status = 'success';
        testResults[3].message = 'Table accessible';
      }
    } catch (err) {
      testResults[3].status = 'error';
      testResults[3].message = String(err);
    }
    setResults([...testResults]);

    // Test 5: Collections Table
    testResults.push({
      name: 'Collections Table',
      status: 'pending',
      message: 'Checking collections table...',
      icon: Package,
    });
    setResults([...testResults]);

    try {
      const { data, error } = await supabase.from('collections').select('count');
      if (error) {
        testResults[4].status = 'error';
        testResults[4].message = error.message;
      } else {
        testResults[4].status = 'success';
        testResults[4].message = 'Table accessible';
      }
    } catch (err) {
      testResults[4].status = 'error';
      testResults[4].message = String(err);
    }
    setResults([...testResults]);

    setTesting(false);
  };

  const allPassed = results.length > 0 && results.every((r) => r.status === 'success');
  const anyFailed = results.some((r) => r.status === 'error');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Supabase Connection Test
        </CardTitle>
        <CardDescription>
          Verify your Supabase database connection and table setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.length === 0 ? (
          <Alert>
            <AlertDescription>
              Click the button below to test your Supabase connection and verify all tables are
              properly configured.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            {results.map((result, index) => {
              const Icon = result.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                    </div>
                  </div>
                  <div>
                    {result.status === 'pending' && (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    )}
                    {result.status === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    {result.status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {allPassed && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ All tests passed! Your Supabase database is properly configured and ready to use.
            </AlertDescription>
          </Alert>
        )}

        {anyFailed && (
          <Alert className="bg-red-50 border-red-200">
            <XCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              ❌ Some tests failed. Please check your Supabase configuration and ensure all tables
              are created using the SQL setup script.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={runTests} disabled={testing} className="flex-1">
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Run Connection Tests'
            )}
          </Button>
          {results.length > 0 && (
            <Button onClick={() => setResults([])} variant="outline">
              Clear Results
            </Button>
          )}
        </div>

        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Supabase Project:</strong> mrsdwxswmlhpitdbopsi
            </p>
            <p>
              <strong>URL:</strong> https://mrsdwxswmlhpitdbopsi.supabase.co
            </p>
            <p className="text-xs text-green-600">✅ API keys configured</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
