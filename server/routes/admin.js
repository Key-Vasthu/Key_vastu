import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// Get admin dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Total users
    const usersResult = await query('SELECT COUNT(*) as count FROM users WHERE role != $1', ['admin']);
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Active chats (threads with maintainer)
    const activeChatsResult = await query(`
      SELECT COUNT(DISTINCT thread_id) as count
      FROM chat_messages
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `);
    const activeChats = parseInt(activeChatsResult.rows[0].count);

    // Members chatting with maintainer
    const chattingMembersResult = await query(`
      SELECT COUNT(DISTINCT CASE 
        WHEN t.applicant_id = 'maintainer-001' THEN t.client_id
        ELSE t.applicant_id
      END) as count
      FROM chat_threads t
      WHERE (t.applicant_id = 'maintainer-001' OR t.client_id = 'maintainer-001')
      AND t.updated_at > NOW() - INTERVAL '7 days'
    `);
    const chattingMembers = parseInt(chattingMembersResult.rows[0].count);

    // Total orders
    const ordersResult = await query('SELECT COUNT(*) as count FROM orders');
    const totalOrders = parseInt(ordersResult.rows[0].count);

    // Total revenue
    const revenueResult = await query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders');
    const revenue = parseFloat(revenueResult.rows[0].total);

    // Members with orders
    const membersWithOrdersResult = await query('SELECT COUNT(DISTINCT user_id) as count FROM orders');
    const membersWithOrders = parseInt(membersWithOrdersResult.rows[0].count);

    // Pending reviews (can be extended later)
    const pendingReviews = 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        activeChats,
        chattingMembers,
        totalOrders,
        revenue,
        membersWithOrders,
        pendingReviews,
        newUsersThisMonth: 0, // Can be calculated if needed
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch admin statistics' });
  }
});

// Get all orders (admin only)
router.get('/orders', async (req, res) => {
  try {
    const ordersResult = await query(`
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.order_date DESC
    `);

    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        // Get order items
        const itemsResult = await query(`
          SELECT * FROM order_items
          WHERE order_id = $1
          ORDER BY created_at ASC
        `, [order.id]);

        const items = itemsResult.rows.map(item => ({
          book: {
            id: item.book_id,
            title: item.book_title,
            author: item.book_author,
            price: parseFloat(item.book_price),
          },
          quantity: item.quantity,
        }));

        return {
          id: order.id,
          items,
          totalAmount: parseFloat(order.total_amount),
          status: order.status,
          orderDate: order.order_date.toISOString(),
          deliveryDate: order.delivery_date ? order.delivery_date.toISOString() : undefined,
          shippingAddress: {
            name: order.shipping_name,
            phone: order.shipping_phone,
            line1: order.shipping_line1,
            line2: order.shipping_line2 || undefined,
            city: order.shipping_city,
            state: order.shipping_state,
            pincode: order.shipping_pincode,
          },
          paymentMethod: order.payment_method,
          user: {
            id: order.user_id,
            name: order.user_name,
            email: order.user_email,
          },
        };
      })
    );

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// Get active chat threads with maintainer
router.get('/chat-threads', async (req, res) => {
  try {
    const threadsResult = await query(`
      SELECT 
        t.*,
        CASE 
          WHEN t.applicant_id = 'maintainer-001' THEN u2.name
          ELSE u1.name
        END as client_name,
        CASE 
          WHEN t.applicant_id = 'maintainer-001' THEN u2.email
          ELSE u1.email
        END as client_email,
        CASE 
          WHEN t.applicant_id = 'maintainer-001' THEN u2.avatar
          ELSE u1.avatar
        END as client_avatar,
        CASE 
          WHEN t.applicant_id = 'maintainer-001' THEN u2.id
          ELSE u1.id
        END as client_id,
        (SELECT COUNT(*) FROM chat_messages WHERE thread_id = t.id) as message_count,
        (SELECT COUNT(*) FROM chat_messages 
         WHERE thread_id = t.id 
         AND sender_id != 'maintainer-001'
         AND created_at > (SELECT MAX(created_at) FROM chat_messages WHERE thread_id = t.id AND sender_id = 'maintainer-001')) as unread_count
      FROM chat_threads t
      LEFT JOIN users u1 ON t.applicant_id = u1.id
      LEFT JOIN users u2 ON t.client_id = u2.id
      WHERE t.applicant_id = 'maintainer-001' OR t.client_id = 'maintainer-001'
      ORDER BY t.updated_at DESC
    `);

    const threads = threadsResult.rows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      clientName: row.client_name,
      clientEmail: row.client_email,
      clientAvatar: row.client_avatar,
      lastMessage: row.last_message || '',
      lastMessageTime: row.last_message_time ? formatRelativeTime(row.last_message_time) : 'No messages',
      messageCount: parseInt(row.message_count),
      unreadCount: parseInt(row.unread_count) || 0,
      isOnline: row.is_online || false,
      updatedAt: row.updated_at ? row.updated_at.toISOString() : new Date().toISOString(),
    }));

    res.json({ success: true, data: threads });
  } catch (error) {
    console.error('Error fetching chat threads:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chat threads' });
  }
});

// Get members with orders
router.get('/members-with-orders', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.avatar,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as total_spent,
        MAX(o.order_date) as last_order_date
      FROM users u
      INNER JOIN orders o ON u.id = o.user_id
      WHERE u.role != 'admin'
      GROUP BY u.id, u.name, u.email, u.avatar
      ORDER BY order_count DESC, last_order_date DESC
    `);

    const members = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar,
      orderCount: parseInt(row.order_count),
      totalSpent: parseFloat(row.total_spent),
      lastOrderDate: row.last_order_date.toISOString(),
    }));

    res.json({ success: true, data: members });
  } catch (error) {
    console.error('Error fetching members with orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch members with orders' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, email, name, avatar, role, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `);

    const users = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name,
      avatar: row.avatar,
      role: row.role,
      createdAt: row.created_at.toISOString(),
      lastLogin: row.last_login ? row.last_login.toISOString() : undefined,
    }));

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
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

export { router as adminRoutes };

