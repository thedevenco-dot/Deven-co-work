import express from 'express';
import crypto from 'crypto';
import Reservation from '../models/Reservation.js';
import Seat from '../models/Seat.js';
import { pushToCRM } from '../services/crm.js';

const router = express.Router();

router.post('/razorpay', async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (secret && signature) {
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      console.error('Razorpay Webhook verification failed: Signature mismatch');
      res.status(400).json({ success: false, message: 'Invalid signature' });
      return;
    }
  } else {
    console.log('Razorpay Webhook: Skipping signature verification (Secret/Signature missing)');
  }

  const event = req.body.event;
  const payload = req.body.payload;

  console.log(`Razorpay Webhook received event: ${event}`);

  try {
    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (!orderId) {
        res.status(400).json({ success: false, message: 'No order ID found in payload' });
        return;
      }

      const reservation = await Reservation.findOne({ razorpayOrderId: orderId });
      if (reservation && reservation.paymentStatus !== 'confirmed') {
        reservation.paymentStatus = 'confirmed';
        reservation.razorpayPaymentId = paymentId || reservation.razorpayPaymentId;
        await reservation.save();

        // Lock seats
        const parsedSeats = reservation.seatNumbers.map((s) => {
          const parts = s.split('-');
          return { zone: parts[0], label: parts[1] };
        });
        const conditions = parsedSeats.map((p) => ({ zone: p.zone, label: p.label }));
        await Seat.updateMany(
          { $or: conditions },
          { status: 'reserved', reservationId: reservation._id }
        );

        // Sync CRM
        const syncRes = await pushToCRM(reservation, 'Reservation Confirmed');
        reservation.crmSyncStatus = syncRes.success ? 'success' : 'failed';
        reservation.crmSyncError = syncRes.error || '';
        reservation.crmStage = 'Reservation Confirmed';
        await reservation.save();
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (orderId) {
        const reservation = await Reservation.findOne({ razorpayOrderId: orderId });
        if (reservation) {
          reservation.paymentStatus = 'failed';
          await reservation.save();

          // Sync CRM
          const syncRes = await pushToCRM(reservation, 'Contacted');
          reservation.crmSyncStatus = syncRes.success ? 'success' : 'failed';
          reservation.crmSyncError = syncRes.error || '';
          reservation.crmStage = 'Contacted';
          await reservation.save();
        }
      }
    } else if (event === 'refund.created' || event === 'payment.refunded') {
      const refundEntity = payload.refund?.entity || payload.payment?.entity;
      const paymentId = refundEntity?.payment_id || refundEntity?.id;

      if (paymentId) {
        const reservation = await Reservation.findOne({ razorpayPaymentId: paymentId });
        if (reservation) {
          reservation.paymentStatus = 'refunded';
          reservation.status = 'refunded';
          reservation.refundedAt = new Date();
          reservation.refundType = 'pre_launch';
          await reservation.save();

          // Free seats
          await Seat.updateMany(
            { reservationId: reservation._id },
            { status: 'available', reservationId: null, isStaff: false }
          );

          // Sync CRM
          const syncRes = await pushToCRM(reservation, 'Cancelled');
          reservation.crmSyncStatus = syncRes.success ? 'success' : 'failed';
          reservation.crmSyncError = syncRes.error || '';
          reservation.crmStage = 'Cancelled';
          await reservation.save();
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error(`Error processing Razorpay webhook: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
