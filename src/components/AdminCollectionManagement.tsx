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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner@2.0.3';
import { 
  getCollections, 
  createCollection, 
  approveCollection, 
  getPendingCollections,
  getAllCustomerNames,
  getCollectionsByCustomer,
  getCustomerCollectionSummary,
  Collection
} from '../lib/data';
import { getCurrentUser } from '../lib/auth';
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  User,
  Search,
  Filter,
  Plus,
  Calendar,
  TrendingUp
} from 'lucide-react';

export default function AdminCollectionManagement() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pendingCollections, setPendingCollections] = useState<Collection[]>([]);
  const [customerNames, setCustomerNames] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Add Collection Form State
  const [formData, setFormData] = useState({
    customerName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  // Filter State
  const [filterCustomer, setFilterCustomer] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const loadData = () => {
    const allCollections = getCollections();
    setCollections(allCollections);
    setPendingCollections(getPendingCollections());
    setCustomerNames(getAllCustomerNames());
  };

  const handleAddCollection = (e: React.FormEvent) => {
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
        enteredBy: currentUser?.id || '1',
        enteredByName: currentUser?.fullName || 'Admin',
        enteredByRole: 'admin',
        approved: true, // Admin entries are auto-approved
        approvedBy: currentUser?.id || '1',
        approvedByName: currentUser?.fullName || 'Admin',
        approvedDate: new Date().toISOString(),
        remarks: formData.remarks || undefined,
      });

      toast.success(`Collection from ${formData.customerName} added successfully!`);
      
      // Reset form
      setFormData({
        customerName: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        remarks: '',
      });

      loadData();
    } catch (error) {
      toast.error('Failed to add collection');
    }
  };

  const handleApproveCollection = (collection: Collection) => {
    try {
      approveCollection(
        collection.id,
        currentUser?.id || '1',
        currentUser?.fullName || 'Admin'
      );

      toast.success(`Collection from ${collection.customerName} approved!`);
      loadData();
    } catch (error) {
      toast.error('Failed to approve collection');
    }
  };

  // Calculate statistics
  const stats = {
    totalCollections: collections.length,
    totalAmount: collections.reduce((sum, c) => sum + c.amount, 0),
    approvedAmount: collections.filter(c => c.approved).reduce((sum, c) => sum + c.amount, 0),
    pendingAmount: collections.filter(c => !c.approved).reduce((sum, c) => sum + c.amount, 0),
    pendingCount: pendingCollections.length,
  };

  // Filter collections
  const filteredCollections = collections.filter(collection => {
    // Customer filter
    if (filterCustomer !== 'all' && collection.customerName !== filterCustomer) {
      return false;
    }
    
    // Status filter
    if (filterStatus === 'approved' && !collection.approved) {
      return false;
    }
    if (filterStatus === 'pending' && collection.approved) {
      return false;
    }
    
    // Search filter
    if (searchQuery && !collection.customerName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Customer Collection Management</h2>
        <p className="text-gray-600 mt-2">Track customer payments received in the field</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Collections</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalCollections}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-green-700">₹{stats.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-emerald-700">₹{stats.approvedAmount.toFixed(2)}</p>
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
                <p className="text-xs text-yellow-600 mt-1">{stats.pendingCount} entries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-purple-700">{customerNames.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Collection Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Collection (Direct by Admin)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCollection} className="space-y-4">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
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
                placeholder="Any additional notes..."
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
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Collection
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Pending Approvals (if any) */}
      {pendingCollections.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Clock className="w-5 h-5" />
              Pending Approvals ({pendingCollections.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-yellow-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900">{collection.customerName}</p>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                        Pending
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Amount:</span> ₹{collection.amount.toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(collection.date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Entered by:</span> {collection.enteredByName}
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span> {new Date(collection.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {collection.remarks && (
                      <p className="mt-2 text-sm text-gray-600 italic">
                        Note: {collection.remarks}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleApproveCollection(collection)}
                    className="ml-4 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Receive
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            All Collections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filterCustomer">Filter by Customer</Label>
              <Select value={filterCustomer} onValueChange={setFilterCustomer}>
                <SelectTrigger id="filterCustomer">
                  <SelectValue placeholder="All Customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customerNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterStatus">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="filterStatus">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved Only</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Search Customer</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Collections Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Entered By</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No collections found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCollections
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
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {collection.enteredByRole === 'admin' ? (
                              <UserCheck className="w-4 h-4 text-blue-600" />
                            ) : (
                              <User className="w-4 h-4 text-purple-600" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{collection.enteredByName}</p>
                              <p className="text-xs text-gray-500 capitalize">{collection.enteredByRole}</p>
                            </div>
                          </div>
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
                            <span className="text-sm text-gray-400">—</span>
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

          {/* Summary footer */}
          {filteredCollections.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Filtered Collections:</span>
                  <span className="ml-2 font-bold text-gray-900">{filteredCollections.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount (Filtered):</span>
                  <span className="ml-2 font-bold text-green-700">
                    ₹{filteredCollections.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Approved Amount (Filtered):</span>
                  <span className="ml-2 font-bold text-emerald-700">
                    ₹{filteredCollections.filter(c => c.approved).reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
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
