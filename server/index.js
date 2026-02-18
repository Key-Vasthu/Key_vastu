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

// Root API endpoint - shows server is running
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'KeyVasthu API Server is running successfully! 🚀',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
      },
      chat: {
        threads: 'GET /api/chat/threads',
        messages: 'GET /api/chat/threads/:threadId/messages',
        sendMessage: 'POST /api/chat/threads/:threadId/messages',
        maintainerThread: 'GET /api/chat/maintainer-thread',
      },
      files: {
        upload: 'POST /api/files/upload',
        delete: 'DELETE /api/files/:key',
      },
      books: {
        list: 'GET /api/books',
        create: 'POST /api/books',
        update: 'PUT /api/books/:id',
        delete: 'DELETE /api/books/:id',
      },
      orders: {
        create: 'POST /api/orders',
        list: 'GET /api/orders',
      },
      admin: {
        dashboard: 'GET /api/admin/dashboard',
        orders: 'GET /api/admin/orders',
      },
    },
    status: {
      server: 'running',
      database: process.env.DATABASE_URL ? 'configured' : 'not configured',
      r2Storage: process.env.R2_BUCKET_NAME ? 'configured' : 'not configured',
    },
    timestamp: new Date().toISOString(),
  });
});

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
  console.log('\n' + '='.repeat(60));
  console.log('🚀 KeyVasthu Backend Server');
  console.log('='.repeat(60));
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`☁️  R2 Storage: ${process.env.R2_BUCKET_NAME ? '✅ Configured' : '❌ Not configured'}`);
  console.log('='.repeat(60));
  console.log(`🔗 API Root: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(60));
  console.log('📝 Available API Routes:');
  console.log('   • POST   /api/auth/register');
  console.log('   • POST   /api/auth/login');
  console.log('   • GET    /api/chat/threads');
  console.log('   • POST   /api/chat/threads/:threadId/messages');
  console.log('   • POST   /api/files/upload');
  console.log('   • GET    /api/books');
  console.log('   • POST   /api/orders');
  console.log('='.repeat(60) + '\n');
});

