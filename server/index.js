import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatRoutes } from './routes/chat.js';
import { ordersRoutes } from './routes/orders.js';
import { adminRoutes } from './routes/admin.js';
import { blogRoutes } from './routes/blog.js';
import { fileRoutes } from './routes/files.js';
import { booksRoutes } from './routes/books.js';
import { authRoutes } from './routes/auth.js';
import { initDatabase } from './db/init.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Body parser - must be before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`${req.method} ${req.path}`, {
      body: req.method === 'POST' ? { ...req.body, password: req.body.password ? '***' : undefined } : undefined
    });
  }
  next();
});

// Initialize database - wait for it to complete
(async () => {
  try {
    console.log('🔄 Initializing database...');
    await initDatabase();
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('Server will continue, but some features may not work');
  }
})();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/books', booksRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const { query } = await import('./db/connection.js');
    
    // Check database connection
    const dbCheck = await query('SELECT NOW() as time');
    
    // Check if blog_posts table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'blog_posts'
      );
    `);
    
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      database: {
        connected: true,
        blog_posts_table_exists: tableCheck.rows[0].exists
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Server is running but database check failed',
      error: error.message 
    });
  }
});

// 404 handler - must be after all routes
// Handle OPTIONS requests (CORS preflight) before 404
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.sendStatus(200);
  }
  next();
});

// 404 handler - only for API routes
app.use((req, res) => {
  // Only return JSON for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: 'Route not found',
      path: req.path,
      method: req.method,
    });
  }
  
  // For non-API routes, return 404 but don't interfere with frontend routing
  res.status(404).send('Not found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`☁️  R2 Storage: ${process.env.R2_BUCKET_NAME ? 'Configured' : 'Not configured'}`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
});

