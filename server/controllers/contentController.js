import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import Content from '../models/Content.js';
import Media from '../models/Media.js';
import cloudinary from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper to seed default content if document does not exist
async function getOrCreateContent(key) {
  let doc = await Content.findOne({ key });
  if (!doc) {
    doc = new Content({ key });
    await doc.save();
  }
  return doc;
}

/**
 * @desc    Get published content (Public view)
 * @route   GET /api/content/published
 * @access  Public
 */
export async function getPublishedContent(req, res) {
  try {
    const content = await getOrCreateContent('published');
    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching published content',
    });
  }
}

/**
 * @desc    Get draft content (Admin editor)
 * @route   GET /api/content/draft
 * @access  Private (Admin Only)
 */
export async function getDraftContent(req, res) {
  try {
    const content = await getOrCreateContent('draft');
    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching draft content',
    });
  }
}

/**
 * @desc    Save content updates to draft state
 * @route   POST /api/content/draft
 * @access  Private (Admin Only)
 */
export async function saveDraftContent(req, res) {
  try {
    const draft = await getOrCreateContent('draft');

    // Whitelist update fields to avoid overwriting key/id/timestamps
    const updateData = { ...req.body };
    delete updateData.key;
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Assign updates and explicitly mark every modified section as changed.
    // Mongoose does NOT auto-detect changes inside Mixed-type fields (e.g. hero.videoUrl
    // stored as a Cloudinary object), so we must call markModified for each key.
    Object.assign(draft, updateData);
    Object.keys(updateData).forEach((key) => draft.markModified(key));
    await draft.save();

    res.json({
      success: true,
      message: 'Draft saved successfully',
      data: draft,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while saving draft content',
    });
  }
}

/**
 * @desc    Publish draft content to published state
 * @route   POST /api/content/publish
 * @access  Private (Admin Only)
 */
export async function publishContent(req, res) {
  try {
    const draft = await getOrCreateContent('draft');
    const published = await getOrCreateContent('published');

    // Copy draft contents into published document
    const draftObj = draft.toObject();
    delete draftObj._id;
    delete draftObj.key;
    delete draftObj.createdAt;
    delete draftObj.updatedAt;
    delete draftObj.__v;

    // Assign and explicitly mark every key as modified so Mongoose persists
    // Mixed-type nested fields (e.g. hero.videoUrl as a Cloudinary object).
    Object.assign(published, draftObj);
    Object.keys(draftObj).forEach((key) => published.markModified(key));
    await published.save();

    res.json({
      success: true,
      message: 'Draft content successfully published live!',
      data: published,
      publishedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while publishing content',
    });
  }
}

/**
 * @desc    Upload file (image or video) using base64 payload
 * @route   POST /api/content/upload
 * @access  Private (Admin Only)
 */
export async function uploadFile(req, res) {
  const { fileName, fileType, fileData, altText = '', description = '' } = req.body;

  if (!fileName || !fileData) {
    return res.status(400).json({
      success: false,
      message: 'Please provide fileName and base64 fileData',
    });
  }

  try {
    // 1. Detect base64 details
    const base64Match = fileData.match(/^data:([^;]+);base64,/);
    const mimeType = base64Match ? base64Match[1] : (fileType || 'application/octet-stream');
    const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 2. Validate file size (50MB max)
    if (buffer.byteLength > 50 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum allowed size is 50MB.',
      });
    }

    // 3. Upload to Cloudinary
    let uploadData = fileData;
    if (!uploadData.startsWith('data:')) {
      uploadData = `data:${mimeType};base64,${base64Data}`;
    }

    console.log(`Uploading file ${fileName} (${mimeType}) to Cloudinary...`);
    
    // Check credentials before uploading to give helpful error
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary environment variables are not configured in your .env file.');
    }

    const uploadRes = await cloudinary.uploader.upload(uploadData, {
      folder: 'deven_cowork',
      resource_type: 'auto',
    });

    const isImage = uploadRes.resource_type === 'image';
    const isVideo = uploadRes.resource_type === 'video';

    // 4. Generate unique name for database registry
    const ext = path.extname(fileName) || (isVideo ? '.mp4' : '.png');
    const hash = crypto.randomBytes(8).toString('hex');
    const sanitized = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const uniqueFileName = `${sanitized}_${hash}${ext}`;

    // 5. Save to Media collection in MongoDB
    const mediaItem = new Media({
      fileName: uniqueFileName,
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
      sizeBytes: uploadRes.bytes,
      isVideo,
      isImage,
      altText,
      description,
      originalName: fileName,
      mimeType: mimeType || (isImage ? 'image/png' : 'video/mp4'),
      width: uploadRes.width,
      height: uploadRes.height,
      format: uploadRes.format,
      uploadedAt: new Date(),
    });
    await mediaItem.save();

    // 6. Optional local filesystem write in dev environment
    try {
      if (process.env.NODE_ENV !== 'production') {
        const destinationPath = path.join(UPLOADS_DIR, uniqueFileName);
        fs.writeFileSync(destinationPath, buffer);
        fs.writeFileSync(
          path.join(UPLOADS_DIR, `${uniqueFileName}.meta.json`),
          JSON.stringify({
            fileName: uniqueFileName,
            originalName: fileName,
            mimeType,
            isVideo,
            isImage,
            sizeBytes: buffer.byteLength,
            altText,
            description,
            uploadedAt: new Date().toISOString(),
            cloudinaryUrl: uploadRes.secure_url,
            publicId: uploadRes.public_id
          }, null, 2)
        );
      }
    } catch (fsError) {
      console.warn('Skipped local file write:', fsError.message);
    }

    return res.status(201).json({
      success: true,
      url: uploadRes.secure_url,
      fileName: uniqueFileName,
      mimeType: mimeType || (isImage ? 'image/png' : 'video/mp4'),
      sizeBytes: uploadRes.bytes,
      isVideo,
      isImage,
      altText,
      cloudinary: {
        publicId: uploadRes.public_id,
        width: uploadRes.width,
        height: uploadRes.height,
        format: uploadRes.format
      },
      message: 'File uploaded successfully to Cloudinary',
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({
      success: false,
      message: `Image upload failed. Please try again. (Detail: ${error.message})`,
    });
  }
}

