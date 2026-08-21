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
  },
  {
    timestamps: true,
  }
);

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;
