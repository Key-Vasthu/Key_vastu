import { query } from './connection.js';

async function createBlogTable() {
  try {
    console.log('🔄 Creating blog_posts table...');
    
    // Drop table if exists (for clean recreation)
    try {
      await query('DROP TABLE IF EXISTS blog_posts CASCADE');
      console.log('✅ Dropped existing blog_posts table');
    } catch (error) {
      console.log('No existing table to drop');
    }
    
    // Create blog_posts table
    await query(`
      CREATE TABLE blog_posts (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        video_url TEXT,
        featured_image_url TEXT,
        estimated_read_time INTEGER,
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
    await query(`
      CREATE INDEX idx_blog_author ON blog_posts(author_id)
    `);
    await query(`
      CREATE INDEX idx_blog_status ON blog_posts(status)
    `);
    await query(`
      CREATE INDEX idx_blog_published ON blog_posts(published_at)
    `);
    await query(`
      CREATE INDEX idx_blog_created ON blog_posts(created_at)
    `);
    console.log('✅ blog_posts indexes created');
    
    // Verify table exists
    const verify = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'blog_posts'
      );
    `);
    
    if (verify.rows[0].exists) {
      console.log('✅ Verified: blog_posts table exists');
      
      // Check table structure
      const columns = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'blog_posts'
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Table columns:');
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });
      
      return true;
    } else {
      console.error('❌ Table verification failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error creating blog_posts table:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createBlogTable()
    .then(() => {
      console.log('✅ Blog table creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to create blog table:', error);
      process.exit(1);
    });
}

export { createBlogTable };

