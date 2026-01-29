# Image Loading Fix Instructions

## Problem
Images are not showing on the deployed website.

## Solution

I've updated the code to use **root-level** image paths in R2. This means images should be at:
- `https://your-r2-url.r2.dev/elephant.png`
- `https://your-r2-url.r2.dev/logoo.png`
- `https://your-r2-url.r2.dev/vasthu-plan.png`

## Step 1: Verify Image Location in R2

Check where your images are located in your Cloudflare R2 bucket:

1. Go to Cloudflare Dashboard → R2 → Your Bucket
2. Check if images are:
   - **In root**: `elephant.png`, `logoo.png`, `vasthu-plan.png` ✅ (Current code expects this)
   - **In images folder**: `images/elephant.png`, `images/logoo.png`, etc.

## Step 2: Update Code Based on Image Location

### If Images Are in Root (Current Setup) ✅
The code is already configured for this. Just make sure:
- Images are uploaded to the root of your R2 bucket
- Environment variable is set in Render

### If Images Are in `images/` Folder

Update the code to use `'images'` folder:

**In `src/pages/Home.tsx`:**
```typescript
// Change from:
src={getR2AssetUrl('elephant.png', '')}
// To:
src={getR2AssetUrl('elephant.png', 'images')}
```

**In `src/components/common/Header.tsx` and `Footer.tsx`:**
```typescript
// Change from:
src={getR2AssetUrl('logoo.png', '')}
// To:
src={getR2AssetUrl('logoo.png', 'images')}
```

**In `src/pages/DrawingBoard.tsx`:**
```typescript
// Change from:
src={getR2AssetUrl('vasthu-plan.png', '')}
// To:
src={getR2AssetUrl('vasthu-plan.png', 'images')}
```

## Step 3: Set Environment Variable in Render

**CRITICAL:** Make sure `VITE_R2_PUBLIC_URL` is set in Render:

1. Go to Render Dashboard → Your Static Site → Environment
2. Add environment variable:
   - **Key**: `VITE_R2_PUBLIC_URL`
   - **Value**: `https://pub-xxxxx.r2.dev` (your actual R2 public URL)
   - **Environment**: All
3. Save and redeploy

## Step 4: Test Image URLs

Test these URLs directly in your browser (replace with your R2 URL):

**If images are in root:**
- `https://your-r2-url.r2.dev/elephant.png`
- `https://your-r2-url.r2.dev/logoo.png`
- `https://your-r2-url.r2.dev/vasthu-plan.png`

**If images are in images folder:**
- `https://your-r2-url.r2.dev/images/elephant.png`
- `https://your-r2-url.r2.dev/images/logoo.png`
- `https://your-r2-url.r2.dev/images/vasthu-plan.png`

If these URLs don't work, the images aren't uploaded or the R2 public URL is incorrect.

## Quick Fix Script

If you want to quickly switch between root and images folder, run this in PowerShell:

```powershell
# To use images folder
(Get-Content src/pages/Home.tsx) -replace "getR2AssetUrl\('([^']+)', ''\)", "getR2AssetUrl('`$1', 'images')" | Set-Content src/pages/Home.tsx
(Get-Content src/components/common/Header.tsx) -replace "getR2AssetUrl\('([^']+)', ''\)", "getR2AssetUrl('`$1', 'images')" | Set-Content src/components/common/Header.tsx
(Get-Content src/components/common/Footer.tsx) -replace "getR2AssetUrl\('([^']+)', ''\)", "getR2AssetUrl('`$1', 'images')" | Set-Content src/components/common/Footer.tsx
(Get-Content src/pages/DrawingBoard.tsx) -replace "getR2AssetUrl\('([^']+)', ''\)", "getR2AssetUrl('`$1', 'images')" | Set-Content src/pages/DrawingBoard.tsx

# To use root level (current setup)
(Get-Content src/pages/Home.tsx) -replace "getR2AssetUrl\('([^']+)', 'images'\)", "getR2AssetUrl('`$1', '')" | Set-Content src/pages/Home.tsx
(Get-Content src/components/common/Header.tsx) -replace "getR2AssetUrl\('([^']+)', 'images'\)", "getR2AssetUrl('`$1', '')" | Set-Content src/components/common/Header.tsx
(Get-Content src/components/common/Footer.tsx) -replace "getR2AssetUrl\('([^']+)', 'images'\)", "getR2AssetUrl('`$1', '')" | Set-Content src/components/common/Footer.tsx
(Get-Content src/pages/DrawingBoard.tsx) -replace "getR2AssetUrl\('([^']+)', 'images'\)", "getR2AssetUrl('`$1', '')" | Set-Content src/pages/DrawingBoard.tsx
```

## Troubleshooting

1. **Images still not loading?**
   - Check browser console (F12) for 404 errors
   - Verify R2 public URL is correct
   - Ensure images are uploaded to R2
   - Check CORS settings in R2 bucket

2. **Environment variable not working?**
   - Make sure variable name is exactly `VITE_R2_PUBLIC_URL`
   - Restart/redeploy after adding the variable
   - Check Render logs for errors

3. **Images load locally but not in production?**
   - Environment variable is likely not set in Render
   - Check Render environment variables tab
