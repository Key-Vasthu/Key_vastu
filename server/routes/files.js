import express from 'express';
import multer from 'multer';
import { uploadToR2, deleteFromR2, isR2Configured } from '../storage/r2.js';
import { query } from '../db/connection.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types, but you can add restrictions here
    cb(null, true);
  },
});

/**
 * Upload a file to Cloudflare R2
 * POST /api/files/upload
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!isR2Configured()) {
      return res.status(500).json({
        success: false,
        error: 'R2 storage is not configured. Please check your environment variables.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
      });
    }

    const { file } = req;
    const { folder = 'uploads', category, tags } = req.body;

    // Determine file type
    let fileType = 'other';
    if (file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      fileType = 'document';
    } else if (file.originalname.endsWith('.dwg') || file.originalname.endsWith('.dxf')) {
      fileType = 'drawing';
    }

    // Upload to R2
    const uploadResult = await uploadToR2(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder
    );

    // Save file metadata to database (optional, if you have a files table)
    // You can create a files table similar to message_attachments

    res.json({
      success: true,
      data: {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.originalname,
        type: fileType,
        mimeType: file.mimetype,
        size: file.size,
        url: uploadResult.url,
        key: uploadResult.key,
        uploadedAt: new Date().toISOString(),
        category: category || null,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload file',
    });
  }
});

/**
 * Upload multiple files to Cloudflare R2
 * POST /api/files/upload-multiple
 */
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!isR2Configured()) {
      return res.status(500).json({
        success: false,
        error: 'R2 storage is not configured. Please check your environment variables.',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided',
      });
    }

    const { folder = 'uploads', category, tags } = req.body;
    const uploadedFiles = [];

    for (const file of req.files) {
      // Determine file type
      let fileType = 'other';
      if (file.mimetype.startsWith('image/')) {
        fileType = 'image';
      } else if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
        fileType = 'document';
      } else if (file.originalname.endsWith('.dwg') || file.originalname.endsWith('.dxf')) {
        fileType = 'drawing';
      }

      // Upload to R2
      const uploadResult = await uploadToR2(
        file.buffer,
        file.originalname,
        file.mimetype,
        folder
      );

      uploadedFiles.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.originalname,
        type: fileType,
        mimeType: file.mimetype,
        size: file.size,
        url: uploadResult.url,
        key: uploadResult.key,
        uploadedAt: new Date().toISOString(),
        category: category || null,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
      });
    }

    res.json({
      success: true,
      data: uploadedFiles,
    });
  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload files',
    });
  }
});

/**
 * Delete a file from Cloudflare R2
 * DELETE /api/files/:key
 */
router.delete('/:key', async (req, res) => {
  try {
    if (!isR2Configured()) {
      return res.status(500).json({
        success: false,
        error: 'R2 storage is not configured. Please check your environment variables.',
      });
    }

    const { key } = req.params;
    const decodedKey = decodeURIComponent(key);

    await deleteFromR2(decodedKey);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete file',
    });
  }
});

export { router as fileRoutes };
