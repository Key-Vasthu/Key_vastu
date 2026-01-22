# Neon Database Setup Guide

This guide will help you connect your KeyVasthu chat application to Neon PostgreSQL database.

## Prerequisites

1. A Neon account (sign up at https://neon.tech)
2. Node.js 18+ installed
3. npm or yarn package manager

## Step 1: Create a Neon Project

1. Go to https://console.neon.tech/app/org-round-lake-68327283/projects
2. Click "Create Project" or select an existing project
3. Note your project name and region

## Step 2: Get Your Connection String

1. In your Neon project dashboard, go to the "Connection Details" section
2. Copy the connection string (it looks like: `postgresql://username:password@hostname.neon.tech/database?sslmode=require`)
3. You can also find it under "Connection String" in the project settings

## Step 3: Configure Environment Variables

1. Create a `.env` file in the root directory of your project
2. Add your Neon connection string:

```env
DATABASE_URL=postgresql://username:password@hostname.neon.tech/database?sslmode=require
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Important:** Never commit your `.env` file to version control. It's already in `.gitignore`.

## Step 4: Install Dependencies

```bash
npm install
```

This will install:
- `pg` - PostgreSQL client for Node.js
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

## Step 5: Initialize the Database

The database schema will be automatically created when you start the server for the first time. The server will create the following tables:

- `users` - User accounts
- `chat_threads` - Chat conversations between applicants and clients
- `chat_messages` - Individual messages in threads
- `message_attachments` - File attachments for messages

## Step 6: Start the Backend Server

In a terminal, run:

```bash
npm run server
```

Or for development with auto-reload:

```bash
npm run server:dev
```

You should see:
```
🚀 Server running on http://localhost:3001
📊 Database: Connected
✅ Connected to Neon database
📦 Initializing database schema...
✅ Database schema initialized successfully
```

## Step 7: Start the Frontend

In another terminal, run:

```bash
npm run dev
```

The frontend will run on http://localhost:5173

## Step 8: Test the Connection

1. Open your browser to http://localhost:5173
2. Log in or continue as guest
3. Navigate to the Chat page
4. Start a conversation - messages will be saved to Neon database

## API Endpoints

The backend provides the following endpoints:

- `GET /api/chat/threads?userId=<userId>` - Get all chat threads for a user
- `GET /api/chat/threads/:threadId/messages` - Get messages for a thread
- `POST /api/chat/threads/:threadId/messages` - Send a message
- `POST /api/chat/threads` - Create a new chat thread
- `GET /api/health` - Health check endpoint

## Database Schema

### users
- `id` (VARCHAR) - Primary key
- `email` (VARCHAR) - Unique email address
- `name` (VARCHAR) - User's name
- `avatar` (TEXT) - Avatar URL
- `role` (VARCHAR) - User role (user, admin, guest)
- `phone` (VARCHAR) - Phone number
- `created_at` (TIMESTAMP) - Account creation time
- `last_login` (TIMESTAMP) - Last login time

### chat_threads
- `id` (VARCHAR) - Primary key
- `applicant_id` (VARCHAR) - Foreign key to users
- `client_id` (VARCHAR) - Foreign key to users
- `participant_name` (VARCHAR) - Display name
- `participant_avatar` (TEXT) - Avatar URL
- `last_message` (TEXT) - Last message preview
- `last_message_time` (TIMESTAMP) - Last message timestamp
- `unread_count` (INTEGER) - Unread message count
- `is_online` (BOOLEAN) - Online status
- `created_at` (TIMESTAMP) - Thread creation time
- `updated_at` (TIMESTAMP) - Last update time

### chat_messages
- `id` (VARCHAR) - Primary key
- `thread_id` (VARCHAR) - Foreign key to chat_threads
- `sender_id` (VARCHAR) - Foreign key to users
- `sender_name` (VARCHAR) - Sender's name
- `sender_avatar` (TEXT) - Sender's avatar
- `content` (TEXT) - Message content
- `status` (VARCHAR) - Message status (sent, delivered, read)
- `audio_url` (TEXT) - Audio message URL
- `created_at` (TIMESTAMP) - Message timestamp

### message_attachments
- `id` (VARCHAR) - Primary key
- `message_id` (VARCHAR) - Foreign key to chat_messages
- `name` (VARCHAR) - File name
- `type` (VARCHAR) - File type (image, document, drawing)
- `url` (TEXT) - File URL
- `size` (BIGINT) - File size in bytes
- `uploaded_at` (TIMESTAMP) - Upload timestamp

## Troubleshooting

### Connection Issues

If you see "Database: Not configured":
- Check that your `.env` file exists and contains `DATABASE_URL`
- Verify your connection string is correct
- Make sure your Neon project is active

### Schema Initialization Errors

If you see errors during schema initialization:
- Check that your database user has CREATE TABLE permissions
- Verify the connection string is correct
- Try dropping existing tables if they're corrupted

### CORS Errors

If you see CORS errors in the browser:
- Make sure `FRONTEND_URL` in `.env` matches your frontend URL
- Check that the backend server is running on the correct port

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- In production, use SSL connections (already configured)
- Consider using connection pooling for better performance
- Implement proper authentication and authorization

## Next Steps

- Set up user authentication
- Implement real-time messaging with WebSockets
- Add file upload to cloud storage (S3, Cloudinary, etc.)
- Implement message read receipts
- Add typing indicators
- Set up push notifications

## Support

For issues with:
- **Neon Database**: Check https://neon.tech/docs
- **Backend Server**: Check server logs in the terminal
- **Frontend**: Check browser console for errors


















