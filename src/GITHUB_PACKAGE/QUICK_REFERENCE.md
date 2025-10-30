# ⚡ QUICK REFERENCE CARD

## 🚀 3-Step Setup

1. **Copy Components** → `/GITHUB_PACKAGE/src/components/` (10 min)
2. **Push to GitHub** → `git init && git add . && git commit -m "Init" && git push` (2 min)
3. **Import to Bolt** → bolt.new → Import from GitHub (1 min)

**Total Time:** ~15 minutes

---

## 🔑 Demo Logins

```
Admin:  admin@mkmarketing.com / admin123
Staff:  rajesh@mkmarketing.com / staff123
        priya@mkmarketing.com / staff123
        amit@mkmarketing.com / staff123
        sneha@mkmarketing.com / staff123
        vikram@mkmarketing.com / staff123
```

---

## 🧪 Quick Test (Bolt AI)

```
Test MK Marketing system:
1. Login: admin@mkmarketing.com / admin123
2. Check: 5 staff in dropdown, 7 tabs, MK branding
3. Login: rajesh@mkmarketing.com / staff123  
4. Check: Dashboard, advances, 5 tabs
Fix any issues. Must work perfectly.
```

---

## 🐛 Debug Commands

```javascript
// Health check
debugHelper.checkHealth()

// Show staff
debugHelper.showStaff()

// Auto-fix
debugHelper.fix()

// Reset all
debugHelper.reset()

// Clear data
localStorage.clear(); location.reload();
```

---

## 📁 File Structure

```
src/
├── App.tsx              ✅ Ready
├── main.tsx             ✅ Ready
├── pages/               ✅ Ready (3 files)
├── lib/                 ✅ Ready (4 files)
├── styles/              ✅ Ready (1 file)
└── components/          ⚠️  Copy 66 files
```

---

## 🔄 Import Fix

**Find:** `from '../`  
**Replace:** `from '@/`

**Find:** `from './`  
**Replace:** `from '@/`

---

## 📦 What's Ready

✅ Configuration (6 files)
✅ Documentation (5 files)
✅ Pages (3 files)
✅ Lib (4 files)  
✅ Styles (1 file)
⚠️  Components (66 files - need copy)

---

## ✅ Success Check

- [ ] 5 staff show in dropdown
- [ ] Demo data loads (5 advances, 8 expenses)
- [ ] MK branding visible
- [ ] No console errors
- [ ] Data persists on refresh

---

## 📊 Stats

- **Components:** 66 files
- **Total Code:** 15,000+ lines
- **Features:** 12+ major features
- **Demo Users:** 6 (1 admin + 5 staff)
- **Demo Data:** 5 advances, 8 expenses

---

## 🎨 Colors

```css
Primary:    hsl(217, 91%, 60%)  /* Blue */
Secondary:  hsl(24, 95%, 53%)   /* Orange */
Success:    hsl(142, 71%, 45%)  /* Green */
```

---

## 🔧 Common Fixes

**Staff dropdown empty?**
```javascript
debugHelper.showStaff()
debugHelper.fix()
```

**No demo data?**
```javascript
localStorage.clear()
location.reload()
```

**Import errors?**
- Check all imports use `@/`
- Verify `vite.config.ts` has alias

---

## 📖 Full Guides

1. `README.md` - Overview
2. `BOLT_IMPORT_INSTRUCTIONS.md` - Import guide
3. `COPY_COMPONENTS_GUIDE.md` - Component guide
4. `BOLT_TEST_PROMPTS.md` - Test prompts
5. `COMPLETE_TEST_SCRIPT.md` - Test script

---

## 🎯 Next Action

**→ COPY COMPONENTS (Follow COPY_COMPONENTS_GUIDE.md)**

Then:
- Push to GitHub
- Import to Bolt AI
- Test & Deploy

---

**Time to Production:** ~20 minutes 🚀
