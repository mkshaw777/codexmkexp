import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { createAdvance, getAllStaff, getAdvances, getAdvanceExpenseStatus, type Advance } from '../lib/data';
import { getCurrentUser, initializeDefaultUsers } from '../lib/auth';
import { CalendarDays, IndianRupee } from 'lucide-react';

interface AdminAdvanceFormProps {
  onSuccess?: () => void;
}

export default function AdminAdvanceForm({ onSuccess }: AdminAdvanceFormProps) {
  const currentUser = getCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [formData, setFormData] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    amount: '' as any,
    description: '',
  });

  // Load staff list on component mount and ensure users are initialized
  useEffect(() => {
    console.log('🔄 AdminAdvanceForm: Loading staff list...');
    initializeDefaultUsers(); // Ensure users exist
    const staff = getAllStaff();
    console.log('📋 AdminAdvanceForm: Staff loaded:', staff.length);
    setStaffList(staff);
    
    if (staff.length === 0) {
      console.error('❌ AdminAdvanceForm: No staff found! localStorage might need reset');
    }
  }, []);

  // Load advances list
  useEffect(() => {
    loadAdvances();
  }, [refreshTrigger]);

  const loadAdvances = () => {
    const allAdvances = getAdvances();
    // Sort by createdAt timestamp - newest first (most recent entry at top)
    setAdvances(allAdvances.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA; // Descending order - newest first
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Not authenticated');
      return;
    }

    if (!formData.staffId) {
      toast.error('Please select a staff member');
      return;
    }

    const amountValue = Number(formData.amount);
    if (!formData.amount || amountValue <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      createAdvance({
        userId: formData.staffId,
        adminId: currentUser.id,
        staffId: formData.staffId,
        date: formData.date,
        amount: amountValue,
        remainingBalance: amountValue,
        status: 'active',
        description: formData.description,
        totalExpenses: 0,
        balanceToSettle: 0,
        settlementStatus: 'pending',
      });

      toast.success('✅ Advance given successfully!');
      
      // Reset form
      setFormData({
        staffId: '',
        date: new Date().toISOString().split('T')[0],
        amount: '' as any,
        description: '',
      });

      // Refresh advances list
      setRefreshTrigger(prev => prev + 1);

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to give advance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStaffInfo = (staffId: string) => {
    return staffList.find(s => s.id === staffId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Give Advance to Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Staff Member {staffList.length > 0 && <span className="text-xs text-muted-foreground">({staffList.length} staff available)</span>}</Label>
              <Select value={formData.staffId} onValueChange={(value) => setFormData({ ...formData, staffId: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      <p>No staff members found</p>
                      <p className="text-xs mt-2">Please refresh the page or clear browser data</p>
                    </div>
                  ) : (
                    staffList.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.fullName} ({staff.staffCode})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value as any })}
                  placeholder="Enter amount"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Purpose of advance..."
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Processing...' : 'Give Advance'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Advances List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Advances</span>
            <Badge variant="outline" className="text-sm">
              {advances.length} {advances.length === 1 ? 'advance' : 'advances'} given
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {advances.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Staff Code</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advances.map((advance) => {
                    const staff = getStaffInfo(advance.staffId);
                    const expenseStatus = getAdvanceExpenseStatus(advance.id);
                    
                    return (
                      <TableRow key={advance.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-muted-foreground" />
                            {new Date(advance.date).toLocaleDateString('en-IN')}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {staff?.fullName || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{staff?.staffCode || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <div className="flex items-center justify-end gap-1">
                            <IndianRupee className="w-4 h-4" />
                            {advance.amount.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {advance.description || '-'}
                        </TableCell>
                        <TableCell>
                          {expenseStatus.hasExpense && expenseStatus.isPending ? (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              Expense Pending
                            </Badge>
                          ) : advance.settlementStatus === 'settled' ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Settled
                            </Badge>
                          ) : !expenseStatus.hasExpense ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                              {advance.status}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <IndianRupee className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No advances found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Fill the form above to give advance to staff
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
