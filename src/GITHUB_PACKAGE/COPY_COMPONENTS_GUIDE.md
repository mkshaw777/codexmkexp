# Components Copy Guide

## 📋 Overview
Aapko `/components` folder ke saare files ko `/GITHUB_PACKAGE/src/components/` mein copy karna hai with proper @/ imports.

## 🔄 Import Conversion Rules

### Current Imports (Lovable style):
```tsx
import { Button } from '../components/ui/button';
import { getCurrentUser } from '../lib/auth';
import BrandHeader from '../components/BrandHeader';
```

### New Imports (Bolt AI style with @/):
```tsx
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import BrandHeader from '@/components/BrandHeader';
```

## 📁 Files to Copy

### Main Components (24 files)
Copy these from `/components/` to `/GITHUB_PACKAGE/src/components/`:

1. AdminAdvanceForm.tsx
2. AdminAdvanceListEnhanced.tsx
3. AdminCollectionManagement.tsx
4. AdminPersonalExpense.tsx
5. AdvanceList.tsx
6. BalanceCard.tsx
7. BillImageViewer.tsx
8. BrandFooter.tsx
9. BrandHeader.tsx
10. DebugPanel.tsx
11. ExpenseForm.tsx
12. ExpenseList.tsx
13. ExpenseListEnhanced.tsx
14. ImageManagement.tsx
15. PasswordSettings.tsx
16. ReturnForm.tsx
17. ReturnList.tsx
18. StaffAdvanceList.tsx
19. StaffCollectionEntry.tsx
20. StaffExpenseForm.tsx
21. StaffExpenseManagement.tsx
22. StaffManagement.tsx
23. SystemVerification.tsx
24. UnsettledAdvances.tsx
25. UserGuide.tsx

### UI Components Folder
Copy entire `/components/ui/` folder to `/GITHUB_PACKAGE/src/components/ui/`
- Already using shadcn/ui with @/ imports
- No changes needed

### Figma Components Folder  
Copy `/components/figma/ImageWithFallback.tsx` to `/GITHUB_PACKAGE/src/components/figma/`
- No import changes needed (protected file)

## 🛠️ Quick Copy Script

### Option 1: Manual Copy with Find & Replace

1. Copy each component file
2. Use Find & Replace in your editor:
   - Find: `from '../components/`
   - Replace: `from '@/components/`
   
   - Find: `from '../lib/`
   - Replace: `from '@/lib/`
   
   - Find: `from './components/`
   - Replace: `from '@/components/`
   
   - Find: `from './lib/`
   - Replace: `from '@/lib/`

### Option 2: Use This Conversion Pattern

For each component, convert relative imports to @/ imports:

**Before:**
```tsx
import { Card } from '../components/ui/card';
import { getCurrentUser } from '../lib/auth';
import { getAdvances } from '../lib/data';
import BrandHeader from '../components/BrandHeader';
```

**After:**
```tsx
import { Card } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';
import { getAdvances } from '@/lib/data';
import BrandHeader from '@/components/BrandHeader';
```

## ✅ Verification Checklist

After copying all components:

- [ ] All 24 main components copied to `/GITHUB_PACKAGE/src/components/`
- [ ] All `/components/ui/*.tsx` files copied
- [ ] `/components/figma/ImageWithFallback.tsx` copied
- [ ] All imports converted from `../` to `@/`
- [ ] All imports converted from `./` to `@/` (where applicable)
- [ ] No relative path imports remaining

## 🔍 Common Import Patterns

### From UI Components:
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
```

### From Lib:
```tsx
import { getCurrentUser } from '@/lib/auth';
import { getAdvances, createAdvance, updateAdvance } from '@/lib/data';
```

### From Other Components:
```tsx
import BrandHeader from '@/components/BrandHeader';
import BrandFooter from '@/components/BrandFooter';
import BalanceCard from '@/components/BalanceCard';
```

### From External Packages:
```tsx
import { toast } from 'sonner@2.0.3';  // Version specified
import { Calendar, Trash2, CheckCircle } from 'lucide-react';  // No version
```

## 💡 Tips

1. **UI Components:** Don't modify them - they're already using @/ imports from shadcn
2. **ImageWithFallback:** This is a protected file - copy as-is
3. **sonner import:** Must use `sonner@2.0.3` version (not just 'sonner')
4. **Relative imports:** Any `../` or `./` should become `@/`

## 🚀 Quick Bash Script (Optional)

```bash
# Navigate to root project directory
cd /path/to/your/project

# Copy all components
cp -r components/ui GITHUB_PACKAGE/src/components/
cp -r components/figma GITHUB_PACKAGE/src/components/
cp components/*.tsx GITHUB_PACKAGE/src/components/

# Use sed to replace imports (macOS/Linux)
find GITHUB_PACKAGE/src/components -name "*.tsx" -type f -exec sed -i '' "s|from '../components/|from '@/components/|g" {} +
find GITHUB_PACKAGE/src/components -name "*.tsx" -type f -exec sed -i '' "s|from '../lib/|from '@/lib/|g" {} +
find GITHUB_PACKAGE/src/components -name "*.tsx" -type f -exec sed -i '' "s|from './components/|from '@/components/|g" {} +
find GITHUB_PACKAGE/src/components -name "*.tsx" -type f -exec sed -i '' "s|from './lib/|from '@/lib/|g" {} +
```

**Note:** On Linux, remove the `''` after `-i`:
```bash
sed -i "s|pattern|replacement|g" file
```

## ✨ Final Check

After copying and converting all files:

1. Open `/GITHUB_PACKAGE/src/` folder
2. Verify structure:
```
src/
├── App.tsx
├── main.tsx
├── components/
│   ├── ui/           (41 files)
│   ├── figma/        (1 file)
│   └── *.tsx         (24 main component files)
├── lib/
│   ├── auth.ts
│   ├── data.ts
│   ├── debug-helper.ts
│   └── migration.ts
├── pages/
│   ├── Index.tsx
│   ├── Auth.tsx
│   └── Dashboard.tsx
└── styles/
    └── globals.css
```

3. Search in all files for `from '../` or `from './`
4. All should be converted to `from '@/`

---

**Ready for GitHub Push!** 🎉

After completing this guide, your package is ready to:
1. Push to GitHub
2. Import into Bolt AI
3. Test with provided test prompts
