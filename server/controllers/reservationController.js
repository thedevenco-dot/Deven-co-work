import WorkspaceConfig from '../models/WorkspaceConfig.js';
import Reservation from '../models/Reservation.js';
import Seat from '../models/Seat.js';
import Content from '../models/Content.js';
import { broadcast } from '../socket.js';
import {
  sendTrialConfirmationEmail,
  sendTourUserConfirmationEmail,
  sendTourAdminNotificationEmail,
} from '../services/emailService.js';

/**
 * @desc    Get all seats layout
 * @route   GET /api/seats
 * @access  Public
 */
export async function getSeats(req, res) {
  try {
    // Proactive cleanup of expired holds on fetch
    const now = new Date();
    const expiredHolds = await Seat.find({
      status: 'held',
      heldUntil: { $lt: now }
    });
    
    if (expiredHolds.length > 0) {
      console.log(`Eager cleaner: Releasing ${expiredHolds.length} expired seat holds.`);
      const seatIds = expiredHolds.map(s => s._id);
      await Seat.updateMany(
        { _id: { $in: seatIds } },
        { status: 'available', heldUntil: null, heldBy: null }
      );
      
      // Broadcast seat release to all pages
      broadcast({
        type: 'SEAT_UPDATE',
        seats: expiredHolds.map(s => ({ ...s.toObject(), status: 'available', heldUntil: null, heldBy: null }))
      });
    }

    let workspaceConfig = await WorkspaceConfig.findOne();
    if (!workspaceConfig) {
      workspaceConfig = await WorkspaceConfig.create({});
    }

    const seats = await Seat.find({}).sort({ zone: 1, label: 1 });
    res.json({
      success: true,
      count: seats.length,
      data: seats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching seats map',
    });
  }
}


/**
 * @desc    Get all reservations and leads list (Dashboard panel)
 * @route   GET /api/reservations
 * @access  Private (Admin Only)
 */
export async function getReservations(req, res) {
  try {
    const reservations = await Reservation.find({}).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching reservations list',
    });
  }
}

/**
 * @desc    Update lead/reservation details (Dashboard admin updates)
 * @route   PATCH /api/reservations/:id
 * @access  Private (Admin Only)
 */
export async function updateReservation(req, res) {
  const { id } = req.params;
  const { leadStatus, paymentStatus, notes, followUpDate, refundType } = req.body;

  try {
    let doc = await Reservation.findById(id);

    if (!doc) {
      res.status(404).json({ success: false, message: 'Reservation not found' });
      return;
    }

    if (leadStatus !== undefined) doc.leadStatus = leadStatus;
    if (notes !== undefined) doc.notes = notes;
    if (followUpDate !== undefined) doc.followUpDate = followUpDate;

    if (paymentStatus !== undefined) doc.paymentStatus = paymentStatus;
    if (refundType !== undefined) doc.refundType = refundType;

    // Handle manual cancellation or refund state to release seats
    const isCancelledOrRefunded =
      ['CANCELLED', 'REFUNDED', 'LOST'].includes(doc.leadStatus) ||
      ['REFUNDED'].includes(doc.paymentStatus);

    if (isCancelledOrRefunded) {
        const seatsToRelease = await Seat.find({ reservationId: doc._id });
        if (seatsToRelease.length > 0) {
          await Seat.updateMany(
            { reservationId: doc._id },
            { status: 'available', reservationId: null, isStaff: false }
          );
          
          broadcast({
            type: 'SEAT_UPDATE',
            seats: seatsToRelease.map(s => ({ ...s.toObject(), status: 'available', reservationId: null, isStaff: false }))
          });
        }

        if (!doc.refundedAt && doc.leadStatus === 'REFUNDED') {
          doc.refundedAt = new Date();
        }
      }

    await doc.save();

    // Broadcast updates to Admin Panel live
    broadcast({
      type: 'PAYMENT_UPDATE',
      leadId: doc._id,
      paymentStatus: doc.paymentStatus,
      leadStatus: doc.leadStatus
    });

    res.json({
      success: true,
      message: 'Record updated successfully',
      data: doc,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating record',
    });
  }
}



