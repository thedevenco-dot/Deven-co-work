import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import SpinWheelLead from '../models/SpinWheelLead.js';
import spinWheelConfig from '../config/spinWheelConfig.js';

// Public: Get wheel configuration (rewards, instructions, address, contact)
// NEVER exposes reward weights
export const getConfig = async (req, res) => {
  try {
    const publicOffers = spinWheelConfig.offers.map(({ id, label, short, color, textColor }) => ({
      id,
      label,
      short,
      color,
      textColor: textColor || '#FFFFFF',
    }));

    res.json({
      success: true,
      data: {
        offers: publicOffers,
        couponValidDays: spinWheelConfig.couponValidDays,
        instructions: spinWheelConfig.instructions,
        contact: spinWheelConfig.contact,
        address: spinWheelConfig.address,
      },
    });
  } catch (error) {
    console.error('Error in spinWheel.getConfig:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Public: Spin the wheel
// Weighted random reward selection using crypto.randomInt
// Returns segment index, offer details, and a signed JWT
export const spin = async (req, res) => {
  try {
    const { offers, tokenTtl } = spinWheelConfig;
    if (!offers || offers.length === 0) {
      return res.status(500).json({ success: false, message: 'Spin wheel offers not configured' });
    }

    const totalWeight = offers.reduce((sum, o) => sum + (Number(o.weight) || 0), 0);
    if (totalWeight <= 0) {
      return res.status(500).json({ success: false, message: 'Invalid offer weights' });
    }

    // Cryptographically secure weighted random pick
    const r = crypto.randomInt(0, totalWeight);
    let cumulative = 0;
    let selectedIndex = 0;

    for (let i = 0; i < offers.length; i++) {
      cumulative += Number(offers[i].weight) || 0;
      if (r < cumulative) {
        selectedIndex = i;
        break;
      }
    }

    const selectedOffer = offers[selectedIndex];
    const spinId = crypto.randomUUID();

    const jwtSecret = process.env.JWT_SECRET || 'deven_cowork_local_jwt_secret_982347';
    const token = jwt.sign(
      {
        spinId,
        offerId: selectedOffer.id,
      },
      jwtSecret,
      {
        audience: 'spin-wheel',
        expiresIn: tokenTtl || '30m',
      }
    );

    res.json({
      success: true,
      index: selectedIndex,
      offerId: selectedOffer.id,
      label: selectedOffer.label,
      token,
    });
  } catch (error) {
    console.error('Error in spinWheel.spin:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Public: Submit Lead and claim coupon code
export const createLead = async (req, res) => {
  try {
    const { name, phone, preferredDate, token } = req.body;

    // 1. Verify token
    if (!token) {
      return res.status(400).json({ success: false, message: 'Missing spin session token. Please spin again.' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'deven_cowork_local_jwt_secret_982347';
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret, { audience: 'spin-wheel' });
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired spin session. Please spin again.' });
    }

    const { spinId, offerId } = decoded;
    if (!spinId || !offerId) {
      return res.status(400).json({ success: false, message: 'Corrupted spin session token.' });
    }

    // 2. Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please enter your full name (at least 2 characters).' });
    }

    // Normalise mobile number (accept pasted +91, 0 prefix, spaces, dashes)
    let rawDigits = String(phone || '').replace(/\D/g, '');
    if (rawDigits.length === 12 && rawDigits.startsWith('91')) {
      rawDigits = rawDigits.slice(2);
    } else if (rawDigits.length === 11 && rawDigits.startsWith('0')) {
      rawDigits = rawDigits.slice(1);
    }

    if (!/^[6-9]\d{9}$/.test(rawDigits)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    // Validate preferredDate (YYYY-MM-DD, not in past, <= 60 days ahead)
    if (!preferredDate || !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
      return res.status(400).json({ success: false, message: 'Please select a valid visit date (YYYY-MM-DD).' });
    }

    const now = new Date();
    const istToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
    const maxDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const istMaxDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(maxDate);

    if (preferredDate < istToday) {
      return res.status(400).json({ success: false, message: 'Preferred visit date cannot be in the past.' });
    }
    if (preferredDate > istMaxDate) {
      return res.status(400).json({ success: false, message: 'Preferred visit date must be within 60 days.' });
    }

    // 3. Resolve reward strictly from token
    const offer = spinWheelConfig.offers.find((o) => o.id === offerId);
    if (!offer) {
      return res.status(400).json({ success: false, message: 'Reward specified in token is no longer available.' });
    }

    // 4. Check for duplicate phone or reused spinId
    const existingPhone = await SpinWheelLead.findOne({ phone: rawDigits });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'This mobile number has already claimed a reward coupon.',
      });
    }

    const existingSpin = await SpinWheelLead.findOne({ spinId });
    if (existingSpin) {
      return res.status(409).json({
        success: false,
        message: 'This spin session has already been claimed.',
      });
    }

    // 5. Generate unique coupon code DEVEN-XXXXXX
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let couponCode = '';
    const prefix = spinWheelConfig.couponPrefix || 'DEVEN';

    for (let attempt = 0; attempt < 5; attempt++) {
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += alphabet[crypto.randomInt(0, alphabet.length)];
      }
      const candidate = `${prefix}-${code}`;
      const conflict = await SpinWheelLead.findOne({ couponCode: candidate });
      if (!conflict) {
        couponCode = candidate;
        break;
      }
    }

    if (!couponCode) {
      couponCode = `${prefix}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    }

    const validDays = spinWheelConfig.couponValidDays || 7;
    const couponExpiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

    // 6. Save to Database
    const lead = await SpinWheelLead.create({
      name: name.trim(),
      phone: rawDigits,
      preferredDate,
      offerId: offer.id,
      offerLabel: offer.label,
      couponCode,
      couponExpiresAt,
      spinId,
      status: 'ISSUED',
      ip: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
      sourcePage: 'Spin Wheel',
    });

    // 7. Fire-and-forget Google Sheet webhook sync
    if (process.env.SPIN_SHEET_WEBHOOK_URL) {
      const istDateFormatted = new Date(lead.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const istValidTillFormatted = new Date(lead.couponExpiresAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

      fetch(process.env.SPIN_SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          secret: process.env.SPIN_SHEET_SECRET || '',
          date: istDateFormatted,
          name: lead.name,
          phone: lead.phone,
          preferredDate: lead.preferredDate,
          reward: lead.offerLabel,
          couponCode: lead.couponCode,
          expiresAt: istValidTillFormatted,
        }),
      }).catch((err) => {
        console.error('Error syncing spin lead to Google Sheet webhook:', err?.message || err);
      });
    }

    // 8. Respond to user
    res.status(201).json({
      success: true,
      data: {
        name: lead.name,
        offerLabel: lead.offerLabel,
        couponCode: lead.couponCode,
        couponExpiresAt: lead.couponExpiresAt,
        preferredDate: lead.preferredDate,
        instructions: spinWheelConfig.instructions,
        contact: spinWheelConfig.contact,
        address: spinWheelConfig.address,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      if (field === 'phone') {
        return res.status(409).json({ success: false, message: 'This mobile number has already claimed a reward coupon.' });
      }
      return res.status(409).json({ success: false, message: 'Duplicate claim detected.' });
    }
    console.error('Error in spinWheel.createLead:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Get leads with filtering and statistics
export const getAdminSpinWheelLeads = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status && ['ISSUED', 'CONTACTED', 'REDEEMED'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.query.offerId) {
      filter.offerId = req.query.offerId;
    }

    if (req.query.search) {
      const s = String(req.query.search).trim();
      const escaped = s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ name: regex }, { phone: regex }, { couponCode: regex }];
    }

    const [leads, total, redeemed, offerCounts] = await Promise.all([
      SpinWheelLead.find(filter).sort({ createdAt: -1 }),
      SpinWheelLead.countDocuments(),
      SpinWheelLead.countDocuments({ status: 'REDEEMED' }),
      SpinWheelLead.aggregate([
        { $group: { _id: '$offerId', count: { $sum: 1 }, label: { $first: '$offerLabel' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        leads,
        stats: {
          total,
          redeemed,
          byOffer: offerCounts,
        },
        offers: spinWheelConfig.offers,
      },
    });
  } catch (error) {
    console.error('Error in getAdminSpinWheelLeads:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Update status and notes of a lead
export const updateSpinWheelLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const lead = await SpinWheelLead.findById(id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (status && ['ISSUED', 'CONTACTED', 'REDEEMED'].includes(status)) {
      lead.status = status;
      if (status === 'REDEEMED') {
        if (!lead.redeemedAt) lead.redeemedAt = new Date();
      } else {
        lead.redeemedAt = null;
      }
    }

    if (notes !== undefined) {
      lead.notes = String(notes);
    }

    await lead.save();

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error('Error in updateSpinWheelLeadStatus:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Export leads to styled Excel spreadsheet
export const exportSpinWheelLeadsExcel = async (req, res) => {
  try {
    // Dynamic import so server never crashes if exceljs is not yet installed
    let ExcelJS;
    try {
      const imported = await import('exceljs');
      ExcelJS = imported.default || imported;
    } catch (importErr) {
      console.error('exceljs not available:', importErr);
      return res.status(500).json({
        success: false,
        message: 'Excel export library is not available. Please install exceljs.',
      });
    }

    const filter = {};

    if (req.query.status && ['ISSUED', 'CONTACTED', 'REDEEMED'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.query.offerId) {
      filter.offerId = req.query.offerId;
    }

    if (req.query.search) {
      const s = String(req.query.search).trim();
      const escaped = s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ name: regex }, { phone: regex }, { couponCode: regex }];
    }

    const leads = await SpinWheelLead.find(filter).sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Deven Co-Work';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Spin Wheel Leads', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    worksheet.columns = [
      { header: 'Date (IST)', key: 'date', width: 22 },
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Phone', key: 'phone', width: 16 },
      { header: 'Preferred Date', key: 'preferredDate', width: 16 },
      { header: 'Reward', key: 'reward', width: 36 },
      { header: 'Coupon Code', key: 'couponCode', width: 18 },
      { header: 'Valid Till', key: 'validTill', width: 18 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Notes', key: 'notes', width: 32 },
    ];

    // Style Header Row (Teal #04B8BB background, bold white text)
    const headerRow = worksheet.getRow(1);
    headerRow.height = 26;
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF04B8BB' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' };

    leads.forEach((l) => {
      const row = worksheet.addRow({
        date: new Date(l.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        name: l.name,
        phone: String(l.phone),
        preferredDate: l.preferredDate,
        reward: l.offerLabel,
        couponCode: l.couponCode,
        validTill: new Date(l.couponExpiresAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
        status: l.status,
        notes: l.notes || '',
      });

      // Explicit text format for phone column so Excel preserves digits
      row.getCell('phone').numFmt = '@';
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `spin_wheel_leads_${dateStr}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error in exportSpinWheelLeadsExcel:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server Error exporting Excel' });
    }
  }
};
