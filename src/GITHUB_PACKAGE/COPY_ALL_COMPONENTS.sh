#!/bin/bash

# Script to copy all components from /components to /GITHUB_PACKAGE/src/components
# Run this in terminal: bash /GITHUB_PACKAGE/COPY_ALL_COMPONENTS.sh

echo "🚀 Starting component copy process..."

# Create components directory if it doesn't exist
mkdir -p /GITHUB_PACKAGE/src/components/ui
mkdir -p /GITHUB_PACKAGE/src/components/figma

# Copy all custom components (root level)
echo "📦 Copying custom components..."
cp /components/*.tsx /GITHUB_PACKAGE/src/components/ 2>/dev/null

# Copy all UI components
echo "🎨 Copying UI components..."
cp /components/ui/*.tsx /GITHUB_PACKAGE/src/components/ui/ 2>/dev/null
cp /components/ui/*.ts /GITHUB_PACKAGE/src/components/ui/ 2>/dev/null

# Copy figma components
echo "🖼️ Copying Figma components..."
cp /components/figma/*.tsx /GITHUB_PACKAGE/src/components/figma/ 2>/dev/null

echo "✅ All components copied successfully!"
echo ""
echo "📝 Summary:"
echo "   - Custom components: $(ls /GITHUB_PACKAGE/src/components/*.tsx 2>/dev/null | wc -l)"
echo "   - UI components: $(ls /GITHUB_PACKAGE/src/components/ui/* 2>/dev/null | wc -l)"
echo "   - Figma components: $(ls /GITHUB_PACKAGE/src/components/figma/* 2>/dev/null | wc -l)"
echo ""
echo "🎯 Next step: Push to GitHub!"
