import { useEffect, useState, useMemo } from 'react';
import { Link } from 'wouter';
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  Users,
  ArrowRight,
  ExternalLink,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  Image as ImageIcon
} from 'lucide-react';
import {
  Header,
  Footer,
  WhatsAppFloat,
  defaultContent,
  mergeContent
} from '@/App';
import TourBookingModal from '@/components/TourBookingModal';
import { api } from '@/services/api';

const EVENT_CATEGORIES = ['All', 'Workshop', 'Founder Meetup', 'Networking', 'Community', 'Talk', 'Other'];

function formatEventDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatEventTime(startString, endString) {
  if (!startString) return '';
  const start = new Date(startString);
  const startTime = start.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (!endString) return startTime;
  const end = new Date(endString);
  const endTime = end.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${startTime} – ${endTime}`;
}

export default function EventsPage() {
  const [content, setContent] = useState(defaultContent);
  const [events, setEvents] = useState({ upcoming: [], past: [], featuredEvent: null });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'

  // Load CMS data & SEO metadata
  useEffect(() => {
    document.title = "Startup Events in Raipur | Founder Meetups & Workshops | Deven Co-Work";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Discover upcoming startup events in Raipur at Deven Co-Work, Shankar Nagar. Connect at founder meetups, networking sessions, AI workshops, and community masterclasses.");
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', "https://www.devencowork.com/events");
    }

    if (typeof window !== 'undefined' && window.__INITIAL_CMS_DATA__) {
      setContent(mergeContent(defaultContent, window.__INITIAL_CMS_DATA__));
    } else {
      api.fetchPublishedContent()
        .then((res) => {
          if (res?.success && res.data) {
            setContent(mergeContent(defaultContent, res.data));
          }
        })
        .catch((err) => console.error('Failed to load CMS content for events page:', err));
    }
  }, []);

  // Fetch published events
  useEffect(() => {
    setLoading(true);
    api.fetchEvents()
      .then((res) => {
        if (res?.success) {
          setEvents({
            upcoming: res.upcoming || [],
            past: res.past || [],
            featuredEvent: res.featuredEvent || null,
          });
        }
      })
      .catch((err) => console.error('Failed to load events:', err))
      .finally(() => setLoading(false));
  }, []);

  // Filter events by category
  const filteredUpcoming = useMemo(() => {
    if (selectedCategory === 'All') return events.upcoming;
    return events.upcoming.filter((e) => e.category === selectedCategory);
  }, [events.upcoming, selectedCategory]);

  const filteredPast = useMemo(() => {
    if (selectedCategory === 'All') return events.past;
    return events.past.filter((e) => e.category === selectedCategory);
  }, [events.past, selectedCategory]);

  const scrollToUpcoming = () => {
    const el = document.getElementById('upcoming-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="site-noise min-h-screen bg-[#0C0C0C] text-[#FCFAF9]">
      <div className="sticky top-0 z-40 w-full">
        <Header onReserve={() => setTourModalOpen(true)} content={content} cmsLoaded={true} cmsFailed={false} />
      </div>

      <main>
        {/* A. Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-[rgba(252,250,249,0.08)]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#04B8BB]/10 via-transparent to-transparent pointer-events-none" />
          <div className="container-wide relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#04B8BB]/30 bg-[#04B8BB]/10 text-[#04B8BB] text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>THE DEVEN COMMUNITY</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FCFAF9] leading-[1.1] mb-6">
                Startup Events, Founder Meetups & Workshops in Raipur
              </h1>
              <p className="text-base sm:text-lg text-[#FCFAF9]/75 leading-relaxed mb-8">
                Deven Co-Work hosts workshops, founder roundtables, book reads, and AI sessions in Raipur. We build spaces where ambitious professionals connect, share lessons, and help each other grow.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={scrollToUpcoming}
                  className="px-6 py-3.5 bg-[#04B8BB] text-black font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#039e9f] transition-colors inline-flex items-center gap-2 shadow-lg shadow-[#04B8BB]/20"
                >
                  Explore Upcoming Events
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  href="/pricing"
                  className="px-6 py-3.5 border border-[rgba(252,250,249,0.2)] bg-[#141414] text-[#FCFAF9] font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#1f1f1f] hover:border-[#04B8BB] transition-colors"
                >
                  Become a Member
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* B. Featured Event Section (Only if published featured event exists) */}
        {events.featuredEvent && (
          <section className="py-12 md:py-16 border-b border-[rgba(252,250,249,0.08)] bg-[#0F0F10]">
            <div className="container-wide">
              <div className="flex items-center gap-2 mb-6 text-[#04B8BB] text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#04B8BB] animate-pulse" />
                <span>Featured Community Event</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#151516] border border-[#04B8BB]/30 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl">
                {events.featuredEvent.coverImage && (
                  <div className="lg:col-span-6 rounded-xl overflow-hidden aspect-video bg-[#0A0A0A] border border-[rgba(252,250,249,0.1)]">
                    <img
                      src={typeof events.featuredEvent.coverImage === 'string' ? events.featuredEvent.coverImage : events.featuredEvent.coverImage.url}
                      alt={events.featuredEvent.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className={events.featuredEvent.coverImage ? 'lg:col-span-6' : 'lg:col-span-12'}>
                  <div className="inline-block px-3 py-1 rounded bg-[#04B8BB]/20 text-[#04B8BB] text-xs font-semibold uppercase tracking-wider mb-3">
                    {events.featuredEvent.category}
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FCFAF9] mb-4">
                    {events.featuredEvent.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[#FCFAF9]/70 leading-relaxed mb-6">
                    {events.featuredEvent.excerpt}
                  </p>

                  <div className="space-y-2.5 mb-8 text-xs sm:text-sm text-[#FCFAF9]/80">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-[#04B8BB] shrink-0" />
                      <span>{formatEventDate(events.featuredEvent.startAt)}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#04B8BB] shrink-0" />
                      <span>{formatEventTime(events.featuredEvent.startAt, events.featuredEvent.endAt)}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-[#04B8BB] shrink-0" />
                      <span>{events.featuredEvent.location}</span>
                    </div>
                    {events.featuredEvent.price && (
                      <div className="flex items-center gap-2.5">
                        <Tag className="w-4 h-4 text-[#04B8BB] shrink-0" />
                        <span>Admission: <strong className="text-white">{events.featuredEvent.price}</strong></span>
                      </div>
                    )}
                  </div>

                  <div>
                    {events.featuredEvent.registrationUrl ? (
                      <a
                        href={events.featuredEvent.registrationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#04B8BB] text-black font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg hover:bg-[#039e9f] transition-colors"
                      >
                        {events.featuredEvent.registrationCtaLabel || 'Register Now'}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <button
                        onClick={() => setTourModalOpen(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#04B8BB] text-black font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg hover:bg-[#039e9f] transition-colors"
                      >
                        Register with Community Desk
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab & Filter Bar */}
        <div id="upcoming-section" className="py-8 border-b border-[rgba(252,250,249,0.08)] sticky top-[60px] z-20 bg-[#0C0C0C]/95 backdrop-blur-md">
          <div className="container-wide flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Upcoming vs Past Toggle */}
            <div className="flex items-center p-1 bg-[#18181A] rounded-lg border border-[rgba(252,250,249,0.12)]">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  activeTab === 'upcoming'
                    ? 'bg-[#04B8BB] text-black shadow'
                    : 'text-[#FCFAF9]/60 hover:text-white'
                }`}
              >
                Upcoming Events ({events.upcoming.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  activeTab === 'past'
                    ? 'bg-[#04B8BB] text-black shadow'
                    : 'text-[#FCFAF9]/60 hover:text-white'
                }`}
              >
                Past Events Archive ({events.past.length})
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#FCFAF9] text-black'
                      : 'bg-[#18181A] text-[#FCFAF9]/60 hover:text-white border border-[rgba(252,250,249,0.08)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* C. Upcoming Events Section */}
        {activeTab === 'upcoming' && (
          <section className="py-16 md:py-20">
            <div className="container-wide">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FCFAF9]">
                    Upcoming Calendar
                  </h2>
                  <p className="text-xs sm:text-sm text-[#FCFAF9]/60 mt-1">
                    Showing scheduled community workshops and meetups in Raipur.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="py-20 text-center text-[#FCFAF9]/60">
                  <div className="inline-block w-8 h-8 border-2 border-[#04B8BB] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm">Loading upcoming events...</p>
                </div>
              ) : filteredUpcoming.length === 0 ? (
                <div className="py-16 px-6 text-center rounded-2xl border border-[rgba(252,250,249,0.1)] bg-[#121213] max-w-2xl mx-auto">
                  <Calendar className="w-12 h-12 text-[#04B8BB] mx-auto mb-4 opacity-80" />
                  <h3 className="font-display text-xl font-bold text-[#FCFAF9] mb-2">
                    No Upcoming Events Scheduled Right Now
                  </h3>
                  <p className="text-sm text-[#FCFAF9]/65 leading-relaxed mb-6">
                    We host monthly founder meetups, educational roundtables, and workshops. Check back soon or message our community manager to be notified when registrations open.
                  </p>
                  <button
                    onClick={() => setTourModalOpen(true)}
                    className="px-5 py-2.5 bg-[#04B8BB] text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#039e9f] transition-colors"
                  >
                    Join Founder WhatsApp Group
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUpcoming.map((event) => (
                    <article
                      key={event._id || event.slug}
                      className="flex flex-col bg-[#141416] border border-[rgba(252,250,249,0.1)] rounded-xl overflow-hidden hover:border-[#04B8BB]/50 transition-all duration-200 group"
                    >
                      {/* Cover Thumbnail */}
                      <div className="relative aspect-[16/9] bg-[#0A0A0A] overflow-hidden">
                        {event.coverImage ? (
                          <img
                            src={typeof event.coverImage === 'string' ? event.coverImage : event.coverImage.url}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1C1C1E] to-[#0A0A0A] text-[#04B8BB]">
                            <Calendar className="w-10 h-10 opacity-30" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[#04B8BB] text-[11px] font-bold uppercase tracking-wider border border-white/10">
                          {event.category}
                        </div>
                        {event.price && (
                          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold">
                            {event.price}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="space-y-1.5 text-xs text-[#FCFAF9]/70 mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#04B8BB] shrink-0" />
                              <span className="font-medium text-[#FCFAF9]">{formatEventDate(event.startAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-[#04B8BB] shrink-0" />
                              <span>{formatEventTime(event.startAt, event.endAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-[#04B8BB] shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>

                          <h3 className="font-display text-lg font-bold text-[#FCFAF9] leading-snug mb-2 group-hover:text-[#04B8BB] transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#FCFAF9]/65 line-clamp-3 leading-relaxed mb-4">
                            {event.excerpt}
                          </p>

                          {/* Speakers */}
                          {event.speakers && event.speakers.length > 0 && (
                            <div className="pt-3 border-t border-[rgba(252,250,249,0.08)] mb-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#FCFAF9]/40 mb-1.5">
                                Speaker / Host
                              </p>
                              <div className="flex items-center gap-2">
                                {event.speakers[0].avatar ? (
                                  <img
                                    src={event.speakers[0].avatar}
                                    alt={event.speakers[0].name}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-[#04B8BB]/20 flex items-center justify-center text-[10px] font-bold text-[#04B8BB]">
                                    {event.speakers[0].name.charAt(0)}
                                  </div>
                                )}
                                <div className="text-xs text-[#FCFAF9]">
                                  <span className="font-semibold">{event.speakers[0].name}</span>
                                  {event.speakers[0].role && (
                                    <span className="text-[#FCFAF9]/50 ml-1">· {event.speakers[0].role}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* CTA */}
                        <div className="pt-4 border-t border-[rgba(252,250,249,0.08)] mt-auto">
                          {event.registrationDeadline && new Date() > new Date(event.registrationDeadline) ? (
                            <span className="text-xs font-semibold text-amber-400">
                              Registration Closed
                            </span>
                          ) : event.registrationUrl ? (
                            <a
                              href={event.registrationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#04B8BB] text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#039e9f] transition-colors"
                            >
                              {event.registrationCtaLabel || 'Register Now'}
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <button
                              onClick={() => setTourModalOpen(true)}
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#04B8BB] text-[#04B8BB] hover:bg-[#04B8BB] hover:text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
                            >
                              Reserve Via Desk
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* D. Past Events Section */}
        {activeTab === 'past' && (
          <section className="py-16 md:py-20">
            <div className="container-wide">
              <div className="mb-8">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FCFAF9]">
                  Past Events & Community Archive
                </h2>
                <p className="text-xs sm:text-sm text-[#FCFAF9]/60 mt-1">
                  Recaps and memories from our previous sessions at Deven Co-Work.
                </p>
              </div>

              {loading ? (
                <div className="py-20 text-center text-[#FCFAF9]/60">
                  <div className="inline-block w-8 h-8 border-2 border-[#04B8BB] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm">Loading archive...</p>
                </div>
              ) : filteredPast.length === 0 ? (
                <div className="py-16 px-6 text-center rounded-2xl border border-[rgba(252,250,249,0.1)] bg-[#121213] max-w-2xl mx-auto">
                  <p className="text-sm text-[#FCFAF9]/65">
                    No past events match the selected category.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPast.map((event) => (
                    <article
                      key={event._id || event.slug}
                      className="flex flex-col bg-[#141416] border border-[rgba(252,250,249,0.08)] rounded-xl overflow-hidden"
                    >
                      {event.coverImage && (
                        <div className="aspect-[16/9] bg-[#0A0A0A] overflow-hidden">
                          <img
                            src={typeof event.coverImage === 'string' ? event.coverImage : event.coverImage.url}
                            alt={event.title}
                            className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-[#FCFAF9]/50 mb-2">
                            <span>{formatEventDate(event.startAt)}</span>
                            <span>·</span>
                            <span className="text-[#04B8BB]">{event.category}</span>
                          </div>
                          <h3 className="font-display text-base sm:text-lg font-bold text-[#FCFAF9] mb-2">
                            {event.title}
                          </h3>
                          <p className="text-xs text-[#FCFAF9]/65 leading-relaxed mb-4">
                            {event.recap || event.excerpt}
                          </p>

                          {event.gallery && event.gallery.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[rgba(252,250,249,0.08)]">
                              <p className="text-[10px] uppercase font-bold text-[#FCFAF9]/40 tracking-wider mb-2 flex items-center gap-1.5">
                                <ImageIcon className="w-3 h-3 text-[#04B8BB]" />
                                Event Photos ({event.gallery.length})
                              </p>
                              <div className="flex gap-2 overflow-x-auto pb-1">
                                {event.gallery.slice(0, 4).map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img.url}
                                    alt={img.alt || `Event photo ${idx + 1}`}
                                    className="w-12 h-12 rounded object-cover shrink-0 border border-white/10"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="pt-3 border-t border-[rgba(252,250,249,0.08)] mt-4">
                          <span className="text-[11px] font-semibold text-[#FCFAF9]/50 uppercase tracking-wider">
                            Event Completed
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* E. Community CTA Section */}
        <section className="py-16 md:py-24 border-t border-[rgba(252,250,249,0.08)] bg-gradient-to-b from-[#0F0F10] to-[#0C0C0C]">
          <div className="container-wide text-center max-w-3xl mx-auto">
            <span className="text-[#04B8BB] text-xs font-bold uppercase tracking-wider mb-3 block">
              JOIN RAIPUR'S FOUNDER NETWORK
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FCFAF9] tracking-tight mb-4">
              Build Something With Us.
            </h2>
            <p className="text-sm sm:text-base text-[#FCFAF9]/70 leading-relaxed mb-8 max-w-xl mx-auto">
              Members get priority access to all community workshops, founder dinners, book sessions, and private masterminds. Join Raipur's most energizing workspace.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/pricing"
                className="px-6 py-3.5 bg-[#04B8BB] text-black font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#039e9f] transition-colors"
              >
                Explore Memberships
              </Link>
              <button
                onClick={() => setTourModalOpen(true)}
                className="px-6 py-3.5 border border-[rgba(252,250,249,0.2)] bg-[#18181A] text-[#FCFAF9] font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#202022] hover:border-[#04B8BB] transition-colors"
              >
                Book a Free Workspace Tour
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer footer={content?.footer} globalSettings={content?.globalSettings} cmsLoaded={true} cmsFailed={false} />
      <WhatsAppFloat whatsapp={content?.footer?.whatsapp || content?.globalSettings?.whatsapp} message="Hi! I want to inquire about upcoming events at Deven Co-Work" cmsLoaded={true} cmsFailed={false} />
      <TourBookingModal isOpen={tourModalOpen} onClose={() => setTourModalOpen(false)} />
    </div>
  );
}
