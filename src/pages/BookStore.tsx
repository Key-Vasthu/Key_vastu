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
} from 'lucide-react';
import { Button, Card, Badge, Loading } from '../components/common';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { booksApi } from '../utils/api';
import { formatCurrency, cn } from '../utils/helpers';
import type { Book } from '../types';

const BookStore: React.FC = () => {
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const categories = ['all', 'Vasthu Shastra', 'Astrology', 'Architecture', 'Remedial'];

  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);
      const response = await booksApi.getBooks();
      if (response.success && response.data) {
        setBooks(response.data);
        setFilteredBooks(response.data);
      }
      setIsLoading(false);
    };
    
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
                        <Button
                          variant={isAuthenticated && isInCart(book.id) ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleAddToCart(book)}
                          disabled={isAuthenticated && isInCart(book.id)}
                        >
                          <ShoppingCart size={16} />
                        </Button>
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
                        <Button
                          variant={isAuthenticated && isInCart(book.id) ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleAddToCart(book)}
                          disabled={isAuthenticated && isInCart(book.id)}
                          leftIcon={<ShoppingCart size={16} />}
                        >
                          {isAuthenticated && isInCart(book.id) ? 'In Cart' : 'Add to Cart'}
                        </Button>
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
    </div>
  );
};

export default BookStore;

