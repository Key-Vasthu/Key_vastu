/**
 * API Utility Functions
 * These are stub functions that simulate API calls.
 * Replace with actual API endpoints when backend is ready.
 */

import type { ApiResponse, User, ChatThread, ChatMessage, Book, Order, DashboardStats, Activity, ManagedFile, FileCategory, CartItem, Address } from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Random delay between min and max milliseconds
const randomDelay = (min = 300, max = 1500) => delay(Math.random() * (max - min) + min);

// Simulate occasional errors (10% chance)
const maybeError = () => Math.random() < 0.1;

// API base URL - supports both relative and absolute URLs
// In production, set VITE_API_URL to your backend server URL (e.g., https://your-backend.onrender.com/api)
// If not set, tries to use relative URL for same-domain deployments
const getApiBaseUrl = () => {
  // If explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:3001/api';
  }
  
  // In production, try relative URL first (for same-domain deployments)
  // If backend is on same domain, use relative path
  // Otherwise, this will need VITE_API_URL to be set
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Authentication API - Real backend integration
 */
export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      // Always use full URL to avoid relative path issues
      const baseUrl = API_BASE_URL.startsWith('http') 
        ? API_BASE_URL 
        : `${window.location.protocol}//${window.location.host}${API_BASE_URL}`;
      
      const url = `${baseUrl}/auth/login`;
      console.log('Logging in to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from login:', text.substring(0, 200));
        return {
          success: false,
          error: `Server returned invalid response. Please check that the backend server is running and the API endpoint is correct. (Status: ${response.status})`,
        };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Login failed. Please try again.',
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.',
      };
    }
  },

  async register(email: string, password: string, name: string, phone?: string): Promise<ApiResponse<{ user: User }>> {
    try {
      // Always use full URL to avoid relative path issues
      const baseUrl = API_BASE_URL.startsWith('http') 
        ? API_BASE_URL 
        : `${window.location.protocol}//${window.location.host}${API_BASE_URL}`;
      
      const url = `${baseUrl}/auth/register`;
      console.log('Registering to:', url);
      console.log('API_BASE_URL:', API_BASE_URL);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, phone }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from register:', {
          status: response.status,
          contentType,
          url: response.url,
          preview: text.substring(0, 500)
        });
        
        // Try to parse as JSON anyway (in case Content-Type is wrong)
        try {
          const jsonData = JSON.parse(text);
          // If it parsed successfully, use it
          if (jsonData.success !== undefined) {
            return {
              success: jsonData.success,
              error: jsonData.error,
              data: jsonData.data,
            };
          }
        } catch (e) {
          // Not JSON, return error
        }
        
        return {
          success: false,
          error: `Server returned invalid response (HTML instead of JSON). Status: ${response.status}. Please check that the backend server is running on port 3001 and the route /api/auth/register exists.`,
        };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Registration failed. Please try again.',
        };
      }

      return {
        success: true,
        data: data.data,
        message: data.message || 'Registration successful!',
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Attempted API URL:', `${API_BASE_URL}/auth/register`);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const errorMsg = API_BASE_URL.includes('localhost') 
          ? 'Cannot connect to server. Make sure the backend server is running on port 3001. Run: npm run server'
          : `Cannot connect to server at ${API_BASE_URL}. Please ensure the backend server is running and VITE_API_URL is configured correctly.`;
        
        return {
          success: false,
          error: errorMsg,
        };
      }
      
      return {
        success: false,
        error: error.message || 'Network error. Please check your connection and try again.',
      };
    }
  },

  async verifyEmail(_token: string): Promise<ApiResponse<void>> {
    await randomDelay();
    return { success: true, message: 'Email verified successfully!' };
  },

  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return { success: data.success || true };
    } catch (error) {
      // Even if request fails, logout should succeed (client-side cleanup)
      return { success: true };
    }
  },

  async forgotPassword(_email: string): Promise<ApiResponse<void>> {
    await randomDelay();
    return { success: true, message: 'Password reset link sent to your email.' };
  },

  async resetPassword(_token: string, _newPassword: string): Promise<ApiResponse<void>> {
    await randomDelay();
    if (maybeError()) {
      return { success: false, error: 'Invalid or expired reset token.' };
    }
    return { success: true, message: 'Password reset successfully.' };
  },

  async updateProfile(name: string, email: string, phone: string, avatar?: string): Promise<ApiResponse<User>> {
    await randomDelay();
    if (maybeError()) {
      return { success: false, error: 'Failed to update profile. Please try again.' };
    }
    
    // Get existing user data from localStorage to preserve avatar
    const userData = localStorage.getItem('keyvasthu_user');
    let existingAvatar = avatar;
    if (userData) {
      const existingUser = JSON.parse(userData);
      existingAvatar = existingAvatar || existingUser.avatar;
    }
    
    const user: User = {
      id: 'user-1',
      email,
      name,
      phone,
      avatar: existingAvatar,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    
    // Update localStorage
    localStorage.setItem('keyvasthu_user', JSON.stringify(user));
    
    return { success: true, data: user };
  },

  async changePassword(_currentPassword: string, _newPassword: string): Promise<ApiResponse<void>> {
    await randomDelay();
    if (maybeError()) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    return { success: true, message: 'Password changed successfully.' };
  },

  async uploadProfileImage(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<{ avatarUrl: string }>> {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await delay(200);
      onProgress?.(i);
    }
    
    if (maybeError()) {
      return { success: false, error: 'Failed to upload image. Please try again.' };
    }
    
    // Convert file to base64 data URL for persistence
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const avatarUrl = reader.result as string;
        
        // Store in localStorage for persistence
        const userData = localStorage.getItem('keyvasthu_user');
        if (userData) {
          const user = JSON.parse(userData);
          user.avatar = avatarUrl;
          localStorage.setItem('keyvasthu_user', JSON.stringify(user));
        }
        
        resolve({
          success: true,
          data: { avatarUrl },
          message: 'Profile image uploaded successfully!',
        });
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read image file.' });
      };
      reader.readAsDataURL(file);
    });
  },
};

