import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Search,
  Grid,
  List,
  Tag,
  Folder,
  Download,
  Share2,
  Trash2,
} from 'lucide-react';
import { Button, Card, Input, Badge, Modal, Loading } from '../components/common';
import FileUploadZone from '../components/file/FileUploadZone';
import FilePreview from '../components/file/FilePreview';
import { fileManagementApi } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';
import { cn } from '../utils/helpers';
import type { ManagedFile, FileCategory } from '../types';

const FileManagement: React.FC = () => {
  const { addNotification } = useNotification();
  
  const [files, setFiles] = useState<ManagedFile[]>([]);
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ManagedFile | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  

  // Load files and categories
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [filesResponse, categoriesResponse] = await Promise.all([
          fileManagementApi.getFiles(),
          fileManagementApi.getCategories(),
        ]);

        if (filesResponse.success && filesResponse.data) {
          setFiles(filesResponse.data);
          // Extract unique tags
          const allTags = new Set<string>();
          filesResponse.data.forEach(file => {
            file.tags.forEach(tag => allTags.add(tag));
          });
          setAvailableTags(Array.from(allTags));
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        addNotification('error', 'Error', 'Failed to load files.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [addNotification]);

  // Filter files
  const filteredFiles = files.filter(file => {
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    if (selectedCategory && file.category !== selectedCategory) {
      return false;
    }
    if (selectedTags.length > 0 && !selectedTags.some(tag => file.tags.includes(tag))) {
      return false;
    }
    return true;
  });

  // Handle file upload
  const handleFilesSelected = async (selectedFiles: File[]) => {
    setIsUploading(true);
    
    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const response = await fileManagementApi.uploadFileWithMetadata(
          file,
          { tags: [], category: selectedCategory || undefined }
        );
        return response;
      });

      const results = await Promise.all(uploadPromises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        // Reload files
        const filesResponse = await fileManagementApi.getFiles();
        if (filesResponse.success && filesResponse.data) {
          setFiles(filesResponse.data);
          const allTags = new Set<string>();
          filesResponse.data.forEach(file => {
            file.tags.forEach(tag => allTags.add(tag));
          });
          setAvailableTags(Array.from(allTags));
        }

        addNotification(
          'success',
          'Upload Complete',
          `${successful.length} file(s) uploaded successfully.`
        );
      }

      if (failed.length > 0) {
        addNotification('error', 'Upload Failed', `${failed.length} file(s) failed to upload.`);
      }

      setShowUploadModal(false);
    } catch (error) {
      addNotification('error', 'Error', 'Failed to upload files.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle download
  const handleDownload = async (file: ManagedFile) => {
    try {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addNotification('success', 'Download Started', `Downloading ${file.name}...`);
    } catch (error) {
      addNotification('error', 'Download Failed', 'Failed to download file.');
    }
  };

  // Handle share
  const handleShare = async (file: ManagedFile) => {
    setSelectedFile(file);
    try {
      const response = await fileManagementApi.generateShareLink(file.id);
      if (response.success && response.data) {
        setShareUrl(response.data.shareUrl);
        setShowShareModal(true);
      }
    } catch (error) {
      addNotification('error', 'Error', 'Failed to generate share link.');
    }
  };

  // Handle delete
  const handleDelete = async (file: ManagedFile) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return;

    try {
      const response = await fileManagementApi.deleteFile(file.id);
      if (response.success) {
        setFiles(prev => prev.filter(f => f.id !== file.id));
        addNotification('success', 'File Deleted', `${file.name} has been deleted.`);
      } else {
        addNotification('error', 'Delete Failed', response.error || 'Failed to delete file.');
      }
    } catch (error) {
      addNotification('error', 'Error', 'Failed to delete file.');
    }
  };


  // Copy share URL
  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    addNotification('success', 'Copied!', 'Share link copied to clipboard.');
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading files..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-earth-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-astral-500 mb-2">
              File Management
            </h1>
            <p className="text-earth-500">
              Upload, organize, and manage your files ({filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'})
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Upload size={18} />}
            onClick={() => setShowUploadModal(true)}
          >
            Upload Files
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <Input
                placeholder="Search files by name or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={18} />}
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-earth-50 border-0 rounded-xl focus:ring-2 focus:ring-gold-500 text-earth-800"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'grid' ? 'bg-saffron-100 text-saffron-600' : 'text-earth-400 hover:text-earth-600'
                )}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'list' ? 'bg-saffron-100 text-saffron-600' : 'text-earth-400 hover:text-earth-600'
                )}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Tag Filters */}
          {availableTags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-earth-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-earth-500">Filter by tags:</span>
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTags(prev =>
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                      );
                    }}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                      selectedTags.includes(tag)
                        ? 'bg-saffron-500 text-white'
                        : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
                    )}
                  >
                    <Tag size={12} className="inline mr-1" />
                    {tag}
                  </button>
                ))}
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Files Grid/List */}
        {filteredFiles.length === 0 ? (
          <Card className="text-center py-12">
            <Folder size={64} className="text-earth-300 mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold text-earth-700 mb-2">
              No files found
            </h3>
            <p className="text-earth-500 mb-6">
              {searchQuery || selectedCategory || selectedTags.length > 0
                ? 'Try adjusting your filters'
                : 'Upload your first file to get started'}
            </p>
            {!searchQuery && !selectedCategory && selectedTags.length === 0 && (
              <Button variant="primary" leftIcon={<Upload size={18} />} onClick={() => setShowUploadModal(true)}>
                Upload Files
              </Button>
            )}
          </Card>
        ) : (
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          )}>
            <AnimatePresence mode="popLayout">
              {filteredFiles.map((file) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={viewMode === 'list' ? 'flex gap-4' : ''}
                >
                  {viewMode === 'list' ? (
                    <Card className="flex-1 flex items-center gap-4 p-4">
                      <div className="w-20 h-20 bg-earth-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        {file.type === 'image' ? (
                          <img src={file.thumbnailUrl || file.url} alt={file.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <FilePreview file={file} showActions={false} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-earth-800 truncate">{file.name}</h3>
                        <p className="text-sm text-earth-500">{file.category || 'Uncategorized'}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {file.tags.map(tag => (
                            <Badge key={tag} variant="neutral" size="sm">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(file)}>
                          <Download size={18} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleShare(file)}>
                          <Share2 size={18} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(file)}>
                          <Trash2 size={18} className="text-red-500" />
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <FilePreview
                      file={file}
                      onDownload={handleDownload}
                      onShare={handleShare}
                      onDelete={handleDelete}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Upload Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => !isUploading && setShowUploadModal(false)}
          title="Upload Files"
          size="lg"
        >
          <div className="p-6">
            <FileUploadZone
              onFilesSelected={handleFilesSelected}
              maxSize={50 * 1024 * 1024}
              acceptedTypes={['image/*', '.pdf', '.jpg', '.jpeg', '.png', '.dwg', '.dxf']}
              multiple={true}
              disabled={isUploading}
            />
            {isUploading && (
              <div className="mt-4 text-center">
                <Loading text="Uploading files..." />
              </div>
            )}
          </div>
        </Modal>

        {/* Share Modal */}
        <Modal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="Share File"
        >
          <div className="p-6">
            {selectedFile && (
              <>
                <p className="text-earth-600 mb-4">Share link for: <strong>{selectedFile.name}</strong></p>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="flex-1" />
                  <Button variant="primary" onClick={handleCopyShareUrl}>
                    Copy
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default FileManagement;

