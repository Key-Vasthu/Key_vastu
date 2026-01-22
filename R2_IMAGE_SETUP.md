# R2 Image Storage Setup

This guide explains how to configure your application to use Cloudflare R2 for serving static images.

## Environment Variable Setup

To use R2 storage for images, you need to set the `VITE_R2_PUBLIC_URL` environment variable in your frontend.

### For Local Development

Create or update your `.env` file in the root directory:

```env
VITE_R2_PUBLIC_URL=https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev
```

**Important:** 
- The variable name must start with `VITE_` for Vite to expose it to the frontend
- Replace the URL with your actual R2 public URL from Cloudflare

### For Production (Render/Vercel)

Add the environment variable in your deployment platform:

**Render:**
1. Go to your service dashboard
2. Navigate to "Environment" tab
3. Add new environment variable:
   - Key: `VITE_R2_PUBLIC_URL`
   - Value: `https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev`

**Vercel:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - Key: `VITE_R2_PUBLIC_URL`
   - Value: `https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev`

## Uploading Images to R2

### Using Cloudflare Dashboard

1. Log in to Cloudflare dashboard
2. Go to R2 → Your Bucket
3. Create an `images` folder (or use existing)
4. Upload your images:
   - `logoo.png`
   - `vasthu-plan.png`
   - `elephant.png`
   - `banner.jpg` (or any other images)

### Using the API

You can also upload images programmatically using the file upload API:

```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('folder', 'images'); // Store in images folder

const response = await fetch('/api/files/upload', {
  method: 'POST',
  body: formData
});
```

## Image URLs

Once configured, images will automatically use R2 URLs:

- **Logo**: `https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev/images/logoo.png`
- **Vasthu Plan**: `https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev/images/vasthu-plan.png`
- **Elephant**: `https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev/images/elephant.png`

## Using R2 URLs in Code

The application uses helper functions to generate R2 URLs:

```typescript
import { getR2AssetUrl, getR2Url } from '../utils/r2';

// For images in the 'images' folder (default)
const logoUrl = getR2AssetUrl('logoo.png');
// Returns: https://pub-xxx.r2.dev/images/logoo.png

// For images in a specific folder
const bannerUrl = getR2AssetUrl('banner.jpg', 'images');
// Returns: https://pub-xxx.r2.dev/images/banner.jpg

// For any file path
const customUrl = getR2Url('uploads/document.pdf');
// Returns: https://pub-xxx.r2.dev/uploads/document.pdf
```

## Fallback Behavior

If `VITE_R2_PUBLIC_URL` is not set, the functions will fall back to local paths:

- `getR2AssetUrl('logoo.png')` → `/logoo.png`
- `getR2Url('images/banner.jpg')` → `/images/banner.jpg`

This allows the app to work in development even without R2 configured.

## Current Images Using R2

The following images are configured to use R2:

- **Header Logo**: `logoo.png`
- **Footer Logo**: `logoo.png`
- **Home Page**: 
  - `vasthu-plan.png` (Vasthu compass image)
  - `elephant.png` (Elephant border decorations)
- **Drawing Board**: `vasthu-plan.png` (Background compass)

## Troubleshooting

### Images not loading

1. **Check environment variable**: Ensure `VITE_R2_PUBLIC_URL` is set correctly
2. **Verify R2 URL**: Make sure your R2 public URL is correct
3. **Check file paths**: Ensure images exist in R2 bucket at the correct paths
4. **CORS**: If images don't load, check CORS settings in R2 bucket configuration
5. **Public access**: Ensure your R2 bucket has public access enabled

### Development vs Production

- **Development**: Set `VITE_R2_PUBLIC_URL` in `.env` file
- **Production**: Set `VITE_R2_PUBLIC_URL` in your deployment platform's environment variables
- **Restart required**: After changing environment variables, restart your dev server or redeploy

## Example: Adding a New Image

1. Upload the image to R2 bucket in the `images` folder
2. Use the helper function in your component:

```tsx
import { getR2AssetUrl } from '../utils/r2';

function MyComponent() {
  return (
    <img 
      src={getR2AssetUrl('my-new-image.jpg')} 
      alt="My Image" 
    />
  );
}
```

That's it! The image will automatically use the R2 URL if configured, or fall back to a local path.
