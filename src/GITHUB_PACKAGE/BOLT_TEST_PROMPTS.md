# Bolt AI Testing Prompts - MK Marketing Expense Management

## 🎯 Complete Testing Guide

Use these prompts in Bolt AI after importing from GitHub to verify everything works perfectly.

---

## 📝 Test Prompt 1: Initial System Verification

```
I have imported the MK Marketing Expense Management System from GitHub. Please verify that the application is running correctly.

Check the following:

1. Application loads without errors
2. Landing page shows properly with MK Marketing branding
3. Login page is accessible at /auth
4. Blue and orange color scheme is applied
5. MK logo is visible in header

If there are any errors, please fix them. The app should load cleanly.
```

---

## 🔐 Test Prompt 2: Authentication Testing

```
Test the authentication system:

1. Login with admin credentials:
   - Email: admin@mkmarketing.com
   - Password: admin123

2. Verify admin sees 7 tabs:
   - Give Advance
   - Settlements
   - Collections
   - My Expenses
   - Staff Expense
   - All Expenses
   - Staff Management
   - Settings

3. Logout and login with staff credentials:
   - Email: rajesh@mkmarketing.com
   - Password: staff123

4. Verify staff sees 5 tabs:
   - Dashboard
   - My Advances
   - Collections
   - My Expenses
   - Settings

Confirm both user types can login and see their respective dashboards.
```

---

## 👥 Test Prompt 3: Staff Management & Demo Data

```
Login as admin (admin@mkmarketing.com / admin123) and verify demo data:

1. Go to "Give Advance" tab
2. Click the staff dropdown
3. Confirm you see all 5 staff members:
   - Rajesh Kumar (STF001)
   - Priya Sharma (STF002)
   - Amit Verma (STF003)
   - Sneha Patel (STF004)
   - Vikram Singh (STF005)

4. Go to "Settlements" tab
5. Verify you see pre-loaded advances with settlement status

6. Go to "All Expenses" tab  
7. Verify you see demo expenses

If staff dropdown is empty or demo data is missing, check browser console and fix the issue. The getAllStaff() function should return 5 staff members.
```

---

## 💰 Test Prompt 4: Advance Management

```
Test the advance management workflow as admin:

1. Go to "Give Advance" tab
2. Try to create a new advance:
   - Select staff: Rajesh Kumar
   - Amount: 5000
   - Description: Test advance
   - Date: Today's date

3. Submit the form
4. Verify the advance appears in the list below
5. Check that the staff name and details are correct

If there are any errors during submission or if the advance doesn't appear, please fix the issue.
```

---

## 📊 Test Prompt 5: Expense Submission

```
Test expense submission as staff:

1. Logout from admin
2. Login as: rajesh@mkmarketing.com / staff123
3. Go to "Dashboard" tab
4. Click on any unsettled advance
5. Fill out the expense form:
   - Select category: Transport
   - Subcategory: Travel
   - Fill in fare, parking, oil amounts
   - Number of cases: 10
   - Add remarks

6. Submit the expense
7. Verify expense appears in "My Expenses" tab
8. Check settlement status shows correctly

Confirm the entire flow works without errors.
```

---

## 🎨 Test Prompt 6: Branding & UI

```
Verify the MK Marketing branding is applied correctly:

1. Check header:
   - MK logo in white rounded square
   - "MK Marketing" text
   - Blue gradient background
   - Orange accent badge

2. Check color scheme:
   - Primary buttons are blue
   - Secondary/accent elements are orange
   - Cards have proper shadows
   - Text is readable

3. Check footer:
   - Company name
   - Copyright text
   - Professional styling

4. Test responsive design:
   - Works on desktop view
   - Tabs are accessible
   - Forms are usable

If any branding elements are missing or colors are wrong, please fix them to match the MK Marketing corporate identity.
```

---

## 🔧 Test Prompt 7: Settlement Calculations

```
Test settlement calculation logic as admin:

1. Login as admin
2. Go to "Settlements" tab
3. Find any advance with expenses
4. Verify the calculation:
   - Advance Amount shown correctly
   - Total Expenses calculated
   - Surplus/Deficit shown correctly
   - Formula: Surplus = Advance - Expenses

5. Click "Settle" on an advance
6. Confirm settlement status updates
7. Check that settled advances show proper status

If calculations are wrong or settlement doesn't work, fix the logic in the settlement component.
```

---

## 📱 Test Prompt 8: Collections System

```
Test the collections management:

Admin Test:
1. Login as admin
2. Go to "Collections" tab
3. Enter a new collection:
   - Customer name: Test Customer
   - Amount: 10000
   - Date: Today
   - Remarks: Test entry

4. Verify it appears as approved (admin entries auto-approve)

Staff Test:
5. Logout and login as staff (rajesh@mkmarketing.com)
6. Go to "Collections" tab
7. Enter a collection:
   - Customer name: Another Customer
   - Amount: 5000
   - Date: Today

8. Logout and login as admin
9. Check if staff entry appears as pending
10. Approve the staff entry

Confirm the entire admin-staff collection workflow works.
```

---

## 🗃️ Test Prompt 9: Data Persistence

```
Test data persistence:

1. Login as admin and create a new advance
2. Create a test staff expense
3. Add a collection entry
4. Refresh the browser (F5)
5. Verify all data is still there:
   - Advance still exists
   - Expense still exists  
   - Collection still exists
   - User session maintained (auto-redirects to dashboard)

6. Open browser console and run:
   debugHelper.checkHealth()

7. Verify output shows:
   - localStorage working
   - 6 users total (1 admin + 5 staff)
   - No issues detected

If data is lost on refresh or health check fails, investigate localStorage issues.
```

