# Fix: Text Changes Not Reflecting

If you've changed text in `Home.tsx` but don't see it in the browser, try these steps:

## Quick Fixes

### 1. Hard Refresh Browser (Most Common Fix)
- **Windows/Linux**: Press `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: Press `Cmd + Shift + R`
- This clears the browser cache and reloads fresh content

### 2. Restart Dev Server
If you're running the dev server locally:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Clear Browser Cache Completely
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### 4. Check if Changes Were Saved
Make sure the file was saved:
- Check `src/pages/Home.tsx` - verify your changes are there
- Look for unsaved file indicators in your editor

### 5. For Production/Deployed Site
If you're viewing the deployed site (Render/Vercel):
- Wait a few minutes for auto-deployment to complete
- Check Render/Vercel dashboard for deployment status
- Clear browser cache and try again

## Current Text in Code

The following text has been updated in the code:

**Books Section (Line 350):**
- ✅ "Explore our published works on Vasthu Shastra"

**Vasthu Section (Line 517):**
- ✅ "The Science of Vasthu"

## Verify Changes

To verify your changes are in the code:

1. Open `src/pages/Home.tsx`
2. Check line 350 for Books section subtitle
3. Check line 517 for Vasthu section heading

If the text matches what you want, then it's a caching issue - use the hard refresh method above.
