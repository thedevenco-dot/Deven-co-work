import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Content from './models/Content.js';
import Media from './models/Media.js';
import cloudinary from './config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');

async function migrateFile(filePath, originalName, isVideo = false) {
  try {
    const ext = path.extname(filePath);
    const mimeType = isVideo ? 'video/mp4' : 'image/png';
    const resourceType = isVideo ? 'video' : 'image';

    console.log(`Uploading ${path.basename(filePath)} to Cloudinary...`);
    const uploadRes = await cloudinary.uploader.upload(filePath, {
      folder: 'deven_cowork',
      resource_type: resourceType,
    });

    console.log(`Uploaded successfully: ${uploadRes.secure_url}`);

    // Create unique filename register
    const fileName = path.basename(filePath);

    // Read sidecar metadata if exists
    let altText = '';
    let description = '';
    const metaPath = `${filePath}.meta.json`;
    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        altText = meta.altText || '';
        description = meta.description || '';
      } catch (_) {}
    }

    // Save in Media Collection
    let mediaItem = await Media.findOne({ fileName });
    if (!mediaItem) {
      mediaItem = new Media({
        fileName,
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
        sizeBytes: uploadRes.bytes,
        isVideo,
        isImage: !isVideo,
        altText,
        description,
        originalName,
        mimeType,
        width: uploadRes.width,
        height: uploadRes.height,
        format: uploadRes.format,
        uploadedAt: new Date()
      });
      await mediaItem.save();
    }

    return {
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
      width: uploadRes.width,
      height: uploadRes.height,
      format: uploadRes.format,
      alt: altText
    };
  } catch (err) {
    console.error(`Error uploading ${filePath}:`, err.message);
    return null;
  }
}

async function run() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('CRITICAL ERROR: Cloudinary environment variables are missing in .env file!');
    process.exit(1);
  }

  if (!MONGODB_URI) {
    console.error('MONGODB_URI environment variable is not configured.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  const docs = await Content.find({});
  console.log(`Found ${docs.length} CMS content documents to inspect.`);

  for (const doc of docs) {
    console.log(`\n----------------------------------------\nInspecting Document: ${doc.key} (ID: ${doc._id})`);
    let updated = false;

    // Helper to process a field
    const processField = async (parent, keyName, isVideo = false) => {
      if (!parent || !parent[keyName]) return;
      const val = parent[keyName];

      if (typeof val === 'string' && val.startsWith('/uploads/')) {
        const fileName = val.replace('/uploads/', '');
        const localPath = path.join(UPLOADS_DIR, fileName);

        if (fs.existsSync(localPath)) {
          console.log(`Found local file: ${fileName} for field [${keyName}]`);
          const mediaObj = await migrateFile(localPath, fileName, isVideo);
          if (mediaObj) {
            parent[keyName] = mediaObj;
            updated = true;
          }
        } else {
          console.warn(`[WARNING] Local file is missing for field [${keyName}]: ${localPath}`);
          // convert to broken media object reference but retain metadata to allow replacing
          parent[keyName] = {
            url: val,
            publicId: '',
            alt: '',
            isMissing: true
          };
          updated = true;
        }
      }
    };

    // 1. globalSettings
    if (doc.globalSettings) {
      await processField(doc.globalSettings, 'favicon');
      await processField(doc.globalSettings, 'logo');
      await processField(doc.globalSettings, 'logoWhite');
      await processField(doc.globalSettings, 'ogImage');
    }

    // 2. seo
    if (doc.seo) {
      await processField(doc.seo, 'ogImage');
    }

    // 3. header
    if (doc.header) {
      await processField(doc.header, 'logo');
    }

    // 4. hero
    if (doc.hero) {
      await processField(doc.hero, 'videoUrl', true);
      await processField(doc.hero, 'imageUrl');
    }

    // 5. problem
    if (doc.problem) {
      await processField(doc.problem, 'imageUrl');
    }

    // 6. guide gallery
    if (doc.guide && doc.guide.gallery) {
      for (let i = 0; i < doc.guide.gallery.length; i++) {
        const item = doc.guide.gallery[i];
        if (item && typeof item.image === 'string' && item.image.startsWith('/uploads/')) {
          const fileName = item.image.replace('/uploads/', '');
          const localPath = path.join(UPLOADS_DIR, fileName);

          if (fs.existsSync(localPath)) {
            console.log(`Found local file in guide gallery [index ${i}]: ${fileName}`);
            const mediaObj = await migrateFile(localPath, fileName, false);
            if (mediaObj) {
              item.image = mediaObj;
              updated = true;
            }
          } else {
            console.warn(`[WARNING] Local file is missing in guide gallery [index ${i}]: ${localPath}`);
            item.image = {
              url: item.image,
              publicId: '',
              alt: item.label || '',
              isMissing: true
            };
            updated = true;
          }
        }
      }
    }

    if (updated) {
      console.log(`Saving changes to document key: ${doc.key}...`);
      doc.markModified('globalSettings');
      doc.markModified('seo');
      doc.markModified('header');
      doc.markModified('hero');
      doc.markModified('problem');
      doc.markModified('guide');
      await doc.save();
      console.log(`Document key: ${doc.key} updated successfully!`);
    } else {
      console.log(`No local uploads to migrate in document key: ${doc.key}.`);
    }
  }

  // Check if there are other files in UPLOADS_DIR that are not in the Content but still exist, upload them to Media Library
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    const mediaFiles = files.filter(f => !f.endsWith('.meta.json'));
    console.log(`\nFound ${mediaFiles.length} total files in uploads directory. Syncing unregistered files to Media collection...`);
    
    for (const fileName of mediaFiles) {
      const localPath = path.join(UPLOADS_DIR, fileName);
      const isVideo = ['.mp4', '.mov', '.webm'].includes(path.extname(fileName).toLowerCase());
      
      let dbRecord = await Media.findOne({ fileName });
      if (!dbRecord) {
        console.log(`Unregistered file found on disk: ${fileName}. Migrating to Cloudinary...`);
        await migrateFile(localPath, fileName, isVideo);
      }
    }
  } catch (fsErr) {
    console.error('Error syncing local directory files:', fsErr.message);
  }

  await mongoose.disconnect();
  console.log('\nMigration run complete. Disconnected from database.');
}

run().catch(console.error);
