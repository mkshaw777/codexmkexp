# 🤖 AUTOMATED SETUP SCRIPT

**Use this if you want to automate the file copying and import fixing process**

---

## 📋 MANUAL STEPS (Recommended for beginners)

Follow `PUSH_TO_GITHUB_INSTRUCTIONS.md` for step-by-step manual process.

---

## 🚀 AUTOMATED SCRIPT (For advanced users)

### **Option 1: PowerShell Script (Windows)**

Save this as `setup.ps1` in your project root:

```powershell
# MK Marketing - GitHub Package Setup Script
Write-Host "🚀 Starting MK Marketing GitHub Package Setup..." -ForegroundColor Green

# Create destination directories
Write-Host "📁 Creating directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "GITHUB_PACKAGE/src/pages" | Out-Null
New-Item -ItemType Directory -Force -Path "GITHUB_PACKAGE/src/components/ui" | Out-Null
New-Item -ItemType Directory -Force -Path "GITHUB_PACKAGE/src/lib" | Out-Null
New-Item -ItemType Directory -Force -Path "GITHUB_PACKAGE/src/styles" | Out-Null

# Copy main files
Write-Host "📄 Copying main files..." -ForegroundColor Yellow
Copy-Item "App.tsx" -Destination "GITHUB_PACKAGE/src/App.tsx"

# Copy pages
Write-Host "📄 Copying pages..." -ForegroundColor Yellow
Copy-Item "pages/*.tsx" -Destination "GITHUB_PACKAGE/src/pages/"

# Copy components (excluding figma folder)
Write-Host "📄 Copying components..." -ForegroundColor Yellow
Get-ChildItem "components" -Filter "*.tsx" | Copy-Item -Destination "GITHUB_PACKAGE/src/components/"
Copy-Item "components/ui/*.tsx" -Destination "GITHUB_PACKAGE/src/components/ui/"
Copy-Item "components/ui/*.ts" -Destination "GITHUB_PACKAGE/src/components/ui/"

# Copy lib files
Write-Host "📄 Copying lib files..." -ForegroundColor Yellow
Copy-Item "lib/*.ts" -Destination "GITHUB_PACKAGE/src/lib/"

# Copy styles
Write-Host "📄 Copying styles..." -ForegroundColor Yellow
Copy-Item "styles/*.css" -Destination "GITHUB_PACKAGE/src/styles/"

Write-Host "✅ File copying complete!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Now run the import fix script!" -ForegroundColor Yellow
Write-Host "   Execute: node fix-imports.js" -ForegroundColor Cyan
```

Run with:
```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
```

---

### **Option 2: Bash Script (Mac/Linux)**

Save this as `setup.sh`:

```bash
#!/bin/bash

echo "🚀 Starting MK Marketing GitHub Package Setup..."

# Create destination directories
echo "📁 Creating directory structure..."
mkdir -p GITHUB_PACKAGE/src/pages
mkdir -p GITHUB_PACKAGE/src/components/ui
mkdir -p GITHUB_PACKAGE/src/lib
mkdir -p GITHUB_PACKAGE/src/styles

# Copy main files
echo "📄 Copying main files..."
cp App.tsx GITHUB_PACKAGE/src/App.tsx

# Copy pages
echo "📄 Copying pages..."
cp pages/*.tsx GITHUB_PACKAGE/src/pages/

# Copy components (excluding figma folder)
echo "📄 Copying components..."
find components -maxdepth 1 -name "*.tsx" -exec cp {} GITHUB_PACKAGE/src/components/ \;
cp components/ui/*.tsx GITHUB_PACKAGE/src/components/ui/
cp components/ui/*.ts GITHUB_PACKAGE/src/components/ui/

# Copy lib files
echo "📄 Copying lib files..."
cp lib/*.ts GITHUB_PACKAGE/src/lib/

# Copy styles
echo "📄 Copying styles..."
cp styles/*.css GITHUB_PACKAGE/src/styles/

echo "✅ File copying complete!"
echo ""
echo "⚠️  IMPORTANT: Now run the import fix script!"
echo "   Execute: node fix-imports.js"
```

Run with:
```bash
chmod +x setup.sh
./setup.sh
```

---

### **Option 3: Node.js Script (Cross-platform)**

Save this as `fix-imports.js` in GITHUB_PACKAGE folder:

