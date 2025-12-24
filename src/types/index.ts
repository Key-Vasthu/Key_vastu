// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'guest';
  phone?: string;
  createdAt: string;
  lastLogin?: string;
}

// Authentication types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

// Chat types
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachments?: Attachment[];
  audioUrl?: string;
}

export interface ChatThread {
  id: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

// File/Attachment types
export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'drawing';
  url: string;
  size: number;
  uploadedAt: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  url?: string;
  uploadedAt: string;
}

// File Management types
export interface ManagedFile {
  id: string;
  name: string;
  type: 'image' | 'document' | 'drawing' | 'other';
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
  category?: string;
  metadata?: {
    width?: number;
    height?: number;
    pages?: number;
    duration?: number;
  };
  shareable?: boolean;
  shareToken?: string;
}

export interface FileCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

// Book types
export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  originalPrice?: number;
  coverImage: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  pages: number;
  language: string;
  isbn: string;
  publishedDate: string;
  samplePages?: string[];
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
  shippingAddress: Address;
}

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

// Dashboard widget types
export interface DashboardStats {
  totalUsers: number;
  activeChats: number;
  pendingReviews: number;
  totalOrders: number;
  revenue: number;
  newUsersThisMonth: number;
}

export interface Activity {
  id: string;
  type: 'message' | 'upload' | 'order' | 'review';
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

// Drawing types
export interface DrawingData {
  id: string;
  name: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  canvasData: string;
}

// Consultant/About types
export interface Consultant {
  name: string;
  title: string;
  bio: string;
  image: string;
  expertise: string[];
  experience: number;
  projectsCompleted: number;
  books: Book[];
  certifications: string[];
  socialLinks: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar?: string;
  content: string;
  rating: number;
  projectType: string;
  date: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  location: string;
  completedDate: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

