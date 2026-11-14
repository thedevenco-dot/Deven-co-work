import { useEffect, useState, useCallback, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  User,
  Star,
  Tag,
  Save,
  RotateCcw,
  X,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Wand2,
  Table as TableIcon,
  HelpCircle,
  Minus,
  Columns,
  MoreVertical,
  Copy,
  Check,
  Globe
} from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
  autoStructureArticle,
  renderArticleContent,
  calculateReadingTime
} from '@/utils/articlePipeline';

export default function AdminBlogCMS({ onOpenMediaLibrary }) {
  const { toast } = useToast();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, scheduled: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [activeEditorTab, setActiveEditorTab] = useState('edit'); // 'edit' | 'preview'

  // Delete Confirmation
  const [deletingPost, setDeletingPost] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Row Action Dropdown Menu & Copy state
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [copiedPostId, setCopiedPostId] = useState(null);

  // Close row dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => setOpenActionMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Category Manager Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  // Form Data
  const initialForm = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    contentFormat: 'auto',
    coverImage: '',
    author: 'Deven Co-Work Team',
    category: 'Startups',
    tags: '',
    featured: false,
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    socialImage: '',
    scheduledAt: '',
    readingTime: 3,
  };

  const [formData, setFormData] = useState(initialForm);
  const contentTextareaRef = useRef(null);

  // Fetch articles and categories
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [postsRes, catRes] = await Promise.all([
        api.fetchAdminBlogPosts({
          search,
          category: categoryFilter,
          status: statusFilter,
          sort: sortOrder,
        }),
        api.fetchBlogCategories(),
      ]);

      if (postsRes.success) {
        setPosts(postsRes.data || []);
        if (postsRes.stats) setStats(postsRes.stats);
      }
      if (catRes.success) {
        setCategories(catRes.data || []);
      }
    } catch (err) {
      toast({
        title: 'Error loading blog data',
        description: err.message || 'Server error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter, sortOrder, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingId(null);
    setFormError('');
    setActiveEditorTab('edit');
    setFormData({
      ...initialForm,
      category: categories.length > 0 ? categories[0].name : 'Startups',
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = async (postId) => {
    setEditingId(postId);
    setFormError('');
    setActiveEditorTab('edit');

    try {
      const res = await api.fetchAdminBlogPostById(postId);
      if (res.success && res.data) {
        const post = res.data;
        const toInputDate = (d) => {
          if (!d) return '';
          const dt = new Date(d);
          return isNaN(dt.getTime()) ? '' : dt.toISOString().slice(0, 16);
        };

        setFormData({
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          contentFormat: post.contentFormat || 'auto',
          coverImage: typeof post.coverImage === 'string' ? post.coverImage : post.coverImage?.url || '',
          author: post.author || 'Deven Co-Work Team',
          category: post.category || 'Startups',
          tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
          featured: Boolean(post.featured),
          status: post.status || 'draft',
          seoTitle: post.seoTitle || '',
          seoDescription: post.seoDescription || '',
          socialImage: post.socialImage || '',
          scheduledAt: toInputDate(post.scheduledAt),
          readingTime: post.readingTime || 3,
        });
        setModalOpen(true);
      }
    } catch (err) {
      toast({ title: 'Error opening article', description: err.message, variant: 'destructive' });
    }
  };

  const updateField = (key, val) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: val };
      if (key === 'title' && !editingId && (!prev.slug || prev.slug === slugify(prev.title))) {
        next.slug = slugify(val);
      }
      return next;
    });
  };

  function slugify(text) {
    return (text || '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/&/g, '-and-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  // Insert formatting into content textarea
  const insertFormatting = (prefix, suffix = '', defaultText = 'text') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const textToInsert = selected || defaultText;
    const replacement = `${prefix}${textToInsert}${suffix}`;

    const newContent =
      textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    updateField('content', newContent);
    updateField('readingTime', calculateReadingTime(newContent));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + textToInsert.length);
    }, 50);
  };

  // Automatically format pasted raw ChatGPT or plain text into structured Markdown
  const handleAutoStructure = () => {
    if (!formData.content || !formData.content.trim()) {
      toast({
        title: 'No content to structure',
        description: 'Please paste or write your article content first.',
        variant: 'destructive',
      });
      return;
    }
    const structured = autoStructureArticle(formData.content, formData.title);
    updateField('content', structured);
    updateField('readingTime', calculateReadingTime(structured));
    toast({
      title: 'Article Automatically Structured',
      description: 'Detected headings, numbered sections, FAQ questions, and lists.',
    });
  };

  // Submit Article
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Please enter an article title.');
      return;
    }
    if (!formData.slug.trim()) {
      setFormError('Please enter a URL slug.');
      return;
    }
    if (!formData.excerpt.trim()) {
      setFormError('Please enter an excerpt summary.');
      return;
    }
    if (!formData.content.trim()) {
      setFormError('Please enter the main article content.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content,
        contentFormat: formData.contentFormat || 'auto',
        coverImage: formData.coverImage,
        author: formData.author.trim(),
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        featured: formData.featured,
        status: formData.status,
        seoTitle: formData.seoTitle.trim(),
        seoDescription: formData.seoDescription.trim(),
        socialImage: formData.socialImage,
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt) : null,
        readingTime: Number(formData.readingTime) || 3,
      };

      if (editingId) {
        await api.updateBlogPost(editingId, payload);
        toast({ title: 'Article Updated', description: `"${formData.title}" saved.` });
      } else {
        await api.createBlogPost(payload);
        toast({ title: 'Article Created', description: `"${formData.title}" created.` });
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to save article.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle publish
  const handleTogglePublish = async (post) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await api.togglePublishBlogPost(post._id, nextStatus);
      toast({
        title: nextStatus === 'published' ? 'Article Published' : 'Article Unpublished',
        description: `"${post.title}" is now ${nextStatus}.`,
      });
      fetchData();
    } catch (err) {
      toast({ title: 'Action failed', description: err.message, variant: 'destructive' });
    }
  };

  // Delete article
  const handleDelete = async () => {
    if (!deletingPost) return;
    setDeleting(true);
    try {
      await api.deleteBlogPost(deletingPost._id);
      toast({ title: 'Article Deleted', description: `"${deletingPost.title}" was deleted.` });
      setDeletingPost(null);
      fetchData();
    } catch (err) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  // Copy article link to clipboard
  const handleCopyLink = (post) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.devencowork.com';
    const url = `${origin}/blog/${post.slug}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopiedPostId(post._id);
          toast({
            title: 'Link Copied',
            description: `Copied /blog/${post.slug} to clipboard.`,
          });
          setTimeout(() => setCopiedPostId(null), 2500);
        })
        .catch(() => {
          toast({
            title: 'Failed to copy',
            description: 'Could not access clipboard.',
            variant: 'destructive',
          });
        });
    }
  };

  // Save Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSavingCat(true);
    try {
      await api.saveBlogCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim(),
      });
      toast({ title: 'Category Created', description: newCatName.trim() });
      setNewCatName('');
      setNewCatDesc('');
      fetchData();
    } catch (err) {
      toast({ title: 'Category Error', description: err.message, variant: 'destructive' });
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!confirm(`Delete category "${catName}"?`)) return;
    try {
      await api.deleteBlogCategory(catId);
      toast({ title: 'Category Deleted', description: catName });
      fetchData();
    } catch (err) {
      toast({ title: 'Delete Failed', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#04B8BB]">
            <span className="w-2 h-2 rounded-full bg-[#04B8BB]" />
            DEVEN JOURNAL CMS
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#F1F1F1]">
            Blog & Article Management
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            Write, edit, format, and publish articles on startups, entrepreneurship, and coworking in Raipur.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCatModalOpen(true)}
            className="px-3 py-2 bg-[#1A1A1A] border border-[#333] hover:border-[#04B8BB] text-xs font-semibold text-[#CCC] hover:text-white rounded-lg transition-colors"
          >
            Manage Categories ({categories.length})
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#04B8BB] text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#039e9f] transition-colors shadow"
          >
            <Plus size={16} /> Create Article
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border border-[#242424] bg-[#0A0A0A] p-4 rounded-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3]">Total Articles</span>
          <p className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="border border-[#242424] bg-[#0A0A0A] p-4 rounded-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#04B8BB]">Published</span>
          <p className="text-2xl sm:text-3xl font-display font-bold text-[#04B8BB] mt-1">{stats.published}</p>
        </div>
        <div className="border border-[#242424] bg-[#0A0A0A] p-4 rounded-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Drafts</span>
          <p className="text-2xl sm:text-3xl font-display font-bold text-amber-400 mt-1">{stats.draft}</p>
        </div>
        <div className="border border-[#242424] bg-[#0A0A0A] p-4 rounded-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Scheduled</span>
          <p className="text-2xl sm:text-3xl font-display font-bold text-purple-400 mt-1">{stats.scheduled}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="border border-[#242424] bg-[#0A0A0A] p-4 rounded-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by article title, author, slug..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#121212] border border-[#242424] rounded text-[#A3A3A3] focus:outline-none focus:border-[#04B8BB]"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="scheduled">Scheduled</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#121212] border border-[#242424] rounded text-[#A3A3A3] focus:outline-none focus:border-[#04B8BB]"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 bg-[#121212] border border-[#242424] rounded text-[#A3A3A3] focus:outline-none focus:border-[#04B8BB]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="border border-[#242424] bg-[#0A0A0A] rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-[#555] text-xs">
            <div className="inline-block w-6 h-6 border-2 border-[#04B8BB] border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading articles...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-[#555] text-xs">
            <BookOpen size={28} className="mx-auto mb-2 opacity-40 text-[#04B8BB]" />
            <p className="font-semibold text-white">No Articles Found</p>
            <p className="mt-1">Write your first article to publish it on /blog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[960px]">
              <thead className="bg-[#121212] text-[#A3A3A3] uppercase tracking-wider border-b border-[#242424] text-[10px]">
                <tr>
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Published Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {posts.map((post) => {
                  const coverUrl = typeof post.coverImage === 'string' ? post.coverImage : post.coverImage?.url;
                  const isScheduled = post.status === 'scheduled' || Boolean(post.scheduledAt && new Date(post.scheduledAt) > new Date() && post.status !== 'published');

                  return (
                    <tr key={post._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded bg-[#1A1A1A] overflow-hidden shrink-0 border border-[#2A2A2A]">
                            {coverUrl ? (
                              <img src={coverUrl} alt={post.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#444]">
                                <BookOpen size={14} />
                              </div>
                            )}
                          </div>
                          <div className="max-w-xs sm:max-w-sm">
                            <span className="font-semibold text-white truncate block hover:text-[#04B8BB]">
                              {post.title}
                            </span>
                            <span className="text-[10px] text-[#777] truncate block">
                              /blog/{post.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#AAA] whitespace-nowrap">
                        {post.author || 'Deven Team'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[10px] font-medium text-[#BBB]">
                          {post.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {post.status === 'published' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Published
                          </span>
                        ) : isScheduled ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold"
                            title={post.scheduledAt ? `Scheduled for ${new Date(post.scheduledAt).toLocaleString()}` : 'Scheduled'}
                          >
                            <Clock size={11} className="text-purple-400" /> Scheduled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Draft
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {post.featured ? (
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                        ) : (
                          <span className="text-[#444]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-[11px] text-[#666]">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : post.scheduledAt
                          ? `Sched: ${new Date(post.scheduledAt).toLocaleDateString()}`
                          : 'Unpublished'}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 relative">
                          {/* Direct Action: Edit */}
                          <button
                            onClick={() => openEditModal(post._id)}
                            title="Edit Article & Settings"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-[#161618] border border-[#2D2D32] hover:border-[#04B8BB] text-[#DDD] hover:text-[#04B8BB] rounded transition-colors shadow-sm group"
                          >
                            <Edit3 size={13} className="text-[#04B8BB] group-hover:scale-110 transition-transform" />
                            <span>Edit</span>
                          </button>

                          {/* Direct Action: Delete */}
                          <button
                            onClick={() => setDeletingPost(post)}
                            title="Delete Article Permanently"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-[#161618] border border-[#2D2D32] hover:border-red-500/60 text-[#DDD] hover:text-red-400 rounded transition-colors shadow-sm group"
                          >
                            <Trash2 size={13} className="text-red-400/80 group-hover:text-red-400 group-hover:scale-110 transition-transform" />
                            <span>Delete</span>
                          </button>

                          {/* More Options Dropdown Toggle */}
                          <div className="relative inline-block text-left">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenuId(openActionMenuId === post._id ? null : post._id);
                              }}
                              title="More article actions"
                              className={`p-1.5 rounded border transition-colors ${
                                openActionMenuId === post._id
                                  ? 'bg-[#222] border-[#04B8BB] text-white'
                                  : 'bg-[#161618] border-[#2D2D32] text-[#888] hover:text-white hover:border-[#444]'
                              }`}
                            >
                              <MoreVertical size={14} />
                            </button>

                            {/* Dropdown Menu */}
                            {openActionMenuId === post._id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1.5 w-48 bg-[#141416] border border-[#2D2D32] rounded-lg shadow-2xl py-1 z-30 text-left text-xs divide-y divide-[#242428] animate-in fade-in zoom-in-95 duration-100"
                              >
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      openEditModal(post._id);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[#CCC] hover:text-white hover:bg-white/[0.06] text-left"
                                  >
                                    <Edit3 size={13} className="text-[#04B8BB]" />
                                    <span>Edit Article</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      handleTogglePublish(post);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[#CCC] hover:text-white hover:bg-white/[0.06] text-left"
                                  >
                                    {post.status === 'published' ? (
                                      <>
                                        <EyeOff size={13} className="text-amber-400" />
                                        <span>Unpublish to Draft</span>
                                      </>
                                    ) : (
                                      <>
                                        <Eye size={13} className="text-emerald-400" />
                                        <span>Publish Live</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                <div className="py-1">
                                  {post.status === 'published' ? (
                                    <a
                                      href={`/blog/${post.slug}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={() => setOpenActionMenuId(null)}
                                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[#CCC] hover:text-white hover:bg-white/[0.06]"
                                    >
                                      <ExternalLink size={13} className="text-[#04B8BB]" />
                                      <span>View Live Article</span>
                                    </a>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        openEditModal(post._id);
                                        setActiveEditorTab('preview');
                                      }}
                                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[#888] hover:text-[#CCC] hover:bg-white/[0.06] text-left"
                                    >
                                      <Eye size={13} />
                                      <span>Preview Draft</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      handleCopyLink(post);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[#CCC] hover:text-white hover:bg-white/[0.06] text-left"
                                  >
                                    {copiedPostId === post._id ? (
                                      <Check size={13} className="text-emerald-400" />
                                    ) : (
                                      <Copy size={13} className="text-[#888]" />
                                    )}
                                    <span>{copiedPostId === post._id ? 'Link Copied!' : 'Copy Article Link'}</span>
                                  </button>
                                </div>

                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      setDeletingPost(post);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-left font-medium"
                                  >
                                    <Trash2 size={13} />
                                    <span>Delete Article</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT ARTICLE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-[#242424] rounded-xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-[#242424] flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  {editingId ? 'Edit Journal Article' : 'Create New Journal Article'}
                </h3>
                <p className="text-xs text-[#777] mt-0.5">
                  Write and publish insights. Output is automatically sanitized on the server before storage.
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#888] hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {formError && (
                <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-red-200 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                    Article Title <span className="text-[#04B8BB]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g. How to Choose the Right Coworking Space in Raipur"
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                    URL Slug <span className="text-[#04B8BB]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => updateField('slug', slugify(e.target.value))}
                    placeholder="e.g. how-to-choose-coworking-space-raipur"
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                  />
                </div>
              </div>

              {/* Author, Category, Status, Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                    Author <span className="text-[#04B8BB]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => updateField('author', e.target.value)}
                    placeholder="e.g. Deven Co-Work Team"
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                    Category <span className="text-[#04B8BB]">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                    Status <span className="text-[#04B8BB]">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => updateField('status', e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Public)</option>
                    <option value="scheduled">Scheduled (Auto-Publish)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer select-none py-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => updateField('featured', e.target.checked)}
                      className="rounded border-[#333] text-[#04B8BB] focus:ring-0"
                    />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#AAA]">
                      Featured Story
                    </span>
                  </label>
                </div>
              </div>

              {/* Scheduled Date Picker */}
              {(formData.status === 'scheduled' || formData.scheduledAt) && (
                <div className="p-3 bg-[#121214] border border-purple-500/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-purple-300">
                    <Calendar size={15} className="shrink-0 text-purple-400" />
                    <div>
                      <span className="font-semibold text-xs block">Scheduled Publishing Date & Time</span>
                      <span className="text-[10px] text-[#888]">Article will automatically go live at this time</span>
                    </div>
                  </div>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => updateField('scheduledAt', e.target.value)}
                    className="px-3 py-1.5 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#04B8BB]"
                  />
                </div>
              )}

              {/* Excerpt */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                  Article Excerpt <span className="text-[#04B8BB]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.excerpt}
                  onChange={(e) => updateField('excerpt', e.target.value)}
                  placeholder="Summary of the article for listings, meta description, and cards..."
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                />
              </div>

              {/* Cover Image & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                    Cover Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.coverImage}
                      onChange={(e) => updateField('coverImage', e.target.value)}
                      placeholder="https://res.cloudinary.com/..."
                      className="flex-1 px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                    />
                    {onOpenMediaLibrary && (
                      <button
                        type="button"
                        onClick={() => onOpenMediaLibrary((url) => updateField('coverImage', url))}
                        className="px-3 py-2 bg-[#1A1A1A] border border-[#333] hover:border-[#04B8BB] rounded text-[#AAA] hover:text-white"
                      >
                        Media Library
                      </button>
                    )}
                  </div>
                  {formData.coverImage && (
                    <div className="mt-2 w-32 h-20 rounded border border-[#242424] overflow-hidden">
                      <img src={formData.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => updateField('tags', e.target.value)}
                    placeholder="e.g. raipur, founder, productivity, cabins"
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                  />
                  <div className="mt-3">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1">
                      Estimated Reading Time (Minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={formData.readingTime}
                      onChange={(e) => updateField('readingTime', e.target.value)}
                      className="w-32 px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                    />
                  </div>
                </div>
              </div>

              {/* SEO & Social Media Metadata Section */}
              <div className="border border-[#242424] bg-[#0A0A0C] p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#1E1E22]">
                  <div className="flex items-center gap-2">
                    <Globe size={15} className="text-[#04B8BB]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      SEO & Social Media Metadata
                    </span>
                  </div>
                  <span className="text-[10px] text-[#777]">Optional overrides for Google search & Open Graph tags</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#AAA]">
                        SEO Meta Title
                      </label>
                      <span className={`text-[10px] ${formData.seoTitle.length > 60 ? 'text-amber-400' : 'text-[#666]'}`}>
                        {formData.seoTitle.length}/60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) => updateField('seoTitle', e.target.value)}
                      placeholder={formData.title ? `${formData.title} | Deven Co-Work` : 'Custom search title...'}
                      className="w-full px-3 py-2 bg-[#050505] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                    />
                    <p className="text-[10px] text-[#666] mt-1">Defaults to article title if left empty.</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#AAA]">
                        Social Share Image (OG / Twitter)
                      </label>
                    </div>
                    <input
                      type="text"
                      value={formData.socialImage}
                      onChange={(e) => updateField('socialImage', e.target.value)}
                      placeholder="https://... (defaults to cover image)"
                      className="w-full px-3 py-2 bg-[#050505] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                    />
                    <p className="text-[10px] text-[#666] mt-1">Defaults to cover image if left empty.</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#AAA]">
                      SEO Meta Description
                    </label>
                    <span className={`text-[10px] ${formData.seoDescription.length > 160 ? 'text-amber-400' : 'text-[#666]'}`}>
                      {formData.seoDescription.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.seoDescription}
                    onChange={(e) => updateField('seoDescription', e.target.value)}
                    placeholder={formData.excerpt || 'Custom description snippet for Google search results...'}
                    className="w-full px-3 py-2 bg-[#050505] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                  />
                  <p className="text-[10px] text-[#666] mt-1">Defaults to article excerpt if left empty.</p>
                </div>
              </div>

              {/* Rich Content Editor with Formatting Toolbar & Live Preview */}
              <div className="border border-[#242424] bg-[#0A0A0A] rounded-xl overflow-hidden shadow-lg">
                {/* Editor Header: Format Selector, Tips & Tabs */}
                <div className="p-3 bg-[#161618] border-b border-[#242424] flex flex-wrap items-center justify-between gap-3">
                  {/* Left: View Tabs */}
                  <div className="flex items-center gap-1.5 bg-[#0C0C0E] p-1 rounded-lg border border-[#222]">
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab('edit')}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                        activeEditorTab === 'edit'
                          ? 'bg-[#04B8BB] text-black shadow'
                          : 'text-[#AAA] hover:text-white'
                      }`}
                    >
                      Write & Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab('split')}
                      className={`px-3 py-1 rounded text-xs font-semibold hidden md:inline-flex items-center gap-1.5 transition-all ${
                        activeEditorTab === 'split'
                          ? 'bg-[#04B8BB] text-black shadow'
                          : 'text-[#AAA] hover:text-white'
                      }`}
                    >
                      <Columns size={12} /> Split View
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab('preview')}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                        activeEditorTab === 'preview'
                          ? 'bg-[#04B8BB] text-black shadow'
                          : 'text-[#AAA] hover:text-white'
                      }`}
                    >
                      Live Preview
                    </button>
                  </div>

                  {/* Right: Content Format Selector & Auto-Structure */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#777]">
                        Format:
                      </label>
                      <select
                        value={formData.contentFormat || 'auto'}
                        onChange={(e) => updateField('contentFormat', e.target.value)}
                        className="px-2.5 py-1 bg-[#0C0C0E] border border-[#2A2A2A] rounded text-[#DDD] text-xs focus:outline-none focus:border-[#04B8BB]"
                      >
                        <option value="auto">Auto-Detect (Markdown / Text / HTML)</option>
                        <option value="markdown">Markdown / Plain Text</option>
                        <option value="html">Raw HTML</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoStructure}
                      title="Automatically detect headings, numbered sections, FAQ questions, and lists from pasted raw text"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1F1F24] border border-[#04B8BB]/40 hover:border-[#04B8BB] text-[#04B8BB] hover:bg-[#04B8BB]/10 rounded text-xs font-semibold transition-all"
                    >
                      <Wand2 size={13} />
                      <span>Auto-Structure</span>
                    </button>
                  </div>
                </div>

                {/* Formatting Toolbar */}
                {(activeEditorTab === 'edit' || activeEditorTab === 'split') && (
                  <div className="px-3 py-2 bg-[#121214] border-b border-[#242424] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1">
                      {/* Heading 2 */}
                      <button
                        type="button"
                        onClick={() => {
                          const isHtml = formData.contentFormat === 'html';
                          insertFormatting(isHtml ? '<h2>' : '\n## ', isHtml ? '</h2>\n' : '\n', 'Section Heading');
                        }}
                        title="Heading 2 (Major Section)"
                        className="p-1.5 rounded hover:bg-white/10 text-[#AAA] hover:text-white text-xs font-bold"
                      >
                        <Heading2 size={15} />
                      </button>

                      {/* Heading 3 */}
                      <button
                        type="button"
                        onClick={() => {
                          const isHtml = formData.contentFormat === 'html';
                          insertFormatting(isHtml ? '<h3>' : '\n### ', isHtml ? '</h3>\n' : '\n', 'Subsection Heading');
                        }}
                        title="Heading 3 (Subsection)"
                        className="p-1.5 rounded hover:bg-white/10 text-[#AAA] hover:text-white"
                      >
                        <Heading3 size={15} />
                      </button>

                      <div className="w-[1px] h-4 bg-[#262626] mx-1" />

                      {/* Bold */}
                      <button
                        type="button"
                        onClick={() => {
                          const isHtml = formData.contentFormat === 'html';
                          insertFormatting(isHtml ? '<strong>' : '**', isHtml ? '</strong>' : '**', 'bold text');
                        }}
                        title="Bold"
                        className="p-1.5 rounded hover:bg-white/10 text-[#AAA] hover:text-white"
                      >
                        <Bold size={15} />
                      </button>

                      {/* Italic */}
                      <button
                        type="button"
                        onClick={() => {
                          const isHtml = formData.contentFormat === 'html';
                          insertFormatting(isHtml ? '<em>' : '*', isHtml ? '</em>' : '*', 'italic text');
                        }}
                        title="Italic"
                        className="p-1.5 rounded hover:bg-white/10 text-[#AAA] hover:text-white"
                      >
                        <Italic size={15} />
                      </button>

                      <div className="w-[1px] h-4 bg-[#262626] mx-1" />

                      {/* Bullet List */}
                      <button
                        type="button"
                        onClick={() => {
                          const isHtml = formData.contentFormat === 'html';
                          insertFormatting(isHtml ? '<ul>\n  <li>' : '\n- ', isHtml ? '</li>\n</ul>\n' : '\n', 'List item');
                        }}
                        title="Bullet List"
                        className="p-1.5 rounded hover:bg-white/10 text-[#AAA] hover:text-white"
                      >
                        <List size={15} />
                      </button>

                      {/* Numbered List */}
                      <button
                        type="button"
                        onClick={() => {
                          const isHtml = formData.contentFormat === 'html';
                          insertFormatting(isHtml ? '<ol>\n  <li>' : '\n1. ', isHtml ? '</li>\n</ol>\n' : '\n', 'Numbered item');
                        }}
                        title="Numbered List"
                        className="p-1.5 rounded hover:bg-white/10 text-[#AAA] hover:text-white"
                      >
                        <ListOrdered size={15} />
                      </button>

                      {/* Blockquote */}
                      <button
                        type="button"
                        onClick={() => {
                          const isHtml = formData.contentFormat === 'html';
                          insertFormatting(isHtml ? '<blockquote>\n  ' : '\n> ', isHtml ? '\n</blockquote>\n' : '\n', 'Important note or quote');
                        }}
                        title="Blockquote / Callout"
                        className="p-1.5 rounded hover:bg-white/10 text-[#AAA] hover:text-white"
                      >
                        <Quote size={15} />
                      </button>

                      {/* Link */}
                      <button
                        type="button"
                        onClick={() => {
                          const isHtml = formData.contentFormat === 'html';
                          insertFormatting(isHtml ? '<a href="https://www.devencowork.com/">' : '[', isHtml ? '</a>' : '](https://www.devencowork.com/)', 'Link text');
                        }}
                        title="Hyperlink"
                        className="p-1.5 rounded hover:bg-white/10 text-[#AAA] hover:text-white"
                      >
                        <LinkIcon size={15} />
                      </button>

                      <div className="w-[1px] h-4 bg-[#262626] mx-1" />

                      {/* Comparison Table */}
                      <button
                        type="button"
                        onClick={() => {
                          const isHtml = formData.contentFormat === 'html';
                          const table = isHtml
                            ? '\n<table>\n  <thead>\n    <tr><th>Workspace Type</th><th>Best Suited For</th><th>What to Compare</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Hot desk</td><td>Freelancers</td><td>Flexibility & pricing</td></tr>\n    <tr><td>Dedicated desk</td><td>Remote workers</td><td>Storage & hours</td></tr>\n    <tr><td>Private cabin</td><td>Growing teams</td><td>Capacity & privacy</td></tr>\n  </tbody>\n</table>\n'
                            : '\n| Workspace type | Best suited for | What to compare |\n|---|---|---|\n| Hot desk | Freelancers and occasional users | Flexibility, availability, pricing |\n| Dedicated desk | Regular remote workers | Desk assignment, storage, hours |\n| Private cabin | Individuals or teams needing privacy | Capacity, privacy, facilities |\n| Meeting room | Client meetings and team discussions | Hourly rates, booking availability |\n';
                          insertFormatting(table, '', '');
                        }}
                        title="Insert Comparison Table"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-[#AAA] hover:text-[#04B8BB] text-[11px] font-semibold"
                      >
                        <TableIcon size={14} />
                        <span>Table</span>
                      </button>

                      {/* FAQ Section Item */}
                      <button
                        type="button"
                        onClick={() => {
                          const isHtml = formData.contentFormat === 'html';
                          const faq = isHtml
                            ? '\n<div class="faq-item">\n  <h3>Which is the best coworking space in Raipur?</h3>\n  <p>The best coworking space depends on your budget, preferred location, working hours, privacy requirements, and the facilities you need.</p>\n</div>\n'
                            : '\n### Which is the best coworking space in Raipur?\n\nThe best coworking space depends on your budget, preferred location, working hours, privacy requirements, and the facilities you need.\n';
                          insertFormatting(faq, '', '');
                        }}
                        title="Insert FAQ Item"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-[#AAA] hover:text-[#04B8BB] text-[11px] font-semibold"
                      >
                        <HelpCircle size={14} />
                        <span>FAQ</span>
                      </button>

                      {/* Horizontal Rule */}
                      <button
                        type="button"
                        onClick={() => {
                          const isHtml = formData.contentFormat === 'html';
                          insertFormatting(isHtml ? '\n<hr />\n' : '\n---\n', '', '');
                        }}
                        title="Divider (HR)"
                        className="p-1.5 rounded hover:bg-white/10 text-[#AAA] hover:text-white"
                      >
                        <Minus size={15} />
                      </button>
                    </div>

                    <div className="text-[11px] text-[#666] hidden sm:block">
                      {calculateReadingTime(formData.content)} min read · {formData.content.length} chars
                    </div>
                  </div>
                )}

                {/* Editor Body */}
                <div className="bg-[#050505]">
                  {/* EDIT MODE (Single view) */}
                  {activeEditorTab === 'edit' && (
                    <div className="p-3">
                      <textarea
                        ref={contentTextareaRef}
                        rows={16}
                        required
                        value={formData.content}
                        onChange={(e) => {
                          updateField('content', e.target.value);
                          updateField('readingTime', calculateReadingTime(e.target.value));
                        }}
                        placeholder={`Paste complete article from ChatGPT, Markdown, or HTML here...\n\nExample:\n## Why Choose Coworking in Raipur?\nFinding the right workspace can improve productivity and focus.\n\n### 1. Location and Accessibility\nChoose a workspace that is convenient to reach.\n\n- Flexible memberships\n- High-speed internet (500 Mbps)\n- Soundproof cabins\n\n| Workspace | Capacity | Pricing |\n|---|---|---|\n| Hot Desk | 1 Person | Daily / Monthly |\n| Private Cabin | 2-12 Persons | Custom |`}
                        className="w-full p-4 font-mono text-xs sm:text-[13px] bg-[#070708] border border-[#222] rounded-lg text-[#EEE] focus:outline-none focus:border-[#04B8BB] leading-relaxed resize-y min-h-[380px]"
                      />
                      <div className="mt-2 flex items-center justify-between text-[11px] text-[#777]">
                        <p>
                          Supports Markdown (<code>##</code>, <code>-</code>, <code>**bold**</code>, tables <code>|</code>) and plain text with blank lines.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveEditorTab('preview')}
                          className="text-[#04B8BB] hover:underline"
                        >
                          Check Live Preview →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SPLIT VIEW (Side-by-side) */}
                  {activeEditorTab === 'split' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#242424]">
                      {/* Left: Editor */}
                      <div className="p-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#777] mb-1.5 flex items-center justify-between">
                          <span>Source Editor</span>
                          <span>{formData.contentFormat || 'auto'}</span>
                        </div>
                        <textarea
                          ref={contentTextareaRef}
                          rows={20}
                          required
                          value={formData.content}
                          onChange={(e) => {
                            updateField('content', e.target.value);
                            updateField('readingTime', calculateReadingTime(e.target.value));
                          }}
                          className="w-full p-3 font-mono text-xs bg-[#070708] border border-[#222] rounded-lg text-[#EEE] focus:outline-none focus:border-[#04B8BB] leading-relaxed min-h-[460px]"
                        />
                      </div>

                      {/* Right: Live Preview */}
                      <div className="p-4 bg-[#0A0A0C] max-h-[540px] overflow-y-auto">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#04B8BB] mb-3 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#04B8BB]" />
                          Live Output Preview
                        </div>
                        <div
                          className="article-content text-xs"
                          dangerouslySetInnerHTML={{
                            __html: renderArticleContent(formData.content, formData.title, formData.contentFormat || 'auto') ||
                              '<p class="text-[#555] italic">No content yet. Type on the left to see live preview.</p>',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* FULL LIVE PREVIEW */}
                  {activeEditorTab === 'preview' && (
                    <div className="p-6 md:p-8 bg-[#0C0C0E] min-h-[400px] max-h-[650px] overflow-y-auto">
                      {/* Article Header Preview */}
                      <div className="article-reading-column mb-6 pb-6 border-b border-white/[0.08]">
                        <span className="px-2.5 py-1 rounded bg-[#04B8BB]/15 text-[#04B8BB] text-[10px] font-bold uppercase tracking-wider">
                          {formData.category || 'Article Category'}
                        </span>
                        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-3 mb-2 leading-tight">
                          {formData.title || 'Untitled Article'}
                        </h2>
                        {formData.excerpt && (
                          <p className="text-sm text-[#FCFAF9]/75 leading-relaxed">
                            {formData.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-[#FCFAF9]/50 mt-4">
                          <span>{formData.author || 'Deven Co-Work Team'}</span>
                          <span>·</span>
                          <span>{calculateReadingTime(formData.content)} min read</span>
                        </div>
                      </div>

                      {/* Cover Image Preview if present */}
                      {formData.coverImage && (
                        <div className="article-reading-column mb-8 rounded-xl overflow-hidden border border-white/[0.12] aspect-video max-h-[300px]">
                          <img src={formData.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Editorial Article Body */}
                      <div className="article-reading-column">
                        <div
                          className="article-content"
                          dangerouslySetInnerHTML={{
                            __html: renderArticleContent(formData.content, formData.title, formData.contentFormat || 'auto') ||
                              '<p class="text-[#666] italic text-center py-12">No content yet. Switch to "Write & Edit" to write or paste your article.</p>',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#242424] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#333] hover:border-white rounded text-[#AAA] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#04B8BB] text-black font-bold uppercase tracking-wider rounded hover:bg-[#039e9f] transition-colors flex items-center gap-2"
                >
                  <Save size={14} />
                  {saving ? 'Saving...' : editingId ? 'Update Article' : 'Create Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="bg-[#121214] border border-red-500/40 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  Confirm Article Deletion
                </h3>
                <span className="text-[11px] text-[#888]">This action cannot be undone</span>
              </div>
            </div>

            <div className="p-3 bg-[#0A0A0C] border border-[#222] rounded-lg space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-[#666] tracking-wider block">Article Title</span>
              <p className="text-sm font-semibold text-white">
                "{deletingPost.title}"
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#777]">
                <span>/blog/{deletingPost.slug}</span>
                <span>·</span>
                <span className="capitalize">{deletingPost.status}</span>
              </div>
            </div>

            <p className="text-xs text-[#AAA] leading-relaxed">
              Are you sure you want to permanently delete this article? It will be removed from MongoDB, the admin table, and public search engines.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#222]">
              <button
                type="button"
                onClick={() => setDeletingPost(null)}
                className="px-4 py-2 border border-[#333] hover:border-white text-[#CCC] hover:text-white rounded text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 size={13} />
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY MANAGER MODAL */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#121212] border border-[#242424] rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
              <h3 className="font-display text-base font-bold text-white">
                Manage Blog Categories
              </h3>
              <button onClick={() => setCatModalOpen(false)} className="text-[#888] hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Existing Categories List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {categories.map((c) => (
                <div key={c._id} className="flex items-center justify-between p-2.5 bg-[#0A0A0A] border border-[#222] rounded text-xs">
                  <div>
                    <span className="font-semibold text-white">{c.name}</span>
                    <span className="text-[10px] text-[#666] ml-2">({c.postCount || 0} articles)</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(c._id, c.name)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Delete Category"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Category Form */}
            <form onSubmit={handleSaveCategory} className="pt-3 border-t border-[#242424] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#04B8BB] block">
                Add New Category
              </span>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category Name (e.g. Raipur Startups)"
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-xs text-white focus:outline-none focus:border-[#04B8BB]"
              />
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Optional short description..."
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-xs text-white focus:outline-none focus:border-[#04B8BB]"
              />
              <button
                type="submit"
                disabled={savingCat}
                className="w-full py-2 bg-[#04B8BB] text-black font-bold text-xs uppercase tracking-wider rounded hover:bg-[#039e9f] transition-colors"
              >
                {savingCat ? 'Saving...' : 'Add Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
