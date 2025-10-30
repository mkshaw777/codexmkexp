import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { getCurrentUser } from '../lib/auth';

export default function UserGuide() {
  const user = getCurrentUser();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isAdmin ? 'Admin User Guide' : 'Staff User Guide'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {isAdmin ? (
              <>
                <AccordionItem value="item-1">
                  <AccordionTrigger>How to Give Advance to Staff</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to <Badge variant="outline">Give Advance</Badge> tab</li>
                      <li>Select the staff member from the dropdown</li>
                      <li>Enter the advance date and amount</li>
                      <li>Add a description (e.g., "Monthly advance for field work")</li>
                      <li>Click "Give Advance" button</li>
                      <li>The advance will appear in the list below and in staff's account</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>How to Review and Settle Advances</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to <Badge variant="outline">Settlements</Badge> tab</li>
                      <li>You'll see all advances with their expense details:
                        <ul className="list-disc list-inside ml-4 mt-1">
                          <li><strong>Advance</strong>: Original amount given</li>
                          <li><strong>Spent</strong>: Total expenses submitted by staff</li>
                          <li><strong>Balance</strong>: Difference (+ means surplus, - means deficit)</li>
                        </ul>
                      </li>
                      <li>Filter by staff member or search by description</li>
                      <li>Review the balance:
                        <ul className="list-disc list-inside ml-4 mt-1">
                          <li><Badge className="bg-orange-100 text-orange-800">Pending: +₹200</Badge> = Staff should return ₹200</li>
                          <li><Badge className="bg-purple-100 text-purple-800">Pending: -₹200</Badge> = You should pay staff ₹200</li>
                        </ul>
                      </li>
                      <li>Click <strong>Settle</strong> button to mark as settled</li>
                      <li>The advance status will change to <Badge className="bg-blue-100 text-blue-800">Settled</Badge></li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>How to Manage Personal Expenses</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to <Badge variant="outline">My Expenses</Badge> tab</li>
                      <li>Fill in the expense form:
                        <ul className="list-disc list-inside ml-4 mt-1">
                          <li>Date of expense</li>
                          <li>Payment To (shop name, driver name, etc.)</li>
                          <li>Category (e.g., "Shop Purchase", "Driver Payment")</li>
                          <li>Amount and description</li>
                        </ul>
                      </li>
                      <li>Click "Add Expense"</li>
                      <li>View all expenses in the list below</li>
                      <li>Use date filters to view specific periods</li>
                      <li>Click <strong>CSV</strong> or <strong>PDF</strong> to export records</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>How to Manage Bill Images</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to <Badge variant="outline">Images</Badge> tab</li>
                      <li>View overview of total images and monthly breakdown</li>
                      <li>Download options:
                        <ul className="list-disc list-inside ml-4 mt-1">
                          <li><strong>Download All Images</strong>: Get all bills at once</li>
                          <li><strong>Download by Month</strong>: Click download next to specific month</li>
                        </ul>
                      </li>
                      <li>After downloading, you can click <strong>Clear All Images</strong> to free up space</li>
                      <li><strong>Important</strong>: Always download images before clearing them</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How to Add Staff Expense</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to <Badge variant="outline">Staff Expense</Badge> tab</li>
                      <li>Select the staff member</li>
                      <li>Fill in expense details (this is the old expense form for backward compatibility)</li>
                      <li>Click "Add Expense"</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </>
            ) : (
              <>
                <AccordionItem value="item-1">
                  <AccordionTrigger>How to Submit Expense</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <div className="space-y-3 text-sm">
                      <p className="font-semibold">Method 1: With Advance (Recommended)</p>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Go to <Badge variant="outline">My Advances</Badge> tab</li>
                        <li>Find the advance you want to submit expense for</li>
                        <li>Click <strong>Add Expense</strong> button next to that advance</li>
                        <li>The advance will be pre-selected in the form</li>
                        <li>Fill in expense details and submit</li>
                      </ol>

                      <p className="font-semibold mt-4">Method 2: Without Advance</p>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Go to <Badge variant="outline">My Advances</Badge> tab</li>
                        <li>Click any <strong>Add Expense</strong> button</li>
                        <li>Toggle ON the <strong>"Submit Without Advance"</strong> switch</li>
                        <li>Fill in expense details and submit</li>
                        <li>Admin will review and provide advance or settle with negative balance</li>
                      </ol>

                      <p className="text-xs text-muted-foreground mt-2">
                        💡 <strong>Tip:</strong> Use "Without Advance" when you urgently need to submit expenses but haven't received advance yet.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Understanding Categories</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <div className="text-sm space-y-3">
                      <div>
                        <strong>Transport:</strong> Travel expenses, parking, oil
                        <p className="text-muted-foreground ml-4">⚠️ Oil expenses above ₹500 require bill upload</p>
                      </div>
                      <div>
                        <strong>Bazar:</strong> Vegetables, fruits, groceries, and other market purchases
                      </div>
                      <div>
                        <strong>Sealdah:</strong> Market and transport expenses at Sealdah
                      </div>
                      <div>
                        <strong>Out Station:</strong> Travel, accommodation, and food for out-of-station work
                      </div>
                      <div>
                        <strong>Paglahat:</strong> Market and transport expenses at Paglahat
                      </div>
                      <div>
                        <strong>Others:</strong> Any other miscellaneous expenses
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Understanding Balance Status</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <div className="text-sm space-y-3">
                      <p>In the <strong>My Advances</strong> tab, you'll see different balance statuses:</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-orange-100 text-orange-800">To Return: ₹200</Badge>
                          <span>You spent less than advance, need to return money</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-800">To Receive: ₹200</Badge>
                          <span>You spent more than advance, will receive money</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-teal-100 text-teal-800">Balanced</Badge>
                          <span>Advance and expenses match perfectly</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-gray-100 text-gray-800">Settled</Badge>
                          <span>Admin has settled this advance</span>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>How to Upload Bills</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>In the expense form, find the "Upload Bills" section</li>
                      <li>Click on the upload area or the "Click to upload bills" text</li>
                      <li>Select one or more image files or PDFs from your device</li>
                      <li>You'll see the selected files listed</li>
                      <li>To remove a file, click the ✕ button next to it</li>
                      <li>Submit the expense with the bills</li>
                      <li><strong>Remember</strong>: Bills are mandatory for oil expenses above ₹500</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How to Submit Returns</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to <Badge variant="outline">Returns</Badge> tab</li>
                      <li>Fill in the return form with date, amount, and description</li>
                      <li>Click "Submit Return"</li>
                      <li>Your return will show as <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge></li>
                      <li>Admin will review and approve/reject it</li>
                      <li>Once approved, it will show as <Badge className="bg-green-100 text-green-800">Approved</Badge></li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </>
            )}

            <AccordionItem value="item-common">
              <AccordionTrigger>Password and Settings</AccordionTrigger>
              <AccordionContent className="space-y-2">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to <Badge variant="outline">Settings</Badge> tab</li>
                  <li>Enter your current password</li>
                  <li>Enter and confirm your new password</li>
                  <li>Click "Change Password"</li>
                  <li>You'll need to sign in again with the new password</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demo Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium">Admin Account:</p>
            <p className="text-muted-foreground ml-4">Email: admin@mkmarketing.com</p>
            <p className="text-muted-foreground ml-4">Password: admin123</p>
          </div>
          <div>
            <p className="font-medium">Staff Account:</p>
            <p className="text-muted-foreground ml-4">Email: staff@mkmarketing.com</p>
            <p className="text-muted-foreground ml-4">Password: staff123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
