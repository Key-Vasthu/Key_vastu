# Quick R2 Setup Guide

## ✅ Step 1: Environment Variable (DONE)

The `VITE_R2_PUBLIC_URL` has been added to your `.env` file:
```
VITE_R2_PUBLIC_URL=https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev
```

**Next:** Restart your dev server if it's running.

## 📤 Step 2: Upload Images to R2

You have two options:

### Option A: Using the Upload Script (Recommended)

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
npm run upload-r2-images
```

This will upload:
- `logoo.png` → `images/logoo.png`
- `vasthu-plan.png` → `images/vasthu-plan.png`
- `elephant.png` → `images/elephant.png`

### Option B: Manual Upload via Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Select your bucket
3. Create an `images` folder (if it doesn't exist)
4. Upload these files from your `public/` folder:
   - `logoo.png`
   - `vasthu-plan.png`
   - `elephant.png`

## 🌐 Step 3: Production Setup

### For Render:

1. Go to Render Dashboard → Your Static Site → Environment
2. Add environment variable:
   - **Key**: `VITE_R2_PUBLIC_URL`
   - **Value**: `https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev`
3. Save and redeploy

### For Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name**: `VITE_R2_PUBLIC_URL`
   - **Value**: `https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev`
   - **Environment**: All
3. Save and redeploy

## ✅ Verify

After setup, test these URLs in your browser:
- https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev/images/logoo.png
- https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev/images/vasthu-plan.png
- https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev/images/elephant.png

If they load, you're all set! 🎉

## 📝 Image URLs

Once uploaded, your images will be available at:
- Logo: `https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev/images/logoo.png`
- Vasthu Plan: `https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev/images/vasthu-plan.png`
- Elephant: `https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev/images/elephant.png`

The application will automatically use these URLs when `VITE_R2_PUBLIC_URL` is set.
