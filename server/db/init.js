import { query } from './connection.js';

export async function initDatabase() {
  try {
    console.log('📦 Initializing database schema...');

    // Create users table (if not exists)
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar TEXT,
        role VARCHAR(50) DEFAULT 'user',
        phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `);

    // Create chat_threads table
    // Note: Foreign keys are optional - we'll handle user creation separately
    await query(`
      CREATE TABLE IF NOT EXISTS chat_threads (
        id VARCHAR(255) PRIMARY KEY,
        applicant_id VARCHAR(255) NOT NULL,
        client_id VARCHAR(255) NOT NULL,
        participant_name VARCHAR(255) NOT NULL,
        participant_avatar TEXT,
        last_message TEXT,
        last_message_time TIMESTAMP,
        unread_count INTEGER DEFAULT 0,
        is_online BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(applicant_id, client_id)
      )
    `);

    // Create chat_messages table
    await query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(255) PRIMARY KEY,
        thread_id VARCHAR(255) NOT NULL,
        sender_id VARCHAR(255) NOT NULL,
        sender_name VARCHAR(255) NOT NULL,
        sender_avatar TEXT,
        content TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'sent',
        audio_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create message_attachments table
    await query(`
      CREATE TABLE IF NOT EXISTS message_attachments (
        id VARCHAR(255) PRIMARY KEY,
        message_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        url TEXT NOT NULL,
        size BIGINT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_threads_applicant ON chat_threads(applicant_id)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_threads_client ON chat_threads(client_id)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_messages_thread ON chat_messages(thread_id)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_messages_sender ON chat_messages(sender_id)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_messages_created ON chat_messages(created_at)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_attachments_message ON message_attachments(message_id)
    `);

    // Create orders table
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(100),
        shipping_name VARCHAR(255) NOT NULL,
        shipping_phone VARCHAR(50) NOT NULL,
        shipping_line1 VARCHAR(255) NOT NULL,
        shipping_line2 VARCHAR(255),
        shipping_city VARCHAR(100) NOT NULL,
        shipping_state VARCHAR(100) NOT NULL,
        shipping_pincode VARCHAR(20) NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        delivery_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_items table
    await query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(255) PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        book_id VARCHAR(255) NOT NULL,
        book_title VARCHAR(255) NOT NULL,
        book_author VARCHAR(255),
        book_price DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for orders
    await query(`
      CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)
    `);

    // Create books table
    console.log('📚 Initializing books table...');
    await query(`
      CREATE TABLE IF NOT EXISTS books (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        cover_image TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'Vasthu Shastra',
        rating DECIMAL(3, 1) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        in_stock BOOLEAN DEFAULT true,
        pages INTEGER,
        language VARCHAR(50) DEFAULT 'English',
        isbn VARCHAR(50),
        published_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_books_category ON books(category)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_books_created ON books(created_at)`);
    console.log('✅ books table initialized');

    // Create blog_posts table
    console.log('📝 Initializing blog_posts table...');
    try {
      // Check if table exists
      const tableCheck = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'blog_posts'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log('Creating blog_posts table...');
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
        console.log('✅ blog_posts table created');
      } else {
        console.log('✅ blog_posts table exists, checking columns...');
        
        // Ensure video_url column exists (for older tables)
        const videoUrlCheck = await query(`
          SELECT column_name 
          FROM information_schema.columns
          WHERE table_name = 'blog_posts'
          AND column_name = 'video_url'
        `);
        
        if (videoUrlCheck.rows.length === 0) {
          console.log('Adding video_url column...');
          await query(`
            ALTER TABLE blog_posts 
            ADD COLUMN video_url TEXT
          `);
          console.log('✅ video_url column added');
        }
      }

      // Create indexes for blog posts
      try {
        await query(`CREATE INDEX IF NOT EXISTS idx_blog_author ON blog_posts(author_id)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published_at)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_blog_created ON blog_posts(created_at)`);
        console.log('✅ blog_posts indexes verified');
      } catch (indexError) {
        // Indexes might already exist, that's okay
        if (!indexError.message.includes('already exists')) {
          console.warn('⚠️  Index creation warning:', indexError.message);
        }
      }
    } catch (blogError) {
      console.error('❌ Error initializing blog_posts table:', blogError);
      // Re-throw to be caught by outer try-catch
      throw blogError;
    }

    // Create maintainer user if it doesn't exist
    await query(`
      INSERT INTO users (id, email, name, role, created_at)
      VALUES ('maintainer-001', 'support@keyvasthu.com', 'KeyVasthu Support', 'admin', CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Database schema initialized successfully');
    console.log('✅ Maintainer user ready');
    console.log('✅ Orders tables ready');
    console.log('✅ Blog posts table ready');
    
    // Verify blog_posts table exists
    try {
      const verifyResult = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'blog_posts'
        );
      `);
      if (verifyResult.rows[0].exists) {
        console.log('✅ Verified: blog_posts table exists');
      } else {
        console.warn('⚠️  Warning: blog_posts table verification failed');
      }
    } catch (verifyError) {
      console.error('❌ Error verifying blog_posts table:', verifyError);
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    // Re-throw to be handled by caller
    throw error;
  }
}

