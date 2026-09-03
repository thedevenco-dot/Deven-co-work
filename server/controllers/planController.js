import Plan from '../models/Plan.js';

export const INITIAL_PLANS = [
  {
    name: 'Founders Seats',
    slug: 'founders-seats',
    description: 'Exclusive membership for founders with priority access and full perks.',
    price: 6999,
    currency: 'INR',
    billingPeriod: 'month',
    pricingLabel: '₹6,999/mo',
    paymentMode: 'RESERVATION',
    reservationAmount: 999,
    isActive: true,
    displayOrder: 1,
    category: 'workspace',
    requiresSeatSelection: true,
    requiresPayment: true,
    usesDeposit: true,
  },
  {
    name: 'Team Seats',
    slug: 'team-seats',
    description: 'Dedicated seating for growing startup teams.',
    price: 4999,
    currency: 'INR',
    billingPeriod: 'month',
    pricingLabel: '₹4,999/mo',
    paymentMode: 'RESERVATION',
    reservationAmount: 999,
    isActive: true,
    displayOrder: 2,
    category: 'workspace',
    requiresSeatSelection: true,
    requiresPayment: true,
    usesDeposit: true,
  },
  {
    name: 'Meeting Room',
    slug: 'meeting-room',
    description: 'Professional team meeting space with digital panel and high-speed wifi.',
    price: 199,
    currency: 'INR',
    billingPeriod: 'hour',
    pricingLabel: '₹199/hr',
    paymentMode: 'FULL_PAYMENT',
    reservationAmount: 0,
    isActive: true,
    displayOrder: 3,
    category: 'meeting',
    requiresSeatSelection: false,
    requiresPayment: true,
    usesDeposit: false,
  },
  {
    name: 'Studio Hourly',
    slug: 'studio-hourly',
    description: 'Professional podcast & content recording studio setup.',
    price: 999,
    currency: 'INR',
    billingPeriod: 'hour',
    pricingLabel: '₹999/hr',
    paymentMode: 'FULL_PAYMENT',
    reservationAmount: 0,
    isActive: true,
    displayOrder: 4,
    category: 'studio',
    requiresSeatSelection: false,
    requiresPayment: true,
    usesDeposit: false,
  },
  {
    name: 'Day Pass',
    slug: 'day-pass',
    description: 'Full day access to workspace, coffee bar, and high-speed internet.',
    price: 399,
    currency: 'INR',
    billingPeriod: 'day',
    pricingLabel: '₹399/day',
    paymentMode: 'FULL_PAYMENT',
    reservationAmount: 0,
    isActive: true,
    displayOrder: 5,
    category: 'pass',
    requiresSeatSelection: false,
    requiresPayment: true,
    usesDeposit: false,
  },
  {
    name: 'Entire Workspace',
    slug: 'entire-workspace',
    description: 'Book the complete facility for private events, workshops, or product launches.',
    price: 2500,
    currency: 'INR',
    billingPeriod: 'hour',
    pricingLabel: '₹2,500/hr',
    paymentMode: 'FULL_PAYMENT',
    reservationAmount: 0,
    isActive: true,
    displayOrder: 6,
    category: 'event',
    requiresSeatSelection: false,
    requiresPayment: true,
    usesDeposit: false,
  },
  {
    name: 'Flexi Seats',
    slug: 'flexi-seats',
    description: 'Flexible hourly desk access for quick drop-in work sessions.',
    price: 49,
    currency: 'INR',
    billingPeriod: 'hour',
    pricingLabel: '₹49/hr',
    paymentMode: 'FULL_PAYMENT',
    reservationAmount: 0,
    isActive: true,
    displayOrder: 7,
    category: 'workspace',
    requiresSeatSelection: false,
    requiresPayment: true,
    usesDeposit: false,
  },
  {
    name: 'Hot Desk',
    slug: 'hot-desk',
    description: 'Flexible access for focused days. Includes shared workspace and amenities.',
    price: 5999,
    currency: 'INR',
    billingPeriod: 'month',
    pricingLabel: '₹5,999/mo founding rate',
    paymentMode: 'RESERVATION',
    reservationAmount: 999,
    isActive: true,
    displayOrder: 8,
    category: 'workspace',
    requiresSeatSelection: true,
    requiresPayment: true,
    usesDeposit: true,
  },
  {
    name: 'Dedicated Desk',
    slug: 'dedicated-desk',
    description: 'Your own 24/7 dedicated desk, studio access & member network.',
    price: 8999,
    currency: 'INR',
    billingPeriod: 'month',
    pricingLabel: '₹8,999/mo founding rate',
    paymentMode: 'RESERVATION',
    reservationAmount: 999,
    isActive: true,
    displayOrder: 9,
    category: 'workspace',
    requiresSeatSelection: true,
    requiresPayment: true,
    usesDeposit: true,
  },
];

