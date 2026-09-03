import { Resend } from 'resend';
import Content from '../models/Content.js';
import Reservation from '../models/Reservation.js';

// Lazy-initialize Resend instance
function getResendClient() {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Fetch logo URL dynamically from CMS content
 */
async function getCmsLogoUrl() {
  try {
    const content = await Content.findOne({ key: 'published' }) || await Content.findOne({ key: 'draft' });
    const logo = content?.globalSettings?.logo || content?.header?.logo;
    if (!logo) return '';
    if (typeof logo === 'string') return logo;
    if (typeof logo === 'object' && logo !== null) return logo.url || '';
  } catch (err) {
    console.error('[EmailService] Failed to fetch CMS logo:', err.message);
  }
  return '';
}

/**
 * Format reference ID safely
 */
function getReferenceId(id) {
  if (!id) return 'DC-BOOKING';
  const str = id.toString();
  return `DC-${str.substring(str.length - 8).toUpperCase()}`;
}

/**
 * Common Header HTML for Emails
 */
function getEmailHeaderHtml(logoUrl, badgeText) {
  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="Deven Co-Work" style="max-height: 38px; width: auto; display: block; border: 0;" />`
    : `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: 700; letter-spacing: 2px; color: #FCFAF9;">DEVEN <span style="color: #04B8BB; font-size: 11px; font-weight: 600; tracking: 3px;">COWORK</span></div>`;

  return `
    <div style="background-color: #024E5C; padding: 24px; text-align: center; border-bottom: 2px solid #04B8BB;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            ${logoHtml}
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top: 14px;">
            <span style="display: inline-block; background-color: rgba(4, 184, 187, 0.15); border: 1px solid #04B8BB; color: #04B8BB; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 5px 14px; border-radius: 4px;">
              ${badgeText}
            </span>
          </td>
        </tr>
      </table>
    </div>
  `;
}

/**
 * Common Footer HTML for Emails
 */
function getEmailFooterHtml(whatsappUrl) {
  return `
    <div style="background-color: #080808; padding: 24px; text-align: center; border-top: 1px solid #222222; color: #A3A3A3; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.6;">
      <p style="margin: 0 0 12px 0; color: #FCFAF9; font-weight: 600;">Deven Co-Work Workspace</p>
      <p style="margin: 0 0 12px 0;">VIP Estate, A1, VIP Colony, Shankar Nagar, Raipur, Chhattisgarh 492001</p>
      <p style="margin: 0 0 16px 0;">
        Phone: <a href="tel:+916260582852" style="color: #04B8BB; text-decoration: none;">+91 62605 82852</a> &nbsp;|&nbsp; 
        Email: <a href="mailto:bookings@devencowork.com" style="color: #04B8BB; text-decoration: none;">bookings@devencowork.com</a>
      </p>
      <div style="margin-top: 16px;">
        <a href="${whatsappUrl}" target="_blank" style="display: inline-block; background-color: #04B8BB; color: #0C0C0C; font-family: Arial, sans-serif; font-size: 12px; font-weight: 700; text-decoration: none; padding: 10px 20px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">
          Chat on WhatsApp →
        </a>
      </div>
      <p style="margin: 20px 0 0 0; font-size: 11px; color: #666666;">
        © ${new Date().getFullYear()} Deven Co-Work. All rights reserved.
      </p>
    </div>
  `;
}

/**
 * Build HTML template for Seat Booking Confirmation
 */
function buildBookingConfirmationHtml(booking, logoUrl) {
  const refId = getReferenceId(booking._id);
  const seatsStr = Array.isArray(booking.seatNumbers) && booking.seatNumbers.length > 0
    ? booking.seatNumbers.join(', ')
    : 'Assigned Workspace Seat';
  
  const formattedAmount = booking.amount ? `₹${booking.amount.toLocaleString('en-IN')}` : '₹0';
  const depositText = booking.seatDepositAmount ? `₹${booking.seatDepositAmount.toLocaleString('en-IN')}` : '₹1,000';
  const whatsappMsg = encodeURIComponent(`Hi Deven Co-Work, I have a question regarding my booking #${refId}`);
  const whatsappUrl = `https://wa.me/916260582852?text=${whatsappMsg}`;

  return `
  const isReservation = booking.paymentMode === 'RESERVATION';
  const headerTitle = isReservation ? 'Reservation Confirmed' : 'Booking Confirmed';
  const sCount = booking.seatCount || (Array.isArray(booking.seatNumbers) && booking.seatNumbers.length > 0 ? booking.seatNumbers.length : 1);
  const paidToday = booking.amountPaidToday || booking.amountPaid || booking.totalAmount || (booking.reservationAmount ? booking.reservationAmount * sCount : 999 * sCount);
  const totalVal = booking.totalMembershipAmount || ((booking.planPrice || 6999) * sCount);
  const remainingAtJoining = booking.remainingAmount !== undefined ? booking.remainingAmount : Math.max(0, totalVal - paidToday);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${headerTitle} — Deven Co-Work</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0C0C0C; font-family: Arial, sans-serif; color: #FCFAF9;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0C0C0C; padding: 20px 10px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #121212; border: 1px solid #024E5C; border-radius: 8px; overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td>
                  ${getEmailHeaderHtml(logoUrl, headerTitle)}
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td style="padding: 30px 24px;">
                  <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #FCFAF9; letter-spacing: 0.5px;">
                    ${isReservation ? 'Your Founding Member Seat Reservation is Locked!' : 'Your Workspace Booking is Confirmed!'}
                  </h1>
                  <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #A3A3A3;">
                    Hello <strong style="color: #FCFAF9;">${booking.name}</strong>,<br>
                    Thank you for choosing Deven Co-Work. We have received and confirmed your ${isReservation ? 'seat reservation' : 'booking'}. Below are your confirmation details.
                  </p>

                  <!-- Details Box -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1A1A1A; border: 1px solid #2B2B2B; border-radius: 6px; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 16px 20px; border-bottom: 1px solid #2B2B2B;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #04B8BB; font-weight: 700;">Reference ID</span><br>
                        <strong style="font-size: 15px; color: #FCFAF9;">#${refId}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 14px 20px; border-bottom: 1px solid #222;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Customer:</td>
                            <td style="font-size: 13px; color: #FCFAF9; font-weight: 600; text-align: right; padding-bottom: 6px;">${booking.name} (${booking.email})</td>
                          </tr>
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Phone:</td>
                            <td style="font-size: 13px; color: #FCFAF9; text-align: right; padding-bottom: 6px;">${booking.phone}</td>
                          </tr>
                          ${seatsStr !== 'None' ? `
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Selected Seat(s):</td>
                            <td style="font-size: 13px; color: #04B8BB; font-weight: 700; text-align: right; padding-bottom: 6px;">${seatsStr}</td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Plan:</td>
                            <td style="font-size: 13px; color: #FCFAF9; font-weight: 600; text-align: right; padding-bottom: 6px;">${booking.planName || booking.plan || 'Founding Member Plan'}</td>
                          </tr>
                          ${isReservation ? `
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Seats Reserved:</td>
                            <td style="font-size: 13px; color: #FCFAF9; font-weight: 600; text-align: right; padding-bottom: 6px;">${sCount}</td>
                          </tr>
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Membership Rate:</td>
                            <td style="font-size: 13px; color: #FCFAF9; text-align: right; padding-bottom: 6px;">₹${(booking.planPrice || 0).toLocaleString('en-IN')}/seat/month</td>
                          </tr>
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Total Membership Value:</td>
                            <td style="font-size: 13px; color: #FCFAF9; font-weight: 600; text-align: right; padding-bottom: 6px;">₹${totalVal.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Reservation Paid Today:</td>
                            <td style="font-size: 13px; color: #04B8BB; font-weight: 700; text-align: right; padding-bottom: 6px;">₹${paidToday.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Remaining Amount at Joining:</td>
                            <td style="font-size: 13px; color: #FCFAF9; font-weight: 600; text-align: right; padding-bottom: 6px;">₹${remainingAtJoining.toLocaleString('en-IN')}</td>
                          </tr>
                          ` : `
                          ${booking.planPrice ? `
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Rate:</td>
                            <td style="font-size: 13px; color: #FCFAF9; text-align: right; padding-bottom: 6px;">₹${booking.planPrice.toLocaleString('en-IN')}/${booking.billingPeriod === 'hour' ? 'hr' : booking.billingPeriod === 'day' ? 'day' : 'mo'}</td>
                          </tr>
                          ` : ''}
                          ${booking.duration ? `
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Duration:</td>
                            <td style="font-size: 13px; color: #FCFAF9; text-align: right; padding-bottom: 6px;">${booking.duration} ${booking.billingPeriod === 'hour' ? (booking.duration > 1 ? 'hours' : 'hour') : booking.billingPeriod === 'day' ? (booking.duration > 1 ? 'days' : 'day') : (booking.duration > 1 ? 'months' : 'month')}</td>
                          </tr>
                          ` : ''}
                          `}
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Joining Date:</td>
                            <td style="font-size: 13px; color: #FCFAF9; text-align: right; padding-bottom: 6px;">${booking.joiningDate || '15 September 2026'}</td>
                          </tr>
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Total Paid Today:</td>
                            <td style="font-size: 14px; color: #04B8BB; font-weight: 700; text-align: right; padding-bottom: 6px;">${formattedAmount}</td>
                          </tr>
                          ${booking.razorpayPaymentId ? `
                          <tr>
                            <td style="font-size: 12px; color: #A3A3A3;">Razorpay Payment ID:</td>
                            <td style="font-size: 12px; color: #A3A3A3; text-align: right;">${booking.razorpayPaymentId}</td>
                          </tr>
                          ` : ''}
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 20px; background-color: rgba(2, 78, 92, 0.2); font-size: 12px; color: #04B8BB;">
                        ${isReservation
                          ? `✓ ₹${paidToday.toLocaleString('en-IN')} has been paid today to reserve ${sCount} seat${sCount > 1 ? 's' : ''}. The remaining ₹${remainingAtJoining.toLocaleString('en-IN')} is payable at the time of joining.`
                          : `✓ Full payment confirmed.`}
                      </td>
                    </tr>
                  </table>

                  <!-- What Next Section -->
                  <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #FCFAF9;">What Happens Next?</h3>
                  <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 13px; color: #A3A3A3; line-height: 1.7;">
                    <li>Our team will contact you prior to your joining date to assign workspace keys and onboarding documentation.</li>
                    <li>Access hours are <strong>9:00 AM – 9:00 PM, 7 days a week</strong>.</li>
                    <li>High-speed 500 Mbps WiFi & complimentary coffee await your arrival.</li>
                  </ul>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td>
                  ${getEmailFooterHtml(whatsappUrl)}
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Build HTML template for Free Trial Confirmation
 */
function buildTrialConfirmationHtml(booking, logoUrl) {
  const refId = getReferenceId(booking._id);
  const startDateStr = booking.trialStartDate ? new Date(booking.trialStartDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : 'Upcoming Friday';
  const endDateStr = booking.trialEndDate ? new Date(booking.trialEndDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : 'Upcoming Saturday';
  const whatsappMsg = encodeURIComponent(`Hi Deven Co-Work, I have a query about my Free Trial #${refId}`);
  const whatsappUrl = `https://wa.me/916260582852?text=${whatsappMsg}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Free Trial Confirmed — Deven Co-Work</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0C0C0C; font-family: Arial, sans-serif; color: #FCFAF9;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0C0C0C; padding: 20px 10px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #121212; border: 1px solid #024E5C; border-radius: 8px; overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td>
                  ${getEmailHeaderHtml(logoUrl, 'Free Trial Confirmed')}
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td style="padding: 30px 24px;">
                  <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #FCFAF9; letter-spacing: 0.5px;">
                    Your 2-Day Trial is Reserved!
                  </h1>
                  <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #A3A3A3;">
                    Hello <strong style="color: #FCFAF9;">${booking.name}</strong>,<br>
                    Welcome to Deven Co-Work! Your complimentary 2-day pass is confirmed. Experience Raipur's most inspiring work environment first-hand.
                  </p>

                  <!-- Details Box -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1A1A1A; border: 1px solid #2B2B2B; border-radius: 6px; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 16px 20px; border-bottom: 1px solid #2B2B2B;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #04B8BB; font-weight: 700;">Trial Pass Reference</span><br>
                        <strong style="font-size: 15px; color: #FCFAF9;">#${refId}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 14px 20px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Guest Name:</td>
                            <td style="font-size: 13px; color: #FCFAF9; font-weight: 600; text-align: right; padding-bottom: 6px;">${booking.name}</td>
                          </tr>
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Email:</td>
                            <td style="font-size: 13px; color: #FCFAF9; text-align: right; padding-bottom: 6px;">${booking.email}</td>
                          </tr>
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Phone:</td>
                            <td style="font-size: 13px; color: #FCFAF9; text-align: right; padding-bottom: 6px;">${booking.phone}</td>
                          </tr>
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Trial Access Period:</td>
                            <td style="font-size: 13px; color: #04B8BB; font-weight: 700; text-align: right; padding-bottom: 6px;">${startDateStr} to ${endDateStr}</td>
                          </tr>
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3; padding-bottom: 6px;">Access Hours:</td>
                            <td style="font-size: 13px; color: #FCFAF9; text-align: right; padding-bottom: 6px;">9:00 AM – 9:00 PM</td>
                          </tr>
                          <tr>
                            <td style="font-size: 13px; color: #A3A3A3;">Cost:</td>
                            <td style="font-size: 13px; color: #04B8BB; font-weight: 700; text-align: right;">₹0 (Free Trial)</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Instructions -->
                  <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #FCFAF9;">Included in Your Pass</h3>
                  <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 13px; color: #A3A3A3; line-height: 1.7;">
                    <li>High-speed 500 Mbps WiFi & ergonomics workspace seating.</li>
                    <li>Access to content studio, lounge area & complimentary tea/coffee.</li>
                    <li>No credit card required. Show this confirmation pass at reception upon arrival.</li>
                  </ul>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td>
                  ${getEmailFooterHtml(whatsappUrl)}
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Send Seat Booking Confirmation Email safely
 */
export async function sendBookingConfirmationEmail(booking) {
  if (!booking || !booking.email) {
    console.warn('[EmailService] Cannot send booking email: invalid booking or missing email');
    return { success: false, reason: 'Missing email' };
  }

  // Atomic duplicate check in DB to ensure single email dispatch per booking
  const updatedDoc = await Reservation.findOneAndUpdate(
    { _id: booking._id, confirmationEmailSent: { $ne: true } },
    { $set: { confirmationEmailSent: true, confirmationEmailSentAt: new Date() } },
    { new: true }
  );

  if (!updatedDoc) {
    console.log(`[EmailService] Skipping duplicate booking confirmation email for #${booking._id}`);
    return { success: true, skipped: true, reason: 'Already sent' };
  }

  const resend = getResendClient();
  if (!resend) {
    console.warn('[EmailService] RESEND_API_KEY not configured. Skipping email dispatch.');
    return { success: false, reason: 'RESEND_API_KEY missing' };
  }

  try {
    const logoUrl = await getCmsLogoUrl();
    const html = buildBookingConfirmationHtml(booking, logoUrl);
    const from = process.env.EMAIL_FROM || 'Deven Co-Work <onboarding@resend.dev>';
    const replyTo = process.env.EMAIL_REPLY_TO || 'bookings@devencowork.com';
    const refId = getReferenceId(booking._id);

    const { data, error } = await resend.emails.send({
      from,
      to: [booking.email.trim()],
      replyTo,
      subject: `Booking Confirmed — Deven Co-Work [Ref: #${refId}]`,
      html,
      headers: {
        'X-Entity-Ref-ID': booking._id.toString(),
      },
    });

    if (error) {
      console.error('[EmailService] Resend API error sending booking confirmation:', error);
      return { success: false, error };
    }

    console.log(`[EmailService] Booking confirmation email successfully dispatched to ${booking.email} (ID: ${data?.id})`);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('[EmailService] Exception while sending booking confirmation email:', err.message || err);
    // Return gracefully without throwing so payment flow is never broken
    return { success: false, error: err.message };
  }
}

/**
 * Send Free Trial Confirmation Email safely
 */
export async function sendTrialConfirmationEmail(booking) {
  if (!booking || !booking.email) {
    console.warn('[EmailService] Cannot send trial email: invalid booking or missing email');
    return { success: false, reason: 'Missing email' };
  }

  // Atomic duplicate check in DB
  const updatedDoc = await Reservation.findOneAndUpdate(
    { _id: booking._id, confirmationEmailSent: { $ne: true } },
    { $set: { confirmationEmailSent: true, confirmationEmailSentAt: new Date() } },
    { new: true }
  );

  if (!updatedDoc) {
    console.log(`[EmailService] Skipping duplicate trial confirmation email for #${booking._id}`);
    return { success: true, skipped: true, reason: 'Already sent' };
  }

  const resend = getResendClient();
  if (!resend) {
    console.warn('[EmailService] RESEND_API_KEY not configured. Skipping email dispatch.');
    return { success: false, reason: 'RESEND_API_KEY missing' };
  }

  try {
    const logoUrl = await getCmsLogoUrl();
    const html = buildTrialConfirmationHtml(booking, logoUrl);
    const from = process.env.EMAIL_FROM || 'Deven Co-Work <onboarding@resend.dev>';
    const replyTo = process.env.EMAIL_REPLY_TO || 'bookings@devencowork.com';
    const refId = getReferenceId(booking._id);

    const { data, error } = await resend.emails.send({
      from,
      to: [booking.email.trim()],
      replyTo,
      subject: `Free Trial Confirmed — Deven Co-Work [Ref: #${refId}]`,
      html,
      headers: {
        'X-Entity-Ref-ID': booking._id.toString(),
      },
    });

    if (error) {
      console.error('[EmailService] Resend API error sending trial confirmation:', error);
      return { success: false, error };
    }

    console.log(`[EmailService] Free Trial confirmation email successfully dispatched to ${booking.email} (ID: ${data?.id})`);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('[EmailService] Exception while sending trial confirmation email:', err.message || err);
    return { success: false, error: err.message };
  }
}
