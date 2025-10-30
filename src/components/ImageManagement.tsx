import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { getExpenses, type Expense } from '../lib/data';
import { Download, Trash2, Image as ImageIcon } from 'lucide-react';

export default function ImageManagement() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [imageCount, setImageCount] = useState(0);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = () => {
    const allExpenses = getExpenses();
    const expensesWithBills = allExpenses.filter(e => e.billUrls && e.billUrls.length > 0);
    setExpenses(expensesWithBills);
    
    const totalImages = expensesWithBills.reduce((sum, e) => sum + e.billUrls.length, 0);
    setImageCount(totalImages);
  };

  const downloadAllImages = () => {
    let downloadedCount = 0;

    expenses.forEach((expense, expenseIndex) => {
      expense.billUrls.forEach((url, imageIndex) => {
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = url;
          a.download = `bill-${expense.date}-${expenseIndex}-${imageIndex}.jpg`;
          a.click();
          downloadedCount++;
          
          if (downloadedCount === imageCount) {
            toast.success(`All ${imageCount} images downloaded successfully`);
          }
        }, imageIndex * 100); // Stagger downloads slightly
      });
    });
  };

  const downloadImagesByMonth = (month: string) => {
    const monthExpenses = expenses.filter(e => e.date.startsWith(month));
    let count = 0;

    monthExpenses.forEach((expense, expenseIndex) => {
      expense.billUrls.forEach((url, imageIndex) => {
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = url;
          a.download = `bill-${month}-${expenseIndex}-${imageIndex}.jpg`;
          a.click();
          count++;
        }, imageIndex * 100);
      });
    });

    const totalCount = monthExpenses.reduce((sum, e) => sum + e.billUrls.length, 0);
    toast.success(`Downloading ${totalCount} images from ${month}`);
  };

  const clearImages = () => {
    if (window.confirm('Are you sure you want to clear all images from the system? This action cannot be undone.')) {
      // In a real application, this would delete images from the server
      // For now, we'll just clear the billUrls from expenses
      const expensesData = localStorage.getItem('mk_marketing_expenses');
      if (expensesData) {
        const allExpenses = JSON.parse(expensesData);
        const updatedExpenses = allExpenses.map((e: Expense) => ({
          ...e,
          billUrls: []
        }));
        localStorage.setItem('mk_marketing_expenses', JSON.stringify(updatedExpenses));
        toast.success('All images cleared from system');
        loadImages();
      }
    }
  };

  const getMonthlyBreakdown = () => {
    const monthMap = new Map<string, number>();

    expenses.forEach(expense => {
      const month = expense.date.substring(0, 7); // YYYY-MM
      const count = monthMap.get(month) || 0;
      monthMap.set(month, count + expense.billUrls.length);
    });

    return Array.from(monthMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Image & Bill Management</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Download and manage bill images uploaded by staff
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Images</p>
                  <p className="text-2xl mt-1">{imageCount}</p>
                </div>
                <ImageIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-teal-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expenses with Bills</p>
                  <p className="text-2xl mt-1">{expenses.length}</p>
                </div>
                <ImageIcon className="w-8 h-8 text-teal-600" />
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg per Expense</p>
                  <p className="text-2xl mt-1">
                    {expenses.length > 0 ? (imageCount / expenses.length).toFixed(1) : '0'}
                  </p>
                </div>
                <ImageIcon className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={downloadAllImages} disabled={imageCount === 0} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download All Images
            </Button>
            <Button onClick={clearImages} variant="destructive" disabled={imageCount === 0} className="flex-1">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Images
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {getMonthlyBreakdown().length > 0 ? (
            <div className="space-y-3">
              {getMonthlyBreakdown().map(([month, count]) => (
                <div key={month} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(month + '-01').toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
                      </p>
                      <p className="text-sm text-muted-foreground">{count} images</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadImagesByMonth(month)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No images found in the system</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
