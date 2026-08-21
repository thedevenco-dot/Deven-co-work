import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
  {
    zone: {
      type: String,
      required: true,
      enum: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    },
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Hot Desk', 'Dedicated Desk'],
    },
    status: {
      type: String,
      required: true,
      enum: ['available', 'reserved', 'held', 'blocked', 'maintenance'],
      default: 'available',
    },
    heldUntil: {
      type: Date,
      default: null,
    },
    heldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      default: null,
    },
    isStaff: {
      type: Boolean,
      default: false,
    },
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of seat per zone
seatSchema.index({ zone: 1, label: 1 }, { unique: true });

const Seat = mongoose.model('Seat', seatSchema);
export default Seat;
