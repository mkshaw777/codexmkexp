# MK Marketing - Expense Management System
## Bolt AI Import & Testing Instructions

### 📦 Package Contents
This package contains a complete, production-ready expense management system with:
- ✅ Role-based authentication (Admin & Staff)
- ✅ Advance management with individual tracking
- ✅ Category-based expense tracking
- ✅ Collection management system
- ✅ MK Marketing professional branding
- ✅ Pre-loaded demo data (1 Admin + 5 Staff)

---

## 🚀 Quick Start - Import to Bolt AI

### Step 1: Push to GitHub
```bash
cd GITHUB_PACKAGE
git init
git add .
git commit -m "Initial commit - MK Marketing Expense Management"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Import in Bolt AI
1. Open Bolt AI (bolt.new)
2. Click "Import from GitHub"
3. Enter your GitHub repository URL
4. Wait for import to complete

---

## 🧪 Complete Testing Prompt for Bolt AI

Copy and paste this into Bolt AI after import:

```
Please verify this MK Marketing Expense Management System is working correctly. 

Test the following:

1. **Login System**:
   - Admin: admin@mkmarketing.com / admin123
   - Staff: rajesh@mkmarketing.com / staff123
   
2. **Admin Features** (login as admin):
   - View all 7 tabs (Give Advance, Settlements, Collections, My Expenses, Staff Expense, All Expenses, Staff Management, Settings)
   - Check if 5 staff members appear in dropdown on "Give Advance" tab
   - Verify pre-loaded advances are showing
   - Check settlement calculations

3. **Staff Features** (login as rajesh):
   - View Dashboard showing unsettled advances
   - Check My Advances tab
   - Verify expense submission works
   - Test Collections entry

4. **Branding**:
   - MK Marketing logo and blue/orange colors should be visible
   - Professional header with company name
   - Footer with copyright

5. **Demo Data**:
   - 5 staff members with advances
   - Multiple expenses with different categories
   - Proper settlement status tracking

If anything is not working, please fix it. The app should be fully functional with all features working.
```

---

## 📊 System Architecture

### File Structure
```
src/
├── App.tsx                 # Main app with routing
├── main.tsx               # Entry point
├── pages/
│   ├── Index.tsx          # Landing page
│   ├── Auth.tsx           # Login page
│   └── Dashboard.tsx      # Main dashboard
├── components/            # All UI components
├── lib/
│   ├── auth.ts           # Authentication logic
│   ├── data.ts           # Data management
│   ├── migration.ts      # Data migration
│   └── debug-helper.ts   # Debug utilities
└── styles/
    └── globals.css       # Global styles with MK branding
```

### Key Features

**Admin Dashboard Tabs:**
1. Give Advance - Issue advances to staff
2. Settlements - View and settle pending expenses
3. Collections - Manage customer collections
4. My Expenses - Personal expense tracking with CSV/PDF export
5. Staff Expense - View all staff expenses
6. All Expenses - Complete expense list
7. Staff Management - Create/manage staff accounts
8. Settings - Password management

**Staff Dashboard Tabs:**
1. Dashboard - View unsettled advances
2. My Advances - Track all received advances
3. Collections - Enter customer collections
4. My Expenses - Submit and track expenses
5. Settings - Password management

---

## 🎯 Demo Accounts

### Admin Account
- **Email:** admin@mkmarketing.com
- **Password:** admin123
- **Features:** Full system access, staff management, settlements

### Staff Accounts (All use password: staff123)
1. **rajesh@mkmarketing.com** - Rajesh Kumar (STF001)
2. **priya@mkmarketing.com** - Priya Sharma (STF002)
3. **amit@mkmarketing.com** - Amit Verma (STF003)
4. **sneha@mkmarketing.com** - Sneha Patel (STF004)
5. **vikram@mkmarketing.com** - Vikram Singh (STF005)

---

## 🔍 Debug Commands

Open browser console and use:
```javascript
// Check system health
debugHelper.checkHealth()

// Show all users
debugHelper.showUsers()

// Show only staff
debugHelper.showStaff()

