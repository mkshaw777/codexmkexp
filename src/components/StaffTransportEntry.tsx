import { useState, useEffect, useMemo } from 'react';
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
import { Truck, Plus, Edit, X, Save } from 'lucide-react';
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

export default function StaffTransportEntry() {
  const [payments, setPayments] = useState<TransportPayment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    company: '' as TransportCompany | '',
    transportName: '',
    details: '',
    amount: 0,
    remarks: '',
  });

  const user = useMemo(() => getCurrentUser(), []);

  // Filter user's payments using useMemo to avoid recalculation
  const myPayments = useMemo(() => {
    if (!user) return [];
    return payments.filter(p => p.paidBy === user.id);
  }, [payments, user]);

  // Load payments only once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mk_marketing_transport_payments');
      if (stored) {
        const data = JSON.parse(stored);
        setPayments(data);
      }
    } catch (error) {
      console.error('Error loading transport payments:', error);
    }
  }, []);

  const savePayments = (data: TransportPayment[]) => {
    try {
      localStorage.setItem('mk_marketing_transport_payments', JSON.stringify(data));
      setPayments(data);
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

    // Check if "Others" is selected and remarks is empty
    if (formData.company === 'Others' && !formData.remarks.trim()) {
      toast.error('Others company के लिए remarks जरूरी है');
      return;
    }

    if (!user) return;

    if (editingId) {
      // Update existing entry
      const updated = payments.map(p =>
        p.id === editingId
          ? {
              ...p,
              date: formData.date,
              company: formData.company,
              transportName: formData.transportName,
              details: formData.details,
              amount: formData.amount,
              remarks: formData.remarks,
            }
          : p
      );
      savePayments(updated);
      toast.success('✅ Entry updated successfully!');
      setEditingId(null);
    } else {
      // Add new entry
      const newPayment: TransportPayment = {
        id: `TP${Date.now()}`,
        date: formData.date,
        company: formData.company,
        transportName: formData.transportName,
        details: formData.details,
        amount: formData.amount,
        paidBy: user.id,
        paidByName: user.name,
        createdAt: new Date().toISOString(),
        remarks: formData.remarks,
      };

      savePayments([...payments, newPayment]);
      toast.success('✅ Transport payment saved!');
    }

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

  const handleEdit = (payment: TransportPayment) => {
    setFormData({
      date: payment.date,
      company: payment.company,
      transportName: payment.transportName,
      details: payment.details,
      amount: payment.amount,
      remarks: payment.remarks || '',
    });
    setEditingId(payment.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      company: '',
      transportName: '',
      details: '',
      amount: 0,
      remarks: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" />
            Transport Payment Entry
          </CardTitle>
          <CardDescription>
            Add transport payments and view your entries
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Add Entry Button */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Transport Payment
        </Button>
      )}

      {/* Entry Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingId ? (
                <>
                  <Edit className="w-5 h-5" />
                  Edit Payment Entry
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Payment Entry
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label>Company *</Label>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label>Details</Label>
                  <Input
                    placeholder="Route, Load details, etc."
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  />
                </div>
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
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Update Entry' : 'Save Entry'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* My Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>My Transport Entries</CardTitle>
          <CardDescription>
            View and edit your transport payment entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No entries yet. Add your first transport payment above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Transport</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myPayments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.date).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.company}</Badge>
                        </TableCell>
                        <TableCell>{payment.transportName}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{payment.details || '-'}</TableCell>
                        <TableCell className="text-right">₹{payment.amount.toLocaleString()}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{payment.remarks || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(payment)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
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
