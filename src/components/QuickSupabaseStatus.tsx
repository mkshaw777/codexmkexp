import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Database, RefreshCw } from 'lucide-react';
import { supabase, testSupabaseConnection } from '@/lib/supabase';
import { Button } from './ui/button';

export default function QuickSupabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [message, setMessage] = useState('Checking connection...');
  const [details, setDetails] = useState<any>(null);

  const checkConnection = async () => {
    setStatus('checking');
    setMessage('Testing Supabase connection...');

    try {
      // Test basic connection
      const result = await testSupabaseConnection();
      
      if (result.connected) {
        // Get additional details
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('count');
        
        const { data: advances, error: advError } = await supabase
          .from('advances')
          .select('count');
        
        const { data: expenses, error: expError } = await supabase
          .from('expenses')
          .select('count');

        if (!userError && !advError && !expError) {
          setStatus('connected');
          setMessage('Supabase connected successfully!');
          setDetails({
            users: users?.length || 0,
            advances: advances?.length || 0,
            expenses: expenses?.length || 0,
          });
        } else {
          setStatus('error');
          setMessage('Connected but some tables have issues');
        }
      } else {
        setStatus('error');
        setMessage(result.error || 'Connection failed');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Error: ' + String(err));
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <Card className="border-l-4" style={{
      borderLeftColor: status === 'connected' ? '#22c55e' : status === 'error' ? '#ef4444' : '#f59e0b'
    }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="w-4 h-4" />
            Supabase Status
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkConnection}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Connection</span>
            {status === 'checking' && (
              <Badge variant="outline" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                Checking...
              </Badge>
            )}
            {status === 'connected' && (
              <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
                <CheckCircle2 className="w-3 h-3" />
                Connected
              </Badge>
            )}
            {status === 'error' && (
              <Badge variant="outline" className="gap-1 border-red-500 text-red-700">
                <XCircle className="w-3 h-3" />
                Error
              </Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {message}
          </div>

          {details && status === 'connected' && (
            <div className="pt-2 border-t space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Database Records:</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-semibold">{details.users}</div>
                  <div className="text-muted-foreground">Users</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-semibold">{details.advances}</div>
                  <div className="text-muted-foreground">Advances</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-semibold">{details.expenses}</div>
                  <div className="text-muted-foreground">Expenses</div>
                </div>
              </div>
            </div>
          )}

          {status === 'connected' && (
            <div className="pt-2 border-t">
              <div className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Cloud database active
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="pt-2 border-t">
              <div className="text-xs text-red-600 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Check configuration
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
