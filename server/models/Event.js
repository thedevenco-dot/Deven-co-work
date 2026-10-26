import mongoose from 'mongoose';

const speakerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, default: '', trim: true },
  company: { type: String, default: '', trim: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
}, { _id: false });

const galleryItemSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, default: '' },
  caption: { type: String, default: '' },
}, { _id: false });

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: [true, 'URL slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  excerpt: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true,
    maxlength: 500,
  },
  description: {
    type: String,
    required: [true, 'Full description is required'],
  },
  coverImage: {
    type: mongoose.Schema.Types.Mixed,
    default: '',
  },
  gallery: {
    type: [galleryItemSchema],
    default: [],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Workshop', 'Founder Meetup', 'Networking', 'Community', 'Talk', 'Other'],
    default: 'Community',
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    default: 'Deven Co-Work, VIP Estate, Shankar Nagar, Raipur',
  },
  startAt: {
    type: Date,
    required: [true, 'Start date and time is required'],
  },
  endAt: {
    type: Date,
    required: [true, 'End date and time is required'],
  },
  registrationUrl: {
    type: String,
    default: '',
    trim: true,
  },
  registrationCtaLabel: {
    type: String,
    default: 'Register Now',
    trim: true,
  },
  registrationDeadline: {
    type: Date,
    default: null,
  },
  price: {
    type: String,
    default: 'Free',
    trim: true,
  },
  capacity: {
    type: Number,
    default: 0,
    min: 0,
  },
  speakers: {
    type: [speakerSchema],
    default: [],
  },
  organizer: {
    type: String,
    default: 'Deven Co-Work',
    trim: true,
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
  recap: {
    type: String,
    default: '',
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
}, {
  timestamps: true,
});

eventSchema.index({ status: 1, startAt: 1 });
eventSchema.index({ featured: 1, status: 1 });

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default Event;
