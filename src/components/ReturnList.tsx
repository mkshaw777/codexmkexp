import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getReturns, updateReturn, type Return } from '../lib/data';
import { getCurrentUser } from '../lib/auth';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface ReturnListProps {
  userId?: string;
  refreshTrigger?: number;
  showActions?: boolean;
}

export default function ReturnList({ userId, refreshTrigger, showActions = false }: ReturnListProps) {
  const currentUser = getCurrentUser();
  const [returns, setReturns] = useState<Return[]>([]);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [adminComments, setAdminComments] = useState('');

  useEffect(() => {
    loadReturns();
  }, [userId, refreshTrigger]);

  const loadReturns = () => {
    if (currentUser) {
      const targetUserId = currentUser.role === 'admin' && !userId ? undefined : userId || currentUser.id;
      const data = getReturns(targetUserId);
      setReturns(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  const handleApprove = (returnId: string) => {
    if (!currentUser) return;

    updateReturn(returnId, {
      status: 'approved',
      approvedBy: currentUser.id,
      adminComments,
    });

    toast.success('Return approved successfully');
    setSelectedReturn(null);
    setAdminComments('');
    loadReturns();
  };

  const handleReject = (returnId: string) => {
    if (!currentUser) return;

    updateReturn(returnId, {
      status: 'rejected',
      approvedBy: currentUser.id,
      adminComments,
    });

    toast.success('Return rejected');
    setSelectedReturn(null);
    setAdminComments('');
    loadReturns();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Returns</CardTitle>
        </CardHeader>
        <CardContent>
          {returns.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    {showActions && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returns.map((returnItem) => (
                    <TableRow key={returnItem.id}>
                      <TableCell>
                        {new Date(returnItem.date).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell>₹{returnItem.amount.toFixed(2)}</TableCell>
                      <TableCell>{returnItem.description}</TableCell>
                      <TableCell>{getStatusBadge(returnItem.status)}</TableCell>
                      {showActions && returnItem.status === 'pending' && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setSelectedReturn(returnItem);
                                setAdminComments('');
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setSelectedReturn(returnItem);
                                setAdminComments('');
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No returns found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={selectedReturn !== null} onOpenChange={() => setSelectedReturn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Return</DialogTitle>
            <DialogDescription>
              Review and approve or reject this return request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm mb-1">Amount:</p>
              <p>₹{selectedReturn?.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm mb-1">Description:</p>
              <p>{selectedReturn?.description}</p>
            </div>
            <div>
              <p className="text-sm mb-2">Admin Comments:</p>
              <Textarea
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
                placeholder="Optional comments..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => selectedReturn && handleApprove(selectedReturn.id)}
                className="flex-1"
              >
                Approve
              </Button>
              <Button
                onClick={() => selectedReturn && handleReject(selectedReturn.id)}
                variant="destructive"
                className="flex-1"
              >
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
