import BlogPost from '../models/BlogPost.js';
import BlogCategory from '../models/BlogCategory.js';
import { sanitizeHtml, slugify, calculateReadingTime } from '../utils/sanitize.js';

// Default categories to seed if empty
const DEFAULT_CATEGORIES = [
  { name: 'Startups', slug: 'startups', description: 'Insights and playbooks for building high-growth ventures in Raipur and beyond.', order: 1 },
  { name: 'Entrepreneurship', slug: 'entrepreneurship', description: 'Stories, mindset, and practical guides for modern entrepreneurs.', order: 2 },
  { name: 'Productivity', slug: 'productivity', description: 'Work routines, focus habits, and operating systems for founders and creators.', order: 3 },
  { name: 'Coworking', slug: 'coworking', description: 'How flexible workspaces, private cabins, and community elevate business.', order: 4 },
  { name: 'Founder Stories', slug: 'founder-stories', description: 'Real experiences from founders building in Raipur and Central India.', order: 5 },
  { name: 'Events & Community', slug: 'events-and-community', description: 'Recaps, key takeaways, and updates from Deven community meetups.', order: 6 },
  { name: 'Raipur Business Ecosystem', slug: 'raipur-business-ecosystem', description: 'The emerging commercial, technological, and startup landscape of Raipur.', order: 7 },
];

/**
 * Seed default categories if none exist in the database.
 */
async function ensureDefaultCategories() {
  const count = await BlogCategory.countDocuments({});
  if (count === 0) {
    await BlogCategory.insertMany(DEFAULT_CATEGORIES);
  }
}

/**
 * @desc    Get published blog articles with search, filter, and pagination
 * @route   GET /api/blog/posts
 * @access  Public
 */
export async function getPublishedPosts(req, res) {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const query = { status: 'published' };

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex },
        { author: searchRegex },
        { tags: searchRegex },
      ];
    }

    const [posts, total, featuredPost] = await Promise.all([
      BlogPost.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-content') // exclude large HTML body for listing speed
        .lean(),
      BlogPost.countDocuments(query),
      BlogPost.findOne({ status: 'published', featured: true })
        .sort({ publishedAt: -1 })
        .select('-content')
        .lean(),
    ]);

    return res.json({
      success: true,
      data: posts,
      posts: posts,
      featuredPost: featuredPost || (posts.length > 0 ? posts[0] : null),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      error: error.message,
    });
  }
}

/**
 * @desc    Get single published blog article by slug, with redirect handling for renamed slugs
 * @route   GET /api/blog/posts/:slug
 * @access  Public
 */
export async function getPublishedPostBySlug(req, res) {
  try {
    const slug = req.params.slug.toLowerCase().trim();

    // 1. Direct match on current slug
    let post = await BlogPost.findOne({ slug, status: 'published' }).lean();

    // 2. If not found, check previousSlugs to support SEO redirect
    if (!post) {
      const redirectPost = await BlogPost.findOne({
        previousSlugs: slug,
        status: 'published',
      }).lean();

      if (redirectPost) {
        return res.status(301).json({
          success: true,
          redirect: `/blog/${redirectPost.slug}`,
          newSlug: redirectPost.slug,
        });
      }

      return res.status(404).json({
        success: false,
        message: 'Article not found or has not been published',
      });
    }

    // 3. Fetch related articles (same category, excluding current post)
    const relatedPosts = await BlogPost.find({
      status: 'published',
      category: post.category,
      _id: { $ne: post._id },
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('title slug excerpt coverImage author publishedAt readingTime category')
      .lean();

    return res.json({
      success: true,
      data: post,
      post: post,
      relatedPosts,
    });
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch article',
      error: error.message,
    });
  }
}

/**
 * @desc    Get all blog categories
 * @route   GET /api/blog/categories
 * @access  Public
 */
export async function getCategories(req, res) {
  try {
    await ensureDefaultCategories();
    const categories = await BlogCategory.find({}).sort({ order: 1, name: 1 }).lean();

    // Include post count for each category
    const counts = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: { $toLower: '$category' }, count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id] = c.count;
    });

    const enriched = categories.map((cat) => ({
      ...cat,
      postCount: countMap[cat.name.toLowerCase()] || 0,
    }));

    return res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
}

