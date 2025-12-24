import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Button, Card, Badge, Loading, Modal } from '../components/common';
import { blogApi, type BlogPost } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { formatDate } from '../utils/helpers';

const Blog: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
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
    const url = encodeURIComponent(window.location.origin + '/blog');
    const title = encodeURIComponent(viewingPost.title);
    const text = encodeURIComponent(viewingPost.excerpt || viewingPost.title);

    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${title}`,
      reddit: `https://reddit.com/submit?url=${url}&title=${title}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${url}&description=${title}`,
      tumblr: `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${url}&title=${title}`,
      email: `mailto:?subject=${title}&body=${text}%20${url}`,
    };

    return shareUrls[platform] || url;
  };

  const handleShare = (platform: string) => {
    const shareUrl = getShareUrl(platform);
    if (shareUrl) {
      if (platform === 'email') {
        window.location.href = shareUrl;
      } else {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.origin + '/blog';
    try {
      await navigator.clipboard.writeText(url);
      addNotification('success', 'Success', 'Link copied to clipboard!');
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
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-astral-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Unique Design */}
        <div className="relative mb-12">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-saffron-100/30 via-gold-100/20 to-astral-100/30 rounded-3xl blur-3xl"></div>
          
          {/* Main header card */}
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border-2 border-saffron-200 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-4">
                {/* Icon badge */}
                <div className="w-16 h-16 bg-gradient-to-br from-saffron-400 via-gold-500 to-astral-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <FileText className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-astral-900 via-saffron-600 to-gold-600 bg-clip-text text-transparent mb-2">
                    KeyVasthu Blog
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-saffron-500 rounded-full animate-pulse"></div>
                    <p className="text-base text-earth-600 font-medium">
                      {isAdmin
                        ? 'Manage blog posts and share KeyVasthu news'
                        : 'Latest news and updates from KeyVasthu'}
                    </p>
                  </div>
                </div>
              </div>
              {isAdmin && (
                <Button
                  onClick={handleCreateNew}
                  variant="primary"
                  leftIcon={<Plus size={20} />}
                  className="shadow-lg hover:shadow-xl transition-all duration-300 text-base px-6 py-3"
                >
                  New Post
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <Card className="text-center py-16 bg-gradient-to-br from-white to-cream-50 border-2 border-saffron-100 shadow-xl">
            <div className="w-24 h-24 bg-gradient-to-br from-saffron-100 to-gold-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FileText className="w-12 h-12 text-saffron-600" />
            </div>
            <h3 className="text-2xl font-display font-bold text-astral-900 mb-3">
              {isAdmin ? 'No blog posts yet' : 'No blog posts available'}
            </h3>
            <p className="text-earth-600 text-lg mb-6 max-w-md mx-auto">
              {isAdmin
                ? 'Create your first blog post to share news and updates with the KeyVasthu community'
                : 'Check back soon for exciting updates and insights'}
            </p>
            {isAdmin && (
              <Button
                onClick={handleCreateNew}
                variant="primary"
                className="shadow-lg hover:shadow-xl transition-all"
                leftIcon={<Plus size={18} />}
              >
                Create First Post
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col bg-white hover:shadow-2xl transition-all duration-300 border-2 border-earth-100 hover:border-saffron-300 group overflow-hidden relative">
                  {/* Decorative top border on hover */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-saffron-400 via-gold-500 to-astral-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge
                        variant={post.status === 'published' ? 'success' : 'neutral'}
                        size="sm"
                        className="shadow-sm"
                      >
                        {post.status}
                      </Badge>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(post)}
                            className="p-2 text-earth-600 hover:text-saffron-600 hover:bg-saffron-50 rounded-lg transition-all hover:scale-110"
                            aria-label="Edit post"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(post)}
                            className="p-2 text-earth-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                            aria-label="Delete post"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-display font-bold text-astral-900 mb-3 line-clamp-2 group-hover:text-saffron-600 transition-colors">
                      {post.title}
                    </h3>

                    {post.excerpt && (
                      <p className="text-earth-600 text-sm mb-5 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-earth-500 mb-4 pb-4 border-b border-earth-100">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 bg-gradient-to-br from-saffron-100 to-gold-100 rounded-full flex items-center justify-center">
                          <User size={10} className="text-saffron-600" />
                        </div>
                        <span className="font-medium">{post.author_name}</span>
                      </div>
                      {post.published_at && (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-saffron-500" />
                          <span>{formatDate(post.published_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {post.status === 'published' && (
                    <div className="px-6 pb-6">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-2 border-saffron-300 text-saffron-700 hover:bg-saffron-50 hover:border-saffron-400 font-medium transition-all"
                        onClick={() => handleViewPost(post)}
                        rightIcon={<Eye size={16} />}
                      >
                        Read More
                      </Button>
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

        {/* View Post Modal with Social Sharing */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewingPost(null);
          }}
          title={viewingPost?.title || 'Blog Post'}
          size="xl"
        >
          {viewingPost && (
            <div className="space-y-6">
              {/* Video Section */}
              {viewingPost.video_url && (
                <div className="w-full rounded-xl overflow-hidden shadow-2xl border-2 border-saffron-200">
                  <div className="relative w-full aspect-video bg-earth-100">
                    <iframe
                      src={viewingPost.video_url}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={viewingPost.title}
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="prose max-w-none">
                <div className="text-earth-600 whitespace-pre-wrap leading-relaxed">
                  {viewingPost.content}
                </div>
              </div>

              {/* Author & Date */}
              <div className="flex items-center gap-4 text-sm text-earth-500 border-t border-earth-100 pt-4">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{viewingPost.author_name}</span>
                </div>
                {viewingPost.published_at && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{formatDate(viewingPost.published_at)}</span>
                  </div>
                )}
              </div>

              {/* Social Sharing Section */}
              <div className="px-6 pt-6 pb-6 border-t-2 border-saffron-200 bg-gradient-to-br from-cream-50 to-white">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-saffron-400 to-gold-500 rounded-xl flex items-center justify-center shadow-md">
                    <Share2 className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-display font-bold text-astral-900">
                    Share this post
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
  );
};

export default Blog;

