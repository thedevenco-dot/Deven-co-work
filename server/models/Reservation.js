import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
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
      required: [true, 'Email address is required'],
      trim: true,
    },
    company: {
      type: String,
      default: '',
      trim: true,
    },
    joiningDate: {
      type: String,
      default: '',
    },
    seatNumbers: {
      type: [String],
      required: [true, 'Seat numbers are required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length >= 1 && v.length <= 7;
        },
        message: 'You can select between 1 and 7 seats.',
      },
    },
    plan: {
      type: String,
      required: [true, 'Preferred plan is required'],
      enum: {
        values: ['Hot Desk', 'Dedicated Desk', 'Private Cabin', 'Virtual Office'],
        message: 'Invalid plan selection',
      },
    },
    amount: {
      type: Number,
      required: [true, 'Deposit amount is required'],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: ['new', 'contacted', 'confirmed', 'cancelled', 'refunded'],
      default: 'new',
    },
    notes: {
      type: String,
      default: '',
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
    crmStage: {
      type: String,
      default: 'New Lead',
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
    refundType: {
      type: String,
      enum: ['none', 'pre_launch', 'post_opening_guarantee'],
      default: 'none',
    },
    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;