/**
 * @desc    Get all blog articles for Admin CMS
 * @route   GET /api/admin/blog/posts
 * @access  Private (Admin Only)
 */
export async function getAdminPosts(req, res) {
  try {
    const { search, category, status, sort = 'newest' } = req.query;

    const query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { author: searchRegex },
        { slug: searchRegex },
      ];
    }

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const posts = await BlogPost.find(query).sort(sortOption).select('-content').lean();

    const [total, published, draft, scheduled] = await Promise.all([
      BlogPost.countDocuments({}),
      BlogPost.countDocuments({ status: 'published' }),
      BlogPost.countDocuments({ status: 'draft' }),
      BlogPost.countDocuments({ scheduledAt: { $ne: null, $gt: new Date() } }),
    ]);

    return res.json({
      success: true,
      data: posts,
      stats: {
        total,
        published,
        draft,
        scheduled,
      },
    });
  } catch (error) {
    console.error('Error fetching admin blog posts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin blog posts',
      error: error.message,
    });
  }
}

/**
 * @desc    Get single article by ID for Admin CMS
 * @route   GET /api/admin/blog/posts/:id
 * @access  Private (Admin Only)
 */
export async function getAdminPostById(req, res) {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id).lean();

    if (!post) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    return res.json({ success: true, data: post });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @desc    Create new blog article
 * @route   POST /api/admin/blog/posts
 * @access  Private (Admin Only)
 */
export async function createPost(req, res) {
  try {
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      coverImage,
      author,
      category,
      tags,
      featured,
      status,
      seoTitle,
      seoDescription,
      socialImage,
      scheduledAt,
      readingTime,
      contentFormat,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Article title is required.' });
    }
    if (!excerpt || !excerpt.trim()) {
      return res.status(400).json({ success: false, message: 'Article excerpt is required.' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Article content is required.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }

    const slug = slugify(customSlug || title);
    if (!slug) {
      return res.status(400).json({ success: false, message: 'Valid URL slug is required.' });
    }

    const existing = await BlogPost.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `The slug "${slug}" is already in use by another article. Please provide a unique slug.`,
      });
    }

    const isPublished = status === 'published';
    const validFormat = ['auto', 'markdown', 'html'].includes(contentFormat) ? contentFormat : 'auto';
    const cleanContent = sanitizeHtml(content);
    const calculatedReading = Number(readingTime) || calculateReadingTime(cleanContent);

    // Normalize category: check if category exists or create it
    const trimmedCategory = category.trim();
    const existingCategory = await BlogCategory.findOne({
      name: { $regex: new RegExp(`^${trimmedCategory}$`, 'i') },
    });
    if (!existingCategory) {
      await BlogCategory.create({
        name: trimmedCategory,
        slug: slugify(trimmedCategory),
      });
    }

    const post = new BlogPost({
      title: title.trim(),
      slug,
      excerpt: excerpt.trim(),
      content: cleanContent,
      contentFormat: validFormat,
      coverImage: coverImage || '',
      author: author?.trim() || 'Deven Co-Work Team',
      category: existingCategory ? existingCategory.name : trimmedCategory,
      tags: Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : [],
      featured: Boolean(featured),
      status: isPublished ? 'published' : 'draft',
      readingTime: calculatedReading,
      seoTitle: seoTitle?.trim() || '',
      seoDescription: seoDescription?.trim() || '',
      socialImage: socialImage || '',
      publishedAt: isPublished ? new Date() : null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    });

    await post.save();

    return res.status(201).json({
      success: true,
      message: 'Article created successfully.',
      data: post,
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating article',
    });
  }
}

/**
 * @desc    Update existing blog article
 * @route   PUT /api/admin/blog/posts/:id
 * @access  Private (Admin Only)
 */
