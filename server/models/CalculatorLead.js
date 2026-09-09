import mongoose from 'mongoose';

const calculatorLeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  companyProjectName: { type: String },

  // Selections
  teamSizeLabel: { type: String },
  teamSizeMin: { type: Number },
  teamSizeMax: { type: Number },
  teamSizeMidpoint: { type: Number },
  
  fitoutTier: { type: String }, // name of the fitout tier
  fitoutLabel: { type: String }, // description or name

  // Snapshot Calculations
  estimatedOfficeYear1Cost: { type: Number },
  estimatedDevenYear1Cost: { type: Number },
  estimatedSavings: { type: Number },
  
  estimatedMoveInTime: { type: String },

  // Complete snapshot of assumptions used
  calculationAssumptions: { type: mongoose.Schema.Types.Mixed },

  sourcePage: { type: String, default: 'Homepage Calculator' },
  
}, { timestamps: true });

export default mongoose.model('CalculatorLead', calculatorLeadSchema);
