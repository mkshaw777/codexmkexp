import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getExpenses, deleteExpense, type Expense } from '../lib/data';
import { getCurrentUser } from '../lib/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface ExpenseListProps {
  userId?: string;
  refreshTrigger?: number;
}

export default function ExpenseList({ userId, refreshTrigger }: ExpenseListProps) {
  const currentUser = getCurrentUser();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadExpenses();
  }, [userId, refreshTrigger]);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, dateFrom, dateTo]);

  const loadExpenses = () => {
    if (currentUser) {
      const targetUserId = currentUser.role === 'admin' && !userId ? undefined : userId || currentUser.id;
      const data = getExpenses(targetUserId);
      setExpenses(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  const filterExpenses = () => {
    let filtered = [...expenses];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.category.toLowerCase().includes(term) ||
          e.categoryDetail.toLowerCase().includes(term) ||
          e.remarks.toLowerCase().includes(term)
      );
    }

    if (dateFrom) {
      filtered = filtered.filter((e) => e.date >= dateFrom);
    }

    if (dateTo) {
      filtered = filtered.filter((e) => e.date <= dateTo);
    }

    setFilteredExpenses(filtered);
  };

  const handleDelete = (id: string) => {
    if (deleteExpense(id)) {
      toast.success('Expense deleted successfully');
      loadExpenses();
    } else {
      toast.error('Failed to delete expense');
    }
    setDeleteId(null);
  };

  const getTotalExpenses = () => {
    return filteredExpenses.reduce((sum, e) => sum + e.total, 0);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Transport':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Bazar':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Sealdah':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Out Station':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Paglahat':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Others':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return '';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Input
                type="date"
                placeholder="From date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <Input
                type="date"
                placeholder="To date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            {filteredExpenses.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Sub Category</TableHead>
                        <TableHead className="text-right">Cases</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>
                            {new Date(expense.date).toLocaleDateString('en-IN')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getCategoryBadgeColor(expense.category)}>
                              {expense.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{expense.categoryDetail || '-'}</TableCell>
                          <TableCell className="text-right">{expense.numberOfCases}</TableCell>
                          <TableCell className="text-right">
                            ₹{expense.total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(expense.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span>Total Expenses</span>
                  <span>
                    ₹{getTotalExpenses().toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No expenses found</p>
                <p className="text-sm mt-2">Add your first expense to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
