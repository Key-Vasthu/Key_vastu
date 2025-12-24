import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function createBlogTable() {
  try {
    console.log('🔄 Connecting to database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database');
    
    // Check if table exists
    const checkResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'blog_posts'
      );
    `);
    
    if (checkResult.rows[0].exists) {
      console.log('✅ blog_posts table already exists');
      
      // Verify structure
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns
        WHERE table_name = 'blog_posts'
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Table structure:');
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
      
      await pool.end();
      return;
    }
    
    console.log('📝 Creating blog_posts table...');
    
    // Create table
    await pool.query(`
      CREATE TABLE blog_posts (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        video_url TEXT,
        author_id VARCHAR(255) NOT NULL,
        author_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ blog_posts table created');
    
    // Create indexes
    await pool.query(`CREATE INDEX idx_blog_author ON blog_posts(author_id)`);
    await pool.query(`CREATE INDEX idx_blog_status ON blog_posts(status)`);
    await pool.query(`CREATE INDEX idx_blog_published ON blog_posts(published_at)`);
    await pool.query(`CREATE INDEX idx_blog_created ON blog_posts(created_at)`);
    console.log('✅ Indexes created');
    
    // Verify
    const verify = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'blog_posts'
      );
    `);
    
    if (verify.rows[0].exists) {
      console.log('✅ Verification successful - blog_posts table is ready!');
    }
    
    await pool.end();
    console.log('✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
    await pool.end();
    process.exit(1);
  }
}

createBlogTable();

