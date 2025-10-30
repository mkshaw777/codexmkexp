import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { getAdvances, calculateAdvanceBalance, type Advance } from '../lib/data';
import { getCurrentUser } from '../lib/auth';
import { AlertCircle } from 'lucide-react';

export default function UnsettledAdvances() {
  const currentUser = getCurrentUser();
  const [unsettledAdvances, setUnsettledAdvances] = useState<Advance[]>([]);

  useEffect(() => {
    loadUnsettledAdvances();
  }, []);

  const loadUnsettledAdvances = () => {
    if (currentUser) {
      const allAdvances = getAdvances(currentUser.id);
      // Filter for active advances that are not settled
      const unsettled = allAdvances.filter(adv => 
        adv.status === 'active' && adv.settlementStatus !== 'settled'
      );
      setUnsettledAdvances(unsettled.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  if (unsettledAdvances.length === 0) {
    return null; // Don't show if no unsettled advances
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Unsettled Advances
          </CardTitle>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            {unsettledAdvances.length} Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Advance Amount</TableHead>
                <TableHead className="text-right">Spent</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Settlement Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unsettledAdvances.map((advance) => {
                const { spent, balance } = calculateAdvanceBalance(advance.id);
                
                return (
                  <TableRow key={advance.id}>
                    <TableCell>
                      {new Date(advance.date).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>{advance.description || '-'}</TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{advance.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{spent.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={balance < 0 ? 'text-red-600 font-medium' : balance > 0 ? 'text-green-600 font-medium' : 'text-gray-600'}>
                        ₹{balance.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {balance > 0 ? (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          To Return: ₹{balance.toFixed(2)}
                        </Badge>
                      ) : balance < 0 ? (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                          To Receive: ₹{Math.abs(balance).toFixed(2)}
                        </Badge>
                      ) : (
                        <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                          Balanced
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Note:</strong> These advances need settlement. Submit expenses against each advance or contact admin for settlement.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
