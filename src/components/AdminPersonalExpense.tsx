import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { createAdminExpense, getAdminExpenses, deleteAdminExpense, type AdminExpense } from '../lib/data';
import { Download, Trash2, Plus, X, Wallet, TrendingUp } from 'lucide-react';

export default function AdminPersonalExpense() {
  const [expenses, setExpenses] = useState<AdminExpense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<AdminExpense[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Aadarsh' as 'Transport' | 'Bazar' | 'Sealdah' | 'Out Station' | 'Paglahat' | 'Aadarsh',
    // Transport fields (only for Transport category)
    fare: 0,
    parking: 0,
    oil: 0,
    breakfast: 0,
    others: 0,
    // Basic fields
    amount: 0, // For non-transport categories
    paymentTo: '',
    remarks: '',
  });

  // Purchase Tours (for Bazar category)
  const [purchaseTours, setPurchaseTours] = useState<Array<{ supplierName: string; amount: number }>>([]);
  
  // Printer and Designer entries (for Sealdah category)
  const [printerEntries, setPrinterEntries] = useState<Array<{ name: string; amount: number }>>([]);
  const [designerEntries, setDesignerEntries] = useState<Array<{ name: string; amount: number }>>([]);

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [expenses, dateFilter]);

  const loadExpenses = () => {
    const data = getAdminExpenses();
    setExpenses(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const filterExpenses = () => {
    let filtered = expenses;

    if (dateFilter.startDate) {
      filtered = filtered.filter(e => e.date >= dateFilter.startDate);
    }

    if (dateFilter.endDate) {
      filtered = filtered.filter(e => e.date <= dateFilter.endDate);
    }

    setFilteredExpenses(filtered);
  };

  const calculateTotal = () => {
    // For Transport category - sum all transport fields
    if (formData.category === 'Transport') {
      return formData.fare + formData.parking + formData.oil + formData.breakfast + formData.others;
    }
    
    // For Bazar category - sum purchase tours
    if (formData.category === 'Bazar') {
      return purchaseTours.reduce((sum, tour) => sum + tour.amount, 0);
    }
    
    // For Sealdah category - sum printer + designer entries
    if (formData.category === 'Sealdah') {
      const printerTotal = printerEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const designerTotal = designerEntries.reduce((sum, entry) => sum + entry.amount, 0);
      return printerTotal + designerTotal;
    }
    
    // For other categories (Aadarsh, Out Station, Paglahat) - use simple amount field
    return formData.amount;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const total = calculateTotal();

      if (total === 0) {
        toast.error('Total amount cannot be zero');
        setIsSubmitting(false);
        return;
      }

      createAdminExpense({
        date: formData.date,
        description: formData.description || `${formData.category} expense`,
        category: formData.category,
        amount: total,
        paymentTo: formData.paymentTo,
        remarks: formData.remarks,
        billUrls: [],
        // Additional data for detailed tracking
        fare: formData.fare,
        parking: formData.parking,
        oil: formData.oil,
        breakfast: formData.breakfast,
        others: formData.others,
        amount: formData.amount,
        purchaseTours: purchaseTours.length > 0 ? JSON.stringify(purchaseTours) : undefined,
        printerEntries: printerEntries.length > 0 ? JSON.stringify(printerEntries) : undefined,
        designerEntries: designerEntries.length > 0 ? JSON.stringify(designerEntries) : undefined,
      } as any);

      toast.success('✅ Personal expense added successfully!');
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: 'Aadarsh',
        fare: 0,
        parking: 0,
        oil: 0,
        breakfast: 0,
        others: 0,
        amount: 0,
        paymentTo: '',
        remarks: '',
      });
      setPurchaseTours([]);
      setPrinterEntries([]);
      setDesignerEntries([]);

      loadExpenses();
    } catch (error) {
      toast.error('Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      if (deleteAdminExpense(id)) {
        toast.success('Expense deleted successfully');
        loadExpenses();
      } else {
        toast.error('Failed to delete expense');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Payment To', 'Category', 'Description/Remarks', 'Amount'];
    const rows = filteredExpenses.map(e => [
      new Date(e.date).toLocaleDateString('en-IN'),
      e.paymentTo,
      e.category,
      e.remarks || e.description || '-',
      e.amount.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admin Personal Expenses</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #6b21a8; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #6b21a8; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .total { font-weight: bold; text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>MK Marketing - Admin Personal Expenses</h1>
          <p>Generated on: ${new Date().toLocaleDateString('en-IN')}</p>
          ${dateFilter.startDate || dateFilter.endDate ? `
            <p>Period: ${dateFilter.startDate || 'Start'} to ${dateFilter.endDate || 'End'}</p>
          ` : ''}
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Payment To</th>
                <th>Category</th>
                <th>Description / Remarks</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${filteredExpenses.map(e => `
                <tr>
                  <td>${new Date(e.date).toLocaleDateString('en-IN')}</td>
                  <td>${e.paymentTo}</td>
                  <td>${e.category}</td>
                  <td>${e.remarks || e.description || '-'}</td>
                  <td>${e.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            Total: ₹${filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wallet className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <CardTitle className="text-purple-900">My Personal Expenses</CardTitle>
              <CardDescription className="text-purple-700">
                Track your personal expenses with flexible categories - default is "Others" but all options available
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Add Expense Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Personal Expense</CardTitle>
          <CardDescription>
            Default category: "Others" | All categories available for flexibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aadarsh">Aadarsh (Default)</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Bazar">Bazar</SelectItem>
                    <SelectItem value="Sealdah">Sealdah</SelectItem>
                    <SelectItem value="Out Station">Out Station</SelectItem>
                    <SelectItem value="Paglahat">Paglahat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentTo">Payment To (Shop/Driver/Person) *</Label>
                <Input
                  id="paymentTo"
                  type="text"
                  value={formData.paymentTo}
                  onChange={(e) => setFormData({ ...formData, paymentTo: e.target.value })}
                  placeholder="e.g., ABC Shop, Driver Name"
                  required
                />
              </div>

              {/* Amount Field (for non-Transport categories) */}
              {formData.category !== 'Transport' && formData.category !== 'Bazar' && formData.category !== 'Sealdah' && (
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value ? Number(e.target.value) : 0 })}
                    placeholder="Enter amount"
                    required
                  />
                </div>
              )}
            </div>

            {/* Transport Expense Fields - Only show when Transport is selected */}
            {formData.category === 'Transport' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fare">Fare (₹)</Label>
                <Input
                  id="fare"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.fare || ''}
                  onChange={(e) => setFormData({ ...formData, fare: e.target.value ? Number(e.target.value) : 0 })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parking">Parking (₹)</Label>
                <Input
                  id="parking"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.parking || ''}
                  onChange={(e) => setFormData({ ...formData, parking: e.target.value ? Number(e.target.value) : 0 })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="oil">Oil (₹)</Label>
                <Input
                  id="oil"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.oil || ''}
                  onChange={(e) => setFormData({ ...formData, oil: e.target.value ? Number(e.target.value) : 0 })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="breakfast">Breakfast (₹)</Label>
                <Input
                  id="breakfast"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.breakfast || ''}
                  onChange={(e) => setFormData({ ...formData, breakfast: e.target.value ? Number(e.target.value) : 0 })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="others">Others (₹)</Label>
                <Input
                  id="others"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.others || ''}
                  onChange={(e) => setFormData({ ...formData, others: e.target.value ? Number(e.target.value) : 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            )}

            {/* Purchase Tour Section - Only for Bazar */}
            {formData.category === 'Bazar' && (
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
            {formData.category === 'Sealdah' && (
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
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-900">Total Expense:</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-5 h-5 text-green-700" />
                  <span className="text-2xl font-bold text-green-700">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label htmlFor="remarks">Description / Remarks *</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Enter expense details and notes..."
                rows={3}
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700">
              {isSubmitting ? 'Adding...' : 'Add Personal Expense'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Expenses History</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <Button onClick={exportToCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={exportToPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment To</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {new Date(expense.date).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell>{expense.paymentTo}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {expense.remarks || expense.description || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{expense.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-xl font-bold text-purple-700">
                    ₹{filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No expenses found</p>
              <p className="text-sm">Add your first personal expense above</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