---

## 🎯 Test Prompt 10: Complete Workflow Test

```
Run a complete end-to-end workflow:

**As Admin:**
1. Login as admin@mkmarketing.com / admin123
2. Go to "Give Advance" tab
3. Create advance for Priya Sharma: ₹3000
4. Go to "Settlements" tab, verify it shows as unsettled

**As Staff:**
5. Logout, login as priya@mkmarketing.com / staff123
6. Go to "Dashboard", verify advance appears
7. Click the advance, submit expense:
   - Category: Transport
   - Fare: 500, Parking: 100, Oil: 800, Breakfast: 150
   - Total: 1550
   - Number of cases: 12
8. Go to "My Expenses", verify expense shows as pending

**As Admin Again:**
9. Logout, login as admin
10. Go to "Settlements" tab
11. Find Priya's advance
12. Verify calculation: ₹3000 - ₹1550 = ₹1450 surplus
13. Click "Settle" button
14. Verify advance shows as settled

**Final Check:**
15. Go to "All Expenses" tab
16. Verify Priya's expense shows as settled
17. Check settlement status and admin name

This entire workflow should work smoothly without any errors. If there are issues at any step, please fix them.
```

---

## 🐛 Debug Test Prompts

### If Staff Dropdown is Empty:
```
The staff dropdown is showing empty. Open browser console and run these commands, then tell me the output:

debugHelper.showStaff()
debugHelper.checkHealth()

Based on the output, fix the issue. The problem is usually:
1. Users not initialized properly
2. getAllStaff() function not finding staff role
3. LocalStorage corrupted

Fix it so that 5 staff members appear in the dropdown.
```

### If Demo Data is Missing:
```
Demo data is not showing. Please:

1. Check if initializeDemoData() is being called in App.tsx
2. Verify localStorage has the demo data key
3. Check browser console for any initialization errors
4. Add console logs to debug the demo data creation

Fix the issue so that when the app loads for the first time, it automatically creates:
- 5 advances (one for each staff)
- 8 demo expenses across different categories
```

### If Login Fails:
```
Login is not working. Check:

1. Is signInWithEmail() function being called correctly?
2. Are user credentials being checked properly?
3. Is localStorage being set for current user?
4. Are there any console errors?

The default admin credentials should be:
- Email: admin@mkmarketing.com
- Password: admin123

Fix the authentication to work with these credentials.
```

---

## ✅ Success Criteria

Your app passes all tests if:

- ✅ Admin can login and see 7 tabs
- ✅ Staff can login and see 5 tabs  
- ✅ Staff dropdown shows all 5 members (Rajesh, Priya, Amit, Sneha, Vikram)
- ✅ Demo data loads automatically (5 advances, 8 expenses)
- ✅ Can create new advances
- ✅ Staff can submit expenses against advances
- ✅ Settlement calculations are correct
- ✅ Collections system works for both admin and staff
- ✅ Data persists after page refresh
- ✅ MK Marketing branding is visible (blue/orange colors, logo)
- ✅ No console errors on any page
- ✅ debugHelper.checkHealth() shows no issues
- ✅ Responsive design works

---

## 🚀 Performance Test

```
Test the application performance:

1. Login as admin
2. Open browser DevTools (F12)
3. Go to Console tab
4. Check for any errors or warnings
5. Go to Network tab
6. Refresh page
7. Verify page loads in under 2 seconds
8. Check there are no failed network requests

9. Go to Performance tab
10. Click Record
11. Navigate through all tabs
12. Stop recording
13. Check for any performance issues

The app should be fast and responsive with no lag when switching tabs or submitting forms.
```

---

## 📊 Final Comprehensive Test

```
Run this final comprehensive test to verify everything:

**Setup:**
1. Clear all localStorage: localStorage.clear()
2. Refresh page
3. Verify demo data is created automatically

**Admin Testing:**
4. Login as admin@mkmarketing.com / admin123
5. Test each tab one by one
6. Create a test advance for Rajesh Kumar
7. Create a personal expense entry
8. View all expenses across all staff
9. Manage staff (view list)
10. Change password in settings

**Staff Testing:**
11. Logout, login as rajesh@mkmarketing.com / staff123
12. View dashboard and unsettled advances
13. Submit an expense against the test advance
14. Enter a customer collection
15. View expense history
16. Change password

**Settlement Testing:**
17. Logout, login as admin
18. Go to Settlements
19. Find Rajesh's test advance
20. Verify calculation
21. Settle the advance
22. Verify status updates

**Data Verification:**
23. Open console, run: debugHelper.checkHealth()
24. Should show: 6 users, 1 admin, 5 staff, no issues
25. Refresh page
26. Verify all test data persists

**Branding Check:**
27. Verify MK Marketing logo in header
28. Check blue gradient header
29. Check orange accents
30. Verify professional footer

If all 30 steps pass, the system is working perfectly! 🎉

If any step fails, identify and fix the specific issue.
```

---

## 💡 Quick Tips

- Always check browser console for errors first
- Use `debugHelper.checkHealth()` to diagnose issues
- Staff dropdown issues are usually `getAllStaff()` related
- Demo data issues check `initializeDemoData()` in App.tsx
- For complete reset: `localStorage.clear(); location.reload()`

---

**Happy Testing! 🚀**

These prompts will help you thoroughly test every aspect of the MK Marketing Expense Management System in Bolt AI.
