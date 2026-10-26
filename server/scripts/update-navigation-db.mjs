import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const Content = (await import('../models/Content.js')).default;

async function updateDbNavigation() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  const canonicalNavigation = {
    items: [
      { label: 'Our Space', url: '/#space', external: false, visible: true, order: 0 },
      {
        label: 'Workspace',
        url: '#workspace',
        isDropdown: true,
        visible: true,
        order: 1,
        items: [
          { label: 'Private Cabins', url: '/private-cabins' },
          { label: 'Meeting Room', url: '/meeting-room' },
          { label: 'Podcast Studio', url: '/podcast-studio' },
          { label: 'Amenities', url: '/amenities' },
        ]
      },
      { label: 'Pricing', url: '/pricing', external: false, visible: true, order: 2 },
      { label: 'Events', url: '/events', external: false, visible: true, order: 3 },
      { label: 'About', url: '/about', external: false, visible: true, order: 4 },
      { label: 'Blog', url: '/blog', external: false, visible: true, order: 5 },
      { label: 'FAQ', url: '/faq', external: false, visible: true, order: 6 },
      { label: 'Contact', url: '/contact', external: false, visible: true, order: 7 },
    ],
    ctaLabel: 'Book a Tour',
    ctaUrl: '#reservation',
    ctaVisible: true,
  };

  const canonicalQuickLinks = [
    { label: 'Pricing', href: '/pricing' },
    { label: 'About Us', href: '/about' },
    { label: 'Events', href: '/events' },
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
    { label: 'Instagram', href: 'https://www.instagram.com/deven_cowork/' },
    { label: 'GMB', href: 'https://share.google/2bBhooQl0vnvONiNz' },
  ];

  for (const key of ['published', 'draft']) {
    const doc = await Content.findOne({ key });
    if (doc) {
      doc.navigation = canonicalNavigation;
      if (doc.footer) {
        doc.footer.quickLinks = canonicalQuickLinks;
      }
      await doc.save();
      console.log(`Updated navigation & footer quicklinks for Content key: ${key}`);
    } else {
      console.log(`Document with key ${key} not found.`);
    }
  }

  await mongoose.connection.close();
  console.log('Done!');
}

updateDbNavigation().catch(err => {
  console.error('Error updating navigation:', err);
  process.exit(1);
});
