import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getExpenses, getAdvances, getAllStaff, type Expense } from '../lib/data';
import { getCurrentUser } from '../lib/auth';
import { Eye, Download, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import BillImageViewer from './BillImageViewer';

interface ExpenseListEnhancedProps {
  userId?: string;
  advanceId?: string;
  refreshTrigger?: number;
}

export default function ExpenseListEnhanced({ userId, advanceId, refreshTrigger }: ExpenseListEnhancedProps) {
  const currentUser = getCurrentUser();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadExpenses();
  }, [userId, advanceId, refreshTrigger]);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, categoryFilter, dateFilter]);

  const loadExpenses = () => {
    let data = getExpenses(userId);
    
    if (advanceId) {
      data = data.filter(e => e.advanceId === advanceId);
    }
    
    setExpenses(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const filterExpenses = () => {
    let filtered = expenses;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.categoryDetail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(e.date).toLocaleDateString('en-IN').includes(searchTerm)
      );
    }

    if (dateFilter.startDate) {
      filtered = filtered.filter(e => e.date >= dateFilter.startDate);
    }

    if (dateFilter.endDate) {
      filtered = filtered.filter(e => e.date <= dateFilter.endDate);
    }

    setFilteredExpenses(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Sub Category', 'Cases', 'Amount', 'Settlement Status', 'Remarks'];
    const rows = filteredExpenses.map(e => [
      new Date(e.date).toLocaleDateString('en-IN'),
      e.category,
      e.categoryDetail || '-',
      e.numberOfCases,
      e.total.toFixed(2),
      e.settlementStatus,
      e.remarks
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'Transport': 'bg-blue-100 text-blue-800 border-blue-200',
      'Bazar': 'bg-green-100 text-green-800 border-green-200',
      'Sealdah': 'bg-purple-100 text-purple-800 border-purple-200',
      'Out Station': 'bg-orange-100 text-orange-800 border-orange-200',
      'Paglahat': 'bg-teal-100 text-teal-800 border-teal-200',
      'Others': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    return <Badge className={colors[category] || ''}>{category}</Badge>;
  };

  const getSettlementBadge = (status: string) => {
    if (status === 'settled') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Settled</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses List</CardTitle>
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
                <SelectItem value="Bazar">Bazar</SelectItem>
                <SelectItem value="Sealdah">Sealdah</SelectItem>
                <SelectItem value="Out Station">Out Station</SelectItem>
                <SelectItem value="Paglahat">Paglahat</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              placeholder="Start Date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
            />
            <Input
              type="date"
              placeholder="End Date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredExpenses.length > 0 ? (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Sub Category</TableHead>
                    <TableHead className="text-right">Cases</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Settlement</TableHead>
                    <TableHead>Bills</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {new Date(expense.date).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell>{getCategoryBadge(expense.category)}</TableCell>
                      <TableCell>{expense.categoryDetail || '-'}</TableCell>
                      <TableCell className="text-right">{expense.numberOfCases}</TableCell>
                      <TableCell className="text-right">
                        ₹{expense.total.toFixed(2)}
                      </TableCell>
                      <TableCell>{getSettlementBadge(expense.settlementStatus)}</TableCell>
                      <TableCell>
                        {expense.billUrls && expense.billUrls.length > 0 ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" />
                                {expense.billUrls.length}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Bill Images</DialogTitle>
                              </DialogHeader>
                              <BillImageViewer 
                                billUrls={expense.billUrls} 
                                expenseName={`${expense.category}-${expense.date}`}
                              />
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-muted-foreground text-sm">No bills</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {expense.remarks || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredExpenses.length} of {expenses.length} expenses
              </p>
              <p className="text-lg">
                <span className="text-muted-foreground">Total: </span>
                <span>₹{filteredExpenses.reduce((sum, e) => sum + e.total, 0).toFixed(2)}</span>
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No expenses found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
