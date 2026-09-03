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
    requestType: {
      type: String,
      required: true,
      enum: ['seat_reservation', 'free_trial', 'whatsapp'],
    },
    seatNumbers: {
      type: [String],
      default: [],
    },
    plan: {
      type: String,
      default: '',
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      default: null,
    },
    planName: {
      type: String,
      default: '',
    },
    planPrice: {
      type: Number,
      default: 0,
    },
    billingPeriod: {
      type: String,
      default: 'month',
    },
    duration: {
      type: Number,
      default: 1,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    deposit: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      default: 0,
    },
    seatDepositAmount: {
      type: Number,
      default: 1000,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['N/A', 'PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
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
    leadStatus: {
      type: String,
      required: true,
      enum: ['NEW', 'CONTACTED', 'TRIAL', 'PAYMENT_PENDING', 'CONFIRMED', 'CANCELLED', 'LOST'],
      default: 'NEW',
    },
    notes: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: Date,
      default: null,
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
    confirmationEmailSent: {
      type: Boolean,
      default: false,
    },
    confirmationEmailSentAt: {
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
