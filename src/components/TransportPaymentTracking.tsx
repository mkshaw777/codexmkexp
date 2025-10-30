import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { 
  Truck, 
  Download, 
  RefreshCw, 
  Filter,
  FileSpreadsheet,
  Calendar,
  DollarSign,
  Package,
  Plus
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getCurrentUser } from '../lib/auth';

// Transport companies
const TRANSPORT_COMPANIES = [
  'Exh',
  'Genex',
  'IQ',
  'Canadian',
  'Others'
] as const;

type TransportCompany = typeof TRANSPORT_COMPANIES[number];

interface TransportPayment {
  id: string;
  date: string;
  company: TransportCompany;
  transportName: string;
  details: string;
  amount: number;
  paidBy: string;
  paidByName: string;
  createdAt: string;
  remarks?: string;
}

export default function TransportPaymentTracking() {
  const [payments, setPayments] = useState<TransportPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<TransportPayment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    company: '' as TransportCompany | '',
    transportName: '',
    details: '',
    amount: 0,
    remarks: '',
  });

  // Filter state
  const [filters, setFilters] = useState({
    company: 'all',
    startDate: '',
    endDate: '',
  });

  const user = getCurrentUser();

  useEffect(() => {
    loadPayments();
  }, [refreshKey]);

  useEffect(() => {
    applyFilters();
  }, [payments, filters]);

  const loadPayments = () => {
    try {
      const stored = localStorage.getItem('mk_marketing_transport_payments');
      if (stored) {
        const data = JSON.parse(stored);
        // Limit to last 200 entries to prevent memory issues
        const limited = data.slice(-200);
        setPayments(limited);
        if (data.length > 200) {
          // Save the limited data back
          localStorage.setItem('mk_marketing_transport_payments', JSON.stringify(limited));
        }
      }
    } catch (error) {
      console.error('Error loading transport payments:', error);
      setPayments([]);
    }
  };

  const savePayments = (data: TransportPayment[]) => {
    try {
      // Keep only last 200 entries
      const limited = data.slice(-200);
      localStorage.setItem('mk_marketing_transport_payments', JSON.stringify(limited));
      setPayments(limited);
    } catch (error) {
      console.error('Error saving transport payments:', error);
      toast.error('Error saving payment. Storage may be full.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company || !formData.transportName || formData.amount <= 0) {
      toast.error('कृपया सभी जानकारी भरें');
      return;
    }

    const newPayment: TransportPayment = {
      id: `TP${Date.now()}`,
      date: formData.date,
      company: formData.company,
      transportName: formData.transportName,
      details: formData.details,
      amount: formData.amount,
      paidBy: user?.id || 'unknown',
      paidByName: user?.fullName || 'Unknown',
      createdAt: new Date().toISOString(),
      remarks: formData.remarks,
    };

    const updated = [newPayment, ...payments];
    savePayments(updated);

    toast.success('✅ Transport payment entry saved!');

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      company: '',
      transportName: '',
      details: '',
      amount: 0,
      remarks: '',
    });
    setShowForm(false);
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Company filter
    if (filters.company !== 'all') {
      filtered = filtered.filter(p => p.company === filters.company);
    }

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(p => p.date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(p => p.date <= filters.endDate);
    }

    setFilteredPayments(filtered);
  };

  const setLast15Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 15);

    setFilters({
      ...filters,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
  };

  const clearFilters = () => {
    setFilters({
      company: 'all',
      startDate: '',
      endDate: '',
    });
  };

  const downloadCSV = () => {
    if (filteredPayments.length === 0) {
      toast.error('कोई data नहीं है download करने के लिए');
      return;
    }

    // Create CSV content
    const headers = ['Date', 'Company', 'Transport Name', 'Details', 'Amount', 'Paid By', 'Remarks'];
    const rows = filteredPayments.map(p => [
      p.date,
      p.company,
      p.transportName,
      p.details,
      p.amount,
      p.paidByName,
      p.remarks || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = `transport_payments_${filters.company !== 'all' ? filters.company + '_' : ''}${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('✅ CSV downloaded successfully!');
  };

  const downloadCompanyWise = () => {
    TRANSPORT_COMPANIES.forEach(company => {
      const companyPayments = payments.filter(p => {
        let match = p.company === company;
        if (filters.startDate) match = match && p.date >= filters.startDate;
        if (filters.endDate) match = match && p.date <= filters.endDate;
        return match;
      });

      if (companyPayments.length === 0) return;

      const headers = ['Date', 'Transport Name', 'Details', 'Amount', 'Paid By', 'Remarks'];
      const rows = companyPayments.map(p => [
        p.date,
        p.transportName,
        p.details,
        p.amount,
        p.paidByName,
        p.remarks || ''
      ]);

      const csvContent = [
        `${company} Transport Payments`,
        '',
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${company}_transport_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    toast.success('✅ All company-wise files downloaded!');
  };

  const getCompanyStats = () => {
    const stats: Record<string, { count: number; total: number }> = {};
    
    TRANSPORT_COMPANIES.forEach(company => {
      const companyPayments = filteredPayments.filter(p => p.company === company);
      stats[company] = {
        count: companyPayments.length,
        total: companyPayments.reduce((sum, p) => sum + p.amount, 0)
      };
    });

    return stats;
  };

  const companyStats = getCompanyStats();
  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Transport Payment Tracking</CardTitle>
                <CardDescription>
                  Ijjahar, Genex, Icon, Kenediya - Transport payment management
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Company-wise Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRANSPORT_COMPANIES.map((company) => (
          <Card key={company}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" />
                {company}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">₹{companyStats[company]?.total.toLocaleString() || 0}</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {companyStats[company]?.count || 0} payments
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Payment Form */}
      {showForm && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Transport Payment Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Transport Company *</Label>
                  <Select
                    value={formData.company}
                    onValueChange={(value) => setFormData({ ...formData, company: value as TransportCompany })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSPORT_COMPANIES.map((company) => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Transport Name *</Label>
                  <Input
                    placeholder="e.g., Truck Number, Driver Name"
                    value={formData.transportName}
                    onChange={(e) => setFormData({ ...formData, transportName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Amount (₹) *</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Details</Label>
                <Input
                  placeholder="Route, Load details, etc."
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Remarks {formData.company === 'Others' && <span className="text-red-500">*</span>}</Label>
                <Textarea
                  placeholder={formData.company === 'Others' ? "Required - Specify other company name..." : "Any additional information..."}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={2}
                  required={formData.company === 'Others'}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Save Payment Entry
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Company</Label>
              <Select
                value={filters.company}
                onValueChange={(value) => setFilters({ ...filters, company: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {TRANSPORT_COMPANIES.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={setLast15Days} className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Last 15 Days
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
            <Button onClick={() => setRefreshKey(prev => prev + 1)} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={downloadCSV} variant="default">
              <Download className="w-4 h-4 mr-2" />
              Download Filtered Data
            </Button>
            <Button onClick={downloadCompanyWise} variant="default" className="bg-orange-500 hover:bg-orange-600">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download Company-wise
            </Button>
          </div>

          {/* Filter Summary */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-900">
                  Showing <span className="font-bold">{filteredPayments.length}</span> payments
                  {filters.company !== 'all' && <span> from <span className="font-bold">{filters.company}</span></span>}
                  {filters.startDate && filters.endDate && (
                    <span> from <span className="font-bold">{filters.startDate}</span> to <span className="font-bold">{filters.endDate}</span></span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-900">Total Amount</p>
                <p className="text-2xl font-bold text-blue-700">₹{totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Transport Payments ({filteredPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No transport payments found</p>
              <p className="text-sm mt-2">Add a new payment or adjust filters</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Transport Name</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {new Date(payment.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-semibold">
                          {payment.company}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.transportName}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {payment.details || '-'}
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        ₹{payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{payment.paidByName}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                        {payment.remarks || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