export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      coverImage,
      author,
      category,
      tags,
      featured,
      status,
      seoTitle,
      seoDescription,
      socialImage,
      scheduledAt,
      readingTime,
      contentFormat,
    } = req.body;

    if (title) post.title = title.trim();
    if (excerpt) post.excerpt = excerpt.trim();
    if (contentFormat && ['auto', 'markdown', 'html'].includes(contentFormat)) {
      post.contentFormat = contentFormat;
    }
    if (content) {
      post.content = sanitizeHtml(content);
      post.readingTime = Number(readingTime) || calculateReadingTime(post.content);
    }
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (author) post.author = author.trim();
    if (category) {
      const trimmedCategory = category.trim();
      const existingCategory = await BlogCategory.findOne({
        name: { $regex: new RegExp(`^${trimmedCategory}$`, 'i') },
      });
      post.category = existingCategory ? existingCategory.name : trimmedCategory;
    }
    if (tags !== undefined) {
      post.tags = Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : [];
    }
    if (featured !== undefined) post.featured = Boolean(featured);
    if (seoTitle !== undefined) post.seoTitle = seoTitle.trim();
    if (seoDescription !== undefined) post.seoDescription = seoDescription.trim();
    if (socialImage !== undefined) post.socialImage = socialImage;
    if (scheduledAt !== undefined) post.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;

    // Handle slug change: track old slug in previousSlugs
    if (customSlug) {
      const newSlug = slugify(customSlug);
      if (newSlug !== post.slug) {
        const existing = await BlogPost.findOne({ slug: newSlug, _id: { $ne: id } });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: `The slug "${newSlug}" is already in use by another article.`,
          });
        }
        if (!post.previousSlugs.includes(post.slug)) {
          post.previousSlugs.push(post.slug);
        }
        post.slug = newSlug;
      }
    }

    if (status) {
      if (status === 'published' && post.status !== 'published') {
        post.status = 'published';
        post.publishedAt = post.publishedAt || new Date();
      } else if (status === 'draft') {
        post.status = 'draft';
      }
    }

    await post.save();

    return res.json({
      success: true,
      message: 'Article updated successfully.',
      data: post,
    });
  } catch (error) {
    console.error('Error updating article:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating article',
    });
  }
}

/**
 * @desc    Publish or unpublish article
 * @route   PATCH /api/admin/blog/posts/:id/publish
 * @access  Private (Admin Only)
 */
export async function togglePublishPost(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    const newStatus = status === 'published' ? 'published' : 'draft';
    post.status = newStatus;
    if (newStatus === 'published' && !post.publishedAt) {
      post.publishedAt = new Date();
    }

    await post.save();

    return res.json({
      success: true,
      message: `Article ${newStatus === 'published' ? 'published live' : 'unpublished to draft'}.`,
      data: post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while toggling publication status',
    });
  }
}

/**
 * @desc    Delete an article
 * @route   DELETE /api/admin/blog/posts/:id
 * @access  Private (Admin Only)
 */
export async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    await BlogPost.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: `Article "${post.title}" has been permanently deleted.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting article',
    });
  }
}

/**
 * @desc    Create or update category
 * @route   POST /api/admin/blog/categories
 * @access  Private (Admin Only)
 */
export async function createOrUpdateCategory(req, res) {
  try {
    const { id, name, description, order } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const trimmedName = name.trim();
    const slug = slugify(trimmedName);

    if (id) {
      const category = await BlogCategory.findById(id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }
      category.name = trimmedName;
      category.slug = slug;
      if (description !== undefined) category.description = description.trim();
      if (order !== undefined) category.order = Number(order) || 0;
      await category.save();

      return res.json({ success: true, message: 'Category updated.', data: category });
    }

    const existing = await BlogCategory.findOne({
      $or: [{ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } }, { slug }],
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }

    const newCategory = new BlogCategory({
      name: trimmedName,
      slug,
      description: description?.trim() || '',
      order: Number(order) || 0,
    });
    await newCategory.save();

    return res.status(201).json({
      success: true,
      message: 'Category created.',
      data: newCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while saving category',
    });
  }
}

/**
 * @desc    Delete category
 * @route   DELETE /api/admin/blog/categories/:id
 * @access  Private (Admin Only)
 */
export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const category = await BlogCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Check if any articles are using this category
    const count = await BlogPost.countDocuments({
      category: { $regex: new RegExp(`^${category.name}$`, 'i') },
    });
    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}" because ${count} article(s) are assigned to it. Please reassign those articles first.`,
      });
    }

    await BlogCategory.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: `Category "${category.name}" deleted.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
