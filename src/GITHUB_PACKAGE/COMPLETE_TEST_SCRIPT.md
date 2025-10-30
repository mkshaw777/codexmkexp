# 🧪 COMPLETE TEST SCRIPT FOR BOLT AI

## Copy-Paste Testing Prompts

Bolt AI mein import karne ke baad, ye prompts order mein use karein.

---

## 🚀 Test 1: Initial Load & Branding

```
I just imported the MK Marketing Expense Management System from GitHub.

Please verify the following loads correctly:
1. Landing page at / shows properly
2. MK Marketing logo in header (white square with "MK" text)
3. Blue and orange color scheme applied
4. Login page accessible at /auth
5. No console errors

If there are errors, fix them. App should load cleanly.
```

**Expected Result:** App loads with MK branding, no errors

---

## 🔐 Test 2: Admin Login & Dashboard

```
Test admin login:

1. Navigate to /auth
2. Enter credentials:
   - Email: admin@mkmarketing.com
   - Password: admin123
3. Click Sign In
4. Should redirect to /dashboard
5. Verify these 7 tabs are visible:
   - Give Advance
   - Settlements
   - Collections  
   - My Expenses
   - Staff Expense
   - All Expenses
   - Staff Management
   - Settings

Confirm admin can access all 7 tabs without errors.
```

**Expected Result:** Admin sees 7 tabs, all accessible

---

## 👥 Test 3: Staff Dropdown & Demo Data

```
As admin on the dashboard:

1. Click "Give Advance" tab
2. Look at the staff dropdown
3. Should show exactly 5 staff members:
   - Rajesh Kumar (STF001)
   - Priya Sharma (STF002)
   - Amit Verma (STF003)
   - Sneha Patel (STF004)
   - Vikram Singh (STF005)

4. Click "Settlements" tab
5. Should see pre-loaded advances
6. Should show settlement status for each

If staff dropdown is empty:
- Open console (F12)
- Run: debugHelper.showStaff()
- Run: debugHelper.fix()
- Fix the getAllStaff() function

Confirm dropdown shows all 5 staff with correct names and codes.
```

**Expected Result:** 5 staff visible, demo advances showing

---

## 💼 Test 4: Create New Advance

```
Create a new advance as admin:

1. Stay on "Give Advance" tab
2. Fill the form:
   - Staff: Select "Rajesh Kumar"
   - Amount: 5000
   - Description: "Test advance for Bolt AI"
   - Date: Today's date
3. Click "Give Advance" button
4. Should see success message
5. New advance should appear in the list below
6. Verify staff name shows correctly
7. Status should be "Active"

If submission fails, check:
- getAllStaff() returns staff
- createAdvance() function works
- Form validation passes

Confirm advance creation works perfectly.
```

**Expected Result:** New advance created successfully

---

## 👤 Test 5: Staff Login & Dashboard

```
Test staff login:

1. Click logout button
2. Return to /auth login page
3. Enter staff credentials:
   - Email: rajesh@mkmarketing.com
   - Password: staff123
4. Click Sign In
5. Should redirect to /dashboard
6. Verify staff sees 5 tabs:
   - Dashboard
   - My Advances
   - Collections
   - My Expenses
   - Settings

7. On Dashboard tab, should see:
   - "Unsettled Advances" section
   - List of advances given to Rajesh
   - Can click "Submit Expense" button

Confirm staff login works and shows correct interface.
```

**Expected Result:** Staff sees 5 tabs, unsettled advances visible

---

## 📝 Test 6: Submit Expense

```
As staff (Rajesh), submit an expense:

1. On Dashboard, click "Submit Expense" on any advance
2. Should open expense form
3. Fill the form:
   - Category: Select "Transport"
   - Subcategory: Select "Travel"
   - Category Detail: "Test transport expense"
   - Fare: 500
   - Parking: 100
   - Oil: 800
   - Breakfast: 150
   - Others: 50
   - Number of Cases: 15
   - Remarks: "Testing expense submission"
4. Click "Submit Expense"
5. Should see success message
6. Go to "My Expenses" tab
7. Should see the submitted expense
8. Status should show as "Pending"

If form doesn't work:
- Check category conditional fields
- Verify total calculation (500+100+800+150+50 = 1600)
- Check createExpense() function

Confirm expense submission works end-to-end.
```

**Expected Result:** Expense submitted, visible in My Expenses

---

