import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Grid,
  List,
  Star,
  ShoppingCart,
  BookOpen,
  ChevronDown,
  X,
  Plus,
  Edit,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button, Card, Badge, Loading, Modal, Input } from '../components/common';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { booksApi } from '../utils/api';
import { formatCurrency, cn } from '../utils/helpers';
import type { Book } from '../types';

const BookStore: React.FC = () => {
  const { addToCart, isInCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  
  // Admin book management state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDeletingBook, setIsDeletingBook] = useState(false);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    originalPrice: '',
    coverImage: '',
    category: 'Vasthu Shastra',
    pages: '',
    language: 'English',
    isbn: '',
    publishedDate: '',
    rating: '0',
    reviewCount: '0',
    inStock: true,
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');

  const categories = ['all', 'Vasthu Shastra', 'Astrology', 'Architecture', 'Remedial'];

  const loadBooks = async () => {
    setIsLoading(true);
    const response = await booksApi.getBooks();
    if (response.success && response.data) {
      setBooks(response.data);
      setFilteredBooks(response.data);
    } else {
      addNotification('error', 'Error', 'Failed to load books');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // Filter and sort books
  useEffect(() => {
    let result = books.filter(book => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!book.title.toLowerCase().includes(query) &&
            !book.author.toLowerCase().includes(query) &&
            !book.description.toLowerCase().includes(query)) {
          return false;
        }
      }
      // Category filter
      if (selectedCategory !== 'all' && book.category !== selectedCategory) {
        return false;
      }
      // Price range filter
      if (book.price < priceRange[0] || book.price > priceRange[1]) {
        return false;
      }
      return true;
    });

    // Sort
    const sortFunctions: Record<string, (a: Book, b: Book) => number> = {
      'price-low': (a, b) => a.price - b.price,
      'price-high': (a, b) => b.price - a.price,
      'rating': (a, b) => b.rating - a.rating,
      'newest': (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime(),
    };
    result.sort(sortFunctions[sortBy] || ((a, b) => b.reviewCount - a.reviewCount));

    setFilteredBooks(result);
  }, [books, searchQuery, selectedCategory, sortBy, priceRange]);

  const handleAddToCart = (book: Book) => {
    if (!isAuthenticated) {
      addNotification('warning', 'Login Required', 'Please login to add items to your cart.');
      navigate('/login');
      return;
    }
    addToCart(book);
    addNotification('success', 'Added to Cart', `"${book.title}" added to your cart.`);
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading books..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-earth-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-astral-700 to-astral-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge variant="gold" className="mb-4">
              <BookOpen size={14} className="mr-1.5" />
              Knowledge Library
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Explore Our Books
            </h1>
            <p className="text-xl text-earth-200 max-w-2xl mx-auto">
              Discover the wisdom of Vasthu Shastra and Astrology through our comprehensive collection
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Book Management Button */}
        {isAdmin && (
          <div className="mb-6 flex justify-end">
            <Button
              variant="primary"
              onClick={() => {
                setSelectedBook(null);
                setBookForm({
                  title: '',
                  author: '',
                  description: '',
                  price: '',
                  originalPrice: '',
                  coverImage: '',
                  category: 'Vasthu Shastra',
                  pages: '',
                  language: 'English',
                  isbn: '',
                  publishedDate: '',
                  rating: '0',
                  reviewCount: '0',
                  inStock: true,
                });
                setCoverImagePreview('');
                setCoverImageFile(null);
                setIsBookModalOpen(true);
              }}
            >
              <Plus size={18} className="mr-2" /> Add New Book
            </Button>
          </div>
        )}

        {/* Search and Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" size={20} />
            <input
              type="text"
              placeholder="Search books by title, author, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-earth-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 bg-white border border-earth-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 pointer-events-none" size={18} />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 bg-white border border-earth-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 pointer-events-none" size={18} />
          </div>

          {/* View mode toggle */}
          <div className="flex bg-white border border-earth-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-4 py-3 transition-colors',
                viewMode === 'grid' ? 'bg-saffron-500 text-white' : 'text-earth-600 hover:bg-earth-50'
              )}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-4 py-3 transition-colors',
                viewMode === 'list' ? 'bg-saffron-500 text-white' : 'text-earth-600 hover:bg-earth-50'
              )}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-earth-600">
            Showing <strong>{filteredBooks.length}</strong> of <strong>{books.length}</strong> books
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-saffron-600 hover:text-saffron-700 text-sm font-medium"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Books Grid/List */}
        {filteredBooks.length > 0 ? (
          <motion.div
            layout
            className={cn(
              'gap-6',
              viewMode === 'grid'
                ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'flex flex-col'
            )}
          >
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {viewMode === 'grid' ? (
                  // Grid View Card
                  <Card variant="default" padding="none" className="group overflow-hidden h-full flex flex-col">
                    <div className="block relative aspect-[3/4] overflow-hidden">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {book.originalPrice && (
                        <Badge variant="saffron" className="absolute top-3 left-3">
                          {Math.round((1 - book.price / book.originalPrice) * 100)}% OFF
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 p-4 flex flex-col">
                      <Badge variant="neutral" size="sm" className="self-start mb-2">
                        {book.category}
                      </Badge>
                      <h3 className="font-display font-semibold text-earth-800 group-hover:text-saffron-600 transition-colors line-clamp-2 mb-1">
                        {book.title}
                      </h3>
                      <p className="text-sm text-earth-500 mb-2">{book.author}</p>
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < Math.floor(book.rating) ? 'text-gold-500 fill-current' : 'text-earth-300'}
                          />
                        ))}
                        <span className="text-sm text-earth-500 ml-1">({book.reviewCount})</span>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-saffron-600">{formatCurrency(book.price)}</span>
                          {book.originalPrice && (
                            <span className="text-sm text-earth-400 line-through ml-2">
                              {formatCurrency(book.originalPrice)}
                            </span>
                          )}
                        </div>
                        {!isAdmin ? (
                          <Button
                            variant={isAuthenticated && isInCart(book.id) ? 'outline' : 'primary'}
                            size="sm"
                            onClick={() => handleAddToCart(book)}
                            disabled={isAuthenticated && isInCart(book.id)}
                          >
                            <ShoppingCart size={16} />
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenBookModal(book)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
                                  setIsDeletingBook(true);
                                  try {
                                    const response = await booksApi.deleteBook(book.id);
                                    if (response.success) {
                                      await loadBooks();
                                      addNotification('success', 'Book Deleted', `${book.title} has been removed.`);
                                    } else {
                                      addNotification('error', 'Error', response.error || 'Failed to delete book');
                                    }
                                  } catch (error) {
                                    console.error('Error deleting book:', error);
                                    addNotification('error', 'Error', 'Failed to delete book');
                                  }
                                  setIsDeletingBook(false);
                                }
                              }}
                              disabled={isDeletingBook}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ) : (
                  // List View Card
                  <Card className="flex flex-col sm:flex-row gap-6 group">
                    <div className="flex-shrink-0">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full sm:w-40 h-56 object-cover rounded-lg group-hover:shadow-lg transition-shadow"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Badge variant="neutral" size="sm" className="mb-2">
                            {book.category}
                          </Badge>
                          <h3 className="text-xl font-display font-semibold text-earth-800 group-hover:text-saffron-600 transition-colors mb-1">
                            {book.title}
                          </h3>
                          <p className="text-earth-500 mb-2">by {book.author}</p>
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < Math.floor(book.rating) ? 'text-gold-500 fill-current' : 'text-earth-300'}
                              />
                            ))}
                            <span className="text-sm text-earth-500 ml-1">{book.rating} ({book.reviewCount} reviews)</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-saffron-600">{formatCurrency(book.price)}</span>
                          {book.originalPrice && (
                            <p className="text-sm text-earth-400 line-through">{formatCurrency(book.originalPrice)}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-earth-600 line-clamp-2 mb-4">{book.description}</p>
                      <div className="flex items-center gap-3">
                        {!isAdmin && (
                          <Button
                            variant={isAuthenticated && isInCart(book.id) ? 'outline' : 'primary'}
                            size="sm"
                            onClick={() => handleAddToCart(book)}
                            disabled={isAuthenticated && isInCart(book.id)}
                            leftIcon={<ShoppingCart size={16} />}
                            className="flex-1"
                          >
                            {isAuthenticated && isInCart(book.id) ? 'In Cart' : 'Add to Cart'}
                          </Button>
                        )}
                        {isAdmin && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenBookModal(book)}
                              className="flex-1"
                            >
                              <Edit size={14} className="mr-1" /> Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
                                  setIsDeletingBook(true);
                                  try {
                                    const response = await booksApi.deleteBook(book.id);
                                    if (response.success) {
                                      await loadBooks();
                                      addNotification('success', 'Book Deleted', `${book.title} has been removed.`);
                                    } else {
                                      addNotification('error', 'Error', response.error || 'Failed to delete book');
                                    }
                                  } catch (error) {
                                    console.error('Error deleting book:', error);
                                    addNotification('error', 'Error', 'Failed to delete book');
                                  }
                                  setIsDeletingBook(false);
                                }
                              }}
                              disabled={isDeletingBook}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-earth-300 mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold text-earth-700 mb-2">
              No books found
            </h3>
            <p className="text-earth-500 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceRange([0, 1000]);
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {/* Book Management Modal for Admin */}
      {isAdmin && (
        <Modal
          isOpen={isBookModalOpen}
          onClose={() => {
            setIsBookModalOpen(false);
            setSelectedBook(null);
            setCoverImageFile(null);
            setCoverImagePreview('');
          }}
          title={selectedBook ? 'Edit Book' : 'Add New Book'}
          size="lg"
        >
          <form onSubmit={handleSaveBook} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Title *</label>
                <Input
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  placeholder="Book title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Author *</label>
                <Input
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  placeholder="Author name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">Description</label>
              <textarea
                value={bookForm.description}
                onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                placeholder="Book description"
                rows={3}
                className="w-full px-4 py-2 border border-earth-200 rounded-lg focus:border-saffron-500 focus:ring-0 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Price (₹) *</label>
                <Input
                  type="number"
                  value={bookForm.price}
                  onChange={(e) => setBookForm({ ...bookForm, price: e.target.value })}
                  placeholder="599"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Original Price (₹)</label>
                <Input
                  type="number"
                  value={bookForm.originalPrice}
                  onChange={(e) => setBookForm({ ...bookForm, originalPrice: e.target.value })}
                  placeholder="799"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Category</label>
                <select
                  value={bookForm.category}
                  onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-earth-200 rounded-lg focus:border-saffron-500 focus:ring-0 focus:outline-none"
                >
                  <option value="Vasthu Shastra">Vasthu Shastra</option>
                  <option value="Astrology">Astrology</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Remedial">Remedial</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Pages</label>
                <Input
                  type="number"
                  value={bookForm.pages}
                  onChange={(e) => setBookForm({ ...bookForm, pages: e.target.value })}
                  placeholder="320"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Language</label>
                <Input
                  value={bookForm.language}
                  onChange={(e) => setBookForm({ ...bookForm, language: e.target.value })}
                  placeholder="English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Rating</label>
                <Input
                  type="number"
                  value={bookForm.rating}
                  onChange={(e) => setBookForm({ ...bookForm, rating: e.target.value })}
                  placeholder="4.5"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Review Count</label>
                <Input
                  type="number"
                  value={bookForm.reviewCount}
                  onChange={(e) => setBookForm({ ...bookForm, reviewCount: e.target.value })}
                  placeholder="100"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">ISBN</label>
                <Input
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                  placeholder="978-1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Published Date</label>
                <Input
                  type="date"
                  value={bookForm.publishedDate}
                  onChange={(e) => setBookForm({ ...bookForm, publishedDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">Cover Image</label>
              <div className="space-y-2">
                {coverImagePreview && (
                  <div className="relative w-32 h-48 border border-earth-200 rounded-lg overflow-hidden">
                    <img src={coverImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImagePreview('');
                        setCoverImageFile(null);
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="px-4 py-2 border border-earth-200 rounded-lg hover:bg-earth-50 text-center text-sm text-earth-600">
                      <Upload size={16} className="inline mr-2" />
                      Upload Image
                    </div>
                  </label>
                  <Input
                    value={bookForm.coverImage}
                    onChange={(e) => {
                      setBookForm({ ...bookForm, coverImage: e.target.value });
                      setCoverImagePreview(e.target.value);
                    }}
                    placeholder="Or enter image URL"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="inStock"
                checked={bookForm.inStock}
                onChange={(e) => setBookForm({ ...bookForm, inStock: e.target.checked })}
                className="w-4 h-4 text-saffron-500 border-earth-300 rounded focus:ring-saffron-500"
              />
              <label htmlFor="inStock" className="text-sm text-earth-700">In Stock</label>
            </div>

            <div className="flex gap-2 pt-4 border-t border-earth-200">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                {selectedBook ? 'Update Book' : 'Create Book'}
              </Button>
              {selectedBook && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDeleteBook}
                  disabled={isDeletingBook}
                >
                  {isDeletingBook ? <Loading text="" /> : <Trash2 size={18} />}
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsBookModalOpen(false);
                  setSelectedBook(null);
                  setCoverImageFile(null);
                  setCoverImagePreview('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BookStore;

