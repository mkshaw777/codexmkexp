import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { getAllStaff, type User } from '../lib/data'; // ⏮️ Back to localStorage
import { UserPlus, Key, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function StaffManagement() {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [addStaffDialog, setAddStaffDialog] = useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{
    open: boolean;
    staff: User | null;
  }>({ open: false, staff: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    staff: User | null;
  }>({ open: false, staff: null });

  const [newStaff, setNewStaff] = useState({
    fullName: '',
    staffCode: '',
    email: '',
    password: '',
  });

  const [resetPassword, setResetPassword] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadStaffList();
  }, []);

  const loadStaffList = () => { // ⏮️ Sync for localStorage
    const staff = getAllStaff();
    setStaffList(staff);
  };

  const handleAddStaff = () => { // ⏮️ Back to localStorage
    // Validation
    if (!newStaff.fullName.trim()) {
      toast.error('Please enter staff full name');
      return;
    }
    if (!newStaff.staffCode.trim()) {
      toast.error('Please enter staff code');
      return;
    }
    if (!newStaff.email.trim()) {
      toast.error('Please enter email');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStaff.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!newStaff.password || newStaff.password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    // Check if email or staff code already exists
    const users = JSON.parse(localStorage.getItem('mk_marketing_users') || '[]');
    const emailExists = users.some((u: User) => u.email === newStaff.email);
    const staffCodeExists = users.some((u: User) => u.staffCode === newStaff.staffCode);

    if (emailExists) {
      toast.error('Email already exists');
      return;
    }

    if (staffCodeExists) {
      toast.error('Staff code already exists');
      return;
    }

    // Create new staff
    const newUser: User = {
      id: Date.now().toString(),
      email: newStaff.email,
      password: newStaff.password,
      fullName: newStaff.fullName,
      staffCode: newStaff.staffCode,
      role: 'staff',
    };

    users.push(newUser);
    localStorage.setItem('mk_marketing_users', JSON.stringify(users));

    toast.success(`✅ Staff member "${newStaff.fullName}" created successfully!`);
    
    // Reset form
    setNewStaff({
      fullName: '',
      staffCode: '',
      email: '',
      password: '',
    });
    setAddStaffDialog(false);
    loadStaffList();
  };

  const handleResetPassword = () => {
    if (!resetPasswordDialog.staff) return;

    // Validation
    if (!resetPassword.newPassword || resetPassword.newPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    if (resetPassword.newPassword !== resetPassword.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Update password
    const users = JSON.parse(localStorage.getItem('mk_marketing_users') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === resetPasswordDialog.staff!.id);

    if (userIndex !== -1) {
      users[userIndex].password = resetPassword.newPassword;
      localStorage.setItem('mk_marketing_users', JSON.stringify(users));
      toast.success(`✅ Password reset successfully for "${resetPasswordDialog.staff.fullName}"`);
    }

    // Reset and close
    setResetPassword({ newPassword: '', confirmPassword: '' });
    setResetPasswordDialog({ open: false, staff: null });
    loadStaffList();
  };

  const handleDeleteStaff = () => {
    if (!deleteDialog.staff) return;

    // Check if staff has any advances or expenses
    const advances = JSON.parse(localStorage.getItem('advances') || '[]');
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    
    const hasAdvances = advances.some((a: any) => a.staffId === deleteDialog.staff!.id);
    const hasExpenses = expenses.some((e: any) => e.userId === deleteDialog.staff!.id);

    if (hasAdvances || hasExpenses) {
      toast.error('Cannot delete staff member with existing advances or expenses');
      setDeleteDialog({ open: false, staff: null });
      return;
    }

    // Delete staff
    const users = JSON.parse(localStorage.getItem('mk_marketing_users') || '[]');
    const updatedUsers = users.filter((u: User) => u.id !== deleteDialog.staff!.id);
    localStorage.setItem('mk_marketing_users', JSON.stringify(updatedUsers));

    toast.success(`✅ Staff member "${deleteDialog.staff.fullName}" deleted successfully`);
    setDeleteDialog({ open: false, staff: null });
    loadStaffList();
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <CardTitle className="text-blue-900">Staff Management</CardTitle>
              <CardDescription className="text-blue-700">
                Create and manage staff accounts, reset passwords, and control user access
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Staff List Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>Total: {staffList.length} staff members</CardDescription>
            </div>
            <Button onClick={() => setAddStaffDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Staff
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {staffList.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Code</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffList.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <Badge variant="outline">{staff.staffCode}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{staff.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{staff.email}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {staff.role === 'admin' ? 'Admin' : 'Staff'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setResetPasswordDialog({ open: true, staff })}
                            className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                          >
                            <Key className="w-4 h-4 mr-1" />
                            Reset Password
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: true, staff })}
                            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No staff members found</p>
              <p className="text-sm">Click "Add New Staff" to create your first staff account</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={addStaffDialog} onOpenChange={setAddStaffDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Create a new staff account with login credentials
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="e.g., Rajesh Kumar"
                value={newStaff.fullName}
                onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="staffCode">Staff Code *</Label>
              <Input
                id="staffCode"
                placeholder="e.g., STF001"
                value={newStaff.staffCode}
                onChange={(e) => setNewStaff({ ...newStaff, staffCode: e.target.value.toUpperCase() })}
              />
              <p className="text-xs text-muted-foreground mt-1">Unique code for identification</p>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., rajesh@mkmarketing.com"
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value.toLowerCase() })}
              />
              <p className="text-xs text-muted-foreground mt-1">Used for login</p>
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 4 characters"
                value={newStaff.password}
                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">Staff will use this to login</p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>All fields are required. Username and Staff Code must be unique.</span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStaffDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff} className="bg-green-600 hover:bg-green-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog.open} onOpenChange={(open) => setResetPasswordDialog({ open, staff: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset password for {resetPasswordDialog.staff?.fullName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Staff Member:</p>
              <p className="text-lg">{resetPasswordDialog.staff?.fullName}</p>
              <p className="text-sm text-muted-foreground">Username: {resetPasswordDialog.staff?.username}</p>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password *</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Minimum 4 characters"
                value={resetPassword.newPassword}
                onChange={(e) => setResetPassword({ ...resetPassword, newPassword: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={resetPassword.confirmPassword}
                onChange={(e) => setResetPassword({ ...resetPassword, confirmPassword: e.target.value })}
              />
            </div>

            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>Staff member will need to use the new password to login.</span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setResetPassword({ newPassword: '', confirmPassword: '' });
              setResetPasswordDialog({ open: false, staff: null });
            }}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} className="bg-orange-600 hover:bg-orange-700">
              <Key className="w-4 h-4 mr-2" />
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, staff: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.staff?.fullName}</strong>?
              <br /><br />
              <span className="text-red-600 font-medium">
                ⚠️ This action cannot be undone. The staff account will be permanently deleted.
              </span>
              <br /><br />
              <span className="text-sm text-muted-foreground">
                Note: Staff members with existing advances or expenses cannot be deleted.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStaff}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Staff
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
