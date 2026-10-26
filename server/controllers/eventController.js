import Event from '../models/Event.js';
import { sanitizeHtml, slugify } from '../utils/sanitize.js';

/**
 * @desc    Get all published events for the public website
 * @route   GET /api/events
 * @access  Public
 */
export async function getPublishedEvents(req, res) {
  try {
    const { category, timeframe } = req.query;
    const now = new Date();

    const query = { status: 'published' };
    if (category && category !== 'All') {
      query.category = category;
    }

    let events = await Event.find(query).lean();

    // Separate upcoming and past
    const upcoming = events
      .filter((e) => new Date(e.endAt || e.startAt) >= now)
      .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

    const past = events
      .filter((e) => new Date(e.endAt || e.startAt) < now)
      .sort((a, b) => new Date(b.startAt) - new Date(a.startAt));

    // Featured event (only from published upcoming events, or published with featured=true)
    const featuredEvent = upcoming.find((e) => e.featured) || null;

    if (timeframe === 'upcoming') {
      return res.json({
        success: true,
        data: upcoming,
        count: upcoming.length,
        featuredEvent,
      });
    }

    if (timeframe === 'past') {
      return res.json({
        success: true,
        data: past,
        count: past.length,
      });
    }

    return res.json({
      success: true,
      upcoming,
      past,
      featuredEvent,
      totalCount: events.length,
    });
  } catch (error) {
    console.error('Error fetching published events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message,
    });
  }
}

/**
 * @desc    Get single published event by slug
 * @route   GET /api/events/:slug
 * @access  Public
 */
export async function getPublishedEventBySlug(req, res) {
  try {
    const { slug } = req.params;
    const event = await Event.findOne({ slug: slug.toLowerCase().trim(), status: 'published' }).lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or has not been published',
      });
    }

    return res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message,
    });
  }
}

/**
 * @desc    Get all events for Admin CMS with search, filter, and stats
 * @route   GET /api/admin/events
 * @access  Private (Admin Only)
 */
export async function getAdminEvents(req, res) {
  try {
    const { search, status, category, timeframe } = req.query;
    const now = new Date();

    const query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { location: searchRegex },
        { organizer: searchRegex },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    let allEvents = await Event.find(query).sort({ startAt: -1 }).lean();

    // Apply timeframe filter if requested
    if (timeframe === 'upcoming') {
      allEvents = allEvents.filter((e) => new Date(e.endAt || e.startAt) >= now);
    } else if (timeframe === 'past') {
      allEvents = allEvents.filter((e) => new Date(e.endAt || e.startAt) < now);
    }

    // Calculate overall stats
    const totalCountDocs = await Event.countDocuments({});
    const publishedCount = await Event.countDocuments({ status: 'published' });
    const draftCount = await Event.countDocuments({ status: 'draft' });
    const upcomingCount = await Event.countDocuments({
      status: 'published',
      $or: [{ endAt: { $gte: now } }, { startAt: { $gte: now } }],
    });
    const pastCount = await Event.countDocuments({
      status: 'published',
      endAt: { $lt: now },
    });

    return res.json({
      success: true,
      data: allEvents,
      stats: {
        total: totalCountDocs,
        published: publishedCount,
        draft: draftCount,
        upcoming: upcomingCount,
        past: pastCount,
      },
    });
  } catch (error) {
    console.error('Error fetching admin events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin events',
      error: error.message,
    });
  }
}

/**
 * @desc    Get single event by ID for Admin CMS
 * @route   GET /api/admin/events/:id
 * @access  Private (Admin Only)
 */
export async function getAdminEventById(req, res) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id).lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    return res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message,
    });
  }
}

/**
 * @desc    Create new event
 * @route   POST /api/admin/events
 * @access  Private (Admin Only)
 */
export async function createEvent(req, res) {
  try {
    const {
      title,
      slug: customSlug,
      excerpt,
      description,
      coverImage,
      gallery,
      category,
      location,
      startAt,
      endAt,
      registrationUrl,
      registrationCtaLabel,
      registrationDeadline,
      price,
      capacity,
      speakers,
      organizer,
      featured,
      status,
      recap,
      seoTitle,
      seoDescription,
      socialImage,
    } = req.body;

    const finalExcerpt = (excerpt || req.body.shortDescription || '').trim();
    const finalDescription = (description || req.body.fullDescription || '').trim();

    // Required fields validation
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Event title is required.' });
    }
    if (!finalExcerpt) {
      return res.status(400).json({ success: false, message: 'Short description is required.' });
    }
    if (!finalDescription) {
      return res.status(400).json({ success: false, message: 'Full description is required.' });
    }
    if (!startAt) {
      return res.status(400).json({ success: false, message: 'Start date and time is required.' });
    }
    if (!endAt) {
      return res.status(400).json({ success: false, message: 'End date and time is required.' });
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid start or end date.' });
    }

    if (endDate < startDate) {
      return res.status(400).json({ success: false, message: 'End date and time cannot be before start date and time.' });
    }

    // Slug validation and generation
    const slug = slugify(customSlug || title);
    if (!slug) {
      return res.status(400).json({ success: false, message: 'Valid URL slug is required.' });
    }

    const existingSlug = await Event.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({ success: false, message: `The URL slug "${slug}" is already in use. Please choose a unique slug.` });
    }

    // Validate registration URL if provided
    if (registrationUrl && registrationUrl.trim()) {
      const trimmedUrl = registrationUrl.trim();
      const isValidUrl = /^https?:\/\//i.test(trimmedUrl) || trimmedUrl.startsWith('mailto:') || trimmedUrl.startsWith('tel:') || trimmedUrl.startsWith('/');
      if (!isValidUrl) {
        return res.status(400).json({ success: false, message: 'Registration URL must be a valid http/https link or internal path.' });
      }
    }

    const isPublished = status === 'published';

    const event = new Event({
      title: title.trim(),
      slug,
      excerpt: finalExcerpt,
      description: sanitizeHtml(finalDescription),
      coverImage: coverImage || '',
      gallery: Array.isArray(gallery) ? gallery : [],
      category: category || 'Community',
      location: location?.trim() || 'Deven Co-Work, Shankar Nagar, Raipur',
      startAt: startDate,
      endAt: endDate,
      registrationUrl: registrationUrl ? registrationUrl.trim() : '',
      registrationCtaLabel: (registrationCtaLabel || req.body.registrationCta || 'Register Now').trim(),
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      price: price?.trim() || 'Free',
      capacity: Number(capacity) || 0,
      speakers: Array.isArray(speakers) ? speakers : [],
      organizer: organizer?.trim() || 'Deven Co-Work',
      featured: Boolean(featured),
      status: isPublished ? 'published' : 'draft',
      recap: recap ? sanitizeHtml(recap) : '',
      seoTitle: seoTitle?.trim() || '',
      seoDescription: seoDescription?.trim() || '',
      socialImage: socialImage || '',
      publishedAt: isPublished ? new Date() : null,
    });

    await event.save();

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating event',
    });
  }
}

