/**
 * Script to upload images from public folder to Cloudflare R2
 * 
 * Usage:
 * 1. Set your R2 credentials in .env file:
 *    R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
 *    R2_ACCESS_KEY_ID=your_access_key_id
 *    R2_SECRET_ACCESS_KEY=your_secret_access_key
 *    R2_BUCKET_NAME=your-bucket-name
 *    R2_PUBLIC_URL=https://pub-37a24b1e874e46b0a8528235c34ba563.r2.dev
 * 
 * 2. Run: node upload-images-to-r2.js
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
const PUBLIC_FOLDER = join(__dirname, 'public');
const R2_FOLDER = 'images';

// Images to upload
const IMAGES_TO_UPLOAD = [
  'logoo.png',
  'vasthu-plan.png',
  'elephant.png',
];

/**
 * Upload a file to R2
 */
async function uploadFile(fileName, folder = R2_FOLDER) {
  try {
    const filePath = join(PUBLIC_FOLDER, fileName);
    
    // Check if file exists
    if (!statSync(filePath).isFile()) {
      console.log(`⚠️  File not found: ${fileName}`);
      return false;
    }

    // Read file
    const fileBuffer = readFileSync(filePath);
    
    // Determine content type
    let contentType = 'application/octet-stream';
    if (fileName.endsWith('.png')) contentType = 'image/png';
    else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (fileName.endsWith('.svg')) contentType = 'image/svg+xml';
    else if (fileName.endsWith('.gif')) contentType = 'image/gif';
    else if (fileName.endsWith('.webp')) contentType = 'image/webp';

    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await r2Client.send(command);

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    console.log(`✅ Uploaded: ${fileName} → ${publicUrl}`);
    return true;
  } catch (error) {
    console.error(`❌ Error uploading ${fileName}:`, error.message);
    return false;
  }
}

/**
 * Main upload function
 */
async function uploadImages() {
  console.log('🚀 Starting image upload to R2...\n');

  // Check if R2 is configured
  if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || 
      !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME) {
    console.error('❌ R2 configuration missing!');
    console.error('Please set the following in your .env file:');
    console.error('  R2_ENDPOINT');
    console.error('  R2_ACCESS_KEY_ID');
    console.error('  R2_SECRET_ACCESS_KEY');
    console.error('  R2_BUCKET_NAME');
    console.error('  R2_PUBLIC_URL');
    process.exit(1);
  }

  console.log(`📦 Bucket: ${BUCKET_NAME}`);
  console.log(`📁 R2 Folder: ${R2_FOLDER}`);
  console.log(`🌐 Public URL: ${process.env.R2_PUBLIC_URL}\n`);

  let successCount = 0;
  let failCount = 0;

  // Upload each image
  for (const fileName of IMAGES_TO_UPLOAD) {
    const success = await uploadFile(fileName);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log(`\n📊 Upload Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);

  if (successCount > 0) {
    console.log(`\n✅ Images are now available at:`);
    IMAGES_TO_UPLOAD.forEach(fileName => {
      console.log(`   ${process.env.R2_PUBLIC_URL}/${R2_FOLDER}/${fileName}`);
    });
  }
}

// Run the upload
uploadImages().catch(error => {
  console.error('❌ Upload failed:', error);
  process.exit(1);
});
