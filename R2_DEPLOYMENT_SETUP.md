# R2 Deployment Setup Guide

This guide will help you set up R2 storage for images in both local development and production (Render/Vercel).

## Step 1: Local Development Setup

### Option A: Using PowerShell Script (Windows)

Run the provided script:

```powershell
.\setup-r2-env.ps1
```

This will automatically add `VITE_R2_PUBLIC_URL` to your `.env` file.

### Option B: Manual Setup

Create or edit your `.env` file in the root directory and add:

```env
# R2 Public URL for Images
VITE_R2_PUBLIC_URL=https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev
```

**Important:** 
- The variable name must start with `VITE_` for Vite to expose it to the frontend
- Restart your dev server after adding the variable

## Step 2: Upload Images to R2

### Option A: Using the Upload Script

1. Make sure your `.env` file has R2 credentials:
```env
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev
```

2. Run the upload script:
```bash
node upload-images-to-r2.js
```

This will upload:
- `logoo.png`
- `vasthu-plan.png`
- `elephant.png`

To the `images/` folder in your R2 bucket.

### Option B: Manual Upload via Cloudflare Dashboard

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **R2** → Your Bucket
3. Click **Upload** or create an `images` folder first
4. Upload these files from your `public/` folder:
   - `logoo.png`
   - `vasthu-plan.png`
   - `elephant.png`
   - `banner.jpg` (if you have one)

5. Make sure files are in the `images/` folder path in R2

## Step 3: Production Setup (Render)

### For Render Deployment:

1. Go to your Render dashboard
2. Select your **Static Site** service
3. Navigate to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `VITE_R2_PUBLIC_URL`
   - **Value**: `https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev`
6. Click **Save Changes**
7. **Redeploy** your service (Render will automatically redeploy when you save environment variables)

### Verify on Render:

After deployment, check that images load correctly:
- Header logo should load from R2
- Footer logo should load from R2
- Home page images should load from R2

## Step 4: Production Setup (Vercel)

### For Vercel Deployment:

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `VITE_R2_PUBLIC_URL`
   - **Value**: `https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev`
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your project (or wait for automatic redeploy)

### Verify on Vercel:

After deployment, check that images load correctly from R2 URLs.

## Step 5: Verify Image URLs

After setup, your images should be accessible at:

- Logo: `https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev/images/logoo.png`
- Vasthu Plan: `https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev/images/vasthu-plan.png`
- Elephant: `https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev/images/elephant.png`

You can test these URLs directly in your browser to verify they're accessible.

## Troubleshooting

### Images not loading in development

1. **Check .env file**: Make sure `VITE_R2_PUBLIC_URL` is set correctly
2. **Restart dev server**: Stop and restart `npm run dev`
3. **Check browser console**: Look for 404 errors or CORS issues
4. **Verify R2 URLs**: Test the R2 URLs directly in browser

### Images not loading in production

1. **Check environment variables**: Verify `VITE_R2_PUBLIC_URL` is set in Render/Vercel
2. **Redeploy**: Make sure you redeployed after adding the variable
3. **Check R2 bucket**: Verify images are uploaded to the correct folder
4. **Check CORS**: Ensure R2 bucket has CORS enabled for your domain

### CORS Errors

If you see CORS errors, configure CORS in your R2 bucket:

1. Go to R2 bucket settings
2. Navigate to **CORS** section
3. Add CORS rule:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

### Environment Variable Not Working

- **Vite requirement**: Variable must start with `VITE_`
- **Restart required**: Always restart dev server after changing `.env`
- **Build time**: Environment variables are embedded at build time, not runtime

## Quick Checklist

- [ ] Added `VITE_R2_PUBLIC_URL` to local `.env` file
- [ ] Restarted dev server
- [ ] Uploaded images to R2 bucket in `images/` folder
- [ ] Added `VITE_R2_PUBLIC_URL` to Render/Vercel environment variables
- [ ] Redeployed production site
- [ ] Verified images load correctly in browser
- [ ] Tested R2 URLs directly

## Next Steps

Once setup is complete:
- All static images will load from R2
- Faster image delivery via Cloudflare CDN
- Reduced server load
- Better scalability

For adding new images, simply upload them to R2 and use `getR2AssetUrl('filename.png')` in your code.