// Auto-fix issues
debugHelper.fix()

// Hard reset (clear all data)
debugHelper.reset()

// Show help
debugHelper.help()
```

---

## 📝 Expense Categories

1. **Transport** - Travel expenses with fare, parking, oil
2. **Bazar** - Market purchases with supplier details
3. **Sealdah** - Printing work with printer/designer entries
4. **Out Station** - Outstation travel expenses
5. **Paglahat** - Miscellaneous category
6. **Others** - General expenses

---

## 💡 Important Notes

### LocalStorage Keys
- `mk_marketing_users` - User accounts
- `mk_marketing_expenses` - All expenses
- `mk_marketing_advances` - All advances
- `mk_marketing_admin_expenses` - Admin personal expenses
- `mk_marketing_collections` - Customer collections
- `mk_marketing_current_user` - Current logged in user

### Data Persistence
All data is stored in browser's localStorage. To reset:
```javascript
localStorage.clear()
location.reload()
```

### Pre-loaded Demo Data
The system comes with:
- 1 Admin account
- 5 Staff accounts with full details
- 5 Active advances (one per staff)
- 8 Demo expenses across different categories
- Mix of settled and pending expenses

---

## 🛠️ Troubleshooting

### Issue: Staff dropdown is empty
**Solution:**
```javascript
debugHelper.showStaff()  // Should show 5 staff
debugHelper.fix()        // Auto-fix if needed
```

### Issue: No demo data showing
**Solution:**
```javascript
localStorage.clear()
location.reload()
// Demo data will be recreated automatically
```

### Issue: Login not working
**Solution:**
- Check console for errors
- Verify email/password exactly as shown
- Try hard refresh (Ctrl+Shift+R)

---

## 🎨 Branding & Design

### Color Scheme
- **Primary Blue:** hsl(217, 91%, 60%) - MK Marketing brand color
- **Secondary Orange:** hsl(24, 95%, 53%) - Accent color
- **Success Green:** hsl(142, 71%, 45%)
- **Destructive Red:** hsl(0, 84%, 60%)

### Logo
- White rounded square with "MK" text
- Blue text on white background
- Orange accent badge with trend icon

---

## 📚 Additional Resources

### Testing Checklist
- [ ] Login with admin account works
- [ ] Login with staff account works
- [ ] Staff dropdown shows 5 members
- [ ] Give Advance form submits successfully
- [ ] Expense submission works
- [ ] Settlement calculations are correct
- [ ] Collections can be entered
- [ ] MK Marketing branding is visible
- [ ] All tabs are accessible
- [ ] Debug helper commands work

### Success Criteria
✅ All demo accounts login successfully
✅ 5 staff members visible in dropdowns
✅ Pre-loaded advances and expenses showing
✅ Settlement status tracking works
✅ MK Marketing blue/orange branding visible
✅ No console errors on page load
✅ Responsive design works on mobile

---

## 📞 Support

If you encounter any issues:
1. Run `debugHelper.checkHealth()` in console
2. Check browser console for errors
3. Try `debugHelper.fix()` for auto-fix
4. As last resort, use `debugHelper.reset()`

---

## ✨ Quick Test Commands

After import, paste these in Bolt AI to verify everything works:

**Test 1 - Basic Functionality:**
```
Test login with admin@mkmarketing.com / admin123 and verify all 7 tabs are visible
```

**Test 2 - Staff Management:**
```
On Give Advance tab, check if staff dropdown shows all 5 staff members (Rajesh, Priya, Amit, Sneha, Vikram)
```

**Test 3 - Demo Data:**
```
Go to Settlements tab and verify pre-loaded advances are showing with correct balances
```

**Test 4 - Branding:**
```
Verify MK Marketing logo in header with blue and orange colors
```

**Test 5 - Staff Login:**
```
Logout and login as rajesh@mkmarketing.com / staff123, verify Dashboard shows unsettled advances
```

---

**Version:** 2.0
**Last Updated:** October 2025
**Package:** Bolt AI Ready - Complete Source Code
