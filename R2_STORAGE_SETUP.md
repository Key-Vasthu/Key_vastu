# Complete Guide: Setting Up Cloudflare R2 Storage for Chat Files

This guide will walk you through setting up Cloudflare R2 storage to store chat attachments (Vastu plans, images, documents) for your KeyVasthu application.

## What is Cloudflare R2?

Cloudflare R2 is an object storage service (similar to AWS S3) that:
- ✅ Stores files securely in the cloud
- ✅ Provides fast global access
- ✅ Has no egress fees (free data transfer out)
- ✅ Compatible with S3 API
- ✅ Perfect for storing chat attachments, images, and documents

---

## Step 1: Create a Cloudflare Account

1. Go to [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Sign up with your email address
3. Verify your email
4. Complete the account setup

**Note**: Cloudflare R2 is free to start with generous limits. You only pay for storage used.

---

## Step 2: Enable R2 Storage

1. Log in to your Cloudflare dashboard
2. In the left sidebar, click **"R2"** (under "Workers & Pages")
3. If you see a prompt to enable R2, click **"Enable R2"**
4. You may need to add a payment method (but won't be charged unless you exceed free tier)

---

## Step 3: Create an R2 Bucket

1. In the R2 dashboard, click **"Create bucket"**
2. Enter a bucket name (e.g., `keyvasthu-chat-files` or `keyvasthu-uploads`)
   - **Important**: Bucket names must be globally unique across all Cloudflare accounts
   - Use lowercase letters, numbers, and hyphens only
   - Example: `keyvasthu-chat-files-2024`
3. Choose a location (select the closest region to your users)
   - Recommended: `APAC` (Asia Pacific) for Indian users
4. Click **"Create bucket"**

✅ **Your bucket is now created!**

---

## Step 4: Create API Token (Access Credentials)

You need API credentials to upload files from your backend server.

### Option A: Create API Token (Recommended)

1. In the R2 dashboard, click on your bucket name
2. Go to **"Settings"** tab
3. Scroll down to **"API Tokens"** section
4. Click **"Create API token"**
5. Configure the token:
   - **Token name**: `keyvasthu-backend` (or any name you prefer)
   - **Permissions**: Select **"Object Read & Write"**
   - **TTL**: Leave empty (no expiration) or set a date
6. Click **"Create API Token"**
7. **IMPORTANT**: Copy the credentials immediately - you won't be able to see them again!
   - **Access Key ID**: Copy this
   - **Secret Access Key**: Copy this (keep it secret!)

### Option B: Use R2 API Token (Alternative)

1. Go to Cloudflare dashboard → **"My Profile"** → **"API Tokens"**
2. Click **"Create Token"**
3. Use **"Edit Cloudflare Workers"** template
4. Add R2 permissions:
   - **Account** → **Cloudflare R2** → **Edit**
5. Click **"Continue to summary"** → **"Create Token"**
6. Copy the token (you won't see it again!)

---

## Step 5: Get Your R2 Endpoint URL

1. In the R2 dashboard, click on your bucket
2. Go to **"Settings"** tab
3. Find **"S3 API"** section
4. Copy the **"S3 API URL"** (it looks like: `https://<account-id>.r2.cloudflarestorage.com`)
   - This is your `R2_ENDPOINT`

---

## Step 6: Set Up Public URL (Optional but Recommended)

For public file access, you need to set up a custom domain or use Cloudflare's public URL.

### Option A: Use Cloudflare Public URL (Easiest)

1. In your bucket settings, go to **"Public Access"** or **"Settings"**
2. Enable **"Public Access"** or **"Public Bucket"**
3. Copy the public URL (format: `https://pub-<random-id>.r2.dev`)
   - This is your `R2_PUBLIC_URL`

### Option B: Use Custom Domain (Advanced)

1. In bucket settings, go to **"Custom Domains"**
2. Add your custom domain (e.g., `files.keyvasthu.com`)
3. Follow Cloudflare's DNS setup instructions
4. Use this domain as your `R2_PUBLIC_URL`

---

## Step 7: Configure Environment Variables

Now you need to add these credentials to your backend server.

### For Local Development (.env file)

1. Create or edit `.env` file in your project root (same folder as `server/`)
2. Add the following variables:

```env
# Cloudflare R2 Storage Configuration
R2_ENDPOINT=https://<your-account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=keyvasthu-chat-files
R2_PUBLIC_URL=https://pub-<random-id>.r2.dev
```

**Replace with your actual values:**
- `R2_ENDPOINT`: Your S3 API URL from Step 5
- `R2_ACCESS_KEY_ID`: Your Access Key ID from Step 4
- `R2_SECRET_ACCESS_KEY`: Your Secret Access Key from Step 4
- `R2_BUCKET_NAME`: Your bucket name from Step 3
- `R2_PUBLIC_URL`: Your public URL from Step 6

### Example .env file:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173

# Cloudflare R2 Storage
R2_ENDPOINT=https://abc123def456.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=abc123def456789
R2_SECRET_ACCESS_KEY=xyz789secretkey123456
R2_BUCKET_NAME=keyvasthu-chat-files
R2_PUBLIC_URL=https://pub-1234567890abcdef.r2.dev
```

### For Production (Vercel/Render/Railway)

1. Go to your hosting platform's dashboard
2. Navigate to your backend service
3. Go to **"Environment Variables"** or **"Config"**
4. Add all 5 R2 variables:
   - `R2_ENDPOINT`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_PUBLIC_URL`
5. Save and redeploy your service

---

## Step 8: Install Required Dependencies

Make sure your backend has the AWS SDK installed (R2 uses S3-compatible API):

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

If already installed, you're good to go! ✅

---

## Step 9: Verify Configuration

1. Start your backend server:
   ```bash
   npm run server
   ```

2. Check the console output - you should see:
   ```
   🚀 Server running on http://localhost:3001
   📊 Database: Connected
   ☁️  R2 Storage: Configured  ← Should show "Configured"
   ```

3. If it shows "Not configured", check:
   - All environment variables are set correctly
   - `.env` file is in the correct location
   - No typos in variable names

---

## Step 10: Test File Upload

1. Start your frontend:
   ```bash
   npm run dev
   ```

2. Log in to your application
3. Go to Chat page
4. Click the attachment button (📎)
5. Select a test file (image or PDF)
6. Upload should work and file should appear in chat

7. Check your R2 bucket:
   - Go to Cloudflare dashboard → R2 → Your bucket
   - You should see files in `chat-uploads/` folder

---

## Troubleshooting

### Error: "R2 storage is not configured"

**Solution**: Check that all 5 environment variables are set:
- `R2_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

### Error: "Access Denied" or "403 Forbidden"

**Solution**: 
- Verify your Access Key ID and Secret Access Key are correct
- Check that your API token has "Object Read & Write" permissions
- Ensure bucket name matches exactly (case-sensitive)

### Error: "Bucket not found"

**Solution**:
- Verify bucket name is correct
- Check that bucket exists in your Cloudflare account
- Ensure you're using the correct account ID

### Files upload but don't display

**Solution**:
- Check `R2_PUBLIC_URL` is correct
- Verify public access is enabled on your bucket
- Check browser console for CORS errors
- Ensure file URLs are accessible (try opening in new tab)

### CORS Errors

**Solution**:
1. In Cloudflare R2 dashboard, go to your bucket
2. Go to **"Settings"** → **"CORS Policy"**
3. Add CORS configuration:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
4. Click **"Save"**

---

## Security Best Practices

1. **Never commit `.env` file to Git**
   - Already in `.gitignore` ✅
   - Use environment variables in production

2. **Rotate API tokens regularly**
   - Create new tokens every 3-6 months
   - Delete old unused tokens

3. **Use least privilege**
   - Only grant "Object Read & Write" permissions
   - Don't use admin-level tokens

4. **Monitor usage**
   - Check R2 dashboard for storage usage
   - Set up billing alerts if needed

---

## File Structure in R2

Your files will be organized like this:

```
keyvasthu-chat-files/
├── chat-uploads/
│   ├── 1703123456789-vastu_plan_1.pdf
│   ├── 1703123456790-floor_plan.jpg
│   └── 1703123456791-drawing.dwg
└── uploads/
    └── (other uploads)
```

---

## Cost Information

**Cloudflare R2 Pricing (as of 2024):**
- **Storage**: $0.015 per GB/month (first 10 GB free)
- **Class A Operations** (writes): $4.50 per million
- **Class B Operations** (reads): $0.36 per million
- **Egress**: FREE (unlimited free data transfer)

**Free Tier Includes:**
- 10 GB storage
- 1 million Class A operations/month
- 10 million Class B operations/month
- Unlimited egress

For a chat application, you'll likely stay within the free tier unless you have very high traffic.

---

## Quick Reference

### Required Environment Variables:
```env
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://pub-<id>.r2.dev
```

### Where to Find Each Value:
- **R2_ENDPOINT**: R2 Dashboard → Bucket → Settings → S3 API URL
- **R2_ACCESS_KEY_ID**: R2 Dashboard → Bucket → Settings → API Tokens
- **R2_SECRET_ACCESS_KEY**: R2 Dashboard → Bucket → Settings → API Tokens
- **R2_BUCKET_NAME**: Your bucket name (from Step 3)
- **R2_PUBLIC_URL**: R2 Dashboard → Bucket → Settings → Public URL

---

## Support

If you encounter issues:
1. Check Cloudflare R2 documentation: [https://developers.cloudflare.com/r2/](https://developers.cloudflare.com/r2/)
2. Verify all environment variables are set correctly
3. Check server logs for detailed error messages
4. Ensure your bucket has proper permissions

---

**✅ You're all set!** Your chat file uploads will now be stored in Cloudflare R2.