## 💰 Test 7: Settlement Process

```
Test settlement as admin:

1. Logout from staff
2. Login as admin@mkmarketing.com / admin123
3. Go to "Settlements" tab
4. Find Rajesh Kumar's advance
5. Should show:
   - Advance Amount: [Amount]
   - Total Expenses: [Sum of expenses]
   - Balance: [Advance - Expenses]
   - Status indicator (Surplus/Deficit)

6. Verify calculation is correct
7. Click "Settle" button
8. Should show confirmation dialog
9. Confirm settlement
10. Status should change to "Settled"
11. Settlement date should show

If settlement fails:
- Check calculateAdvanceBalance() function
- Verify settleExpense() works
- Check UI updates properly

Confirm settlement calculations and process work correctly.
```

**Expected Result:** Settlement completed with correct calculations

---

## 🏪 Test 8: Collections System

```
Test collections feature:

**As Admin:**
1. Login as admin
2. Go to "Collections" tab
3. Enter a collection:
   - Customer Name: "ABC Company"
   - Amount: 10000
   - Date: Today
   - Remarks: "Admin test collection"
4. Submit
5. Should appear as "Approved" immediately (admin auto-approves)

**As Staff:**
6. Logout, login as rajesh@mkmarketing.com / staff123
7. Go to "Collections" tab
8. Enter a collection:
   - Customer Name: "XYZ Store"
   - Amount: 5000
   - Date: Today
   - Remarks: "Staff test collection"
9. Submit
10. Should show "Pending" status

**Back to Admin:**
11. Logout, login as admin
12. Go to "Collections" tab
13. Should see staff entry with "Approve" button
14. Click "Approve"
15. Status should change to "Approved"

Confirm entire admin-staff collection workflow works.
```

**Expected Result:** Collections work for both admin and staff

---

## 🎨 Test 9: UI/UX & Responsiveness

```
Test the user interface:

1. Check MK Marketing branding:
   - Logo in header (white square with MK)
   - Blue gradient header
   - Orange accent colors
   - Professional footer

2. Test navigation:
   - All tabs clickable
   - Tab content loads
   - Forms are accessible
   - Buttons respond

3. Test responsive design:
   - Open DevTools (F12)
   - Toggle device toolbar
   - Select mobile view (iPhone 12)
   - Navigate through tabs
   - Forms should be usable
   - Tables should scroll

4. Check visual consistency:
   - Cards have proper spacing
   - Text is readable
   - Colors are consistent
   - Icons align properly

Confirm UI looks professional and works on mobile.
```

**Expected Result:** Professional UI, mobile responsive

---

## 🔍 Test 10: Data Persistence

```
Test data persistence:

1. Login as admin
2. Create a test advance
3. Note the advance ID or details
4. Refresh the page (F5)
5. Should redirect to dashboard (logged in)
6. Advance should still be there
7. Open browser console
8. Run: localStorage.getItem('mk_marketing_advances')
9. Should see the advance in the data
10. Run: debugHelper.checkHealth()
11. Should show:
    - localStorage working ✅
    - 6 users (1 admin + 5 staff) ✅
    - No issues ✅

12. Clear localStorage: localStorage.clear()
13. Refresh page
14. Should create demo data automatically
15. 5 advances should appear
16. 8 expenses should appear

Confirm data persists and demo data initializes correctly.
```

**Expected Result:** Data persists, demo data auto-creates

---

## 🐛 Debug Test: If Something Breaks

```
If you encounter any issues:

1. Open browser console (F12)
2. Run these commands and report results:

// Check system health
debugHelper.checkHealth()

// Show all users
debugHelper.showUsers()

// Show only staff
debugHelper.showStaff()

Based on the output:

If users are missing or corrupted:
debugHelper.fix()

If staff dropdown is empty but users exist:
- Check getAllStaff() function in lib/data.ts
- Verify role filter works correctly
- Make sure 'staff' role is lowercase

If demo data is missing:
- Check if initializeDemoData() runs in App.tsx
- Verify localStorage keys
- Run: localStorage.clear(); location.reload();

Report the exact error and I'll fix it.
```

---

## 🎯 Complete Workflow Test

