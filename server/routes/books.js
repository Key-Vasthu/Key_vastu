import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM books
      ORDER BY created_at DESC
    `);

    const books = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      author: row.author,
      description: row.description || '',
      price: parseFloat(row.price),
      originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
      coverImage: row.cover_image,
      category: row.category || 'Vasthu Shastra',
      rating: parseFloat(row.rating) || 0,
      reviewCount: parseInt(row.review_count) || 0,
      inStock: row.in_stock !== false,
      pages: row.pages ? parseInt(row.pages) : undefined,
      language: row.language || 'English',
      isbn: row.isbn || '',
      publishedDate: row.published_date ? row.published_date.toISOString().split('T')[0] : undefined,
    }));

    res.json({ success: true, data: books });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch books' });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM books WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const row = result.rows[0];
    const book = {
      id: row.id,
      title: row.title,
      author: row.author,
      description: row.description || '',
      price: parseFloat(row.price),
      originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
      coverImage: row.cover_image,
      category: row.category || 'Vasthu Shastra',
      rating: parseFloat(row.rating) || 0,
      reviewCount: parseInt(row.review_count) || 0,
      inStock: row.in_stock !== false,
      pages: row.pages ? parseInt(row.pages) : undefined,
      language: row.language || 'English',
      isbn: row.isbn || '',
      publishedDate: row.published_date ? row.published_date.toISOString().split('T')[0] : undefined,
    };

    res.json({ success: true, data: book });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch book' });
  }
});

// Create new book (admin only)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      price,
      originalPrice,
      coverImage,
      category,
      pages,
      language,
      isbn,
      publishedDate,
      rating,
      reviewCount,
    } = req.body;

    if (!title || !author || !price) {
      return res.status(400).json({ success: false, error: 'Title, author, and price are required' });
    }

    // Use placeholder image if no cover image provided
    const finalCoverImage = coverImage || 'https://via.placeholder.com/300x400?text=No+Cover+Image';

    const bookId = `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await query(`
      INSERT INTO books (
        id, title, author, description, price, original_price,
        cover_image, category, pages, language, isbn, published_date,
        rating, review_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      bookId,
      title,
      author,
      description || '',
      price,
      originalPrice || null,
      finalCoverImage,
      category || 'Vasthu Shastra',
      pages || null,
      language || 'English',
      isbn || '',
      publishedDate || null,
      rating ? parseFloat(rating) : 0,
      reviewCount ? parseInt(reviewCount) : 0,
    ]);

    // Fetch the created book
    const result = await query('SELECT * FROM books WHERE id = $1', [bookId]);
    const row = result.rows[0];

    const book = {
      id: row.id,
      title: row.title,
      author: row.author,
      description: row.description || '',
      price: parseFloat(row.price),
      originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
      coverImage: row.cover_image,
      category: row.category || 'Vasthu Shastra',
      rating: parseFloat(row.rating) || 0,
      reviewCount: parseInt(row.review_count) || 0,
      inStock: row.in_stock !== false,
      pages: row.pages ? parseInt(row.pages) : undefined,
      language: row.language || 'English',
      isbn: row.isbn || '',
      publishedDate: row.published_date ? row.published_date.toISOString().split('T')[0] : undefined,
    };

    res.json({ success: true, data: book, message: 'Book created successfully' });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ success: false, error: 'Failed to create book' });
  }
});

// Update book (admin only)
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      price,
      originalPrice,
      coverImage,
      category,
      pages,
      language,
      isbn,
      publishedDate,
      inStock,
      rating,
      reviewCount,
    } = req.body;

    await query(`
      UPDATE books
      SET 
        title = COALESCE($1, title),
        author = COALESCE($2, author),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        original_price = $5,
        cover_image = COALESCE($6, cover_image),
        category = COALESCE($7, category),
        pages = $8,
        language = COALESCE($9, language),
        isbn = COALESCE($10, isbn),
        published_date = $11,
        in_stock = COALESCE($12, in_stock),
        rating = COALESCE($13, rating),
        review_count = COALESCE($14, review_count),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
    `, [
      title,
      author,
      description,
      price,
      originalPrice || null,
      coverImage,
      category,
      pages || null,
      language,
      isbn,
      publishedDate || null,
      inStock,
      rating ? parseFloat(rating) : null,
      reviewCount ? parseInt(reviewCount) : null,
      req.params.id,
    ]);

    const result = await query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const row = result.rows[0];
    const book = {
      id: row.id,
      title: row.title,
      author: row.author,
      description: row.description || '',
      price: parseFloat(row.price),
      originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
      coverImage: row.cover_image,
      category: row.category || 'Vasthu Shastra',
      rating: parseFloat(row.rating) || 0,
      reviewCount: parseInt(row.review_count) || 0,
      inStock: row.in_stock !== false,
      pages: row.pages ? parseInt(row.pages) : undefined,
      language: row.language || 'English',
      isbn: row.isbn || '',
      publishedDate: row.published_date ? row.published_date.toISOString().split('T')[0] : undefined,
    };

    res.json({ success: true, data: book, message: 'Book updated successfully' });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ success: false, error: 'Failed to update book' });
  }
});

// Delete book (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM books WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ success: false, error: 'Failed to delete book' });
  }
});

export { router as booksRoutes };
