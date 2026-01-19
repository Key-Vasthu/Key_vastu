import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// Create a new order
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      items,
      totalAmount,
      paymentMethod,
      shippingAddress,
    } = req.body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'User ID and items are required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ success: false, error: 'Shipping address is required' });
    }

    // Generate order ID
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create order
    const orderResult = await query(`
      INSERT INTO orders (
        id, user_id, total_amount, status, payment_method,
        shipping_name, shipping_phone, shipping_line1, shipping_line2,
        shipping_city, shipping_state, shipping_pincode
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      orderId,
      userId,
      totalAmount,
      'pending',
      paymentMethod || 'cash_on_delivery',
      shippingAddress.name,
      shippingAddress.phone,
      shippingAddress.line1,
      shippingAddress.line2 || '',
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.pincode,
    ]);

    // Create order items
    for (const item of items) {
      const itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const subtotal = item.book.price * item.quantity;

      await query(`
        INSERT INTO order_items (
          id, order_id, book_id, book_title, book_author,
          book_price, quantity, subtotal
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        itemId,
        orderId,
        item.book.id,
        item.book.title,
        item.book.author || '',
        item.book.price,
        item.quantity,
        subtotal,
      ]);
    }

    // Fetch complete order with items
    const completeOrder = await getOrderWithItems(orderId);

    if (!completeOrder) {
      return res.status(500).json({ 
        success: false, 
        error: 'Order was created but could not be retrieved' 
      });
    }

    res.json({
      success: true,
      data: completeOrder,
      message: 'Order placed successfully!',
    });
  } catch (error) {
    console.error('Error creating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
    res.status(500).json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all orders for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'];

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const ordersResult = await query(`
      SELECT * FROM orders
      WHERE user_id = $1
      ORDER BY order_date DESC
    `, [userId]);

    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        return await getOrderWithItems(order.id);
      })
    );

    // Filter out any null orders (shouldn't happen, but safety check)
    const validOrders = orders.filter(order => order !== null);

    res.json({ success: true, data: validOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// Get a single order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.query.userId || req.headers['x-user-id'];

    const orderResult = await query(`
      SELECT * FROM orders
      WHERE id = $1 AND user_id = $2
    `, [orderId, userId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order = await getOrderWithItems(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
});

// Update order status
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    await query(`
      UPDATE orders
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [status, orderId]);

    const order = await getOrderWithItems(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

// Helper function to get order with items
async function getOrderWithItems(orderId) {
  const orderResult = await query(`
    SELECT * FROM orders WHERE id = $1
  `, [orderId]);

  if (orderResult.rows.length === 0) {
    return null;
  }

  const order = orderResult.rows[0];

  // Get order items
  const itemsResult = await query(`
    SELECT * FROM order_items
    WHERE order_id = $1
    ORDER BY created_at ASC
  `, [orderId]);

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
  };
}

export { router as ordersRoutes };

