import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Image, File, AlertCircle } from 'lucide-react';
import { cn, formatFileSize } from '../../utils/helpers';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  multiple?: boolean;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  maxSize = MAX_FILE_SIZE,
  acceptedTypes = ['image/*', '.pdf', '.jpg', '.jpeg', '.png', '.dwg', '.dxf'],
  multiple = true,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `${file.name} exceeds the maximum file size of ${formatFileSize(maxSize)}`;
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('/*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `${file.name} is not a supported file type. Accepted: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
      // Clear errors after a delay
      setTimeout(() => setErrors([]), 5000);
    }
  }, [maxSize, acceptedTypes, onFilesSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer',
          isDragging
            ? 'border-saffron-500 bg-saffron-50 scale-[1.02]'
            : 'border-earth-200 hover:border-saffron-400 hover:bg-saffron-50/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center text-center">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors',
            isDragging ? 'bg-saffron-500' : 'bg-earth-100'
          )}>
            <Upload
              size={32}
              className={cn(
                'transition-colors',
                isDragging ? 'text-white' : 'text-earth-400'
              )}
            />
          </div>
          
          <p className="text-lg font-medium text-earth-800 mb-2">
            {isDragging ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          
          <p className="text-sm text-earth-500 mb-4">
            or <span className="text-saffron-600 font-medium">browse</span> to choose files
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-earth-400">
            <span className="flex items-center gap-1">
              <Image size={14} />
              Images
            </span>
            <span className="flex items-center gap-1">
              <FileText size={14} />
              PDF
            </span>
            <span className="flex items-center gap-1">
              <File size={14} />
              DWG/DXF
            </span>
          </div>

          <p className="text-xs text-earth-400 mt-4">
            Maximum file size: {formatFileSize(maxSize)} • Multiple files supported
          </p>
        </div>
      </div>

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 space-y-2"
          >
            {errors.map((error, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploadZone;