```
Run complete end-to-end test:

**Setup:**
1. Open browser console
2. Run: localStorage.clear()
3. Refresh page
4. Demo data should initialize

**Admin Flow:**
5. Login: admin@mkmarketing.com / admin123
6. Give Advance tab → Create advance for Priya (₹3000)
7. Settlements tab → Verify advance shows as unsettled
8. My Expenses tab → Create personal expense (₹1000)
9. Collections tab → Enter collection (₹5000)
10. All Expenses tab → View all expenses
11. Staff Management tab → View staff list

**Staff Flow:**
12. Logout → Login: priya@mkmarketing.com / staff123
13. Dashboard → Should see ₹3000 advance
14. Click "Submit Expense"
15. Fill expense form (₹1550 total)
16. My Advances → Verify advance shows
17. My Expenses → Verify expense shows as pending
18. Collections → Enter collection (₹2000)

**Settlement Flow:**
19. Logout → Login as admin
20. Settlements → Find Priya's advance
21. Verify: ₹3000 - ₹1550 = ₹1450 surplus
22. Click "Settle" → Confirm
23. Status changes to "Settled"
24. Go to All Expenses → Priya's expense shows "Settled"

**Data Verification:**
25. Console: debugHelper.checkHealth()
26. Should show all systems operational
27. Refresh page
28. All data should persist
29. No errors in console

If ANY step fails, identify the issue and fix it immediately.
This complete workflow must work flawlessly.
```

**Expected Result:** Entire workflow works without errors

---

## 📊 Performance Test

```
Test application performance:

1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Login as admin
5. Click through all 7 tabs
6. Create an advance
7. Go to settlements
8. Stop recording
9. Check for:
   - Page load time < 2 seconds
   - Tab switching < 500ms
   - Form submission < 1 second
   - No memory leaks
   - No unnecessary re-renders

10. Go to Console tab
11. Should have no errors
12. Should have no warnings
13. Only expected logs:
    - "🚀 App Starting..."
    - "✅ System initialized..."
    - "Debug Helper loaded..."

Confirm app is fast and performant.
```

**Expected Result:** Fast, smooth, no performance issues

---

## ✅ Final Comprehensive Check

```
Final system verification:

Run all these checks:

**Authentication:**
- [ ] Admin login works
- [ ] Staff login works  
- [ ] Logout works
- [ ] Session persists on refresh

**Admin Features:**
- [ ] Can create advances
- [ ] Can view all advances
- [ ] Can settle expenses
- [ ] Can view all expenses
- [ ] Can manage staff
- [ ] Can create personal expenses
- [ ] Can manage collections
- [ ] Can change password

**Staff Features:**
- [ ] Can view unsettled advances
- [ ] Can submit expenses
- [ ] Can view own expenses
- [ ] Can enter collections
- [ ] Can change password

**Data:**
- [ ] Demo data loads (6 users, 5 advances, 8 expenses)
- [ ] Staff dropdown shows 5 members
- [ ] Data persists on refresh
- [ ] debugHelper.checkHealth() shows no issues

**UI/UX:**
- [ ] MK Marketing branding visible
- [ ] Blue/orange colors applied
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Forms validate properly
- [ ] Buttons work correctly

**Calculations:**
- [ ] Expense totals correct
- [ ] Settlement calculations accurate
- [ ] Balance updates properly

If all checkboxes pass: System is PRODUCTION READY! ✅
If any fails: Debug and fix that specific feature.
```

---

## 🎊 Success Criteria

System passes ALL tests if:

✅ Admin can login and access 7 tabs  
✅ Staff can login and access 5 tabs
✅ Staff dropdown shows all 5 members
✅ Can create advances successfully
✅ Staff can submit expenses
✅ Settlement calculations are correct
✅ Collections work for admin and staff
✅ Data persists after refresh
✅ Demo data initializes automatically
✅ MK branding is visible everywhere
✅ No console errors
✅ Mobile responsive
✅ debugHelper.checkHealth() shows healthy

**If all criteria met: DEPLOY! 🚀**

---

## 📞 Quick Reference

### Login Credentials
```
Admin: admin@mkmarketing.com / admin123
Staff: rajesh@mkmarketing.com / staff123
```

### Debug Commands
```javascript
debugHelper.checkHealth()  // Full health check
debugHelper.showStaff()    // Show staff list
debugHelper.fix()          // Auto-fix issues
debugHelper.reset()        // Hard reset
```

### Reset App
```javascript
localStorage.clear()
location.reload()
```

---

**Happy Testing! 🧪**

Use these prompts in order to thoroughly test every feature of the system.
