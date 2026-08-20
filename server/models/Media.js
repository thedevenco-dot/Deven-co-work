import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    sizeBytes: { type: Number, default: 0 },
    isVideo: { type: Boolean, default: false },
    isImage: { type: Boolean, default: true },
    altText: { type: String, default: '' },
    description: { type: String, default: '' },
    originalName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

const Media = mongoose.model('Media', mediaSchema);
export default Media;
