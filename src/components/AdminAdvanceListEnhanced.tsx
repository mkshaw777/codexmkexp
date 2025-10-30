import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { getAdvances, calculateAdvanceBalance, updateAdvance, getAllStaff, getAdvanceExpenseStatus, updateExpense, type Advance, type Expense } from '../lib/data';
import { toast } from 'sonner@2.0.3';
import { Search, CheckCircle, Eye, AlertCircle, Plus, Upload, X, IndianRupee } from 'lucide-react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { createExpense } from '../lib/data';
import { getCurrentUser } from '../lib/auth';
import BillImageViewer from './BillImageViewer';

interface AdminAdvanceListEnhancedProps {
  refreshTrigger?: number;
  onUpdate?: () => void;
}

export default function AdminAdvanceListEnhanced({ refreshTrigger, onUpdate }: AdminAdvanceListEnhancedProps) {
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [filteredAdvances, setFilteredAdvances] = useState<Advance[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [settlementDialog, setSettlementDialog] = useState<{
    open: boolean;
    advance: Advance | null;
  }>({
    open: false,
    advance: null,
  });
  const [expenseViewDialog, setExpenseViewDialog] = useState<{
    open: boolean;
    expense: Expense | null;
    advance: Advance | null;
  }>({
    open: false,
    expense: null,
    advance: null,
  });
  const [addExpenseDialog, setAddExpenseDialog] = useState<{
    open: boolean;
    advance: Advance | null;
  }>({
    open: false,
    advance: null,
  });
  const [expenseFormData, setExpenseFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Transport' as const,
    categoryDetail: '',
    fare: '' as any,
    parking: '' as any,
    oil: '' as any,
    breakfast: '' as any,
    others: '' as any,
    numberOfCases: '' as any,
    remarks: '',
  });
  const [oilBillFiles, setOilBillFiles] = useState<File[]>([]);
  const [transportBillFiles, setTransportBillFiles] = useState<File[]>([]);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  
  // Purchase Tours (for Bazar category)
  const [purchaseTours, setPurchaseTours] = useState<Array<{ supplierName: string; amount: number }>>([]);
  
  // Printer and Designer entries (for Sealdah category)
  const [printerEntries, setPrinterEntries] = useState<Array<{ name: string; amount: number }>>([]);
  const [designerEntries, setDesignerEntries] = useState<Array<{ name: string; amount: number }>>([]);
  const staffList = getAllStaff();
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadAdvances();
  }, [refreshTrigger]);

  useEffect(() => {
    filterAdvances();
  }, [advances, selectedStaff, searchTerm]);

  const loadAdvances = () => {
    const data = getAdvances();
    setAdvances(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const filterAdvances = () => {
    let filtered = advances;

    if (selectedStaff !== 'all') {
      filtered = filtered.filter(a => a.staffId === selectedStaff);
    }

    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(a.date).toLocaleDateString('en-IN').includes(searchTerm)
      );
    }

    setFilteredAdvances(filtered);
  };

  const openSettlementDialog = (advance: Advance) => {
    setSettlementDialog({ open: true, advance });
  };

  const openExpenseView = (advance: Advance) => {
    const expenseStatus = getAdvanceExpenseStatus(advance.id);
    setExpenseViewDialog({
      open: true,
      expense: expenseStatus.expense,
      advance,
    });
  };

  const handleSettleAdvance = () => {
    if (!settlementDialog.advance) return;

    const advanceId = settlementDialog.advance.id;
    const expenseStatus = getAdvanceExpenseStatus(advanceId);

    // Update advance status
    const updated = updateAdvance(advanceId, {
      settlementStatus: 'settled',
      status: 'settled'
    });

    // If expense exists, mark it as settled too
    if (expenseStatus.expense) {
      updateExpense(expenseStatus.expense.id, {
        settlementStatus: 'settled'
      });
    }

    if (updated) {
      toast.success('✅ Advance settled successfully!');
      setSettlementDialog({ open: false, advance: null });
      loadAdvances();
      if (onUpdate) onUpdate();
    } else {
      toast.error('Failed to settle advance');
    }
  };

  const openAddExpenseDialog = (advance: Advance) => {
    // Reset form
    setExpenseFormData({
      date: new Date().toISOString().split('T')[0],
      category: 'Transport',
      categoryDetail: '',
      fare: '' as any,
      parking: '' as any,
      oil: '' as any,
      breakfast: '' as any,
      others: '' as any,
      numberOfCases: '' as any,
      remarks: '',
    });
    setOilBillFiles([]);
    setTransportBillFiles([]);
    setPurchaseTours([]);
    setPrinterEntries([]);
    setDesignerEntries([]);
    setAddExpenseDialog({ open: true, advance });
  };

  // Purchase Tour Functions
  const addPurchaseTour = () => {
    if (purchaseTours.length < 6) {
      setPurchaseTours([...purchaseTours, { supplierName: '', amount: 0 }]);
    }
  };

  const removePurchaseTour = (index: number) => {
    setPurchaseTours(purchaseTours.filter((_, i) => i !== index));
  };

  const updatePurchaseTour = (index: number, field: 'supplierName' | 'amount', value: string | number) => {
    const updated = [...purchaseTours];
    updated[index] = { ...updated[index], [field]: value };
    setPurchaseTours(updated);
  };

  // Printer Entry Functions
  const addPrinterEntry = () => {
    if (printerEntries.length < 6) {
      setPrinterEntries([...printerEntries, { name: '', amount: 0 }]);
    }
  };

  const removePrinterEntry = (index: number) => {
    setPrinterEntries(printerEntries.filter((_, i) => i !== index));
  };

  const updatePrinterEntry = (index: number, field: 'name' | 'amount', value: string | number) => {
    const updated = [...printerEntries];
    updated[index] = { ...updated[index], [field]: value };
    setPrinterEntries(updated);
  };

  // Designer Entry Functions
  const addDesignerEntry = () => {
    if (designerEntries.length < 6) {
      setDesignerEntries([...designerEntries, { name: '', amount: 0 }]);
    }
  };

  const removeDesignerEntry = (index: number) => {
    setDesignerEntries(designerEntries.filter((_, i) => i !== index));
  };

  const updateDesignerEntry = (index: number, field: 'name' | 'amount', value: string | number) => {
    const updated = [...designerEntries];
    updated[index] = { ...updated[index], [field]: value };
    setDesignerEntries(updated);
  };

  const calculateExpenseTotal = () => {
    const fare = Number(expenseFormData.fare) || 0;
    const parking = Number(expenseFormData.parking) || 0;
    const oil = Number(expenseFormData.oil) || 0;
    const breakfast = Number(expenseFormData.breakfast) || 0;
    const others = Number(expenseFormData.others) || 0;
    const transportTotal = fare + parking + oil + breakfast + others;
    const purchaseTotal = purchaseTours.reduce((sum, tour) => sum + tour.amount, 0);
    const printerTotal = printerEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const designerTotal = designerEntries.reduce((sum, entry) => sum + entry.amount, 0);
    return transportTotal + purchaseTotal + printerTotal + designerTotal;
  };

  const handleExpenseSubmit = async () => {
    if (!currentUser || !addExpenseDialog.advance) {
      toast.error('Authentication error');
      return;
    }

    const total = calculateExpenseTotal();
    if (total <= 0) {
      toast.error('Total expense must be greater than 0');
      return;
    }

    setIsSubmittingExpense(true);

    try {
      // Convert files to base64
      const billUrls: string[] = [];
      
      for (const file of oilBillFiles) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        billUrls.push(base64);
      }
      
      for (const file of transportBillFiles) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        billUrls.push(base64);
      }

      createExpense({
        userId: addExpenseDialog.advance.staffId,
        advanceId: addExpenseDialog.advance.id,
        date: expenseFormData.date,
        category: expenseFormData.category,
        categoryDetail: expenseFormData.categoryDetail,
        fare: Number(expenseFormData.fare) || 0,
        parking: Number(expenseFormData.parking) || 0,
        oil: Number(expenseFormData.oil) || 0,
        breakfast: Number(expenseFormData.breakfast) || 0,
        others: Number(expenseFormData.others) || 0,
        total,
        numberOfCases: Number(expenseFormData.numberOfCases) || 0,
        billUrls,
        remarks: expenseFormData.remarks + '\n\n[Submitted by Admin on behalf of staff]',
        submittedToAdmin: true,
        settlementStatus: 'pending',
        purchaseTours: purchaseTours.length > 0 ? purchaseTours : undefined,
        printerEntries: printerEntries.length > 0 ? printerEntries : undefined,
        designerEntries: designerEntries.length > 0 ? designerEntries : undefined,
      });

      toast.success('✅ Expense submitted successfully!');
      setAddExpenseDialog({ open: false, advance: null });
      loadAdvances();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast.error('Failed to submit expense');
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const getStaffName = (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    return staff ? `${staff.fullName} (${staff.staffCode})` : 'Unknown';
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
        <CardTitle>Staff Advances - Settlement Management</CardTitle>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by description or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
        {filteredAdvances.length > 0 ? (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Advance</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvances.map((advance) => {
                  const { spent, balance } = calculateAdvanceBalance(advance.id);
                  const expenseStatus = getAdvanceExpenseStatus(advance.id);
                  
                  return (
                    <TableRow key={advance.id}>
                      <TableCell>
                        {new Date(advance.date).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell className="text-sm">{getStaffName(advance.staffId)}</TableCell>
                      <TableCell>{advance.description || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{advance.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{spent.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={balance < 0 ? 'text-red-600 font-medium' : balance > 0 ? 'text-green-600 font-medium' : 'text-gray-600'}>
                          {balance > 0 ? '+' : ''}₹{balance.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {expenseStatus.hasExpense && expenseStatus.isPending ? (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Pending Approval
                          </Badge>
                        ) : advance.settlementStatus === 'settled' ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Settled
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-center">
                          {/* Add Expense Button - Show only if no expense yet */}
                          {!expenseStatus.hasExpense && advance.status === 'active' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openAddExpenseDialog(advance)}
                              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Expense
                            </Button>
                          )}

                          {/* View Expenses Button */}
                          {expenseStatus.hasExpense && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openExpenseView(advance)}
                              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          )}
                          
                          {/* Settle Button */}
                          {advance.status === 'active' && advance.settlementStatus !== 'settled' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openSettlementDialog(advance)}
                              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Settle
                            </Button>
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
      </CardContent>

      {/* Expense View Dialog */}
      <Dialog open={expenseViewDialog.open} onOpenChange={(open) => setExpenseViewDialog({ open, expense: null, advance: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
            <DialogDescription>
              Review expense submitted against this advance
            </DialogDescription>
          </DialogHeader>
          
          {expenseViewDialog.expense && expenseViewDialog.advance && (() => {
            const expense = expenseViewDialog.expense;
            const advance = expenseViewDialog.advance;
            const staff = staffList.find(s => s.id === advance.staffId);
            
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
                      <p className="text-sm text-muted-foreground">{expense.remarks}</p>
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
                    expenseName={`${getStaffName(expense.userId)}-${expense.category}-${expense.date}`}
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

      {/* Settlement Confirmation Dialog */}
      <Dialog open={settlementDialog.open} onOpenChange={(open) => setSettlementDialog({ open, advance: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settle Advance</DialogTitle>
            <DialogDescription>
              Confirm settlement for this advance
            </DialogDescription>
          </DialogHeader>
          
          {settlementDialog.advance && (() => {
            const { spent, balance } = calculateAdvanceBalance(settlementDialog.advance.id);
            const expenseStatus = getAdvanceExpenseStatus(settlementDialog.advance.id);
            const staff = staffList.find(s => s.id === settlementDialog.advance!.staffId);
            
            return (
              <div className="space-y-4">
                {/* Staff Info */}
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Staff Member:</p>
                  <p className="text-lg">{staff?.fullName} ({staff?.staffCode})</p>
                </div>

                {/* Advance Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Advance Given</p>
                    <p className="text-lg font-medium">₹{settlementDialog.advance.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount Spent</p>
                    <p className="text-lg font-medium">₹{spent.toFixed(2)}</p>
                  </div>
                </div>

                {/* Balance Info */}
                <div className={`p-4 rounded-lg border-2 ${
                  balance > 0 ? 'bg-orange-50 border-orange-200' :
                  balance < 0 ? 'bg-purple-50 border-purple-200' :
                  'bg-teal-50 border-teal-200'
                }`}>
                  <p className="text-sm font-medium mb-1">
                    {balance > 0 ? '💰 Staff to Return:' :
                     balance < 0 ? '💸 Company to Pay Staff:' :
                     '✅ Balanced - No Settlement Required'}
                  </p>
                  <p className={`text-2xl font-bold ${
                    balance > 0 ? 'text-orange-700' :
                    balance < 0 ? 'text-purple-700' :
                    'text-teal-700'
                  }`}>
                    ₹{Math.abs(balance).toFixed(2)}
                  </p>
                </div>

                {/* Expense Status */}
                {expenseStatus.hasExpense ? (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900">Expense Submitted ✓</p>
                      <p className="text-sm text-blue-700">
                        Staff has submitted expense report for this advance.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-900">No Expense Submitted</p>
                      <p className="text-sm text-yellow-700">
                        Staff hasn't submitted expense report yet.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettlementDialog({ open: false, advance: null })}>
              Cancel
            </Button>
            <Button onClick={handleSettleAdvance} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Settlement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={addExpenseDialog.open} onOpenChange={(open) => setAddExpenseDialog({ open, advance: null })}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Expense on Behalf of Staff</DialogTitle>
            <DialogDescription>
              Submit expense for {addExpenseDialog.advance && getStaffName(addExpenseDialog.advance.staffId)}
            </DialogDescription>
          </DialogHeader>

          {addExpenseDialog.advance && (
            <div className="space-y-4">
              {/* Advance Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Advance Amount</p>
                    <p className="text-xl font-bold">₹{addExpenseDialog.advance.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{new Date(addExpenseDialog.advance.date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </div>
              </div>

              {/* Date and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exp-date">Date *</Label>
                  <Input
                    id="exp-date"
                    type="date"
                    value={expenseFormData.date}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exp-category">Category *</Label>
                  <select
                    id="exp-category"
                    value={expenseFormData.category}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value as any })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  >
                    <option value="Transport">Transport</option>
                    <option value="Bazar">Bazar</option>
                    <option value="Sealdah">Sealdah</option>
                    <option value="Out Station">Out Station</option>
                    <option value="Paglahat">Paglahat</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              {/* Category Detail */}
              <div className="space-y-2">
                <Label htmlFor="exp-detail">Category Detail</Label>
                <Input
                  id="exp-detail"
                  value={expenseFormData.categoryDetail}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, categoryDetail: e.target.value })}
                  placeholder="e.g., Location, Purpose"
                />
              </div>

              {/* Expense Fields */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exp-fare">Fare (₹)</Label>
                  <Input
                    id="exp-fare"
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenseFormData.fare}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, fare: e.target.value as any })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exp-parking">Parking (₹)</Label>
                  <Input
                    id="exp-parking"
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenseFormData.parking}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, parking: e.target.value as any })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exp-oil">Oil (₹)</Label>
                  <Input
                    id="exp-oil"
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenseFormData.oil}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, oil: e.target.value as any })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exp-breakfast">Breakfast (₹)</Label>
                  <Input
                    id="exp-breakfast"
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenseFormData.breakfast}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, breakfast: e.target.value as any })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exp-others">Others (₹)</Label>
                  <Input
                    id="exp-others"
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenseFormData.others}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, others: e.target.value as any })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exp-cases">Cases</Label>
                  <Input
                    id="exp-cases"
                    type="number"
                    min="0"
                    value={expenseFormData.numberOfCases}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, numberOfCases: e.target.value as any })}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Purchase Tour Section - Only for Bazar */}
              {expenseFormData.category === 'Bazar' && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="text-lg">Purchase Tours</Label>
                      <span className="text-sm text-gray-500">
                        ({purchaseTours.length}/6)
                      </span>
                    </div>
                    {purchaseTours.length < 6 && (
                      <Button
                        type="button"
                        onClick={addPurchaseTour}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Purchase
                      </Button>
                    )}
                  </div>

                  {purchaseTours.length === 0 && (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed">
                      <p className="text-gray-500">No purchase tours added yet. Click "Add Purchase" to start.</p>
                    </div>
                  )}

                  {purchaseTours.map((tour, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`supplier-${index}`}>
                          Supplier Name <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          id={`supplier-${index}`}
                          type="text"
                          value={tour.supplierName}
                          onChange={(e) => updatePurchaseTour(index, 'supplierName', e.target.value)}
                          placeholder="Enter supplier name..."
                          required
                        />
                      </div>

                      <div className="space-y-2 flex flex-col">
                        <Label htmlFor={`amount-${index}`}>
                          Amount (₹) <span className="text-red-600">*</span>
                        </Label>
                        <div className="flex gap-2 flex-1">
                          <Input
                            id={`amount-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={tour.amount || ''}
                            onChange={(e) => updatePurchaseTour(index, 'amount', e.target.value ? Number(e.target.value) : 0)}
                            placeholder="0"
                            required
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removePurchaseTour(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {purchaseTours.length > 0 && (
                    <div className="flex justify-end items-center gap-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="text-sm">Purchase Total:</span>
                      <span className="font-semibold text-purple-700">
                        ₹{purchaseTours.reduce((sum, tour) => sum + tour.amount, 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Sealdah Category - Printer & Designer Entries */}
              {expenseFormData.category === 'Sealdah' && (
                <div className="space-y-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                  {/* Printer Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-teal-900">Printer</h3>
                      {printerEntries.length < 6 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addPrinterEntry}
                          className="border-teal-400 text-teal-700 hover:bg-teal-100"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Printer Entry
                        </Button>
                      )}
                    </div>

                    {printerEntries.map((entry, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-teal-200">
                        <div className="space-y-2">
                          <Label htmlFor={`printer-name-${index}`}>
                            Printer Name <span className="text-red-600">*</span>
                          </Label>
                          <Input
                            id={`printer-name-${index}`}
                            type="text"
                            value={entry.name}
                            onChange={(e) => updatePrinterEntry(index, 'name', e.target.value)}
                            placeholder="Enter printer name..."
                            required
                          />
                        </div>

                        <div className="space-y-2 flex flex-col">
                          <Label htmlFor={`printer-amount-${index}`}>
                            Amount (₹) <span className="text-red-600">*</span>
                          </Label>
                          <div className="flex gap-2 flex-1">
                            <Input
                              id={`printer-amount-${index}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={entry.amount || ''}
                              onChange={(e) => updatePrinterEntry(index, 'amount', e.target.value ? Number(e.target.value) : 0)}
                              placeholder="0"
                              required
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removePrinterEntry(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Designer Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-teal-900">Designer</h3>
                      {designerEntries.length < 6 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addDesignerEntry}
                          className="border-teal-400 text-teal-700 hover:bg-teal-100"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Designer Entry
                        </Button>
                      )}
                    </div>

                    {designerEntries.map((entry, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-teal-200">
                        <div className="space-y-2">
                          <Label htmlFor={`designer-name-${index}`}>
                            Designer Name <span className="text-red-600">*</span>
                          </Label>
                          <Input
                            id={`designer-name-${index}`}
                            type="text"
                            value={entry.name}
                            onChange={(e) => updateDesignerEntry(index, 'name', e.target.value)}
                            placeholder="Enter designer name..."
                            required
                          />
                        </div>

                        <div className="space-y-2 flex flex-col">
                          <Label htmlFor={`designer-amount-${index}`}>
                            Amount (₹) <span className="text-red-600">*</span>
                          </Label>
                          <div className="flex gap-2 flex-1">
                            <Input
                              id={`designer-amount-${index}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={entry.amount || ''}
                              onChange={(e) => updateDesignerEntry(index, 'amount', e.target.value ? Number(e.target.value) : 0)}
                              placeholder="0"
                              required
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeDesignerEntry(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sealdah Total Display */}
                  {(printerEntries.length > 0 || designerEntries.length > 0) && (
                    <div className="flex justify-end items-center gap-4 p-3 bg-teal-600 text-white rounded-lg">
                      <span className="text-sm">Sealdah Total:</span>
                      <span className="font-semibold">
                        ₹{(
                          printerEntries.reduce((sum, e) => sum + e.amount, 0) +
                          designerEntries.reduce((sum, e) => sum + e.amount, 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Total Display */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Expense:</span>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-5 h-5" />
                    <span className="text-xl font-bold">₹{calculateExpenseTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Bill Uploads */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Oil Bills (Optional)</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setOilBillFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
                      className="hidden"
                      id="exp-oil-bills"
                    />
                    <label htmlFor="exp-oil-bills" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload oil bills</span>
                    </label>
                  </div>
                  {oilBillFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {oilBillFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Oil bill ${index + 1}`}
                            className="w-20 h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => setOilBillFiles(prev => prev.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Transport Bills (Optional)</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setTransportBillFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
                      className="hidden"
                      id="exp-transport-bills"
                    />
                    <label htmlFor="exp-transport-bills" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload transport bills</span>
                    </label>
                  </div>
                  {transportBillFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {transportBillFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Transport bill ${index + 1}`}
                            className="w-20 h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => setTransportBillFiles(prev => prev.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <Label htmlFor="exp-remarks">Remarks</Label>
                <Textarea
                  id="exp-remarks"
                  value={expenseFormData.remarks}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, remarks: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddExpenseDialog({ open: false, advance: null })}>
              Cancel
            </Button>
            <Button onClick={handleExpenseSubmit} disabled={isSubmittingExpense}>
              {isSubmittingExpense ? 'Submitting...' : 'Submit Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
