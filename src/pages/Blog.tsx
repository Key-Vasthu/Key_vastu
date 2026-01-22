import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Edit,
  Trash2,
  Save,
  Plus,
  Eye,
  Calendar,
  User,
  X,
  Video,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  Link as LinkIcon,
  Send,
  Instagram,
  Camera,
  MessageSquare,
  Hash,
} from 'lucide-react';
import { Button, Card, Badge, Loading, Modal } from '../components/common';
import { blogApi, type BlogPost } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { formatDate } from '../utils/helpers';

const Blog: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = user?.role === 'admin';

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost>>({
    title: '',
    content: '',
    excerpt: '',
    video_url: '',
    status: 'draft',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Load posts
  useEffect(() => {
    loadPosts();
  }, [isAdmin]);

  // Handle shared blog post links (open post when ?post=id is in URL)
  useEffect(() => {
    const postId = searchParams.get('post');
    if (postId && posts.length > 0) {
      const post = posts.find(p => p.id === postId);
      if (post && post.status === 'published') {
        setViewingPost(post);
        setIsViewModalOpen(true);
        // Remove the query parameter from URL after opening
        setSearchParams({}, { replace: true });
      }
    }
  }, [posts, searchParams, setSearchParams]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const response = isAdmin
        ? await blogApi.getAdminPosts()
        : await blogApi.getPosts();

      if (response.success) {
        // Always set posts, even if empty array (handles 500 errors gracefully)
        setPosts(response.data || []);
        
        // Only show error notification if there's an actual error message
        if (response.error && !response.data) {
          if (response.error.includes('non-JSON') || response.error.includes('backend server')) {
            addNotification(
              'error',
              'Backend Server Error',
              'Please make sure the backend server is running on port 3001. Run "npm run server" in a separate terminal.'
            );
          } else {
            addNotification('error', 'Error', response.error);
          }
        }
      } else {
        // If response failed, set empty array and show error
        setPosts([]);
        addNotification('error', 'Error', response.error || 'Failed to load blog posts');
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      // Set empty array on error to prevent crashes
      setPosts([]);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load blog posts';
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('500')) {
        addNotification(
          'error',
          'Connection Error',
          'Cannot connect to the backend server. Please make sure the server is running on port 3001.'
        );
      } else {
        addNotification('error', 'Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingPost({
      title: '',
      content: '',
      excerpt: '',
      video_url: '',
      status: 'draft',
    });
    setSelectedPost(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      video_url: post.video_url || '',
      status: post.status,
    });
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  const handleViewPost = (post: BlogPost) => {
    setViewingPost(post);
    setIsViewModalOpen(true);
  };

  const getShareUrl = (platform: string) => {
    if (!viewingPost) return '';
    // Create a shareable URL with the blog post ID
    const postUrl = `${window.location.origin}/blog?post=${viewingPost.id}`;
    const url = encodeURIComponent(postUrl);
    const title = encodeURIComponent(viewingPost.title);
    const text = encodeURIComponent(viewingPost.excerpt || viewingPost.title);

    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing, will show copy option
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${title}`,
      reddit: `https://reddit.com/submit?url=${url}&title=${title}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${url}&description=${title}`,
      tumblr: `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${url}&title=${title}`,
      email: `mailto:?subject=${title}&body=${text}%20${url}`,
      snapchat: `https://www.snapchat.com/scan?attachmentUrl=${url}`, // Snapchat scan code
      viber: `viber://forward?text=${title}%20${url}`,
      discord: `https://discord.com/channels/@me`, // Discord doesn't support direct sharing
      copy: postUrl, // For copy link functionality
    };

    return shareUrls[platform] || url;
  };

  const handleShare = (platform: string) => {
    const shareUrl = getShareUrl(platform);
    if (shareUrl) {
      if (platform === 'email') {
        window.location.href = shareUrl;
      } else if (platform === 'instagram' || platform === 'discord') {
        // For platforms that don't support direct sharing, copy the link
        handleCopyLink();
        addNotification('info', 'Link Copied', 'Link copied! Paste it in Instagram or Discord to share.');
      } else if (platform === 'snapchat' || platform === 'viber') {
        // Try to open, but may not work on all devices
        try {
          window.location.href = shareUrl;
        } catch (e) {
          handleCopyLink();
          addNotification('info', 'Link Copied', 'Link copied! Use it in the app to share.');
        }
      } else {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    }
  };

  const handleCopyLink = async () => {
    if (!viewingPost) return;
    const url = `${window.location.origin}/blog?post=${viewingPost.id}`;
    try {
      await navigator.clipboard.writeText(url);
      addNotification('success', 'Success', 'Blog post link copied to clipboard!');
    } catch (error) {
      addNotification('error', 'Error', 'Failed to copy link');
    }
  };

  const handleDelete = (post: BlogPost) => {
    setSelectedPost(post);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingPost.title || !editingPost.content) {
      addNotification('error', 'Validation Error', 'Title and content are required');
      return;
    }

    if (!user) {
      addNotification('error', 'Authentication Error', 'You must be logged in to save posts');
      return;
    }

    setIsSaving(true);
    try {
      if (selectedPost) {
        // Update existing post
        const response = await blogApi.updatePost(selectedPost.id, {
          title: editingPost.title,
          content: editingPost.content,
          excerpt: editingPost.excerpt,
          video_url: editingPost.video_url,
          status: editingPost.status as 'draft' | 'published',
        });

        if (response.success && response.data) {
          const statusMsg = editingPost.status === 'published' ? 'updated and published' : 'updated';
          addNotification('success', 'Success', `Blog post ${statusMsg} successfully!`);
          setIsEditModalOpen(false);
          setSelectedPost(null);
          setEditingPost({ title: '', content: '', excerpt: '', video_url: '', status: 'draft' });
          // Reload posts to show the updated one
          await loadPosts();
        } else {
          const errorMsg = response.error || 'Failed to update post';
          console.error('Update post error:', errorMsg);
          if (errorMsg.includes('non-JSON') || errorMsg.includes('backend server')) {
            addNotification(
              'error',
              'Backend Server Error',
              'Please make sure the backend server is running. Run "npm run server" in a separate terminal.'
            );
          } else {
            addNotification('error', 'Error Updating Post', errorMsg);
          }
        }
      } else {
        // Create new post
        console.log('Creating new post with data:', {
          title: editingPost.title,
          contentLength: editingPost.content?.length,
          author_id: user.id,
          author_name: user.name,
          status: editingPost.status
        });

        const postData = {
          title: editingPost.title!.trim(),
          content: editingPost.content!.trim(),
          excerpt: editingPost.excerpt?.trim() || undefined,
          video_url: editingPost.video_url?.trim() || undefined,
          author_id: user.id,
          author_name: user.name || user.email || 'Admin',
          status: (editingPost.status === 'published' || editingPost.status === 'draft') 
            ? editingPost.status 
            : 'draft' as 'draft' | 'published',
        };

        console.log('Creating post with data:', { ...postData, content: postData.content.substring(0, 50) + '...' });

        const response = await blogApi.createPost(postData);

        console.log('Create post response:', response);

        if (response.success && response.data) {
          addNotification(
            'success', 
            'Success', 
            `Blog post ${postData.status === 'published' ? 'created and published' : 'saved as draft'} successfully!`
          );
          setIsEditModalOpen(false);
          setSelectedPost(null);
          setEditingPost({ title: '', content: '', excerpt: '', video_url: '', status: 'draft' });
          // Reload posts to show the new one
          await loadPosts();
        } else {
          const errorMsg = response.error || 'Failed to create post';
          console.error('❌ Create post error:', errorMsg);
          console.error('Full response:', response);
          
          // Show specific error messages based on error type
          if (errorMsg.includes('non-JSON') || errorMsg.includes('backend server') || errorMsg.includes('network error')) {
            addNotification(
              'error',
              'Backend Server Error',
              'Please make sure the backend server is running on port 3001. Run "npm run server" in a separate terminal.'
            );
          } else if (errorMsg.includes('Database table not found') || errorMsg.includes('table') || errorMsg.includes('Database')) {
            addNotification(
              'error',
              'Database Error',
              'Database table not initialized. Please restart the backend server to create the blog_posts table.'
            );
          } else if (errorMsg.includes('required') || errorMsg.includes('cannot be empty')) {
            addNotification(
              'error',
              'Validation Error',
              errorMsg
            );
          } else if (errorMsg.includes('Database error') || errorMsg.includes('connection error')) {
            addNotification(
              'error',
              'Database Connection Error',
              errorMsg
            );
          } else {
            // Show the actual error message from the server
            addNotification('error', 'Error Creating Post', errorMsg);
          }
        }
      }
    } catch (error) {
      console.error('Error saving post:', error);
      addNotification('error', 'Error', 'Failed to save blog post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPost) return;

    setIsSaving(true);
    try {
      const response = await blogApi.deletePost(selectedPost.id);

      if (response.success) {
        addNotification('success', 'Success', 'Blog post deleted successfully!');
        setIsDeleteModalOpen(false);
        setSelectedPost(null);
        loadPosts();
      } else {
        addNotification('error', 'Error', response.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      addNotification('error', 'Error', 'Failed to delete blog post');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading fullScreen text="Loading blog posts..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-astral-50 relative overflow-hidden">
      {/* Animated Background Patterns */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-saffron-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gold-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-astral-200/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Unique Header Design */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative mb-16"
          >
            {/* Decorative Pattern Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-saffron-100/40 via-gold-100/30 to-astral-100/40 rounded-3xl blur-3xl transform rotate-3"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-astral-100/30 via-saffron-100/20 to-gold-100/30 rounded-3xl blur-3xl transform -rotate-3"></div>
            
            {/* Main Header Card with Glassmorphism */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border-2 border-saffron-200/50 shadow-2xl overflow-hidden">
              {/* Animated Border Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-saffron-400/20 via-gold-400/20 to-astral-400/20 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Decorative Corner Elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-saffron-200/30 to-transparent rounded-br-full"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-astral-200/30 to-transparent rounded-tl-full"></div>
              
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-start gap-6">
                  {/* Enhanced Icon Badge with Animation */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative w-20 h-20 bg-gradient-to-br from-saffron-400 via-gold-500 to-astral-500 rounded-3xl flex items-center justify-center shadow-2xl flex-shrink-0"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                    <FileText className="text-white relative z-10" size={32} />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gold-400 rounded-full animate-ping"></div>
                  </motion.div>
                  
                  <div>
                    <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-astral-900 via-saffron-600 to-gold-600 bg-clip-text text-transparent mb-3 leading-tight">
                      KeyVasthu Blog
                    </h1>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-saffron-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse delay-300"></div>
                        <div className="w-2 h-2 bg-astral-500 rounded-full animate-pulse delay-500"></div>
                      </div>
                      <p className="text-lg text-earth-700 font-medium">
                        {isAdmin
                          ? '✨ Manage blog posts and share KeyVasthu news'
                          : '📰 Latest news and updates from KeyVasthu'}
                      </p>
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleCreateNew}
                      variant="primary"
                      leftIcon={<Plus size={20} />}
                      className="shadow-2xl hover:shadow-3xl transition-all duration-300 text-base px-8 py-4 bg-gradient-to-r from-saffron-500 to-gold-500 hover:from-saffron-600 hover:to-gold-600"
                    >
                      New Post
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center py-20 bg-gradient-to-br from-white via-cream-50 to-saffron-50/30 border-2 border-saffron-200/50 shadow-2xl relative overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-saffron-300 rounded-full blur-2xl"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-gold-300 rounded-full blur-2xl"></div>
              </div>
              
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="w-28 h-28 bg-gradient-to-br from-saffron-200 to-gold-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl"
                >
                  <FileText className="w-16 h-16 text-saffron-700" />
                </motion.div>
                <h3 className="text-3xl font-display font-bold bg-gradient-to-r from-astral-900 to-saffron-700 bg-clip-text text-transparent mb-4">
                  {isAdmin ? 'No blog posts yet' : 'No blog posts available'}
                </h3>
                <p className="text-earth-700 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                  {isAdmin
                    ? 'Create your first blog post to share news and updates with the KeyVasthu community'
                    : 'Check back soon for exciting updates and insights'}
                </p>
                {isAdmin && (
                  <Button
                    onClick={handleCreateNew}
                    variant="primary"
                    className="shadow-2xl hover:shadow-3xl transition-all bg-gradient-to-r from-saffron-500 to-gold-500 hover:from-saffron-600 hover:to-gold-600"
                    leftIcon={<Plus size={18} />}
                  >
                    Create First Post
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Card className="h-full flex flex-col bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 border-2 border-earth-200/50 hover:border-saffron-400 group overflow-hidden relative">
                  {/* Animated Gradient Top Border */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-saffron-400 via-gold-500 to-astral-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Decorative Corner Accents */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-saffron-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-gold-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Shimmer Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative z-10 flex-1 p-6">
                    <div className="flex items-start justify-between mb-5">
                      <Badge
                        variant={post.status === 'published' ? 'success' : 'neutral'}
                        size="sm"
                        className="shadow-md font-semibold px-3 py-1"
                      >
                        {post.status === 'published' ? '✓ Published' : '📝 Draft'}
                      </Badge>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.15, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(post)}
                            className="p-2.5 text-earth-600 hover:text-saffron-600 hover:bg-saffron-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                            aria-label="Edit post"
                          >
                            <Edit size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.15, rotate: -5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(post)}
                            className="p-2.5 text-earth-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                            aria-label="Delete post"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      )}
                    </div>

                    <h3 className="text-2xl font-display font-bold text-astral-900 mb-4 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-saffron-600 group-hover:to-gold-600 group-hover:bg-clip-text transition-all duration-300 leading-tight">
                      {post.title}
                    </h3>

                    {post.excerpt && (
                      <p className="text-earth-700 text-sm mb-6 line-clamp-3 leading-relaxed font-medium">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-earth-600 mb-5 pb-5 border-b-2 border-earth-100/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-saffron-200 to-gold-200 rounded-full flex items-center justify-center shadow-sm">
                          <User size={12} className="text-saffron-700" />
                        </div>
                        <span className="font-semibold text-earth-800">{post.author_name}</span>
                      </div>
                      {post.published_at && (
                        <div className="flex items-center gap-2 ml-auto">
                          <Calendar size={14} className="text-gold-600" />
                          <span className="font-medium">{formatDate(post.published_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {post.status === 'published' && (
                    <div className="relative z-10 px-6 pb-6 space-y-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-2 border-saffron-400 text-saffron-700 hover:bg-gradient-to-r hover:from-saffron-50 hover:to-gold-50 hover:border-saffron-500 font-semibold transition-all shadow-md hover:shadow-lg"
                          onClick={() => handleViewPost(post)}
                          rightIcon={<Eye size={18} />}
                        >
                          Read More
                        </Button>
                      </motion.div>
                      {/* Enhanced Quick Share Buttons */}
                      <div className="flex items-center gap-3 pt-3 border-t-2 border-earth-100/50 bg-gradient-to-r from-cream-50/50 to-saffron-50/30 -mx-6 px-6 py-3 rounded-b-xl">
                        <span className="text-xs text-earth-600 font-bold uppercase tracking-wide">Share:</span>
                        <div className="flex items-center gap-2 flex-1">
                          <motion.button
                            whileHover={{ scale: 1.2, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingPost(post);
                              handleShare('whatsapp');
                            }}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-xl transition-all shadow-sm hover:shadow-md"
                            aria-label="Share on WhatsApp"
                            title="Share on WhatsApp"
                          >
                            <MessageCircle size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.2, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingPost(post);
                              handleShare('facebook');
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all shadow-sm hover:shadow-md"
                            aria-label="Share on Facebook"
                            title="Share on Facebook"
                          >
                            <Facebook size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.2, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingPost(post);
                              handleShare('twitter');
                            }}
                            className="p-2 text-sky-500 hover:bg-sky-100 rounded-xl transition-all shadow-sm hover:shadow-md"
                            aria-label="Share on Twitter"
                            title="Share on Twitter"
                          >
                            <Twitter size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.2, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={async (e) => {
                              e.stopPropagation();
                              const postUrl = `${window.location.origin}/blog?post=${post.id}`;
                              try {
                                await navigator.clipboard.writeText(postUrl);
                                addNotification('success', 'Success', 'Blog post link copied to clipboard!');
                              } catch (error) {
                                addNotification('error', 'Error', 'Failed to copy link');
                              }
                            }}
                            className="p-2 text-saffron-600 hover:bg-saffron-100 rounded-xl transition-all shadow-sm hover:shadow-md ml-auto"
                            aria-label="Copy link"
                            title="Copy link"
                          >
                            <LinkIcon size={18} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit/Create Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPost(null);
            setEditingPost({ title: '', content: '', excerpt: '', video_url: '', status: 'draft' });
          }}
          title=""
          size="xl"
        >
          <div className="space-y-6 -mx-6 -mt-6">
            {/* Modal Header with Gradient */}
            <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-saffron-50 via-gold-50 to-astral-50 border-b-2 border-saffron-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-saffron-400 to-gold-500 rounded-xl flex items-center justify-center shadow-md">
                  {selectedPost ? <Edit className="text-white" size={20} /> : <Plus className="text-white" size={20} />}
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-astral-900">
                    {selectedPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                  </h2>
                  <p className="text-sm text-earth-600 mt-0.5">
                    {selectedPost ? 'Update your blog post information' : 'Fill in the details to create a new blog post'}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields - Scrollable */}
            <div className="px-6 space-y-5 max-h-[65vh] overflow-y-auto">
              {/* Title Field */}
              <div className="space-y-2">
                <label htmlFor="blog-title" className="block text-sm font-semibold text-astral-900">
                  <span className="flex items-center gap-2">
                    Title
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  id="blog-title"
                  type="text"
                  value={editingPost.title || ''}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-all text-earth-900 placeholder:text-earth-400 text-base"
                  placeholder="Enter a compelling blog post title"
                />
              </div>

              {/* Excerpt Field */}
              <div className="space-y-2">
                <label htmlFor="blog-excerpt" className="block text-sm font-semibold text-astral-900">
                  <span className="flex items-center gap-2">
                    Excerpt
                    <span className="text-xs font-normal text-earth-500">(optional)</span>
                  </span>
                </label>
                <textarea
                  id="blog-excerpt"
                  value={editingPost.excerpt || ''}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, excerpt: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-all text-earth-900 placeholder:text-earth-400 resize-none text-base"
                  placeholder="Write a brief summary that will appear in the blog preview..."
                  rows={3}
                />
              </div>

              {/* Content Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="blog-content" className="block text-sm font-semibold text-astral-900">
                    <span className="flex items-center gap-2">
                      <FileText size={16} className="text-saffron-600" />
                      Content
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <span className="text-xs text-earth-500 font-medium">
                    {(editingPost.content || '').length} characters
                  </span>
                </div>
                <textarea
                  id="blog-content"
                  value={editingPost.content || ''}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, content: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-all text-earth-900 placeholder:text-earth-400 resize-y min-h-[400px] text-base leading-relaxed"
                  placeholder="Write your blog post content here. Press Enter for new paragraphs..."
                  rows={20}
                />
              </div>

              {/* Video URL Field */}
              <div className="space-y-2">
                <label htmlFor="blog-video" className="block text-sm font-semibold text-astral-900">
                  <span className="flex items-center gap-2">
                    <Video size={16} className="text-saffron-600" />
                    Video URL
                    <span className="text-xs font-normal text-earth-500">(optional)</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="blog-video"
                    type="url"
                    value={editingPost.video_url || ''}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, video_url: e.target.value })
                    }
                    className="w-full px-4 py-3 pl-12 border-2 border-earth-200 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-all text-earth-900 placeholder:text-earth-400 text-base"
                    placeholder="https://www.youtube.com/embed/..."
                  />
                  <Video size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-saffron-500" />
                </div>
                <p className="text-xs text-earth-500">
                  Supports YouTube embed URLs, Vimeo, or direct video links
                </p>
              </div>

              {/* Status Field */}
              <div className="space-y-2">
                <label htmlFor="blog-status" className="block text-sm font-semibold text-astral-900">
                  Publication Status
                </label>
                <select
                  id="blog-status"
                  value={editingPost.status}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      status: e.target.value as 'draft' | 'published',
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-all text-earth-900 bg-white cursor-pointer text-base font-medium"
                >
                  <option value="draft">Draft - Save for later editing</option>
                  <option value="published">Published - Make visible to users</option>
                </select>
              </div>
            </div>

            {/* Action Buttons - Sticky Footer */}
            <div className="flex gap-3 px-6 pt-4 pb-6 border-t-2 border-saffron-200 bg-white sticky bottom-0">
              <Button
                onClick={handleSave}
                variant="primary"
                disabled={isSaving}
                leftIcon={isSaving ? <Loading /> : <Save size={18} />}
                className="flex-1 shadow-lg hover:shadow-xl transition-all"
              >
                {isSaving ? 'Saving...' : selectedPost ? 'Update Post' : 'Create Post'}
              </Button>
              <Button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedPost(null);
                  setEditingPost({ title: '', content: '', excerpt: '', video_url: '', status: 'draft' });
                }}
                variant="outline"
                leftIcon={<X size={18} />}
                className="border-2 hover:bg-earth-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedPost(null);
          }}
          title="Delete Blog Post"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-earth-600">
              Are you sure you want to delete "{selectedPost?.title}"? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleConfirmDelete}
                variant="primary"
                disabled={isSaving}
                leftIcon={isSaving ? <Loading /> : <Trash2 size={18} />}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isSaving ? 'Deleting...' : 'Delete'}
              </Button>
              <Button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedPost(null);
                }}
                variant="outline"
                leftIcon={<X size={18} />}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* View Post Modal with Social Sharing - Enhanced Design */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewingPost(null);
          }}
          title=""
          size="xl"
        >
          {viewingPost && (
            <div className="space-y-0 -mx-6 -mt-6">
              {/* Enhanced Modal Header */}
              <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-saffron-500 via-gold-500 to-astral-500 text-white overflow-hidden">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight flex-1">
                      {viewingPost.title}
                    </h2>
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        setViewingPost(null);
                      }}
                      className="p-2 hover:bg-white/20 rounded-xl transition-all hover:scale-110 flex-shrink-0"
                      aria-label="Close"
                    >
                      <X size={24} className="text-white" />
                    </button>
                  </div>
                  
                  {/* Author & Date Badges */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                      <User size={18} className="text-white" />
                      <span className="font-semibold">{viewingPost.author_name}</span>
                    </div>
                    {viewingPost.published_at && (
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                        <Calendar size={18} className="text-white" />
                        <span className="font-semibold">{formatDate(viewingPost.published_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="px-8 py-8 space-y-8">
                {/* Video Section - Enhanced */}
                {viewingPost.video_url && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-saffron-200 relative group"
                  >
                    <div className="relative w-full aspect-video bg-gradient-to-br from-earth-100 to-earth-200">
                      <iframe
                        src={viewingPost.video_url}
                        className="absolute top-0 left-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={viewingPost.title}
                      />
                    </div>
                    {/* Video Label */}
                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-2 text-white">
                        <Video size={18} />
                        <span className="text-sm font-semibold">Video Content</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Content - Enhanced Typography */}
                <div className="prose prose-lg max-w-none">
                  <div className="text-earth-700 whitespace-pre-wrap leading-relaxed text-base md:text-lg font-medium bg-gradient-to-b from-earth-800 to-earth-700 bg-clip-text">
                    {viewingPost.content.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4 last:mb-0">
                        {paragraph || '\u00A0'}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Sharing Section - Prominent Below Content */}
              <div className="px-6 pt-8 pb-6 mt-6 border-t-4 border-saffron-300 bg-gradient-to-br from-saffron-50 via-gold-50 to-cream-50 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-saffron-500 to-gold-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Share2 className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-astral-900">
                      Share this blog post
                    </h3>
                    <p className="text-sm text-earth-600 mt-0.5">
                      Spread the word about this KeyVasthu update
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* WhatsApp */}
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="flex flex-col items-center gap-2.5 p-5 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-300 border-2 border-green-200 hover:border-green-300 hover:shadow-lg hover:scale-105"
                    aria-label="Share on WhatsApp"
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                      <MessageCircle className="text-white" size={24} />
                    </div>
                    <span className="text-xs font-semibold text-green-700">WhatsApp</span>
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex flex-col items-center gap-2.5 p-5 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-300 hover:shadow-lg hover:scale-105"
                    aria-label="Share on Facebook"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <Facebook className="text-white" size={24} />
                    </div>
                    <span className="text-xs font-semibold text-blue-700">Facebook</span>
                  </button>

                  {/* Twitter */}
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex flex-col items-center gap-2.5 p-5 bg-gradient-to-br from-sky-50 to-sky-100 hover:from-sky-100 hover:to-sky-200 rounded-xl transition-all duration-300 border-2 border-sky-200 hover:border-sky-300 hover:shadow-lg hover:scale-105"
                    aria-label="Share on Twitter"
                  >
                    <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center shadow-md">
                      <Twitter className="text-white" size={24} />
                    </div>
                    <span className="text-xs font-semibold text-sky-700">Twitter</span>
                  </button>

                  {/* LinkedIn */}
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="flex flex-col items-center gap-2.5 p-5 bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 rounded-xl transition-all duration-300 border-2 border-blue-200 hover:border-indigo-300 hover:shadow-lg hover:scale-105"
                    aria-label="Share on LinkedIn"
                  >
                    <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center shadow-md">
                      <Linkedin className="text-white" size={24} />
                    </div>
                    <span className="text-xs font-semibold text-blue-700">LinkedIn</span>
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={() => handleShare('telegram')}
                    className="flex flex-col items-center gap-2.5 p-5 bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 rounded-xl transition-all duration-300 border-2 border-cyan-200 hover:border-cyan-300 hover:shadow-lg hover:scale-105"
                    aria-label="Share on Telegram"
                  >
                    <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                      <Send className="text-white" size={24} />
                    </div>
                    <span className="text-xs font-semibold text-cyan-700">Telegram</span>
                  </button>

                  {/* Reddit */}
                  <button
                    onClick={() => handleShare('reddit')}
                    className="flex flex-col items-center gap-2.5 p-5 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all duration-300 border-2 border-orange-200 hover:border-orange-300 hover:shadow-lg hover:scale-105"
                    aria-label="Share on Reddit"
                  >
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white text-lg font-bold">R</span>
                    </div>
                    <span className="text-xs font-semibold text-orange-700">Reddit</span>
                  </button>

                  {/* Pinterest */}
                  <button
                    onClick={() => handleShare('pinterest')}
                    className="flex flex-col items-center gap-2.5 p-5 bg-gradient-to-br from-red-50 to-pink-100 hover:from-red-100 hover:to-pink-200 rounded-xl transition-all duration-300 border-2 border-red-200 hover:border-pink-300 hover:shadow-lg hover:scale-105"
                    aria-label="Share on Pinterest"
                  >
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white text-lg font-bold">P</span>
                    </div>
                    <span className="text-xs font-semibold text-red-700">Pinterest</span>
                  </button>

                  {/* Tumblr */}
                  <button
                    onClick={() => handleShare('tumblr')}
                    className="flex flex-col items-center gap-2.5 p-5 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 rounded-xl transition-all duration-300 border-2 border-slate-200 hover:border-slate-300 hover:shadow-lg hover:scale-105"
                    aria-label="Share on Tumblr"
                  >
                    <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white text-lg font-bold">T</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">Tumblr</span>
                  </button>

                  {/* Email */}
                  <button
                    onClick={() => handleShare('email')}
                    className="flex flex-col items-center gap-2.5 p-5 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg hover:scale-105"
                    aria-label="Share via Email"
                  >
                    <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center shadow-md">
                      <Mail className="text-white" size={24} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">Email</span>
                  </button>

                  {/* Instagram */}
                  <button
                    onClick={() => handleShare('instagram')}
                    className="flex flex-col items-center gap-2.5 p-5 bg-gradient-to-br from-pink-50 to-purple-100 hover:from-pink-100 hover:to-purple-200 rounded-xl transition-all duration-300 border-2 border-pink-200 hover:border-purple-300 hover:shadow-lg hover:scale-105"
                    aria-label="Share on Instagram"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                      <Instagram className="text-white" size={24} />
                    </div>
                    <span className="text-xs font-semibold text-purple-700">Instagram</span>
                  </button>

                  {/* Snapchat */}
                  <button
                    onClick={() => handleShare('snapchat')}
                    className="flex flex-col items-center gap-2.5 p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl transition-all duration-300 border-2 border-yellow-200 hover:border-yellow-300 hover:shadow-lg hover:scale-105"
                    aria-label="Share on Snapchat"
                  >
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                      <Camera className="text-white" size={24} />
                    </div>
                    <span className="text-xs font-semibold text-yellow-700">Snapchat</span>
                  </button>

                  {/* Viber */}
                  <button
                    onClick={() => handleShare('viber')}
                    className="flex flex-col items-center gap-2.5 p-5 bg-gradient-to-br from-purple-50 to-indigo-100 hover:from-purple-100 hover:to-indigo-200 rounded-xl transition-all duration-300 border-2 border-purple-200 hover:border-indigo-300 hover:shadow-lg hover:scale-105"
                    aria-label="Share on Viber"
                  >
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-md">
                      <MessageSquare className="text-white" size={24} />
                    </div>
                    <span className="text-xs font-semibold text-purple-700">Viber</span>
                  </button>

                  {/* Discord */}
                  <button
                    onClick={() => handleShare('discord')}
                    className="flex flex-col items-center gap-2.5 p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl transition-all duration-300 border-2 border-indigo-200 hover:border-indigo-300 hover:shadow-lg hover:scale-105"
                    aria-label="Share on Discord"
                  >
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                      <Hash className="text-white" size={24} />
                    </div>
                    <span className="text-xs font-semibold text-indigo-700">Discord</span>
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={handleCopyLink}
                    className="flex flex-col items-center gap-2.5 p-5 bg-gradient-to-br from-saffron-50 to-gold-100 hover:from-saffron-100 hover:to-gold-200 rounded-xl transition-all duration-300 border-2 border-saffron-300 hover:border-gold-400 hover:shadow-lg hover:scale-105"
                    aria-label="Copy link"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-saffron-500 to-gold-600 rounded-xl flex items-center justify-center shadow-md">
                      <LinkIcon className="text-white" size={24} />
                    </div>
                    <span className="text-xs font-semibold text-saffron-700">Copy Link</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
        </div>
      </div>
    </div>
  );
};

export default Blog;

