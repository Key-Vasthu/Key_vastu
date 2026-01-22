# Cloudflare R2 Storage Setup Guide

This guide will help you set up Cloudflare R2 bucket storage for your KeyVasthu application.

## Step 1: Create a Cloudflare R2 Bucket

1. Log in to your Cloudflare dashboard: https://dash.cloudflare.com
2. Navigate to **R2** in the left sidebar
3. Click **Create bucket**
4. Enter a bucket name (e.g., `keyvasthu-files`)
5. Choose a location (select the region closest to your users)
6. Click **Create bucket**

## Step 2: Get Your R2 Credentials

1. In the R2 dashboard, click on **Manage R2 API Tokens**
2. Click **Create API Token**
3. Give it a name (e.g., `keyvasthu-upload-token`)
4. Set permissions:
   - **Object Read & Write** (or **Admin Read & Write** for full access)
5. Click **Create API Token**
6. **Important**: Copy the following values immediately (you won't be able to see them again):
   - **Access Key ID**
   - **Secret Access Key**

## Step 3: Get Your R2 Endpoint URL

1. In your R2 bucket dashboard, click on **Settings**
2. Find the **S3 API** section
3. Copy your **Account ID** (you'll need this for the endpoint)
4. Your endpoint URL will be: `https://<account-id>.r2.cloudflarestorage.com`

Alternatively, you can use the format: `https://<account-id>.r2.cloudflarestorage.com`

## Step 4: Set Up Public Access (Optional)

If you want public access to your files:

1. Go to your R2 bucket settings
2. Navigate to **Public Access** or **Custom Domain**
3. If using a custom domain:
   - Add your domain (e.g., `files.yourdomain.com`)
   - Follow Cloudflare's instructions to verify the domain
4. If using R2.dev subdomain:
   - Enable public access
   - Note the public URL format: `https://pub-<random-id>.r2.dev`

## Step 5: Configure Environment Variables

Add the following to your `.env` file:

```env
# Cloudflare R2 Configuration
R2_ENDPOINT=https://<your-account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=keyvasthu-files
R2_PUBLIC_URL=https://pub-<random-id>.r2.dev
# OR if using custom domain:
# R2_PUBLIC_URL=https://files.yourdomain.com
```

### Example `.env` configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
DATABASE_URL=postgresql://username:password@hostname.neon.tech/database?sslmode=require

# Cloudflare R2 Configuration
R2_ENDPOINT=https://abc123def456.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=abc123def456789
R2_SECRET_ACCESS_KEY=xyz789secretkey123456
R2_BUCKET_NAME=keyvasthu-files
R2_PUBLIC_URL=https://pub-1234567890abcdef.r2.dev
```

## Step 6: Test the Configuration

1. Start your server:
   ```bash
   npm run server
   ```

2. You should see in the console:
   ```
   ☁️  R2 Storage: Configured
   ```

3. Test file upload by making a POST request to `/api/files/upload` with a file

## API Endpoints

### Upload Single File
```
POST /api/files/upload
Content-Type: multipart/form-data

Body:
- file: (file)
- folder: (optional, default: 'uploads')
- category: (optional)
- tags: (optional, comma-separated)
```

### Upload Multiple Files
```
POST /api/files/upload-multiple
Content-Type: multipart/form-data

Body:
- files: (multiple files)
- folder: (optional, default: 'uploads')
- category: (optional)
- tags: (optional, comma-separated)
```

### Delete File
```
DELETE /api/files/:key
```

## Security Notes

- **Never commit your `.env` file** to version control
- Keep your R2 credentials secure
- Use environment-specific buckets (dev, staging, production)
- Consider using IAM tokens with limited permissions
- Enable CORS if accessing files from a web browser
- Set up bucket policies for access control if needed

## Troubleshooting

### "R2 storage is not configured" error
- Check that all R2 environment variables are set in `.env`
- Verify the variable names match exactly (case-sensitive)
- Restart your server after updating `.env`

### Upload fails with "Access Denied"
- Verify your Access Key ID and Secret Access Key are correct
- Check that your API token has the correct permissions
- Ensure the bucket name matches exactly

### Files not accessible publicly
- Verify `R2_PUBLIC_URL` is set correctly
- Check that public access is enabled in R2 bucket settings
- If using custom domain, ensure DNS is configured correctly

### CORS errors in browser
- Configure CORS in your R2 bucket settings
- Add your frontend domain to allowed origins
- Allow necessary HTTP methods (GET, PUT, POST, DELETE)

## Next Steps

- Update your frontend to use the new upload endpoints
- Implement file deletion in your UI
- Add file management features (list, search, organize)
- Set up image optimization/thumbnails
- Implement file sharing with signed URLs
