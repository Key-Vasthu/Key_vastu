import express from 'express';
import { query } from '../db/connection.js';
import { randomUUID } from 'crypto';

const router = express.Router();

// Helper function to ensure blog_posts table exists
const ensureTableExists = async () => {
  try {
    // Check if table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'blog_posts'
      );
    `);
    
    const tableExists = tableCheck && tableCheck.rows && tableCheck.rows[0] && tableCheck.rows[0].exists;
    
    if (tableExists) {
      console.log('✅ blog_posts table exists');
      return true;
    }
    
    // Table doesn't exist, create it
    console.log('⚠️  blog_posts table not found, creating it...');
    try {
      await query(`
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
      
      console.log('✅ blog_posts table created successfully');
      return true;
    } catch (createError) {
      console.error('❌ Error creating blog_posts table:', createError);
      console.error('Create error details:', {
        message: createError.message,
        code: createError.code,
        detail: createError.detail
      });
      throw createError;
    }
  } catch (error) {
    console.error('❌ Error ensuring table exists:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    throw error;
  }
};

// Get all published blog posts (public)
router.get('/', async (req, res) => {
  try {
    // Check if table exists, if not return empty array
    try {
      const tableCheck = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'blog_posts'
        );
      `);
      
      if (!tableCheck || !tableCheck.rows || !tableCheck.rows[0] || !tableCheck.rows[0].exists) {
        console.log('Blog posts table does not exist yet');
        return res.status(200).json({ success: true, data: [] });
      }
    } catch (tableError) {
      console.error('Error checking table existence:', tableError);
      // If we can't check table, assume it doesn't exist and return empty
      return res.status(200).json({ success: true, data: [] });
    }

    const result = await query(`
      SELECT 
        id,
        title,
        content,
        excerpt,
        video_url,
        author_name,
        published_at,
        created_at,
        updated_at
      FROM blog_posts
      WHERE status = 'published'
      ORDER BY 
        CASE WHEN published_at IS NOT NULL THEN published_at ELSE created_at END DESC,
        created_at DESC
    `);

    console.log(`Found ${result.rows ? result.rows.length : 0} published blog posts`);
    res.status(200).json({ success: true, data: result.rows || [] });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    console.error('Error details:', error.message, error.stack);
    // Always return 200 with empty array to prevent frontend crashes
    res.status(200).json({ success: true, data: [], error: error.message });
  }
});

// Get all blog posts (admin only - includes drafts)
router.get('/admin', async (req, res) => {
  try {
    // Check if table exists
    try {
      const tableCheck = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'blog_posts'
        );
      `);
      
      if (!tableCheck || !tableCheck.rows || !tableCheck.rows[0] || !tableCheck.rows[0].exists) {
        console.log('Blog posts table does not exist yet');
        return res.status(200).json({ success: true, data: [] });
      }
    } catch (tableError) {
      console.error('Error checking table existence:', tableError);
      // If we can't check table, assume it doesn't exist and return empty
      return res.status(200).json({ success: true, data: [] });
    }

    const result = await query(`
      SELECT 
        id,
        title,
        content,
        excerpt,
        video_url,
        author_id,
        author_name,
        status,
        published_at,
        created_at,
        updated_at
      FROM blog_posts
      ORDER BY created_at DESC
    `);

    res.status(200).json({ success: true, data: result.rows || [] });
  } catch (error) {
    console.error('Error fetching blog posts (admin):', error);
    // Always return 200 with empty array instead of error
    res.status(200).json({ success: true, data: [], error: error.message });
  }
});

// Get single blog post by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT 
        id,
        title,
        content,
        excerpt,
        video_url,
        author_name,
        status,
        published_at,
        created_at,
        updated_at
      FROM blog_posts
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch blog post' });
  }
});

