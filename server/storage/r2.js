import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

// Initialize S3 client for Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

/**
 * Upload a file to Cloudflare R2
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name
 * @param {string} contentType - MIME type
 * @param {string} folder - Optional folder path (e.g., 'uploads', 'images')
 * @returns {Promise<{url: string, key: string}>}
 */
export async function uploadToR2(fileBuffer, fileName, contentType, folder = 'uploads') {
  try {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${timestamp}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await r2Client.send(command);

    // Generate public URL
    const url = `${process.env.R2_PUBLIC_URL}/${key}`;

    return {
      url,
      key,
      bucket: BUCKET_NAME,
    };
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error(`Failed to upload file to R2: ${error.message}`);
  }
}

/**
 * Get a signed URL for a file (for private files)
 * @param {string} key - File key in R2
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600)
 * @returns {Promise<string>}
 */
export async function getSignedUrlForFile(key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(r2Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
}

/**
 * Delete a file from R2
 * @param {string} key - File key in R2
 * @returns {Promise<void>}
 */
export async function deleteFromR2(key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw new Error(`Failed to delete file from R2: ${error.message}`);
  }
}

/**
 * Check if R2 is configured
 * @returns {boolean}
 */
export function isR2Configured() {
  return !!(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}
