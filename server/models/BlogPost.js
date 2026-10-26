import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Article title is required'],
    trim: true,
    maxlength: 250,
  },
  slug: {
    type: String,
    required: [true, 'URL slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  previousSlugs: {
    type: [String],
    default: [],
  },
  excerpt: {
    type: String,
    required: [true, 'Article excerpt is required'],
    trim: true,
    maxlength: 600,
  },
  content: {
    type: String,
    required: [true, 'Main article content is required'],
  },
  coverImage: {
    type: mongoose.Schema.Types.Mixed,
    default: '',
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    default: 'Deven Co-Work Team',
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    default: 'Startups',
  },
  tags: {
    type: [String],
    default: [],
  },
  featured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  readingTime: {
    type: Number,
    default: 3,
    min: 1,
  },
  seoTitle: {
    type: String,
    default: '',
    trim: true,
  },
  seoDescription: {
    type: String,
    default: '',
    trim: true,
  },
  socialImage: {
    type: String,
    default: '',
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  scheduledAt: {
    type: Date,
    default: null,
  },
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
  }],
}, {
  timestamps: true,
});

blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ category: 1, status: 1 });
blogPostSchema.index({ featured: 1, status: 1 });
blogPostSchema.index({ previousSlugs: 1 });

const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);
export default BlogPost;
