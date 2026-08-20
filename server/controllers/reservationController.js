import crypto from 'crypto';
import Reservation from '../models/Reservation.js';
import Seat from '../models/Seat.js';
import Lead from '../models/Lead.js';
import Content from '../models/Content.js';
import { pushToCRM } from '../services/crm.js';
import { broadcast } from '../socket.js';

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
 * @desc    Create a new pending seat reservation & generate Razorpay Order
 * @route   POST /api/reservations
 * @access  Public
 */
export async function createReservation(req, res) {
  const { name, phone, email, company, seatNumbers, plan, utmSource, utmMedium, utmCampaign, email_confirm } = req.body;

  if (email_confirm) {
    console.warn('[Honeypot Triggered] Blocked spam bot submission.');
    res.status(400).json({
      success: false,
      message: 'Spam submission detected.',
    });
    return;
  }

  if (!name || !phone || !email || !plan) {
    res.status(400).json({
      success: false,
      message: 'Please provide name, phone, email, and plan',
    });
    return;
  }

  if (seatNumbers !== undefined && seatNumbers !== null) {
    if (!Array.isArray(seatNumbers) || seatNumbers.length > 7) {
      res.status(400).json({
        success: false,
        message: 'Please select up to 7 desks if choosing specific seats.',
      });
      return;
    }
  }

  try {
    let parsedSeats = [];
    let conditions = [];
    if (Array.isArray(seatNumbers) && seatNumbers.length > 0) {
      parsedSeats = seatNumbers.map((s) => {
        const parts = s.split('-');
        return { zone: parts[0], label: parts[1] };
      });
      conditions = parsedSeats.map((p) => ({ zone: p.zone, label: p.label }));
    }

    const now = new Date();

    // 1. Eager release of expired locks before validating availability
    const expiredHolds = await Seat.find({
      status: 'held',
      heldUntil: { $lt: now }
    });

    if (expiredHolds.length > 0) {
      console.log(`[Cleaner] Releasing ${expiredHolds.length} expired seat holds before checkout verification.`);
      const seatIds = expiredHolds.map(s => s._id);
      await Seat.updateMany(
        { _id: { $in: seatIds } },
        { status: 'available', heldUntil: null, heldBy: null }
      );
      
      broadcast({
        type: 'SEAT_UPDATE',
        seats: expiredHolds.map(s => ({ ...s.toObject(), status: 'available', heldUntil: null, heldBy: null }))
      });
    }

    // Debug logging for request
    console.log(`[Reservation Request] Checking availability for: ${seatNumbers.join(', ')}`);

    // 2. Verify seat availability atomically (grouped in $and to prevent duplicate $or keys bug)
    const reservedSeats = await Seat.find({
      $and: [
        { $or: conditions },
        {
          $or: [
            { status: 'reserved' },
            { isStaff: true },
            { status: 'held', heldUntil: { $gte: now } }
          ]
        }
      ]
    });

    if (reservedSeats.length > 0) {
      reservedSeats.forEach((s) => {
        console.warn(`[Rejected Seat] ${s.zone}-${s.label} | Status: ${s.status} | HeldUntil: ${s.heldUntil} | HeldBy: ${s.heldBy} | isStaff: ${s.isStaff}`);
      });

      const labels = reservedSeats.map((s) => `${s.zone}-${s.label}`).join(', ');
      res.status(400).json({
        success: false,
        message: `These seats are no longer available: ${labels}`,
      });
      return;
    }

    // Fetch dynamic joining date from Content settings or default
    const content = await Content.findOne({ key: 'draft' });
    const jDate = content?.reservation?.joiningDate || '15 September 2026';

    const amount = (Array.isArray(seatNumbers) && seatNumbers.length > 0) ? seatNumbers.length * 1000 : 0;

    // Create Pending Reservation in DB
    const reservation = new Reservation({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      company: (company || '').trim(),
      joiningDate: jDate,
      seatNumbers,
      plan,
      amount,
      paymentStatus: amount > 0 ? 'pending' : 'n/a',
      status: amount > 0 ? 'new' : 'confirmed',
      utmSource: utmSource || '',
      utmMedium: utmMedium || '',
      utmCampaign: utmCampaign || '',
    });

    // Enforce 5-minute Seat Hold in database (only if seats selected)
    if (conditions.length > 0) {
      const heldUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 min hold
      await Seat.updateMany(
        { $or: conditions },
        { status: 'held', heldBy: reservation._id, heldUntil }
      );
    }

    // Save Reservation Order
    const rpKeyId = process.env.RAZORPAY_KEY_ID;
    const rpKeySecret = process.env.RAZORPAY_KEY_SECRET;

    let razorpayOrder = null;

    // Only create Razorpay order for non-zero amounts
    if (amount > 0) {
      if (rpKeyId && rpKeySecret) {
      const auth = Buffer.from(`${rpKeyId}:${rpKeySecret}`).toString('base64');
      const rpResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: amount * 100,
          currency: 'INR',
          receipt: `receipt_order_${reservation._id}`,
        }),
      });

      if (!rpResponse.ok) {
        const errText = await rpResponse.text();
        throw new Error(`Razorpay Order creation failed: ${errText}`);
      }

      razorpayOrder = await rpResponse.json();
      razorpayOrder.key_id = rpKeyId;
      reservation.razorpayOrderId = razorpayOrder.id;
    } else {
      // Mock Razorpay Order for development/testing
      console.log('--- RAZORPAY KEYS MISSING: USING MOCK ORDER ---');
      razorpayOrder = {
        id: `order_mock_${crypto.randomBytes(6).toString('hex')}`,
        key_id: 'rzp_test_mockkey',
        entity: 'order',
        amount: amount * 100,
        amount_paid: 0,
        amount_due: amount * 100,
        currency: 'INR',
        receipt: `receipt_order_${reservation._id}`,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000),
      };
      reservation.razorpayOrderId = razorpayOrder.id;
    }

    }
    // If amount is zero, skip Razorpay creation entirely and mark reservation confirmed
    if (amount === 0) {
      reservation.paymentStatus = 'n/a';
      reservation.status = 'confirmed';
    }

    await reservation.save();

    // Broadcast Seat Hold status to all connected pages (only if seats were selected)
    if (conditions.length > 0) {
      const updatedSeats = await Seat.find({ $or: conditions });
      broadcast({
        type: 'SEAT_UPDATE',
        seats: updatedSeats
      });
    }

    // Push Incomplete Lead to CRM
    const syncRes = await pushToCRM(reservation, 'New Lead');
    reservation.crmSyncStatus = syncRes.success ? 'success' : 'failed';
    reservation.crmSyncError = syncRes.error || '';
    reservation.crmStage = 'New Lead';
    await reservation.save();

    // Broadcast new lead notify to admin panel
    broadcast({
      type: 'NEW_LEAD',
      lead: reservation
    });

    res.status(201).json({
      success: true,
      reservation,
      razorpayOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating reservation order',
    });
  }
}