/**
 * Chat API - Connected to Neon Database
 */
export const chatApi = {
  async getMaintainerThread(): Promise<ApiResponse<ChatThread>> {
    try {
      // Get current user from localStorage
      const userData = localStorage.getItem('keyvasthu_user');
      const user = userData ? JSON.parse(userData) : { id: 'user-1', name: 'User', email: '', avatar: undefined };

      const response = await fetch(
        `${API_BASE_URL}/chat/maintainer-thread?userId=${user.id}&userName=${encodeURIComponent(user.name || 'User')}&userEmail=${encodeURIComponent(user.email || '')}${user.avatar ? `&userAvatar=${encodeURIComponent(user.avatar)}` : ''}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
            'x-user-name': user.name || 'User',
            'x-user-email': user.email || '',
            ...(user.avatar && { 'x-user-avatar': user.avatar }),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching maintainer thread:', error);
      return {
        success: false,
        error: 'Failed to get maintainer thread',
      };
    }
  },

  async getThreads(): Promise<ApiResponse<ChatThread[]>> {
    try {
      // Get current user from localStorage
      const userData = localStorage.getItem('keyvasthu_user');
      const user = userData ? JSON.parse(userData) : { id: 'user-1', name: 'User', email: '', avatar: undefined };

      const response = await fetch(
        `${API_BASE_URL}/chat/threads?userId=${user.id}${user.name ? `&userName=${encodeURIComponent(user.name)}` : ''}${user.email ? `&userEmail=${encodeURIComponent(user.email)}` : ''}${user.avatar ? `&userAvatar=${encodeURIComponent(user.avatar)}` : ''}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
            ...(user.name && { 'x-user-name': user.name }),
            ...(user.email && { 'x-user-email': user.email }),
            ...(user.avatar && { 'x-user-avatar': user.avatar }),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching threads:', error);
      // Fallback to empty array if backend is not available
      return { success: true, data: [] };
    }
  },

  async getMessages(threadId: string): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/threads/${threadId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Fallback to empty array if backend is not available
      return { success: true, data: [] };
    }
  },

  async sendMessage(
    threadId: string,
    content: string,
    attachments?: Array<{ id: string; name: string; type: string; url: string; size: number }>,
    audioUrl?: string
  ): Promise<ApiResponse<ChatMessage>> {
    try {
      // Get current user from localStorage
      const userData = localStorage.getItem('keyvasthu_user');
      const user = userData ? JSON.parse(userData) : { id: 'user-1', name: 'You', avatar: undefined };

      const response = await fetch(`${API_BASE_URL}/chat/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          senderId: user.id,
          senderName: user.name || 'You',
          senderAvatar: user.avatar,
          attachments,
          audioUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback response
      return {
        success: false,
        error: 'Failed to send message. Please check if the backend server is running.',
      };
    }
  },

  async createThread(applicantId: string, clientId: string, participantName?: string, participantAvatar?: string): Promise<ApiResponse<ChatThread>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicantId,
          clientId,
          participantName,
          participantAvatar,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating thread:', error);
      return {
        success: false,
        error: 'Failed to create thread. Please check if the backend server is running.',
      };
    }
  },
};

/**
 * Books API stubs
 */
export const booksApi = {
  async getBooks(): Promise<ApiResponse<Book[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/books`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Books endpoint error:', error);
      return { success: false, error: 'Failed to fetch books' };
    }
  },

  async getBookById(id: string): Promise<ApiResponse<Book>> {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Book endpoint error:', error);
      return { success: false, error: 'Failed to fetch book' };
    }
  },

  async createBook(bookData: Partial<Book>): Promise<ApiResponse<Book>> {
    try {
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create book error:', error);
      return { success: false, error: 'Failed to create book' };
    }
  },

  async updateBook(id: string, bookData: Partial<Book>): Promise<ApiResponse<Book>> {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update book error:', error);
      return { success: false, error: 'Failed to update book' };
    }
  },

  async deleteBook(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete book error:', error);
      return { success: false, error: 'Failed to delete book' };
    }
  },
};

