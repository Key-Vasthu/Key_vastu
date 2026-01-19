import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// Maintainer user ID - this is the application maintainer/admin
const MAINTAINER_ID = 'maintainer-001';
const MAINTAINER_NAME = 'KeyVasthu Support';
const MAINTAINER_EMAIL = 'support@keyvasthu.com';

// Ensure maintainer user exists in database
async function ensureMaintainerExists() {
  try {
    const result = await query(`
      SELECT * FROM users WHERE id = $1
    `, [MAINTAINER_ID]);

    if (result.rows.length === 0) {
      // Create maintainer user
      await query(`
        INSERT INTO users (id, email, name, role, created_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING
      `, [MAINTAINER_ID, MAINTAINER_EMAIL, MAINTAINER_NAME, 'admin']);
      console.log('✅ Maintainer user created');
    }
  } catch (error) {
    console.error('Error ensuring maintainer exists:', error);
  }
}

// Ensure user exists in database
async function ensureUserExists(userId, userName, userEmail, userAvatar) {
  try {
    const result = await query(`
      SELECT * FROM users WHERE id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      // Create user
      await query(`
        INSERT INTO users (id, email, name, avatar, role, created_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET name = $3, avatar = $4, last_login = CURRENT_TIMESTAMP
      `, [userId, userEmail || `${userId}@keyvasthu.com`, userName || 'User', userAvatar, 'user']);
    } else {
      // Update user info
      await query(`
        UPDATE users 
        SET name = $2, avatar = $3, last_login = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [userId, userName || result.rows[0].name, userAvatar || result.rows[0].avatar]);
    }
  } catch (error) {
    console.error('Error ensuring user exists:', error);
  }
}

// Initialize maintainer on first request
ensureMaintainerExists();

// Get or create maintainer thread for a user
router.get('/maintainer-thread', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'];
    const userName = req.query.userName || req.headers['x-user-name'] || 'User';
    const userEmail = req.query.userEmail || req.headers['x-user-email'] || '';
    const userAvatar = req.query.userAvatar || req.headers['x-user-avatar'];

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    // Ensure maintainer exists
    await ensureMaintainerExists();
    
    // Ensure user exists
    await ensureUserExists(userId, userName, userEmail, userAvatar);

    // Check if thread already exists
    const existingThread = await query(`
      SELECT * FROM chat_threads
      WHERE (applicant_id = $1 AND client_id = $2) OR (applicant_id = $2 AND client_id = $1)
    `, [userId, MAINTAINER_ID]);

    if (existingThread.rows.length > 0) {
      const thread = existingThread.rows[0];
      return res.json({
        success: true,
        data: {
          id: thread.id,
          participantName: MAINTAINER_NAME,
          participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=keyvasthu',
          lastMessage: thread.last_message || '',
          lastMessageTime: formatRelativeTime(thread.last_message_time),
          unreadCount: thread.unread_count || 0,
          isOnline: true,
        },
      });
    }

    // Create new thread with maintainer
    const threadId = `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const result = await query(`
      INSERT INTO chat_threads (id, applicant_id, client_id, participant_name, participant_avatar)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [threadId, userId, MAINTAINER_ID, MAINTAINER_NAME, 'https://api.dicebear.com/7.x/avataaars/svg?seed=keyvasthu']);

    const thread = result.rows[0];
    res.json({
      success: true,
      data: {
        id: thread.id,
        participantName: MAINTAINER_NAME,
        participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=keyvasthu',
        lastMessage: '',
        lastMessageTime: formatRelativeTime(thread.created_at),
        unreadCount: 0,
        isOnline: true,
      },
    });
  } catch (error) {
    console.error('Error getting maintainer thread:', error);
    res.status(500).json({ success: false, error: 'Failed to get maintainer thread' });
  }
});

// Get all chat threads for a user
router.get('/threads', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'] || 'user-1';
    const userName = req.query.userName || req.headers['x-user-name'];
    const userEmail = req.query.userEmail || req.headers['x-user-email'] || '';
    const userAvatar = req.query.userAvatar || req.headers['x-user-avatar'];

    // Ensure maintainer exists
    await ensureMaintainerExists();
    
    // Ensure user exists and update info
    if (userName) {
      await ensureUserExists(userId, userName, userEmail, userAvatar);
    }
    
    // Get threads where user is either applicant or client
    const result = await query(`
      SELECT 
        t.*,
        CASE 
          WHEN t.applicant_id = $1 THEN t.client_id
          ELSE t.applicant_id
        END as other_user_id,
        CASE 
          WHEN t.applicant_id = $1 THEN 
            (SELECT name FROM users WHERE id = t.client_id)
          ELSE 
            (SELECT name FROM users WHERE id = t.applicant_id)
        END as participant_name,
        CASE 
          WHEN t.applicant_id = $1 THEN 
            (SELECT avatar FROM users WHERE id = t.client_id)
          ELSE 
            (SELECT avatar FROM users WHERE id = t.applicant_id)
        END as participant_avatar
      FROM chat_threads t
      WHERE t.applicant_id = $1 OR t.client_id = $1
      ORDER BY t.updated_at DESC
    `, [userId]);

    const threads = result.rows.map(row => ({
      id: row.id,
      participantName: row.participant_name,
      participantAvatar: row.participant_avatar,
      lastMessage: row.last_message || '',
      lastMessageTime: formatRelativeTime(row.last_message_time),
      unreadCount: row.unread_count || 0,
      isOnline: row.is_online || false,
    }));

    res.json({ success: true, data: threads });
  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chat threads' });
  }
});