/**
 * Seed default plans if collection is empty or update missing payment modes
 */
async function seedPlansIfEmpty() {
  const count = await Plan.countDocuments();
  if (count === 0) {
    console.log('Seeding initial membership plans into MongoDB...');
    await Plan.insertMany(INITIAL_PLANS);
    console.log('Successfully seeded 9 membership plans.');
  } else {
    // Ensure existing seeded plans have proper paymentMode and reservationAmount
    for (const initPlan of INITIAL_PLANS) {
      const doc = await Plan.findOne({ slug: initPlan.slug });
      if (doc) {
        if (!doc.paymentMode || (initPlan.paymentMode === 'RESERVATION' && doc.paymentMode !== 'RESERVATION' && (!doc.reservationAmount || doc.reservationAmount === 0))) {
          doc.paymentMode = initPlan.paymentMode;
          doc.reservationAmount = initPlan.reservationAmount;
          await doc.save();
        }
      }
    }
  }
}

/**
 * @desc    Get active plans (Public)
 * @route   GET /api/plans
 * @access  Public
 */
export async function getActivePlans(req, res) {
  try {
    await seedPlansIfEmpty();
    const plans = await Plan.find({ isActive: true }).sort({ displayOrder: 1, createdAt: 1 });
    res.json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching plans',
    });
  }
}

/**
 * @desc    Get all plans (Admin)
 * @route   GET /api/admin/plans
 * @access  Private (Admin)
 */
export async function getAllPlansAdmin(req, res) {
  try {
    await seedPlansIfEmpty();
    const plans = await Plan.find({}).sort({ displayOrder: 1, createdAt: 1 });
    res.json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching admin plans',
    });
  }
}

/**
 * Helper to generate slug from name
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * @desc    Create a new plan
 * @route   POST /api/admin/plans
 * @access  Private (Admin)
 */
export async function createPlan(req, res) {
  try {
    const {
      name,
      slug,
      description,
      price,
      currency = 'INR',
      billingPeriod,
      pricingLabel,
      paymentMode = 'FULL_PAYMENT',
      reservationAmount = 999,
      isActive = true,
      displayOrder = 0,
      category = 'workspace',
      requiresSeatSelection = false,
      requiresPayment = true,
      usesDeposit = false,
      allowsQuantity = true,
      requiresDate = false,
      requiresTime = false,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Plan name cannot be empty.' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a valid positive number.' });
    }

    if (!billingPeriod) {
      return res.status(400).json({ success: false, message: 'Billing period must be selected.' });
    }

    const finalSlug = (slug && slug.trim()) ? slugify(slug) : slugify(name);

    // Check slug collision
    const existing = await Plan.findOne({ slug: finalSlug });
    if (existing) {
      return res.status(400).json({ success: false, message: `A plan with slug "${finalSlug}" already exists.` });
    }

    const normalizedPaymentMode = paymentMode === 'RESERVATION' ? 'RESERVATION' : 'FULL_PAYMENT';
    const numResAmount = Number(reservationAmount);
    const normalizedReservationAmount = normalizedPaymentMode === 'RESERVATION'
      ? (!isNaN(numResAmount) && numResAmount > 0 ? numResAmount : 999)
      : 0;

    const plan = new Plan({
      name: name.trim(),
      slug: finalSlug,
      description: (description || '').trim(),
      price: numPrice,
      currency,
      billingPeriod,
      pricingLabel: (pricingLabel || '').trim(),
      paymentMode: normalizedPaymentMode,
      reservationAmount: normalizedReservationAmount,
      isActive: Boolean(isActive),
      displayOrder: Number(displayOrder) || 0,
      category: category || 'workspace',
      requiresSeatSelection: Boolean(requiresSeatSelection),
      requiresPayment: Boolean(requiresPayment),
      usesDeposit: Boolean(usesDeposit),
      allowsQuantity: Boolean(allowsQuantity),
      requiresDate: Boolean(requiresDate),
      requiresTime: Boolean(requiresTime),
    });

    await plan.save();

    res.status(201).json({
      success: true,
      data: plan,
      message: 'Plan created successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create plan.',
    });
  }
}

