import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
    },
    company: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['FREE_TRIAL', 'WHATSAPP_INQUIRY', 'PAID_RESERVATION'],
      default: 'FREE_TRIAL',
    },
    trialStartDate: {
      type: Date,
      default: null,
    },
    trialEndDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ['new', 'contacted', 'confirmed', 'cancelled'],
      default: 'new',
    },
    crmSyncStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    crmSyncError: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    utmSource: {
      type: String,
      default: '',
    },
    utmMedium: {
      type: String,
      default: '',
    },
    utmCampaign: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
