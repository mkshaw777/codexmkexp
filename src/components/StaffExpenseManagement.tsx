import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getAllStaff, getAdvances, getAdvanceExpenseStatus, calculateAdvanceBalance, getExpenses, type Advance, type Expense } from '../lib/data';
import { Eye, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import BillImageViewer from './BillImageViewer';
import { Alert, AlertDescription } from './ui/alert';

export default function StaffExpenseManagement() {
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [filteredAdvances, setFilteredAdvances] = useState<Advance[]>([]);
  const [withoutAdvanceExpenses, setWithoutAdvanceExpenses] = useState<Expense[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expenseViewDialog, setExpenseViewDialog] = useState<{
    open: boolean;
    expense: Expense | null;
    advance: Advance | null;
  }>({
    open: false,
    expense: null,
    advance: null,
  });
  const [withoutAdvanceViewDialog, setWithoutAdvanceViewDialog] = useState<{
    open: boolean;
    expense: Expense | null;
  }>({
    open: false,
    expense: null,
  });

  
  const staffList = getAllStaff();

  useEffect(() => {
    loadAdvances();
    loadWithoutAdvanceExpenses();
  }, []);

  useEffect(() => {
    filterAdvances();
  }, [advances, selectedStaff, searchTerm]);

  const loadAdvances = () => {
    const allAdvances = getAdvances();
    // Sort by date - newest first
    setAdvances(allAdvances.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const loadWithoutAdvanceExpenses = () => {
    const allExpenses = getExpenses();
    // Filter expenses with WITHOUT_ADVANCE advanceId
    const withoutAdvance = allExpenses.filter(e => e.advanceId === 'WITHOUT_ADVANCE');
    // Sort by date - newest first
    setWithoutAdvanceExpenses(withoutAdvance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const filterAdvances = () => {
    let filtered = advances;

    if (selectedStaff !== 'all') {
      filtered = filtered.filter(a => a.staffId === selectedStaff);
    }

    if (searchTerm) {
      filtered = filtered.filter(a => {
        const staff = staffList.find(s => s.id === a.staffId);
        return (
          a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff?.staffCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredAdvances(filtered);
  };

  const openExpenseView = (advance: Advance) => {
    const expenseStatus = getAdvanceExpenseStatus(advance.id);
    setExpenseViewDialog({
      open: true,
      expense: expenseStatus.expense,
      advance,
    });
  };



  const getStaffInfo = (staffId: string) => {
    return staffList.find(s => s.id === staffId);
  };

  // Calculate summary statistics
  const stats = {
    totalStaff: staffList.length,
    totalAdvances: advances.length,
    totalAdvanceAmount: advances.reduce((sum, a) => sum + a.amount, 0),
    totalExpenseAmount: advances.reduce((sum, a) => {
      const { spent } = calculateAdvanceBalance(a.id);
      return sum + spent;
    }, 0),
    netBalance: 0,
    pendingAndUnsubmittedTotal: 0,
    unsubmittedCount: 0,
    pendingCount: 0,
  };
  stats.netBalance = stats.totalAdvanceAmount - stats.totalExpenseAmount;
  
  // Calculate Pending & Unsubmitted totals
  advances.forEach(advance => {
    const expenseStatus = getAdvanceExpenseStatus(advance.id);
    
    // Unsubmitted: Advance without any expense
    if (!expenseStatus.hasExpense) {
      stats.pendingAndUnsubmittedTotal += advance.amount;
      stats.unsubmittedCount++;
    }
    // Pending Approval: Expense submitted but not settled
    else if (expenseStatus.isPending) {
      stats.pendingAndUnsubmittedTotal += advance.amount;
      stats.pendingCount++;
    }
  });

  const openWithoutAdvanceExpenseView = (expense: Expense) => {
    setWithoutAdvanceViewDialog({
      open: true,
      expense,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Expense Management</CardTitle>
        
        {/* Summary Cards - Mobile Friendly */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mt-4">
          <div className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Staff</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-700">{stats.totalStaff}</p>
          </div>
          <div className="p-3 sm:p-4 bg-teal-50 rounded-lg border border-teal-200">
            <p className="text-xs sm:text-sm text-muted-foreground">Advances</p>
            <p className="text-lg sm:text-2xl font-bold text-teal-700">₹{stats.totalAdvanceAmount.toFixed(0)}</p>
          </div>
          <div className="p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs sm:text-sm text-muted-foreground">Expenses</p>
            <p className="text-lg sm:text-2xl font-bold text-orange-700">₹{stats.totalExpenseAmount.toFixed(0)}</p>
          </div>
          <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
            <p className="text-lg sm:text-2xl font-bold text-yellow-700">₹{stats.pendingAndUnsubmittedTotal.toFixed(0)}</p>
            <p className="text-xs text-yellow-600 mt-1 hidden sm:block">
              {stats.unsubmittedCount > 0 && `${stats.unsubmittedCount} unsubmitted`}
              {stats.unsubmittedCount > 0 && stats.pendingCount > 0 && ' • '}
              {stats.pendingCount > 0 && `${stats.pendingCount} pending`}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs sm:text-sm text-muted-foreground">Balance</p>
            <p className={`text-lg sm:text-2xl font-bold ${stats.netBalance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              ₹{stats.netBalance.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Filters - Mobile Friendly */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search name, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
          </div>
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Filter by staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staffList.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.fullName} ({staff.staffCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="with-advance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-0">
            <TabsTrigger value="with-advance" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Advances & Expenses</span>
              <span className="sm:hidden">With Advance</span> ({filteredAdvances.length})
            </TabsTrigger>
            <TabsTrigger value="without-advance" className="relative text-xs sm:text-sm">
              <span className="hidden sm:inline">Without Advance Expenses</span>
              <span className="sm:hidden">Without Advance</span> ({withoutAdvanceExpenses.length})
              {withoutAdvanceExpenses.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-orange-500 text-white text-xs items-center justify-center">
                    {withoutAdvanceExpenses.length}
                  </span>
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Regular Advances & Expenses - Mobile Friendly */}
          <TabsContent value="with-advance" className="space-y-4">
        {filteredAdvances.length > 0 ? (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Date</TableHead>
                  <TableHead className="text-xs sm:text-sm">Staff</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Code</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Advance</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Expense</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Balance</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvances.map((advance) => {
                  const staff = getStaffInfo(advance.staffId);
                  const { spent, balance } = calculateAdvanceBalance(advance.id);
                  const expenseStatus = getAdvanceExpenseStatus(advance.id);
                  
                  return (
                    <TableRow key={advance.id}>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                        {new Date(advance.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' })}
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        <div className="max-w-[100px] sm:max-w-none truncate">
                          {staff?.fullName || 'Unknown'}
                        </div>
                        <div className="sm:hidden text-xs text-muted-foreground">
                          {staff?.staffCode}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                        <Badge variant="outline" className="text-xs">{staff?.staffCode || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs sm:text-sm whitespace-nowrap">
                        ₹{advance.amount.toFixed(0)}
                      </TableCell>
                      <TableCell className="text-right text-xs sm:text-sm whitespace-nowrap">
                        ₹{spent.toFixed(0)}
                      </TableCell>
                      <TableCell className="text-right text-xs sm:text-sm whitespace-nowrap">
                        <span className={
                          balance > 0 ? 'text-green-600 font-medium' : 
                          balance < 0 ? 'text-red-600 font-medium' : 
                          'text-gray-600'
                        }>
                          {balance > 0 ? '+' : ''}₹{balance.toFixed(0)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {expenseStatus.hasExpense && expenseStatus.isPending ? (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                            Pending
                          </Badge>
                        ) : advance.settlementStatus === 'settled' ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                            Settled
                          </Badge>
                        ) : !expenseStatus.hasExpense ? (
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
                            No Expense
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-center">
                          {/* View Expenses Button - Mobile Friendly */}
                          {expenseStatus.hasExpense ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openExpenseView(advance)}
                              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-xs sm:text-sm"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                          ) : (
                            <span className="text-xs sm:text-sm text-muted-foreground italic">-</span>
                          )}
                        </div>
                      </TableCell>
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
          </TabsContent>

          {/* Tab 2: Without Advance Expenses */}
          <TabsContent value="without-advance" className="space-y-4">
            {withoutAdvanceExpenses.length > 0 ? (
              <>
                <Alert className="bg-orange-50 border-orange-200">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    These expenses were submitted without advance. Staff may need reimbursement or advance adjustment.
                  </AlertDescription>
                </Alert>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Date</TableHead>
                        <TableHead className="text-xs sm:text-sm">Staff</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Code</TableHead>
                        <TableHead className="text-xs sm:text-sm">Category</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">Amount</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden md:table-cell">Status</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withoutAdvanceExpenses.map((expense) => {
                        const staff = staffList.find(s => s.id === expense.userId);
                        
                        return (
                          <TableRow key={expense.id}>
                            <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                              {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' })}
                            </TableCell>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              <div className="max-w-[100px] sm:max-w-none truncate">
                                {staff?.fullName || 'Unknown'}
                              </div>
                              <div className="sm:hidden text-xs text-muted-foreground">
                                {staff?.staffCode}
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                              <Badge variant="outline" className="text-xs">{staff?.staffCode || 'N/A'}</Badge>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                {expense.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium text-xs sm:text-sm whitespace-nowrap">
                              ₹{expense.total.toFixed(0)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {expense.settlementStatus === 'settled' ? (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                  Settled
                                </Badge>
                              ) : (
                                <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 justify-center">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => openWithoutAdvanceExpenseView(expense)}
                                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-xs sm:text-sm"
                                >
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                  <span className="hidden sm:inline">View</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No without-advance expenses found</p>
                <p className="text-sm mt-2">All expenses are linked to advances</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Expense View Dialog - Mobile Friendly */}
      <Dialog open={expenseViewDialog.open} onOpenChange={(open) => setExpenseViewDialog({ open, expense: null, advance: null })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
            <DialogDescription>
              Review expense submitted against this advance
            </DialogDescription>
          </DialogHeader>
          
          {expenseViewDialog.expense && expenseViewDialog.advance && (() => {
            const expense = expenseViewDialog.expense;
            const advance = expenseViewDialog.advance;
            const staff = getStaffInfo(advance.staffId);
            
            return (
              <div className="space-y-4">
                {/* Staff & Advance Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Staff Member</p>
                    <p className="font-medium">{staff?.fullName}</p>
                    <p className="text-sm text-muted-foreground">{staff?.staffCode}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Advance Given</p>
                    <p className="text-lg font-medium">₹{advance.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{new Date(advance.date).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                {/* Expense Details */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Category: {expense.category}</p>
                      <p className="text-sm text-muted-foreground">Date: {new Date(expense.date).toLocaleDateString('en-IN')}</p>
                    </div>
                    <Badge className={expense.settlementStatus === 'settled' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                      {expense.settlementStatus === 'settled' ? 'Settled' : 'Pending'}
                    </Badge>
                  </div>

                  {/* Amount Breakdown */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    {expense.fare > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Fare:</span>
                        <span className="font-medium">₹{expense.fare.toFixed(2)}</span>
                      </div>
                    )}
                    {expense.parking > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Parking:</span>
                        <span className="font-medium">₹{expense.parking.toFixed(2)}</span>
                      </div>
                    )}
                    {expense.oil > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Oil:</span>
                        <span className="font-medium">₹{expense.oil.toFixed(2)}</span>
                      </div>
                    )}
                    {expense.breakfast > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Breakfast:</span>
                        <span className="font-medium">₹{expense.breakfast.toFixed(2)}</span>
                      </div>
                    )}
                    {expense.others > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Others:</span>
                        <span className="font-medium">₹{expense.others.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between pt-3 border-t">
                    <span className="font-medium">Total Expense:</span>
                    <span className="text-lg font-bold">₹{expense.total.toFixed(2)}</span>
                  </div>

                  {/* Remarks */}
                  {expense.remarks && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium mb-1">Remarks:</p>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">{expense.remarks}</p>
                    </div>
                  )}

                  {/* Number of Cases */}
                  {expense.numberOfCases > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Number of Cases:</span>
                      <span className="font-medium">{expense.numberOfCases}</span>
                    </div>
                  )}

                  {/* Uploaded Bills/Images */}
                  <BillImageViewer 
                    billUrls={expense.billUrls || []} 
                    expenseName={`${expense.category}-${expense.date}`}
                  />
                </div>

                {/* Balance Summary */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Advance</p>
                      <p className="text-lg font-medium">₹{advance.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Spent</p>
                      <p className="text-lg font-medium">₹{expense.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className={`text-lg font-bold ${
                        advance.amount - expense.total > 0 ? 'text-green-600' : 
                        advance.amount - expense.total < 0 ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        ₹{(advance.amount - expense.total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <Button onClick={() => setExpenseViewDialog({ open: false, expense: null, advance: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Without Advance Expense View Dialog - Mobile Friendly */}
      <Dialog open={withoutAdvanceViewDialog.open} onOpenChange={(open) => setWithoutAdvanceViewDialog({ open, expense: null })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Without Advance Expense Details</DialogTitle>
            <DialogDescription>
              Expense submitted without advance - may require reimbursement
            </DialogDescription>
          </DialogHeader>
          
          {withoutAdvanceViewDialog.expense && (() => {
            const expense = withoutAdvanceViewDialog.expense;
            const staff = staffList.find(s => s.id === expense.userId);
            
            return (
              <div className="space-y-4">
                {/* Alert Banner */}
                <Alert className="bg-orange-50 border-orange-200">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 font-medium">
                    ⚠️ This expense was submitted WITHOUT ADVANCE
                  </AlertDescription>
                </Alert>

                {/* Staff Info */}
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Staff Member</p>
                  <p className="font-medium text-lg">{staff?.fullName}</p>
                  <p className="text-sm text-muted-foreground">{staff?.staffCode} • {staff?.email}</p>
                </div>

                {/* Expense Details */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Category: {expense.category}</p>
                      {expense.categoryDetail && (
                        <p className="text-sm text-muted-foreground">Detail: {expense.categoryDetail}</p>
                      )}
                      <p className="text-sm text-muted-foreground">Date: {new Date(expense.date).toLocaleDateString('en-IN')}</p>
                    </div>
                    <Badge className={expense.settlementStatus === 'settled' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}>
                      {expense.settlementStatus === 'settled' ? 'Settled' : 'Pending'}
                    </Badge>
                  </div>

                  {/* Amount Breakdown */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    {expense.fare > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Fare:</span>
                        <span className="font-medium">₹{expense.fare.toFixed(2)}</span>
                      </div>
                    )}
                    {expense.parking > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Parking:</span>
                        <span className="font-medium">₹{expense.parking.toFixed(2)}</span>
                      </div>
                    )}
                    {expense.oil > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Oil:</span>
                        <span className="font-medium">₹{expense.oil.toFixed(2)}</span>
                      </div>
                    )}
                    {expense.breakfast > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Breakfast:</span>
                        <span className="font-medium">₹{expense.breakfast.toFixed(2)}</span>
                      </div>
                    )}
                    {expense.others > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Others:</span>
                        <span className="font-medium">₹{expense.others.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between pt-3 border-t">
                    <span className="font-medium text-lg">Total Expense:</span>
                    <span className="text-2xl font-bold text-orange-600">₹{expense.total.toFixed(2)}</span>
                  </div>

                  {/* Remarks */}
                  {expense.remarks && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium mb-1">Remarks:</p>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">{expense.remarks}</p>
                    </div>
                  )}

                  {/* Number of Cases */}
                  {expense.numberOfCases > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Number of Cases:</span>
                      <span className="font-medium">{expense.numberOfCases}</span>
                    </div>
                  )}

                  {/* Uploaded Bills/Images */}
                  <BillImageViewer 
                    billUrls={expense.billUrls || []} 
                    expenseName={`${expense.category}-${expense.date}`}
                  />
                </div>

                {/* Action Note */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">📝 Next Steps:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Create an advance for this staff member if needed</li>
                    <li>• Or settle this expense directly (will create negative balance)</li>
                    <li>• Expense will move to "All Expenses" tab once action is taken</li>
                  </ul>
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <Button onClick={() => setWithoutAdvanceViewDialog({ open: false, expense: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
