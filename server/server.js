import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import User from './models/User.js';
import Seat from './models/Seat.js';
import { initWebSocket, broadcast } from './socket.js';

// Load environmental variables
dotenv.config({ path: '../.env' }); // Look for .env in the parent root directory

const PORT = process.env.PORT || 5000;

/**
 * Seed Admin credentials if they do not exist.
 */
async function seedAdminUser() {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingUser = await User.findOne({ username: adminUsername });

    if (!existingUser) {
      console.log(`Seeding admin user: "${adminUsername}"...`);
      await User.create({
        username: adminUsername,
        password: adminPassword,
      });
      console.log('Admin user successfully seeded.');
    } else {
      console.log(`Admin user "${adminUsername}" already exists.`);
    }
  } catch (error) {
    console.error(`Failed to seed admin user: ${error.message}`);
  }
}

/**
 * Seed Coworking Seats layout (56 desks total, 6 staff reserved) if not initialized.
 */
async function seedSeats() {
  try {
    const seatCount = await Seat.countDocuments({});
    if (seatCount !== 59) {
      console.log('Seeding new 59 seats and cabins layout...');
      
      try {
        await Seat.collection.drop();
        console.log('Dropped old seats collection to clear indices.');
      } catch (e) {
        // collection might not exist, ignore
      }

      const zones = [
        { name: 'T2', type: 'Hot Desk', desks: ['R1','R2','R3','R4','L1','L2','L3','L4'], staff: [] },
        { name: 'T3', type: 'Hot Desk', desks: ['R1','R2','R3','R4','L1','L2','L3','L4'], staff: [] },
        { name: 'T4', type: 'Dedicated Desk', desks: ['R1','R2','R3','R4','R5','L1','L2','L3','L4','L5'], staff: ['R1'] },
        { name: 'T5', type: 'Dedicated Desk', desks: ['R1','R2','R3','R4','R5','L1','L2','L3','L4','L5'], staff: ['R1'] },
        { name: 'T6', type: 'Dedicated Desk', desks: ['R1','R2','R3','R4','R5','L1','L2','L3','L4','L5'], staff: ['R1'] },
        { name: 'T7', type: 'Dedicated Desk', desks: ['R1','R2','R3','R4','R5','R6','R7','R8','R9','R10'], staff: ['R5','R8','R9'] },
        { name: 'C1', type: 'Private Cabin', desks: ['Cabin 1'], staff: [] },
        { name: 'C2', type: 'Private Cabin', desks: ['Cabin 2'], staff: [] },
        { name: 'C3', type: 'Private Cabin', desks: ['Cabin 3'], staff: [] }
      ];

      for (const zone of zones) {
        for (const desk of zone.desks) {
          const isStaff = zone.staff.includes(desk);
          await Seat.create({
            zone: zone.name,
            label: desk,
            type: zone.type,
            status: isStaff ? 'reserved' : 'available',
            isStaff
          });
        }
      }
      console.log('59 seats layout seeded successfully.');
    } else {
      console.log('59 seats layout already seeded.');
    }
  } catch (error) {
    console.error(`Failed to seed seats: ${error.message}`);
  }
}

import Content from './models/Content.js';

/**
 * Seed CMS draft and published documents if they do not exist.
 */
async function seedCMSContent() {
  try {
    const draftExists = await Content.findOne({ key: 'draft' });
    if (!draftExists) {
      console.log('Seeding initial draft CMS content...');
      await Content.create({ key: 'draft' });
    }
    const publishedExists = await Content.findOne({ key: 'published' });
    if (!publishedExists) {
      console.log('Seeding initial published CMS content...');
      await Content.create({ key: 'published' });
    }
  } catch (error) {
    console.error(`Failed to seed CMS content: ${error.message}`);
  }
}

// Start the server
async function startServer() {
  // Connect to DB
  await connectDatabase();

  // Seed Admin Account
  await seedAdminUser();

  // Seed Seats Layout
  await seedSeats();

  // Seed CMS Content Documents
  await seedCMSContent();

  // Create HTTP Server wrapping Express App
  const server = http.createServer(app);

  // Initialize WebSockets
  initWebSocket(server);

  // 10s seat lock cleanup interval loop
  setInterval(async () => {
    try {
      const now = new Date();
      const expiredHolds = await Seat.find({
        status: 'held',
        heldUntil: { $lt: now }
      });
      if (expiredHolds.length > 0) {
        console.log(`Releasing ${expiredHolds.length} expired seat holds...`);
        const seatIdsToRelease = expiredHolds.map(s => s._id);
        await Seat.updateMany(
          { _id: { $in: seatIdsToRelease } },
          { status: 'available', heldUntil: null, heldBy: null }
        );
        
        const updatedSeats = await Seat.find({ _id: { $in: seatIdsToRelease } });
        broadcast({
          type: 'SEAT_UPDATE',
          seats: updatedSeats
        });
      }
    } catch (err) {
      console.error(`Error in expired seat hold cleaner: ${err.message}`);
    }
  }, 10000);

  // Listen HTTP + WS Server
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

startServer();

