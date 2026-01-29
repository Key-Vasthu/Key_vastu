# Render Deployment Fix - R2 Images

## Problem
Only `vasthu-plan.png` is showing on the deployed website, but `elephant.png` and `logoo.png` are not loading.

## Solution

### Step 1: Check Image Location in R2 Bucket

Your images might be in one of two locations:

**Option A: Images in `images/` folder** (Recommended)
- Path: `images/elephant.png`, `images/logoo.png`, `images/vasthu-plan.png`
- Current code expects this structure ✅

**Option B: Images in root of bucket**
- Path: `elephant.png`, `logoo.png`, `vasthu-plan.png`
- If this is your case, you need to either:
  1. Move images to `images/` folder in R2, OR
  2. Update the code to use root-level paths

### Step 2: Set Environment Variable in Render

1. Go to your **Render Dashboard**
2. Select your **Static Site** service
3. Navigate to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `VITE_R2_PUBLIC_URL`
   - **Value**: Your R2 public URL (e.g., `https://pub-xxxxx.r2.dev`)
   - **Environment**: All (Production, Preview, Development)
6. Click **Save Changes**
7. **Redeploy** your site (Render will auto-deploy if connected to GitHub)

### Step 3: Verify Image URLs

Test these URLs in your browser (replace with your actual R2 URL):

- `https://your-r2-url.r2.dev/images/elephant.png`
- `https://your-r2-url.r2.dev/images/logoo.png`
- `https://your-r2-url.r2.dev/images/vasthu-plan.png`

If images are in root:
- `https://your-r2-url.r2.dev/elephant.png`
- `https://your-r2-url.r2.dev/logoo.png`
- `https://your-r2-url.r2.dev/vasthu-plan.png`

### Step 4: If Images Are in Root (Not in `images/` folder)

If your images are uploaded to the root of the R2 bucket, you have two options:

#### Option 1: Move Images to `images/` Folder (Recommended)
1. Go to Cloudflare R2 Dashboard
2. Select your bucket
3. Create an `images` folder
4. Move `elephant.png`, `logoo.png`, and `vasthu-plan.png` into the `images/` folder

#### Option 2: Update Code to Use Root-Level Paths

If you prefer to keep images in root, update the code:

```typescript
// In src/pages/Home.tsx, change:
src={getR2AssetUrl('elephant.png')}
// To:
src={getR2AssetUrl('elephant.png', '')}  // Empty string = root level

// Same for other images
```

### Step 5: Commit and Push to GitHub

After making any code changes:

```bash
git add .
git commit -m "Fix: Update all image references to use R2 URLs"
git push origin main
```

Render will automatically redeploy if auto-deploy is enabled.

## Current Code Status

✅ All image references have been updated to use `getR2AssetUrl()`:
- `src/pages/Home.tsx` - elephant.png, vasthu-plan.png
- `src/pages/DrawingBoard.tsx` - vasthu-plan.png
- `src/components/common/Header.tsx` - logoo.png
- `src/components/common/Footer.tsx` - logoo.png

## Troubleshooting

### Images still not loading after deployment?

1. **Check Render Environment Variables**
   - Verify `VITE_R2_PUBLIC_URL` is set correctly
   - Make sure there are no extra spaces or quotes
   - Value should be: `https://pub-xxxxx.r2.dev` (no trailing slash)

2. **Check R2 Bucket Settings**
   - Ensure public access is enabled
   - Check CORS settings if needed
   - Verify images are uploaded and accessible

3. **Check Browser Console**
   - Open browser DevTools (F12)
   - Check Console for 404 errors
   - Check Network tab to see failed image requests

4. **Verify Image Paths**
   - Check if images are in `images/` folder or root
   - Update code accordingly

5. **Clear Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache

## Quick Fix Checklist

- [ ] Set `VITE_R2_PUBLIC_URL` in Render environment variables
- [ ] Verify images are in R2 bucket (check location: root or `images/` folder)
- [ ] Test image URLs directly in browser
- [ ] Commit and push code changes to GitHub
- [ ] Wait for Render to redeploy
- [ ] Clear browser cache and test
