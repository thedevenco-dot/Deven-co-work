import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown, Clock3, MapPin, MessageCircle, Phone, ShieldCheck, Users, X } from 'lucide-react';
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
// This is the fallback content used when CMS data is unavailable.
// All keys here map 1:1 to the MongoDB Content schema.
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
    description: "Deven Cowork is Raipur's most premium coworking space. Reserve one of 50 founding seats — private cabins, content studio, and a real founder's community.",
    keywords: 'coworking raipur, coworking space raipur, private cabin raipur, founder workspace raipur, deven cowork',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
  },
  navigation: {
    items: [
      { label: 'Pricing', url: '#pricing', external: false, visible: true, order: 0 },
      { label: 'Cabins', url: '#reservation', external: false, visible: true, order: 1 },
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
    eyebrow: "RAIPUR'S FOUNDERS' WORKSPACE",
    location: 'VIP ESTATE, A1, VIP COLONY, SHANKAR NAGAR, RAIPUR, CHHATTISGARH 492001',
    headline: "Not Just a Desk.\nYour Complete Founder's Operating System.",
    subheadline: "Raipur's most premium coworking space — private cabins, a content studio, a real community, and everything you need to grow, not just work.",
    primaryCtaLabel: 'Book Your Free 2-Day Trial',
    primaryCtaUrl: '#reservation',
    secondaryCtaLabel: 'See Founding Member Pricing ↓',
    secondaryCtaUrl: '#pricing',
    foundingPriceNote: 'Founding plan from ₹5,999 / month · Rate locked for founding batch',
    videoUrl: '/assets/hero-workspace.mp4',
    imageUrl: '/assets/hero-fallback.png',
    stats: [
      { main: '2-Day Free Trial', sub: 'No card required' },
      { main: '500 Mbps Wifi', sub: 'High Speed' },
      { main: '9 AM–9 PM, 7 Days', sub: 'Access Hours' },
      { main: 'Central Raipur Location', sub: 'City Centre' },
    ],
  },
  problem: {
    headline: 'Still Working From Your Dining Table, a Noisy Café, or a Cramped Office?',
    body: "You've outgrown working from home. The wifi drops during client calls. There's nowhere professional to host a meeting. And every \"coworking space\" you've seen in Raipur feels like a leftover office with some beanbags thrown in.\n\nYou didn't start your business to work like this.",
    imageUrl: '',
    blocks: [
      { title: 'The Dining Table Trap', description: 'Your family loves you, but they are also your loudest distractions. You cannot build a company between laundry cycles and kitchen noise.', icon: 'Home' },
      { title: 'The Noisy Café Tax', description: 'Buying ₹300 lattes just to borrow WiFi for two hours is not a business model. It is a slow leak in your runway.', icon: 'Coffee' },
      { title: 'The Cramped Office Prison', description: 'Renting a tiny, windowless room in a commercial building is depressing. It kills your creativity and makes client meetings awkward.', icon: 'Briefcase' },
    ],
    problemPoints: [
      { title: 'The Dining Table Trap', description: 'Your family loves you, but they are also your loudest distractions. You cannot build a company between laundry cycles and kitchen noise.' },
      { title: 'The Noisy Café Tax', description: 'Buying ₹300 lattes just to borrow WiFi for two hours is not a business model. It is a slow leak in your runway.' },
      { title: 'The Cramped Office Prison', description: 'Renting a tiny, windowless room in a commercial building is depressing. It kills your creativity and makes client meetings awkward.' },
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
      { image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', label: 'MAIN AREA' },
      { image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80', label: 'PODCAST DESK' },
      { image: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=400&q=80', label: 'MEETING ROOM' },
      { image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80', label: 'CAFE LOBBY' },
      { image: 'https://images.unsplash.com/photo-1530745342582-0795f23ec976?auto=format&fit=crop&w=600&q=80', label: 'GREEN ZONE' },
      { image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80', label: 'TECH LOUNGE' },
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
      { title: 'Pick Your Plan', description: 'Hot Desk, Dedicated Desk, or a Private Cabin — whatever fits.' },
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
    headline: "Here's Everything You Actually Get",
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
    valueItems: [
      { title: 'Dedicated Workspace, 9 AM–9 PM, 7 Days', value: 6000, displayValue: '₹6,000/mo', visible: true },
      { title: '500 Mbps Wifi, Printer, Locker, Charging Points', value: 0, displayValue: 'Priceless', visible: true },
      { title: 'Coffee Bar — 20+ Coffees, 5+ Teas', value: 1500, displayValue: '₹1,500/mo', visible: true },
      { title: '2 Events + AI Workshop + Book Workshop/month', value: 2500, displayValue: '₹2,500/mo', visible: true },
      { title: 'Deven Library Access — 100+ Books', value: 500, displayValue: '₹500/mo', visible: true },
      { title: "Founder's Growth WhatsApp Community", value: 0, displayValue: 'Priceless', visible: true },
      { title: 'Content Studio + Podcast + Instagram Collab', value: 8000, displayValue: '₹8,000+/mo', visible: true },
      { title: 'Professional Photoshoot — every 6 months', value: 15000, displayValue: '₹15,000 one-time', visible: true },
    ],
    totalValue: '₹25,000+/month',
    foundingPrice: 'From ₹5,999/month',
  },
  riskReversal: {
    headline: 'Try Deven Co-Work — Completely Risk Free',
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
      { name: 'Private Cabin', standard: '₹15,000/mo', founding: '[Cabin Pricing placeholder / Contact Us]', desc: 'Locked private space for scaling teams. Premium cabin infrastructure, full growth benefits, and priority booking.' },
      { name: 'Meeting Room', standard: '₹500/hr', founding: '₹399/hr', desc: 'Professional team meeting space. Interactive digital panel, high-speed connection, and host credentials.' },
      { name: 'Studio Hourly', standard: '₹1,500/hr', founding: '₹999/hr', desc: 'Professional audio/video podcast and content recording setup. High-grade gear, lighting, and audio backdrops.' },
    ],
  },
  faqSection: {
    headline: 'Before You Come In',
    subheadline: 'Everything you need to know about memberships, pricing, rules, and billing details.',
  },
  faq: [
    { question: 'Do I need to commit long-term?', answer: 'No. Month-to-month is available. Annual plans get 2 free months if you want to lock in the lowest rate.', published: true, order: 0 },
    { question: 'What happens after the 2-day free trial?', answer: 'Nothing automatic — no card is charged. If you love it, our team helps you pick the right plan.', published: true, order: 1 },
    { question: 'What if I want to cancel?', answer: "30 days' notice, no penalties, no hidden fees.", published: true, order: 2 },
    { question: 'Can I upgrade later (e.g., Hot Desk to Cabin)?', answer: 'Yes, anytime — Founding Members get priority access when cabins open up.', published: true, order: 3 },
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
  },
  footer: {
    tagline: "Raipur's Most Premium Coworking Space",
    quickLinks: [
      { label: 'Pricing', href: '#pricing' },
      { label: 'Cabins', href: '#reservation' },
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
// Safely merges CMS DB content on top of defaults.
// Arrays replace entirely; objects are shallowly merged.
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

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function Button({ children, onClick, href, className = '', variant = 'primary', testId }) {
  const content = <>{children}<ArrowUpRight size={16} strokeWidth={1.8} /></>;
  if (href) return <a href={href} className={`button button-${variant} ${className}`} data-testid={testId}>{content}</a>;
  return <button type="button" onClick={onClick} className={`button button-${variant} ${className}`} data-testid={testId}>{content}</button>;
}

function Logo({ logoUrl }) {
  return (
    <Link href="/" className="logo text-[#F1F1F1]" data-testid="link-logo">
      {logoUrl ? (
        <img src={logoUrl} alt="Deven Co-Work" className="h-8 object-contain" />
      ) : (
        <>
          <span className="logo-mark" aria-hidden="true"><span /><span /></span>
          <span className="font-display text-[21px] tracking-[.02em]">DEVEN</span>
          <span className="mt-[3px] text-[9px] font-bold tracking-[.18em] text-[#A3A3A3]">COWORK</span>
        </>
      )}
    </Link>
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
    const onScroll = () => setSolid(window.scrollY > 18);
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
    <header className={`fixed left-0 right-0 top-0 z-30 transition-colors duration-250 ${solid ? 'border-b border-[#242424] bg-[#000000]/90 backdrop-blur' : 'bg-transparent'}`}>
      <div className="container-wide flex h-[72px] items-center justify-between gap-4">
        <Logo logoUrl={logoUrl} />

        <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[.15em] text-[#A3A3A3]">
          {visibleNav.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
              onClick={(e) => handleNavClick(e, item.url)}
              className="hover:text-[#FFC400] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <a href={cleanPhoneHref} className="hidden text-xs font-bold uppercase tracking-wider text-[#FFC400] transition-colors hover:text-white sm:inline" data-testid="link-header-phone">
            Call Now: {phone}
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
function Hero({ onReserve, hero }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const data = hero || defaultContent.hero;

  // Render headline with line breaks from \n
  const headlineLines = (data.headline || '').split('\n');

  const handleCtaClick = (e, url) => {
    if (url && url.startsWith('#')) {
      e.preventDefault();
      document.getElementById(url.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-[#242424] pt-[72px]" data-testid="section-hero">
      {/* Background Video */}
      {!videoFailed && data.videoUrl && (
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 grayscale contrast-125 opacity-30"
          onError={() => setVideoFailed(true)}
        >
          <source src={getMediaUrl(data.videoUrl)} type="video/mp4" />
        </video>
      )}

      {/* Fallback Background Still Image */}
      {(videoFailed || !data.videoUrl) && data.imageUrl && (
        <img
          src={getMediaUrl(data.imageUrl)}
          alt="Deven Cowork space preview"
          className="absolute inset-0 w-full h-full object-cover z-0 grayscale contrast-125 opacity-35"
        />
      )}

      {/* Dark Legibility Overlay */}
      <div className="absolute inset-0 bg-[#000000]/65 z-10 pointer-events-none" />

      <div className="container-wide relative z-20 flex min-h-[calc(100dvh-72px)] flex-col justify-center pb-12 pt-16 sm:min-h-[800px] sm:pb-24">
        <div className="max-w-[850px] text-left">
          <div className="reveal eyebrow flex items-center gap-3 text-[#FFC400]">
            <span className="h-px w-6 bg-[#FFC400]" />
            {data.eyebrow || "RAIPUR'S FOUNDERS' WORKSPACE"}
          </div>
          <h1 className="reveal reveal-delay-1 mt-8 font-display text-4xl sm:text-5xl md:text-[68px] font-bold leading-[1.02] tracking-[-.02em] text-[#F1F1F1] uppercase max-w-[800px]">
            {headlineLines.map((line, i) => (
              <span key={i}>{line}{i < headlineLines.length - 1 && <br />}</span>
            ))}
          </h1>
          <p className="reveal reveal-delay-2 mt-8 max-w-[540px] text-[15px] leading-7 text-[#A3A3A3]">
            {data.subheadline}
          </p>

          <div className="reveal reveal-delay-3 mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
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
              {data.secondaryCtaLabel || 'See Founding Member Pricing ↓'}
            </a>
          </div>

          {data.foundingPriceNote && (
            <p className="mt-8 text-xs text-[#77736d] uppercase tracking-wider">
              {data.foundingPriceNote}
            </p>
          )}
        </div>

        <div className="mt-20 grid max-w-[900px] grid-cols-2 border-t border-[#242424] pt-8 sm:grid-cols-4 gap-8">
          {(data.stats || []).map((item, index) => {
            const main = typeof item === 'object' ? item.main : item;
            const sub = typeof item === 'object' ? item.sub : '';
            return (
              <div key={index} className="pr-3">
                <p className="font-display text-[22px] font-bold tracking-[.01em] text-[#F1F1F1] uppercase">{main}</p>
                <p className="mt-2 text-[9px] uppercase tracking-[.15em] text-[#77736d] font-bold">{sub}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="absolute bottom-7 right-8 hidden items-center gap-3 text-[9px] uppercase tracking-[.2em] text-[#77736d] font-bold lg:flex">
        <ArrowDownRight size={14} className="text-[#FFC400]" /> Scroll to discover
      </div>
    </section>
  );
}

// ─── GUIDE ────────────────────────────────────────────────────────────────────
function Guide({ guide, onReserve }) {
  const data = guide || defaultContent.guide;
  const gallery = (data.gallery || defaultContent.guide.gallery);

  return (
    <section className="bg-[#FFC400] text-black border-y-2 border-black py-32 sm:py-40" data-testid="section-guide">
      <div className="container-wide">
        <div className="grid gap-y-16 gap-x-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-black font-bold">02 — THE GUIDE</div>
            <h2 className="mt-8 font-display text-3xl md:text-[42px] font-bold leading-[1.05] text-black uppercase max-w-[500px]">
              {data.headline || 'We Built the Space Raipur Founders Actually Deserve.'}
            </h2>
            <div className="mt-16 flex flex-col gap-2 font-display text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none select-none opacity-20">
              <span>WORKSPACE</span>
              <span>STUDIO</span>
              <span>GROWTH</span>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div className="space-y-6 text-[14px] leading-7 text-black/85 max-w-[550px] font-medium">
              <p>{data.body1}</p>
              <p>{data.body2}</p>
            </div>
            <div className="mt-8">
              <button onClick={onReserve} className="button button-dark" data-testid="button-guide-tour">
                Book Free Trial <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="mt-24 border-t border-black/25 pt-16">
          <h3 className="font-display text-2xl md:text-[32px] font-bold text-black uppercase tracking-tight mb-12">
            {data.galleryTitle || 'A Space Built for Professional Work'}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Left Column */}
            <div className="flex flex-col gap-4">
              {gallery[0] && (
                <div className="relative aspect-[4/5] w-full border border-black bg-black overflow-hidden">
                  <img src={getMediaUrl(gallery[0].image)} alt={gallery[0].label || 'Workspace'} className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 opacity-50 hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-4 left-4 text-[9px] uppercase tracking-[.15em] text-white font-bold bg-black px-2 py-0.5 pointer-events-none">{gallery[0].label}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {gallery[1] && (
                  <div className="relative aspect-square w-full border border-black bg-black overflow-hidden">
                    <img src={getMediaUrl(gallery[1].image)} alt={gallery[1].label || 'Space'} className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 opacity-50 hover:opacity-80 transition-opacity" />
                    <div className="absolute bottom-4 left-4 text-[9px] uppercase tracking-[.15em] text-white font-bold bg-black px-2 py-0.5 pointer-events-none">{gallery[1].label}</div>
                  </div>
                )}
                {gallery[2] && (
                  <div className="relative aspect-square w-full border border-black bg-black overflow-hidden">
                    <img src={getMediaUrl(gallery[2].image)} alt={gallery[2].label || 'Space'} className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 opacity-50 hover:opacity-80 transition-opacity" />
                    <div className="absolute bottom-4 left-4 text-[9px] uppercase tracking-[.15em] text-white font-bold bg-black px-2 py-0.5 pointer-events-none">{gallery[2].label}</div>
                  </div>
                )}
              </div>
            </div>
            {/* Right Column */}
            <div className="flex flex-col gap-4">
              {gallery.slice(3, 6).map((item, idx) => (
                <div key={idx} className="relative aspect-[16/10] w-full border border-black bg-black overflow-hidden">
                  <img src={getMediaUrl(item.image)} alt={item.label || 'Space'} className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 opacity-50 hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-4 left-4 text-[9px] uppercase tracking-[.15em] text-white font-bold bg-black px-2 py-0.5 pointer-events-none">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PROBLEMS ─────────────────────────────────────────────────────────────────
function Problems({ problem, onReserve }) {
  const data = problem || defaultContent.problem;
  const pointsToRender = data.problemPoints && data.problemPoints.length > 0 ? data.problemPoints : (data.blocks || []);
  const imgSrc = getMediaUrl(data.imageUrl) || 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=800&q=80';
  const showCta = data.cta?.enabled !== false;
  const ctaUrl = data.cta?.url || '#reservation';
  const ctaLabel = data.cta?.label || 'Book Your Free 2-Day Trial';

  return (
    <section className="container-wide py-32 sm:py-40 bg-[#000000] text-[#F1F1F1]" data-testid="section-problems">
      <div className="grid gap-y-16 gap-x-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div className="flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#FFC400] font-bold">01 — THE PROBLEM</div>
            <h2 className="mt-8 font-display text-3xl md:text-[42px] font-bold leading-[1.05] text-[#F1F1F1] uppercase max-w-[500px]">
              {data.headline}
            </h2>
            <p className="mt-8 text-[14px] leading-7 text-[#A3A3A3] max-w-[480px]">
              {data.body}
            </p>
          </div>
          <div className="mt-12 border border-[#242424] overflow-hidden">
            <img
              src={imgSrc}
              alt="Frustrated founder working"
              className="w-full aspect-[4/3] object-cover grayscale contrast-125 opacity-40 hover:opacity-60 transition-opacity"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between border-t border-[#242424] lg:border-t-0">
          <div className="divide-y divide-[#242424]">
            {pointsToRender.map((point, index) => (
              <div className="py-8 sm:py-10 flex items-start gap-6" key={index}>
                <span className="font-display text-[11px] font-bold text-[#FFC400] tracking-[0.1em] mt-1">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4 className="font-display text-lg font-semibold text-[#F1F1F1] uppercase tracking-[0.02em]">{point.title}</h4>
                  <p className="mt-3 text-xs leading-relaxed text-[#A3A3A3] max-w-[500px]">{point.description}</p>
                </div>
              </div>
            ))}
            {pointsToRender.length === 0 && (
              <p className="py-8 text-xs text-[#A3A3A3]">No problem points added yet.</p>
            )}
          </div>
          {showCta && (
            <div className="mt-12 pt-8 border-t border-[#242424]">
              <Button
                href={ctaUrl}
                onClick={ctaUrl.startsWith('#') ? (e) => {
                  e.preventDefault();
                  if (ctaUrl === '#reservation') {
                    onReserve();
                  } else {
                    document.querySelector(ctaUrl)?.scrollIntoView({ behavior: 'smooth' });
                  }
                } : undefined}
                testId="button-problems-tour"
              >
                {ctaLabel}
              </Button>
            </div>
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
    <section className="border-b border-[#242424] bg-[#000000] text-[#F1F1F1] py-32 sm:py-40" data-testid="section-plan">
      <div className="container-wide grid gap-y-16 gap-x-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#FFC400] font-bold">03 — THE PLAN</div>
          <h2 className="mt-8 font-display text-3xl md:text-[42px] font-bold leading-[1.05] text-[#F1F1F1] uppercase max-w-[500px]">
            {data.headline || 'Getting Started Is Simple'}
          </h2>
          <div className="mt-10">
            <Button onClick={onReserve} testId="button-plan-reserve">
              {data.ctaLabel || 'Start With Your Free Trial'}
            </Button>
          </div>
        </div>

        <div className="border-t border-[#242424]">
          {steps.map((step, index) => (
            <div className="border-b border-[#242424] py-10 flex items-start gap-8" key={index}>
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-[#FFC400] tracking-tighter mt-1 select-none">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h4 className="font-display text-xl font-semibold text-[#F1F1F1] uppercase tracking-[0.02em]">{step.title}</h4>
                <p className="mt-3 text-sm leading-relaxed text-[#A3A3A3] max-w-[550px]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



// ─── OFFER STACK ──────────────────────────────────────────────────────────────
function OfferStack({ onReserve, offerStack }) {
  const data = offerStack || defaultContent.offerStack;
  const tiers = data.tiers || [];

  return (
    <section className="container-wide py-32 sm:py-40 bg-[#000000] text-[#F1F1F1]" data-testid="section-offer">
      <div className="grid gap-y-16 gap-x-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#FFC400] font-bold">04 — THE FOUNDER'S OS</div>
          <h2 className="mt-8 font-display text-3xl md:text-[42px] font-bold leading-[1.05] text-[#F1F1F1] uppercase max-w-[500px]">
            {data.headline || "Everything Included in The Deven Founder's OS"}
          </h2>
          <p className="mt-6 text-[14px] leading-relaxed text-[#A3A3A3] max-w-[450px]">
            {data.subheadline || 'Not a list of amenities. A complete system to work, grow, and be seen.'}
          </p>
          <div className="mt-10">
            <Button onClick={onReserve} testId="button-offer-reserve">Claim Your Founding Spot</Button>
          </div>
        </div>

        <div className="border-t border-[#242424] divide-y divide-[#242424]">
          {tiers.map((tier, index) => (
            <div className="py-10" key={index}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h4 className="font-display text-lg font-bold text-[#F1F1F1] uppercase tracking-[0.02em] flex items-center gap-3">
                  <span className="text-[11px] font-bold text-[#FFC400]">{String(index + 1).padStart(2, '0')}</span>
                  {tier.heading}
                </h4>
                {tier.isDevenEdge && (
                  <span className="text-[9px] font-bold uppercase tracking-[.15em] bg-[#FFC400] text-black px-2 py-0.5 select-none">
                    DEVEN EDGE
                  </span>
                )}
              </div>
              <ul className="mt-8 grid gap-x-8 gap-y-4 grid-cols-1 sm:grid-cols-2 text-[13px] leading-relaxed text-[#A3A3A3]">
                {(tier.items || []).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 border-l-2 border-[#FFC400]/40 pl-3">
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
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

  return (
    <section className="bg-offwhite text-dark py-32 sm:py-40 border-y border-[#D4D4D2]" data-testid="section-value-stack">
      <div className="container-wide grid gap-y-16 gap-x-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-black font-bold">05 — THE VALUE</div>
          <h2 className="mt-8 font-display text-3xl md:text-[42px] font-bold leading-[1.05] text-dark uppercase max-w-[500px]">
            {data.headline || "Here's Everything You Actually Get"}
          </h2>
          <p className="mt-6 text-[14px] leading-relaxed text-black/75 max-w-[450px]">
            {data.body || 'No inflated comparison price, no hidden bundle. We publish our true market value transparently.'}
          </p>
          <div className="mt-10">
            <button onClick={onReserve} className="button button-dark" data-testid="button-value-reserve">
              Lock In This Price <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        <div className="border-t border-black/20">
          <div className="flex items-center justify-between py-5 border-b border-black/25 text-[11px] font-extrabold uppercase tracking-[0.15em] text-black/50">
            <span>INCLUDED</span>
            <span>MARKET VALUE</span>
          </div>

          <div className="divide-y divide-black/10">
            {itemsToRender.map((item, index) => (
              <div className="flex items-center justify-between py-5 text-[13px] font-medium text-black/85" key={index}>
                <span className="pr-4">
                  <span className="font-mono text-xs text-black/40 mr-2">{String(index + 1).padStart(2, '0')}</span>
                  {item.title}
                </span>
                <span className="font-mono text-xs text-black/60 font-semibold">{item.displayValue}</span>
              </div>
            ))}
            {itemsToRender.length === 0 && (
              <p className="py-5 text-xs text-black/50">No value items added yet.</p>
            )}
          </div>

          <div className="mt-10 border-t-2 border-black pt-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.1em] text-black/65">
              <span>TOTAL VALUE</span>
              <span className="text-lg font-display text-black font-extrabold">{data.totalValue}</span>
            </div>
            <div className="flex items-center justify-between bg-[#FFC400] p-6 border border-black">
              <span className="text-xs font-black uppercase tracking-[0.15em] text-black">FOUNDING MEMBER RATE</span>
              <span className="text-2xl font-display font-black text-black">{data.foundingPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



// ─── GUARANTEE ────────────────────────────────────────────────────────────────
function Guarantee({ guarantee, onReserve }) {
  const data = guarantee || defaultContent.riskReversal;
  const blocks = data.blocks || [];

  return (
    <section className="bg-[#FFC400] text-black border-y-2 border-black py-32 sm:py-40" data-testid="section-guarantee">
      <div className="container-wide grid gap-y-16 gap-x-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-black font-bold">06 — RISK FREE</div>
          <h2 className="mt-8 font-display text-4xl md:text-[52px] font-black leading-[1.02] text-black uppercase tracking-tight">
            {(data.headline || 'Try Deven Co-Work — Completely Risk Free').split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h2>
          <p className="mt-6 text-[14px] leading-relaxed text-black/85 max-w-[450px]">
            {data.subheadline || "No risk, no lock-in. Come in and experience Raipur's most premium space with total confidence."}
          </p>
          <div className="mt-10">
            <button onClick={onReserve} className="button button-dark" data-testid="button-guarantee-reserve">
              Book Your Free 2-Day Trial <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        <div className="border-t border-[#242424]/20 divide-y divide-[#242424]/10">
          {blocks.map((block, index) => (
            <div className="py-8 sm:py-10" key={index}>
              <h4 className="font-display text-lg font-bold text-black uppercase tracking-[0.02em] flex items-center gap-3">
                <span className="text-[11px] font-bold text-black/60">{String(index + 1).padStart(2, '0')}</span>
                {block.title}
              </h4>
              <p className="mt-3 text-[13px] leading-relaxed text-black/80 max-w-[550px]">{block.description}</p>
            </div>
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
    <section className="container-wide py-32 sm:py-40 bg-[#000000] text-[#F1F1F1]" data-testid="section-social-proof">
      <div className="grid gap-y-16 gap-x-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#FFC400] font-bold">07 — SOCIAL PROOF</div>
          <h2 className="mt-8 font-display text-3xl md:text-[42px] font-bold leading-[1.05] text-[#F1F1F1] uppercase max-w-[500px]">
            {data.headline || 'What Founders Are Saying'}
          </h2>
          <p className="mt-6 text-[14px] leading-relaxed text-[#A3A3A3] max-w-[450px]">
            {data.subheadline || 'Hear from our members who switched to Deven Co-Work.'}
          </p>
          <div className="mt-10">
            <Button onClick={onReserve} testId="button-social-reserve">Book Your Free Trial</Button>
          </div>
        </div>

        <div>
          {testimonials.length === 0 ? (
            <div className="border border-dashed border-[#242424] p-12 text-center text-[#A3A3A3] text-sm">
              Testimonials coming soon. Add them from Admin → CMS → Social Proof.
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2">
              {testimonials.map((t, idx) => (
                <div key={idx} className="border border-[#242424] bg-[#0A0A0A] p-8 flex flex-col justify-between hover:border-[#FFC400] transition-colors relative">
                  <div>
                    <p className="text-[14px] leading-relaxed text-[#F1F1F1] italic font-medium">"{t.quote}"</p>
                  </div>
                  <div className="mt-8 border-t border-[#242424] pt-6">
                    <span className="font-display font-bold text-[#FFC400] text-xs uppercase tracking-wider block">— {t.author}</span>
                    <span className="text-[10px] text-[#77736d] uppercase tracking-wider mt-1 block font-semibold">{t.role}</span>
                  </div>
                </div>
              ))}
            </div>
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
    <section className="bg-offwhite text-dark py-32 sm:py-40 border-y border-[#D4D4D2]" id="pricing" data-testid="section-pricing">
      <div className="container-wide grid gap-y-16 gap-x-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-black font-bold">08 — MEMBERSHIP</div>
          <h2 className="mt-8 font-display text-3xl md:text-[42px] font-bold leading-[1.05] text-dark uppercase max-w-[500px]">
            {data.headline || 'Choose the room that fits the way you work.'}
          </h2>
          <p className="mt-6 text-[14px] leading-relaxed text-black/75 max-w-[450px]">
            {data.subheadline || 'Choose the membership tier that fits your workflow. Reserve your spot today to lock in these exclusive founding rates.'}
          </p>

          <div className="mt-12 flex flex-col gap-6">
            <div>
              <button type="button" onClick={onReserve} className="button button-dark" data-testid="button-pricing-reserve">
                Book Your Free Trial <ArrowUpRight size={16} />
              </button>
            </div>

            {(data.spotsLeft || data.closesDate) && (
              <div className="border-l-2 border-black pl-5 mt-6">
                <p className="text-[14px] font-bold leading-relaxed text-black">
                  ⚡ Only <span className="bg-[#FFC400] px-1.5 py-0.5 border border-black font-mono font-black">{data.spotsLeft}</span> of 20 Founding Member spots left — locked for 12 months, closes {data.closesDate}.
                </p>
                <p className="mt-2 text-xs text-black/60 uppercase tracking-wider font-semibold">Maximum 7 seats per company.</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-black/20 divide-y divide-black/10">
          {plans.map((plan, index) => (
            <div className="py-8 sm:py-10 flex items-start gap-5" key={index}>
              <span className="font-display text-[11px] font-bold text-black/50 mt-1">{String(index + 1).padStart(2, '0')}</span>
              <div className="flex-1">
                <div className="flex justify-between items-baseline flex-wrap gap-4">
                  <h4 className="font-display text-lg font-bold text-black uppercase tracking-[0.02em]">{plan.name}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-black/45 line-through font-mono">{plan.standard}</span>
                    <span className="font-display text-[15px] font-extrabold text-black bg-[#FFC400] px-2 py-0.5 border border-black font-mono">
                      {plan.founding}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-[13px] text-black/75 leading-relaxed max-w-[550px]">{plan.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ({ faq, faqSection, onReserve }) {
  const [active, setActive] = useState(0);
  const sectionData = faqSection || defaultContent.faqSection;
  const data = (faq || defaultContent.faq).filter(f => f.published !== false);

  return (
    <section className="container-wide py-32 sm:py-40 bg-[#000000] text-[#F1F1F1]" id="faq" data-testid="section-faq">
      <div className="grid gap-y-16 gap-x-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#FFC400] font-bold">09 — QUESTIONS</div>
          <h2 className="mt-8 font-display text-3xl md:text-[42px] font-bold leading-[1.05] text-[#F1F1F1] uppercase max-w-[500px]">
            {sectionData.headline || 'Before You Come In'}
          </h2>
          <p className="mt-6 text-[14px] leading-relaxed text-[#A3A3A3] max-w-[450px]">
            {sectionData.subheadline || 'Everything you need to know about memberships, pricing, rules, and billing details.'}
          </p>
          <div className="mt-10">
            <Button onClick={onReserve} testId="button-faq-reserve">Book Your Free Trial</Button>
          </div>
        </div>

        <div className="border-t border-[#242424]">
          {data.map((item, index) => (
            <div key={index} className="border-b border-[#242424]">
              <button
                type="button"
                className="flex py-6 sm:py-8 w-full items-center justify-between gap-5 text-left text-[16px] font-bold text-[#F1F1F1] uppercase tracking-[0.02em]"
                onClick={() => setActive(active === index ? null : index)}
                aria-expanded={active === index}
                data-testid={`button-faq-${index}`}
              >
                <div className="flex gap-5">
                  <span className="font-display text-[11px] font-bold text-[#77736d] tracking-[.08em] mt-1">0{index + 1}</span>
                  <span>{item.question}</span>
                </div>
                <ChevronDown size={16} className={`shrink-0 text-[#FFC400] transition-transform ${active === index ? 'rotate-180' : ''}`} />
              </button>
              {active === index && (
                <div className="max-w-[680px] pb-8 pl-9 pr-4 text-[14px] leading-7 text-[#A3A3A3] normal-case font-normal" data-testid={`text-faq-answer-${index}`}>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── RESERVATION / FINAL CTA ──────────────────────────────────────────────────
function Reservation({ utm, finalCTA, reservation, reservedCount, globalSettings, freeTrial }) {
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

  // Build the scarcity note by replacing {remaining} placeholder
  const scarcityText = (resData.scarcityNote || 'Only {remaining} founding desks left.')
    .replace('{remaining}', reservedCount !== undefined ? (resData.totalFoundingSeats || 50) - reservedCount : 27);

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const utmData = {
    utmSource: utm?.source || '',
    utmMedium: utm?.medium || '',
    utmCampaign: utm?.campaign || '',
  };

  // Free trial availability (timezone-aware). Default timezone for coworking location.
  const locationTimeZone = globalSettings?.timeZone || 'Asia/Kolkata';
  const trialDays = (freeTrial?.days && freeTrial.days.length > 0) ? freeTrial.days : ['Friday', 'Saturday'];
  const todayInTZ = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: locationTimeZone }).format(new Date());
  const isFreeTrialAvailable = (freeTrial?.enabled !== false) && trialDays.includes(todayInTZ);

  // Option 1: Get 2 Days Free Trial (No seat selection required)
  const handleFreeTrial = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Please complete Name, Phone, and Email fields.');
      return;
    }
    if (!isFreeTrialAvailable) {
      setError('Free trial is available Friday & Saturday.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.submitFreeTrial({
        name: form.name,
        phone: form.phone,
        email: form.email,
        company: form.company,
        email_confirm: form.email_confirm,
        ...utmData
      });
      localStorage.setItem('last_reservation', JSON.stringify({ ...res.data, isLead: true }));
      setLocation('/thank-you');
    } catch (err) {
      setError(err.message || 'Failed to submit free trial request.');
    } finally {
      setLoading(false);
    }
  };

  // Option 2: Book via WhatsApp (No seat selection required)
  const handleWhatsApp = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please provide at least Name and Phone to continue.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Log lead inquiry on server (non-blocking CRM sync)
      await api.submitWhatsAppLead({
        name: form.name,
        phone: form.phone,
        email: form.email || 'N/A',
        company: form.company || 'N/A',
        ...utmData
      });
    } catch (e) {
      console.warn('Failed to log WhatsApp inquiry lead:', e);
    } finally {
      setLoading(false);
    }

    const waNum = (resData.whatsappNumber || settings.whatsapp || '+91 62605 82852').replace('+', '');
    const userIntro = form.name ? `Hi, I'm ${form.name.trim()}. ` : 'Hi, ';
    const waText = encodeURIComponent(`${userIntro}I'm interested in joining Deven Cowork. I'd like to know more about the founding member plans.`);
    window.open(`https://wa.me/${waNum}?text=${waText}`, '_blank');
  };

  // Option 3: Reserve My Seat (UPI Paid Booking, seat selection strictly required)
  const handlePaidReservation = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Please complete Name, Phone, and Email fields.');
      return;
    }
    if (!plan) {
      setError('Please select a preferred plan (Hot Desk / Dedicated Desk / Private Cabin).');
      return;
    }

    setError('');
    setLoading(true);

    api.submitReservation({
      name: form.name,
      phone: form.phone,
      email: form.email,
      company: form.company,
      seatNumbers: selectedSeats,
      plan: plan,
      email_confirm: form.email_confirm || '',
      ...utmData
    })
    .then((res) => {
      const { reservation: savedRes, razorpayOrder } = res;
      // If server did not return a razorpayOrder (amount may be zero / no-seat reservation), treat as complete
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
        description: `Seat Reservation - Seats ${selectedSeats.join(', ')}`,
        order_id: razorpayOrder.id,
        prefill: { name: form.name, contact: form.phone, email: form.email },
        theme: { color: '#FFC400' },
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

  return (
    <section className="border-t border-[#242424] bg-[#000000] py-20 sm:py-28 text-[#F1F1F1]" id="reservation" data-testid="section-reservation">
      <div className="container-wide">
        
        {/* Core Layout Grid */}
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16 items-start">
          
          {/* Left Column: Heading Copy & Scarcity */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#FFC400] font-bold">10 — RESERVATION</div>
            <h2 className="font-display text-3xl md:text-[38px] font-bold leading-[1.1] text-[#F1F1F1] uppercase">
              {resData.reservationHeading || 'LOCK IN YOUR FOUNDING MEMBER SEAT TODAY.'}
            </h2>
            <p className="text-sm leading-6 text-[#A3A3A3] max-w-[480px]">
              {resData.reservationDescription || 'Only 50 seats are available in the founding batch. Choose your next step below.'}
            </p>
            
            {/* Scarcity Tag */}
            <div className="inline-flex flex-col border-l border-[#FFC400] pl-4 text-xs tracking-wider uppercase font-semibold">
              <span className="text-[10px] text-[#FFC400] font-bold">Founding Batch</span>
              <span className="text-[#A3A3A3] mt-1 whitespace-pre-line">{resData.scarcityText || scarcityText}</span>
            </div>
          </div>

          {/* Right Column: Reservation form */}
          <div className="space-y-6">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" name="email_confirm" style={{ display: 'none' }} tabIndex={-1} autoComplete="off"
                onChange={(e) => update('email_confirm', e.target.value)} value={form.email_confirm || ''} />
              
              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="field-label col-span-2 sm:col-span-1">
                    <span>Full Name *</span>
                    <input type="text" placeholder="Rahul Sharma" value={form.name} onChange={(e) => update('name', e.target.value)} required disabled={loading} />
                  </label>
                  <label className="field-label col-span-2 sm:col-span-1">
                    <span>Phone Number *</span>
                    <input type="tel" placeholder="+91" value={form.phone} onChange={(e) => update('phone', e.target.value)} required disabled={loading} />
                  </label>
                </div>
                <label className="field-label">
                  <span>Email Address *</span>
                  <input type="email" placeholder="rahul@company.com" value={form.email} onChange={(e) => update('email', e.target.value)} required disabled={loading} />
                </label>
                
                {/* Honeypot field */}
                <input type="email" name="email_confirm" value={form.email_confirm} onChange={(e) => update('email_confirm', e.target.value)} style={{ display: 'none' }} tabIndex="-1" autoComplete="off" />

                <label className="field-label">
                  <span>Company / Project Name (Optional)</span>
                  <input type="text" placeholder="Your Startup" value={form.company} onChange={(e) => update('company', e.target.value)} disabled={loading} />
                </label>
              </div>

              {/* Progressive Disclosure Seat Map Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="w-full border border-[#242424] hover:border-[#FFC400]/40 transition-colors bg-[#080808] py-3 px-4 flex justify-between items-center text-[10px] font-bold tracking-wider uppercase text-[#A3A3A3] hover:text-[#FFC400]"
                >
                  <span>{showMap ? 'Hide Seating Floor Plan (Optional)' : 'Select Specific Seat on Floor Map (Optional)'}</span>
                  <span className="text-[10px] font-bold">{showMap ? '▼' : '▶'}</span>
                </button>

                {showMap && (
                  <div className="mt-3 transition-all duration-300">
                    <SeatSelection
                      selectedSeats={selectedSeats}
                      onSeatsChange={setSelectedSeats}
                      preferredPlan={plan}
                      onPlanChange={setPlan}
                    />
                  </div>
                )}
              </div>

              {/* Preferred Plan Selector */}
              <div>
                <label className="field-label">
                  <span>Preferred Membership Plan</span>
                  <select value={plan} onChange={(e) => setPlan(e.target.value)} required>
                    <option value="">Select plan type...</option>
                    <option value="Hot Desk">Hot Desk (₹5,999/mo founding rate)</option>
                    <option value="Dedicated Desk">Dedicated Desk (₹8,999/mo founding rate)</option>
                    <option value="Private Cabin">Private Cabin (Consult cabin rates)</option>
                  </select>
                </label>
              </div>

              {error && (
                <p className="text-[11px] text-[#ff4d4d] bg-[#1a0f0f] p-3 border border-[#331414] rounded">
                  {error}
                </p>
              )}

              {/* Three Booking Action Buttons */}
              <div className="space-y-3 pt-3">
                
                {/* Action 1: Reserve My Seat (Paid) */}
                <div className="space-y-1">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handlePaidReservation}
                    className="button button-primary w-full justify-between py-3.5 text-xs font-bold uppercase tracking-wider !min-h-[44px]"
                  >
                    <span>{resData.reserveButtonText || 'RESERVE MY SEAT →'}</span>
                    <span className="text-[10px] font-mono">Deposit ₹{(selectedSeats.length * 1000).toLocaleString('en-IN')}</span>
                  </button>
                  <p className="text-[9px] text-[#555] uppercase tracking-wider text-center font-semibold">
                    {resData.depositNote || 'Refundable Deposit Required'}
                  </p>
                </div>

                {/* Grid for Free Trial & WhatsApp */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Action 2: Get 2 Days Free Trial */}
                  <div className="space-y-1">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleFreeTrial}
                      className="button button-outline w-full justify-center py-3 text-[10px] font-bold uppercase tracking-wider !min-h-[40px] text-white hover:bg-white/5"
                    >
                      {resData.trialButtonText || 'GET YOUR 2-DAY FREE TRIAL'}
                    </button>
                    <p className="text-[8px] text-[#555] uppercase text-center font-bold px-1">
                      {isFreeTrialAvailable
                        ? '2-Day Free Trial — Friday & Saturday'
                        : (freeTrial?.description || 'Free trial available Friday & Saturday.')}
                    </p>
                  </div>

                  {/* Action 3: Book via WhatsApp */}
                  <div className="space-y-1">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleWhatsApp}
                      className="button button-outline w-full justify-center py-3 text-[10px] font-bold uppercase tracking-wider !min-h-[40px] border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/5"
                    >
                      {resData.whatsappButtonText || 'BOOK VIA WHATSAPP →'}
                    </button>
                    <p className="text-[8px] text-[#555] uppercase text-center font-bold">
                      Chat directly with our team.
                    </p>
                  </div>
                </div>

              </div>

            </form>
          </div>

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

  // Copyright with year substitution
  const copyrightRaw = data.copyright || settings.copyright || '© {year} Deven Co-Work · Approved founding rate is locked upon deposit reservation';
  const copyright = copyrightRaw.replace('{year}', new Date().getFullYear());

  const cleanPhoneHref = `tel:${phone.replaceAll(' ', '')}`;

  return (
    <footer className="border-t border-[#242424] bg-[#000000] py-32 sm:py-40">
      <div className="container-wide grid gap-y-16 gap-x-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <Logo logoUrl={logoUrl} />
          <p className="mt-7 text-sm leading-6 text-[#A3A3A3] max-w-[500px]">{data.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-4 text-xs text-[#77736d]">
            {(data.quickLinks || []).map((link, idx) => (
              <a key={idx} href={link.href} className="hover:text-[#FFC400] transition-colors">{link.label}</a>
            ))}
          </div>
        </div>

        <div className="border-t border-[#242424]">
          <div className="border-b border-[#242424] py-8 sm:py-10 flex items-start gap-4">
            <span className="font-display text-[11px] font-bold text-[#77736d] mt-1">01</span>
            <div>
              <h4 className="font-display text-[16px] font-bold text-[#F1F1F1] tracking-[.02em] uppercase">Raipur Coworking Space</h4>
              <p className="mt-2 text-xs text-[#A3A3A3] leading-relaxed">{address}</p>
            </div>
          </div>

          <div className="border-b border-[#242424] py-8 sm:py-10 flex items-start gap-4">
            <span className="font-display text-[11px] font-bold text-[#77736d] mt-1">02</span>
            <div>
              <h4 className="font-display text-[16px] font-bold text-[#F1F1F1] tracking-[.02em] uppercase">Direct Contact</h4>
              <p className="mt-2 text-xs text-[#A3A3A3] leading-relaxed">
                Phone: <a href={cleanPhoneHref} className="text-[#FFC400] hover:underline" data-testid="link-footer-phone">{phone}</a><br />
                Email: <a href={`mailto:${email}`} className="text-[#FFC400] hover:underline">{email}</a>
              </p>
            </div>
          </div>

          <div className="border-b border-[#242424] py-8 sm:py-10 flex items-start gap-4">
            <span className="font-display text-[11px] font-bold text-[#77736d] mt-1">03</span>
            <div className="w-full">
              <h4 className="font-display text-[16px] font-bold text-[#F1F1F1] tracking-[.02em] uppercase">Location Maps</h4>
              {mapsEmbedSrc && (
                <div className="mt-4 relative h-[120px] w-full border border-[#242424] overflow-hidden">
                  <iframe
                    src={mapsEmbedSrc}
                    className="absolute inset-0 w-full h-full border-0 grayscale opacity-35"
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
                  className="mt-3 inline-block text-xs font-semibold text-[#FFC400] hover:text-white transition-colors"
                  data-testid="link-footer-directions"
                >
                  Get Google Maps Directions ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide mt-16 border-t border-[#242424] pt-8 text-[10px] uppercase tracking-[.13em] text-[#55514b] flex flex-col sm:flex-row justify-between gap-4">
        <p>{copyright}</p>
        <p>Premium Coworking / Private Cabins / Podcast Content Studio</p>
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
      className="fixed bottom-5 right-4 z-30 flex min-h-11 items-center gap-2 border border-[#FFC400]/40 bg-[#000000] px-5 text-xs font-semibold text-[#FFC400]/85 shadow-[0_8px_30px_rgba(0,0,0,.5)] transition-all hover:text-[#FFC400] hover:border-[#FFC400] rounded-none sm:right-5"
      data-testid="link-floating-whatsapp"
    >
      <MessageCircle size={16} />
      <span className="hidden sm:inline">Or Chat With Us on WhatsApp →</span>
    </a>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function Home() {
  const [content, setContent] = useState(defaultContent);
  const [utm, setUtm] = useState({ source: '', medium: '', campaign: '' });
  const [reserveOpen, setReserveOpen] = useState(false);
  const [reservedCount, setReservedCount] = useState(23);

  const fetchLiveSeatsCount = () => {
    api.fetchSeats()
      .then((res) => {
        if (res.success && res.data) {
          const count = res.data.filter(s => s.status === 'reserved' && !s.isStaff).length;
          setReservedCount(count);
        }
      })
      .catch((err) => console.error('Failed to query seats count', err));
  };

  useEffect(() => {
    // SEO from CMS
    const applySEO = (seo, settings) => {
      document.title = seo?.title || defaultContent.seo.title;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
      metaDesc.setAttribute('content', seo?.description || defaultContent.seo.description);

      // Favicon
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

      // OG Image
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

    // UTM tracking
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || '';
    const utmMedium = params.get('utm_medium') || '';
    const utmCampaign = params.get('utm_campaign') || '';
    if (utmSource || utmMedium || utmCampaign) {
      setUtm({ source: utmSource, medium: utmMedium, campaign: utmCampaign });
    }

    // Fetch CMS content
    api.fetchPublishedContent()
      .then((res) => {
        if (res.success && res.data) {
          const merged = mergeContent(defaultContent, res.data);
          setContent(merged);
          applySEO(merged.seo, merged.globalSettings);
        }
      })
      .catch((err) => console.error('Failed to load published content. Using defaults.', err));

    fetchLiveSeatsCount();

    // WebSocket real-time subscription for scarcity
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

  // Section order and visibility from CMS
  const sectionOrder = content.sectionOrder || defaultContent.sectionOrder;
  const sectionViz = content.sectionVisibility || defaultContent.sectionVisibility;

  const sectionComponents = {
    hero: <Hero key="hero" onReserve={scrollToReservation} hero={content.hero} />,
    problem: <Problems key="problem" problem={content.problem} onReserve={scrollToReservation} />,
    guide: <Guide key="guide" guide={content.guide} onReserve={scrollToReservation} />,
    plan: <Plan key="plan" plan={content.plan} onReserve={scrollToReservation} />,
    offerStack: <OfferStack key="offerStack" offerStack={content.offerStack} onReserve={scrollToReservation} />,
    valueStack: <ValueStack key="valueStack" valueStack={content.valueStack} onReserve={scrollToReservation} />,
    guarantee: <Guarantee key="guarantee" guarantee={content.riskReversal} onReserve={scrollToReservation} />,
    socialProof: <SocialProof key="socialProof" socialProof={content.socialProof} onReserve={scrollToReservation} />,
    pricing: <Pricing key="pricing" onReserve={scrollToReservation} pricing={content.pricing} />,
    faq: <FAQ key="faq" faq={content.faq} faqSection={content.faqSection} onReserve={scrollToReservation} />,
    finalCTA: <Reservation key="finalCTA" utm={utm} finalCTA={content.finalCTA} reservation={content.reservation} reservedCount={reservedCount} globalSettings={content.globalSettings} freeTrial={content.freeTrial} />,
  };

  return (
    <div className="site-noise min-h-[100dvh] bg-[#000000]">
      <Header onReserve={scrollToReservation} content={content} />
      <main>
        {sectionOrder
          .filter(key => sectionViz[key] !== false)
          .map(key => sectionComponents[key] || null)}
      </main>
      <Footer footer={content.footer} globalSettings={content.globalSettings} />
      <WhatsAppFloat whatsapp={content.footer?.whatsapp || content.globalSettings?.whatsapp} message={content.reservation?.whatsappMessage} />
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