/**
 * @desc    Get all media files from database
 * @route   GET /api/admin/media
 * @access  Private (Admin Only)
 */
export async function getMediaLibrary(req, res) {
  try {
    const mediaItems = await Media.find({}).sort({ uploadedAt: -1 });

    return res.json({
      success: true,
      data: mediaItems,
      count: mediaItems.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to read media library from database',
    });
  }
}

/**
 * @desc    Update metadata for a media file (altText, description)
 * @route   PATCH /api/admin/media/:fileName
 * @access  Private (Admin Only)
 */
export async function updateMediaMeta(req, res) {
  const { fileName } = req.params;
  const { altText, description } = req.body;

  // Basic path traversal protection
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return res.status(400).json({ success: false, message: 'Invalid file name.' });
  }

  try {
    const media = await Media.findOne({ fileName });
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media record not found in database.' });
    }

    if (altText !== undefined) media.altText = altText;
    if (description !== undefined) media.description = description;
    await media.save();

    // Dev environment sync
    try {
      if (process.env.NODE_ENV !== 'production') {
        const metaPath = path.join(UPLOADS_DIR, `${fileName}.meta.json`);
        if (fs.existsSync(metaPath)) {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
          if (altText !== undefined) meta.altText = altText;
          if (description !== undefined) meta.description = description;
          fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
        }
      }
    } catch (_) {}

    return res.json({ success: true, message: 'Metadata updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc    Delete a media file from uploads and Cloudinary
 * @route   DELETE /api/admin/media/:fileName
 * @access  Private (Admin Only)
 */
export async function deleteMedia(req, res) {
  const { fileName } = req.params;

  // Basic path traversal protection
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return res.status(400).json({ success: false, message: 'Invalid file name.' });
  }

  try {
    const media = await Media.findOne({ fileName });
    if (!media) {
      return res.status(404).json({ success: false, message: 'File not found in database.' });
    }

    // 1. Delete from Cloudinary
    if (media.publicId) {
      try {
        const resourceType = media.isVideo ? 'video' : 'image';
        console.log(`Deleting asset from Cloudinary: ${media.publicId} (${resourceType})...`);
        await cloudinary.uploader.destroy(media.publicId, { resource_type: resourceType });
      } catch (cloudinaryError) {
        console.error('Cloudinary destroy failed during media deletion:', cloudinaryError);
      }
    }

    // 2. Delete from MongoDB
    await Media.deleteOne({ fileName });

    // 3. Delete local dev files
    try {
      const filePath = path.join(UPLOADS_DIR, fileName);
      const metaPath = path.join(UPLOADS_DIR, `${fileName}.meta.json`);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    } catch (_) {}

    return res.json({ success: true, message: `File "${fileName}" and its cloud asset deleted successfully.` });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Delete failed: ${error.message}`,
    });
  }
}
