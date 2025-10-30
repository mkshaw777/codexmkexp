import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { 
  getCollections, 
  createCollection, 
  getAllCustomerNames,
  Collection
} from '../lib/data';
import { getCurrentUser } from '../lib/auth';
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Plus,
  Calendar,
  AlertCircle,
  TrendingUp,
  User
} from 'lucide-react';

export default function StaffCollectionEntry() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [myCollections, setMyCollections] = useState<Collection[]>([]);
  const [customerNames, setCustomerNames] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  useEffect(() => {
    loadData();
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const loadData = () => {
    const user = getCurrentUser();
    const allCollections = getCollections();
    
    // Get only this staff's collections
    const staffCollections = allCollections.filter(
      (c) => c.enteredBy === user?.id
    );
    
    setCollections(allCollections);
    setMyCollections(staffCollections);
    setCustomerNames(getAllCustomerNames());
  };

  const handleSubmitCollection = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.amount) {
      toast.error('Please fill customer name and amount');
      return;
    }

    try {
      createCollection({
        customerName: formData.customerName,
        amount: parseFloat(formData.amount),
        date: formData.date,
        enteredBy: currentUser?.id || '',
        enteredByName: currentUser?.fullName || 'Staff',
        enteredByRole: 'staff',
        approved: false, // Staff entries need admin approval
        remarks: formData.remarks || undefined,
      });

      toast.success(
        `Collection from ${formData.customerName} submitted! Waiting for admin approval.`,
        { duration: 4000 }
      );
      
      // Reset form
      setFormData({
        customerName: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        remarks: '',
      });

      loadData();
    } catch (error) {
      toast.error('Failed to submit collection');
    }
  };

  // Calculate statistics for this staff only
  const stats = {
    totalSubmitted: myCollections.length,
    totalAmount: myCollections.reduce((sum, c) => sum + c.amount, 0),
    approvedAmount: myCollections.filter(c => c.approved).reduce((sum, c) => sum + c.amount, 0),
    pendingAmount: myCollections.filter(c => !c.approved).reduce((sum, c) => sum + c.amount, 0),
    approvedCount: myCollections.filter(c => c.approved).length,
    pendingCount: myCollections.filter(c => !c.approved).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Customer Collection Entry</h2>
        <p className="text-gray-600 mt-2">Submit customer payments received in the field</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Submitted</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalSubmitted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-purple-700">₹{stats.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-700">₹{stats.approvedAmount.toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-1">{stats.approvedCount} collections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-700">₹{stats.pendingAmount.toFixed(2)}</p>
                <p className="text-xs text-yellow-600 mt-1">{stats.pendingCount} collections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Collection Form */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Plus className="w-5 h-5" />
            Submit New Collection
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold">Important:</p>
                <p>After submitting, admin will verify and approve the collection. Make sure to hand over the cash to admin for approval.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitCollection} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                  list="customer-suggestions"
                />
                <datalist id="customer-suggestions">
                  {customerNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-500">Start typing for suggestions</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount Received (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Collection Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                placeholder="Any additional notes (location, payment mode, etc.)..."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({
                  customerName: '',
                  amount: '',
                  date: new Date().toISOString().split('T')[0],
                  remarks: '',
                })}
              >
                Clear
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Submit Collection
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* My Collections List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            My Submitted Collections ({myCollections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myCollections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No collections submitted yet
                    </TableCell>
                  </TableRow>
                ) : (
                  myCollections
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((collection) => (
                      <TableRow key={collection.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(collection.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900">
                          {collection.customerName}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-700">
                          ₹{collection.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {collection.approved ? (
                            <Badge className="bg-green-100 text-green-700 border-green-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(collection.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {collection.approved && collection.approvedByName ? (
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">{collection.approvedByName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(collection.approvedDate!).toLocaleDateString()}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-yellow-600">Waiting...</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-gray-600">
                          {collection.remarks || '—'}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          {myCollections.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Collections Submitted:</span>
                  <span className="font-bold text-gray-900">{myCollections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount Submitted:</span>
                  <span className="font-bold text-purple-700">₹{stats.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved Collections:</span>
                  <span className="font-bold text-green-700">
                    {stats.approvedCount} (₹{stats.approvedAmount.toFixed(2)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Approval:</span>
                  <span className="font-bold text-yellow-700">
                    {stats.pendingCount} (₹{stats.pendingAmount.toFixed(2)})
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
