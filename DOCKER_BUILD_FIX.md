# Docker Build Fix Guide

## Current Issue
The Docker build is failing during `npm run build` with exit code 1, but we're not seeing the actual error message.

## Steps to Debug

### Step 1: Build with Debug Dockerfile

Run this command to see detailed output:

```powershell
docker build --progress=plain --no-cache -f Dockerfile.debug -t chatgpt-clone-debug . 2>&1 | Tee-Object -FilePath docker_build_full.log
```

This will:
- Show all build output
- Save everything to `docker_build_full.log`
- Run TypeScript checks if build fails
- Show file listings to verify structure

### Step 2: Check the Log File

After the build fails, check the last 100 lines:

```powershell
Get-Content docker_build_full.log -Tail 100
```

Look for:
- TypeScript errors
- Missing module errors
- Import errors
- File not found errors

### Step 3: Common Fixes

#### Fix 1: Missing Type Definitions

If you see TypeScript errors about missing types:

```powershell
# Add missing type packages locally first
npm install --save-dev @types/react-markdown
```

Then rebuild Docker.

#### Fix 2: TypeScript Strict Mode Issues

If TypeScript is too strict, temporarily relax it in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": false,  // Change from true to false temporarily
    ...
  }
}
```

#### Fix 3: Missing Dependencies

Ensure all dependencies are in `package.json`:

```powershell
# Check if react-markdown is installed
npm list react-markdown

# If not, install it
npm install react-markdown remark-gfm
```

### Step 4: Alternative - Build Without Standalone

Try building without standalone output first:

1. Temporarily change `next.config.js`:
```js
module.exports = {
  reactStrictMode: true,
  // output: 'standalone',  // Comment this out
}
```

2. Use Dockerfile.simple (which doesn't require standalone)

3. Build:
```powershell
docker build -f Dockerfile.simple -t chatgpt-clone .
```

### Step 5: Check for File Issues

Verify all required files exist:

```powershell
# Check if all app files exist
Test-Path app\page.tsx
Test-Path app\layout.tsx
Test-Path app\api\chat\route.ts
Test-Path app\components\ChatInterface.tsx
Test-Path app\components\Sidebar.tsx
```

## Quick Test Command

Run this to get the full error:

```powershell
docker build --progress=plain -f Dockerfile.debug -t chatgpt-clone . 2>&1 | Select-String -Pattern "error|Error|ERROR|failed|Failed|FAILED" -Context 5
```

This will show all error-related lines with context.