/**
 * @desc    Manually update a seat's availability status
 * @route   POST /api/reservations/seats/status
 * @access  Private (Admin Only)
 */
export async function updateSeatStatus(req, res) {
  const { zone, label, status } = req.body;

  if (!zone || !label || !status) {
    res.status(400).json({
      success: false,
      message: 'Please provide zone, label, and status (Available / Reserved / Staff-Reserved)',
    });
    return;
  }

  try {
    const seat = await Seat.findOne({ zone, label });
    if (!seat) {
      res.status(404).json({ success: false, message: 'Seat not found' });
      return;
    }

    if (status === 'Available') {
      seat.status = 'available';
      seat.isStaff = false;
      seat.reservationId = null;
    } else if (status === 'Reserved') {
      seat.status = 'reserved';
      seat.isStaff = false;
    } else if (status === 'Staff-Reserved') {
      seat.status = 'reserved';
      seat.isStaff = true;
      seat.reservationId = null;
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid status type. Choose Available, Reserved, or Staff-Reserved',
      });
      return;
    }

    await seat.save();

    // Broadcast manual seat override to all pages
    broadcast({
      type: 'SEAT_UPDATE',
      seats: [seat]
    });

    res.json({
      success: true,
      message: `Seat ${zone}-${label} updated to status: ${status}`,
      data: seat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating seat status',
    });
  }
}

/**
 * Helper to calculate next trial dates
 */
function getNextTrialDates(targetDaysArray) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetIndices = targetDaysArray.map(d => daysOfWeek.indexOf(d)).filter(i => i !== -1).sort((a, b) => a - b);
  
  if (targetIndices.length === 0) return { startDate: null, endDate: null };
  
  const now = new Date();
  const currentDay = now.getDay();
  
  const startDayIndex = targetIndices[0];
  const endDayIndex = targetIndices[targetIndices.length - 1];
  
  let daysUntilStart = startDayIndex - currentDay;
  if (daysUntilStart < 0) {
    daysUntilStart += 7;
  }
  
  const startDate = new Date(now);
  startDate.setDate(now.getDate() + daysUntilStart);
  startDate.setHours(0, 0, 0, 0);
  
  let duration = endDayIndex - startDayIndex;
  if (duration < 0) duration += 7;
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + duration);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
}

/**
 * @desc    Create a new Free Trial booking lead
 * @route   POST /api/reservations/free-trial
 * @access  Public
 */