/**
 * Orders API - Connected to Neon Database
 */
export const ordersApi = {
  async createOrder(
    items: CartItem[],
    totalAmount: number,
    paymentMethod: string,
    shippingAddress: Address
  ): Promise<ApiResponse<Order>> {
    try {
      // Get current user from localStorage
      const userData = localStorage.getItem('keyvasthu_user');
      const user = userData ? JSON.parse(userData) : { id: 'user-1' };

      if (!items || items.length === 0) {
        return {
          success: false,
          error: 'Cart is empty. Please add items to cart before placing order.',
        };
      }

      if (!shippingAddress || !shippingAddress.name || !shippingAddress.line1) {
        return {
          success: false,
          error: 'Shipping address is incomplete. Please fill all required fields.',
        };
      }

      const requestBody = {
        userId: user.id,
        items,
        totalAmount,
        paymentMethod: paymentMethod || 'cash_on_delivery',
        shippingAddress,
      };

      console.log('Creating order with:', { userId: user.id, itemCount: items.length, totalAmount });

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Order creation failed:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Order created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: error.message || 'Failed to create order. Please check if the backend server is running.',
      };
    }
  },

  async getOrders(): Promise<ApiResponse<Order[]>> {
    try {
      // Get current user from localStorage
      const userData = localStorage.getItem('keyvasthu_user');
      const user = userData ? JSON.parse(userData) : { id: 'user-1' };

      const response = await fetch(`${API_BASE_URL}/orders?userId=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: true, data: [] };
    }
  },
};

/**
 * File Upload API stubs
 */
export const uploadApi = {
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<{ url: string }>> {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await delay(200);
      onProgress?.(i);
    }
    
    return {
      success: true,
      data: { url: URL.createObjectURL(file) },
      message: 'File uploaded successfully!',
    };
  },

  async deleteFile(_fileId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    return { success: true, message: 'File deleted successfully!' };
  },
};

/**
 * File Management API
 */
export const fileManagementApi = {
  // Get all files
  async getFiles(filters?: { category?: string; tags?: string[]; search?: string }): Promise<ApiResponse<ManagedFile[]>> {
    await randomDelay();
    
    // Get from localStorage or return mock data
    const stored = localStorage.getItem('keyvasthu_files');
    let files: ManagedFile[] = stored ? JSON.parse(stored) : [];
    
    // Apply filters
    if (filters) {
      if (filters.category) {
        files = files.filter(f => f.category === filters.category);
      }
      if (filters.tags && filters.tags.length > 0) {
        files = files.filter(f => 
          filters.tags!.some(tag => f.tags.includes(tag))
        );
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        files = files.filter(f => 
          f.name.toLowerCase().includes(searchLower) ||
          f.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
    }
    
    return { success: true, data: files };
  },

  // Upload file with metadata
  async uploadFileWithMetadata(
    file: File,
    metadata: { tags?: string[]; category?: string },
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<ManagedFile>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata.category) {
        formData.append('category', metadata.category);
      }
      if (metadata.tags && metadata.tags.length > 0) {
        formData.append('tags', metadata.tags.join(','));
      }

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress?.(percentComplete);
        }
      });

      const uploadPromise = new Promise<ManagedFile>(async (resolve, reject) => {
        xhr.addEventListener('load', async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success && response.data) {
    // Get image dimensions if it's an image
    let imageMetadata: { width?: number; height?: number } = {};
                let thumbnailUrl: string | undefined;
                
                if (response.data.type === 'image' && response.data.url) {
                  thumbnailUrl = response.data.url;
      try {
        const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.src = response.data.url;
                    await new Promise<void>((imgResolve) => {
          img.onload = () => {
            imageMetadata = { width: img.width, height: img.height };
                        imgResolve();
          };
                      img.onerror = () => imgResolve();
        });
      } catch (e) {
        // Ignore errors
      }
    }

    const managedFile: ManagedFile = {
                  ...response.data,
      thumbnailUrl,
                  metadata: Object.keys(imageMetadata).length > 0 ? imageMetadata : response.data.metadata,
                };
                resolve(managedFile);
              } else {
                reject(new Error(response.error || 'Upload failed'));
              }
            } catch (e) {
              reject(new Error('Failed to parse server response'));
            }
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.error || `Upload failed with status ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was aborted'));
        });
      });

      xhr.open('POST', `${API_BASE_URL}/files/upload`);
      xhr.send(formData);

      const managedFile = await uploadPromise;

      // Also save to localStorage for offline access
    const stored = localStorage.getItem('keyvasthu_files');
    const files: ManagedFile[] = stored ? JSON.parse(stored) : [];
    files.push(managedFile);
    localStorage.setItem('keyvasthu_files', JSON.stringify(files));

    return { success: true, data: managedFile };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file',
      };
    }
  },

  // Update file metadata
  async updateFileMetadata(fileId: string, updates: { tags?: string[]; category?: string; name?: string }): Promise<ApiResponse<ManagedFile>> {
    await randomDelay();
    
    const stored = localStorage.getItem('keyvasthu_files');
    if (!stored) {
      return { success: false, error: 'File not found' };
    }

    const files: ManagedFile[] = JSON.parse(stored);
    const fileIndex = files.findIndex(f => f.id === fileId);
    
    if (fileIndex === -1) {
      return { success: false, error: 'File not found' };
    }

    files[fileIndex] = { ...files[fileIndex], ...updates };
    localStorage.setItem('keyvasthu_files', JSON.stringify(files));

    return { success: true, data: files[fileIndex] };
  },

  // Delete file
  async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    
    const stored = localStorage.getItem('keyvasthu_files');
    if (!stored) {
      return { success: false, error: 'File not found' };
    }

    const files: ManagedFile[] = JSON.parse(stored);
    const filtered = files.filter(f => f.id !== fileId);
    localStorage.setItem('keyvasthu_files', JSON.stringify(filtered));

    return { success: true };
  },

  // Generate share link
  async generateShareLink(fileId: string): Promise<ApiResponse<{ shareUrl: string; shareToken: string }>> {
    await randomDelay();
    
    const shareToken = Math.random().toString(36).substr(2, 16);
    const shareUrl = `${window.location.origin}/files/shared/${shareToken}`;

    // Update file with share token
    const stored = localStorage.getItem('keyvasthu_files');
    if (stored) {
      const files: ManagedFile[] = JSON.parse(stored);
      const fileIndex = files.findIndex(f => f.id === fileId);
      if (fileIndex !== -1) {
        files[fileIndex] = {
          ...files[fileIndex],
          shareable: true,
          shareToken,
        };
        localStorage.setItem('keyvasthu_files', JSON.stringify(files));
      }
    }

    return { success: true, data: { shareUrl, shareToken } };
  },

  // Get categories
  async getCategories(): Promise<ApiResponse<FileCategory[]>> {
    await randomDelay();
    
    const categories: FileCategory[] = [
      { id: 'floor-plan', name: 'Floor Plans', color: 'saffron', icon: 'Layout' },
      { id: 'elevation', name: 'Elevations', color: 'astral', icon: 'Building' },
      { id: 'site-plan', name: 'Site Plans', color: 'gold', icon: 'Map' },
      { id: 'document', name: 'Documents', color: 'earth', icon: 'FileText' },
      { id: 'other', name: 'Other', color: 'earth', icon: 'File' },
    ];

    return { success: true, data: categories };
  },
};

