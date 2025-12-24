import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function fixBlogTable() {
  try {
    console.log('🔄 Fixing blog_posts table...');
    
    // Check if video_url column exists
    const columns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_name = 'blog_posts'
      AND column_name = 'video_url'
    `);
    
    if (columns.rows.length === 0) {
      console.log('📝 Adding video_url column...');
      await pool.query(`
        ALTER TABLE blog_posts 
        ADD COLUMN video_url TEXT
      `);
      console.log('✅ video_url column added');
    } else {
      console.log('✅ video_url column already exists');
    }
    
    // Verify all columns
    const allColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns
      WHERE table_name = 'blog_posts'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Complete table structure:');
    allColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    // Verify table is ready
    const verify = await pool.query(`
      SELECT COUNT(*) as count FROM blog_posts
    `);
    console.log(`✅ Table is ready with ${verify.rows[0].count} posts`);
    
    await pool.end();
    console.log('✅ Blog table is fully initialized!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
    await pool.end();
    process.exit(1);
  }
}

fixBlogTable();

