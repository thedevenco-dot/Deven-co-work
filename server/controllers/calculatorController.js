import OfficeCalculatorConfig from '../models/OfficeCalculatorConfig.js';
import CalculatorLead from '../models/CalculatorLead.js';
import Plan from '../models/Plan.js';

// Get public configuration
export const getConfig = async (req, res) => {
  try {
    let config = await OfficeCalculatorConfig.findOne({ singletonKey: 'default' }).populate('devenPlanId');
    if (!config) {
      config = await OfficeCalculatorConfig.create({ singletonKey: 'default' });
    }
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Error fetching calculator config:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Get configuration
export const getAdminConfig = async (req, res) => {
  try {
    let config = await OfficeCalculatorConfig.findOne({ singletonKey: 'default' }).populate('devenPlanId');
    if (!config) {
      config = await OfficeCalculatorConfig.create({ singletonKey: 'default' });
    }
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Error fetching admin calculator config:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Update configuration
export const updateConfig = async (req, res) => {
  try {
    const updateData = req.body;
    let config = await OfficeCalculatorConfig.findOneAndUpdate(
      { singletonKey: 'default' },
      updateData,
      { new: true, upsert: true }
    ).populate('devenPlanId');
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Error updating calculator config:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Public: Submit Lead
export const submitLead = async (req, res) => {
  try {
    const { name, phone, email, companyProjectName, teamSizeLabel, fitoutTier } = req.body;

    if (!name || !phone || !email || !teamSizeLabel || !fitoutTier) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Load config to recalculate securely
    const config = await OfficeCalculatorConfig.findOne({ singletonKey: 'default' }).populate('devenPlanId');
    if (!config) {
      return res.status(500).json({ success: false, message: 'Calculator is not configured yet.' });
    }

    const teamSize = config.teamSizes.find(t => t.label === teamSizeLabel);
    const fitout = config.fitoutTiers.find(f => f.name === fitoutTier);

    if (!teamSize || !fitout) {
      return res.status(400).json({ success: false, message: 'Invalid team size or fit-out tier selected.' });
    }

    const people = teamSize.midpoint;

    const getNonZeroTierVal = (tier, ...keys) => {
      if (!tier) return 0;
      for (const k of keys) {
        const val = Number(tier[k]);
        if (!isNaN(val) && val > 0) return val;
      }
      return 0;
    };

    // Calculate One Time Cost from current MongoDB fitout tier values
    const oneTimeCost = (
      getNonZeroTierVal(fitout, 'securityDepositPerPerson', 'securityDeposit') +
      getNonZeroTierVal(fitout, 'brokerCommissionPerPerson', 'brokerCommission') +
      getNonZeroTierVal(fitout, 'legalStampDutyPerPerson', 'legalStampDuty', 'legalStamp') +
      getNonZeroTierVal(fitout, 'interiorFitoutPerPerson', 'interiorFitout', 'fitout') +
      getNonZeroTierVal(fitout, 'furniturePerPerson', 'furniture') +
      getNonZeroTierVal(fitout, 'acFansLightingPerPerson', 'acFansLighting', 'acLight') +
      getNonZeroTierVal(fitout, 'wifiPrinterEquipmentPerPerson', 'wifiPrinterEquipment', 'equipment') +
      getNonZeroTierVal(fitout, 'securitySystemPerPerson', 'securitySystem', 'security') +
      getNonZeroTierVal(fitout, 'govtApprovalsLicensesPerPerson', 'govtApprovalsLicenses', 'govtApproval')
    );

    // Calculate Monthly Office Cost
    const monthlyOfficeCost = (config.rentPerPersonMonth + config.maintenanceAdminPerPersonMonth) * people;
    const officeYear1Cost = oneTimeCost + (monthlyOfficeCost * 12);

    // Calculate Deven Cost
    let devenPerSeatPrice = config.devenManualPricePerSeatMonth;
    if (config.devenPriceSource === 'plan' && config.devenPlanId && config.devenPlanId.price) {
      devenPerSeatPrice = config.devenPlanId.price;
    }
    const devenYear1Cost = devenPerSeatPrice * people * 12;

    const savings = officeYear1Cost - devenYear1Cost;

    const lead = await CalculatorLead.create({
      name,
      phone,
      email,
      companyProjectName,
      teamSizeLabel: teamSize.label,
      teamSizeMin: teamSize.minPeople,
      teamSizeMax: teamSize.maxPeople,
      teamSizeMidpoint: teamSize.midpoint,
      fitoutTier: fitout.name,
      fitoutLabel: fitout.description,
      estimatedOfficeYear1Cost: officeYear1Cost,
      estimatedDevenYear1Cost: devenYear1Cost,
      estimatedSavings: savings,
      estimatedMoveInTime: teamSize.estimatedMoveInTime,
      calculationAssumptions: {
        configSnapshot: config.toJSON(),
        devenPerSeatPriceUsed: devenPerSeatPrice
      }
    });

    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    console.error('Error submitting calculator lead:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Get Leads
export const getLeads = async (req, res) => {
  try {
    const leads = await CalculatorLead.find().sort({ createdAt: -1 });
    res.json({ success: true, data: leads });
  } catch (error) {
    console.error('Error fetching calculator leads:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