/**
 * @desc    Verify Razorpay payment signature & confirm seat reservation
 * @route   POST /api/reservations/confirm
 * @access  Public
 */
export async function confirmReservation(req, res) {
  const { reservationId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!reservationId) {
    res.status(400).json({ success: false, message: 'Reservation ID is required' });
    return;
  }

  try {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      res.status(404).json({ success: false, message: 'Reservation not found' });
      return;
    }

    const rpKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (rpKeySecret && razorpaySignature && reservation.razorpayOrderId) {
      // Live HMAC SHA256 validation
      const text = `${reservation.razorpayOrderId}|${razorpayPaymentId}`;
      const generatedSignature = crypto
        .createHmac('sha256', rpKeySecret)
        .update(text)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        res.status(400).json({
          success: false,
          message: 'Payment verification failed: Signature mismatch',
        });
        return;
      }
    } else {
      console.log('--- PAYMENT CONFIRMATION IN MOCK MODE ---');
    }

    // Update Reservation details
    reservation.paymentStatus = 'confirmed';
    reservation.status = 'confirmed';
    reservation.razorpayPaymentId = razorpayPaymentId || 'pay_mock_confirmed';
    reservation.razorpaySignature = razorpaySignature || 'sig_mock_confirmed';
    await reservation.save();

    // If seats were part of the reservation, lock them (Flip from held -> reserved)
    if (Array.isArray(reservation.seatNumbers) && reservation.seatNumbers.length > 0) {
      const parsedSeats = reservation.seatNumbers.map((s) => {
        const parts = s.split('-');
        return { zone: parts[0], label: parts[1] };
      });

      const conditions = parsedSeats.map((p) => ({ zone: p.zone, label: p.label }));

      await Seat.updateMany(
        { $or: conditions },
        { status: 'reserved', reservationId: reservation._id, heldBy: null, heldUntil: null }
      );

      // Broadcast seats locked update to all browsers
      const updatedSeats = await Seat.find({ $or: conditions });
      broadcast({
        type: 'SEAT_UPDATE',
        seats: updatedSeats
      });
    }

    // Broadcast payment confirm alert to admin panel
    broadcast({
      type: 'PAYMENT_UPDATE',
      leadId: reservation._id,
      paymentStatus: 'confirmed',
      status: 'confirmed'
    });

    // Push Confirmed Handoff to CRM
    const syncRes = await pushToCRM(reservation, 'Reservation Confirmed');
    reservation.crmSyncStatus = syncRes.success ? 'success' : 'failed';
    reservation.crmSyncError = syncRes.error || '';
    reservation.crmStage = 'Reservation Confirmed';
    await reservation.save();

    res.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during payment confirmation',
    });
  }
}

