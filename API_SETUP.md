# API Configuration Guide

## Problem: "Cannot connect to server" Error

If you're getting "Cannot connect to server" error during registration/login, it means the frontend cannot reach the backend API.

## Solution: Configure VITE_API_URL

### For Local Development

1. Create a `.env` file in the root directory (if it doesn't exist)
2. Add the following line:
```env
VITE_API_URL=http://localhost:3001/api
```

3. Make sure your backend server is running:
```bash
npm run server
```

### For Production (Render/Vercel)

You need to set the `VITE_API_URL` environment variable to point to your backend server.

#### If Backend is on Render:

1. Go to your Render dashboard
2. Find your **Web Service** (backend server)
3. Copy the service URL (e.g., `https://keyvasthu-backend.onrender.com`)
4. Go to your **Static Site** (frontend) service
5. Navigate to **Environment** tab
6. Add environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://keyvasthu-backend.onrender.com/api`
7. Save and redeploy

#### If Backend is on Same Domain:

If your backend is served from the same domain (e.g., using a reverse proxy), you can use a relative URL:
- **Value**: `/api`

### Verify Configuration

After setting up, check the browser console:
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try to register/login
4. Check if the request goes to the correct URL

### Troubleshooting

1. **Backend not running**: Make sure your backend server is running and accessible
2. **CORS errors**: Check that your backend has CORS enabled for your frontend domain
3. **Wrong URL**: Verify the `VITE_API_URL` is correct and includes `/api` at the end
4. **Environment variable not loaded**: Restart your dev server after adding `.env` file

### Example Backend Server Setup

Your backend should be running on a service like:
- Render Web Service
- Railway
- Heroku
- Or any Node.js hosting service

Make sure:
- Server is running on port 3001 (or configured port)
- CORS is enabled for your frontend domain
- Database connection is configured
- Environment variables are set (DATABASE_URL, etc.)
