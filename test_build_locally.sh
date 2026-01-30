#!/bin/bash
# Test script to check if build works (run this in Git Bash or WSL)

echo "=== Testing local build ==="
echo ""

echo "1. Checking Node version..."
node --version
npm --version

echo ""
echo "2. Installing dependencies..."
npm install

echo ""
echo "3. Running TypeScript check..."
npx tsc --noEmit

echo ""
echo "4. Running build..."
npm run build

echo ""
echo "=== Build test complete ==="