/**
 * Dashboard API stubs
 */
export const dashboardApi = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    await randomDelay();
    
    const stats: DashboardStats = {
      totalUsers: 1247,
      activeChats: 23,
      pendingReviews: 8,
      totalOrders: 456,
      revenue: 234500,
      newUsersThisMonth: 89,
    };
    
    return { success: true, data: stats };
  },

  async getRecentActivity(): Promise<ApiResponse<Activity[]>> {
    await randomDelay();
    
    const activities: Activity[] = [
      {
        id: 'act-1',
        type: 'message',
        description: 'New message from Rajesh Kumar',
        timestamp: new Date().toISOString(),
        user: { name: 'Rajesh Kumar', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh' },
      },
      {
        id: 'act-2',
        type: 'upload',
        description: 'Floor plan uploaded for review',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user: { name: 'Priya Singh', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya' },
      },
      {
        id: 'act-3',
        type: 'order',
        description: 'New book order received',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        user: { name: 'Amit Patel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit' },
      },
    ];
    
    return { success: true, data: activities };
  },
};

/**
 * Admin API - Connected to Neon Database
 */
export const adminApi = {
  async getStats(): Promise<ApiResponse<DashboardStats & { chattingMembers: number; membersWithOrders: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        success: false,
        error: 'Failed to fetch admin statistics',
      };
    }
  },

  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to empty array
      return { success: true, data: [] };
    }
  },

  async getOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: true, data: [] };
    }
  },

  async getChatThreads(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/chat-threads`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching chat threads:', error);
      return { success: true, data: [] };
    }
  },

  async getMembersWithOrders(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/members-with-orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching members with orders:', error);
      return { success: true, data: [] };
    }
  },

  async updateUser(_id: string, _data: Partial<User>): Promise<ApiResponse<User>> {
    await randomDelay();
    return { success: true, message: 'User updated successfully!' } as ApiResponse<User>;
  },

  async deleteUser(_id: string): Promise<ApiResponse<void>> {
    await randomDelay();
    return { success: true, message: 'User deleted successfully!' };
  },

  // Admin: Get messages for a thread
  async getThreadMessages(threadId: string): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/threads/${threadId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching thread messages:', error);
      return { success: false, error: 'Failed to fetch messages' };
    }
  },

  // Admin: Send message as admin (maintainer-001)
  async sendAdminMessage(
    threadId: string,
    content: string
  ): Promise<ApiResponse<ChatMessage>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          senderId: 'maintainer-001',
          senderName: 'KeyVasthu Support',
          senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=keyvasthu',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending admin message:', error);
      return {
        success: false,
        error: 'Failed to send message. Please check if the backend server is running.',
      };
    }
  },
};

/**
 * Blog API
 */
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  video_url?: string;
  author_id: string;
  author_name: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export const blogApi = {
  // Get all published blog posts (public)
  async getPosts(): Promise<ApiResponse<BlogPost[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/blog`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Always try to parse JSON, even for error statuses
      const contentType = response.headers.get('content-type');
      let data: any;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
          // If backend returned success with data, return it even if status is not ok
          if (data.success !== undefined) {
            return data;
          }
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
        }
      }

      // If we got here, response was not ok and not JSON, or JSON parsing failed
      if (!response.ok) {
        const text = await response.text();
        console.error('Blog API error:', response.status, text.substring(0, 200));
        
        // Return empty array instead of throwing error
        return {
          success: true,
          data: [],
          error: `Server error (${response.status}). Please check if backend is running.`
        };
      }

      return data || { success: true, data: [] };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      // Always return success with empty array to prevent frontend crashes
      return { 
        success: true, 
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch blog posts'
      };
    }
  },

  // Get all blog posts (admin - includes drafts)
  async getAdminPosts(): Promise<ApiResponse<BlogPost[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/blog/admin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Always try to parse JSON, even for error statuses
      const contentType = response.headers.get('content-type');
      let data: any;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
          // If backend returned success with data, return it even if status is not ok
          if (data.success !== undefined) {
            return data;
          }
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
        }
      }

      // If we got here, response was not ok and not JSON, or JSON parsing failed
      if (!response.ok) {
        const text = await response.text();
        console.error('Blog Admin API error:', response.status, text.substring(0, 200));
        
        // Return empty array instead of throwing error
        return {
          success: true,
          data: [],
          error: `Server error (${response.status}). Please check if backend is running.`
        };
      }

      return data || { success: true, data: [] };
    } catch (error) {
      console.error('Error fetching admin blog posts:', error);
      // Always return success with empty array to prevent frontend crashes
      return { 
        success: true, 
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch blog posts'
      };
    }
  },

  // Get single blog post by ID
  async getPost(id: string): Promise<ApiResponse<BlogPost>> {
    try {
      const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Blog Get API error:', response.status, text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Blog Get API returned non-JSON:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch blog post' 
      };
    }
  },

  // Create new blog post (admin only)
  async createPost(post: {
    title: string;
    content: string;
    excerpt?: string;
    video_url?: string;
    author_id: string;
    author_name: string;
    status?: 'draft' | 'published';
  }): Promise<ApiResponse<BlogPost>> {
    try {
      console.log('=== Frontend: Creating blog post ===');
      console.log('Post data:', { 
        ...post, 
        content: post.content.substring(0, 50) + '...',
        contentLength: post.content.length
      });
      
      // Validate data before sending
      if (!post.title || post.title.trim().length === 0) {
        return {
          success: false,
          error: 'Title is required and cannot be empty'
        };
      }
      
      if (!post.content || post.content.trim().length === 0) {
        return {
          success: false,
          error: 'Content is required and cannot be empty'
        };
      }
      
      if (!post.author_id) {
        return {
          success: false,
          error: 'Author ID is required'
        };
      }
      
      if (!post.author_name || post.author_name.trim().length === 0) {
        return {
          success: false,
          error: 'Author name is required'
        };
      }
      
      const response = await fetch(`${API_BASE_URL}/blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });

      console.log('Blog create response status:', response.status);
      console.log('Blog create response ok:', response.ok);

      // Always try to parse as JSON first
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
          console.log('Blog create response data:', data);
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
          const text = await response.text();
          console.error('Response text:', text.substring(0, 200));
          return {
            success: false,
            error: `Server returned invalid JSON. Status: ${response.status}`
          };
        }
      } else {
        const text = await response.text();
        console.error('Blog Create API returned non-JSON:', text.substring(0, 200));
        return {
          success: false,
          error: `Server returned non-JSON response (${response.status}). Make sure the backend server is running on port 3001.`
        };
      }

      // Check if response was successful
      if (!response.ok) {
        const errorMessage = data?.error || `Server error (${response.status})`;
        console.error('Blog create failed:', errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }

      // Validate response structure
      if (data.success && data.data) {
        console.log('✅ Blog post created successfully:', data.data.id);
        return data;
      } else {
        console.error('Invalid response structure:', data);
        return {
          success: false,
          error: data?.error || 'Server returned invalid response structure'
        };
      }
    } catch (error) {
      console.error('❌ Exception creating blog post:', error);
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create blog post - network error',
      };
    }
  },

  // Update blog post (admin only)
  async updatePost(
    id: string,
    updates: {
      title?: string;
      content?: string;
      excerpt?: string;
      video_url?: string;
      status?: 'draft' | 'published';
    }
  ): Promise<ApiResponse<BlogPost>> {
    try {
      const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to update blog post';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If JSON parsing fails, use default message
          }
        } else {
          const text = await response.text();
          console.error('Blog Update API returned non-JSON:', text.substring(0, 200));
          errorMessage = 'Server returned non-JSON response. Make sure the backend server is running on port 3001.';
        }
        
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Blog Update API returned non-JSON:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Make sure the backend server is running.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating blog post:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update blog post',
      };
    }
  },

  // Delete blog post (admin only)
  async deletePost(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to delete blog post';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If JSON parsing fails, use default message
          }
        } else {
          const text = await response.text();
          console.error('Blog Delete API returned non-JSON:', text.substring(0, 200));
          errorMessage = 'Server returned non-JSON response. Make sure the backend server is running on port 3001.';
        }
        
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Blog Delete API returned non-JSON:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Make sure the backend server is running.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete blog post',
      };
    }
  },
};

