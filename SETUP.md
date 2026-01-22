# Quick Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Neon Database

1. Go to https://console.neon.tech/app/org-round-lake-68327283/projects
2. Create a new project or select an existing one
3. Copy your connection string from the project dashboard

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://username:password@hostname.neon.tech/database?sslmode=require
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. Start the Backend Server

Open a terminal and run:
```bash
npm run server
```

You should see:
```
🚀 Server running on http://localhost:3001
📊 Database: Connected
✅ Connected to Neon database
📦 Initializing database schema...
✅ Database schema initialized successfully
```

### 5. Start the Frontend

Open another terminal and run:
```bash
npm run dev
```

### 6. Test the Chat

1. Open http://localhost:5173 in your browser
2. Log in or continue as guest
3. Navigate to the Chat page
4. Start a conversation - messages will be saved to Neon!

## 📝 What's Been Set Up

✅ Backend Express server with Neon PostgreSQL connection
✅ Database schema for users, chat threads, messages, and attachments
✅ REST API endpoints for chat operations
✅ Frontend integration with backend API
✅ Automatic database initialization

## 🔧 Troubleshooting

**Backend won't start:**
- Check that `.env` file exists and has `DATABASE_URL`
- Verify your Neon connection string is correct
- Make sure port 3001 is not already in use

**Database connection fails:**
- Verify your Neon project is active
- Check that your connection string includes `?sslmode=require`
- Try regenerating your connection string in Neon dashboard

**Frontend can't connect to backend:**
- Make sure backend is running on port 3001
- Check browser console for CORS errors
- Verify `FRONTEND_URL` in `.env` matches your frontend URL

## 📚 More Information

See `README_DATABASE.md` for detailed documentation.


















