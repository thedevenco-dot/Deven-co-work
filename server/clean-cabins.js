import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Seat from './models/Seat.js';
import Content from './models/Content.js';
import Reservation from './models/Reservation.js';
import { connectDatabase } from './config/database.js';

dotenv.config({ path: '../.env' });

async function runMigration() {
  try {
    await connectDatabase();

    // 1. Remove Private Cabin Seats
    const deletedSeats = await Seat.deleteMany({ type: 'Private Cabin' });
    console.log(`Deleted ${deletedSeats.deletedCount} Private Cabin seats from MongoDB.`);

    // 2. Remove Private Cabin from CMS Content
    const contents = await Content.find();
    for (const content of contents) {
      let modified = false;

      // Clean navLinks
      if (content.navigation && content.navigation.items) {
        const originalLen = content.navigation.items.length;
        content.navigation.items = content.navigation.items.filter(i => i.label !== 'Cabins');
        if (originalLen !== content.navigation.items.length) modified = true;
      }

      // Clean footerLinks
      if (content.footer && content.footer.quickLinks) {
        const originalLen = content.footer.quickLinks.length;
        content.footer.quickLinks = content.footer.quickLinks.filter(i => i.label !== 'Cabins');
        if (originalLen !== content.footer.quickLinks.length) modified = true;
      }

      // Clean howItWorks / plan steps
      if (content.plan && content.plan.steps) {
        content.plan.steps.forEach(step => {
          if (step.description.includes('Private Cabin')) {
            step.description = step.description.replace(', or a Private Cabin ', ' or Dedicated Desk ');
            modified = true;
          }
        });
      }

      // Clean pricing plans
      if (content.pricing && content.pricing.plans) {
        const originalLen = content.pricing.plans.length;
        content.pricing.plans = content.pricing.plans.filter(p => p.name !== 'Private Cabin');
        if (originalLen !== content.pricing.plans.length) modified = true;
      }

      // Clean description and keywords
      if (content.seo) {
        if (content.seo.description && content.seo.description.includes('private cabins, ')) {
          content.seo.description = content.seo.description.replace('private cabins, ', '');
          modified = true;
        }
        if (content.seo.keywords && content.seo.keywords.includes('private cabin raipur, ')) {
          content.seo.keywords = content.seo.keywords.replace('private cabin raipur, ', '');
          modified = true;
        }
      }

      // Clean subheadline
      if (content.hero && content.hero.subheadline && content.hero.subheadline.includes('private cabins, ')) {
        content.hero.subheadline = content.hero.subheadline.replace('private cabins, ', '');
        modified = true;
      }

      // Clean FAQ
      if (content.faq) {
        content.faq.forEach(f => {
          if (f.question.includes('Hot Desk to Cabin')) {
            f.question = f.question.replace(' (e.g., Hot Desk to Cabin)', '');
            f.answer = f.answer.replace(' when cabins open up', '');
            modified = true;
          }
        });
      }

      if (modified) {
        await content.save();
        console.log(`Updated CMS content for key: ${content.key}`);
      }
    }

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

runMigration();
