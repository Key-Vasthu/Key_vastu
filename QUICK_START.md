# 🚀 Quick Start Guide

## Start Backend Server Automatically

### Windows (PowerShell):
```powershell
.\start-backend.ps1
```

Or use npm:
```bash
npm run start:backend
```

### Linux/Mac (Bash):
```bash
./start-backend.sh
```

Or use npm:
```bash
npm run start:backend
```

## Start Both Frontend and Backend

### Option 1: Use the dev:all command
```bash
npm run dev:all
```

### Option 2: Start separately (recommended)

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## What the Scripts Do

### `start-backend.ps1` / `start-backend.sh`
- ✅ Checks if `.env` file exists, creates it if missing
- ✅ Checks if `node_modules` exists, installs dependencies if needed
- ✅ Checks if port 3001 is already in use
- ✅ Starts the backend server on http://localhost:3001

### `npm run start:backend`
- Simple command to start the server directly

## Troubleshooting

### "Port 3001 is already in use"
- Another instance of the server is already running
- Stop the existing server or use a different port

### "Cannot connect to server"
1. Make sure the backend server is running: `npm run server`
2. Check that port 3001 is accessible
3. Verify `.env` has `VITE_API_URL=http://localhost:3001/api`

### "Server returned HTML instead of JSON"
- The backend server is not running
- Start it with: `npm run server` or `.\start-backend.ps1`

## Environment Setup

The scripts will automatically create a `.env` file if it doesn't exist. Make sure to add:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
VITE_API_URL=http://localhost:3001/api
PORT=3001
```

## Next Steps

1. ✅ Start backend: `npm run server`
2. ✅ Start frontend: `npm run dev`
3. ✅ Open http://localhost:5173
4. ✅ Register a new account
5. ✅ Login with your credentials
