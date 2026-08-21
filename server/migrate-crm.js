import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("MONGODB_URI is missing in .env file");
  process.exit(1);
}

const mapStatus = (oldStatus) => {
  if (!oldStatus) return 'NEW';
  const s = oldStatus.toLowerCase();
  if (s === 'confirmed') return 'CONFIRMED';
  if (s === 'contacted') return 'CONTACTED';
  if (s === 'cancelled') return 'CANCELLED';
  if (s === 'refunded') return 'REFUNDED';
  if (s === 'new') return 'NEW';
  return 'NEW';
};

const mapPaymentStatus = (oldStatus) => {
  if (!oldStatus || oldStatus.toLowerCase() === 'n/a') return 'N/A';
  const s = oldStatus.toLowerCase();
  if (s === 'confirmed' || s === 'paid') return 'PAID';
  if (s === 'pending') return 'PENDING';
  if (s === 'failed') return 'FAILED';
  if (s === 'refunded') return 'REFUNDED';
  return 'N/A';
};

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const db = mongoose.connection.db;
    const leadsCollection = db.collection('leads');
    const reservationsCollection = db.collection('reservations');

    console.log('Migrating old Leads to Reservations...');
    // 1. Migrate leads -> reservations
    const leads = await leadsCollection.find({}).toArray();
    let leadsMigrated = 0;
    for (const lead of leads) {
      // Map requestType
      let requestType = 'whatsapp';
      if (lead.type === 'FREE_TRIAL') requestType = 'free_trial';

      const newReservation = {
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        company: lead.company,
        requestType,
        plan: requestType === 'free_trial' ? 'Free Trial' : 'WhatsApp Inquiry',
        amount: 0,
        leadStatus: mapStatus(lead.status) === 'NEW' && requestType === 'free_trial' ? 'TRIAL' : mapStatus(lead.status),
        paymentStatus: 'N/A',
        trialStartDate: lead.trialStartDate,
        trialEndDate: lead.trialEndDate,
        utmSource: lead.utmSource,
        utmMedium: lead.utmMedium,
        utmCampaign: lead.utmCampaign,
        notes: lead.notes || '',
        createdAt: lead.createdAt || new Date(),
        updatedAt: lead.updatedAt || new Date()
      };

      await reservationsCollection.insertOne(newReservation);
      leadsMigrated++;
    }
    console.log(`Migrated ${leadsMigrated} leads into reservations.`);

    console.log('Migrating existing Reservations enums...');
    // 2. Migrate existing reservations
    const reservations = await reservationsCollection.find({ requestType: { $exists: false } }).toArray();
    let resMigrated = 0;
    for (const res of reservations) {
      await reservationsCollection.updateOne(
        { _id: res._id },
        { 
          $set: {
            requestType: 'seat_reservation',
            leadStatus: mapStatus(res.status),
            paymentStatus: mapPaymentStatus(res.paymentStatus)
          },
          $unset: {
            status: "",
            crmSyncStatus: "",
            crmSyncError: "",
            crmStage: ""
          }
        }
      );
      resMigrated++;
    }
    console.log(`Updated enums on ${resMigrated} reservations.`);

    // 3. Drop leads collection if exists
    if (leadsMigrated > 0) {
      console.log('Dropping old leads collection...');
      await leadsCollection.drop();
      console.log('Leads collection dropped.');
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