// Create new blog post (admin only)
router.post('/', async (req, res) => {
  try {
    const { title, content, excerpt, video_url, author_id, author_name, status } = req.body;

    console.log('=== Creating blog post ===');
    console.log('Request body:', { 
      title: title?.substring(0, 50), 
      contentLength: content?.length,
      excerpt: excerpt?.substring(0, 30),
      video_url,
      author_id,
      author_name,
      status 
    });

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      console.error('Validation failed: Title is required');
      return res.status(400).json({ 
        success: false, 
        error: 'Title is required and cannot be empty' 
      });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      console.error('Validation failed: Content is required');
      return res.status(400).json({ 
        success: false, 
        error: 'Content is required and cannot be empty' 
      });
    }

    if (!author_id || typeof author_id !== 'string') {
      console.error('Validation failed: Author ID is required');
      return res.status(400).json({ 
        success: false, 
        error: 'Author ID is required' 
      });
    }

    if (!author_name || typeof author_name !== 'string' || author_name.trim().length === 0) {
      console.error('Validation failed: Author name is required');
      return res.status(400).json({ 
        success: false, 
        error: 'Author name is required' 
      });
    }

    // Ensure table exists (create if it doesn't)
    try {
      await ensureTableExists();
    } catch (tableError) {
      console.error('Error ensuring table exists:', tableError);
      return res.status(500).json({ 
        success: false, 
        error: `Database error: ${tableError.message || 'Failed to create or verify table'}` 
      });
    }

    const id = randomUUID();
    const postStatus = (status && (status === 'published' || status === 'draft')) ? status : 'draft';
    const published_at = postStatus === 'published' ? new Date().toISOString() : null;

    console.log('Inserting blog post:', {
      id,
      title: title.trim().substring(0, 50),
      contentLength: content.trim().length,
      postStatus,
      published_at
    });

    // Insert the blog post
    let insertResult;
    try {
      console.log('Executing INSERT query with values:', {
        id,
        title: title.trim().substring(0, 30),
        contentLength: content.trim().length,
        excerpt: excerpt ? excerpt.trim().substring(0, 30) : null,
        video_url: video_url ? video_url.substring(0, 50) : null,
        author_id,
        author_name: author_name.trim(),
        postStatus,
        published_at
      });
      
      insertResult = await query(`
        INSERT INTO blog_posts (
          id, title, content, excerpt, video_url, author_id, author_name, status, published_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        id, 
        title.trim(), 
        content.trim(), 
        excerpt && excerpt.trim() ? excerpt.trim() : null, 
        video_url && video_url.trim() ? video_url.trim() : null, 
        author_id, 
        author_name.trim(), 
        postStatus, 
        published_at
      ]);
      
      console.log('INSERT query executed successfully, rows returned:', insertResult?.rows?.length || 0);
    } catch (insertError) {
      console.error('❌ Database insert error:', insertError);
      console.error('Insert error details:', {
        message: insertError.message,
        code: insertError.code,
        detail: insertError.detail,
        constraint: insertError.constraint,
        table: insertError.table
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to insert blog post';
      if (insertError.code === '23505') {
        errorMessage = 'A blog post with this ID already exists';
      } else if (insertError.code === '23502') {
        errorMessage = `Missing required field: ${insertError.column}`;
      } else if (insertError.code === '23503') {
        errorMessage = 'Foreign key constraint violation';
      } else if (insertError.detail) {
        errorMessage = `Database error: ${insertError.detail}`;
      } else if (insertError.message) {
        errorMessage = `Database error: ${insertError.message}`;
      }
      
      return res.status(500).json({ 
        success: false, 
        error: errorMessage 
      });
    }

    if (!insertResult || !insertResult.rows || insertResult.rows.length === 0) {
      console.error('Blog post insert returned no rows');
      return res.status(500).json({ 
        success: false, 
        error: 'Blog post was not created in database - no rows returned' 
      });
    }

    const createdPost = insertResult.rows[0];
    console.log('✅ Blog post created successfully:', {
      id: createdPost.id,
      title: createdPost.title?.substring(0, 50),
      status: createdPost.status,
      published_at: createdPost.published_at
    });

    res.status(201).json({ success: true, data: createdPost });
  } catch (error) {
    console.error('❌ Unexpected error creating blog post:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack?.substring(0, 500)
    });
    
    // Return more specific error messages
    let errorMessage = 'Failed to create blog post';
    if (error.message) {
      errorMessage = `Failed to create blog post: ${error.message}`;
    } else if (error.detail) {
      errorMessage = `Failed to create blog post: ${error.detail}`;
    }
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
});

// Update blog post (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, video_url, status } = req.body;

    console.log('Updating blog post:', { id, title, status });

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title and content are required' 
      });
    }

    // Check if post exists
    const existing = await query('SELECT * FROM blog_posts WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      console.error('Blog post not found for update:', id);
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    const currentPost = existing.rows[0];
    const postStatus = (status && (status === 'published' || status === 'draft')) ? status : currentPost.status;
    let published_at = currentPost.published_at;

    // If status is changing to published and wasn't published before, set published_at
    if (postStatus === 'published' && currentPost.status !== 'published') {
      published_at = new Date().toISOString();
    } else if (postStatus === 'draft') {
      // If changing to draft, keep existing published_at (don't clear it)
      published_at = currentPost.published_at;
    }

    console.log('Updating with status:', postStatus, 'published_at:', published_at);

    // Update the blog post and return the updated row
    const updateResult = await query(`
      UPDATE blog_posts
      SET 
        title = $1,
        content = $2,
        excerpt = $3,
        video_url = $4,
        status = $5,
        published_at = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [
      title.trim(), 
      content.trim(), 
      excerpt ? excerpt.trim() : null, 
      video_url ? video_url.trim() : null, 
      postStatus, 
      published_at, 
      id
    ]);

    if (updateResult.rows.length === 0) {
      console.error('Blog post update returned no rows');
      return res.status(500).json({ 
        success: false, 
        error: 'Blog post was not updated in database' 
      });
    }

    const updatedPost = updateResult.rows[0];
    console.log('Blog post updated successfully:', {
      id: updatedPost.id,
      title: updatedPost.title,
      status: updatedPost.status,
      published_at: updatedPost.published_at
    });

    res.json({ success: true, data: updatedPost });
  } catch (error) {
    console.error('Error updating blog post:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    
    let errorMessage = 'Failed to update blog post';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.detail) {
      errorMessage = error.detail;
    }
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
});

// Delete blog post (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ success: false, error: 'Failed to delete blog post' });
  }
});

export { router as blogRoutes };