```javascript
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing import paths...\n');

// Function to recursively get all .tsx and .ts files
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Function to fix imports in a file
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Track changes
  const originalContent = content;

  // Fix component imports
  content = content.replace(/from ['"]\.\.\/components\//g, "from '@/components/");
  content = content.replace(/from ['"]\.\/components\//g, "from '@/components/");
  
  // Fix lib imports
  content = content.replace(/from ['"]\.\.\/lib\//g, "from '@/lib/");
  content = content.replace(/from ['"]\.\/lib\//g, "from '@/lib/");
  
  // Fix pages imports
  content = content.replace(/from ['"]\.\.\/pages\//g, "from '@/pages/");
  content = content.replace(/from ['"]\.\/pages\//g, "from '@/pages/");
  
  // Fix import statements (not from)
  content = content.replace(/import ['"]\.\.\/components\//g, "import '@/components/");
  content = content.replace(/import ['"]\.\/components\//g, "import '@/components/");
  content = content.replace(/import ['"]\.\.\/lib\//g, "import '@/lib/");
  content = content.replace(/import ['"]\.\/lib\//g, "import '@/lib/");
  content = content.replace(/import ['"]\.\.\/pages\//g, "import '@/pages/");
  content = content.replace(/import ['"]\.\/pages\//g, "import '@/pages/");
  
  // Fix package versions
  content = content.replace(/sonner@2\.0\.3/g, "sonner");
  content = content.replace(/lucide-react@[\d.]+/g, "lucide-react");
  content = content.replace(/class-variance-authority@[\d.]+/g, "class-variance-authority");
  content = content.replace(/react-day-picker@[\d.]+/g, "react-day-picker");
  content = content.replace(/react-hook-form@[\d.]+/g, "react-hook-form");
  content = content.replace(/recharts@[\d.]+/g, "recharts");
  content = content.replace(/vaul@[\d.]+/g, "vaul");
  content = content.replace(/embla-carousel-react@[\d.]+/g, "embla-carousel-react");
  content = content.replace(/@radix-ui\/([^@\s"']+)@[\d.]+/g, "@radix-ui/$1");

  // Check if modified
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    modified = true;
  }

  return modified;
}

// Main execution
const srcDir = path.join(__dirname, 'src');

if (!fs.existsSync(srcDir)) {
  console.error('❌ Error: src/ directory not found!');
  console.log('Please run the file copying script first.');
  process.exit(1);
}

console.log('📁 Scanning files in src/ directory...\n');
const files = getAllFiles(srcDir);
console.log(`Found ${files.length} TypeScript files\n`);

let modifiedCount = 0;
files.forEach(file => {
  const relativePath = path.relative(__dirname, file);
  const wasModified = fixImports(file);
  
  if (wasModified) {
    console.log(`✅ Fixed: ${relativePath}`);
    modifiedCount++;
  } else {
    console.log(`⏭️  Skipped: ${relativePath} (no changes needed)`);
  }
});

console.log(`\n✅ Import fixing complete!`);
console.log(`📊 Modified ${modifiedCount} out of ${files.length} files\n`);

console.log('🎯 Next steps:');
console.log('1. Verify the changes in src/ directory');
console.log('2. Run: git init');
console.log('3. Run: git add .');
console.log('4. Run: git commit -m "Initial commit"');
console.log('5. Run: git remote add origin https://github.com/mkshaw777/mkexpensecollection.git');
console.log('6. Run: git push -u origin main --force');
```

Run with:
```bash
cd GITHUB_PACKAGE
node fix-imports.js
```

---

## 🎯 COMPLETE AUTOMATION WORKFLOW

### **Full Process:**

```bash
# 1. Run file copy script
./setup.sh              # Mac/Linux
# OR
powershell -ExecutionPolicy Bypass -File setup.ps1    # Windows

# 2. Fix imports
cd GITHUB_PACKAGE
node fix-imports.js

# 3. Verify
ls -la src/             # Check files copied

# 4. Push to GitHub
git init
git add .
git commit -m "Initial commit - MK Marketing Expense Management"
git remote add origin https://github.com/mkshaw777/mkexpensecollection.git
git branch -M main
git push -u origin main --force

# 5. Done! 🎉
```

---

## ⚠️ IMPORTANT NOTES

### **Before Running Scripts:**

```
1. ✅ Backup your current code
2. ✅ Make sure GITHUB_PACKAGE folder exists
3. ✅ Config files should be in GITHUB_PACKAGE/
4. ✅ Node.js should be installed (for fix-imports.js)
```

### **After Running Scripts:**

```
1. ✅ Verify all files copied to GITHUB_PACKAGE/src/
2. ✅ Check imports are fixed (use @/ not ./)
3. ✅ No figma/ folder in components/
4. ✅ Test build: npm install && npm run dev
```

---

## 💡 RECOMMENDATION

**For beginners**: Follow manual process in `PUSH_TO_GITHUB_INSTRUCTIONS.md`

**For advanced users**: Use these scripts to save time

**Time saved with scripts**: 10-15 minutes

---

## 🆘 TROUBLESHOOTING

### **Script fails to copy files:**
```
Check: Are you in the correct directory?
Check: Do source files exist?
Solution: Run script from project root
```

### **Import fix doesn't work:**
```
Check: Is Node.js installed?
Check: Are files in src/ directory?
Solution: Run fix-imports.js from GITHUB_PACKAGE folder
```

### **Git push fails:**
```
Check: Is Git installed?
Check: GitHub repo exists?
Solution: Use --force flag for first push
```

---

## ✅ VERIFICATION

After running scripts, check:

```bash
cd GITHUB_PACKAGE

# Check structure
ls -la src/

# Check imports in a file
cat src/App.tsx | grep "from"
# Should see: from '@/components/...
# Should NOT see: from './components/...

# Test build
npm install
npm run dev
# Should start without errors
```

---

**Scripts Created**: October 24, 2025  
**Platform**: Cross-platform (Windows/Mac/Linux)  
**Time Saved**: 10-15 minutes  
**Difficulty**: Medium (requires basic terminal knowledge)  

---

## 🚀 CHOOSE YOUR METHOD

**Beginner**: Manual process (safer, educational)  
**Advanced**: Automated scripts (faster, efficient)  
**Hybrid**: Copy manually, fix imports with script  

**Both work perfectly! Choose what you're comfortable with! 💪**
