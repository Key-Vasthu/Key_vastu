import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Video,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Save,
  X,
  Image as ImageIcon,
  Calendar,
  Clock,
  User,
  Upload,
  Bold,
  Italic,
  List,
  Quote,
  Heading,
  Eye,
  CheckCircle,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
} from 'lucide-react';
import { Button, Loading, Modal } from '../components/common';
import { blogApi, type BlogPost } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { formatDate } from '../utils/helpers';

// Calculate estimated read time
const calculateReadTime = (content?: string, estimated?: number): string => {
  if (estimated) return `${estimated} min read`;
  if (!content) return '2 min read';
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return `${minutes} min read`;
};

// Full Detail View Modal Component
interface BlogDetailModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

// Share Modal Component
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: BlogPost | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, post }) => {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const shareUrl = post ? `${currentUrl}?post=${post.id}` : currentUrl;
  const shareTitle = post?.title || 'KeyVasthu Blog';
  const shareText = post?.excerpt || '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareToLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-bold text-astral-900">Share This Post</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-earth-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-earth-600" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Social Media Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={shareToFacebook}
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Facebook size={24} className="text-white" />
              </div>
              <span className="text-sm font-medium text-earth-700">Facebook</span>
            </button>

            <button
              onClick={shareToTwitter}
              className="flex flex-col items-center gap-2 p-4 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors group"
            >
              <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Twitter size={24} className="text-white" />
              </div>
              <span className="text-sm font-medium text-earth-700">Twitter</span>
            </button>

            <button
              onClick={shareToLinkedIn}
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
            >
              <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Linkedin size={24} className="text-white" />
              </div>
              <span className="text-sm font-medium text-earth-700">LinkedIn</span>
            </button>
          </div>

          {/* Copy Link */}
          <div className="pt-4 border-t border-earth-200">
            <label className="block text-sm font-semibold text-astral-900 mb-2">Copy Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 border border-earth-200 rounded-lg text-sm text-earth-600 bg-earth-50"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-saffron-600 hover:bg-saffron-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BlogDetailModal: React.FC<BlogDetailModalProps> = ({ post, isOpen, onClose }) => {
  const [showShareModal, setShowShareModal] = useState(false);

  if (!post) return null;

  // Parse HTML content safely
  const renderContent = (content: string) => {
    return { __html: content };
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
        <div className="space-y-6 -mx-6 -mt-6">
          {/* Featured Image */}
          {post.featured_image_url && (
            <div 
              className="w-full h-64 sm:h-80 overflow-hidden flex items-center justify-center"
              style={{
                backgroundColor: '#F6EDE3',
              }}
            >
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Content */}
          <div className="px-8 sm:px-12 pb-8 sm:pb-12 space-y-8">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-astral-900 leading-tight">
              {post.title}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-earth-600 pb-6 border-b border-earth-200">
              <div className="flex items-center gap-2">
                <User size={16} className="text-saffron-600" />
                <span className="font-medium">{post.author_name}</span>
              </div>
              {post.published_at && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-saffron-600" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-saffron-600" />
                <span>{calculateReadTime(post.content, post.estimated_read_time)}</span>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-1.5 bg-saffron-50 hover:bg-saffron-100 text-saffron-700 rounded-lg transition-colors ml-auto"
              >
                <Share2 size={16} />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <div className="pb-6 border-b border-earth-200">
                <p className="text-lg text-earth-700 leading-relaxed italic">
                  {post.excerpt}
                </p>
              </div>
            )}

            {/* Full Content */}
            <div
              className="prose prose-lg max-w-none text-earth-700 leading-relaxed"
              dangerouslySetInnerHTML={renderContent(post.content)}
              style={{
                lineHeight: '1.8',
              }}
            />
          </div>
        </div>
      </Modal>

      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} post={post} />
    </>
  );
};

// 3D Flip Card Component - Redesigned
interface Flip3DCardProps {
  post: BlogPost;
  index: number;
  onReadMore: (post: BlogPost) => void;
  onShare: (post: BlogPost) => void;
  flipDirection?: 'horizontal' | 'vertical';
}

