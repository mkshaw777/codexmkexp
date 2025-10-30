import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { getAdvances, calculateAdvanceBalance, getAdvanceExpenseStatus, type Advance } from '../lib/data';
import { getCurrentUser } from '../lib/auth';
import StaffExpenseForm from './StaffExpenseForm';
import { PlusCircle, Edit, FileText } from 'lucide-react';

interface StaffAdvanceListProps {
  refreshTrigger?: number;
}

export default function StaffAdvanceList({ refreshTrigger }: StaffAdvanceListProps) {
  const currentUser = getCurrentUser();
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [selectedAdvanceId, setSelectedAdvanceId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isWithoutAdvanceDialogOpen, setIsWithoutAdvanceDialogOpen] = useState(false);

  useEffect(() => {
    loadAdvances();
  }, [refreshTrigger]);

  const loadAdvances = () => {
    if (currentUser) {
      const data = getAdvances(currentUser.id);
      setAdvances(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  const handleExpenseSuccess = () => {
    setIsDialogOpen(false);
    loadAdvances();
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

  const getSettlementBadge = (balance: number, status: 'pending' | 'settled') => {
    if (status === 'settled') {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Settled</Badge>;
    }
    
    if (balance > 0) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">To Return: ₹{balance.toFixed(2)}</Badge>;
    } else if (balance < 0) {
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">To Receive: ₹{Math.abs(balance).toFixed(2)}</Badge>;
    } else {
      return <Badge className="bg-teal-100 text-teal-800 border-teal-200">Balanced</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Advances</CardTitle>
          <Dialog open={isWithoutAdvanceDialogOpen} onOpenChange={setIsWithoutAdvanceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100">
                <FileText className="w-4 h-4 mr-2" />
                Add Without Advance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Add Expense Without Advance</DialogTitle>
                <DialogDescription>
                  Submit emergency expense without having an advance
                </DialogDescription>
              </DialogHeader>
              <StaffExpenseForm 
                isWithoutAdvance={true}
                onSuccess={() => {
                  setIsWithoutAdvanceDialogOpen(false);
                  loadAdvances();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {advances.length > 0 ? (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Advance</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Settlement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advances.map((advance) => {
                  const { spent, balance } = calculateAdvanceBalance(advance.id);
                  const expenseStatus = getAdvanceExpenseStatus(advance.id);
                  
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
                        <span className={balance < 0 ? 'text-red-600' : balance > 0 ? 'text-green-600' : 'text-gray-600'}>
                          ₹{balance.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getSettlementBadge(balance, advance.settlementStatus || 'pending')}
                      </TableCell>
                      <TableCell>
                        {expenseStatus.hasExpense && expenseStatus.isPending ? (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Approval</Badge>
                        ) : (
                          getStatusBadge(advance.status)
                        )}
                      </TableCell>
                      <TableCell>
                        {advance.status === 'active' && (
                          expenseStatus.hasExpense && expenseStatus.isPending ? (
                            // Show Modify button when expense exists and is pending
                            <Dialog open={isDialogOpen && selectedAdvanceId === advance.id} onOpenChange={(open) => {
                              setIsDialogOpen(open);
                              if (open) setSelectedAdvanceId(advance.id);
                            }}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                                  <Edit className="w-4 h-4 mr-1" />
                                  Modify
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Modify Expense (Pending Approval)</DialogTitle>
                                  <DialogDescription>
                                    Update your expense details before final approval
                                  </DialogDescription>
                                </DialogHeader>
                                <StaffExpenseForm 
                                  preSelectedAdvanceId={advance.id}
                                  existingExpense={expenseStatus.expense || undefined}
                                  onSuccess={handleExpenseSuccess}
                                />
                              </DialogContent>
                            </Dialog>
                          ) : !expenseStatus.hasExpense ? (
                            // Show Add button only when no expense exists
                            <Dialog open={isDialogOpen && selectedAdvanceId === advance.id} onOpenChange={(open) => {
                              setIsDialogOpen(open);
                              if (open) setSelectedAdvanceId(advance.id);
                            }}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <PlusCircle className="w-4 h-4 mr-1" />
                                  Add Expense
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Add Expense</DialogTitle>
                                  <DialogDescription>
                                    Submit your expense details against this advance
                                  </DialogDescription>
                                </DialogHeader>
                                <StaffExpenseForm 
                                  preSelectedAdvanceId={advance.id} 
                                  onSuccess={handleExpenseSuccess}
                                />
                              </DialogContent>
                            </Dialog>
                          ) : (
                            // Settled expenses show nothing
                            <span className="text-xs text-muted-foreground">Settled</span>
                          )
                        )}
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
      </CardContent>
    </Card>
  );
}
