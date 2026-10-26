import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import http from 'http';
import app from './app.js';
import User from './models/User.js';
import Event from './models/Event.js';
import BlogPost from './models/BlogPost.js';
import BlogCategory from './models/BlogCategory.js';
import { connectDatabase } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runTests() {
  console.log('🧪 Starting Acceptance & Verification Test Suite...\n');
  await connectDatabase();

  // Start HTTP server on test port
  const testPort = 5566;
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(testPort, resolve));
  const baseUrl = `http://127.0.0.1:${testPort}`;
  console.log(`🚀 Test server listening on ${baseUrl}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Get or Create Super Admin & Generate Token
    const adminUser = await User.findOne({ role: 'SUPER_ADMIN' }) || await User.findOne();
    if (!adminUser) throw new Error('No user found in database for test authentication.');
    const adminToken = jwt.sign(
      { id: adminUser._id, role: adminUser.role, username: adminUser.username },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '1h' }
    );
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    };

    // ─── CATEGORY MANAGEMENT TESTS ───
    console.log('--- TEST SUITE 1: Blog Category Management ---');
    const defaultCategories = [
      'Startups',
      'Entrepreneurship',
      'Productivity',
      'Coworking',
      'Founder Stories',
      'Events & Community',
      'Raipur Business Ecosystem'
    ];

    for (const catName of defaultCategories) {
      await BlogCategory.findOneAndUpdate(
        { name: new RegExp(`^${catName}$`, 'i') },
        { name: catName, slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') },
        { upsert: true, new: true }
      );
    }

    const catRes = await fetch(`${baseUrl}/api/blog/categories`);
    const catData = await catRes.json();
    assert(catRes.ok && (catData.data || catData.categories)?.length >= 7, 'Default blog categories present in public endpoint');

    // Test duplicate category case-insensitivity
    const dupCatRes = await fetch(`${baseUrl}/api/blog/admin/categories`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: 'startups' })
    });
    assert(dupCatRes.status === 400, 'Duplicate category with different capitalization is rejected (400)');

    // ─── SECURITY TESTS ───
    console.log('\n--- TEST SUITE 2: Security & Admin Route Protection ---');
    const unauthEventRes = await fetch(`${baseUrl}/api/events/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hacker Meetup' })
    });
    assert(unauthEventRes.status === 401, 'Unauthenticated POST to /api/events/admin returns 401 Unauthorized');

    const unauthBlogRes = await fetch(`${baseUrl}/api/blog/admin/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hacker Post' })
    });
    assert(unauthBlogRes.status === 401, 'Unauthenticated POST to /api/blog/admin/posts returns 401 Unauthorized');

    // ─── EVENTS CMS WORKFLOW TESTS ───
    console.log('\n--- TEST SUITE 3: Events CMS Lifecycle & Isolation ---');
    // Clean up test events
    await Event.deleteMany({ slug: { $in: ['test-founder-meetup', 'test-past-workshop'] } });

    // Step A: Admin creates draft event
    const createEventRes = await fetch(`${baseUrl}/api/events/admin`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Test Founder Meetup 2026',
        slug: 'test-founder-meetup',
        shortDescription: 'Exclusive meetup for founders building in Raipur.',
        fullDescription: '<p>Join us at Deven Co-Work for an evening of startup insights.</p>',
        category: 'Founder Meetup',
        status: 'draft',
        startAt: new Date(Date.now() + 86400000 * 5).toISOString(),
        endAt: new Date(Date.now() + 86400000 * 5 + 7200000).toISOString(),
        location: 'Deven Co-Work, Shankar Nagar, Raipur',
        registrationUrl: 'https://forms.gle/sample',
        registrationCta: 'RSVP Now'
      })
    });
    const createdEventData = await createEventRes.json();
    assert(createEventRes.ok && createdEventData.data?._id, 'Admin successfully created draft event');
    const eventId = createdEventData.data._id;

    // Step B: Verify Draft Isolation (Draft must NOT appear in public listing)
    const publicEventsRes1 = await fetch(`${baseUrl}/api/events`);
    const publicEventsData1 = await publicEventsRes1.json();
    const draftFoundPublic = (publicEventsData1.upcoming || []).some(e => e.slug === 'test-founder-meetup');
    assert(!draftFoundPublic, 'Draft event is NOT exposed on public GET /api/events');

    // Step C: Admin publishes the event
    const publishEventRes = await fetch(`${baseUrl}/api/events/admin/${eventId}/publish`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: 'published' })
    });
    const pubEventData = await publishEventRes.json();
    assert(publishEventRes.ok && pubEventData.data?.status === 'published', 'Admin published event successfully');

    // Step D: Public GET /api/events now returns the published upcoming event
    const publicEventsRes2 = await fetch(`${baseUrl}/api/events`);
    const publicEventsData2 = await publicEventsRes2.json();
    const pubFound = (publicEventsData2.upcoming || []).some(e => e.slug === 'test-founder-meetup');
    assert(pubFound, 'Published future event appears in public Upcoming Events');

    // Step E: Create past event and verify separation
    const createPastRes = await fetch(`${baseUrl}/api/events/admin`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Test Past Workshop 2026',
        slug: 'test-past-workshop',
        shortDescription: 'Past workshop recap.',
        fullDescription: '<p>Great recap of workshop.</p>',
        category: 'Workshop',
        status: 'published',
        startAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        endAt: new Date(Date.now() - 86400000 * 5 + 7200000).toISOString(),
        location: 'Deven Co-Work, Raipur',
        recap: 'Over 40 founders attended and learned about MVP validation.'
      })
    });
    assert(createPastRes.ok, 'Admin created published past event');

    const publicEventsRes3 = await fetch(`${baseUrl}/api/events`);
    const publicEventsData3 = await publicEventsRes3.json();
    const pastFound = (publicEventsData3.past || []).some(e => e.slug === 'test-past-workshop');
    const pastInUpcoming = (publicEventsData3.upcoming || []).some(e => e.slug === 'test-past-workshop');
    assert(pastFound && !pastInUpcoming, 'Past events appear strictly in past section and never mixed into upcoming');

    // Step F: Unpublish event
    const unpubEventRes = await fetch(`${baseUrl}/api/events/admin/${eventId}/publish`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: 'draft' })
    });
    assert(unpubEventRes.ok, 'Admin successfully unpublished event');

    const publicEventsRes4 = await fetch(`${baseUrl}/api/events`);
    const publicEventsData4 = await publicEventsRes4.json();
    const unpubFound = (publicEventsData4.upcoming || []).some(e => e.slug === 'test-founder-meetup');
    assert(!unpubFound, 'Unpublished event immediately disappears from public listings');

    // ─── BLOG CMS WORKFLOW TESTS ───
    console.log('\n--- TEST SUITE 4: Blog CMS Lifecycle, Sanitization & 301 Redirects ---');
    await BlogPost.deleteMany({ slug: { $in: ['test-guide-to-coworking', 'test-coworking-guide-v2'] } });

    // Step A: Admin creates draft article
    const createBlogRes = await fetch(`${baseUrl}/api/blog/admin/posts`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Test Guide to Coworking in Raipur',
        slug: 'test-guide-to-coworking',
        excerpt: 'Everything you need to know about flexible workspaces in Raipur.',
        content: '<h2>Why Coworking Matters</h2><p>Raipur is growing fast.<script>alert("xss")</script><a href="javascript:void(0)">Click</a></p>',
        author: 'Deven Team',
        category: 'Coworking',
        status: 'draft'
      })
    });
    const createdBlogData = await createBlogRes.json();
    assert(createBlogRes.ok && createdBlogData.data?._id, 'Admin successfully created draft article');
    const blogId = createdBlogData.data._id;

    // Step B: Verify Draft Article Isolation from public listing and slug route
    const publicBlogRes1 = await fetch(`${baseUrl}/api/blog`);
    const publicBlogData1 = await publicBlogRes1.json();
    const draftBlogPublic = (publicBlogData1.posts || []).some(p => p.slug === 'test-guide-to-coworking');
    assert(!draftBlogPublic, 'Draft article is NOT listed in public GET /api/blog');

    const publicSlugRes1 = await fetch(`${baseUrl}/api/blog/test-guide-to-coworking`);
    assert(publicSlugRes1.status === 404, 'Public GET /api/blog/:slug on draft returns genuine 404');

    // Step C: Publish article & verify Sanitization
    const publishBlogRes = await fetch(`${baseUrl}/api/blog/admin/posts/${blogId}/publish`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: 'published' })
    });
    assert(publishBlogRes.ok, 'Admin published blog article successfully');

    const publicSlugRes2 = await fetch(`${baseUrl}/api/blog/test-guide-to-coworking`);
    const publicSlugData2 = await publicSlugRes2.json();
    assert(publicSlugRes2.ok && publicSlugData2.post?.title === 'Test Guide to Coworking in Raipur', 'Published article is publicly readable by slug');
    assert(
      !publicSlugData2.post.content.includes('<script>') && !publicSlugData2.post.content.includes('javascript:'),
      'Server-side HTML sanitization stripped malicious script tags and javascript: links'
    );
    assert(publicSlugData2.post.readingTime > 0, 'Estimated reading time calculated automatically');

    // Step D: Duplicate slug rejection test
    const dupSlugRes = await fetch(`${baseUrl}/api/blog/admin/posts`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Another Article with Same Slug',
        slug: 'test-guide-to-coworking',
        excerpt: 'Duplicate slug test.',
        content: '<p>Content</p>',
        author: 'Tester',
        category: 'Startups'
      })
    });
    assert(dupSlugRes.status === 400, 'Duplicate article slug is rejected with 400 Bad Request');

    // Step E: Slug Change & 301 Redirect Handling
    const updateSlugRes = await fetch(`${baseUrl}/api/blog/admin/posts/${blogId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        slug: 'test-coworking-guide-v2',
        title: 'Test Guide to Coworking in Raipur (Updated)'
      })
    });
    assert(updateSlugRes.ok, 'Admin changed slug to test-coworking-guide-v2');

    const oldSlugRes = await fetch(`${baseUrl}/api/blog/test-guide-to-coworking`, { redirect: 'manual' });
    const oldSlugData = await oldSlugRes.json();
    assert(
      oldSlugRes.status === 301 && oldSlugData.redirect === '/blog/test-coworking-guide-v2',
      'Request to old slug returns HTTP 301 redirect with new URL'
    );

    // Step F: Unpublish article and verify 404
    await fetch(`${baseUrl}/api/blog/admin/posts/${blogId}/publish`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: 'draft' })
    });
    const unpubSlugRes = await fetch(`${baseUrl}/api/blog/test-coworking-guide-v2`);
    assert(unpubSlugRes.status === 404, 'Unpublished article returns 404 Not Found to anonymous visitors');

    // ─── SITEMAP XML TESTS ───
    console.log('\n--- TEST SUITE 5: Dynamic Sitemap Generation ---');
    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    const sitemapText = await sitemapRes.text();
    assert(
      sitemapRes.ok &&
      sitemapText.includes('https://www.devencowork.com/events') &&
      sitemapText.includes('https://www.devencowork.com/about') &&
      sitemapText.includes('https://www.devencowork.com/blog'),
      'Dynamic /sitemap.xml includes /events, /about, and /blog'
    );
    assert(
      !sitemapText.includes('test-guide-to-coworking') && !sitemapText.includes('admin'),
      'Dynamic /sitemap.xml strictly excludes drafts and admin routes'
    );

    // Clean up test records
    await Event.deleteMany({ slug: { $in: ['test-founder-meetup', 'test-past-workshop'] } });
    await BlogPost.deleteMany({ slug: { $in: ['test-guide-to-coworking', 'test-coworking-guide-v2'] } });

  } catch (err) {
    console.error('Fatal error during test execution:', err);
    failed++;
  } finally {
    server.close();
    await mongoose.connection.close();
  }

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
