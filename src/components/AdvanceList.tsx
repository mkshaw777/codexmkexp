import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { getAdvances, getExpenses, type Advance } from '../lib/data';
import { getCurrentUser } from '../lib/auth';

interface AdvanceListProps {
  userId?: string;
  refreshTrigger?: number;
}

export default function AdvanceList({ userId, refreshTrigger }: AdvanceListProps) {
  const currentUser = getCurrentUser();
  const [advances, setAdvances] = useState<Advance[]>([]);

  useEffect(() => {
    loadAdvances();
  }, [userId, refreshTrigger]);

  const loadAdvances = () => {
    if (currentUser) {
      const targetUserId = userId || currentUser.id;
      const data = getAdvances(targetUserId);
      setAdvances(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  const getSpentAmount = (advanceId: string, staffId: string) => {
    const expenses = getExpenses(staffId);
    const advanceDate = advances.find(a => a.id === advanceId)?.date;
    if (!advanceDate) return 0;

    return expenses
      .filter(e => e.date >= advanceDate)
      .reduce((sum, e) => sum + e.total, 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'settled':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Settled</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advances</CardTitle>
      </CardHeader>
      <CardContent>
        {advances.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advances.map((advance) => {
                  const spent = getSpentAmount(advance.id, advance.staffId);
                  const remaining = advance.amount - spent;
                  
                  return (
                    <TableRow key={advance.id}>
                      <TableCell>
                        {new Date(advance.date).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell>{advance.description || '-'}</TableCell>
                      <TableCell className="text-right">
                        ₹{advance.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{spent.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={remaining < 0 ? 'text-red-600' : 'text-green-600'}>
                          ₹{remaining.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(advance.status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No advances found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
