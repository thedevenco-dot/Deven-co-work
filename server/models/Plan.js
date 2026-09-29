import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Plan slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number or 0'],
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    billingPeriod: {
      type: String,
      required: [true, 'Billing period is required'],
      enum: ['hour', 'day', 'month', 'quarter', 'year'],
      default: 'month',
    },
    pricingLabel: {
      type: String,
      default: '',
      trim: true,
    },
    paymentMode: {
      type: String,
      enum: ['RESERVATION', 'FULL_PAYMENT'],
      default: 'FULL_PAYMENT',
    },
    reservationAmount: {
      type: Number,
      default: 999,
      min: [0, 'Reservation amount must be 0 or positive'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      default: 'workspace',
      trim: true,
    },
    requiresSeatSelection: {
      type: Boolean,
      default: false,
    },
    requiresPayment: {
      type: Boolean,
      default: true,
    },
    usesDeposit: {
      type: Boolean,
      default: false,
    },
    allowsQuantity: {
      type: Boolean,
      default: true,
    },
    requiresDate: {
      type: Boolean,
      default: false,
    },
    requiresTime: {
      type: Boolean,
      default: false,
    },
    // ── Display / CRO fields (Phase 2) ────────────────────────────────────────
    // Standard (strikethrough) price label shown on plan card, e.g. "₹8,999/mo"
    standardPrice: { type: String, default: '' },
    // Badge text on card, e.g. "MOST POPULAR"
    badge: { type: String, default: '' },
    // Bullet feature list for plan card
    features: { type: [String], default: [] },
    // If true, CTA routes to WhatsApp/contact instead of self-serve booking
    isContactPlan: { type: Boolean, default: false },

    // ── Plan card image (Cloudinary secure_url) ────────────────────────────────
    // Admin-managed per-plan image. Stored as a Cloudinary secure_url string.
    // Empty string means no image assigned for this plan.
    imageUrl: { type: String, default: '' },

  },
  {
    timestamps: true,
  }
);

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
