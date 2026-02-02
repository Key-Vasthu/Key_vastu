import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  MessageCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  AlertCircle,
  ShoppingBag,
  UserCheck,
  Phone,
  MapPin,
  Send,
  Plus,
  Upload,
  X,
} from 'lucide-react';
import { Button, Card, Badge, Avatar, Input, Loading, Modal } from '../components/common';
import { adminApi, booksApi } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';
import { formatDate, formatCurrency } from '../utils/helpers';
import type { User, Order, ChatMessage, Book } from '../types';

// Stats Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color }) => (
  <Card className="relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-10 rounded-full -mr-8 -mt-8`} />
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {change && (
          <Badge variant={change.startsWith('+') ? 'success' : 'error'} size="sm">
            <TrendingUp size={12} className="mr-1" />
            {change}
          </Badge>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-earth-800">{value}</p>
      <p className="text-sm text-earth-500">{title}</p>
    </div>
  </Card>
);

interface ChatThread {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
  unreadCount: number;
  isOnline: boolean;
  updatedAt: string;
}

interface MemberWithOrders {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

const AdminDashboard: React.FC = () => {
  const { addNotification } = useNotification();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [membersWithOrders, setMembersWithOrders] = useState<MemberWithOrders[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [threadMessages, setThreadMessages] = useState<ChatMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  // Book management state
  const [books, setBooks] = useState<Book[]>([]);
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
    inStock: true,
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, usersRes, ordersRes, threadsRes, membersRes, booksRes] = await Promise.all([
          adminApi.getStats(),
        adminApi.getUsers(),
          adminApi.getOrders(),
          adminApi.getChatThreads(),
          adminApi.getMembersWithOrders(),
          booksApi.getBooks(),
      ]);
      
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (usersRes.success && usersRes.data) setUsers(usersRes.data);
        if (ordersRes.success && ordersRes.data) setOrders(ordersRes.data);
        if (threadsRes.success && threadsRes.data) setChatThreads(threadsRes.data);
        if (membersRes.success && membersRes.data) setMembersWithOrders(membersRes.data);
        if (booksRes.success && booksRes.data) setBooks(booksRes.data);
      } catch (error) {
        console.error('Error loading admin data:', error);
        addNotification('error', 'Loading Error', 'Failed to load admin panel data.');
      }
      setIsLoading(false);
    };
    
    loadData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [addNotification]);

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    const result = await adminApi.deleteUser(selectedUser.id);
    if (result.success) {
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      addNotification('success', 'User Deleted', `${selectedUser.name} has been removed.`);
    }
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const loadThreadMessages = async (threadId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await adminApi.getThreadMessages(threadId);
      if (response.success && response.data) {
        setThreadMessages(response.data);
        // Scroll to bottom after messages load
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      addNotification('error', 'Error', 'Failed to load messages.');
    }
    setIsLoadingMessages(false);
  };

  // Auto-refresh messages when chat modal is open
  useEffect(() => {
    if (isChatModalOpen && selectedThread) {
      loadThreadMessages(selectedThread.id);
      const interval = setInterval(() => {
        loadThreadMessages(selectedThread.id);
      }, 3000); // Refresh every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isChatModalOpen, selectedThread?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (threadMessages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [threadMessages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedThread || isSendingReply) return;

    setIsSendingReply(true);
    try {
      const response = await adminApi.sendAdminMessage(selectedThread.id, replyMessage);
      if (response.success && response.data) {
        setThreadMessages(prev => [...prev, response.data!]);
        setReplyMessage('');
        addNotification('success', 'Message Sent', 'Your reply has been sent to the client.');
        
        // Refresh chat threads to update last message
        const threadsRes = await adminApi.getChatThreads();
        if (threadsRes.success && threadsRes.data) {
          setChatThreads(threadsRes.data);
        }
      } else {
        addNotification('error', 'Error', response.error || 'Failed to send message.');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      addNotification('error', 'Error', 'Failed to send message.');
    }
    setIsSendingReply(false);
  };

  // Book management functions
  const handleOpenBookModal = (book?: Book) => {
    if (book) {
      setSelectedBook(book);
      setBookForm({
        title: book.title,
        author: book.author,
        description: book.description || '',
        price: book.price.toString(),
        originalPrice: book.originalPrice?.toString() || '',
        coverImage: book.coverImage,
        category: book.category,
        pages: book.pages?.toString() || '',
        language: book.language,
        isbn: book.isbn || '',
        publishedDate: book.publishedDate || '',
        inStock: book.inStock,
      });
      setCoverImagePreview(book.coverImage);
    } else {
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
        inStock: true,
      });
      setCoverImagePreview('');
      setCoverImageFile(null);
    }
    setIsBookModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addNotification('error', 'File Too Large', 'Image must be less than 5MB');
        return;
      }
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async (): Promise<string> => {
    if (!coverImageFile) return bookForm.coverImage;

    try {
      const formData = new FormData();
      formData.append('file', coverImageFile);
      formData.append('folder', 'books');

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.data?.url) {
        return data.data.url;
      }
      throw new Error(data.error || 'Upload failed');
    } catch (error) {
      console.error('Image upload error:', error);
      addNotification('error', 'Upload Failed', 'Failed to upload book cover image. Using URL instead.');
      return bookForm.coverImage;
    }
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookForm.title || !bookForm.author || !bookForm.price) {
      addNotification('error', 'Validation Error', 'Please fill in all required fields (Title, Author, Price)');
      return;
    }

    try {
      let coverImageUrl = bookForm.coverImage || '';
      
      // Upload image if file is selected
      if (coverImageFile) {
        try {
          coverImageUrl = await handleUploadImage();
        } catch (error) {
          console.error('Image upload failed, continuing without image:', error);
          // Continue with empty string, backend will use placeholder
        }
      }

      // Validate price is a valid number
      const priceValue = parseFloat(bookForm.price);
      if (isNaN(priceValue) || priceValue <= 0) {
        addNotification('error', 'Validation Error', 'Please enter a valid price (greater than 0)');
        return;
      }

      const bookData = {
        title: bookForm.title.trim(),
        author: bookForm.author.trim(),
        description: bookForm.description.trim(),
        price: priceValue,
        originalPrice: bookForm.originalPrice ? parseFloat(bookForm.originalPrice) : undefined,
        coverImage: coverImageUrl, // Can be empty, backend will use placeholder
        category: bookForm.category || 'Vasthu Shastra',
        pages: bookForm.pages ? parseInt(bookForm.pages) : undefined,
        language: bookForm.language || 'English',
        isbn: bookForm.isbn.trim(),
        publishedDate: bookForm.publishedDate || undefined,
        inStock: bookForm.inStock,
      };

      let response;
      if (selectedBook) {
        response = await booksApi.updateBook(selectedBook.id, bookData);
      } else {
        response = await booksApi.createBook(bookData);
      }

      if (response.success) {
        addNotification('success', 'Success', selectedBook ? 'Book updated successfully' : 'Book created successfully');
        setIsBookModalOpen(false);
        
        // Reload books
        const booksRes = await booksApi.getBooks();
        if (booksRes.success && booksRes.data) {
          setBooks(booksRes.data);
        }
      } else {
        addNotification('error', 'Error', response.error || 'Failed to save book');
      }
    } catch (error) {
      console.error('Error saving book:', error);
      addNotification('error', 'Error', 'Failed to save book');
    }
  };

  const handleDeleteBook = async () => {
    if (!selectedBook) return;

    setIsDeletingBook(true);
    try {
      const response = await booksApi.deleteBook(selectedBook.id);
      if (response.success) {
        setBooks(prev => prev.filter(b => b.id !== selectedBook.id));
        addNotification('success', 'Book Deleted', `${selectedBook.title} has been removed.`);
        setIsBookModalOpen(false);
        setSelectedBook(null);
      } else {
        addNotification('error', 'Error', response.error || 'Failed to delete book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      addNotification('error', 'Error', 'Failed to delete book');
    }
    setIsDeletingBook(false);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <Loading fullScreen text="Loading admin panel..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-earth-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-astral-500">Admin Panel</h1>
          <p className="text-earth-500 mt-1">Manage users, orders, books, and client communications</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            color="bg-saffron-500"
          />
          <StatCard
            title="Active Chats"
            value={stats?.activeChats || 0}
            icon={MessageCircle}
            color="bg-astral-500"
          />
          <StatCard
            title="Chatting Members"
            value={stats?.chattingMembers || 0}
            icon={UserCheck}
            color="bg-gold-500"
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={ShoppingBag}
            color="bg-green-500"
          />
        </motion.div>

        {/* Second Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          <StatCard
            title="Members with Orders"
            value={stats?.membersWithOrders || 0}
            icon={BookOpen}
            color="bg-purple-500"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.revenue || 0)}
            icon={DollarSign}
            color="bg-green-500"
          />
          <StatCard
            title="Pending Reviews"
            value={stats?.pendingReviews || 0}
            icon={FileText}
            color="bg-gold-500"
          />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Active Chat Threads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-semibold text-astral-500 flex items-center gap-2">
                  <MessageCircle className="text-saffron-500" />
                  Client Communications
                </h2>
                <Link to="/chat">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>

              <div className="space-y-3">
                {chatThreads.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-earth-300 mx-auto mb-3" />
                    <p className="text-earth-500">No active conversations</p>
                  </div>
                ) : (
                  chatThreads.slice(0, 5).map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() => {
                        setSelectedThread(thread);
                        setIsChatModalOpen(true);
                        loadThreadMessages(thread.id);
                      }}
                      className="flex items-center gap-4 p-4 bg-earth-50 rounded-xl hover:bg-earth-100 transition-colors cursor-pointer"
                    >
                      <Avatar
                        src={thread.clientAvatar}
                        name={thread.clientName}
                        showOnlineStatus
                        isOnline={thread.isOnline}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-earth-800 truncate">{thread.clientName}</h3>
                          {thread.unreadCount > 0 && (
                            <Badge variant="saffron" size="sm">{thread.unreadCount} new</Badge>
                          )}
                        </div>
                        <p className="text-sm text-earth-500 truncate">{thread.lastMessage || 'No messages yet'}</p>
                        <p className="text-xs text-earth-400 mt-1">
                          {thread.messageCount} messages • {formatDate(thread.updatedAt, 'relative')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>

          {/* Members with Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-semibold text-astral-500 flex items-center gap-2">
                  <ShoppingBag className="text-saffron-500" />
                  Members with Orders
                </h2>
                <Badge variant="gold" size="sm">{membersWithOrders.length} members</Badge>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {membersWithOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-earth-300 mx-auto mb-3" />
                    <p className="text-earth-500">No members have placed orders yet</p>
                  </div>
                ) : (
                  membersWithOrders.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 bg-earth-50 rounded-xl">
                      <Avatar src={member.avatar} name={member.name} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-earth-800 truncate">{member.name}</h3>
                        <p className="text-sm text-earth-500 truncate">{member.email}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-earth-600">
                            {member.orderCount} {member.orderCount === 1 ? 'order' : 'orders'}
                          </span>
                          <span className="text-xs font-semibold text-saffron-600">
                            {formatCurrency(member.totalSpent)} spent
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-earth-500">Last order</p>
                        <p className="text-xs text-earth-600">{formatDate(member.lastOrderDate, 'relative')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-semibold text-astral-500 flex items-center gap-2">
                <BookOpen className="text-saffron-500" />
                All Orders ({orders.length})
              </h2>
              <Button variant="ghost" size="sm">
                <Download size={16} className="mr-1" /> Export
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-earth-500 border-b border-earth-100">
                    <th className="pb-3 font-medium">Order ID</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Items</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-earth-500">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="border-b border-earth-50 hover:bg-earth-50/50">
                        <td className="py-4">
                          <span className="text-sm font-mono text-earth-500">#{order.id.split('-')[1]}</span>
                        </td>
                        <td className="py-4">
                          <div>
                            <p className="font-medium text-earth-800">
                              {(order as any).user?.name || 'Unknown User'}
                            </p>
                            <p className="text-sm text-earth-500">
                              {(order as any).user?.email || 'No email'}
                            </p>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="space-y-1">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <p key={idx} className="text-sm text-earth-700">
                                {item.book.title} × {item.quantity}
                              </p>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-xs text-earth-500">+{order.items.length - 2} more</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <p className="font-semibold text-saffron-600">{formatCurrency(order.totalAmount)}</p>
                        </td>
                        <td className="py-4">
                          <Badge
                            variant={
                              order.status === 'delivered' ? 'success' :
                              order.status === 'shipped' ? 'astral' :
                              order.status === 'confirmed' ? 'gold' : 'warning'
                            }
                            size="sm"
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm text-earth-500">
                          {formatDate(order.orderDate, 'short')}
                        </td>
                        <td className="py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsOrderModalOpen(true);
                            }}
                          >
                            <Eye size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Book Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-semibold text-astral-500 flex items-center gap-2">
                <BookOpen className="text-saffron-500" />
                Book Management ({books.length})
              </h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenBookModal()}
              >
                <Plus size={16} className="mr-1" /> Add Book
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="w-16 h-16 text-earth-300 mx-auto mb-4" />
                  <p className="text-earth-500 mb-4">No books found</p>
                  <Button variant="primary" onClick={() => handleOpenBookModal()}>
                    <Plus size={16} className="mr-2" /> Add First Book
                  </Button>
                </div>
              ) : (
                books.map((book) => (
                  <div
                    key={book.id}
                    className="border border-earth-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white"
                  >
                    <div className="relative h-48 bg-earth-100">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=No+Image';
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={book.inStock ? 'success' : 'error'} size="sm">
                          {book.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-earth-800 mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-sm text-earth-500 mb-2">{book.author}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-saffron-600">
                          ₹{book.price}
                        </span>
                        {book.originalPrice && (
                          <span className="text-sm text-earth-400 line-through">
                            ₹{book.originalPrice}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleOpenBookModal(book)}
                        >
                          <Edit size={14} className="mr-1" /> Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={async () => {
                            setSelectedBook(book);
                            setIsDeletingBook(true);
                            try {
                              const response = await booksApi.deleteBook(book.id);
                              if (response.success) {
                                setBooks(prev => prev.filter(b => b.id !== book.id));
                                addNotification('success', 'Book Deleted', `${book.title} has been removed.`);
                              } else {
                                addNotification('error', 'Error', response.error || 'Failed to delete book');
                              }
                            } catch (error) {
                              console.error('Error deleting book:', error);
                              addNotification('error', 'Error', 'Failed to delete book');
                            }
                            setIsDeletingBook(false);
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* User Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          >
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-display font-semibold text-astral-500 flex items-center gap-2">
                  <Users className="text-saffron-500" />
                User Management ({users.length})
                </h2>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-earth-200 rounded-lg focus:border-gold-500 focus:ring-0"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter size={16} />
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-earth-500 border-b border-earth-100">
                      <th className="pb-3 font-medium">User</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Last Login</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-earth-50 hover:bg-earth-50/50">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={user.avatar} name={user.name} />
                            <div>
                              <p className="font-medium text-earth-800">{user.name}</p>
                              <p className="text-sm text-earth-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge
                            variant={user.role === 'admin' ? 'gold' : 'neutral'}
                            size="sm"
                            className="capitalize"
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm text-earth-500">
                          {user.lastLogin ? formatDate(user.lastLogin, 'relative') : 'Never'}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setSelectedUser(user); setIsEditModalOpen(true); }}
                              className="p-2 text-earth-400 hover:text-astral-500 hover:bg-astral-50 rounded-lg transition-colors"
                              aria-label="Edit user"
                            >
                              <Edit size={16} />
                            </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => { setSelectedUser(user); setIsDeleteModalOpen(true); }}
                              className="p-2 text-earth-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

        {/* Order Detail Modal */}
        <Modal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          title="Order Details"
          size="lg"
        >
          {selectedOrder && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-earth-500 mb-1">Order ID</p>
                  <p className="font-mono text-earth-800">#{selectedOrder.id.split('-')[1]}</p>
                    </div>
                <div>
                  <p className="text-sm text-earth-500 mb-1">Status</p>
                  <Badge
                    variant={
                      selectedOrder.status === 'delivered' ? 'success' :
                      selectedOrder.status === 'shipped' ? 'astral' :
                      selectedOrder.status === 'confirmed' ? 'gold' : 'warning'
                    }
                  >
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                    </div>
                <div>
                  <p className="text-sm text-earth-500 mb-1">Order Date</p>
                  <p className="text-earth-800">{formatDate(selectedOrder.orderDate, 'long')}</p>
                    </div>
                <div>
                  <p className="text-sm text-earth-500 mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-saffron-600">{formatCurrency(selectedOrder.totalAmount)}</p>
                  </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-earth-700 mb-3">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-earth-50 rounded-lg">
                      <div>
                        <p className="font-medium text-earth-800">{item.book.title}</p>
                        <p className="text-sm text-earth-500">Quantity: {item.quantity}</p>
              </div>
                      <p className="font-semibold text-earth-700">{formatCurrency(item.book.price * item.quantity)}</p>
                      </div>
                ))}
                    </div>
                  </div>

              <div>
                <p className="text-sm font-semibold text-earth-700 mb-3 flex items-center gap-2">
                  <MapPin size={16} />
                  Shipping Address
                </p>
                <div className="p-4 bg-earth-50 rounded-lg">
                  <p className="font-medium text-earth-800">{selectedOrder.shippingAddress.name}</p>
                  <p className="text-sm text-earth-600">{selectedOrder.shippingAddress.line1}</p>
                  {selectedOrder.shippingAddress.line2 && (
                    <p className="text-sm text-earth-600">{selectedOrder.shippingAddress.line2}</p>
                  )}
                  <p className="text-sm text-earth-600">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                  </p>
                  <p className="text-sm text-earth-600 mt-2 flex items-center gap-1">
                    <Phone size={14} />
                    {selectedOrder.shippingAddress.phone}
                  </p>
              </div>
        </div>
        </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete User"
          size="sm"
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <div>
                <p className="font-medium text-earth-800">Are you sure?</p>
                <p className="text-sm text-earth-500">
                  This will permanently delete <strong>{selectedUser?.name}</strong>'s account.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteUser}>
                Delete User
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit User"
        >
          <div className="p-6">
            <div className="space-y-4">
              <Input
                label="Name"
                defaultValue={selectedUser?.name}
              />
              <Input
                label="Email"
                type="email"
                defaultValue={selectedUser?.email}
              />
              <div>
                <label className="input-label">Role</label>
                <select className="input-field" title="User role">
                  <option value="user" selected={selectedUser?.role === 'user'}>User</option>
                  <option value="admin" selected={selectedUser?.role === 'admin'}>Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => {
                addNotification('success', 'User Updated', 'Changes saved successfully.');
                setIsEditModalOpen(false);
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>

        {/* Chat Modal - Admin Reply */}
        <Modal
          isOpen={isChatModalOpen}
          onClose={() => {
            setIsChatModalOpen(false);
            setSelectedThread(null);
            setThreadMessages([]);
            setReplyMessage('');
          }}
          title={selectedThread ? `Chat with ${selectedThread.clientName}` : 'Chat'}
          size="lg"
        >
          {selectedThread && (
            <div className="flex flex-col h-[600px]">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-earth-50">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loading text="Loading messages..." />
                  </div>
                ) : threadMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-earth-300 mx-auto mb-3" />
                    <p className="text-earth-500">No messages yet</p>
                  </div>
                ) : (
                  threadMessages.map((message) => {
                    const isAdmin = message.senderId === 'maintainer-001';
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar
                          src={message.senderAvatar}
                          name={message.senderName}
                          size="sm"
                        />
                        <div className={`flex-1 ${isAdmin ? 'text-right' : ''}`}>
                          <div className={`inline-block p-3 rounded-2xl ${
                            isAdmin
                              ? 'bg-saffron-500 text-white'
                              : 'bg-white text-earth-800 border border-earth-200'
                          }`}>
                            <p className="text-sm font-medium mb-1">{message.senderName}</p>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((att) => (
                                  <div key={att.id} className="text-xs opacity-80">
                                    📎 {att.name}
                                  </div>
                                ))}
                              </div>
                            )}
                            {message.audioUrl && (
                              <div className="mt-2">
                                <audio controls className="w-full max-w-xs">
                                  <source src={message.audioUrl} type="audio/webm" />
                                </audio>
                              </div>
                            )}
                          </div>
                          <p className={`text-xs text-earth-400 mt-1 ${isAdmin ? 'text-right' : ''}`}>
                            {formatDate(message.timestamp, 'short')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              <div className="border-t border-earth-200 p-4 bg-white">
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-2 border border-earth-200 rounded-lg focus:border-saffron-500 focus:ring-0 focus:outline-none"
                    disabled={isSendingReply}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!replyMessage.trim() || isSendingReply}
                  >
                    {isSendingReply ? (
                      <Loading text="" />
                    ) : (
                      <Send size={18} />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </Modal>

        {/* Book Management Modal */}
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

            <div className="grid grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium text-earth-700 mb-1">ISBN</label>
                <Input
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                  placeholder="978-1234567890"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">Published Date</label>
              <Input
                type="date"
                value={bookForm.publishedDate}
                onChange={(e) => setBookForm({ ...bookForm, publishedDate: e.target.value })}
              />
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
      </div>
    </div>
  );
};

export default AdminDashboard;
