import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { createExpense, type Expense, getAllStaff, getAdvances } from '../lib/data';
import { getCurrentUser } from '../lib/auth';
import { Upload, X, Plus } from 'lucide-react';

interface ExpenseFormProps {
  onSuccess?: () => void;
  staffId?: string;
}

export default function ExpenseForm({ onSuccess, staffId }: ExpenseFormProps) {
  const currentUser = getCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(staffId || '');
  const staffList = currentUser?.role === 'admin' && !staffId ? getAllStaff() : [];

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Transport' as Expense['category'],
    numberOfCases: 0,
    fare: 0,
    parking: 0,
    oil: 0,
    breakfast: 0,
    others: 0,
    remarks: '',
  });

  const [oilBillFiles, setOilBillFiles] = useState<File[]>([]);
  const [transportBillFiles, setTransportBillFiles] = useState<File[]>([]);
  const [totalAdvance, setTotalAdvance] = useState(0);
  
  // Purchase Tours (for Bazar category)
  const [purchaseTours, setPurchaseTours] = useState<Array<{ supplierName: string; amount: number }>>([]);
  
  // Printer and Designer entries (for Sealdah category)
  const [printerEntries, setPrinterEntries] = useState<Array<{ name: string; amount: number }>>([]);
  const [designerEntries, setDesignerEntries] = useState<Array<{ name: string; amount: number }>>([]);

  // Calculate total advance for selected user
  useEffect(() => {
    const targetUserId = currentUser?.role === 'admin' && selectedStaff ? selectedStaff : currentUser?.id;
    if (targetUserId) {
      const advances = getAdvances(targetUserId);
      const total = advances.reduce((sum, adv) => sum + adv.amount, 0);
      setTotalAdvance(total);
    }
  }, [selectedStaff, currentUser]);

  const calculateTotal = () => {
    const transportTotal = formData.fare + formData.parking + formData.oil + formData.breakfast + formData.others;
    const purchaseTotal = purchaseTours.reduce((sum, tour) => sum + tour.amount, 0);
    const printerTotal = printerEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const designerTotal = designerEntries.reduce((sum, entry) => sum + entry.amount, 0);
    return transportTotal + purchaseTotal + printerTotal + designerTotal;
  };

  const calculateBalance = () => {
    return totalAdvance - calculateTotal();
  };

  const hasAnyAmount = () => {
    return calculateTotal() > 0;
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

  const updatePurchaseTour = (index: number, field: 'supplierName' | 'amount', value: string | number) => {
    const updated = [...purchaseTours];
    if (field === 'supplierName') {
      updated[index].supplierName = value as string;
    } else {
      updated[index].amount = value as number;
    }
    setPurchaseTours(updated);
  };

  const canSubmit = () => {
    // Check if any amount is filled
    if (!hasAnyAmount()) return false;

    // Check if staff is selected (for admin)
    if (staffList.length > 0 && !selectedStaff) return false;

    // Check remarks requirement when Others has amount
    if (formData.others > 0 && !formData.remarks.trim()) return false;

    // Check Purchase Tours validation for Bazar
    if (formData.category === 'Bazar' && purchaseTours.length > 0) {
      // Check if any purchase tour is partially filled (incomplete)
      const hasIncompleteTour = purchaseTours.some(tour => {
        const hasName = tour.supplierName.trim().length > 0;
        const hasAmount = tour.amount > 0;
        // If one field is filled but other is not, it's incomplete
        return (hasName && !hasAmount) || (!hasName && hasAmount);
      });
      if (hasIncompleteTour) return false;
    }

    // Check Printer entries validation for Sealdah
    if (formData.category === 'Sealdah' && printerEntries.length > 0) {
      const hasIncompleteEntry = printerEntries.some(entry => {
        const hasName = entry.name.trim().length > 0;
        const hasAmount = entry.amount > 0;
        return (hasName && !hasAmount) || (!hasName && hasAmount);
      });
      if (hasIncompleteEntry) return false;
    }

    // Check Designer entries validation for Sealdah
    if (formData.category === 'Sealdah' && designerEntries.length > 0) {
      const hasIncompleteEntry = designerEntries.some(entry => {
        const hasName = entry.name.trim().length > 0;
        const hasAmount = entry.amount > 0;
        return (hasName && !hasAmount) || (!hasName && hasAmount);
      });
      if (hasIncompleteEntry) return false;
    }

    return true;
  };

  const handleOilBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setOilBillFiles([...oilBillFiles, ...newFiles]);
    }
  };

  const handleTransportBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setTransportBillFiles([...transportBillFiles, ...newFiles]);
    }
  };

  const removeOilBillFile = (index: number) => {
    setOilBillFiles(oilBillFiles.filter((_, i) => i !== index));
  };

  const removeTransportBillFile = (index: number) => {
    setTransportBillFiles(transportBillFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Not authenticated');
      return;
    }

    // Validation: Others needs remarks
    if (formData.others > 0 && !formData.remarks.trim()) {
      toast.error('Remarks are mandatory when Others expense is filled');
      return;
    }

    // Validation: Purchase Tours for Bazar
    if (formData.category === 'Bazar' && purchaseTours.length > 0) {
      const hasIncompleteTour = purchaseTours.some(tour => {
        const hasName = tour.supplierName.trim().length > 0;
        const hasAmount = tour.amount > 0;
        // If one field is filled but other is not, it's incomplete
        return (hasName && !hasAmount) || (!hasName && hasAmount);
      });
      if (hasIncompleteTour) {
        toast.error('Please complete all purchase tours or remove incomplete entries');
        return;
      }
    }

    // Validation: Printer entries for Sealdah
    if (formData.category === 'Sealdah' && printerEntries.length > 0) {
      const hasIncompleteEntry = printerEntries.some(entry => {
        const hasName = entry.name.trim().length > 0;
        const hasAmount = entry.amount > 0;
        return (hasName && !hasAmount) || (!hasName && hasAmount);
      });
      if (hasIncompleteEntry) {
        toast.error('Please complete all printer entries or remove incomplete entries');
        return;
      }
    }

    // Validation: Designer entries for Sealdah
    if (formData.category === 'Sealdah' && designerEntries.length > 0) {
      const hasIncompleteEntry = designerEntries.some(entry => {
        const hasName = entry.name.trim().length > 0;
        const hasAmount = entry.amount > 0;
        return (hasName && !hasAmount) || (!hasName && hasAmount);
      });
      if (hasIncompleteEntry) {
        toast.error('Please complete all designer entries or remove incomplete entries');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const total = calculateTotal();
      const targetUserId = currentUser.role === 'admin' && selectedStaff ? selectedStaff : currentUser.id;
      
      // Convert files to base64 for storage (in real app, upload to server)
      const billUrls: string[] = [];
      
      // Upload oil bills
      for (const file of oilBillFiles) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        billUrls.push(base64);
      }
      
      // Upload transport bills
      for (const file of transportBillFiles) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        billUrls.push(base64);
      }

      // Filter out empty purchase tours (both fields empty)
      const validPurchaseTours = purchaseTours.filter(
        tour => tour.supplierName.trim().length > 0 || tour.amount > 0
      );

      // Filter out empty printer entries
      const validPrinterEntries = printerEntries.filter(
        entry => entry.name.trim().length > 0 || entry.amount > 0
      );

      // Filter out empty designer entries
      const validDesignerEntries = designerEntries.filter(
        entry => entry.name.trim().length > 0 || entry.amount > 0
      );

      // Build remarks text
      let remarksText = formData.remarks;
      if (validPurchaseTours.length > 0) {
        remarksText += '\\n\\nPurchase Tours:\\n' + validPurchaseTours.map((t, i) => `${i+1}. ${t.supplierName}: ₹${t.amount}`).join('\\n');
      }
      if (validPrinterEntries.length > 0) {
        remarksText += '\\n\\nPrinter:\\n' + validPrinterEntries.map((e, i) => `${i+1}. ${e.name}: ₹${e.amount}`).join('\\n');
      }
      if (validDesignerEntries.length > 0) {
        remarksText += '\\n\\nDesigner:\\n' + validDesignerEntries.map((e, i) => `${i+1}. ${e.name}: ₹${e.amount}`).join('\\n');
      }

      createExpense({
        userId: targetUserId,
        date: formData.date,
        category: formData.category,
        categoryDetail: '',
        fare: formData.fare,
        parking: formData.parking,
        oil: formData.oil,
        breakfast: formData.breakfast,
        others: formData.others,
        total,
        numberOfCases: formData.numberOfCases,
        billUrls,
        remarks: formData.remarks + (validPurchaseTours.length > 0 ? `\n\nPurchase Tours:\n${validPurchaseTours.map((t, i) => `${i+1}. ${t.supplierName}: ₹${t.amount}`).join('\n')}` : ''),
        submittedToAdmin: false,
        settlementStatus: 'pending',
      });

      toast.success('Expense added successfully!');
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'Transport',
        numberOfCases: 0,
        fare: 0,
        parking: 0,
        oil: 0,
        breakfast: 0,
        others: 0,
        remarks: '',
      });
      setOilBillFiles([]);
      setTransportBillFiles([]);
      setPurchaseTours([]);
      setPrinterEntries([]);
      setDesignerEntries([]);
      setSelectedStaff('');

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {staffList.length > 0 && (
            <div className="space-y-2">
              <Label>Select Staff Member</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.fullName} ({staff.staffCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="numberOfCases">Number of Cases</Label>
              <Input
                id="numberOfCases"
                type="number"
                min="0"
                value={formData.numberOfCases || ''}
                onChange={(e) => setFormData({ ...formData, numberOfCases: e.target.value ? Number(e.target.value) : 0 })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  setFormData({ ...formData, category: value as Expense['category'] });
                  // Clear purchase tours when switching away from Bazar
                  if (value !== 'Bazar') {
                    setPurchaseTours([]);
                  }
                  // Clear printer/designer entries when switching away from Sealdah
                  if (value !== 'Sealdah') {
                    setPrinterEntries([]);
                    setDesignerEntries([]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Bazar">Bazar</SelectItem>
                  <SelectItem value="Sealdah">Sealdah</SelectItem>
                  <SelectItem value="Out Station">Out Station</SelectItem>
                  <SelectItem value="Paglahat">Paglahat</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              {formData.oil > 500 && (
                <p className="text-sm text-blue-600">ℹ️ Bill recommended for oil &gt;₹500</p>
              )}
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
              {formData.breakfast > 200 && (
                <p className="text-sm text-blue-600">ℹ️ Bill recommended for breakfast &gt;₹200</p>
              )}
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

            <div className="space-y-2">
              <Label>Total Expense (₹)</Label>
              <div className="h-10 px-3 py-2 border rounded-md bg-purple-50 flex items-center font-semibold text-purple-700">
                ₹{calculateTotal().toFixed(2)}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Advance (₹)</Label>
              <div className="h-10 px-3 py-2 border rounded-md bg-teal-50 flex items-center font-semibold text-teal-700">
                ₹{totalAdvance.toFixed(2)}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Balance Amount (₹)</Label>
              <div className={`h-10 px-3 py-2 border rounded-md flex items-center font-semibold ${
                calculateBalance() >= 0 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {calculateBalance() >= 0 ? '+' : ''}₹{calculateBalance().toFixed(2)}
              </div>
            </div>
          </div>

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

                {printerEntries.length > 0 && (
                  <div className="flex justify-end items-center gap-4 p-2 bg-teal-100 rounded-lg">
                    <span className="text-sm">Printer Total:</span>
                    <span className="font-semibold text-teal-700">
                      ₹{printerEntries.reduce((sum, entry) => sum + entry.amount, 0).toFixed(2)}
                    </span>
                  </div>
                )}
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

                {designerEntries.length > 0 && (
                  <div className="flex justify-end items-center gap-4 p-2 bg-teal-100 rounded-lg">
                    <span className="text-sm">Designer Total:</span>
                    <span className="font-semibold text-teal-700">
                      ₹{designerEntries.reduce((sum, entry) => sum + entry.amount, 0).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Combined Total for Sealdah */}
              {(printerEntries.length > 0 || designerEntries.length > 0) && (
                <div className="flex justify-end items-center gap-4 p-3 bg-teal-200 rounded-lg border border-teal-300">
                  <span className="text-sm font-semibold">Sealdah Total:</span>
                  <span className="font-bold text-teal-900">
                    ₹{(
                      printerEntries.reduce((sum, entry) => sum + entry.amount, 0) +
                      designerEntries.reduce((sum, entry) => sum + entry.amount, 0)
                    ).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Bill Upload Section - Always Visible */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Oil Bill Upload */}
            <div className="space-y-2">
              <Label htmlFor="oilBills">
                Upload Oil Bill (Optional)
              </Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                <Input
                  id="oilBills"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleOilBillChange}
                  className="hidden"
                />
                <label
                  htmlFor="oilBills"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 mb-2 text-orange-400" />
                  <span className="text-sm text-gray-600">
                    Click to upload oil bill
                  </span>
                  {formData.oil > 500 && (
                    <span className="text-xs text-blue-600 mt-1">ℹ️ Recommended for oil &gt;₹500</span>
                  )}
                </label>
              </div>
              {oilBillFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  {oilBillFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-orange-50 rounded"
                    >
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOilBillFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transport Bill Upload */}
            <div className="space-y-2">
              <Label htmlFor="transportBills">
                Upload Transport Bill (Optional)
              </Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                <Input
                  id="transportBills"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleTransportBillChange}
                  className="hidden"
                />
                <label
                  htmlFor="transportBills"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 mb-2 text-blue-400" />
                  <span className="text-sm text-gray-600">
                    Click to upload transport bill
                  </span>
                  {formData.breakfast > 200 && (
                    <span className="text-xs text-blue-600 mt-1">ℹ️ Recommended for breakfast &gt;₹200</span>
                  )}
                </label>
              </div>
              {transportBillFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  {transportBillFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-blue-50 rounded"
                    >
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTransportBillFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Remarks - Only show when Others has amount */}
          {formData.others > 0 && (
            <div className="space-y-2">
              <Label htmlFor="remarks">
                Remarks <span className="text-red-600">*</span>
                <span className="text-xs text-gray-500 ml-2">(Required for Others expense)</span>
              </Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Please explain the 'Others' expense..."
                rows={3}
                required
              />
            </div>
          )}

          <Button type="submit" disabled={isSubmitting || !canSubmit()} className="w-full">
            {isSubmitting ? 'Adding...' : 'Add Expense'}
          </Button>
          
          {!hasAnyAmount() && (
            <p className="text-sm text-center text-gray-500 -mt-2">
              Please fill in expense amounts to enable submission
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
