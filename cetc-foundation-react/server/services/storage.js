'use strict';
/**
 * Storage Service
 * Dev: saves files to local /uploads directory
 * Production: uploads to AWS S3
 */
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../uploads');

/**
 * Ensure uploads directory exists
 */
function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Upload a file to storage
 * @param {string} localFilePath - Path of local file to upload
 * @param {string} destKey - Destination key/path in storage (e.g., 'certificates/file.pdf')
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} - Public URL of uploaded file
 */
async function uploadFile(localFilePath, destKey, contentType = 'application/octet-stream') {
  const isDev = process.env.DEV_MODE === 'true' || !process.env.AWS_ACCESS_KEY_ID;

  if (isDev) {
    ensureUploadsDir();
    const fileName = path.basename(localFilePath);
    const destPath = path.join(UPLOADS_DIR, fileName);

    // Copy file to uploads dir (keep original for now)
    if (localFilePath !== destPath) {
      fs.copyFileSync(localFilePath, destPath);
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://cetcf.org';
    const baseUrl = frontendUrl + '/api';
    return `${baseUrl}/uploads/${fileName}`;
  }

  // Production: AWS S3 upload
  try {
    const AWS = require('@aws-sdk/client-s3');
    const { PutObjectCommand, S3Client } = AWS;

    const s3 = new S3Client({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const fileContent = fs.readFileSync(localFilePath);
    const bucket = process.env.AWS_S3_BUCKET || 'cetcf-certificates';

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: destKey,
      Body: fileContent,
      ContentType: contentType,
      ACL: 'public-read',
    }));

    return `https://${bucket}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${destKey}`;
  } catch (err) {
    console.error('[Storage] S3 upload failed:', err.message);
    // Fallback to local
    ensureUploadsDir();
    const fileName = path.basename(localFilePath);
    const destPath = path.join(UPLOADS_DIR, fileName);
    if (localFilePath !== destPath) fs.copyFileSync(localFilePath, destPath);
    const baseUrl = process.env.CERT_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${fileName}`;
  }
}

/**
 * Get a local file path for streaming
 */
function getLocalPath(fileName) {
  return path.join(UPLOADS_DIR, fileName);
}

/**
 * Delete a file from local storage
 */
function deleteLocalFile(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.warn('[Storage] Delete failed:', err.message);
  }
}

/**
 * Get multer disk storage config for photo uploads
 */
function getMulterStorage(subDir = 'photos') {
  const multer = require('multer');
  ensureUploadsDir();
  const photoDir = path.join(UPLOADS_DIR, subDir);
  if (!fs.existsSync(photoDir)) fs.mkdirSync(photoDir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, photoDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`);
    },
  });
}

module.exports = { uploadFile, getLocalPath, deleteLocalFile, getMulterStorage, UPLOADS_DIR };
