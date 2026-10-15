import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  Users,
  Building,
  Navigation,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  Header,
  Footer,
  Pricing,
  ValueStack,
  defaultContent,
  getInitialCmsData,
  mergeContent
} from '@/App';
import TourBookingModal from '@/components/TourBookingModal';
import OfficeCostCalculator from '@/components/OfficeCostCalculator';
import { api } from '@/services/api';
import { trackPixelEvent } from '@/lib/metaPixel';
import { SITE, PAGES } from '@/content/pages';

function ContactSection({ utm, mapsEmbedSrc }) {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    numberOfPeople: '1',
    preferredDate: '',
    preferredTime: 'Morning (10 AM - 1 PM)',
    message: '',
    email_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    const cleanPhone = form.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        numberOfPeople: parseInt(form.numberOfPeople, 10) || 1,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        message: form.message.trim(),
        email_confirm: form.email_confirm || '',
        utmSource: utm?.source || '',
        utmMedium: utm?.medium || '',
        utmCampaign: utm?.campaign || '',
      };

      const res = await api.bookTour(payload);

      if (res.success && res.data) {
        trackPixelEvent('Lead', { content_name: 'trial_booked' });
        trackPixelEvent('Schedule');

        localStorage.setItem(
          'last_reservation',
          JSON.stringify({
            ...res.data,
            type: 'TOUR',
          })
        );

        sessionStorage.setItem('tourPopupShown', 'true');
        setLocation('/thank-you');
      } else {
        setError(res.message || 'Could not submit tour request. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Unable to complete request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const todayStr = typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '';

  return (
    <section className="py-14 sm:py-20 border-b border-[rgba(252,250,249,0.12)]">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-xl border border-[rgba(252,250,249,0.12)] bg-[#0F0F10]">
              <div className="section-label mb-3 text-[#04B8BB] font-black">DIRECT CONTACT</div>
              <h2 className="font-display text-2xl font-bold text-[#FCFAF9] uppercase tracking-tight mb-6">
                Connect With Our Team
              </h2>

              <div className="space-y-6 text-sm text-[#FCFAF9]/85">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-[#04B8BB] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#FCFAF9] font-medium mb-1">Office Address</strong>
                    <p className="leading-relaxed text-[#FCFAF9]/75">{SITE.address}</p>
                    <a
                      href={SITE.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#04B8BB] hover:underline mt-2 font-medium"
                    >
                      <span>Get Directions on Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-[rgba(252,250,249,0.08)]">
                  <Clock className="w-5 h-5 text-[#04B8BB] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#FCFAF9] font-medium mb-1">Operating Hours</strong>
                    <p className="text-[#FCFAF9]/75">Monday to Saturday: 9:00 AM – 9:00 PM</p>
                    <p className="text-xs text-[#FCFAF9]/50 mt-0.5">Sunday: Closed for routine maintenance</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-[rgba(252,250,249,0.08)]">
                  <Phone className="w-5 h-5 text-[#04B8BB] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#FCFAF9] font-medium mb-1">Phone Call</strong>
                    <a
                      href={`tel:${SITE.phoneTel}`}
                      onClick={() => trackPixelEvent('Contact', { content_name: 'call_click' })}
                      className="text-[#04B8BB] hover:underline text-base font-semibold"
                    >
                      {SITE.phone}
                    </a>
                    <p className="text-xs text-[#FCFAF9]/50 mt-0.5">Immediate assistance during business hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-[rgba(252,250,249,0.08)]">
                  <MessageCircle className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#FCFAF9] font-medium mb-1">WhatsApp Chat</strong>
                    <a
                      href={SITE.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackPixelEvent('Contact', { content_name: 'whatsapp_click' })}
                      className="text-[#25D366] hover:underline font-semibold"
                    >
                      Chat on WhatsApp (+91 62605 82852)
                    </a>
                    <p className="text-xs text-[#FCFAF9]/50 mt-0.5">Quick questions on pricing & availability</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-[rgba(252,250,249,0.08)]">
                  <Mail className="w-5 h-5 text-[#04B8BB] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#FCFAF9] font-medium mb-1">Email Inquiries</strong>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="text-[#04B8BB] hover:underline"
                    >
                      {SITE.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Responsive Map Embed */}
            {mapsEmbedSrc && (
              <div className="rounded-xl border border-[rgba(252,250,249,0.12)] overflow-hidden h-[240px] sm:h-[280px] bg-[#111]">
                <iframe
                  title="Deven Co-Work Location Map"
                  src={mapsEmbedSrc}
                  className="w-full h-full border-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>

          {/* In-Page Tour Booking Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-10 rounded-xl border border-[rgba(252,250,249,0.12)] bg-[#0F0F10]">
              <div className="section-label mb-3 text-[#04B8BB] font-black">SCHEDULE A VISIT</div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FCFAF9] uppercase tracking-tight mb-3">
                Book Your Guided Workspace Tour
              </h2>
              <p className="text-sm text-[#FCFAF9]/70 mb-8 leading-relaxed">
                Experience Raipur's premier founder workspace in person. Take a guided walkthrough of our desks, private cabins, meeting room, and podcast studio. Includes your complimentary 2-day pass.
              </p>

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  type="text"
                  name="email_confirm"
                  value={form.email_confirm}
                  onChange={(e) => updateField('email_confirm', e.target.value)}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#FCFAF9]/70 mb-2">
                      Full Name <span className="text-[#04B8BB]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-3 bg-[#18181A] border border-[rgba(252,250,249,0.16)] rounded-lg text-sm text-[#FCFAF9] placeholder-[#FCFAF9]/30 focus:outline-none focus:border-[#04B8BB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#FCFAF9]/70 mb-2">
                      Phone Number <span className="text-[#04B8BB]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full px-4 py-3 bg-[#18181A] border border-[rgba(252,250,249,0.16)] rounded-lg text-sm text-[#FCFAF9] placeholder-[#FCFAF9]/30 focus:outline-none focus:border-[#04B8BB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#FCFAF9]/70 mb-2">
                      Email Address <span className="text-[#04B8BB]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="you@company.com"
                      className="w-full px-4 py-3 bg-[#18181A] border border-[rgba(252,250,249,0.16)] rounded-lg text-sm text-[#FCFAF9] placeholder-[#FCFAF9]/30 focus:outline-none focus:border-[#04B8BB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#FCFAF9]/70 mb-2">
                      Company / Profession <span className="text-xs text-[#FCFAF9]/40">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => updateField('company', e.target.value)}
                      placeholder="e.g. Startup Founder / Consultant"
                      className="w-full px-4 py-3 bg-[#18181A] border border-[rgba(252,250,249,0.16)] rounded-lg text-sm text-[#FCFAF9] placeholder-[#FCFAF9]/30 focus:outline-none focus:border-[#04B8BB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#FCFAF9]/70 mb-2">
                      Team Size
                    </label>
                    <select
                      value={form.numberOfPeople}
                      onChange={(e) => updateField('numberOfPeople', e.target.value)}
                      className="w-full px-4 py-3 bg-[#18181A] border border-[rgba(252,250,249,0.16)] rounded-lg text-sm text-[#FCFAF9] focus:outline-none focus:border-[#04B8BB]"
                    >
                      <option value="1">1 Person</option>
                      <option value="2">2 - 3 People</option>
                      <option value="4">4 - 6 People</option>
                      <option value="7">7+ People</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#FCFAF9]/70 mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={form.preferredDate}
                      onChange={(e) => updateField('preferredDate', e.target.value)}
                      className="w-full px-4 py-3 bg-[#18181A] border border-[rgba(252,250,249,0.16)] rounded-lg text-sm text-[#FCFAF9] focus:outline-none focus:border-[#04B8BB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#FCFAF9]/70 mb-2">
                      Preferred Time
                    </label>
                    <select
                      value={form.preferredTime}
                      onChange={(e) => updateField('preferredTime', e.target.value)}
                      className="w-full px-4 py-3 bg-[#18181A] border border-[rgba(252,250,249,0.16)] rounded-lg text-sm text-[#FCFAF9] focus:outline-none focus:border-[#04B8BB]"
                    >
                      <option value="Morning (10 AM - 1 PM)">Morning (10 AM - 1 PM)</option>
                      <option value="Afternoon (1 PM - 5 PM)">Afternoon (1 PM - 5 PM)</option>
                      <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#FCFAF9]/70 mb-2">
                    Message / Workspace Needs <span className="text-xs text-[#FCFAF9]/40">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    placeholder="Tell us what you are looking for (e.g. private cabin for 3, quiet hot desk, or podcast studio availability)"
                    className="w-full px-4 py-3 bg-[#18181A] border border-[rgba(252,250,249,0.16)] rounded-lg text-sm text-[#FCFAF9] placeholder-[#FCFAF9]/30 focus:outline-none focus:border-[#04B8BB]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full button button-primary py-4 text-base font-bold uppercase tracking-wider disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Scheduling Tour...</span>
                    ) : (
                      <span>Confirm & Book Free Tour →</span>
                    )}
                  </button>
                  <p className="text-xs text-center text-[#FCFAF9]/40 mt-3">
                    No credit card or deposit required. 100% free 2-day workspace trial included.
                  </p>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default function ContentPage({ slug }) {
  const page = PAGES[slug];
  const initialData = getInitialCmsData();
  const [content, setContent] = useState(() => initialData || defaultContent);
  const [cmsLoaded, setCmsLoaded] = useState(true);
  const [cmsFailed, setCmsFailed] = useState(false);
  const [dbPlans, setDbPlans] = useState([]);
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [utm, setUtm] = useState({ source: '', medium: '', campaign: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source') || '';
      const utmMedium = params.get('utm_medium') || '';
      const utmCampaign = params.get('utm_campaign') || '';
      if (utmSource || utmMedium || utmCampaign) {
        setUtm({ source: utmSource, medium: utmMedium, campaign: utmCampaign });
      }
    }

    if (page?.title) {
      document.title = page.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && page.description) {
        metaDesc.setAttribute('content', page.description);
      }
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical && page.path) {
        canonical.setAttribute('href', `${SITE.url}${page.path}`);
      }
    }

    trackPixelEvent('ViewContent', { content_name: page?.breadcrumb || page?.h1 || slug });

    api.fetchPublishedContent()
      .then((res) => {
        if (res.success && res.data) {
          const merged = mergeContent(defaultContent, res.data);
          setContent(merged);
          setCmsLoaded(true);
        } else {
          setContent(defaultContent);
          setCmsFailed(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load published content for content page', err);
        setContent(defaultContent);
        setCmsFailed(true);
      });

    api.fetchPlans()
      .then((res) => {
        if (res.success && res.data) {
          setDbPlans(res.data);
        }
      })
      .catch((err) => console.error('Failed to fetch DB plans for content page', err));
  }, [slug, page]);

  if (!page) return null;

  const handleOpenTour = () => {
    trackPixelEvent('Lead', { content_name: 'trial_booked' });
    setTourModalOpen(true);
  };

  // Group FAQs by category if present
  const hasGroupedFaqs = page.faqs && page.faqs.some((f) => f.category);
  const groupedFaqs = hasGroupedFaqs
    ? page.faqs.reduce((acc, f) => {
        const cat = f.category || 'General Questions';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(f);
        return acc;
      }, {})
    : null;

  return (
    <div className="site-noise min-h-[100dvh] bg-[#0C0C0C] text-[#FCFAF9]">
      <div className="sticky top-0 z-40 w-full">
        <Header
          onReserve={handleOpenTour}
          content={content}
          cmsLoaded={cmsLoaded}
          cmsFailed={cmsFailed}
        />
      </div>

      <main>
        {/* Hero block with Breadcrumbs */}
        <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[rgba(252,250,249,0.12)]">
          <div className="container-wide">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#FCFAF9]/60">
              <Link href="/" className="hover:text-[#04B8BB] transition-colors">
                Home
              </Link>
              <span className="text-[#FCFAF9]/30">/</span>
              <span className="text-[#04B8BB] font-medium" aria-current="page">
                {page.breadcrumb || page.h1}
              </span>
            </nav>

            <div className="max-w-4xl">
              {page.eyebrow && (
                <div className="section-label mb-6 text-[#04B8BB] font-black">
                  {page.eyebrow}
                </div>
              )}
              <h1 className="editorial-headline text-3xl sm:text-5xl lg:text-6xl font-black mb-8 leading-[1.08] text-[#FCFAF9] uppercase tracking-tight">
                {page.h1}
              </h1>
              <div className="space-y-5">
                {page.intro?.map((paragraph, idx) => (
                  <p key={idx} className="text-base sm:text-lg text-[#FCFAF9]/85 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={handleOpenTour}
                  className="button button-primary"
                >
                  Book Free Tour
                </button>
                <a
                  href={SITE.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackPixelEvent('Contact', { content_name: 'whatsapp_click' })}
                  className="button button-outline"
                >
                  Chat on WhatsApp
                </a>
                <a
                  href={`tel:${SITE.phoneTel}`}
                  onClick={() => trackPixelEvent('Contact', { content_name: 'call_click' })}
                  className="button button-outline"
                >
                  Call {SITE.phone}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Dedicated Calculator Component */}
        {page.showCalculator && (
          <div className="cost-calculator-wrapper">
            <OfficeCostCalculator isStandalone={true} />
          </div>
        )}

        {/* Dedicated In-Page Contact & Tour Booking Form */}
        {page.showContactForm && (
          <ContactSection
            utm={utm}
            mapsEmbedSrc={SITE.mapsEmbedSrc || content?.globalSettings?.mapsEmbedSrc}
          />
        )}

        {/* Content sections */}
        {page.sections?.map((sec, idx) => (
          <section key={idx} className="py-14 sm:py-20 border-b border-[rgba(252,250,249,0.12)]">
            <div className="container-wide">
              <div className="max-w-4xl">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FCFAF9] uppercase tracking-tight mb-6">
                  {sec.heading}
                </h2>
                {sec.paragraphs && sec.paragraphs.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-base sm:text-lg text-[#FCFAF9]/80 leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                )}
                {sec.bullets && sec.bullets.length > 0 && (
                  <ul className="mb-6 space-y-3">
                    {sec.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-3 text-base text-[#FCFAF9]/85 leading-relaxed">
                        <span className="text-[#04B8BB] font-bold mt-1 text-sm shrink-0">✦</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {sec.note && (
                  <p className="text-xs sm:text-sm text-[#FCFAF9]/60 italic mt-4 pl-4 border-l-2 border-[#04B8BB]/40">
                    {sec.note}
                  </p>
                )}
              </div>
            </div>
          </section>
        ))}

        {/* Pricing component if showPricing is true */}
        {page.showPricing && (
          <Pricing
            onReserve={handleOpenTour}
            pricing={content?.pricing}
            dbPlans={dbPlans}
            scarcity={content?.scarcity}
            globalSettings={content?.globalSettings}
            cmsLoaded={cmsLoaded}
            cmsFailed={cmsFailed}
          />
        )}

        {/* ValueStack component on /pricing page */}
        {slug === 'pricing' && (
          <ValueStack
            valueStack={content?.valueStack}
            onReserve={handleOpenTour}
            cmsLoaded={cmsLoaded}
            cmsFailed={cmsFailed}
          />
        )}

        {/* FAQ block */}
        {page.faqs && page.faqs.length > 0 && (
          <section className="py-16 sm:py-24 border-b border-[rgba(252,250,249,0.12)]">
            <div className="container-wide">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <div className="section-label mb-4 text-[#04B8BB] font-black justify-center">QUESTIONS & ANSWERS</div>
                <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#FCFAF9] uppercase tracking-tight">
                  Frequently Asked Questions
                </h2>
              </div>

              {groupedFaqs ? (
                /* Grouped FAQ Sections (used on /faq) */
                <div className="max-w-4xl mx-auto space-y-8">
                  {Object.entries(groupedFaqs).map(([category, faqs], catIdx) => (
                    <div key={catIdx} className="border border-[rgba(252,250,249,0.14)] rounded-xl p-6 sm:p-8 bg-[#0F0F10]">
                      <h3 className="font-display text-lg sm:text-xl font-bold text-[#04B8BB] uppercase tracking-wider mb-6 flex items-center gap-2">
                        <span>✦</span>
                        <span>{category}</span>
                      </h3>
                      <div className="divide-y divide-[rgba(252,250,249,0.12)]">
                        {faqs.map((faq, fIdx) => (
                          <details key={fIdx} className="group py-5 text-left">
                            <summary className="flex cursor-pointer items-start justify-between gap-4 font-display text-[15px] sm:text-[17px] font-bold text-[#FCFAF9] group-hover:text-[#04B8BB] list-none transition-colors">
                              <div className="flex items-start gap-3">
                                <span className="font-display text-[11px] font-bold text-[#04B8BB] tracking-[.1em] mt-1 shrink-0">
                                  {String(fIdx + 1).padStart(2, '0')}
                                </span>
                                <span>{faq.q}</span>
                              </div>
                              <span className="text-[#04B8BB] text-xl font-light transition-transform duration-200 group-open:rotate-45 select-none shrink-0">
                                +
                              </span>
                            </summary>
                            <div className="mt-4 pl-8 text-[14px] sm:text-[15px] leading-relaxed text-[#FCFAF9]/75">
                              <p>{faq.a}</p>
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Flat FAQ Accordion */
                <div className="max-w-4xl mx-auto border-t border-[rgba(252,250,249,0.16)] divide-y divide-[rgba(252,250,249,0.16)]">
                  {page.faqs.map((faq, fIdx) => (
                    <details key={fIdx} className="group py-6 text-left">
                      <summary className="flex cursor-pointer items-start justify-between gap-4 font-display text-[16px] sm:text-[18px] font-bold text-[#FCFAF9] group-hover:text-[#04B8BB] list-none transition-colors">
                        <div className="flex items-start gap-4">
                          <span className="font-display text-[11px] font-bold text-[#04B8BB] tracking-[.1em] mt-1 shrink-0">
                            {String(fIdx + 1).padStart(2, '0')}
                          </span>
                          <span>{faq.q}</span>
                        </div>
                        <span className="text-[#04B8BB] text-xl font-light transition-transform duration-200 group-open:rotate-45 select-none shrink-0">
                          +
                        </span>
                      </summary>
                      <div className="mt-4 pl-9 text-[15px] sm:text-[16px] leading-relaxed text-[#FCFAF9]/75">
                        <p>{faq.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Call to action block */}
        <section className="py-16 sm:py-24 border-b border-[rgba(252,250,249,0.12)] bg-[#024E5C]/30">
          <div className="container-wide text-center">
            <div className="max-w-4xl mx-auto">
              <div className="section-label mb-4 text-[#04B8BB] font-black justify-center">GET IN TOUCH</div>
              <h2 className="font-display text-2xl sm:text-4xl font-black text-[#FCFAF9] uppercase tracking-tight mb-4">
                Experience Deven Co-Work In Person
              </h2>
              <p className="text-base sm:text-lg text-[#FCFAF9]/80 max-w-2xl mx-auto mb-8">
                Book a free tour or reach out to our team directly. We are here {SITE.hours}.
              </p>
              <div className="flex flex-wrap justify-center items-center gap-4 mb-10">
                <button
                  type="button"
                  onClick={handleOpenTour}
                  className="button button-primary"
                >
                  Book Free Tour
                </button>
                <a
                  href={SITE.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackPixelEvent('Contact', { content_name: 'whatsapp_click' })}
                  className="button button-outline"
                >
                  WhatsApp Us
                </a>
                <a
                  href={`tel:${SITE.phoneTel}`}
                  onClick={() => trackPixelEvent('Contact', { content_name: 'call_click' })}
                  className="button button-outline"
                >
                  Call {SITE.phone}
                </a>
                <a
                  href={`mailto:${SITE.email}`}
                  className="button button-outline"
                >
                  Email Us
                </a>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-6 text-xs uppercase tracking-wider text-[#FCFAF9]/60">
                <a
                  href={SITE.googleBusinessProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#04B8BB] transition-colors"
                >
                  Google Business Profile ↗
                </a>
                <span>•</span>
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#04B8BB] transition-colors"
                >
                  Instagram ↗
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Related pages */}
        {page.related && page.related.length > 0 && (
          <section className="py-14 sm:py-20 border-b border-[rgba(252,250,249,0.12)]">
            <div className="container-wide">
              <div className="section-label mb-4 text-[#04B8BB] font-black">EXPLORE MORE</div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#FCFAF9] uppercase tracking-tight mb-8">
                Related Pages
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {page.related.map((relPath, idx) => {
                  const relSlug = relPath.replace(/^\//, '');
                  const relPage = PAGES[relSlug];
                  const linkText = relPage ? relPage.h1 : relPath;
                  return (
                    <Link
                      key={idx}
                      href={relPath}
                      className="p-5 border border-[rgba(252,250,249,0.14)] hover:border-[#04B8BB] bg-[rgba(252,250,249,0.02)] hover:bg-[rgba(4,184,187,0.05)] transition-all group flex flex-col justify-between"
                    >
                      <span className="font-display text-sm sm:text-base font-bold text-[#FCFAF9] group-hover:text-[#04B8BB] transition-colors">
                        {linkText}
                      </span>
                      <span className="mt-3 text-xs text-[#04B8BB] font-mono tracking-wider flex items-center gap-1">
                        Explore page →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer
        footer={content?.footer}
        globalSettings={content?.globalSettings}
        cmsLoaded={cmsLoaded}
        cmsFailed={cmsFailed}
      />

      <TourBookingModal
        isOpen={tourModalOpen}
        onClose={() => setTourModalOpen(false)}
        utm={utm}
      />
    </div>
  );
}
