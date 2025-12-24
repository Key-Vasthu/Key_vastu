# How to View Chat Communications in Neon Database

## Method 1: Using Neon Console (Web Interface)

### Step 1: Access Your Neon Project
1. Go to: https://console.neon.tech/app/projects/dark-surf-61946341
2. Click on your project to open it

### Step 2: Open SQL Editor
1. In your project dashboard, look for **"SQL Editor"** or **"Query"** tab
2. Click on it to open the SQL query interface

### Step 3: Run Queries to View Data

#### View All Users
```sql
SELECT * FROM users ORDER BY created_at DESC;
```

#### View All Chat Threads
```sql
SELECT 
  id,
  applicant_id,
  client_id,
  participant_name,
  last_message,
  last_message_time,
  unread_count,
  created_at,
  updated_at
FROM chat_threads 
ORDER BY updated_at DESC;
```

#### View All Messages
```sql
SELECT 
  m.id,
  m.thread_id,
  m.sender_id,
  m.sender_name,
  m.content,
  m.status,
  m.created_at,
  t.participant_name as thread_participant
FROM chat_messages m
LEFT JOIN chat_threads t ON m.thread_id = t.id
ORDER BY m.created_at DESC
LIMIT 50;
```

#### View Messages for a Specific Thread
```sql
SELECT 
  m.*,
  json_agg(
    json_build_object(
      'id', a.id,
      'name', a.name,
      'type', a.type,
      'url', a.url
    )
  ) FILTER (WHERE a.id IS NOT NULL) as attachments
FROM chat_messages m
LEFT JOIN message_attachments a ON m.id = a.message_id
WHERE m.thread_id = 'your-thread-id-here'
GROUP BY m.id
ORDER BY m.created_at ASC;
```

#### View Conversations Between User and Maintainer
```sql
SELECT 
  t.id as thread_id,
  t.participant_name,
  m.sender_name,
  m.content,
  m.created_at
FROM chat_threads t
JOIN chat_messages m ON t.id = m.thread_id
WHERE t.applicant_id = 'maintainer-001' OR t.client_id = 'maintainer-001'
ORDER BY m.created_at ASC;
```

#### View All Attachments
```sql
SELECT 
  a.*,
  m.sender_name,
  m.content as message_content,
  m.created_at as message_time
FROM message_attachments a
JOIN chat_messages m ON a.message_id = m.id
ORDER BY a.uploaded_at DESC;
```

#### Count Messages by Thread
```sql
SELECT 
  t.id,
  t.participant_name,
  COUNT(m.id) as message_count,
  MAX(m.created_at) as last_message_time
FROM chat_threads t
LEFT JOIN chat_messages m ON t.id = m.thread_id
GROUP BY t.id, t.participant_name
ORDER BY last_message_time DESC;
```

## Method 2: Using psql Command Line

### Connect to Your Database
```bash
psql "postgresql://neondb_owner:npg_SgzUTln6N7vO@ep-dry-smoke-ahuhyowd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### Useful Commands in psql

```sql
-- List all tables
\dt

-- Describe a table structure
\d chat_messages
\d chat_threads
\d users
\d message_attachments

-- View recent messages
SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 10;

-- Exit psql
\q
```

## Method 3: Using Database Client Tools

### Option A: DBeaver (Free)
1. Download DBeaver: https://dbeaver.io/
2. Create new PostgreSQL connection
3. Use your connection string:
   - Host: `ep-dry-smoke-ahuhyowd-pooler.c-3.us-east-1.aws.neon.tech`
   - Database: `neondb`
   - Username: `neondb_owner`
   - Password: `npg_SgzUTln6N7vO`
   - Port: `5432`
   - SSL: Required

### Option B: pgAdmin
1. Download pgAdmin: https://www.pgadmin.org/
2. Add new server with your Neon connection details
3. Browse tables and run queries

### Option C: TablePlus (Mac/Windows)
1. Download TablePlus: https://tableplus.com/
2. Create PostgreSQL connection with your Neon credentials
3. Browse and query your data visually

## Quick Reference Queries

### See All Recent Conversations
```sql
SELECT 
  u1.name as applicant_name,
  u2.name as client_name,
  t.last_message,
  t.last_message_time,
  COUNT(m.id) as total_messages
FROM chat_threads t
LEFT JOIN users u1 ON t.applicant_id = u1.id
LEFT JOIN users u2 ON t.client_id = u2.id
LEFT JOIN chat_messages m ON t.id = m.thread_id
GROUP BY t.id, u1.name, u2.name, t.last_message, t.last_message_time
ORDER BY t.last_message_time DESC;
```

### View Complete Conversation History
```sql
SELECT 
  t.participant_name as conversation_with,
  m.sender_name,
  m.content,
  m.created_at as sent_at,
  CASE 
    WHEN m.sender_id = 'maintainer-001' THEN 'Maintainer'
    ELSE 'User'
  END as sender_type
FROM chat_threads t
JOIN chat_messages m ON t.id = m.thread_id
WHERE t.applicant_id = 'maintainer-001' OR t.client_id = 'maintainer-001'
ORDER BY m.created_at ASC;
```

### Statistics Dashboard Query
```sql
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM chat_threads) as total_threads,
  (SELECT COUNT(*) FROM chat_messages) as total_messages,
  (SELECT COUNT(*) FROM message_attachments) as total_attachments,
  (SELECT COUNT(*) FROM chat_messages WHERE created_at > NOW() - INTERVAL '24 hours') as messages_today;
```

## Important Notes

⚠️ **Security**: Your connection string contains sensitive credentials. Never share it publicly.

✅ **Data Persistence**: All chat messages are stored permanently in the database.

🔄 **Real-time**: The database updates immediately when messages are sent.

📊 **Indexes**: The database has indexes on frequently queried columns for fast retrieval.

## Troubleshooting

### Can't See Data?
- Make sure you've sent at least one message through the chat interface
- Verify you're connected to the correct database
- Check that the tables exist: `\dt` in psql

### Connection Issues?
- Verify your connection string in `.env` file
- Check that your Neon project is active
- Ensure SSL mode is enabled (`sslmode=require`)

---

**Tip**: Bookmark your Neon console URL for quick access: https://console.neon.tech/app/projects/dark-surf-61946341












