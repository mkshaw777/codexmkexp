import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { createExpense, getAdvances, type Expense, type Advance } from '../lib/data';
import { getCurrentUser } from '../lib/auth';
import { Upload, X, AlertCircle } from 'lucide-react';

interface StaffExpenseFormProps {
  onSuccess?: () => void;
  preSelectedAdvanceId?: string;
  existingExpense?: Expense;
  isWithoutAdvance?: boolean; // New prop to pre-enable without advance mode
}

export default function StaffExpenseForm({ onSuccess, preSelectedAdvanceId, existingExpense, isWithoutAdvance = false }: StaffExpenseFormProps) {
  const currentUser = getCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [billFiles, setBillFiles] = useState<File[]>([]);
  const [withoutAdvance, setWithoutAdvance] = useState(isWithoutAdvance); // Initialize with prop value

  const [formData, setFormData] = useState({
    advanceId: preSelectedAdvanceId || existingExpense?.advanceId || '',
    date: existingExpense?.date || new Date().toISOString().split('T')[0],
    numberOfCases: existingExpense?.numberOfCases || 0,
    category: (existingExpense?.category || 'Transport') as Expense['category'],
    subCategory: existingExpense?.subCategory || '',
    // Amount fields
    travel: existingExpense?.fare || 0,
    parking: existingExpense?.parking || 0,
    oil: existingExpense?.oil || 0,
    bazar: 0,
    sealdah: 0,
    outStation: 0,
    paglahat: 0,
    others: existingExpense?.others || 0,
    remarks: existingExpense?.remarks || '',
  });

  useEffect(() => {
    if (currentUser) {
      const userAdvances = getAdvances(currentUser.id).filter(a => a.status === 'active');
      setAdvances(userAdvances);
    }
  }, [currentUser]);

  const getSubCategoryOptions = () => {
    switch (formData.category) {
      case 'Transport':
        return ['Travel', 'Parking', 'Oil'];
      case 'Bazar':
        return ['Vegetables', 'Fruits', 'Groceries', 'Others'];
      case 'Sealdah':
        return ['Market', 'Transport', 'Others'];
      case 'Out Station':
        return ['Travel', 'Accommodation', 'Food', 'Others'];
      case 'Paglahat':
        return ['Market', 'Transport', 'Others'];
      case 'Others':
        return ['Miscellaneous'];
      default:
        return [];
    }
  };

  const calculateTotal = () => {
    return formData.travel + formData.parking + formData.oil + formData.bazar + 
           formData.sealdah + formData.outStation + formData.paglahat + formData.others;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setBillFiles([...billFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setBillFiles(billFiles.filter((_, i) => i !== index));
  };

  // Reset amount fields when category changes
  const handleCategoryChange = (newCategory: Expense['category']) => {
    setFormData({
      ...formData,
      category: newCategory,
      subCategory: '',
      // Reset all amount fields to 0
      travel: 0,
      parking: 0,
      oil: 0,
      bazar: 0,
      sealdah: 0,
      outStation: 0,
      paglahat: 0,
      others: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Not authenticated');
      return;
    }

    // Validation for oil > 500
    if (formData.oil > 500 && billFiles.length === 0) {
      toast.error('Bill upload is mandatory for oil expenses above ₹500');
      return;
    }

    // Validate advance selection (only if not "without advance")
    if (!withoutAdvance && !formData.advanceId) {
      toast.error('Please select an advance or enable "Without Advance" option');
      return;
    }

    const total = calculateTotal();
    if (total === 0) {
      toast.error('Please enter at least one expense amount');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert files to base64 for storage (in real app, upload to server)
      const billUrls: string[] = [];
      for (const file of billFiles) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        billUrls.push(base64);
      }

      createExpense({
        userId: currentUser.id,
        advanceId: withoutAdvance ? 'WITHOUT_ADVANCE' : formData.advanceId,
        date: formData.date,
        category: formData.category,
        categoryDetail: formData.subCategory,
        subCategory: formData.subCategory,
        fare: formData.travel,
        parking: formData.parking,
        oil: formData.oil,
        breakfast: formData.bazar + formData.sealdah + formData.outStation + formData.paglahat,
        others: formData.others,
        total,
        numberOfCases: formData.numberOfCases,
        billUrls,
        remarks: withoutAdvance ? `[WITHOUT ADVANCE] ${formData.remarks}` : formData.remarks,
        submittedToAdmin: true,
        settlementStatus: 'pending',
      });

      toast.success(withoutAdvance 
        ? '✅ Expense submitted without advance! Admin will review.' 
        : '✅ Expense submitted successfully!'
      );
      
      // Reset form
      setFormData({
        advanceId: preSelectedAdvanceId || '',
        date: new Date().toISOString().split('T')[0],
        numberOfCases: 0,
        category: 'Transport',
        subCategory: '',
        travel: 0,
        parking: 0,
        oil: 0,
        bazar: 0,
        sealdah: 0,
        outStation: 0,
        paglahat: 0,
        others: 0,
        remarks: '',
      });
      setBillFiles([]);
      setWithoutAdvance(false);

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAmountFields = () => {
    switch (formData.category) {
      case 'Transport':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="travel">Travel (₹)</Label>
              <Input
                id="travel"
                type="number"
                min="0"
                step="0.01"
                value={formData.travel || ''}
                onChange={(e) => setFormData({ ...formData, travel: Number(e.target.value) || 0 })}
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
                onChange={(e) => setFormData({ ...formData, parking: Number(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oil">Oil (₹) {formData.oil > 500 && <span className="text-red-500">*Bill Required</span>}</Label>
              <Input
                id="oil"
                type="number"
                min="0"
                step="0.01"
                value={formData.oil || ''}
                onChange={(e) => setFormData({ ...formData, oil: Number(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>
        );
      case 'Bazar':
        return (
          <div className="space-y-2">
            <Label htmlFor="bazar">Bazar Amount (₹)</Label>
            <Input
              id="bazar"
              type="number"
              min="0"
              step="0.01"
              value={formData.bazar || ''}
              onChange={(e) => setFormData({ ...formData, bazar: Number(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        );
      case 'Sealdah':
        return (
          <div className="space-y-2">
            <Label htmlFor="sealdah">Sealdah Amount (₹)</Label>
            <Input
              id="sealdah"
              type="number"
              min="0"
              step="0.01"
              value={formData.sealdah || ''}
              onChange={(e) => setFormData({ ...formData, sealdah: Number(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        );
      case 'Out Station':
        return (
          <div className="space-y-2">
            <Label htmlFor="outStation">Out Station Amount (₹)</Label>
            <Input
              id="outStation"
              type="number"
              min="0"
              step="0.01"
              value={formData.outStation || ''}
              onChange={(e) => setFormData({ ...formData, outStation: Number(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        );
      case 'Paglahat':
        return (
          <div className="space-y-2">
            <Label htmlFor="paglahat">Paglahat Amount (₹)</Label>
            <Input
              id="paglahat"
              type="number"
              min="0"
              step="0.01"
              value={formData.paglahat || ''}
              onChange={(e) => setFormData({ ...formData, paglahat: Number(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        );
      case 'Others':
        return (
          <div className="space-y-2">
            <Label htmlFor="others">Others Amount (₹)</Label>
            <Input
              id="others"
              type="number"
              min="0"
              step="0.01"
              value={formData.others || ''}
              onChange={(e) => setFormData({ ...formData, others: Number(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Without Advance Toggle */}


          {/* Show alert when without advance is enabled */}
          {withoutAdvance && (
            <Alert className="bg-orange-50 border-orange-200">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                This expense will be submitted without advance. Admin will review and may provide advance or settle with negative balance.
              </AlertDescription>
            </Alert>
          )}

          {/* Advance Selection - Hidden when "Without Advance" is enabled */}
          {!withoutAdvance && (
            <div className="space-y-2">
              <Label>Select Advance *</Label>
              <Select value={formData.advanceId} onValueChange={(value) => setFormData({ ...formData, advanceId: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose advance" />
                </SelectTrigger>
                <SelectContent>
                  {advances.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No active advances found. Enable "Without Advance" above.
                    </div>
                  ) : (
                    advances.map((advance) => (
                      <SelectItem key={advance.id} value={advance.id}>
                        {new Date(advance.date).toLocaleDateString('en-IN')} - ₹{advance.amount} - {advance.description}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {advances.length === 0 && (
                <p className="text-sm text-amber-600">
                  💡 No advances available. Enable "Without Advance" option above to continue.
                </p>
              )}
            </div>
          )}

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
              <Label htmlFor="numberOfCases">Number of Cases</Label>
              <Input
                id="numberOfCases"
                type="number"
                min="0"
                value={formData.numberOfCases || ''}
                onChange={(e) => setFormData({ ...formData, numberOfCases: Number(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleCategoryChange(value as Expense['category'])}
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

            <div className="space-y-2">
              <Label htmlFor="subCategory">Sub Category</Label>
              <Select
                value={formData.subCategory}
                onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub category" />
                </SelectTrigger>
                <SelectContent>
                  {getSubCategoryOptions().map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {renderAmountFields()}

          <div className="space-y-2">
            <Label>Total Amount (₹)</Label>
            <div className="h-10 px-3 py-2 border rounded-md bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 flex items-center font-semibold text-green-700">
              ₹{calculateTotal().toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill">Upload Bills {formData.oil > 500 && <span className="text-red-500">*Required</span>}</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                id="bill"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="bill"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload bills</span>
              </label>
              
              {billFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {billFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Add any additional notes..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : withoutAdvance ? 'Submit Without Advance' : 'Submit Expense'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
