import mongoose from 'mongoose';

const teamSizeSchema = new mongoose.Schema({
  label: { type: String, required: true },
  description: { type: String, default: '' },
  minPeople: { type: Number, required: true },
  maxPeople: { type: Number, required: true },
  midpoint: { type: Number, required: true },
  estimatedMoveInTime: { type: String, default: '3-4 months' },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

const fitoutTierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },

  // Cost variables
  securityDepositPerPerson: { type: Number, default: 0 },
  brokerCommissionPerPerson: { type: Number, default: 0 },
  legalStampDutyPerPerson: { type: Number, default: 0 },
  interiorFitoutPerPerson: { type: Number, default: 0 },
  furniturePerPerson: { type: Number, default: 0 },
  acFansLightingPerPerson: { type: Number, default: 0 },
  wifiPrinterEquipmentPerPerson: { type: Number, default: 0 },
  securitySystemPerPerson: { type: Number, default: 0 },
  govtApprovalsLicensesPerPerson: { type: Number, default: 0 },
});

const officeCalculatorConfigSchema = new mongoose.Schema({
  singletonKey: { type: String, default: 'default', unique: true },
  
  // Section Content
  active: { type: Boolean, default: true },
  sectionEyebrow: { type: String, default: 'DEVEN CO-WORK, RAIPUR' },
  mainHeading: { type: String, default: 'THE ULTIMATE OFFICE SETUP COST CALCULATOR' },
  description: { type: String, default: 'See, in real numbers, what setting up your own private office in Raipur actually costs in capital and time — compared to moving into Deven Co-Work today.' },

  // Options
  teamSizes: { type: [teamSizeSchema], default: [] },
  fitoutTiers: { type: [fitoutTierSchema], default: [] },

  // General Cost Assumptions
  rentPerPersonMonth: { type: Number, default: 5000 },
  maintenanceAdminPerPersonMonth: { type: Number, default: 1500 },
  
  // Deven Pricing Source
  devenPriceSource: { type: String, enum: ['manual', 'plan'], default: 'manual' },
  devenManualPricePerSeatMonth: { type: Number, default: 8499 },
  devenPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },

  // Result Content
  savingsHeading: { type: String, default: 'Total you save in Year 1 by choosing Deven Co-Work' },
  savingsDescription: { type: String, default: 'A smart choice for smart founders.' },
  capitalSavingsMessage: { type: String, default: 'Keep your capital for growth, not furniture.' },
  moveInTimeLabelOffice: { type: String, default: 'Typical time to move in' },
  moveInTimeLabelDeven: { type: String, default: 'Time to move into Deven' },
  moveInTimeDevenValue: { type: String, default: 'Today' },
  
  fullBreakdownHeading: { type: String, default: 'Your Complete Cost Breakdown' },
  fullBreakdownDescription: { type: String, default: 'See every line item side by side.' },
  
  ctaHeading: { type: String, default: 'Ready to skip the hassle?' },
  ctaButtonLabel: { type: String, default: 'Book Your Free Trial' },
  whatsappCtaText: { type: String, default: 'Chat on WhatsApp' },
  freeTrialCtaText: { type: String, default: 'Start Free Trial' },
  disclaimerText: { type: String, default: '* Estimates are based on current Raipur market rates.' },

  // Lead Form Content
  formHeading: { type: String, default: 'Unlock Your Full Cost Breakdown' },
  formDescription: { type: String, default: "Enter your details and we'll unlock the complete line-by-line comparison." },
  buttonText: { type: String, default: 'Unlock My Report' },
  privacyMessage: { type: String, default: 'We respect your privacy. No spam.' },

}, { timestamps: true });

export default mongoose.model('OfficeCalculatorConfig', officeCalculatorConfigSchema);
