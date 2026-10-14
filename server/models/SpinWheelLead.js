import mongoose from 'mongoose';

const spinWheelLeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    preferredDate: {
      type: String,
      required: true,
      trim: true,
    },
    offerId: {
      type: String,
      required: true,
    },
    offerLabel: {
      type: String,
      required: true,
    },
    couponCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    couponExpiresAt: {
      type: Date,
      required: true,
    },
    spinId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['ISSUED', 'CONTACTED', 'REDEEMED'],
      default: 'ISSUED',
    },
    notes: {
      type: String,
      default: '',
    },
    redeemedAt: {
      type: Date,
    },
    ip: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    sourcePage: {
      type: String,
      default: 'Spin Wheel',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups
spinWheelLeadSchema.index({ status: 1 });
spinWheelLeadSchema.index({ createdAt: -1 });

export default mongoose.model('SpinWheelLead', spinWheelLeadSchema);
