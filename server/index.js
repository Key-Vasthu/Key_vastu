import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatRoutes } from './routes/chat.js';
import { ordersRoutes } from './routes/orders.js';
import { adminRoutes } from './routes/admin.js';
import { blogRoutes } from './routes/blog.js';
import { fileRoutes } from './routes/files.js';
import { initDatabase } from './db/init.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
app.use('/api/chat', chatRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/files', fileRoutes);

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`☁️  R2 Storage: ${process.env.R2_BUCKET_NAME ? 'Configured' : 'Not configured'}`);
});

