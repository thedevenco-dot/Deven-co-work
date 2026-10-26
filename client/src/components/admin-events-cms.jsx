import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  X,
  ExternalLink,
  Star,
  Users,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const EVENT_CATEGORIES = ['Workshop', 'Founder Meetup', 'Networking', 'Community', 'Talk', 'Other'];

export default function AdminEventsCMS({ onOpenMediaLibrary }) {
  const { toast } = useToast();

  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, upcoming: 0, past: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [timeframeFilter, setTimeframeFilter] = useState('All');

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form Data
  const initialForm = {
    title: '',
    slug: '',
    excerpt: '',
    description: '',
    coverImage: '',
    gallery: [],
    category: 'Community',
    location: 'Deven Co-Work, VIP Estate, Shankar Nagar, Raipur',
    startAt: '',
    endAt: '',
    registrationUrl: '',
    registrationCtaLabel: 'Register Now',
    registrationDeadline: '',
    price: 'Free',
    capacity: 0,
    organizer: 'Deven Co-Work',
    featured: false,
    status: 'draft',
    recap: '',
    seoTitle: '',
    seoDescription: '',
    socialImage: '',
    speakerName: '',
    speakerRole: '',
    speakerCompany: '',
    speakerAvatar: '',
  };

  const [formData, setFormData] = useState(initialForm);

  // Fetch events list and stats
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.fetchAdminEvents({
        search,
        status: statusFilter,
        category: categoryFilter,
        timeframe: timeframeFilter,
      });
      if (res.success) {
        setEvents(res.data || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      toast({
        title: 'Failed to load events',
        description: err.message || 'Server error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, timeframeFilter, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingId(null);
    setFormError('');
    setFormData(initialForm);
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (event) => {
    setEditingId(event._id);
    setFormError('');

    // Format ISO string to datetime-local input string YYYY-MM-DDTHH:MM
    const toInputDate = (d) => {
      if (!d) return '';
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? '' : dt.toISOString().slice(0, 16);
    };

    const firstSpeaker = event.speakers?.[0] || {};

    setFormData({
      title: event.title || '',
      slug: event.slug || '',
      excerpt: event.excerpt || '',
      description: event.description || '',
      coverImage: typeof event.coverImage === 'string' ? event.coverImage : event.coverImage?.url || '',
      gallery: event.gallery || [],
      category: event.category || 'Community',
      location: event.location || 'Deven Co-Work, VIP Estate, Shankar Nagar, Raipur',
      startAt: toInputDate(event.startAt),
      endAt: toInputDate(event.endAt),
      registrationUrl: event.registrationUrl || '',
      registrationCtaLabel: event.registrationCtaLabel || 'Register Now',
      registrationDeadline: toInputDate(event.registrationDeadline),
      price: event.price || 'Free',
      capacity: event.capacity || 0,
      organizer: event.organizer || 'Deven Co-Work',
      featured: Boolean(event.featured),
      status: event.status || 'draft',
      recap: event.recap || '',
      seoTitle: event.seoTitle || '',
      seoDescription: event.seoDescription || '',
      socialImage: event.socialImage || '',
      speakerName: firstSpeaker.name || '',
      speakerRole: firstSpeaker.role || '',
      speakerCompany: firstSpeaker.company || '',
      speakerAvatar: firstSpeaker.avatar || '',
    });
    setModalOpen(true);
  };

  // Handle Form Change
  const updateField = (key, val) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: val };
      // Auto-generate slug when title changes in create mode
      if (key === 'title' && !editingId && (!prev.slug || prev.slug === slugify(prev.title))) {
        next.slug = slugify(val);
      }
      return next;
    });
  };

  // Auto-slugify helper
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

  // Handle Save (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Please enter an event title.');
      return;
    }
    if (!formData.slug.trim()) {
      setFormError('Please enter a unique URL slug.');
      return;
    }
    if (!formData.excerpt.trim()) {
      setFormError('Please enter a short excerpt description.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Please enter full event details.');
      return;
    }
    if (!formData.startAt) {
      setFormError('Please specify start date and time.');
      return;
    }
    if (!formData.endAt) {
      setFormError('Please specify end date and time.');
      return;
    }

    if (new Date(formData.endAt) < new Date(formData.startAt)) {
      setFormError('End time cannot precede start time.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        excerpt: formData.excerpt.trim(),
        description: formData.description,
        coverImage: formData.coverImage,
        gallery: formData.gallery,
        category: formData.category,
        location: formData.location.trim(),
        startAt: new Date(formData.startAt),
        endAt: new Date(formData.endAt),
        registrationUrl: formData.registrationUrl.trim(),
        registrationCtaLabel: formData.registrationCtaLabel.trim(),
        registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline) : null,
        price: formData.price.trim(),
        capacity: Number(formData.capacity) || 0,
        organizer: formData.organizer.trim(),
        featured: formData.featured,
        status: formData.status,
        recap: formData.recap,
        seoTitle: formData.seoTitle.trim(),
        seoDescription: formData.seoDescription.trim(),
        socialImage: formData.socialImage,
        speakers: formData.speakerName.trim() ? [{
          name: formData.speakerName.trim(),
          role: formData.speakerRole.trim(),
          company: formData.speakerCompany.trim(),
          avatar: formData.speakerAvatar.trim(),
        }] : [],
      };

      if (editingId) {
        await api.updateEvent(editingId, payload);
        toast({ title: 'Event Updated', description: `"${formData.title}" has been saved.` });
      } else {
        await api.createEvent(payload);
        toast({ title: 'Event Created', description: `"${formData.title}" was added.` });
      }

      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      setFormError(err.message || 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle publish / unpublish
  const handleTogglePublish = async (event) => {
    const nextStatus = event.status === 'published' ? 'draft' : 'published';
    try {
      await api.togglePublishEvent(event._id, nextStatus);
      toast({
        title: nextStatus === 'published' ? 'Event Published' : 'Event Unpublished',
        description: `"${event.title}" is now ${nextStatus}.`,
      });
      fetchEvents();
    } catch (err) {
      toast({
        title: 'Status Change Failed',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  // Delete Event
  const handleDelete = async () => {
    if (!deletingEvent) return;
    setDeleting(true);
    try {
      await api.deleteEvent(deletingEvent._id);
      toast({
        title: 'Event Deleted',
        description: `"${deletingEvent.title}" has been deleted.`,
      });
      setDeletingEvent(null);
      fetchEvents();
    } catch (err) {
      toast({
        title: 'Delete Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#04B8BB]">
            <span className="w-2 h-2 rounded-full bg-[#04B8BB]" />
            COMMUNITY & ACTIVITIES
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#F1F1F1]">
            Events CMS Management
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            Create, schedule, publish, and recap community meetups, workshops, and founder sessions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#04B8BB] text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#039e9f] transition-colors shadow"
        >
          <Plus size={16} /> Create Event
        </button>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="border border-[#242424] bg-[#0A0A0A] p-4 rounded-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3]">Total Events</span>
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
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#22c55e]">Upcoming</span>
          <p className="text-2xl sm:text-3xl font-display font-bold text-[#22c55e] mt-1">{stats.upcoming}</p>
        </div>
        <div className="border border-[#242424] bg-[#0A0A0A] p-4 rounded-lg col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3]">Past Archive</span>
          <p className="text-2xl sm:text-3xl font-display font-bold text-[#888] mt-1">{stats.past}</p>
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
            placeholder="Search by event title, location, organizer..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#121212] border border-[#242424] rounded text-[#A3A3A3] focus:outline-none focus:border-[#04B8BB]"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>

          {/* Timeframe Filter */}
          <select
            value={timeframeFilter}
            onChange={(e) => setTimeframeFilter(e.target.value)}
            className="px-3 py-2 bg-[#121212] border border-[#242424] rounded text-[#A3A3A3] focus:outline-none focus:border-[#04B8BB]"
          >
            <option value="All">All Dates</option>
            <option value="upcoming">Upcoming Only</option>
            <option value="past">Past Events Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#121212] border border-[#242424] rounded text-[#A3A3A3] focus:outline-none focus:border-[#04B8BB]"
          >
            <option value="All">All Categories</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="border border-[#242424] bg-[#0A0A0A] rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-[#555] text-xs">
            <div className="inline-block w-6 h-6 border-2 border-[#04B8BB] border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center text-[#555] text-xs">
            <Calendar size={28} className="mx-auto mb-2 opacity-40 text-[#04B8BB]" />
            <p className="font-semibold text-white">No Events Found</p>
            <p className="mt-1">Create your first community event to display it publicly on /events.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121212] text-[#A3A3A3] uppercase tracking-wider border-b border-[#242424] text-[10px]">
                <tr>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {events.map((ev) => {
                  const isPast = new Date(ev.endAt || ev.startAt) < new Date();
                  const coverUrl = typeof ev.coverImage === 'string' ? ev.coverImage : ev.coverImage?.url;

                  return (
                    <tr key={ev._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded bg-[#1A1A1A] overflow-hidden shrink-0 border border-[#2A2A2A]">
                            {coverUrl ? (
                              <img src={coverUrl} alt={ev.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#444]">
                                <Calendar size={14} />
                              </div>
                            )}
                          </div>
                          <div className="max-w-xs sm:max-w-sm">
                            <span className="font-semibold text-white truncate block hover:text-[#04B8BB]">
                              {ev.title}
                            </span>
                            <span className="text-[10px] text-[#777] truncate block">
                              /events/slug/{ev.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[10px] font-medium text-[#BBB]">
                          {ev.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-[#AAA]">
                        <div>{new Date(ev.startAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-[10px] text-[#666]">
                          {isPast ? <span className="text-amber-500/80">Completed</span> : <span className="text-emerald-400">Upcoming</span>}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {ev.status === 'published' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Draft
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {ev.featured ? (
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                        ) : (
                          <span className="text-[#444]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-[11px] text-[#666]">
                        {new Date(ev.updatedAt || ev.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Publish */}
                          <button
                            onClick={() => handleTogglePublish(ev)}
                            title={ev.status === 'published' ? 'Unpublish Event' : 'Publish Event'}
                            className="p-1.5 text-[#AAA] hover:text-white hover:bg-white/[0.08] rounded"
                          >
                            {ev.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(ev)}
                            title="Edit Event"
                            className="p-1.5 text-[#AAA] hover:text-[#04B8BB] hover:bg-white/[0.08] rounded"
                          >
                            <Edit3 size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeletingEvent(ev)}
                            title="Delete Event"
                            className="p-1.5 text-[#AAA] hover:text-red-400 hover:bg-white/[0.08] rounded"
                          >
                            <Trash2 size={14} />
                          </button>
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

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-[#242424] rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#242424] flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  {editingId ? 'Edit Event' : 'Create New Community Event'}
                </h3>
                <p className="text-xs text-[#777] mt-0.5">
                  Published events appear instantly in the Upcoming or Past sections on /events.
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#888] hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
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
                    Event Title <span className="text-[#04B8BB]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g. Founder AMA: Scaling from 0 to 1 in Raipur"
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
                    placeholder="e.g. founder-ama-scaling-0-to-1"
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                  />
                </div>
              </div>

              {/* Category, Status & Featured Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                    Category <span className="text-[#04B8BB]">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                    Publication Status <span className="text-[#04B8BB]">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => updateField('status', e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                  >
                    <option value="draft">Draft (Hidden from public)</option>
                    <option value="published">Published (Live on /events)</option>
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
                      Featured Event Banner
                    </span>
                  </label>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                    Start Date & Time <span className="text-[#04B8BB]">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startAt}
                    onChange={(e) => updateField('startAt', e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                    End Date & Time <span className="text-[#04B8BB]">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endAt}
                    onChange={(e) => updateField('endAt', e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                  />
                </div>
              </div>

              {/* Location, Price, Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                    Location / Venue <span className="text-[#04B8BB]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                    Price / Entry
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    placeholder="e.g. Free or ₹499"
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                  />
                </div>
              </div>

              {/* Excerpt (Short description) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                  Short Description (Card Excerpt) <span className="text-[#04B8BB]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.excerpt}
                  onChange={(e) => updateField('excerpt', e.target.value)}
                  placeholder="A concise 1-2 sentence preview for the event card..."
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                  Full Description & Agenda <span className="text-[#04B8BB]">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Detailed breakdown of the session, who it's for, and takeaways..."
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                />
              </div>

              {/* Cover Image */}
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

              {/* Registration Settings */}
              <div className="p-4 border border-[#242424] bg-[#0A0A0A] rounded-lg space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#04B8BB] block">
                  Registration & Contact Link
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold uppercase text-[#888] mb-1">
                      Registration Link (URL / WhatsApp / External)
                    </label>
                    <input
                      type="text"
                      value={formData.registrationUrl}
                      onChange={(e) => updateField('registrationUrl', e.target.value)}
                      placeholder="https://forms.gle/... or https://wa.me/..."
                      className="w-full px-3 py-2 bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-[#888] mb-1">
                      CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={formData.registrationCtaLabel}
                      onChange={(e) => updateField('registrationCtaLabel', e.target.value)}
                      placeholder="Register Now"
                      className="w-full px-3 py-2 bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                    />
                  </div>
                </div>
              </div>

              {/* Speaker / Host Information */}
              <div className="p-4 border border-[#242424] bg-[#0A0A0A] rounded-lg space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#04B8BB] block">
                  Speaker / Host Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-[#888] mb-1">
                      Speaker Name
                    </label>
                    <input
                      type="text"
                      value={formData.speakerName}
                      onChange={(e) => updateField('speakerName', e.target.value)}
                      placeholder="e.g. Ankit Rathore"
                      className="w-full px-3 py-2 bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-[#888] mb-1">
                      Role & Organization
                    </label>
                    <input
                      type="text"
                      value={formData.speakerRole}
                      onChange={(e) => updateField('speakerRole', e.target.value)}
                      placeholder="e.g. Founder & Tech Lead"
                      className="w-full px-3 py-2 bg-[#121212] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                    />
                  </div>
                </div>
              </div>

              {/* Event Recap (for Past Events) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#AAA] mb-1.5">
                  Event Recap & Key Highlights (Displayed when event has completed)
                </label>
                <textarea
                  rows={3}
                  value={formData.recap}
                  onChange={(e) => updateField('recap', e.target.value)}
                  placeholder="Summary of what happened, attendance, and key takeaways..."
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded text-white focus:outline-none focus:border-[#04B8BB]"
                />
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
                  {saving ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#121212] border border-red-500/30 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-red-400">
              Confirm Event Deletion
            </h3>
            <p className="text-xs text-[#AAA] leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">"{deletingEvent.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingEvent(null)}
                className="px-4 py-2 border border-[#333] text-[#AAA] hover:text-white rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
