import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown,
  Clock3, MapPin, MessageCircle, Phone, ShieldCheck, Users, X,
  Wifi, Coffee, Briefcase, Home as HomeIcon, Zap, Star
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import AdminLogin from '@/pages/admin-login';
import AdminDashboard from '@/pages/admin-dashboard';
import ThankYou from '@/pages/thank-you';
import SeatSelection from '@/components/seat-selection';
import { api } from '@/services/api';

const queryClient = new QueryClient();

// ─── DEFAULT CONTENT ─────────────────────────────────────────────────────────
const defaultContent = {
  globalSettings: {
    businessName: 'Deven Co-Work',
    shortDesc: "Raipur's Most Premium Coworking Space",
    address: 'VIP Estate, A1, VIP Colony, Shankar Nagar, Raipur, Chhattisgarh 492001',
    phone: '+91 62605 82852',
    whatsapp: '+91 62605 82852',
    email: 'bookings@devencowork.com',
    mapsEmbedSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.5284307521743!2d81.6731683!3d21.2595151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28ddb73efa82a7%3A0xb99b968caba2d846!2sDeven+Co-Work%2C+VIP+Estate%2C+A1%2C+VIP+Colony%2C+Raipur%2C+Chhattisgarh+492001!5e0!3m2!1sen!2sin!4v1717800000000!5m2!1sen!2sin',
    mapsUrl: 'https://www.google.com/maps/dir/22.510398,82.552375/Deven+Co-Work,+VIP+Estate,+A1,+VIP+Colony,+Raipur,+Chhattisgarh+492001',
    instagram: 'https://instagram.com/',
    googleBusiness: 'https://www.google.com/maps/',
    copyright: '© {year} Deven Co-Work · Approved founding rate is locked upon deposit reservation',
    favicon: '',
    logo: '',
    ogImage: '',
  },
  seo: {
    title: 'Deven Cowork — Reserve your founding seat | Raipur Premium Coworking',
    description: "Deven Cowork is Raipur's most premium coworking space. Reserve one of 50 founding seats — content studio, and a real founder's community.",
    keywords: 'coworking raipur, coworking space raipur, founder workspace raipur, deven cowork',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
  },
  navigation: {
    items: [
      { label: 'Pricing', url: '#pricing', external: false, visible: true, order: 0 },
      { label: 'Contact', url: '#reservation', external: false, visible: true, order: 2 },
    ],
    ctaLabel: 'Book Free Trial',
    ctaUrl: '#reservation',
    ctaVisible: true,
  },
  header: {
    phone: '+91 62605 82852',
    logo: '',
  },
  hero: {
    eyebrow: "DEVEN WORKSPACE — RAIPUR",
    location: 'VIP ESTATE, A1, VIP COLONY, SHANKAR NAGAR, RAIPUR, CHHATTISGARH 492001',
    headline: "Raipur's most\nbeautiful office.\nNow yours.",
    subheadline: "Raipur's most premium coworking space — a content studio, a real community, and everything you need to grow, not just work.",
    primaryCtaLabel: 'Book Your Free 2-Day Trial',
    primaryCtaUrl: '#reservation',
    secondaryCtaLabel: 'See Founding Member Pricing',
    secondaryCtaUrl: '#pricing',
    foundingPriceNote: 'Founding plan from ₹5,999 / month · Rate locked for founding batch',
    videoUrl: '/assets/hero-workspace.mp4',
    imageUrl: '/assets/hero-fallback.png',
    highlightWords: 'beautiful',
    floatingStats: [
      { value: '50', label: 'Founding Seats' },
      { value: '₹1,000', label: 'Refundable Deposit' },
    ],
    metaItems: ['RAIPUR', 'VIP ESTATE', '50 SEATS', 'FRI — SAT FREE TRIAL'],
    stats: [
      { main: '2-Day Free Trial', sub: 'No card required' },
      { main: '500 Mbps Wifi', sub: 'High Speed' },
      { main: '9 AM–9 PM, 7 Days', sub: 'Access Hours' },
      { main: 'Central Raipur Location', sub: 'City Centre' },
    ],
  },
  problem: {
    headline: 'The problems we all\npretend are normal.',
    body: "You've outgrown working from home. The wifi drops during client calls. There's nowhere professional to host a meeting. And every coworking space you've seen in Raipur feels like a leftover office with some beanbags thrown in.\n\nYou didn't start your business to work like this.",
    imageUrl: '',
    quoteText: "You're not lazy. Your environment is holding you back.",
    quoteAuthor: '',
    blocks: [
      { title: 'The Dining Table Trap', description: 'Your family loves you, but they are also your loudest distractions. You cannot build a company between laundry cycles and kitchen noise.', icon: 'Home' },
      { title: 'The Noisy Café Tax', description: 'Buying ₹300 lattes just to borrow WiFi for two hours is not a business model. It is a slow leak in your runway.', icon: 'Coffee' },
      { title: 'The Cramped Office Prison', description: 'Renting a tiny, windowless room in a commercial building is depressing. It kills your creativity and makes client meetings awkward.', icon: 'Briefcase' },
    ],
    problemPoints: [
      { title: 'A client asks where your office is — and you change the subject.', description: 'You lose credibility before the conversation even starts. The wrong environment sends the wrong message.' },
      { title: 'Your best work happens between a doorbell, a delivery and the TV.', description: 'No focus. No flow. Just constant interruptions you can\'t control and distractions you didn\'t invite.' },
      { title: 'You look smaller on a video call than your business actually is.', description: 'The wrong background signals the wrong thing. First impressions in remote work are everything.' },
    ],
    cta: {
      label: 'Book Your Free 2-Day Trial',
      url: '#reservation',
      enabled: true,
    },
  },
  guide: {
    headline: 'We Built the Space Raipur Founders Actually Deserve',
    body1: "We know what it's like to need a professional address, a reliable internet connection, and a room that doesn't embarrass you in front of a client — because we built Deven Co-Work solving that exact problem for ourselves first.",
    body2: "Deven Co-Work is Raipur's most premium coworking space — right in the heart of the city, built for founders, freelancers, consultants, and teams who refuse to compromise on how they work.",
    galleryTitle: 'A Space Built for Professional Work',
    gallery: [
      { image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', label: 'MAIN AREA', caption: 'The main workspace floor', size: 'large' },
      { image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80', label: 'PODCAST DESK', caption: 'Content studio setup', size: 'small' },
      { image: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=400&q=80', label: 'MEETING ROOM', caption: 'Private meeting space', size: 'small' },
      { image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80', label: 'CAFE LOBBY', caption: 'Coffee bar & lounge', size: 'medium' },
      { image: 'https://images.unsplash.com/photo-1530745342582-0795f23ec976?auto=format&fit=crop&w=600&q=80', label: 'GREEN ZONE', caption: 'Natural light workspace', size: 'medium' },
      { image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80', label: 'TECH LOUNGE', caption: 'Tech & collaboration zone', size: 'medium' },
    ],
    blocks: [
      { title: 'Built by Founders', description: 'Solving the exact address, internet, and client meeting problems we faced.' },
      { title: 'Raipur City Center', description: 'Located in Shankar Nagar (VIP Estate), easily reachable from anywhere.' },
      { title: 'Premium Only', description: 'Designed specifically for teams and founders who refuse to compromise.' },
    ],
  },
  plan: {
    headline: 'Getting Started Is Simple',
    ctaLabel: 'Start With Your Free Trial',
    ctaUrl: '#reservation',
    steps: [
      { title: 'Book Your Free 2-Day Trial', description: 'No card, no pressure, just come work from here.' },
      { title: 'Pick Your Plan', description: 'Hot Desk or Dedicated Desk — whatever fits.' },
      { title: 'Move In & Grow', description: 'Join a real community, not just a shared room.' },
    ],
  },
  offerStack: {
    headline: "Everything Included in The Deven Founder's OS",
    subheadline: 'Not a list of amenities. A complete system to work, grow, and be seen.',
    tiers: [
      { heading: 'THE WORKSPACE', items: ['Team Meeting Room with Interactive Digital Panel', 'Reception', '500 Mbps Wifi', '9 AM–9 PM Access', 'Locker & Drawer', '75% Natural Light', 'Power Backup', 'High-Quality Lighting', 'Daily Cleaning & Maintenance', '2 Charging Points at Every Desk', 'Color Printer', 'Coffee Bar — 20+ Coffees, 5+ Teas', '2 Cups Tea/Coffee Daily', '50+ Plants', 'Recreation Space', 'Kitchen/Food Heating Space', 'First-Aid & Wellness Kit', 'Unlimited RO Water & Healthy Snacks', 'Dedicated Parking'], isDevenEdge: false },
      { heading: 'THE GROWTH ENGINE', items: ["Raipur Founder's Workspace Checklist", '20 Free Business Templates', '100 Deven Business Cards', 'Welcome Kit'], isDevenEdge: true },
      { heading: 'THE PERSONAL BRAND BOOST', items: ['Content Studio Access', '1 Professional Founder Podcast Episode', '1 Instagram Collaboration/Month', '1 Professional Founder Photoshoot Every 6 Months', 'Founding Member Badge', 'Annual Deven Awards Night Invite'], isDevenEdge: true },
      { heading: 'THE LEARNING', items: ['1 AI Workshop/Month', '1 Book Reading Workshop/Month', 'Deven Library — 100+ Books', '1 Ask Me Anything Session/Month'], isDevenEdge: true },
      { heading: 'THE CONNECT', items: ["Founder's Growth WhatsApp Community", '2 Events/Month — 1 Fun + 1 Educational'], isDevenEdge: false },
      { heading: 'THE RISK-FREE ENTRY', items: ['2-Day Free Trial', '7-Day "Love It or Leave It" Guarantee'], isDevenEdge: false },
    ],
  },
  valueStack: {
    headline: "Your desk\ncomes with\nmore than\na desk.",
    body: 'No inflated comparison price, no hidden bundle. We publish our true market value transparently.',
    rows: [
      { inclusion: 'Dedicated Workspace, 9 AM–9 PM, 7 Days', val: '₹6,000/mo' },
      { inclusion: '500 Mbps Wifi, Printer, Locker, Charging Points', val: 'Priceless' },
      { inclusion: 'Coffee Bar — 20+ Coffees, 5+ Teas', val: '₹1,500/mo' },
      { inclusion: '2 Events + AI Workshop + Book Workshop/month', val: '₹2,500/mo' },
      { inclusion: 'Deven Library Access — 100+ Books', val: '₹500/mo' },
      { inclusion: "Founder's Growth WhatsApp Community", val: 'Priceless' },
      { inclusion: 'Content Studio + Podcast + Instagram Collab', val: '₹8,000+/mo' },
      { inclusion: 'Professional Photoshoot — every 6 months', val: '₹15,000 one-time' },
    ],
    valueItems: [],
    totalValue: '₹25,000+/month',
    foundingPrice: 'From ₹5,999/month',
  },
  riskReversal: {
    headline: 'Try Deven Co-Work —\nCompletely Risk Free',
    subheadline: "No risk, no lock-in. Come in and experience Raipur's most premium space with total confidence.",
    blocks: [
      { title: 'The 2-Day Free Trial', description: 'Full desk access, wifi, coffee bar, and one community intro — no card required, no obligation.' },
      { title: 'The "Love It or Leave It" Guarantee', description: "Join after your trial and attend 1 event + 1 workshop in your first 30 days. If you haven't made a genuine business connection or walked away with something useful — we'll refund your first month, no argument." },
    ],
  },
  socialProof: {
    headline: 'What Founders Are Saying',
    subheadline: 'Hear from our members who switched to Deven Co-Work. Real reviews, updated dynamically.',
    testimonials: [],
  },
  pricing: {
    headline: 'Choose the room that fits the way you work.',
    subheadline: 'Choose the membership tier that fits your workflow. Reserve your spot today to lock in these exclusive founding rates.',
    spotsLeft: '[X]',
    closesDate: '[date]',
    plans: [
      { name: 'Hot Desk', standard: '₹7,500/mo', founding: '₹5,999/mo', desc: 'Flexible access for focused days. Includes shared workspace, meeting rooms, coffee bar, and community membership.' },
      { name: 'Dedicated Desk', standard: '₹11,000/mo', founding: '₹8,999/mo', desc: 'Your own place to build from. Includes 24/7 dedicated desk, studio + growth engine, photoshoot, and member network.' },
      { name: 'Meeting Room', standard: '₹500/hr', founding: '₹399/hr', desc: 'Professional team meeting space. Interactive digital panel, high-speed connection, and host credentials.' },
      { name: 'Studio Hourly', standard: '₹1,500/hr', founding: '₹999/hr', desc: 'Professional audio/video podcast and content recording setup. High-grade gear, lighting, and audio backdrops.' },
    ],
  },
  scarcity: {
    seatsRemainingText: 'Only 27 of 50 founding seats left.',
    deadlineDate: null,
    totalSpots: 50,
    remainingSpots: 27,
    closingDate: '30 September 2026',
  },
  faqSection: {
    headline: 'Before You Come In',
    subheadline: 'Everything you need to know about memberships, pricing, rules, and billing details.',
  },
  faq: [
    { question: 'Do I need to commit long-term?', answer: 'No. Month-to-month is available. Annual plans get 2 free months if you want to lock in the lowest rate.', published: true, order: 0 },
    { question: 'What happens after the 2-day free trial?', answer: 'Nothing automatic — no card is charged. If you love it, our team helps you pick the right plan.', published: true, order: 1 },
    { question: 'What if I want to cancel?', answer: "30 days' notice, no penalties, no hidden fees.", published: true, order: 2 },
    { question: 'Can I upgrade later?', answer: 'Yes, anytime — Founding Members get priority access.', published: true, order: 3 },
    { question: 'Is the Founding Member price really locked?', answer: 'Yes — for 12 months from the day you join, even as standard prices increase.', published: true, order: 4 },
    { question: 'Where exactly is Deven Co-Work located?', answer: 'VIP Estate, A1, VIP Colony, Shankar Nagar, Raipur, Chhattisgarh 492001 — right in the heart of Raipur, easily reachable from anywhere in the city.', published: true, order: 5 },
  ],
  finalCTA: {
    headline: 'Your First Day Is Free. Come See Why Founders Are Switching.',
    body: "No card. No pressure. Just come work from Raipur's most premium coworking space for 2 full days, completely free.",
    primaryCtaLabel: 'Book Your Free 2-Day Trial',
    primaryCtaUrl: '#reservation',
  },
  reservation: {
    step1Title: 'Step 1: Choose Your founding desks on live map',
    step2Title: 'Step 2: Enter Contact details',
    depositNote: 'Deposit required: ₹1,000 per seat · Refundable · UPI-first Checkout',
    whatsappMessage: "Hi, I'd like to learn more about Deven Co-Work",
    scarcityNote: 'Only {remaining} founding desks left in Raipur founding batch. Capped at max 7 per company.',
    reservationHeading: 'Lock in your\nfounding member\nseat.',
    reservationDescription: 'Only 50 seats are available in the founding batch. Choose your next step below.',
    scarcityText: "FOUNDING BATCH\nLimited seats available",
    totalFoundingSeats: 50,

    joiningDate: '15 September 2026',
    trialButtonText: 'GET 2 DAYS FREE TRIAL',
    whatsappButtonText: 'BOOK VIA WHATSAPP',
    reserveButtonText: 'RESERVE MY SEAT',
    trialConfirmationTitle: 'Your 2-Day Free Trial is Booked.',
    trialConfirmationMessage: 'Thanks for booking your free trial. Our team will call you shortly to confirm your visit and guide you through the next steps.',
    paymentConfirmationTitle: 'RESERVATION CONFIRMED',
    paymentConfirmationMessage: "You're officially in. Your founding member seat has been reserved successfully. Your invoice has been sent to your email.",
    whatsappNumber: '+91 62605 82852',
    reservationEmailSettings: 'bookings@devencowork.com',
  },
  freeTrial: {
    enabled: true,
    days: ['Friday', 'Saturday'],
    duration: '2 Days',
    description: 'Visit us Friday & Saturday and experience the space before you commit.',
    startTime: '09:00 AM',
    endTime: '09:00 PM',
  },
  footer: {
    tagline: "Raipur's Most Premium Coworking Space",
    quickLinks: [
      { label: 'Pricing', href: '#pricing' },
      { label: 'Contact', href: '#reservation' },
      { label: 'Instagram', href: 'https://instagram.com/' },
      { label: 'GMB', href: 'https://www.google.com/maps/' },
    ],
    address: 'VIP Estate, A1, VIP Colony, Shankar Nagar, Raipur, Chhattisgarh 492001',
    phone: '+91 62605 82852',
    whatsapp: '+91 62605 82852',
    email: 'bookings@devencowork.com',
    copyright: '',
    ctaLabel: '',
    ctaUrl: '',
  },
  sectionOrder: ['hero', 'problem', 'guide', 'plan', 'offerStack', 'valueStack', 'guarantee', 'socialProof', 'pricing', 'faq', 'finalCTA'],
  sectionVisibility: {
    hero: true, problem: true, guide: true, plan: true, offerStack: true,
    valueStack: true, guarantee: true, socialProof: true, pricing: true, faq: true, finalCTA: true,
  },
};

// ─── DEEP MERGE ───────────────────────────────────────────────────────────────
function mergeContent(defaults, fetched) {
  if (!fetched) return defaults;
  const merged = { ...defaults };
  for (const key in defaults) {
    if (fetched[key] !== undefined && fetched[key] !== null) {
      if (
        typeof defaults[key] === 'object' &&
        !Array.isArray(defaults[key]) &&
        typeof fetched[key] === 'object' &&
        !Array.isArray(fetched[key])
      ) {
        merged[key] = { ...defaults[key], ...fetched[key] };
      } else {
        merged[key] = fetched[key];
      }
    }
  }
  return merged;
}

export function getMediaUrl(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) return val.url || '';
  return '';
}

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

// ─── SCROLL REVEAL WRAPPER ────────────────────────────────────────────────────
function RevealOnScroll({ children, className = '', delay = 0, once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, amount: 0.18 });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeUp}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── HIGHLIGHT WORDS ──────────────────────────────────────────────────────────
// Wraps specified words in a yellow span. Words from CMS `highlightWords` or hard-coded list.
function HighlightedText({ text, highlightWords = [] }) {
  if (!text) return null;
  if (!highlightWords.length) return <>{text}</>;
  const pattern = new RegExp(`(${highlightWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        highlightWords.some(w => w.toLowerCase() === part.toLowerCase())
          ? <span key={i} className="text-[#DF9716]">{part}</span>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function Button({ children, onClick, href, className = '', variant = 'primary', testId, disabled }) {
  const content = <>{children}<ArrowUpRight size={14} strokeWidth={2.5} /></>;
  const cls = `button button-${variant} ${className}`;
  if (href) return <a href={href} className={cls} data-testid={testId}>{content}</a>;
  return (
    <button type="button" onClick={onClick} className={cls} data-testid={testId} disabled={disabled}>
      {content}
    </button>
  );
}

function Logo({ logoUrl }) {
  return (
    <Link href="/" className="logo text-[#F1F1F1]" data-testid="link-logo">
      {logoUrl ? (
        <img src={logoUrl} alt="Deven Co-Work" className="h-8 object-contain" />
      ) : (
        <>
          <span className="logo-mark" aria-hidden="true"><span /><span /></span>
          <span className="font-display text-[20px] tracking-[.04em]">DEVEN</span>
          <span className="mt-[3px] text-[9px] font-bold tracking-[.2em] text-[#A3A3A3]">COWORK</span>
        </>
      )}
    </Link>
  );
}

// ─── IMAGE WITH FALLBACK ──────────────────────────────────────────────────────
function SafeImage({ src, alt = '', className = '', style }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ onReserve, content }) {
  const [solid, setSolid] = useState(false);
  const phone = content.header?.phone || content.globalSettings?.phone || '+91 62605 82852';
  const cleanPhoneHref = `tel:${phone.replaceAll(' ', '')}`;
  const nav = content.navigation || defaultContent.navigation;
  const visibleNav = (nav.items || [])
    .filter(i => i.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const logoUrl = getMediaUrl(content.globalSettings?.logo || content.header?.logo || '');

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (e, url) => {
    if (url && url.startsWith('#')) {
      e.preventDefault();
      document.getElementById(url.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-30 transition-all duration-300 ${
        solid
          ? 'bg-[#024E5C]/95 backdrop-blur-md border-b border-[rgba(252,250,249,0.14)]'
          : 'bg-transparent'
      }`}
    >
      <div className="container-wide flex h-[70px] items-center justify-between gap-4">
        <Logo logoUrl={logoUrl} />

        <nav className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[.18em] text-[#FCFAF9]/85">
          {visibleNav.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
              onClick={(e) => handleNavClick(e, item.url)}
              className="hover:text-[#04B8BB] transition-colors relative group text-[#FCFAF9]/85"
            >
              {item.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#04B8BB] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <a
            href={cleanPhoneHref}
            className="hidden text-[10px] font-bold uppercase tracking-wider text-[#DF9716] transition-colors hover:text-[#04B8BB] sm:inline"
            data-testid="link-header-phone"
          >
            {phone}
          </a>
          {nav.ctaVisible !== false && (
            <Button
              onClick={onReserve}
              href={nav.ctaUrl?.startsWith('#') ? undefined : nav.ctaUrl}
              className="button-small"
              testId="button-header-reserve"
            >
              {nav.ctaLabel || 'Book Free Trial'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ onReserve, hero, cmsLoaded = false, cmsFailed = false }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const data = hero || defaultContent.hero;

  const headlineLines = (data.headline || '').split('\n');
  const highlightWords = (data.highlightWords || '')
    .split(',').map(w => w.trim()).filter(Boolean);

  const handleCtaClick = (e, url) => {
    if (url && url.startsWith('#')) {
      e.preventDefault();
      document.getElementById(url.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const floatingStats = data.floatingStats || defaultContent.hero.floatingStats;
  const metaItems = data.metaItems || defaultContent.hero.metaItems;

  // Determine media visibility based on loading states
  const showCmsVideo = cmsLoaded && !videoFailed && data.videoUrl;
  const showCmsImage = cmsLoaded && (videoFailed || !data.videoUrl) && data.imageUrl;

  const showFallbackVideo = !cmsLoaded && cmsFailed && !videoFailed && defaultContent.hero.videoUrl;
  const showFallbackImage = !cmsLoaded && cmsFailed && (videoFailed || !defaultContent.hero.videoUrl) && defaultContent.hero.imageUrl;

  const currentVideoUrl = showCmsVideo ? data.videoUrl : (showFallbackVideo ? defaultContent.hero.videoUrl : null);
  const currentImageUrl = showCmsImage ? data.imageUrl : (showFallbackImage ? defaultContent.hero.imageUrl : null);

  // Reset ready state when URLs change
  useEffect(() => {
    setMediaReady(false);
  }, [currentVideoUrl, currentImageUrl]);

  const videoRef = useRef(null);
  const imgRef = useRef(null);

  // Handle cached elements that may already be loaded
  useEffect(() => {
    if (currentVideoUrl && videoRef.current && videoRef.current.readyState >= 2) {
      setMediaReady(true);
    }
  }, [currentVideoUrl]);

  useEffect(() => {
    if (currentImageUrl && imgRef.current && imgRef.current.complete) {
      setMediaReady(true);
    }
  }, [currentImageUrl]);

  const handleMediaReady = () => {
    setMediaReady(true);
  };

  return (
    <section
      className="relative overflow-hidden border-b border-[rgba(255,255,255,0.06)] pt-[70px] grid-paper"
      data-testid="section-hero"
    >
      {/* Background Video */}
      {currentVideoUrl && (
        <video
          ref={videoRef}
          key={getMediaUrl(currentVideoUrl)}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={() => setVideoFailed(true)}
          onLoadedData={handleMediaReady}
          onCanPlay={handleMediaReady}
          style={{
            opacity: mediaReady ? 0.35 : 0,
            transition: 'opacity 0.4s ease-in-out',
          }}
        >
          <source src={getMediaUrl(currentVideoUrl)} type="video/mp4" />
        </video>
      )}

      {/* Background Image */}
      {currentImageUrl && (
        <img
          ref={imgRef}
          src={getMediaUrl(currentImageUrl)}
          alt="Deven Cowork space"
          className="absolute inset-0 w-full h-full object-cover z-0"
          onLoad={handleMediaReady}
          style={{
            opacity: mediaReady ? 0.35 : 0,
            transition: 'opacity 0.4s ease-in-out',
          }}
        />
      )}

      <div className="container-wide relative z-20 flex min-h-[calc(100dvh-70px)] flex-col justify-center pb-16 pt-16 sm:min-h-[820px] sm:pb-28">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="section-label mb-8"
          style={{ '--section-label-color': '#04B8BB' }}
        >
          {data.eyebrow || "DEVEN WORKSPACE — RAIPUR"}
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-[1fr_auto] lg:gap-16 items-end">
          {/* Left: Headline + CTAs */}
          <div className="max-w-[820px]">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
              className="font-display font-black leading-[1.0] tracking-[-0.03em] text-[#FCFAF9] uppercase"
              style={{ fontSize: 'clamp(32px, 3.8vw, 46px)' }}
            >
              {headlineLines.map((line, i) => (
                <span key={i} className="block">
                  <HighlightedText text={line} highlightWords={highlightWords} />
                </span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
              className="mt-8 max-w-[520px] text-[15px] leading-[1.75] text-[#FCFAF9]/80"
            >
              {data.subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
              className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center"
            >
              <Button
                onClick={data.primaryCtaUrl?.startsWith('#') ? onReserve : undefined}
                href={data.primaryCtaUrl?.startsWith('#') ? undefined : data.primaryCtaUrl}
                testId="button-hero-reserve"
              >
                {data.primaryCtaLabel || 'Book Your Free 2-Day Trial'}
              </Button>
              <a
                href={data.secondaryCtaUrl || '#pricing'}
                onClick={(e) => handleCtaClick(e, data.secondaryCtaUrl || '#pricing')}
                className="text-link"
                data-testid="link-hero-pricing"
              >
                {data.secondaryCtaLabel || 'See Founding Member Pricing'}
              </a>
            </motion.div>

            {data.foundingPriceNote && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.42, duration: 0.5 }}
                className="mt-7 text-[10px] text-[#FCFAF9]/60 uppercase tracking-[0.16em] font-bold"
              >
                {data.foundingPriceNote}
              </motion.p>
            )}
          </div>

          {/* Right: Floating stat cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
            className="hidden lg:flex flex-col gap-3 mb-4"
          >
            {floatingStats.map((stat, i) => (
              <div key={i} className="floating-card min-w-[160px]">
                <div className="font-display font-black text-[28px] leading-none text-[#DF9716]">
                  {stat.value}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FCFAF9]/75 mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 border-t border-[rgba(252,250,249,0.14)] pt-8 gap-6 max-w-[900px]"
        >
          {(data.stats || []).map((item, index) => {
            const main = typeof item === 'object' ? item.main : item;
            const sub = typeof item === 'object' ? item.sub : '';
            return (
              <div key={index}>
                <p className="font-display text-[18px] font-bold tracking-tight text-[#FCFAF9] uppercase leading-tight">{main}</p>
                <p className="mt-1.5 text-[9px] uppercase tracking-[.18em] text-[#FCFAF9]/60 font-bold">{sub}</p>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Bottom metadata strip */}
      <div className="relative z-20 border-t border-[rgba(252,250,249,0.1)] bg-[#024E5C]/50 backdrop-blur-sm">
        <div className="container-wide flex items-center gap-0 overflow-x-auto no-scrollbar">
          {metaItems.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[.25em] text-[#FCFAF9]/65 py-3 pr-6 whitespace-nowrap shrink-0"
            >
              {i > 0 && <span className="h-3 w-px bg-[rgba(252,250,249,0.2)] mr-0" />}
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-[52px] right-8 hidden items-center gap-2.5 text-[9px] uppercase tracking-[.22em] text-[#FCFAF9]/55 font-bold lg:flex">
        <ArrowDownRight size={13} className="text-[#DF9716]" />
        Scroll to discover
      </div>
    </section>
  );
}

// ─── GUIDE (BRAND STATEMENT + GALLERY) ────────────────────────────────────────
function Guide({ guide, onReserve }) {
  const data = guide || defaultContent.guide;
  const gallery = data.gallery || defaultContent.guide.gallery;

  return (
    <section className="bg-[#024E5C] text-[#FCFAF9] border-y border-[rgba(252,250,249,0.16)] py-24 sm:py-36" data-testid="section-guide">
      <div className="container-wide">
        {/* Top: Brand statement */}
        <div className="grid gap-y-12 gap-x-16 lg:grid-cols-[1fr_1fr] lg:gap-24 items-start">
          <RevealOnScroll>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#04B8BB] font-bold">02 — THE SPACE</div>
            <h2 className="mt-6 font-display font-black leading-[1.01] text-[#FCFAF9] uppercase tracking-tight"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
              {data.headline || 'We Built the Space Raipur Founders Actually Deserve.'}
            </h2>
            {/* Oversized watermark text */}
            <div className="mt-10 flex flex-col gap-0 font-display font-black tracking-tighter leading-none select-none opacity-[0.05] text-[#04B8BB]"
              style={{ fontSize: 'clamp(52px, 8vw, 100px)' }}>
              <span>WORK</span>
              <span>SPACE</span>
              <span>STUDIO</span>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.12} className="flex flex-col gap-8">
            <div className="space-y-5 text-[14px] leading-[1.75] text-[#FCFAF9]/85 font-medium">
              <p>{data.body1}</p>
              <p>{data.body2}</p>
            </div>
            <button onClick={onReserve} className="button button-primary self-start" data-testid="button-guide-tour">
              Book Free Trial <ArrowUpRight size={15} />
            </button>
          </RevealOnScroll>
        </div>

        {/* Gallery: editorial masonry */}
        <div className="mt-20 border-t border-[rgba(252,250,249,0.15)] pt-14">
          <RevealOnScroll>
            <h3 className="font-display text-[11px] font-bold text-[#FCFAF9]/60 uppercase tracking-[0.28em] mb-10">
              {data.galleryTitle || 'A Space Built for Professional Work'}
            </h3>
          </RevealOnScroll>

          <div className="grid gap-3 md:grid-cols-[1.2fr_0.6fr_0.6fr]">
            {/* Large image */}
            {gallery[0] && (
              <RevealOnScroll className="relative overflow-hidden aspect-[3/4] md:aspect-auto md:row-span-2 border border-[rgba(252,250,249,0.15)] group">
                <SafeImage
                  src={getMediaUrl(gallery[0].image)}
                  alt={gallery[0].label || 'Workspace'}
                  className="img-editorial img-zoom transition-opacity duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-400 bg-black/65 backdrop-blur-sm">
                  <div className="h-px w-8 bg-[#04B8BB] mb-2" />
                  <span className="text-[9px] font-bold uppercase tracking-[.18em] text-white block">{gallery[0].label}</span>
                  {gallery[0].caption && <span className="text-[10px] text-white/70 mt-0.5 block">{gallery[0].caption}</span>}
                </div>
              </RevealOnScroll>
            )}

            {/* Small images */}
            {gallery.slice(1, 5).map((item, idx) => (
              <RevealOnScroll key={idx} delay={idx * 0.08} className="relative overflow-hidden aspect-[4/3] border border-[rgba(252,250,249,0.15)] group">
                <SafeImage
                  src={getMediaUrl(item.image)}
                  alt={item.label || 'Space'}
                  className="img-editorial img-zoom transition-opacity duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-400 bg-black/65 backdrop-blur-sm">
                  <div className="h-px w-5 bg-[#04B8BB] mb-1.5" />
                  <span className="text-[9px] font-bold uppercase tracking-[.15em] text-white block">{item.label}</span>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PROBLEMS ─────────────────────────────────────────────────────────────────
function Problems({ problem, onReserve }) {
  const data = problem || defaultContent.problem;
  const pointsToRender = data.problemPoints && data.problemPoints.length > 0
    ? data.problemPoints
    : (data.blocks || []);
  const imgSrc = getMediaUrl(data.imageUrl) || 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=800&q=80';
  const showCta = data.cta?.enabled !== false;
  const ctaUrl = data.cta?.url || '#reservation';
  const ctaLabel = data.cta?.label || 'Book Your Free 2-Day Trial';
  const quoteText = data.quoteText || "You're not lazy. Your environment is holding you back.";

  return (
    <section className="bg-[#FCFAF9] text-[#0C0C0C] py-24 sm:py-36 border-b border-[rgba(12,12,12,0.14)]" data-testid="section-problems">
      <div className="container-wide grid gap-y-16 gap-x-16 lg:grid-cols-[1fr_1fr] lg:gap-20 items-start">

        {/* Left: Headline + Image + Quote */}
        <div className="flex flex-col gap-10">
          <RevealOnScroll>
            <div className="section-label mb-6">01 — THE PROBLEM</div>
            <h2
              className="font-display font-black leading-[1.04] text-[#0C0C0C] uppercase tracking-tight"
              style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
            >
              {(data.headline || 'The problems we all\npretend are normal.').split('\n').map((line, i, arr) => (
                <span key={i} className="block">
                  {i === arr.length - 1 ? (
                    <><span className="text-[#0C0C0C]/60">{line.slice(0, -1)}</span><span className="text-[#DF9716]">{line.slice(-1)}</span></>
                  ) : line}
                </span>
              ))}
            </h2>
            <p className="mt-7 text-[14px] leading-[1.75] text-[#0C0C0C]/75 max-w-[440px]">
              {(data.body || '').split('\n\n')[0]}
            </p>
          </RevealOnScroll>

          {/* Image with quote overlay */}
          <RevealOnScroll delay={0.1} className="relative overflow-hidden border border-[rgba(12,12,12,0.12)]">
            <div className="aspect-[4/3]">
              <SafeImage
                src={imgSrc}
                alt="Frustrated founder working from home"
                className="img-editorial"
              />
            </div>

            {/* Quote card overlapping image bottom */}
            {quoteText && (
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <div className="quote-card p-4 max-w-[360px]">
                  <p className="text-[13px] leading-[1.65] text-[#0C0C0C] italic font-medium">
                    "{quoteText}"
                  </p>
                  {data.quoteAuthor && (
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#DF9716]">
                      — {data.quoteAuthor}
                    </p>
                  )}
                </div>
              </div>
            )}
          </RevealOnScroll>
        </div>

        {/* Right: Problem list */}
        <div className="flex flex-col border-t border-[rgba(12,12,12,0.14)] lg:border-t-0 lg:border-l lg:border-[rgba(12,12,12,0.14)] lg:pl-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
          >
            {pointsToRender.map((point, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                className="py-8 flex items-start gap-6 border-b border-[rgba(12,12,12,0.14)]"
              >
                <span
                  className="font-display font-black text-[#024E5C] shrink-0 leading-none select-none"
                  style={{ fontSize: 'clamp(28px, 3.5vw, 42px)' }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h4 className="font-display text-[15px] font-bold text-[#0C0C0C] uppercase tracking-[0.02em] leading-tight">
                    {point.title}
                  </h4>
                  <p className="mt-3 text-[13px] leading-[1.7] text-[#0C0C0C]/75">{point.description}</p>
                </div>
              </motion.div>
            ))}
            {pointsToRender.length === 0 && (
              <p className="py-8 text-[13px] text-[#555]">No problem points added yet.</p>
            )}
          </motion.div>

          {showCta && (
            <RevealOnScroll delay={0.2} className="mt-10 pt-8 border-t border-[rgba(12,12,12,0.14)]">
              <Button
                href={ctaUrl}
                onClick={ctaUrl.startsWith('#') ? (e) => {
                  e.preventDefault();
                  if (ctaUrl === '#reservation') onReserve();
                  else document.querySelector(ctaUrl)?.scrollIntoView({ behavior: 'smooth' });
                } : undefined}
                testId="button-problems-tour"
              >
                {ctaLabel}
              </Button>
            </RevealOnScroll>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── PLAN ─────────────────────────────────────────────────────────────────────
function Plan({ plan, onReserve }) {
  const data = plan || defaultContent.plan;
  const steps = data.steps || [];

  return (
    <section className="border-b border-[rgba(12,12,12,0.14)] bg-[#FCFAF9] text-[#0C0C0C] py-24 sm:py-36" data-testid="section-plan">
      <div className="container-wide grid gap-y-14 gap-x-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
        <RevealOnScroll>
          <div className="section-label mb-6">03 — THE PLAN</div>
          <h2
            className="font-display font-black leading-[1.04] text-[#0C0C0C] uppercase tracking-tight"
            style={{ fontSize: 'clamp(30px, 4vw, 50px)' }}
          >
            {data.headline || 'Getting Started Is Simple'}
          </h2>
          <div className="mt-10">
            <Button onClick={onReserve} testId="button-plan-reserve">
              {data.ctaLabel || 'Start With Your Free Trial'}
            </Button>
          </div>
        </RevealOnScroll>

        <div className="border-t border-[rgba(12,12,12,0.14)]">
          {steps.map((step, index) => (
            <RevealOnScroll key={index} delay={index * 0.1} className="border-b border-[rgba(12,12,12,0.14)] py-9 flex items-start gap-7">
              <span
                className="font-display font-black text-[#DF9716] shrink-0 leading-none"
                style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h4 className="font-display text-[16px] font-bold text-[#0C0C0C] uppercase tracking-[0.02em]">{step.title}</h4>
                <p className="mt-3 text-[13px] leading-[1.7] text-[#0C0C0C]/75">{step.description}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── OFFER STACK ──────────────────────────────────────────────────────────────
function OfferStack({ onReserve, offerStack }) {
  const [openIdx, setOpenIdx] = useState(null);
  const data = offerStack || defaultContent.offerStack;
  const tiers = data.tiers || [];

  return (
    <section className="bg-[#024E5C] text-[#FCFAF9] py-24 sm:py-36 border-b border-[rgba(252,250,249,0.16)]" data-testid="section-offer">
      <div className="container-wide grid gap-y-14 gap-x-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
        <RevealOnScroll>
          <div className="section-label mb-6">04 — THE FOUNDER'S OS</div>
          <h2
            className="font-display font-black leading-[1.04] text-[#FCFAF9] uppercase tracking-tight"
            style={{ fontSize: 'clamp(28px, 3.8vw, 48px)' }}
          >
            {data.headline || "Everything Included in The Deven Founder's OS"}
          </h2>
          <p className="mt-6 text-[14px] leading-[1.75] text-[#FCFAF9]/75 max-w-[420px]">
            {data.subheadline || 'Not a list of amenities. A complete system to work, grow, and be seen.'}
          </p>
          <div className="mt-10">
            <Button onClick={onReserve} testId="button-offer-reserve">Claim Your Founding Spot</Button>
          </div>
        </RevealOnScroll>

        <div className="border-t border-[rgba(252,250,249,0.16)] divide-y divide-[rgba(252,250,249,0.16)]">
          {tiers.map((tier, index) => (
            <div key={index}>
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === index ? null : index)}
                className="w-full py-7 flex items-center justify-between gap-4 text-left group"
                aria-expanded={openIdx === index}
              >
                <div className="flex items-center gap-4">
                  <span className="font-display text-[10px] font-bold text-[#04B8BB]">{String(index + 1).padStart(2, '0')}</span>
                  <h4 className="font-display text-[14px] font-bold text-[#FCFAF9] uppercase tracking-[0.05em] group-hover:text-[#04B8BB] transition-colors">
                    {tier.heading}
                  </h4>
                  {tier.isDevenEdge && (
                    <span className="hidden sm:inline text-[8px] font-black uppercase tracking-[.18em] bg-[#DF9716] text-[#0C0C0C] px-2 py-0.5">
                      DEVEN EDGE
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={15}
                  className={`shrink-0 text-[#04B8BB] transition-transform duration-300 ${openIdx === index ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {openIdx === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="pb-8">
                      <ul className="grid gap-x-8 gap-y-3 grid-cols-1 sm:grid-cols-2 text-[13px] leading-[1.65] text-[#FCFAF9]/75">
                        {(tier.items || []).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#04B8BB]/60 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── VALUE STACK ──────────────────────────────────────────────────────────────
function ValueStack({ valueStack, onReserve }) {
  const data = valueStack || defaultContent.valueStack;
  const itemsToRender = data.valueItems && data.valueItems.length > 0
    ? data.valueItems.filter(item => item.visible !== false)
    : (data.rows || []).map(row => ({ title: row.inclusion, displayValue: row.val }));

  // Parse headline — last word is the highlighted one ("desk.")
  const headlineLines = (data.headline || "Your desk\ncomes with\nmore than\na desk.").split('\n');

  return (
    <section className="bg-[#FCFAF9] text-[#0C0C0C] py-24 sm:py-36 border-y border-[rgba(12,12,12,0.14)]" data-testid="section-value-stack">
      <div className="container-wide grid gap-y-16 gap-x-16 lg:grid-cols-[1fr_1.1fr] lg:gap-24 items-start">

        {/* Left */}
        <RevealOnScroll className="lg:sticky lg:top-28">
          <div className="section-label mb-8">05 — THE VALUE</div>
          <h2
            className="font-display font-black leading-[1.01] tracking-tight uppercase"
            style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
          >
            {headlineLines.map((line, i) => {
              // Highlight the last line (assumed to be "a desk.")
              if (i === headlineLines.length - 1) {
                return (
                  <span key={i} className="block text-[#DF9716]">{line}</span>
                );
              }
              return <span key={i} className="block">{line}</span>;
            })}
          </h2>
          <p className="mt-8 text-[14px] leading-[1.75] text-[#0C0C0C]/75 max-w-[400px]">
            {data.body || 'No inflated comparison price, no hidden bundle. We publish our true market value transparently.'}
          </p>
          <div className="mt-10">
            <button onClick={onReserve} className="button button-primary" data-testid="button-value-reserve">
              Lock In This Price <ArrowUpRight size={14} />
            </button>
          </div>
        </RevealOnScroll>

        {/* Right: Value table */}
        <RevealOnScroll delay={0.1}>
          {/* Header row */}
          <div className="flex items-center justify-between py-4 border-b border-[rgba(12,12,12,0.14)] text-[9.5px] font-black uppercase tracking-[0.2em] text-[#0C0C0C]/50">
            <span>INCLUDED</span>
            <span>MARKET VALUE</span>
          </div>

          {/* Items */}
          {itemsToRender.map((item, index) => (
            <div key={index} className="value-row">
              <span className="value-row-num">{String(index + 1).padStart(2, '0')}</span>
              <span className="value-row-title">{item.title}</span>
              <span className="value-row-dots" />
              <span className="value-row-price">{item.displayValue}</span>
            </div>
          ))}
          {itemsToRender.length === 0 && (
            <p className="py-6 text-[13px] text-[#555]">No value items added yet.</p>
          )}

          {/* Total + Founding price */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between py-5 border-t border-[rgba(12,12,12,0.14)] border-b border-b-[rgba(12,12,12,0.08)]">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0C0C0C]/50">TOTAL VALUE</span>
              <span className="font-display font-black text-[22px] text-[#0C0C0C]/75">{data.totalValue}</span>
            </div>
            <div className="flex items-center justify-between bg-[#DF9716] p-6">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[.2em] text-black/60 block">FOUNDING MEMBER RATE</span>
                <span className="text-[10px] font-bold text-black/50 mt-0.5 block">Rate locked for 12 months</span>
              </div>
              <span className="font-display font-black text-[26px] text-black leading-none">{data.foundingPrice}</span>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

// ─── GUARANTEE ────────────────────────────────────────────────────────────────
function Guarantee({ guarantee, onReserve }) {
  const data = guarantee || defaultContent.riskReversal;
  const blocks = data.blocks || [];

  return (
    <section className="bg-[#DF9716] text-[#0C0C0C] border-y border-[rgba(12,12,12,0.14)] py-24 sm:py-36" data-testid="section-guarantee">
      <div className="container-wide grid gap-y-14 gap-x-16 lg:grid-cols-[1fr_1fr] lg:gap-20 items-start">
        <RevealOnScroll>
          <div className="text-[10px] uppercase tracking-[0.28em] text-black/60 font-bold">06 — RISK FREE</div>
          <h2
            className="mt-6 font-display font-black leading-[1.02] text-black uppercase tracking-tight"
            style={{ fontSize: 'clamp(34px, 5vw, 62px)' }}
          >
            {(data.headline || 'Try Deven Co-Work — Completely Risk Free').split('\n').map((line, i, arr) => (
              <span key={i} className="block">{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h2>
          <p className="mt-6 text-[14px] leading-[1.75] text-black/75 max-w-[420px]">
            {data.subheadline || "No risk, no lock-in. Come in and experience Raipur's most premium space with total confidence."}
          </p>
          <div className="mt-10">
            <button onClick={onReserve} className="button button-dark" data-testid="button-guarantee-reserve">
              Book Your Free 2-Day Trial <ArrowUpRight size={14} />
            </button>
          </div>
        </RevealOnScroll>

        <div className="border-t border-black/20 divide-y divide-black/12">
          {blocks.map((block, index) => (
            <RevealOnScroll key={index} delay={index * 0.1} className="py-9">
              <h4 className="font-display text-[15px] font-bold text-black uppercase tracking-[0.03em] flex items-start gap-4">
                <span className="text-[10px] font-bold text-black/40 mt-1">{String(index + 1).padStart(2, '0')}</span>
                {block.title}
              </h4>
              <p className="mt-4 text-[13px] leading-[1.75] text-black/75 max-w-[520px] pl-7">{block.description}</p>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SOCIAL PROOF ─────────────────────────────────────────────────────────────
function SocialProof({ socialProof, onReserve }) {
  const data = socialProof || defaultContent.socialProof;
  const testimonials = (data.testimonials || []).filter(t => t.published !== false);

  return (
    <section className="bg-[#024E5C] text-[#FCFAF9] py-24 sm:py-36 border-b border-[rgba(252,250,249,0.16)]" data-testid="section-social-proof">
      <div className="container-wide grid gap-y-14 gap-x-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <RevealOnScroll>
          <div className="section-label mb-6">07 — SOCIAL PROOF</div>
          <h2
            className="font-display font-black leading-[1.04] text-[#FCFAF9] uppercase tracking-tight"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
          >
            {data.headline || 'What Founders Are Saying'}
          </h2>
          <p className="mt-6 text-[14px] leading-[1.75] text-[#FCFAF9]/75 max-w-[380px]">
            {data.subheadline || 'Hear from our members who switched to Deven Co-Work.'}
          </p>
          <div className="mt-10">
            <Button onClick={onReserve} testId="button-social-reserve">Book Your Free Trial</Button>
          </div>
        </RevealOnScroll>

        <div>
          {testimonials.length === 0 ? (
            <RevealOnScroll className="border border-dashed border-[rgba(252,250,249,0.2)] p-14 text-center">
              <p className="text-[13px] text-[#FCFAF9]/60">Testimonials coming soon.</p>
              <p className="text-[11px] text-[#FCFAF9]/40 mt-2">Add them from Admin → CMS → Social Proof.</p>
            </RevealOnScroll>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={stagger}
              className="grid gap-4 sm:grid-cols-2"
            >
              {testimonials.map((t, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="border border-[rgba(252,250,249,0.16)] bg-[#024E5C] p-7 flex flex-col justify-between hover:border-[#04B8BB]/40 transition-colors duration-300"
                >
                  <div>
                    <span className="font-display font-black text-[48px] leading-none text-[#04B8BB]/20 block mb-2">"</span>
                    <p className="text-[13px] leading-[1.7] text-[#FCFAF9]/90 font-medium">{t.quote}</p>
                  </div>
                  <div className="mt-8 border-t border-[rgba(252,250,249,0.12)] pt-5">
                    <span className="font-display font-bold text-[#DF9716] text-[10px] uppercase tracking-wider block">— {t.author}</span>
                    <span className="text-[9.5px] text-[#FCFAF9]/60 uppercase tracking-wider mt-1 block font-semibold">{t.role}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ─── PRICING ──────────────────────────────────────────────────────────────────
  function Pricing({ onReserve, pricing }) {
    const data = pricing || defaultContent.pricing;
    const plans = data.plans || [];

    return (
      <section
        className="bg-[#FCFAF9] text-[#0C0C0C] py-24 sm:py-36 border-y border-[rgba(12,12,12,0.14)] grid-paper-light"
        id="pricing"
        data-testid="section-pricing"
      >
        <div className="container-wide grid gap-y-14 gap-x-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <RevealOnScroll>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#0C0C0C]/50 font-bold">08 — MEMBERSHIP</div>
            <h2
              className="mt-6 font-display font-black leading-[1.04] text-[#0C0C0C] uppercase tracking-tight"
              style={{ fontSize: 'clamp(30px, 4vw, 50px)' }}
            >
              {data.headline || 'Choose the room that fits the way you work.'}
            </h2>
            <p className="mt-6 text-[14px] leading-[1.75] text-[#0C0C0C]/60 max-w-[420px]">
              {data.subheadline}
            </p>

            <div className="mt-10 flex flex-col gap-5">
              <button type="button" onClick={onReserve} className="button button-dark self-start" data-testid="button-pricing-reserve">
                Book Your Free Trial <ArrowUpRight size={14} />
              </button>
              {(data.spotsLeft || data.closesDate) && (
                <div className="border-l-2 border-[#0C0C0C] pl-5">
                  <p className="text-[13px] font-bold leading-[1.65] text-[#0C0C0C]">
                    ⚡ Only{' '}
                    <span className="bg-[#DF9716] text-[#0C0C0C] px-1.5 py-0.5 border border-[#0C0C0C] font-mono font-black">{data.spotsLeft}</span>
                    {' '}of 50 founding seats left — closes {data.closesDate}.
                  </p>
                  <p className="mt-1 text-[10px] text-[#0C0C0C]/50 uppercase tracking-wider font-semibold">Maximum 7 seats per company.</p>
                </div>
              )}
            </div>
          </RevealOnScroll>

          <div className="border-t border-[rgba(12,12,12,0.14)] divide-y divide-[rgba(12,12,12,0.08)]">
            {plans.map((plan, index) => (
              <RevealOnScroll key={index} delay={index * 0.07} className="py-8 flex items-start gap-5">
                <span className="font-display text-[10px] font-bold text-[#0C0C0C]/35 mt-1 shrink-0">{String(index + 1).padStart(2, '0')}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline flex-wrap gap-3">
                    <h4 className="font-display text-[16px] font-bold text-[#0C0C0C] uppercase tracking-[0.03em]">{plan.name}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#0C0C0C]/35 line-through font-mono">{plan.standard}</span>
                      <span className="font-display text-[15px] font-black text-[#0C0C0C] bg-[#DF9716] px-2.5 py-1">
                        {plan.founding}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-[13px] text-[#0C0C0C]/60 leading-[1.7] max-w-[500px]">{plan.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ─── FAQ ──────────────────────────────────────────────────────────────────────
  function FAQ({ faq, faqSection, onReserve }) {
    const [active, setActive] = useState(null);
    const sectionData = faqSection || defaultContent.faqSection;
    const data = (faq || defaultContent.faq).filter(f => f.published !== false);

    return (
      <section className="bg-[#024E5C] text-[#FCFAF9] py-24 sm:py-36 border-b border-[rgba(252,250,249,0.16)]" id="faq" data-testid="section-faq">
        <div className="container-wide grid gap-y-14 gap-x-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <RevealOnScroll>
            <div className="section-label mb-6">09 — QUESTIONS</div>
            <h2
              className="font-display font-black leading-[1.04] text-[#FCFAF9] uppercase tracking-tight"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
            >
              {sectionData.headline || 'Before You Come In'}
            </h2>
            <p className="mt-6 text-[14px] leading-[1.75] text-[#FCFAF9]/75 max-w-[380px]">
              {sectionData.subheadline || 'Everything you need to know about memberships, pricing, rules, and billing details.'}
            </p>
            <div className="mt-10">
              <Button onClick={onReserve} testId="button-faq-reserve">Book Your Free Trial</Button>
            </div>
          </RevealOnScroll>

          <div className="border-t border-[rgba(252,250,249,0.16)]">
            {data.map((item, index) => (
              <div key={index} className="border-b border-[rgba(252,250,249,0.16)]">
                <button
                  type="button"
                  className="flex py-7 w-full items-center justify-between gap-5 text-left group"
                  onClick={() => setActive(active === index ? null : index)}
                  aria-expanded={active === index}
                  data-testid={`button-faq-${index}`}
                >
                  <div className="flex gap-5 items-start">
                    <span className="font-display text-[10px] font-bold text-[#FCFAF9]/40 tracking-[.1em] mt-1 shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[14px] font-bold text-[#FCFAF9] uppercase tracking-[0.02em] group-hover:text-[#04B8BB] transition-colors">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`shrink-0 text-[#04B8BB] transition-transform duration-300 ${active === index ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {active === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        className="max-w-[640px] pb-8 pl-10 pr-4 text-[13px] leading-[1.75] text-[#FCFAF9]/80 normal-case font-normal"
                        data-testid={`text-faq-answer-${index}`}
                      >
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── RESERVATION / FINAL CTA ──────────────────────────────────────────────────
function Reservation({ utm, finalCTA, reservation, reservedCount, globalSettings, freeTrial, bookingAmount }) {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ name: '', phone: '', email: '', company: '', email_confirm: '' });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [plan, setPlan] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ctaData = finalCTA || defaultContent.finalCTA;
  const resData = reservation || defaultContent.reservation;
  const settings = globalSettings || defaultContent.globalSettings;
  const freeTrialData = freeTrial || defaultContent.freeTrial;

  const totalSeats = resData.totalFoundingSeats || 50;
  const remainingSeats = reservedCount !== undefined ? totalSeats - reservedCount : 27;
  const scarcityText = (resData.scarcityNote || 'Only {remaining} founding desks left.')
    .replace('{remaining}', remainingSeats);

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const utmData = {
    utmSource: utm?.source || '',
    utmMedium: utm?.medium || '',
    utmCampaign: utm?.campaign || '',
  };

  const locationTimeZone = settings?.timeZone || 'Asia/Kolkata';
  const trialDays = (freeTrialData?.days && freeTrialData.days.length > 0)
    ? freeTrialData.days
    : ['Friday', 'Saturday'];
  const todayInTZ = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: locationTimeZone }).format(new Date());
  const isFreeTrialAvailable = (freeTrialData?.enabled !== false) && trialDays.includes(todayInTZ);

  const handleFreeTrial = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Please complete Name, Phone, and Email fields.');
      return;
    }
    if (!isFreeTrialAvailable) {
      setError(`Free trial is available ${trialDays.join(' & ')} only.`);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.submitFreeTrial({
        name: form.name, phone: form.phone, email: form.email,
        company: form.company, email_confirm: form.email_confirm, ...utmData
      });
      localStorage.setItem('last_reservation', JSON.stringify({ ...res.data, isLead: true }));
      setLocation('/thank-you');
    } catch (err) {
      setError(err.message || 'Failed to submit free trial request.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please provide at least Name and Phone to continue.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.submitWhatsAppLead({
        name: form.name, phone: form.phone,
        email: form.email || 'N/A', company: form.company || 'N/A', ...utmData
      });
    } catch (e) {
      console.warn('Failed to log WhatsApp inquiry lead:', e);
    } finally {
      setLoading(false);
    }
    const waNum = (resData.whatsappNumber || settings.whatsapp || '+91 62605 82852').replace('+', '');
    const userIntro = form.name ? `Hi, I'm ${form.name.trim()}. ` : 'Hi, ';
    const waText = encodeURIComponent(
      `${userIntro}I'm interested in joining Deven Cowork. I'd like to know more about the founding member plans.`
    );
    window.open(`https://wa.me/${waNum}?text=${waText}`, '_blank');
  };

  const handlePaidReservation = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Please complete Name, Phone, and Email fields.');
      return;
    }
    if (!plan) {
      setError('Please select a preferred plan (Hot Desk / Dedicated Desk).');
      return;
    }
    setError('');
    setLoading(true);
    api.submitReservation({
      name: form.name, phone: form.phone, email: form.email, company: form.company,
      seatNumbers: selectedSeats, plan: plan, email_confirm: form.email_confirm || '', ...utmData
    })
    .then((res) => {
      const { reservation: savedRes, razorpayOrder } = res;
      if (!razorpayOrder) {
        localStorage.setItem('last_reservation', JSON.stringify(savedRes));
        setLocation('/thank-you');
        return;
      }
      const options = {
        key: razorpayOrder.key_id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Deven Cowork',
        description: `Seat Reservation${selectedSeats.length ? ` - Seats ${selectedSeats.join(', ')}` : ''}`,
        order_id: razorpayOrder.id,
        prefill: { name: form.name, contact: form.phone, email: form.email },
        theme: { color: '#DF9716' },
        handler: async function (response) {
          try {
            setLoading(true);
            const confirmRes = await api.confirmReservation({
              reservationId: savedRes._id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            localStorage.setItem('last_reservation', JSON.stringify(confirmRes.data));
            setLocation('/thank-you');
          } catch (err) {
            setError(err.message || 'Payment verification failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: async function () {
            await api.failReservation(savedRes._id);
            setError('Payment cancelled. Your seat lock has been released.');
            setLoading(false);
          },
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response) {
        await api.failReservation(savedRes._id);
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    })
    .catch((err) => {
      setLoading(false);
      setError(err.message || 'Failed to initialize seat reservation. Please try again.');
    });
  };

  const headlineLines = (resData.reservationHeading || 'Lock in your\nfounding member\nseat.').split('\n');

  return (
    <section
      className="border-t border-[rgba(12,12,12,0.14)] bg-[#FCFAF9] py-20 sm:py-28 text-[#0C0C0C]"
      id="reservation"
      data-testid="section-reservation"
    >
      <div className="container-wide">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20 items-start">

          {/* Left: Heading & scarcity */}
          <RevealOnScroll className="space-y-6 lg:sticky lg:top-24">
            <div className="section-label">10 — RESERVE</div>
            <h2
              className="font-display font-black leading-[1.04] text-[#0C0C0C] uppercase tracking-tight"
              style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
            >
              {headlineLines.map((line, i) => (
                <span key={i} className="block">
                  {i === headlineLines.length - 1
                    ? <span className="text-[#DF9716]">{line}</span>
                    : line}
                </span>
              ))}
            </h2>
            <p className="text-[14px] leading-[1.75] text-[#0C0C0C]/75 max-w-[440px]">
              {resData.reservationDescription}
            </p>

            {/* Scarcity */}
            <div className="scarcity-badge flex-col items-start py-2">
              <span className="text-[#DF9716] text-[10px] font-black">FOUNDING BATCH</span>
              <span className="text-[#0C0C0C]/75 text-[11px] mt-1 whitespace-pre-line">
                {resData.scarcityText || scarcityText}
              </span>
            </div>

            {/* Trial availability badge */}
            <div className={`inline-flex items-center gap-2 border px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] ${
              isFreeTrialAvailable
                ? 'border-[#DF9716]/40 text-[#DF9716] bg-[#DF9716]/5'
                : 'border-[rgba(12,12,12,0.15)] text-[#0C0C0C]/55'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isFreeTrialAvailable ? 'bg-[#DF9716] animate-pulse' : 'bg-neutral-300'}`} />
              {isFreeTrialAvailable
                ? `Free Trial Available Today (${todayInTZ})`
                : `Free Trial: ${trialDays.join(' & ')} only`}
            </div>
          </RevealOnScroll>

          {/* Right: Form */}
          <RevealOnScroll delay={0.1} className="space-y-5 min-w-0 w-full overflow-hidden">
            <form className="space-y-4 w-full min-w-0" onSubmit={(e) => e.preventDefault()}>
              {/* Honeypot */}
              <input type="text" name="email_confirm" style={{ display: 'none' }} tabIndex={-1} autoComplete="off"
                onChange={(e) => update('email_confirm', e.target.value)} value={form.email_confirm || ''} />

              <div className="grid grid-cols-2 gap-4">
                <label className="field-label col-span-2 sm:col-span-1">
                  <span>Full Name *</span>
                  <input type="text" placeholder="Rahul Sharma" value={form.name}
                    onChange={(e) => update('name', e.target.value)} required disabled={loading} />
                </label>
                <label className="field-label col-span-2 sm:col-span-1">
                  <span>Phone Number *</span>
                  <input type="tel" placeholder="+91" value={form.phone}
                    onChange={(e) => update('phone', e.target.value)} required disabled={loading} />
                </label>
              </div>

              <label className="field-label">
                <span>Email Address *</span>
                <input type="email" placeholder="rahul@company.com" value={form.email}
                  onChange={(e) => update('email', e.target.value)} required disabled={loading} />
              </label>

              <label className="field-label">
                <span>Company / Project Name (Optional)</span>
                <input type="text" placeholder="Your Startup" value={form.company}
                  onChange={(e) => update('company', e.target.value)} disabled={loading} />
              </label>

              {/* Seat map toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="w-full border border-[rgba(2,78,92,0.25)] hover:border-[#04B8BB]/40 transition-colors bg-white py-3.5 px-5 flex justify-between items-center text-[10px] font-bold tracking-[0.15em] uppercase text-[#024E5C] hover:text-[#04B8BB]"
                >
                  <span>{showMap ? 'Hide Seating Floor Plan (Optional)' : 'Select Specific Seat on Floor Map (Optional)'}</span>
                  <ChevronDown size={13} className={`transition-transform duration-300 ${showMap ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showMap && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="mt-3">
                        <SeatSelection
                          selectedSeats={selectedSeats}
                          onSeatsChange={setSelectedSeats}
                          preferredPlan={plan}
                          onPlanChange={setPlan}
                          bookingAmount={bookingAmount}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Plan selector */}
              <label className="field-label">
                <span>Preferred Membership Plan</span>
                <select value={plan} onChange={(e) => setPlan(e.target.value)} required>
                  <option value="">Select plan type...</option>
                  <option value="Hot Desk">Hot Desk (₹5,999/mo founding rate)</option>
                  <option value="Dedicated Desk">Dedicated Desk (₹8,999/mo founding rate)</option>
                </select>
              </label>

              {error && (
                <p className="text-[11px] text-red-600 bg-red-50 p-3.5 border border-red-200">
                  {error}
                </p>
              )}

              {/* Three action buttons */}
              <div className="space-y-3 pt-2">
                {/* Primary: Reserve My Seat */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handlePaidReservation}
                    className="button button-primary w-full justify-between py-4 text-[10.5px] font-bold uppercase tracking-[0.15em]"
                  >
                    <span>{resData.reserveButtonText || 'RESERVE MY SEAT'}</span>
                    <span className="text-[10px] font-mono opacity-80">
                      {bookingAmount === null ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        `Deposit ₹${selectedSeats.length > 0 ? (selectedSeats.length * bookingAmount).toLocaleString('en-IN') : bookingAmount.toLocaleString('en-IN')}`
                      )}
                    </span>
                  </button>
                  <p className="text-[9px] text-[#0C0C0C]/60 uppercase tracking-[0.14em] text-center font-bold">
                    {resData.depositNote || 'Refundable Deposit · UPI-first Checkout'}
                  </p>
                </div>

                {/* Secondary + Tertiary */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Free Trial */}
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleFreeTrial}
                      className="button button-outline-dark w-full justify-center py-3.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                    >
                      {resData.trialButtonText || 'GET 2-DAY FREE TRIAL'}
                    </button>
                    <p className="text-[8.5px] text-[#0C0C0C]/60 uppercase text-center font-bold tracking-wider">
                      {isFreeTrialAvailable
                        ? `✓ Available today · ${trialDays.join(' & ')}`
                        : `${trialDays.join(' & ')} only`}
                    </p>
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleWhatsApp}
                      className="button button-outline-dark w-full justify-center py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] border-[#22c55e]/35 text-[#22c55e] hover:bg-[#22c55e]/5 hover:border-[#22c55e]/50"
                    >
                      {resData.whatsappButtonText || 'BOOK VIA WHATSAPP'}
                    </button>
                    <p className="text-[8.5px] text-[#0C0C0C]/60 uppercase text-center font-bold tracking-wider">
                      Chat directly with our team
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ footer, globalSettings }) {
  const data = footer || defaultContent.footer;
  const settings = globalSettings || defaultContent.globalSettings;
  const phone = data.phone || settings.phone || '+91 62605 82852';
  const email = data.email || settings.email || 'bookings@devencowork.com';
  const address = data.address || settings.address || '';
  const mapsEmbedSrc = settings.mapsEmbedSrc || '';
  const mapsUrl = settings.mapsUrl || '';
  const logoUrl = getMediaUrl(settings.logo) || '';

  const copyrightRaw = data.copyright || settings.copyright || '© {year} Deven Co-Work · Approved founding rate is locked upon deposit reservation';
  const copyright = copyrightRaw.replace('{year}', new Date().getFullYear());
  const cleanPhoneHref = `tel:${phone.replaceAll(' ', '')}`;

  return (
    <footer className="border-t border-[rgba(252,250,249,0.16)] bg-[#0C0C0C] py-24 sm:py-36 text-[#FCFAF9]">
      <div className="container-wide grid gap-y-16 gap-x-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <Logo logoUrl={logoUrl} />
          <p className="mt-7 text-[13px] leading-[1.75] text-[#FCFAF9]/75 max-w-[400px]">{data.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[10.5px] text-[#FCFAF9]/55">
            {(data.quickLinks || []).map((link, idx) => (
              <a key={idx} href={link.href} className="hover:text-[#DF9716] transition-colors">{link.label}</a>
            ))}
          </div>
        </div>

        <div className="border-t border-[rgba(252,250,249,0.16)]">
          <div className="border-b border-[rgba(252,250,249,0.16)] py-9 flex items-start gap-5">
            <span className="font-display text-[10px] font-bold text-[#FCFAF9]/35 mt-1">01</span>
            <div>
              <h4 className="font-display text-[13px] font-bold text-[#FCFAF9] tracking-[.05em] uppercase">Location</h4>
              <p className="mt-2.5 text-[12px] text-[#FCFAF9]/75 leading-[1.75]">{address}</p>
            </div>
          </div>

          <div className="border-b border-[rgba(252,250,249,0.16)] py-9 flex items-start gap-5">
            <span className="font-display text-[10px] font-bold text-[#FCFAF9]/35 mt-1">02</span>
            <div>
              <h4 className="font-display text-[13px] font-bold text-[#FCFAF9] tracking-[.05em] uppercase">Direct Contact</h4>
              <p className="mt-2.5 text-[12px] text-[#FCFAF9]/75 leading-[1.75]">
                <a href={cleanPhoneHref} className="text-[#DF9716] hover:text-[#04B8BB] transition-colors" data-testid="link-footer-phone">{phone}</a>
                <br />
                <a href={`mailto:${email}`} className="text-[#DF9716] hover:text-[#04B8BB] transition-colors">{email}</a>
              </p>
            </div>
          </div>

          <div className="py-9 flex items-start gap-5">
            <span className="font-display text-[10px] font-bold text-[#FCFAF9]/35 mt-1">03</span>
            <div className="w-full">
              <h4 className="font-display text-[13px] font-bold text-[#FCFAF9] tracking-[.05em] uppercase">Find Us</h4>
              {mapsEmbedSrc && (
                <div className="mt-4 relative h-[100px] w-full border border-[rgba(252,250,249,0.12)] overflow-hidden">
                  <iframe
                    src={mapsEmbedSrc}
                    className="map-embed absolute inset-0 w-full h-full border-0"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-[11px] font-bold text-[#DF9716] hover:text-[#04B8BB] transition-colors"
                  data-testid="link-footer-directions"
                >
                  Get Directions ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide mt-14 border-t border-[rgba(252,250,249,0.08)] pt-8 text-[9.5px] uppercase tracking-[.16em] text-[#FCFAF9]/45 flex flex-col sm:flex-row justify-between gap-3">
        <p>{copyright}</p>
        <p>Premium Coworking / Podcast Studio</p>
      </div>
    </footer>
  );
}

// ─── WHATSAPP FLOAT ───────────────────────────────────────────────────────────
function WhatsAppFloat({ whatsapp, message }) {
  const number = whatsapp || '+91 62605 82852';
  const cleanNumber = number.replaceAll(' ', '').replaceAll('+', '');
  const text = encodeURIComponent(message || "Hi, I'd like to reserve a seat at Deven Co-Work");
  return (
    <a
      href={`https://wa.me/${cleanNumber}?text=${text}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-4 z-30 flex min-h-11 items-center gap-2 border border-[#DF9716] bg-[#024E5C] px-5 text-[10.5px] font-bold text-[#FCFAF9] shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all hover:bg-[#024E5C]/90 hover:border-[#04B8BB] sm:right-5"
      data-testid="link-floating-whatsapp"
    >
      <MessageCircle size={15} className="text-[#04B8BB]" />
      <span className="hidden sm:inline">Chat on WhatsApp →</span>
    </a>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function Home() {
  const [content, setContent] = useState(defaultContent);
  const [cmsLoaded, setCmsLoaded] = useState(false);
  const [cmsFailed, setCmsFailed] = useState(false);
  const [utm, setUtm] = useState({ source: '', medium: '', campaign: '' });
  const [reserveOpen, setReserveOpen] = useState(false);
  const [reservedCount, setReservedCount] = useState(23);
  const [bookingAmount, setBookingAmount] = useState(null);

  const fetchLiveSeatsCount = () => {
    api.fetchSeats()
      .then((res) => {
        if (res.success && res.data) {
          const count = res.data.filter(s => s.status === 'reserved' && !s.isStaff).length;
          setReservedCount(count);
          if (res.seatDepositAmount) {
            setBookingAmount(res.seatDepositAmount);
          } else {
            setBookingAmount(1000);
          }
        }
      })
      .catch((err) => console.error('Failed to query seats count', err));
  };

  useEffect(() => {
    const applySEO = (seo, settings) => {
      document.title = seo?.title || defaultContent.seo.title;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', seo?.description || defaultContent.seo.description);

      const faviconUrl = getMediaUrl(settings?.favicon);
      if (faviconUrl) {
        let linkFavicon = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
        if (!linkFavicon) {
          linkFavicon = document.createElement('link');
          linkFavicon.setAttribute('rel', 'icon');
          document.head.appendChild(linkFavicon);
        }
        linkFavicon.setAttribute('href', faviconUrl);
      }

      const ogImgUrl = getMediaUrl(seo?.ogImage || settings?.ogImage);
      if (ogImgUrl) {
        let metaOgImg = document.querySelector('meta[property="og:image"]');
        if (!metaOgImg) {
          metaOgImg = document.createElement('meta');
          metaOgImg.setAttribute('property', 'og:image');
          document.head.appendChild(metaOgImg);
        }
        metaOgImg.setAttribute('content', ogImgUrl);
      }
    };

    applySEO(defaultContent.seo, defaultContent.globalSettings);

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || '';
    const utmMedium = params.get('utm_medium') || '';
    const utmCampaign = params.get('utm_campaign') || '';
    if (utmSource || utmMedium || utmCampaign) {
      setUtm({ source: utmSource, medium: utmMedium, campaign: utmCampaign });
    }

    api.fetchPublishedContent()
      .then((res) => {
        if (res.success && res.data) {
          const merged = mergeContent(defaultContent, res.data);
          setContent(merged);
          applySEO(merged.seo, merged.globalSettings);
          setCmsLoaded(true);
        } else {
          setCmsFailed(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load published content. Using defaults.', err);
        setCmsFailed(true);
      });

    fetchLiveSeatsCount();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}//${host}`);
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'SEAT_UPDATE') fetchLiveSeatsCount();
      } catch (err) {
        console.error('Error in App.jsx WS message listener', err);
      }
    };
    return () => ws.close();
  }, []);

  const scrollToReservation = () => {
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
    setReserveOpen(true);
  };

  const sectionOrder = content.sectionOrder || defaultContent.sectionOrder;
  const sectionViz = content.sectionVisibility || defaultContent.sectionVisibility;

  const sectionComponents = {
    hero: <Hero key="hero" onReserve={scrollToReservation} hero={content.hero} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />,
    problem: <Problems key="problem" problem={content.problem} onReserve={scrollToReservation} />,
    guide: <Guide key="guide" guide={content.guide} onReserve={scrollToReservation} />,
    plan: <Plan key="plan" plan={content.plan} onReserve={scrollToReservation} />,
    offerStack: <OfferStack key="offerStack" offerStack={content.offerStack} onReserve={scrollToReservation} />,
    valueStack: <ValueStack key="valueStack" valueStack={content.valueStack} onReserve={scrollToReservation} />,
    guarantee: <Guarantee key="guarantee" guarantee={content.riskReversal} onReserve={scrollToReservation} />,
    socialProof: <SocialProof key="socialProof" socialProof={content.socialProof} onReserve={scrollToReservation} />,
    pricing: <Pricing key="pricing" onReserve={scrollToReservation} pricing={content.pricing} />,
    faq: <FAQ key="faq" faq={content.faq} faqSection={content.faqSection} onReserve={scrollToReservation} />,
    finalCTA: (
      <Reservation
        key="finalCTA"
        utm={utm}
        finalCTA={content.finalCTA}
        reservation={content.reservation}
        reservedCount={reservedCount}
        globalSettings={content.globalSettings}
        freeTrial={content.freeTrial || defaultContent.freeTrial}
        bookingAmount={bookingAmount}
      />
    ),
  };

  return (
    <div className="site-noise min-h-[100dvh] bg-[#0C0C0C]">
      <Header onReserve={scrollToReservation} content={content} />
      <main>
        {sectionOrder
          .filter(key => sectionViz[key] !== false)
          .map(key => sectionComponents[key] || null)}
      </main>
      <Footer footer={content.footer} globalSettings={content.globalSettings} />
      <WhatsAppFloat
        whatsapp={content.footer?.whatsapp || content.globalSettings?.whatsapp}
        message={content.reservation?.whatsappMessage}
      />
      {reserveOpen && <span className="sr-only" aria-live="polite">Reservation form is in view.</span>}
    </div>
  );
}

// ─── ROUTING ──────────────────────────────────────────────────────────────────
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/thank-you" component={ThankYou} />
      <Route component={NotFound} />
    </Switch>
  );
}

function RoutedErrorBoundary({ children }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/$/, '') : ''}>
          <RoutedErrorBoundary>
            <Router />
          </RoutedErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;