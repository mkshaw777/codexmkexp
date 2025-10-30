import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RefreshCw } from 'lucide-react';

export default function DataDebugViewer() {
  const [data, setData] = useState<any>({});

  const loadData = () => {
    const expenses = localStorage.getItem('mk_marketing_expenses');
    const transport = localStorage.getItem('mk_marketing_transport_payments');
    const advances = localStorage.getItem('mk_marketing_advances');
    const collections = localStorage.getItem('mk_marketing_collections');

    setData({
      expenses: expenses ? JSON.parse(expenses) : [],
      transport: transport ? JSON.parse(transport) : [],
      advances: advances ? JSON.parse(advances) : [],
      collections: collections ? JSON.parse(collections) : [],
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>🔍 Data Debug Viewer</CardTitle>
          <Button onClick={loadData} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expenses */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            Staff Expenses
            <Badge>{data.expenses?.length || 0} entries</Badge>
          </h3>
          <div className="bg-gray-50 p-3 rounded max-h-40 overflow-auto text-xs">
            <pre>{JSON.stringify(data.expenses, null, 2)}</pre>
          </div>
        </div>

        {/* Transport */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            Transport Payments
            <Badge>{data.transport?.length || 0} entries</Badge>
          </h3>
          <div className="bg-gray-50 p-3 rounded max-h-40 overflow-auto text-xs">
            <pre>{JSON.stringify(data.transport, null, 2)}</pre>
          </div>
        </div>

        {/* Collections */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            Collections
            <Badge>{data.collections?.length || 0} entries</Badge>
          </h3>
          <div className="bg-gray-50 p-3 rounded max-h-40 overflow-auto text-xs">
            <pre>{JSON.stringify(data.collections, null, 2)}</pre>
          </div>
        </div>

        {/* Advances */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            Advances
            <Badge>{data.advances?.length || 0} entries</Badge>
          </h3>
          <div className="bg-gray-50 p-3 rounded max-h-40 overflow-auto text-xs">
            <pre>{JSON.stringify(data.advances, null, 2)}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