const Flip3DCard: React.FC<Flip3DCardProps> = ({ 
  post, 
  index, 
  onReadMore,
  onShare,
  flipDirection = 'horizontal' 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReadMore(post);
  };

  // Determine transform based on flip direction
  const getTransform = (isBack: boolean) => {
    if (flipDirection === 'vertical') {
      return isBack ? 'rotateX(180deg)' : 'rotateX(0deg)';
    }
    return isBack ? 'rotateY(180deg)' : 'rotateY(0deg)';
  };

  const getCardTransform = () => {
    if (flipDirection === 'vertical') {
      return isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)';
    }
    return isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
  };

  // Calm palette colors
  const calmColors = {
    saffron: '#fb923c',
    beige: '#f5f5dc',
    white: '#ffffff',
    deepBlue: '#1e3a5f',
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="blog-card"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => {
        setIsHovered(true);
        setIsFlipped(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsFlipped(false);
      }}
    >
      <div
        className="relative w-full h-full cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
          transform: `${getCardTransform()} ${isHovered ? 'scale(1.02)' : 'scale(1)'}`,
        }}
      >
        {/* Front Side - Full-width Featured Image + Title */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: getTransform(false),
          }}
        >
          {/* Featured Image or Gradient Background */}
          <div className="relative w-full h-full">
            {post.featured_image_url ? (
              <div 
                className="relative w-full h-full overflow-hidden flex items-center justify-center"
                style={{
                  backgroundColor: '#F6EDE3',
                }}
              >
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-contain transition-transform duration-500"
                  style={{
                    objectPosition: 'center',
                    display: 'block',
                  }}
                />
              </div>
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(135deg, ${calmColors.deepBlue} 0%, ${calmColors.saffron} 100%)`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="text-white/80" size={64} />
                </div>
              </div>
            )}

            {/* Title Overlay - Positioned at bottom */}
            <div 
              className="absolute bottom-0 left-0 right-0 p-5 backdrop-blur-sm"
              style={{
                backgroundColor: '#F6EDE3',
              }}
            >
              <h3 className="text-lg font-display font-bold text-astral-900 line-clamp-2 leading-tight">
                {post.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Back Side - Title, Author, Date, Read-time, CTA */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: getTransform(true),
            backgroundColor: calmColors.white,
            boxShadow: '0 8px 24px rgba(30, 58, 95, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
            border: `1px solid ${calmColors.beige}`,
          }}
        >
          <div className="relative h-full flex flex-col p-6">
            {/* Title */}
            <h3 className="text-xl font-display font-bold text-astral-900 mb-4 line-clamp-2 leading-tight">
              {post.title}
            </h3>

            {/* Metadata Section */}
            <div className="space-y-3 mb-4 pb-4 border-b border-earth-200">
              <div className="flex items-center gap-2 text-sm text-earth-600">
                <User size={16} className="text-saffron-600" />
                <span className="font-medium">{post.author_name}</span>
              </div>
              {post.published_at && (
                <div className="flex items-center gap-2 text-sm text-earth-600">
                  <Calendar size={16} className="text-saffron-600" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-earth-600">
                <Clock size={16} className="text-saffron-600" />
                <span>{calculateReadTime(post.content, post.estimated_read_time)}</span>
              </div>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <div className="mb-4 flex-1 overflow-y-auto">
                <p className="text-sm text-earth-600 leading-relaxed line-clamp-4">
                  {post.excerpt}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 mt-auto">
              {/* CTA Button - Bold "Read Insights" */}
              {post.status === 'published' && (
                <button
                  onClick={handleReadMore}
                  className="relative w-full py-3.5 px-6 bg-saffron-600 hover:bg-saffron-700 text-white font-bold rounded-lg transition-all duration-300 group/btn shadow-lg hover:shadow-xl hover:scale-105"
                  style={{ fontSize: '16px' }}
                  aria-label={`Read full insights: ${post.title}`}
                >
                  <span className="relative flex items-center justify-center gap-2">
                    Read Insights
                    <ArrowRight
                      size={18}
                      className="relative transition-transform duration-300 group-hover/btn:translate-x-1"
                    />
                  </span>
                </button>
              )}
              {/* Share Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(post);
                }}
                className="relative w-full py-2.5 px-6 bg-white border-2 border-saffron-300 hover:border-saffron-400 text-saffron-700 font-medium rounded-lg transition-all duration-300 group/share flex items-center justify-center gap-2"
                aria-label="Share this post"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Simple Rich Text Editor Component
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-earth-200/50 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-earth-50 border-b border-earth-200/50">
        <button
          type="button"
          onClick={() => applyFormat('bold')}
          className="p-2 hover:bg-white rounded transition-colors"
          title="Bold"
          aria-label="Bold"
        >
          <Bold size={16} className="text-earth-700" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('italic')}
          className="p-2 hover:bg-white rounded transition-colors"
          title="Italic"
          aria-label="Italic"
        >
          <Italic size={16} className="text-earth-700" />
        </button>
        <div className="w-px h-6 bg-earth-200 mx-1" />
        <button
          type="button"
          onClick={() => applyFormat('formatBlock', '<h2>')}
          className="p-2 hover:bg-white rounded transition-colors"
          title="Heading"
          aria-label="Heading"
        >
          <Heading size={16} className="text-earth-700" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('insertUnorderedList')}
          className="p-2 hover:bg-white rounded transition-colors"
          title="Bullet List"
          aria-label="Bullet List"
        >
          <List size={16} className="text-earth-700" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('formatBlock', '<blockquote>')}
          className="p-2 hover:bg-white rounded transition-colors"
          title="Quote"
          aria-label="Quote"
        >
          <Quote size={16} className="text-earth-700" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[200px] p-4 text-earth-900 focus:outline-none prose max-w-none"
        style={{
          lineHeight: '1.8',
        }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder || 'Start writing your blog content...'}
      />
    </div>
  );
};

const Blog: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const isAdmin = user?.role === 'admin';

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingPost, setEditingPost] = useState({
    title: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    author_name: user?.name || user?.email || '',
    publish_date: '',
    estimated_read_time: '',
    status: 'draft' as 'draft' | 'published',
  });
  const [imageUploaded, setImageUploaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePost, setSharePost] = useState<BlogPost | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CARDS_PER_VIEW = 3;
  const CARD_GAP = 32;
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(320);

  // Calculate card width
  useEffect(() => {
    const updateCardWidth = () => {
      if (containerRef.current) {
        const parentContainer = containerRef.current.closest('.main-blog-section') as HTMLElement;
        const pageWidth = parentContainer ? parentContainer.offsetWidth : window.innerWidth;

        const getMainSectionPadding = () => {
          if (window.innerWidth >= 1024) return 32 * 2;
          if (window.innerWidth >= 640) return 24 * 2;
          return 16 * 2;
        };

        const mainSectionPadding = getMainSectionPadding();
        const carouselPadding = 48;
        const gaps = CARD_GAP * 2;

        const availableWidth = pageWidth - mainSectionPadding - carouselPadding - gaps;
        const calculatedWidth = Math.floor(availableWidth / CARDS_PER_VIEW);
        setCardWidth(Math.max(calculatedWidth, 300));
      }
    };

    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, []);

  const CARD_TOTAL = cardWidth + CARD_GAP;
  const maxIndex = Math.max(0, posts.length - CARDS_PER_VIEW);

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const canGoNext = currentIndex < maxIndex;
  const canGoPrevious = currentIndex > 0;

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [posts.length]);

  const loadPosts = async () => {
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setPosts([]);
    }, 15000);

    try {
      const response = isAdmin ? await blogApi.getAdminPosts() : await blogApi.getPosts();
      clearTimeout(timeoutId);

      if (response.success) {
        const sortedPosts = (response.data || []).sort((a, b) => {
          const dateA = new Date(a.created_at || a.published_at || 0).getTime();
          const dateB = new Date(b.created_at || b.published_at || 0).getTime();
          return dateB - dateA;
        });
        setPosts(sortedPosts);
        setCurrentIndex(0);
      } else {
        setPosts([]);
        setCurrentIndex(0);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error loading posts:', error);
      setPosts([]);
      setCurrentIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingPost({
      title: '',
      excerpt: '',
      content: '',
      featured_image_url: '',
      author_name: user?.name || user?.email || '',
      publish_date: '',
      estimated_read_time: '',
      status: 'draft',
    });
    setImageUploaded(false);
    setShowPreview(false);
    setShowPublishConfirm(false);
    setIsCreateModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, we'll use a URL. In production, upload to server
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEditingPost({ ...editingPost, featured_image_url: result });
        setImageUploaded(true);
        addNotification('success', 'Success', 'Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    if (!user) {
      addNotification('error', 'Authentication Error', 'You must be logged in to create posts');
      return;
    }

    setIsSaving(true);
    try {
      const postData = {
        title: editingPost.title.trim(),
        content: editingPost.content.trim() || editingPost.excerpt.trim(),
        excerpt: editingPost.excerpt.trim(),
        featured_image_url: editingPost.featured_image_url || undefined,
        estimated_read_time: editingPost.estimated_read_time
          ? parseInt(editingPost.estimated_read_time)
          : undefined,
        author_id: user.id,
        author_name: editingPost.author_name.trim() || user.name || user.email || 'Admin',
        status: 'draft' as const,
      };

      const response = await blogApi.createPost(postData);

      if (response.success && response.data) {
        addNotification('success', 'Success', 'Blog post saved as draft!');
        setIsCreateModalOpen(false);
        resetForm();
        await loadPosts();
      } else {
        addNotification('error', 'Error', response.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      addNotification('error', 'Error', 'Failed to save blog post');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    if (!user) {
      addNotification('error', 'Authentication Error', 'You must be logged in to create posts');
      return;
    }

    if (!showPublishConfirm) {
      setShowPublishConfirm(true);
      return;
    }

    setIsSaving(true);
    try {
      const postData = {
        title: editingPost.title.trim(),
        content: editingPost.content.trim() || editingPost.excerpt.trim(),
        excerpt: editingPost.excerpt.trim(),
        featured_image_url: editingPost.featured_image_url || undefined,
        estimated_read_time: editingPost.estimated_read_time
          ? parseInt(editingPost.estimated_read_time)
          : undefined,
        author_id: user.id,
        author_name: editingPost.author_name.trim() || user.name || user.email || 'Admin',
        status: 'published' as const,
      };

      const response = await blogApi.createPost(postData);

      if (response.success && response.data) {
        addNotification('success', 'Success', 'Blog post published successfully!');
        setIsCreateModalOpen(false);
        resetForm();
        await loadPosts();
      } else {
        addNotification('error', 'Error', response.error || 'Failed to publish post');
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      addNotification('error', 'Error', 'Failed to publish blog post');
    } finally {
      setIsSaving(false);
      setShowPublishConfirm(false);
    }
  };

  const validateForm = (): boolean => {
    if (!editingPost.title.trim()) {
      addNotification('error', 'Validation Error', 'Title is required');
      return false;
    }
    if (!editingPost.excerpt.trim() && !editingPost.content.trim()) {
      addNotification('error', 'Validation Error', 'Excerpt or content is required');
      return false;
    }
    if (!editingPost.author_name.trim()) {
      addNotification('error', 'Validation Error', 'Author name is required');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setEditingPost({
      title: '',
      excerpt: '',
      content: '',
      featured_image_url: '',
      author_name: user?.name || user?.email || '',
      publish_date: '',
      estimated_read_time: '',
      status: 'draft',
    });
    setImageUploaded(false);
    setShowPreview(false);
    setShowPublishConfirm(false);
  };

  const handleReadMore = (post: BlogPost) => {
    setSelectedPost(post);
    setIsDetailModalOpen(true);
  };

  const handleShare = (post: BlogPost) => {
    setSharePost(post);
    setShowShareModal(true);
  };

  // Create preview post for live preview
  const previewPost: BlogPost | null = editingPost.title
    ? {
        id: 'preview',
        title: editingPost.title,
        content: editingPost.content || editingPost.excerpt,
        excerpt: editingPost.excerpt,
        featured_image_url: editingPost.featured_image_url || undefined,
        estimated_read_time: editingPost.estimated_read_time
          ? parseInt(editingPost.estimated_read_time)
          : undefined,
        author_id: user?.id || '',
        author_name: editingPost.author_name || user?.name || 'Author',
        status: editingPost.status,
        published_at: editingPost.publish_date || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading fullScreen text="Loading blog posts..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-astral-50 py-12">
      <div className="main-blog-section px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative mb-12">
          <div className="relative backdrop-blur-xl bg-transparent rounded-3xl p-8 border border-saffron-200/50 shadow-[0_8px_32px_0_rgba(251,146,60,0.2)]">
            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 backdrop-blur-lg bg-transparent rounded-2xl flex items-center justify-center border border-saffron-300/50 shadow-[0_8px_32px_0_rgba(251,146,60,0.3)] flex-shrink-0">
                    <FileText className="relative text-saffron-600 drop-shadow-lg" size={28} />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-astral-900 via-saffron-600 to-gold-600 bg-clip-text text-transparent mb-2 drop-shadow-sm">
                      KeyVasthu Blog
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-saffron-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,146,60,0.6)]"></div>
                      <p className="text-base text-earth-600 font-medium">
                        {isAdmin
                          ? 'Manage blog posts and share KeyVasthu insights'
                          : 'Latest insights and wisdom from KeyVasthu'}
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
                    Create Blog
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Blog Cards Carousel */}
        {posts.length > 0 ? (
          <div className="relative">
            <button
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className={`
                absolute left-0 top-1/2 -translate-y-1/2 z-20
                w-12 h-12 rounded-full flex items-center justify-center
                transition-all duration-300 ease-out
                ${canGoPrevious
                  ? 'bg-white/90 backdrop-blur-sm text-saffron-600 hover:text-saffron-700 cursor-pointer shadow-lg hover:shadow-xl border border-saffron-200/50 hover:border-saffron-300/70 hover:scale-110'
                  : 'bg-white/50 text-earth-300 cursor-not-allowed opacity-40'
                }
              `}
              aria-label="Previous cards"
              style={{
                transform: 'translateY(-50%) translateX(-50%)',
                boxShadow: canGoPrevious
                  ? '0 4px 12px rgba(251, 146, 60, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)'
                  : '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                if (canGoPrevious) {
                  e.currentTarget.style.boxShadow =
                    '0 8px 24px rgba(251, 146, 60, 0.4), 0 4px 8px rgba(251, 146, 60, 0.2), 0 0 0 4px rgba(251, 146, 60, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (canGoPrevious) {
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(251, 146, 60, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>

            <div
              ref={containerRef}
              className="blog-cards-container"
              style={{
                perspective: '1200px',
                perspectiveOrigin: 'center center',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
              }}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(calc(50% - ${(CARDS_PER_VIEW * cardWidth + (CARDS_PER_VIEW - 1) * CARD_GAP) / 2}px - ${currentIndex * CARD_TOTAL}px))`,
                  willChange: 'transform',
                  minWidth: 'fit-content',
                }}
              >
                {posts.map((post, index) => (
                  <div
                    key={post.id}
                    style={{
                      width: `${cardWidth}px`,
                      flexShrink: 0,
                      marginRight: index < posts.length - 1 ? `${CARD_GAP}px` : '0',
                    }}
                  >
                    <Flip3DCard post={post} index={index} onReadMore={handleReadMore} onShare={handleShare} />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`
                absolute right-0 top-1/2 -translate-y-1/2 z-20
                w-12 h-12 rounded-full flex items-center justify-center
                transition-all duration-300 ease-out
                ${canGoNext
                  ? 'bg-white/90 backdrop-blur-sm text-saffron-600 hover:text-saffron-700 cursor-pointer shadow-lg hover:shadow-xl border border-saffron-200/50 hover:border-saffron-300/70 hover:scale-110'
                  : 'bg-white/50 text-earth-300 cursor-not-allowed opacity-40'
                }
              `}
              aria-label="Next cards"
              style={{
                transform: 'translateY(-50%) translateX(50%)',
                boxShadow: canGoNext
                  ? '0 4px 12px rgba(251, 146, 60, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)'
                  : '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                if (canGoNext) {
                  e.currentTarget.style.boxShadow =
                    '0 8px 24px rgba(251, 146, 60, 0.4), 0 4px 8px rgba(251, 146, 60, 0.2), 0 0 0 4px rgba(251, 146, 60, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (canGoNext) {
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(251, 146, 60, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>

            {posts.length > CARDS_PER_VIEW && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => {
                  const isActive = currentIndex === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`
                        transition-all duration-300 rounded-full
                        ${isActive
                          ? 'w-2.5 h-2.5 bg-earth-700'
                          : 'w-2 h-2 bg-earth-400 hover:bg-earth-500'
                        }
                      `}
                      aria-label={`Go to position ${index + 1}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="relative w-24 h-24 backdrop-blur-xl bg-transparent rounded-full flex items-center justify-center mx-auto mb-6 border border-saffron-200/50 shadow-[0_8px_32px_0_rgba(251,146,60,0.2)]">
              <FileText className="relative w-12 h-12 text-saffron-600" />
            </div>
            <h3 className="text-2xl font-display font-bold text-astral-900 mb-3">
              No blog posts available
            </h3>
            <p className="text-earth-600 text-lg">
              Check back soon for exciting insights and updates
            </p>
          </div>
        )}

        {/* Create Blog Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            resetForm();
          }}
          title=""
          size="xl"
        >
          <div className="space-y-6 -mx-6 -mt-6">
            {/* Header */}
            <div className="px-6 sm:px-20 pt-6 pb-4 backdrop-blur-xl bg-transparent border-b border-saffron-200/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative w-10 h-10 backdrop-blur-lg bg-gradient-to-br from-saffron-400 to-gold-500 rounded-xl flex items-center justify-center border border-saffron-300/50 shadow-[0_8px_32px_0_rgba(251,146,60,0.3)]">
                  <Plus className="text-white drop-shadow-sm" size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-astral-900">
                    Create New Blog Post
                  </h2>
                  <p className="text-sm text-earth-600 mt-0.5">
                    Fill in the details to create a new blog post
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="px-6 sm:px-20 pt-6 space-y-6 max-h-[65vh] overflow-y-auto">
              {/* Title */}
              <div className="space-y-3">
                <label htmlFor="blog-title" className="block text-sm font-semibold text-astral-900">
                  <span className="flex items-center gap-2">
                    Title
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  id="blog-title"
                  type="text"
                  value={editingPost.title}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, title: e.target.value })
                  }
                  className="w-full px-4 py-3 backdrop-blur-lg bg-transparent border border-earth-200/50 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-all text-earth-900 placeholder:text-earth-400 text-base"
                  placeholder="Enter a compelling blog post title"
                />
              </div>

              {/* Featured Image */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-astral-900">
                  Featured Image
                </label>
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setImageUploaded(false);
                    }}
                    className="w-full px-4 py-3 border-2 border-dashed border-earth-300 rounded-xl hover:border-saffron-500 transition-colors flex items-center justify-center gap-2 text-earth-600 hover:text-saffron-600"
                  >
                    <Upload size={20} />
                    <span>Upload Featured Image</span>
                  </button>
                  {imageUploaded && editingPost.featured_image_url && (
                    <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
                      <CheckCircle size={20} className="text-green-600" />
                      <span className="text-sm font-medium">Image uploaded successfully</span>
                      <button
                        type="button"
                        onClick={() => {
                          setImageUploaded(false);
                          setEditingPost({ ...editingPost, featured_image_url: '' });
                        }}
                        className="ml-auto p-1 hover:bg-green-100 rounded transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Author Name */}
              <div className="space-y-3">
                <label htmlFor="blog-author" className="block text-sm font-semibold text-astral-900">
                  <span className="flex items-center gap-2">
                    Author Name
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  id="blog-author"
                  type="text"
                  value={editingPost.author_name}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, author_name: e.target.value })
                  }
                  className="w-full px-4 py-3 backdrop-blur-lg bg-transparent border border-earth-200/50 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-all text-earth-900 placeholder:text-earth-400 text-base"
                  placeholder="Author name"
                />
              </div>

              {/* Publish Date */}
              <div className="space-y-3">
                <label htmlFor="blog-date" className="block text-sm font-semibold text-astral-900">
                  Publish Date
                </label>
                <input
                  id="blog-date"
                  type="date"
                  value={editingPost.publish_date}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, publish_date: e.target.value })
                  }
                  className="w-full px-4 py-3 backdrop-blur-lg bg-transparent border border-earth-200/50 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-all text-earth-900 text-base"
                />
              </div>

              {/* Estimated Read Time */}
              <div className="space-y-3">
                <label htmlFor="blog-read-time" className="block text-sm font-semibold text-astral-900">
                  Estimated Read Time (minutes)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="blog-read-time"
                    type="number"
                    min="1"
                    value={editingPost.estimated_read_time}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, estimated_read_time: e.target.value })
                    }
                    className="flex-1 px-4 py-3 backdrop-blur-lg bg-transparent border border-earth-200/50 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-all text-earth-900 text-base"
                    placeholder="Auto-calculate if empty"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const content = editingPost.content || editingPost.excerpt;
                      if (content) {
                        const words = content.trim().split(/\s+/).length;
                        const minutes = Math.max(1, Math.ceil(words / 200));
                        setEditingPost({ ...editingPost, estimated_read_time: minutes.toString() });
                      }
                    }}
                    className="px-4 py-3 bg-earth-100 hover:bg-earth-200 text-earth-700 rounded-xl transition-colors text-sm font-medium"
                  >
                    Auto
                  </button>
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-3">
                <label htmlFor="blog-excerpt" className="block text-sm font-semibold text-astral-900">
                  <span className="flex items-center gap-2">
                    Excerpt
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <textarea
                  id="blog-excerpt"
                  value={editingPost.excerpt}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, excerpt: e.target.value })
                  }
                  className="w-full px-4 py-3 backdrop-blur-lg bg-transparent border border-earth-200/50 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-all text-earth-900 placeholder:text-earth-400 resize-none text-base"
                  placeholder="Write a brief summary that will appear in the blog preview..."
                  rows={3}
                />
              </div>

              {/* Content - Rich Text Editor */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-astral-900">
                  Content
                </label>
                <RichTextEditor
                  value={editingPost.content}
                  onChange={(value) => setEditingPost({ ...editingPost, content: value })}
                  placeholder="Start writing your blog content..."
                />
              </div>

              {/* Live Preview Toggle */}
              <div className="flex items-center justify-between pt-4 border-t border-earth-200">
                <label className="flex items-center gap-2 text-sm font-medium text-astral-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPreview}
                    onChange={(e) => setShowPreview(e.target.checked)}
                    className="w-4 h-4 text-saffron-600 rounded focus:ring-saffron-500"
                  />
                  <Eye size={16} />
                  <span>Show Live Preview</span>
                </label>
              </div>

              {/* Live Preview */}
              {showPreview && previewPost && (
                <div className="pt-4 border-t border-earth-200">
                  <h3 className="text-sm font-semibold text-astral-900 mb-4">Preview</h3>
                  <div style={{ width: `${cardWidth}px`, margin: '0 auto' }}>
                    <Flip3DCard
                      post={previewPost}
                      index={0}
                      onReadMore={() => {}}
                      onShare={() => {}}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end px-6 sm:px-20 pt-4 pb-6 border-t border-saffron-200/50 backdrop-blur-xl bg-transparent sticky bottom-0">
              {showPublishConfirm && (
                <div className="w-full sm:w-auto mb-2 sm:mb-0">
                  <div className="bg-saffron-50 border border-saffron-200 rounded-xl p-3 flex items-center gap-2 text-sm text-saffron-800">
                    <CheckCircle size={16} />
                    <span>Are you sure you want to publish this post?</span>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveDraft}
                  variant="outline"
                  size="sm"
                  disabled={isSaving}
                  leftIcon={<Save size={16} />}
                  className="border-2 hover:bg-earth-50 !px-4 !py-2 !text-sm !gap-2"
                >
                  Save Draft
                </Button>
                <Button
                  onClick={handlePublish}
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  leftIcon={
                    isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : showPublishConfirm ? (
                      <CheckCircle size={16} />
                    ) : (
                      <ArrowRight size={16} />
                    )
                  }
                  className="!px-4 !py-2 !text-sm !gap-2"
                >
                  {isSaving
                    ? 'Publishing...'
                    : showPublishConfirm
                    ? 'Confirm Publish'
                    : 'Publish'}
                </Button>
                <Button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                  variant="outline"
                  size="sm"
                  leftIcon={<X size={16} />}
                  className="border-2 hover:bg-earth-50 !px-4 !py-2 !text-sm !gap-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Blog Detail Modal */}
        <BlogDetailModal
          post={selectedPost}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedPost(null);
          }}
        />

        {/* Share Modal */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSharePost(null);
          }}
          post={sharePost}
        />
      </div>
    </div>
  );
};

export default Blog;
