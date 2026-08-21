import WorkspaceConfig from '../models/WorkspaceConfig.js';
import Reservation from '../models/Reservation.js';
import Seat from '../models/Seat.js';
import AuditLog from '../models/AuditLog.js';
import { broadcast } from '../socket.js';

/**
 * Log admin action
 */
async function logAction(adminId, action, details) {
  try {
    await AuditLog.create({
      adminId,
      action,
      ...details,
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

/**
 * @desc    Get capacity settings and current stats
 * @route   GET /api/admin/capacity
 * @access  Private (ADMIN)
 */
export async function getCapacityStats(req, res) {
  try {
    let config = await WorkspaceConfig.findOne();
    if (!config) {
      config = await WorkspaceConfig.create({});
    }

    const totalCapacity = config.totalCapacity;
    const now = new Date();

    // Active Bookings = CONFIRMED leads that are seat_reservations
    const activeBookings = await Reservation.countDocuments({
      leadStatus: 'CONFIRMED',
      requestType: 'seat_reservation',
    });

    const pendingPayments = await Reservation.countDocuments({
      paymentStatus: 'PENDING',
      requestType: 'seat_reservation',
    });

    const cancelledBookings = await Reservation.countDocuments({
      leadStatus: { $in: ['CANCELLED', 'REFUNDED', 'LOST'] },
    });

    const adminBlockedSeats = await Seat.countDocuments({
      status: { $in: ['blocked', 'maintenance'] },
    });

    // Active Holds
    const activeHolds = await Seat.countDocuments({
      status: 'held',
      heldUntil: { $gte: now },
    });

    const availableCapacity = totalCapacity - activeBookings - activeHolds - adminBlockedSeats;

    res.json({
      success: true,
      config,
      stats: {
        totalCapacity,
        activeBookings,
        pendingPayments,
        cancelledBookings,
        adminBlockedSeats,
        activeHolds,
        availableCapacity: Math.max(0, availableCapacity),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc    Update capacity settings
 * @route   PATCH /api/admin/capacity
 * @access  Private (SUPER_ADMIN)
 */
export async function updateCapacitySettings(req, res) {
  const { totalCapacity, holdDurationMinutes, freeTrialCapacity, refundableSeatDeposit } = req.body;

  try {
    let config = await WorkspaceConfig.findOne();
    if (!config) {
      config = new WorkspaceConfig();
    }

    const oldConfig = config.toObject();

    if (totalCapacity !== undefined) config.totalCapacity = totalCapacity;
    if (holdDurationMinutes !== undefined) config.holdDurationMinutes = holdDurationMinutes;
    if (freeTrialCapacity !== undefined) config.freeTrialCapacity = freeTrialCapacity;
    if (refundableSeatDeposit !== undefined && refundableSeatDeposit > 0) config.refundableSeatDeposit = refundableSeatDeposit;

    await config.save();

    await logAction(req.user._id, 'ADMIN_CHANGED_CAPACITY', {
      oldValue: oldConfig,
      newValue: config.toObject(),
    });

    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc    Create manual booking
 * @route   POST /api/admin/bookings
 * @access  Private (ADMIN)
 */
export async function createManualBooking(req, res) {
  try {
    const { name, phone, email, company, plan, joiningDate, seatNumbers, amount, paymentStatus, leadStatus, notes } = req.body;

    // Optional seat parsing
    let parsedSeats = [];
    let conditions = [];
    if (Array.isArray(seatNumbers) && seatNumbers.length > 0) {
      parsedSeats = seatNumbers.map((s) => {
        const parts = s.split('-');
        return { zone: parts[0], label: parts[1] };
      });
      conditions = parsedSeats.map((p) => ({ zone: p.zone, label: p.label }));
    }

    // Check capacity if reserving seats
    if (conditions.length > 0) {
       const reservedSeats = await Seat.find({
          $and: [
            { $or: conditions },
            {
              $or: [
                { status: { $in: ['reserved', 'blocked', 'maintenance'] } },
                { status: 'held', heldUntil: { $gte: new Date() } }
              ]
            }
          ]
        });

        if (reservedSeats.length > 0) {
           return res.status(400).json({ success: false, message: 'One or more selected seats are not available.' });
        }
    }

    // Fetch global config for recording deposit rate
    let workspaceConfig = await WorkspaceConfig.findOne();
    const seatDepositAmount = workspaceConfig ? (workspaceConfig.refundableSeatDeposit || 1000) : 1000;
    const computedAmount = (Array.isArray(seatNumbers) && seatNumbers.length > 0) ? seatNumbers.length * seatDepositAmount : 0;

    const reservation = new Reservation({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      company: (company || '').trim(),
      plan: plan || '',
      joiningDate: joiningDate || '',
      seatNumbers: seatNumbers || [],
      amount: amount !== undefined ? amount : computedAmount,
      seatDepositAmount,
      paymentStatus: paymentStatus || 'PAID',
      leadStatus: leadStatus || 'CONFIRMED',
      notes: notes || '',
      requestType: 'seat_reservation',
      utmSource: 'ADMIN',
    });

    await reservation.save();

    if (conditions.length > 0) {
      await Seat.updateMany(
        { $or: conditions },
        { status: 'reserved', reservationId: reservation._id, heldBy: null, heldUntil: null }
      );
      
      const updatedSeats = await Seat.find({ $or: conditions });
      broadcast({ type: 'SEAT_UPDATE', seats: updatedSeats });
    }

    broadcast({ type: 'NEW_LEAD', lead: reservation });

    await logAction(req.user._id, 'ADMIN_CREATED_BOOKING', {
      bookingId: reservation._id,
      newValue: reservation.toObject(),
    });

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc    Block or Unblock a seat
 * @route   POST /api/admin/seats/:id/:action
 * @access  Private (ADMIN)
 */
export async function manageSeatState(req, res) {
  const { id, action } = req.params; // action = block or unblock
  const { reason } = req.body;

  try {
    const seat = await Seat.findById(id);
    if (!seat) {
      return res.status(404).json({ success: false, message: 'Seat not found' });
    }

    const oldStatus = seat.status;

    if (action === 'block') {
      if (['reserved', 'held'].includes(seat.status)) {
        return res.status(400).json({ success: false, message: `Cannot block a seat that is currently ${seat.status}` });
      }
      seat.status = 'blocked';
    } else if (action === 'unblock') {
      if (!['blocked', 'maintenance', 'reserved'].includes(seat.status)) {
         return res.status(400).json({ success: false, message: `Seat is already ${seat.status}` });
      }
      seat.status = 'available';
      seat.reservationId = null;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Use block or unblock.' });
    }

    await seat.save();

    broadcast({ type: 'SEAT_UPDATE', seats: [seat] });

    await logAction(req.user._id, action === 'block' ? 'ADMIN_BLOCKED_SEAT' : 'ADMIN_UNBLOCKED_SEAT', {
      seatId: seat._id,
      oldValue: oldStatus,
      newValue: seat.status,
      reason,
    });

    res.json({ success: true, data: seat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc    Get amount settings
 * @route   GET /api/admin/settings/amount
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
export async function getAmountSettings(req, res) {
  try {
    let config = await WorkspaceConfig.findOne();
    if (!config) {
      config = await WorkspaceConfig.create({});
    }
    res.json({
      success: true,
      bookingDepositAmount: config.refundableSeatDeposit || 1000,
      currency: config.currency || 'INR',
      updatedAt: config.updatedAt,
      updatedBy: config.updatedBy || 'admin',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc    Update amount settings
 * @route   PUT /api/admin/settings/amount
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
export async function updateAmountSettings(req, res) {
  const { amount } = req.body;

  // Validation
  const parsedAmount = Number(amount);
  if (amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid amount. Amount must be a positive number greater than zero.'
    });
  }

  try {
    let config = await WorkspaceConfig.findOne();
    if (!config) {
      config = new WorkspaceConfig();
    }

    const oldConfig = config.toObject();

    config.refundableSeatDeposit = parsedAmount;
    config.updatedBy = req.user.username || 'admin';

    await config.save();

    await logAction(req.user._id, 'ADMIN_CHANGED_AMOUNT', {
      oldValue: oldConfig.refundableSeatDeposit,
      newValue: config.refundableSeatDeposit,
      updatedBy: config.updatedBy,
    });

    res.json({
      success: true,
      bookingDepositAmount: config.refundableSeatDeposit,
      currency: config.currency || 'INR',
      updatedAt: config.updatedAt,
      updatedBy: config.updatedBy,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