/**
 * @desc    Mark reservation as failed (payment abandoned/failed)
 * @route   POST /api/reservations/fail
 * @access  Public
 */
export async function failReservation(req, res) {
  const { reservationId } = req.body;

  if (!reservationId) {
    res.status(400).json({ success: false, message: 'Reservation ID is required' });
    return;
  }

  try {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      res.status(404).json({ success: false, message: 'Reservation not found' });
      return;
    }

    // Update payment status
    reservation.paymentStatus = 'failed';
    await reservation.save();

    const parsedSeats = reservation.seatNumbers.map((s) => {
      const parts = s.split('-');
      return { zone: parts[0], label: parts[1] };
    });

    const conditions = parsedSeats.map((p) => ({ zone: p.zone, label: p.label }));

    // Release seat holds immediately back to available
    await Seat.updateMany(
      { $or: conditions, heldBy: reservation._id },
      { status: 'available', heldBy: null, heldUntil: null }
    );

    // Broadcast seats released back to available status
    const updatedSeats = await Seat.find({ $or: conditions });
    broadcast({
      type: 'SEAT_UPDATE',
      seats: updatedSeats
    });

    // Broadcast failed alert to admin panel
    broadcast({
      type: 'PAYMENT_UPDATE',
      leadId: reservation._id,
      paymentStatus: 'failed',
      status: reservation.status
    });

    // Push Incomplete checkout lead update to CRM
    const syncRes = await pushToCRM(reservation, 'Contacted');
    reservation.crmSyncStatus = syncRes.success ? 'success' : 'failed';
    reservation.crmSyncError = syncRes.error || '';
    reservation.crmStage = 'Contacted';
    await reservation.save();

    res.json({
      success: true,
      message: 'Reservation logged as abandoned/failed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while marking reservation as failed',
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
    const leads = await Lead.find({}).sort({ createdAt: -1 });

    // Map leads to look like reservations in the table grid
    const mappedLeads = leads.map((l) => {
      const obj = l.toObject();
      return {
        ...obj,
        seatNumbers: [],
        plan: obj.type === 'FREE_TRIAL' ? 'Free Trial' : 'WhatsApp Inquiry',
        amount: 0,
        paymentStatus: 'n/a',
        isLead: true,
      };
    });

    const combined = [...reservations, ...mappedLeads].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      success: true,
      count: combined.length,
      data: combined,
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
  const { status, paymentStatus, notes, refundType } = req.body;

  try {
    let doc = await Reservation.findById(id);
    let isLead = false;

    if (!doc) {
      doc = await Lead.findById(id);
      if (!doc) {
        res.status(404).json({ success: false, message: 'Reservation or Lead not found' });
        return;
      }
      isLead = true;
    }

    if (status !== undefined) doc.status = status;
    if (notes !== undefined) doc.notes = notes;

    if (!isLead) {
      if (paymentStatus !== undefined) doc.paymentStatus = paymentStatus;
      if (refundType !== undefined) doc.refundType = refundType;

      // Handle manual cancellation or refund state to release seats
      const isCancelledOrRefunded =
        ['cancelled', 'refunded'].includes(doc.status) ||
        ['refunded'].includes(doc.paymentStatus);

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

        if (!doc.refundedAt && doc.status === 'refunded') {
          doc.refundedAt = new Date();
        }
      }
    }

    await doc.save();

    // Broadcast updates to Admin Panel live
    broadcast({
      type: 'PAYMENT_UPDATE',
      leadId: doc._id,
      paymentStatus: isLead ? 'n/a' : doc.paymentStatus,
      status: doc.status
    });

    // Trigger Zoho Sync for Status Update
    let syncStage = 'New Lead';
    if (doc.status === 'contacted') syncStage = 'Contacted';
    if (doc.status === 'confirmed') syncStage = 'Reservation Confirmed';
    if (doc.status === 'cancelled' || doc.status === 'refunded') syncStage = 'Cancelled';

    const syncRes = await pushToCRM(doc, syncStage);
    doc.crmSyncStatus = syncRes.success ? 'success' : 'failed';
    doc.crmSyncError = syncRes.error || '';
    doc.crmStage = syncStage;
    await doc.save();

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
 * @desc    Manual Force Retry of Zoho Bigin CRM Sync
 * @route   POST /api/reservations/:id/sync
 * @access  Private (Admin Only)
 */
export async function retryCRMSync(req, res) {
  const { id } = req.params;

  try {
    let doc = await Reservation.findById(id);
    let isLead = false;

    if (!doc) {
      doc = await Lead.findById(id);
      if (!doc) {
        res.status(404).json({ success: false, message: 'Reservation or Lead not found' });
        return;
      }
      isLead = true;
    }

    let syncStage = doc.crmStage || 'New Lead';
    if (doc.status === 'contacted') syncStage = 'Contacted';
    if (doc.status === 'confirmed') syncStage = 'Reservation Confirmed';
    if (doc.status === 'cancelled' || doc.status === 'refunded') syncStage = 'Cancelled';

    const syncRes = await pushToCRM(doc, syncStage);
    doc.crmSyncStatus = syncRes.success ? 'success' : 'failed';
    doc.crmSyncError = syncRes.error || '';
    doc.crmStage = syncStage;
    await doc.save();

    if (syncRes.success) {
      res.json({
        success: true,
        message: 'CRM Sync successfully completed',
        data: doc,
      });
    } else {
      res.status(400).json({
        success: false,
        message: `CRM Sync failed: ${syncRes.error}`,
        data: doc,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while retrying CRM sync',
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

    const lead = new Lead({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      company: (company || '').trim(),
      type: 'FREE_TRIAL',
      status: 'new',
      trialStartDate: startDate,
      trialEndDate: endDate,
      utmSource: utmSource || '',
      utmMedium: utmMedium || '',
      utmCampaign: utmCampaign || '',
    });

    await lead.save();

    // Sync Zoho CRM Webhook
    const syncRes = await pushToCRM(lead, 'New Lead');
    lead.crmSyncStatus = syncRes.success ? 'success' : 'failed';
    lead.crmSyncError = syncRes.error || '';
    await lead.save();

    // Notify admin dashboard
    broadcast({
      type: 'NEW_LEAD',
      lead: {
        ...lead.toObject(),
        seatNumbers: [],
        plan: 'Free Trial',
        amount: 0,
        paymentStatus: 'n/a',
        isLead: true,
      }
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
    const lead = new Lead({
      name: (name || 'WhatsApp Visitor').trim(),
      phone: (phone || 'N/A').trim(),
      email: (email || 'N/A').trim(),
      company: (company || '').trim(),
      type: 'WHATSAPP_INQUIRY',
      status: 'new',
      utmSource: utmSource || '',
      utmMedium: utmMedium || '',
      utmCampaign: utmCampaign || '',
    });

    await lead.save();

    // Sync Zoho CRM Webhook
    const syncRes = await pushToCRM(lead, 'New Lead');
    lead.crmSyncStatus = syncRes.success ? 'success' : 'failed';
    lead.crmSyncError = syncRes.error || '';
    await lead.save();

    // Notify admin dashboard
    broadcast({
      type: 'NEW_LEAD',
      lead: {
        ...lead.toObject(),
        seatNumbers: [],
        plan: 'WhatsApp Inquiry',
        amount: 0,
        paymentStatus: 'n/a',
        isLead: true,
      }
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