// Get messages for a specific thread
router.get('/threads/:threadId/messages', async (req, res) => {
  try {
    const { threadId } = req.params;
    
    const messagesResult = await query(`
      SELECT 
        m.*,
        json_agg(
          json_build_object(
            'id', a.id,
            'name', a.name,
            'type', a.type,
            'url', a.url,
            'size', a.size,
            'uploadedAt', a.uploaded_at
          )
        ) FILTER (WHERE a.id IS NOT NULL) as attachments
      FROM chat_messages m
      LEFT JOIN message_attachments a ON m.id = a.message_id
      WHERE m.thread_id = $1
      GROUP BY m.id
      ORDER BY m.created_at ASC
    `, [threadId]);

    const messages = messagesResult.rows.map(row => ({
      id: row.id,
      senderId: row.sender_id,
      senderName: row.sender_name,
      senderAvatar: row.sender_avatar,
      content: row.content,
      timestamp: row.created_at.toISOString(),
      status: row.status,
      audioUrl: row.audio_url,
      attachments: row.attachments && row.attachments.length > 0 
        ? row.attachments.map(att => ({
            id: att.id,
            name: att.name,
            type: att.type === 'drawing' ? 'drawing' : att.type === 'image' ? 'image' : 'document',
            url: att.url,
            size: att.size,
            uploadedAt: att.uploadedAt,
          }))
        : undefined,
    }));

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/threads/:threadId/messages', async (req, res) => {
  try {
    const { threadId } = req.params;
    const { content, senderId, senderName, senderAvatar, attachments, audioUrl } = req.body;

    if (!content && !attachments && !audioUrl) {
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }

    // Ensure user exists in database
    if (senderId && senderName) {
      await ensureUserExists(senderId, senderName, '', senderAvatar);
    }

    // Create message
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const messageResult = await query(`
      INSERT INTO chat_messages (id, thread_id, sender_id, sender_name, sender_avatar, content, status, audio_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      messageId,
      threadId,
      senderId || 'user-1',
      senderName || 'You',
      senderAvatar,
      content || '',
      'sent',
      audioUrl,
    ]);

    // Insert attachments if any
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      for (const attachment of attachments) {
        await query(`
          INSERT INTO message_attachments (id, message_id, name, type, url, size)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          attachment.id || `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          messageId,
          attachment.name,
          attachment.type,
          attachment.url,
          attachment.size,
        ]);
      }
    }

    // Update thread's last message and timestamp
    await query(`
      UPDATE chat_threads
      SET last_message = $1,
          last_message_time = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [content || (audioUrl ? '🎤 Voice message' : 'Attachment'), threadId]);

      // Fetch the complete message with attachments
      const completeMessageResult = await query(`
        SELECT 
          m.*,
          json_agg(
            json_build_object(
              'id', a.id,
              'name', a.name,
              'type', a.type,
              'url', a.url,
              'size', a.size,
              'uploadedAt', a.uploaded_at
            )
          ) FILTER (WHERE a.id IS NOT NULL) as attachments
        FROM chat_messages m
        LEFT JOIN message_attachments a ON m.id = a.message_id
        WHERE m.id = $1
        GROUP BY m.id
      `, [messageId]);

      const message = completeMessageResult.rows[0];
      const response = {
        id: message.id,
        senderId: message.sender_id,
        senderName: message.sender_name,
        senderAvatar: message.sender_avatar,
        content: message.content,
        timestamp: message.created_at.toISOString(),
        status: message.status,
        audioUrl: message.audio_url,
        attachments: message.attachments && message.attachments.length > 0
          ? message.attachments.map(att => ({
              id: att.id,
              name: att.name,
              type: att.type === 'drawing' ? 'drawing' : att.type === 'image' ? 'image' : 'document',
              url: att.url,
              size: att.size,
              uploadedAt: att.uploadedAt,
            }))
          : undefined,
      };

      res.json({ success: true, data: response });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// Create or get a thread between two users
router.post('/threads', async (req, res) => {
  try {
    const { applicantId, clientId, participantName, participantAvatar } = req.body;

    if (!applicantId || !clientId) {
      return res.status(400).json({ success: false, error: 'Both applicantId and clientId are required' });
    }

    // Check if thread already exists
    const existingThread = await query(`
      SELECT * FROM chat_threads
      WHERE (applicant_id = $1 AND client_id = $2) OR (applicant_id = $2 AND client_id = $1)
    `, [applicantId, clientId]);

    if (existingThread.rows.length > 0) {
      const thread = existingThread.rows[0];
      return res.json({
        success: true,
        data: {
          id: thread.id,
          participantName: participantName || thread.participant_name,
          participantAvatar: participantAvatar || thread.participant_avatar,
          lastMessage: thread.last_message || '',
          lastMessageTime: formatRelativeTime(thread.last_message_time),
          unreadCount: thread.unread_count || 0,
          isOnline: thread.is_online || false,
        },
      });
    }

    // Create new thread
    const threadId = `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const result = await query(`
      INSERT INTO chat_threads (id, applicant_id, client_id, participant_name, participant_avatar)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [threadId, applicantId, clientId, participantName || 'User', participantAvatar]);

    const thread = result.rows[0];
    res.json({
      success: true,
      data: {
        id: thread.id,
        participantName: thread.participant_name,
        participantAvatar: thread.participant_avatar,
        lastMessage: '',
        lastMessageTime: formatRelativeTime(thread.created_at),
        unreadCount: 0,
        isOnline: false,
      },
    });
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ success: false, error: 'Failed to create thread' });
  }
});

// Helper function to format relative time
function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Just now';
  
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return time.toLocaleDateString();
}

export { router as chatRoutes };