/**
 * @desc    Update an existing plan
 * @route   PUT /api/admin/plans/:id
 * @access  Private (Admin)
 */
export async function updatePlan(req, res) {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    const {
      name,
      slug,
      description,
      price,
      currency,
      billingPeriod,
      pricingLabel,
      paymentMode,
      reservationAmount,
      isActive,
      displayOrder,
      category,
      requiresSeatSelection,
      requiresPayment,
      usesDeposit,
      allowsQuantity,
      requiresDate,
      requiresTime,
    } = req.body;

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Plan name cannot be empty.' });
      }
      plan.name = name.trim();
    }

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({ success: false, message: 'Price must be a valid positive number.' });
      }
      plan.price = numPrice;
    }

    if (billingPeriod !== undefined) {
      if (!billingPeriod) {
        return res.status(400).json({ success: false, message: 'Billing period must be selected.' });
      }
      plan.billingPeriod = billingPeriod;
    }

    if (slug !== undefined && slug.trim()) {
      const newSlug = slugify(slug);
      if (newSlug !== plan.slug) {
        const existing = await Plan.findOne({ slug: newSlug, _id: { $ne: id } });
        if (existing) {
          return res.status(400).json({ success: false, message: `Slug "${newSlug}" is already in use by another plan.` });
        }
        plan.slug = newSlug;
      }
    }

    if (description !== undefined) plan.description = description.trim();
    if (currency !== undefined) plan.currency = currency;
    if (pricingLabel !== undefined) plan.pricingLabel = pricingLabel.trim();

    if (paymentMode !== undefined) {
      plan.paymentMode = paymentMode === 'RESERVATION' ? 'RESERVATION' : 'FULL_PAYMENT';
    }

    if (plan.paymentMode === 'RESERVATION') {
      const targetResAmount = reservationAmount !== undefined ? Number(reservationAmount) : Number(plan.reservationAmount);
      plan.reservationAmount = !isNaN(targetResAmount) && targetResAmount > 0 ? targetResAmount : 999;
    } else {
      plan.reservationAmount = 0;
    }

    if (isActive !== undefined) plan.isActive = Boolean(isActive);
    if (displayOrder !== undefined) plan.displayOrder = Number(displayOrder) || 0;
    if (category !== undefined) plan.category = category;
    if (requiresSeatSelection !== undefined) plan.requiresSeatSelection = Boolean(requiresSeatSelection);
    if (requiresPayment !== undefined) plan.requiresPayment = Boolean(requiresPayment);
    if (usesDeposit !== undefined) plan.usesDeposit = Boolean(usesDeposit);
    if (allowsQuantity !== undefined) plan.allowsQuantity = Boolean(allowsQuantity);
    if (requiresDate !== undefined) plan.requiresDate = Boolean(requiresDate);
    if (requiresTime !== undefined) plan.requiresTime = Boolean(requiresTime);

    await plan.save();

    res.json({
      success: true,
      data: plan,
      message: 'Plan updated successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update plan.',
    });
  }
}

/**
 * @desc    Delete or deactivate a plan
 * @route   DELETE /api/admin/plans/:id
 * @access  Private (Admin)
 */
export async function deletePlan(req, res) {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    // Soft delete / deactivate to preserve historical bookings
    plan.isActive = false;
    await plan.save();

    res.json({
      success: true,
      message: `Plan "${plan.name}" deactivated successfully. Existing bookings remain unaffected.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete plan.',
    });
  }
}
