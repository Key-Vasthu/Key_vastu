import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, File, Download, Share2, X, Tag, Calendar } from 'lucide-react';
import { formatFileSize, formatDate } from '../../utils/helpers';
import { Button } from '../common';
import type { ManagedFile } from '../../types';

interface FilePreviewProps {
  file: ManagedFile;
  onDownload?: (file: ManagedFile) => void;
  onShare?: (file: ManagedFile) => void;
  onDelete?: (file: ManagedFile) => void;
  onTagClick?: (tag: string) => void;
  showActions?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onDownload,
  onShare,
  onDelete,
  onTagClick,
  showActions = true,
}) => {
  const [thumbnailError, setThumbnailError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getFileIcon = () => {
    switch (file.type) {
      case 'image':
        return <Image size={24} className="text-saffron-500" />;
      case 'document':
        return <FileText size={24} className="text-astral-500" />;
      case 'drawing':
        return <File size={24} className="text-gold-500" />;
      default:
        return <File size={24} className="text-earth-400" />;
    }
  };

  const isImage = file.type === 'image' && (file.mimeType?.startsWith('image/') || file.thumbnailUrl);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl border border-earth-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Thumbnail/Preview */}
      <div className="relative aspect-video bg-earth-50 flex items-center justify-center overflow-hidden">
        {isImage && file.thumbnailUrl && !thumbnailError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <img
              src={file.thumbnailUrl}
              alt={file.name}
              className={cn(
                'w-full h-full object-cover transition-opacity',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setThumbnailError(true)}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6">
            {getFileIcon()}
            <p className="text-xs text-earth-500 mt-2 text-center px-2">
              {file.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
            </p>
          </div>
        )}

        {/* Category Badge */}
        {file.category && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-earth-700">
              {file.category}
            </span>
          </div>
        )}

        {/* Actions Overlay */}
        {showActions && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
            {onDownload && (
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(file);
                }}
                leftIcon={<Download size={16} />}
              >
                Download
              </Button>
            )}
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(file);
                }}
                leftIcon={<Share2 size={16} />}
                className="bg-white"
              >
                Share
              </Button>
            )}
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="p-4">
        <h3 className="font-medium text-earth-800 truncate mb-1" title={file.name}>
          {file.name}
        </h3>

        {/* Metadata */}
        <div className="space-y-1.5 text-xs text-earth-500 mb-3">
          <div className="flex items-center gap-1">
            <FileText size={12} />
            <span>{formatFileSize(file.size)}</span>
            {file.metadata?.width && file.metadata?.height && (
              <span className="ml-2">
                • {file.metadata.width} × {file.metadata.height}px
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formatDate(file.uploadedAt, 'short')}</span>
          </div>
        </div>

        {/* Tags */}
        {file.tags && file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {file.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-saffron-50 text-saffron-700 rounded-md text-xs hover:bg-saffron-100 transition-colors"
              >
                <Tag size={10} />
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 pt-2 border-t border-earth-100">
            {onDownload && (
              <button
                onClick={() => onDownload(file)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-earth-600 hover:text-saffron-600 hover:bg-saffron-50 rounded-lg transition-colors"
              >
                <Download size={14} />
                Download
              </button>
            )}
            {onShare && (
              <button
                onClick={() => onShare(file)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-earth-600 hover:text-astral-600 hover:bg-astral-50 rounded-lg transition-colors"
              >
                <Share2 size={14} />
                Share
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(file)}
                className="p-1.5 text-earth-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Helper function for className
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export default FilePreview;

