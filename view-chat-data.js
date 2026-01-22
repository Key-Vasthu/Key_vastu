/**
 * Quick script to view chat data from Neon database
 * Run with: node view-chat-data.js
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function viewChatData() {
  try {
    console.log('🔍 Connecting to Neon database...\n');

    // View all users
    console.log('📋 USERS:');
    console.log('─'.repeat(80));
    const users = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    users.rows.forEach(user => {
      console.log(`  ${user.name} (${user.email}) - ${user.role} - Created: ${new Date(user.created_at).toLocaleString()}`);
    });
    console.log(`\n  Total: ${users.rows.length} users\n`);

    // View all threads
    console.log('💬 CHAT THREADS:');
    console.log('─'.repeat(80));
    const threads = await pool.query(`
      SELECT 
        t.id,
        t.participant_name,
        t.last_message,
        t.last_message_time,
        t.unread_count,
        u1.name as applicant_name,
        u2.name as client_name
      FROM chat_threads t
      LEFT JOIN users u1 ON t.applicant_id = u1.id
      LEFT JOIN users u2 ON t.client_id = u2.id
      ORDER BY t.updated_at DESC
    `);
    threads.rows.forEach(thread => {
      console.log(`  Thread: ${thread.id}`);
      console.log(`    With: ${thread.participant_name}`);
      console.log(`    Participants: ${thread.applicant_name} ↔ ${thread.client_name}`);
      console.log(`    Last Message: ${thread.last_message || '(no messages yet)'}`);
      console.log(`    Unread: ${thread.unread_count}`);
      console.log('');
    });
    console.log(`  Total: ${threads.rows.length} threads\n`);

    // View recent messages
    console.log('📨 RECENT MESSAGES (Last 20):');
    console.log('─'.repeat(80));
    const messages = await pool.query(`
      SELECT 
        m.id,
        m.sender_name,
        m.content,
        m.created_at,
        t.participant_name as thread_participant
      FROM chat_messages m
      LEFT JOIN chat_threads t ON m.thread_id = t.id
      ORDER BY m.created_at DESC
      LIMIT 20
    `);
    messages.rows.forEach(msg => {
      const time = new Date(msg.created_at).toLocaleString();
      const content = msg.content.length > 60 ? msg.content.substring(0, 60) + '...' : msg.content;
      console.log(`  [${time}] ${msg.sender_name} → ${msg.thread_participant || 'Unknown'}`);
      console.log(`    "${content}"`);
      console.log('');
    });
    console.log(`  Total messages in database: ${messages.rows.length > 0 ? 'See full count below' : '0'}\n`);

    // Statistics
    console.log('📊 STATISTICS:');
    console.log('─'.repeat(80));
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM chat_threads) as total_threads,
        (SELECT COUNT(*) FROM chat_messages) as total_messages,
        (SELECT COUNT(*) FROM message_attachments) as total_attachments
    `);
    const stat = stats.rows[0];
    console.log(`  Total Users: ${stat.total_users}`);
    console.log(`  Total Threads: ${stat.total_threads}`);
    console.log(`  Total Messages: ${stat.total_messages}`);
    console.log(`  Total Attachments: ${stat.total_attachments}\n`);

    // View conversations with maintainer
    console.log('🤝 CONVERSATIONS WITH MAINTAINER:');
    console.log('─'.repeat(80));
    const maintainerChats = await pool.query(`
      SELECT 
        t.id as thread_id,
        CASE 
          WHEN t.applicant_id = 'maintainer-001' THEN u2.name
          ELSE u1.name
        END as user_name,
        COUNT(m.id) as message_count,
        MAX(m.created_at) as last_activity
      FROM chat_threads t
      LEFT JOIN users u1 ON t.applicant_id = u1.id
      LEFT JOIN users u2 ON t.client_id = u2.id
      LEFT JOIN chat_messages m ON t.id = m.thread_id
      WHERE t.applicant_id = 'maintainer-001' OR t.client_id = 'maintainer-001'
      GROUP BY t.id, u1.name, u2.name
      ORDER BY last_activity DESC
    `);
    maintainerChats.rows.forEach(chat => {
      console.log(`  ${chat.user_name}: ${chat.message_count} messages`);
      if (chat.last_activity) {
        console.log(`    Last activity: ${new Date(chat.last_activity).toLocaleString()}`);
      }
      console.log('');
    });

    console.log('✅ Done!\n');
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

viewChatData();


















