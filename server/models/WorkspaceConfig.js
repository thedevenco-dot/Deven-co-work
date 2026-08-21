import mongoose from 'mongoose';

const workspaceConfigSchema = new mongoose.Schema(
  {
    totalCapacity: {
      type: Number,
      default: 50,
      required: true,
    },
    holdDurationMinutes: {
      type: Number,
      default: 10,
      required: true,
    },
    freeTrialCapacity: {
      type: Map,
      of: Number,
      default: { Friday: 10, Saturday: 10 },
    },
    refundableSeatDeposit: {
      type: Number,
      default: 1000,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    updatedBy: {
      type: String,
      default: 'admin',
    },
  },
  { timestamps: true }
);

const WorkspaceConfig = mongoose.model('WorkspaceConfig', workspaceConfigSchema);
export default WorkspaceConfig;