export async function createFreeTrial(req, res) {
  const { name, phone, email, company, utmSource, utmMedium, utmCampaign, email_confirm } = req.body;

  if (email_confirm) {
    res.status(400).json({ success: false, message: 'Spam submission detected.' });
    return;
  }

  if (!name || !phone || !email) {
    res.status(400).json({ success: false, message: 'Please provide name, phone, and email address.' });
    return;
  }

  try {
    // Fetch Trial settings from CMS
    const content = await Content.findOne({ key: 'draft' });
    const trialSettings = content?.freeTrial || {
      enabled: true,
      days: ['Friday', 'Saturday']
    };

    if (!trialSettings.enabled) {
      res.status(400).json({ success: false, message: 'Free trials are currently disabled.' });
      return;
    }

    const { startDate, endDate } = getNextTrialDates(trialSettings.days);

    let workspaceConfig = await WorkspaceConfig.findOne();
    if (!workspaceConfig) workspaceConfig = await WorkspaceConfig.create({});
    
    if (startDate) {
      const dayOfWeek = startDate.toLocaleString('en-US', { weekday: 'long' });
      const trialLimits = workspaceConfig.freeTrialCapacity;
      const limit = trialLimits ? trialLimits.get(dayOfWeek) || 10 : 10;
      
      const existingTrials = await Reservation.countDocuments({
        requestType: 'free_trial',
        trialStartDate: startDate
      });
      
      if (existingTrials >= limit) {
        return res.status(400).json({ success: false, message: `Free trial capacity for upcoming ${dayOfWeek} has been reached. Please check back later.` });
      }
    }

    const lead = new Reservation({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      company: (company || '').trim(),
      requestType: 'free_trial',
      leadStatus: 'TRIAL',
      paymentStatus: 'N/A',
      trialStartDate: startDate,
      trialEndDate: endDate,
      utmSource: utmSource || '',
      utmMedium: utmMedium || '',
      utmCampaign: utmCampaign || '',
    });

    await lead.save();

    // Send free trial confirmation email safely (non-blocking)
    sendTrialConfirmationEmail(lead).catch((emailErr) => {
      console.error('[ReservationController] Error sending free trial email:', emailErr);
    });

    // Notify admin dashboard

    broadcast({
      type: 'NEW_LEAD',
      lead: lead
    });

    res.status(201).json({
      success: true,
      data: lead,
      trialDates: { startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating free trial lead',
    });
  }
}

/**
 * @desc    Create a new WhatsApp Inquiry lead record (non-blocking WhatsApp CTA)
 * @route   POST /api/reservations/whatsapp-lead
 * @access  Public
 */
export async function createWhatsAppLead(req, res) {
  const { name, phone, email, company, utmSource, utmMedium, utmCampaign } = req.body;

  try {
    const lead = new Reservation({
      name: (name || 'WhatsApp Visitor').trim(),
      phone: (phone || 'N/A').trim(),
      email: (email || 'N/A').trim(),
      company: (company || '').trim(),
      requestType: 'whatsapp',
      leadStatus: 'NEW',
      paymentStatus: 'N/A',
      utmSource: utmSource || '',
      utmMedium: utmMedium || '',
      utmCampaign: utmCampaign || '',
    });

    await lead.save();

    // Notify admin dashboard
    broadcast({
      type: 'NEW_LEAD',
      lead: lead
    });

    res.status(201).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating WhatsApp lead',
    });
  }
}

/**
 * @desc    Create a new Free Tour booking lead
 * @route   POST /api/reservations/tour
 * @access  Public
 */
export async function createTourBooking(req, res) {
  const {
    name,
    phone,
    email,
    company,
    preferredDate,
    preferredTime,
    numberOfPeople,
    message,
    utmSource,
    utmMedium,
    utmCampaign,
    email_confirm,
  } = req.body;

  if (email_confirm) {
    res.status(400).json({ success: false, message: 'Spam submission detected.' });
    return;
  }

  if (!name || !name.trim() || !phone || !phone.trim() || !email || !email.trim()) {
    res.status(400).json({
      success: false,
      message: 'Please provide required fields: Name, Phone, and Email address.',
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.',
    });
    return;
  }

  try {
    const tourLead = new Reservation({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      company: (company || '').trim(),
      preferredDate: (preferredDate || '').trim(),
      preferredTime: (preferredTime || '').trim(),
      numberOfPeople: Math.max(1, parseInt(numberOfPeople) || 1),
      message: (message || '').trim(),
      requestType: 'tour',
      leadStatus: 'NEW',
      paymentStatus: 'N/A',
      amount: 0,
      amountPaid: 0,
      amountPaidToday: 0,
      totalAmount: 0,
      utmSource: utmSource || '',
      utmMedium: utmMedium || '',
      utmCampaign: utmCampaign || '',
    });

    await tourLead.save();

    // Send confirmation email to user safely (non-blocking)
    sendTourUserConfirmationEmail(tourLead).catch((err) => {
      console.error('[ReservationController] Error sending tour user confirmation email:', err);
    });

    // Send admin notification email safely (non-blocking)
    sendTourAdminNotificationEmail(tourLead).catch((err) => {
      console.error('[ReservationController] Error sending tour admin notification email:', err);
    });

    // Notify admin dashboard via WebSockets
    broadcast({
      type: 'NEW_LEAD',
      lead: tourLead,
    });

    res.status(201).json({
      success: true,
      message: 'Tour booking requested successfully.',
      data: tourLead,
    });
  } catch (error) {
    console.error('[ReservationController] Error creating tour lead:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while processing your tour request. Please try again.',
    });
  }
}