/**
 * @desc    Update existing event
 * @route   PUT /api/admin/events/:id
 * @access  Private (Admin Only)
 */
export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const {
      title,
      slug: customSlug,
      excerpt,
      description,
      coverImage,
      gallery,
      category,
      location,
      startAt,
      endAt,
      registrationUrl,
      registrationCtaLabel,
      registrationDeadline,
      price,
      capacity,
      speakers,
      organizer,
      featured,
      status,
      recap,
      seoTitle,
      seoDescription,
      socialImage,
    } = req.body;

    if (title) event.title = title.trim();
    if (excerpt !== undefined || req.body.shortDescription !== undefined) {
      event.excerpt = (excerpt || req.body.shortDescription || '').trim();
    }
    if (description !== undefined || req.body.fullDescription !== undefined) {
      event.description = sanitizeHtml(description || req.body.fullDescription || '');
    }
    if (coverImage !== undefined) event.coverImage = coverImage;
    if (gallery !== undefined) event.gallery = Array.isArray(gallery) ? gallery : [];
    if (category) event.category = category;
    if (location) event.location = location.trim();
    if (registrationCtaLabel !== undefined || req.body.registrationCta !== undefined) {
      event.registrationCtaLabel = (registrationCtaLabel || req.body.registrationCta || 'Register Now').trim();
    }
    if (registrationDeadline !== undefined) event.registrationDeadline = registrationDeadline ? new Date(registrationDeadline) : null;
    if (price !== undefined) event.price = price.trim();
    if (capacity !== undefined) event.capacity = Number(capacity) || 0;
    if (speakers !== undefined) event.speakers = Array.isArray(speakers) ? speakers : [];
    if (organizer) event.organizer = organizer.trim();
    if (featured !== undefined) event.featured = Boolean(featured);
    if (recap !== undefined) event.recap = sanitizeHtml(recap);
    if (seoTitle !== undefined) event.seoTitle = seoTitle.trim();
    if (seoDescription !== undefined) event.seoDescription = seoDescription.trim();
    if (socialImage !== undefined) event.socialImage = socialImage;

    if (startAt) event.startAt = new Date(startAt);
    if (endAt) event.endAt = new Date(endAt);

    if (event.endAt < event.startAt) {
      return res.status(400).json({ success: false, message: 'End date and time cannot precede start date and time.' });
    }

    if (customSlug) {
      const newSlug = slugify(customSlug);
      if (newSlug !== event.slug) {
        const existing = await Event.findOne({ slug: newSlug, _id: { $ne: id } });
        if (existing) {
          return res.status(400).json({ success: false, message: `Slug "${newSlug}" is already in use by another event.` });
        }
        event.slug = newSlug;
      }
    }

    if (registrationUrl !== undefined) {
      const trimmedUrl = registrationUrl.trim();
      if (trimmedUrl) {
        const isValid = /^https?:\/\//i.test(trimmedUrl) || trimmedUrl.startsWith('mailto:') || trimmedUrl.startsWith('tel:') || trimmedUrl.startsWith('/');
        if (!isValid) {
          return res.status(400).json({ success: false, message: 'Invalid registration URL.' });
        }
      }
      event.registrationUrl = trimmedUrl;
    }

    if (status) {
      if (status === 'published' && event.status !== 'published') {
        event.status = 'published';
        event.publishedAt = event.publishedAt || new Date();
      } else if (status === 'draft') {
        event.status = 'draft';
      }
    }

    await event.save();

    return res.json({
      success: true,
      message: 'Event updated successfully.',
      data: event,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating event',
    });
  }
}

/**
 * @desc    Publish or unpublish an event
 * @route   PATCH /api/admin/events/:id/publish
 * @access  Private (Admin Only)
 */
export async function togglePublishEvent(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const newStatus = status === 'published' ? 'published' : 'draft';
    event.status = newStatus;
    if (newStatus === 'published' && !event.publishedAt) {
      event.publishedAt = new Date();
    }

    await event.save();

    return res.json({
      success: true,
      message: `Event ${newStatus === 'published' ? 'published live' : 'unpublished to draft'}.`,
      data: event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while toggling event publication status',
    });
  }
}

/**
 * @desc    Delete an event
 * @route   DELETE /api/admin/events/:id
 * @access  Private (Admin Only)
 */
export async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await Event.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: `Event "${event.title}" has been permanently deleted.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting event',
    });
  }
}
