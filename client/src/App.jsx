import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown,
  Clock3, MapPin, MessageCircle, Phone, ShieldCheck, Users, X,
  Wifi, Coffee, Briefcase, Home as HomeIcon, Zap, Star,
  BookOpen, Sparkles, TrendingUp
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
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
import OfficeCostCalculator from '@/components/OfficeCostCalculator';
import { api } from '@/services/api';
import { getMediaUrl, getAbsoluteMediaUrl, updateFavicon } from '@/lib/utils';
export { getMediaUrl, getAbsoluteMediaUrl, updateFavicon };


const queryClient = new QueryClient();

// â”€â”€â”€ DEFAULT CONTENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    title: 'Deven Co-Work | Premium Coworking Space in Raipur',
    description: 'Raipur’s premium coworking space — a content studio, real community, and everything you need to grow, not just work. Only 50 founding seats. Maximum 7 seats per client, founder, or company.',
    keywords: 'coworking raipur, coworking space raipur, founder workspace raipur, deven cowork',
    ogTitle: 'Deven Co-Work | Premium Coworking Space in Raipur',
    ogDescription: 'Raipur’s premium coworking space — a content studio, real community, and everything you need to grow, not just work. Only 50 founding seats. Maximum 7 seats per client, founder, or company.',
    ogImage: '',
    twitterTitle: 'Deven Co-Work | Premium Coworking Space in Raipur',
    twitterDescription: 'Raipur’s premium coworking space — a content studio, real community, and everything you need to grow, not just work. Only 50 founding seats. Maximum 7 seats per client, founder, or company.',
    twitterImage: '',
  },
  navigation: {
    items: [
      { label: 'Our Space', url: '#space', external: false, visible: true, order: 0 },
      { label: "Founder's OS", url: '#offer-stack', external: false, visible: true, order: 1 },
      { label: 'How It Works', url: '#how-it-works', external: false, visible: true, order: 2 },
      { label: 'Pricing', url: '#pricing', external: false, visible: true, order: 3 },
      { label: 'FAQ', url: '#faq', external: false, visible: true, order: 4 },
      { label: 'Contact', url: '#reservation', external: false, visible: true, order: 5 },
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
    closingText: "We can offer this guarantee because we've built something we're genuinely proud of. We want you to feel that the moment you walk in.",
    ctaLabel: 'Book My Free 2-Day Trial',
    blocks: [
      { title: 'The 2-Day Free Trial', description: 'Walk in. Work from Raipur\'s best desk. Use the coffee bar. Meet the community. Leave with a clear picture of what your work life could look like. No credit card. No obligation. No awkward sales pitch. Just come.' },
      { title: 'The "Love It or Leave It" Guarantee', description: 'Join after your trial. Attend one event and one workshop in your first 30 days. If you have not made a single genuine business connection or walked away with something useful — we will refund your first month in full. No questions. No forms. No argument.' },
    ],
  },
  socialProof: {
    headline: "Don't Take Our Word For It",
    subheadline: 'Hear from Raipur founders who switched to Deven Co-Work.',
    googleRating: 4.9,
    googleReviewCount: 48,
    googleReviewUrl: 'https://www.google.com/maps/',
    testimonials: [
      {
        quote: "Moving our team to Deven Co-Work was the best decision we made this year. The internet is rock solid, the podcast studio helped us launch our show, and the founder network here is unmatched in Raipur.",
        author: "Aman Sharma",
        company: "Founder, TechScale Media",
        role: "Founder",
        photo: "",
        published: true,
        order: 1
      },
      {
        quote: "I used to work from cafes spending ₹500 a day on coffee with noisy backgrounds. Here I have a dedicated desk, high-speed WiFi, and actual quiet rooms for client video calls.",
        author: "Priya Patel",
        company: "Independent Consultant & Strategist",
        role: "Consultant",
        photo: "",
        published: true,
        order: 2
      },
      {
        quote: "The 2-day free trial convinced me instantly. The vibe, natural lighting, and community events make working here inspiring every single day.",
        author: "Rahul Verma",
        company: "Co-Founder, CodeCraft Studio",
        role: "Co-Founder",
        photo: "",
        published: true,
        order: 3
      }
    ],
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
    showBanner: true,
    seatsRemainingText: 'Only 27 of 50 founding seats left.',
    deadlineDate: null,
    totalSpots: 50,
    remainingSpots: 27,
    closingDate: '30 September 2026',
    priceLockText: 'Price locks for 12 months from joining date',
  },
  faqSection: {
    headline: 'Everything You Wanted to Ask',
    subheadline: 'Everything you need to know about memberships, pricing, rules, and billing details.',
  },
  faq: [
    { question: 'Do I need to commit to a long-term contract?', answer: 'No. Month-to-month is available on all plans. If you want the lowest possible rate, annual plans give you 2 months free — but there is absolutely no pressure to commit until you are ready.', published: true, order: 1 },
    { question: 'What happens after my 2-day free trial?', answer: 'Nothing automatic. No card is charged. If you love it, our team will help you pick the right plan and get you moved in. If you are not ready, we will stay in touch — no pressure, ever.', published: true, order: 2 },
    { question: 'What if I join and then want to cancel?', answer: '30 days notice, no penalties, no hidden fees. We want you here because you love it — not because we have trapped you.', published: true, order: 3 },
    { question: 'Can I upgrade later — say, from Hot Desk to a Cabin?', answer: 'Yes, anytime. Founding Members get priority access when a spot opens at a higher tier.', published: true, order: 4 },
    { question: 'Is the Founding Member price really locked for 12 months?', answer: 'Yes — locked from the day you join, even as standard prices increase. This is a genuine commitment from us, not a marketing trick.', published: true, order: 5 },
    { question: 'Where exactly is Deven Co-Work located?', answer: 'VIP Estate, A1, VIP Colony, Shankar Nagar, Raipur, Chhattisgarh 492001 — right in the heart of Raipur, easily reachable from anywhere in the city.', published: true, order: 6 },
    { question: 'Can I use the Content Studio and Meeting Room?', answer: 'Yes — both are included in your membership. Available on a booking basis — priority given to Founding Members.', published: true, order: 7 },
    { question: 'I work irregular hours. Is that okay?', answer: 'Deven Co-Work is open 9 AM to 9 PM, 7 days a week. 12 hours of access, every single day — including weekends.', published: true, order: 8 },
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
  sectionOrder: ['hero', 'calculator', 'problem', 'guide', 'plan', 'offerStack', 'valueStack', 'guarantee', 'socialProof', 'pricing', 'faq', 'finalCTA'],
  sectionVisibility: {
    hero: true, calculator: true, problem: true, guide: true, plan: true, offerStack: true,
    valueStack: true, guarantee: true, socialProof: true, pricing: true, faq: true, finalCTA: true,
  },
};

// â”€â”€â”€ DEEP MERGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function mergeContent(defaults, fetched) {
  if (!fetched) return defaults;
  const merged = { ...defaults, ...fetched };
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


// â”€â”€â”€ ANIMATION VARIANTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ SCROLL REVEAL WRAPPER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ HIGHLIGHT WORDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ SHARED COMPONENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ IMAGE WITH FALLBACK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ─── FOUNDING BANNER ────────────────────────────────────────────────────────
function FoundingBanner({ scarcity, cmsLoaded, cmsFailed }) {
  const s = cmsLoaded ? scarcity : (cmsFailed ? defaultContent.scarcity : null);
  if (!s || s.showBanner === false || (s.remainingSpots !== undefined && s.remainingSpots <= 0)) {
    return null;
  }

  const remaining = typeof s.remainingSpots === 'number' ? s.remainingSpots : 27;
  const total = typeof s.totalSpots === 'number' ? s.totalSpots : 50;
  const priceLock = s.priceLockText || 'Price locks for 12 months';

  return (
    <div className="bg-[#DF9716] text-[#0C0C0C] py-2 px-4 text-center text-xs font-bold tracking-wide border-b border-[#0C0C0C]/10 flex items-center justify-center gap-2 relative z-30">
      <span>⚡ Only <span className="underline font-extrabold">{remaining} of {total}</span> Founding Member spots remaining &mdash; {priceLock}</span>
    </div>
  );
}

function Header({ onReserve, content, cmsLoaded, cmsFailed }) {
  const [solid, setSolid] = useState(false);

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

  const data = cmsLoaded ? content : (cmsFailed ? defaultContent : null);

  if (!data) {
    return (
      <header
        className={`w-full transition-all duration-300 ${solid
            ? 'bg-[#024E5C]/95 backdrop-blur-md border-b border-[rgba(252,250,249,0.14)]'
            : 'bg-[#024E5C]/90 backdrop-blur-sm'
          }`}
      >
        <div className="container-wide flex h-[70px] items-center justify-between gap-4">
          <Logo logoUrl="" />
        </div>
      </header>
    );
  }

  const phone = data.header?.phone || data.globalSettings?.phone || '+91 62605 82852';
  const cleanPhoneHref = `tel:${phone.replaceAll(' ', '')}`;
  const nav = data.navigation || defaultContent.navigation;
  const visibleNav = (nav.items || [])
    .filter(i => i.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const logoUrl = getMediaUrl(data.globalSettings?.logo || data.header?.logo || '');

  return (
    <header
      className={`w-full transition-all duration-300 ${solid
          ? 'bg-[#024E5C]/95 backdrop-blur-md border-b border-[rgba(252,250,249,0.14)]'
          : 'bg-[#024E5C]/90 backdrop-blur-sm'
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
              className="hover:text-[#DF9716] transition-colors relative group text-[#FCFAF9]/85"
            >
              {item.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#DF9716] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <a
            href={cleanPhoneHref}
            className="hidden text-[10px] font-bold uppercase tracking-wider text-[#DF9716] transition-colors hover:text-white sm:inline"
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

// â”€â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Hero({ onReserve, hero, cmsLoaded = false, cmsFailed = false }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const data = cmsLoaded ? hero : (cmsFailed ? defaultContent.hero : null);

  const videoRef = useRef(null);
  const imgRef = useRef(null);

  // Determine media visibility based on loading states
  const showCmsVideo = cmsLoaded && !videoFailed && data?.videoUrl;
  const showCmsImage = cmsLoaded && (videoFailed || !data?.videoUrl) && data?.imageUrl;

  const showFallbackVideo = !cmsLoaded && cmsFailed && !videoFailed && defaultContent.hero.videoUrl;
  const showFallbackImage = !cmsLoaded && cmsFailed && (videoFailed || !defaultContent.hero.videoUrl) && defaultContent.hero.imageUrl;

  const currentVideoUrl = showCmsVideo ? data?.videoUrl : (showFallbackVideo ? defaultContent.hero.videoUrl : null);
  const currentImageUrl = showCmsImage ? data?.imageUrl : (showFallbackImage ? defaultContent.hero.imageUrl : null);

  // Reset ready state when URLs change
  useEffect(() => {
    setMediaReady(false);
  }, [currentVideoUrl, currentImageUrl]);

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

  if (!data) {
    return (
      <section
        className="relative overflow-hidden border-b border-[rgba(255,255,255,0.06)] pt-[70px] grid-paper"
        data-testid="section-hero"
      >
        <div className="container-wide relative z-20 flex min-h-[calc(100dvh-70px)] flex-col justify-center pb-16 pt-16 sm:min-h-[820px] sm:pb-28" />
      </section>
    );
  }

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
          style={{ '--section-label-color': '#DF9716' }}
        >
          {data.eyebrow || "DEVEN WORKSPACE â€” RAIPUR"}
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

            {/* Trust bar â€” factual, from existing content */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.38 }}
              className="mt-7 flex flex-wrap gap-x-6 gap-y-2"
              data-testid="hero-trust-bar"
            >
              {[
                { icon: <Check size={10} strokeWidth={3} />, text: '2-Day Free Trial â€” No card required' },
                { icon: <Wifi size={10} strokeWidth={2.5} />, text: '500 Mbps WiFi' },
                { icon: <MapPin size={10} strokeWidth={2.5} />, text: 'Raipur City Centre' },
              ].map((item, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#FCFAF9]/60"
                >
                  <span className="text-[#DF9716]">{item.icon}</span>
                  {item.text}
                </span>
              ))}
            </motion.div>

            {/* Guarantee hero badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.41 }}
              className="mt-7"
              data-testid="hero-guarantee-badge"
            >
              <div className="inline-flex items-center gap-3 bg-[#024E5C] border border-[#DF9716]/50 px-4 py-2.5 rounded-sm">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#DF9716] flex items-center justify-center">
                  <Check size={13} strokeWidth={3} className="text-black" />
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#DF9716]">Risk-Free Guarantee</div>
                  <div className="text-[10px] font-semibold text-[#FCFAF9]/90 leading-tight mt-0.5">
                    2-Day Free Trial &middot; Love It or Leave It
                  </div>
                </div>
              </div>
            </motion.div>

            {data.foundingPriceNote && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="mt-5 text-[10px] text-[#FCFAF9]/60 uppercase tracking-[0.16em] font-bold"
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

function Guide({ guide, onReserve, cmsLoaded, cmsFailed }) {
  const data = cmsLoaded ? guide : (cmsFailed ? defaultContent.guide : null);

  if (!data) {
    return (
      <section className="bg-[#024E5C] text-[#FCFAF9] border-y border-[rgba(252,250,249,0.16)] py-24 sm:py-36" data-testid="section-guide">
        <div className="container-wide min-h-[400px]" />
      </section>
    );
  }

  const gallery = data.gallery || defaultContent.guide.gallery;

  return (
    <section className="bg-[#024E5C] text-[#FCFAF9] border-y border-[rgba(252,250,249,0.16)] py-24 sm:py-36" id="space" data-testid="section-guide">
      <div className="container-wide">
        {/* Top: Brand statement */}
        <div className="grid gap-y-12 gap-x-16 lg:grid-cols-[1fr_1fr] lg:gap-24 items-start">
          <RevealOnScroll>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#DF9716] font-bold">02 — THE SPACE</div>
            <h2 className="mt-6 font-display font-black leading-[1.01] text-[#FCFAF9] uppercase tracking-tight"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
              {data.headline || 'We Built the Space Raipur Founders Actually Deserve.'}
            </h2>
            {/* Oversized watermark text */}
            <div className="mt-10 flex flex-col gap-0 font-display font-black tracking-tighter leading-none select-none opacity-[0.05] text-[#DF9716]"
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
                  <div className="h-px w-8 bg-[#DF9716] mb-2" />
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
                  <div className="h-px w-5 bg-[#DF9716] mb-1.5" />
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

function Problems({ problem, onReserve, cmsLoaded, cmsFailed }) {
  const data = cmsLoaded ? problem : (cmsFailed ? defaultContent.problem : null);

  if (!data) {
    return (
      <section className="bg-[#FCFAF9] text-[#0C0C0C] py-24 sm:py-36 border-b border-[rgba(12,12,12,0.14)]" data-testid="section-problems">
        <div className="container-wide min-h-[500px]" />
      </section>
    );
  }

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
              <div className="py-8 text-sm text-[#0C0C0C]/60 italic">No points listed.</div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── PLAN / 3-STEP PROCESS ───────────────────────────────────────────────────
function Plan({ plan, onReserve, cmsLoaded, cmsFailed }) {
  const data = cmsLoaded ? plan : (cmsFailed ? defaultContent.plan : null);

  if (!data) {
    return (
      <section className="bg-[#0C0C0C] text-[#FCFAF9] py-24 sm:py-36 border-b border-[rgba(252,250,249,0.14)]" data-testid="section-plan">
        <div className="container-wide min-h-[400px]" />
      </section>
    );
  }

  const steps = data.steps && data.steps.length > 0 ? data.steps : defaultContent.plan.steps;

  return (
    <section className="bg-[#0C0C0C] text-[#FCFAF9] py-24 sm:py-36 border-b border-[rgba(252,250,249,0.14)]" id="how-it-works" data-testid="section-plan">
      <div className="container-wide">
        <RevealOnScroll className="text-center max-w-[760px] mx-auto mb-16">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#DF9716] font-bold mb-3">HOW IT WORKS</div>
          <h2
            className="font-display font-black leading-[1.04] text-[#FCFAF9] uppercase tracking-tight"
            style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}
          >
            {data.headline || 'Getting Started Is Simple'}
          </h2>
        </RevealOnScroll>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
          {steps.map((step, idx) => (
            <RevealOnScroll key={idx} delay={idx * 0.1} className="h-full">
              <div className="bg-[#141414] border border-[rgba(252,250,249,0.12)] p-8 flex flex-col justify-between h-full rounded-sm relative group hover:border-[#DF9716]/60 transition-colors">
                <div>
                  <div className="font-display font-black text-3xl text-[#DF9716] mb-4">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <h3 className="font-display text-[16px] font-bold text-[#FCFAF9] uppercase tracking-[0.05em] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[13px] leading-[1.7] text-[#FCFAF9]/75">
                    {step.description}
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={onReserve}
            className="button button-primary px-8 py-4 text-base font-bold shadow-lg"
            data-testid="button-plan-cta"
          >
            {data.ctaLabel || 'Start With Your Free Trial'} &rarr;
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── OFFER STACK (6 ICON CARDS) & VALUE REVEAL ──────────────────────────────
function OfferStack({ onReserve, offerStack, valueStack, cmsLoaded, cmsFailed }) {
  const data = cmsLoaded ? offerStack : (cmsFailed ? defaultContent.offerStack : null);
  const valData = cmsLoaded ? valueStack : (cmsFailed ? defaultContent.valueStack : null);

  if (!data) return null;

  const fallbackData = defaultContent.offerStack;
  const tiers = (data?.tiers && data.tiers.length > 0) ? data.tiers : fallbackData.tiers;

  const totalValueStr = valData?.totalValue || defaultContent.valueStack.totalValue || '₹25,000+/month';
  const foundingPriceStr = valData?.foundingPrice || defaultContent.valueStack.foundingPrice || 'From ₹5,999/month';

  const categoryIcons = {
    'THE WORKSPACE': Briefcase,
    'THE GROWTH ENGINE': Zap,
    'THE PERSONAL BRAND BOOST': Sparkles,
    'THE LEARNING': BookOpen,
    'COMMUNITY': Users,
    'THE CONNECT': Users,
    'THE RISK-FREE ENTRY': ShieldCheck,
  };

  const defaultIcons = [Briefcase, Zap, Sparkles, BookOpen, Users, ShieldCheck];

  return (
    <section className="bg-[#F9F9F9] text-[#0C0C0C] py-24 sm:py-36 border-b border-[rgba(12,12,12,0.12)]" id="offer-stack" data-testid="section-offer">
      <div className="container-wide">
        {/* Header */}
        <RevealOnScroll className="text-center max-w-[760px] mx-auto mb-16">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#024E5C] font-black mb-3">EVERYTHING YOU GET</div>
          <h2
            className="font-display font-black leading-[1.04] text-[#0C0C0C] uppercase tracking-tight"
            style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}
          >
            {data?.headline || "The Deven Founder's OS — Everything Included"}
          </h2>
          <p className="mt-5 text-[15px] leading-[1.75] text-[#0C0C0C]/70">
            {data?.subheadline || "This is not a list of amenities. It's a complete system — built so you can focus on growing your business, not managing your workspace."}
          </p>
        </RevealOnScroll>

        {/* 6 Icon Cards Grid: 2x3 Desktop, 1-col Mobile */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.slice(0, 6).map((tier, index) => {
            const IconComponent = categoryIcons[tier.heading?.toUpperCase()] || defaultIcons[index % defaultIcons.length] || Briefcase;
            // Display top 3-4 key items for quick scanning
            const visibleItems = (tier.items || []).slice(0, 4);

            return (
              <RevealOnScroll key={index} delay={index * 0.08} className="h-full">
                <div className="bg-white border border-[rgba(12,12,12,0.12)] hover:border-[#DF9716]/60 p-7 sm:p-8 flex flex-col justify-between h-full transition-all duration-300 shadow-sm hover:shadow-md relative group rounded-sm">
                  {tier.isDevenEdge && (
                    <span className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-[.18em] bg-[#DF9716] text-[#0C0C0C] px-2.5 py-1 rounded-xs">
                      DEVEN EDGE
                    </span>
                  )}
                  <div>
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-[#024E5C]/10 border border-[#024E5C]/20 flex items-center justify-center text-[#024E5C] group-hover:bg-[#DF9716]/15 group-hover:text-[#0C0C0C] transition-colors mb-5">
                      <IconComponent size={22} strokeWidth={2.2} />
                    </div>

                    {/* Tier Title */}
                    <h3 className="font-display text-[15px] font-black text-[#0C0C0C] uppercase tracking-[0.05em] mb-4">
                      {tier.heading}
                    </h3>

                    {/* Key Benefits */}
                    <ul className="space-y-2.5 text-[13px] leading-[1.6] text-[#0C0C0C]/80 font-medium">
                      {visibleItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <Check size={14} strokeWidth={3} className="text-[#024E5C] mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {tier.items && tier.items.length > 4 && (
                    <div className="mt-5 pt-3 border-t border-[rgba(12,12,12,0.06)] text-[10px] font-bold text-[#024E5C]/70 uppercase tracking-wider">
                      + {tier.items.length - 4} more benefits included
                    </div>
                  )}
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

        {/* Dramatic Value Reveal Block */}
        <RevealOnScroll delay={0.2} className="mt-16">
          <div className="bg-[#024E5C] border border-[#024E5C] p-8 sm:p-12 text-[#FCFAF9] text-center max-w-[880px] mx-auto rounded-sm relative overflow-hidden shadow-xl">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#DF9716] mb-4">
              TRUE MARKET VALUE VS FOUNDING MEMBER PRICE
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 my-6">
              {/* Market Value */}
              <div className="text-center sm:text-right">
                <div className="text-[11px] font-bold text-[#FCFAF9]/60 uppercase tracking-widest mb-1">Total Market Value</div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-[#FCFAF9]/50 line-through decoration-red-500 decoration-2">
                  {totalValueStr}
                </div>
              </div>

              {/* Arrow */}
              <div className="text-2xl text-[#DF9716] font-bold hidden sm:block">➔</div>
              <div className="text-xl text-[#DF9716] font-bold block sm:hidden">↓</div>

              {/* Founding Price */}
              <div className="text-center sm:text-left">
                <div className="text-[11px] font-bold text-[#DF9716] uppercase tracking-widest mb-1">Your Founding Price</div>
                <div className="font-display font-black text-3xl sm:text-5xl text-[#DF9716] tracking-tight leading-none">
                  {foundingPriceStr}
                </div>
              </div>
            </div>

            <p className="text-[12px] text-[#FCFAF9]/75 mt-4 max-w-[500px] mx-auto">
              Approved rate is locked for 12 months for the founding batch upon reservation.
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={onReserve}
                className="button button-primary text-base px-8 py-4 font-bold shadow-lg"
                data-testid="button-offer-value-reserve"
              >
                Claim Your Founding Spot &rarr;
              </button>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

// â”€â”€â”€ VALUE STACK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ValueStack({ valueStack, onReserve, cmsLoaded, cmsFailed }) {
  const data = cmsLoaded ? valueStack : (cmsFailed ? defaultContent.valueStack : null);

  if (!data) {
    return (
      <section className="bg-[#FCFAF9] text-[#0C0C0C] py-24 sm:py-36 border-y border-[rgba(12,12,12,0.14)]" data-testid="section-value-stack">
        <div className="container-wide min-h-[500px]" />
      </section>
    );
  }

  const itemsToRender = data.valueItems && data.valueItems.length > 0
    ? data.valueItems.filter(item => item.visible !== false)
    : (data.rows || []).map(row => ({ title: row.inclusion, displayValue: row.val }));

  // Parse headline ── last word is the highlighted one ("desk.")
  const headlineLines = (data.headline || "Your desk\ncomes with\nmore than\na desk.").split('\n');

  return (
    <section className="bg-[#FCFAF9] text-[#0C0C0C] py-24 sm:py-36 border-y border-[rgba(12,12,12,0.14)]" data-testid="section-value-stack">
      <div className="container-wide grid gap-y-16 gap-x-16 lg:grid-cols-[1fr_1.1fr] lg:gap-24 items-start">

        {/* Left */}
        <RevealOnScroll className="lg:sticky lg:top-28">
          <div className="section-label mb-8">05 â€” THE VALUE</div>
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
            <div className="flex items-center justify-between bg-[#DF9716] text-[#0C0C0C] p-6">
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
function Guarantee({ guarantee, onReserve, cmsLoaded, cmsFailed }) {
  const data = cmsLoaded ? guarantee : (cmsFailed ? defaultContent.riskReversal : null);

  if (!data) {
    return (
      <section className="bg-[#E8F4F4] text-[#0C0C0C] border-y border-[#024E5C]/15 py-24 sm:py-36" data-testid="section-guarantee">
        <div className="container-wide min-h-[400px]" />
      </section>
    );
  }

  const blocks = data.blocks || [];
  const ctaLabel = data.ctaLabel || 'Book My Free 2-Day Trial';
  const closingText = data.closingText || "We can offer this guarantee because we've built something we're genuinely proud of. We want you to feel that the moment you walk in.";

  return (
    <section className="bg-[#E8F4F4] text-[#0C0C0C] border-y border-[#024E5C]/15 py-24 sm:py-36" data-testid="section-guarantee">
      <div className="container-wide">
        {/* Section label */}
        <RevealOnScroll>
          <div className="text-[9px] uppercase tracking-[0.3em] text-[#024E5C]/60 font-black mb-2">ZERO RISK. COMPLETELY ZERO.</div>
        </RevealOnScroll>

        <div className="mt-8 grid gap-y-14 gap-x-16 lg:grid-cols-[auto_1fr] lg:gap-20 items-start">
          {/* Left: Shield badge graphic */}
          <RevealOnScroll className="flex justify-center lg:justify-start">
            <div className="flex-shrink-0 flex flex-col items-center gap-4">
              {/* Shield */}
              <div
                className="relative flex flex-col items-center justify-center text-center"
                style={{
                  width: 160, height: 190,
                  background: '#024E5C',
                  clipPath: 'polygon(50% 0%, 100% 15%, 100% 65%, 50% 100%, 0% 65%, 0% 15%)',
                  border: 'none',
                }}
              >
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 15%, 100% 65%, 50% 100%, 0% 65%, 0% 15%)',
                  }}
                >
                  <Check size={32} strokeWidth={3} className="text-[#DF9716] mb-2" />
                  <div className="text-[8px] font-black uppercase tracking-[0.18em] text-[#DF9716] leading-tight px-4">Risk Free</div>
                  <div className="text-[7px] font-bold text-[#FCFAF9]/70 uppercase tracking-[0.1em] mt-1 px-4">Guaranteed</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#024E5C]">Deven Co-Work</div>
                <div className="text-[8px] text-[#024E5C]/60 mt-0.5">Founding Member Promise</div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Right: Content */}
          <div>
            <RevealOnScroll>
              <h2
                className="font-display font-black leading-[1.02] text-[#0C0C0C] uppercase tracking-tight"
                style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}
              >
                {(data.headline || 'Try Deven Co-Work — Completely Risk Free').split('\n').map((line, i, arr) => (
                  <span key={i} className="block">{line}{i < arr.length - 1 && <br />}</span>
                ))}
              </h2>
            </RevealOnScroll>

            <div className="mt-10 border-t border-[#024E5C]/15 divide-y divide-[#024E5C]/10">
              {blocks.map((block, index) => (
                <RevealOnScroll key={index} delay={index * 0.1} className="py-8">
                  <h4 className="font-display text-[13px] font-black text-[#024E5C] uppercase tracking-[0.06em] flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[#DF9716] flex-shrink-0 flex items-center justify-center">
                      <Check size={10} strokeWidth={3} className="text-black" />
                    </span>
                    {block.title}
                  </h4>
                  <p className="mt-4 text-[14px] leading-[1.8] text-[#0C0C0C]/75 max-w-[560px] pl-8">
                    {block.description}
                  </p>
                </RevealOnScroll>
              ))}
            </div>

            {closingText && (
              <RevealOnScroll delay={0.2}>
                <p className="mt-8 text-[13px] leading-[1.75] text-[#0C0C0C]/60 italic max-w-[520px]">
                  &ldquo;{closingText}&rdquo;
                </p>
              </RevealOnScroll>
            )}

            <RevealOnScroll delay={0.25} className="mt-10">
              <button onClick={onReserve} className="button button-dark" data-testid="button-guarantee-reserve">
                {ctaLabel} <ArrowUpRight size={14} />
              </button>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SOCIAL PROOF ─────────────────────────────────────────────────────────────
function TestimonialAvatar({ photo, name }) {
  // Render photo if available, otherwise show initials fallback
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  if (photo && typeof photo === 'object' && photo.url) {
    return <img src={photo.url} alt={name || 'Member'} className="w-12 h-12 rounded-full object-cover border-2 border-[#DF9716]/40" loading="lazy" />;
  }
  if (photo && typeof photo === 'string' && photo.startsWith('http')) {
    return <img src={photo} alt={name || 'Member'} className="w-12 h-12 rounded-full object-cover border-2 border-[#DF9716]/40" loading="lazy" />;
  }
  return (
    <div className="w-12 h-12 rounded-full bg-[#DF9716]/20 border-2 border-[#DF9716]/30 flex items-center justify-center flex-shrink-0">
      <span className="text-[13px] font-black text-[#DF9716]">{initials}</span>
    </div>
  );
}

function SocialProof({ socialProof, onReserve, cmsLoaded, cmsFailed }) {
  const data = cmsLoaded ? socialProof : (cmsFailed ? defaultContent.socialProof : null);

  if (!data) return null;

  const fallbackData = defaultContent.socialProof;
  const rawTestimonials = (data?.testimonials && data.testimonials.length > 0)
    ? data.testimonials
    : fallbackData.testimonials;

  const testimonials = [...(rawTestimonials || [])]
    .filter(t => t.published !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackData.testimonials;

  const googleRating = (data?.googleRating && data.googleRating > 0) ? data.googleRating : fallbackData.googleRating;
  const googleReviewCount = (data?.googleReviewCount && data.googleReviewCount > 0) ? data.googleReviewCount : fallbackData.googleReviewCount;
  const googleReviewUrl = data?.googleReviewUrl || fallbackData.googleReviewUrl;

  const showGoogleBar = googleRating > 0;
  const googleStars = showGoogleBar ? Math.round(googleRating) : 0;

  return (
    <section className="bg-[#024E5C] text-[#FCFAF9] py-24 sm:py-36 border-b border-[rgba(252,250,249,0.16)]" id="social-proof" data-testid="section-social-proof">
      <div className="container-wide">
        {/* Header */}
        <RevealOnScroll className="mb-16">
          <div className="section-label mb-4">WHAT RAIPUR FOUNDERS ARE SAYING</div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <h2
              className="font-display font-black leading-[1.04] text-[#FCFAF9] uppercase tracking-tight"
              style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}
            >
              {data?.headline || fallbackData.headline}
            </h2>
            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              {showGoogleBar ? (
                <a
                  href={googleReviewUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <span className="text-[#DF9716] text-[14px] tracking-tight">
                    {'★'.repeat(googleStars)}{'☆'.repeat(5 - googleStars)}
                  </span>
                  <span className="text-[11px] text-[#FCFAF9]/80 font-semibold">
                    {googleRating} on Google &middot; {googleReviewCount} Reviews
                  </span>
                </a>
              ) : null}
              <button onClick={onReserve} className="button button-primary text-sm" data-testid="button-social-reserve">
                Book Your Free Trial
              </button>
            </div>
          </div>
        </RevealOnScroll>

        {/* Testimonial cards: 3-col desktop, 1-col mobile */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {displayTestimonials.map((t, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              className="border border-[rgba(252,250,249,0.16)] bg-[#024E5C] p-7 flex flex-col justify-between hover:border-[#DF9716]/40 transition-colors duration-300 rounded-sm"
            >
              <div>
                <span className="font-display font-black text-[40px] leading-none text-[#DF9716]/25 block mb-3">&ldquo;</span>
                <p className="text-[13px] leading-[1.75] text-[#FCFAF9]/90 font-medium">{t.quote}</p>
              </div>
              <div className="mt-8 border-t border-[rgba(252,250,249,0.12)] pt-5 flex items-center gap-3">
                <TestimonialAvatar photo={t.photo} name={t.author} />
                <div>
                  <span className="font-display font-bold text-[#DF9716] text-[11px] uppercase tracking-wider block">{t.author}</span>
                  <span className="text-[10px] text-[#FCFAF9]/60 uppercase tracking-wider mt-0.5 block font-semibold">
                    {t.company || t.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────────────
function Pricing({ onReserve, pricing, scarcity, globalSettings, cmsLoaded, cmsFailed }) {
  const data = cmsLoaded ? pricing : (cmsFailed ? defaultContent.pricing : null);
  const s = scarcity || defaultContent.scarcity;
  const waNumber = (globalSettings?.whatsapp || defaultContent.globalSettings.whatsapp || '').replace(/\D/g, '');

  if (!data) {
    return (
      <section className="bg-[#FCFAF9] text-[#0C0C0C] py-24 sm:py-36 border-y border-[rgba(12,12,12,0.14)] grid-paper-light" id="pricing" data-testid="section-pricing">
        <div className="container-wide min-h-[500px]" />
      </section>
    );
  }

  const plans = data.plans || [];
  const remaining = typeof s?.remainingSpots === 'number' ? s.remainingSpots : null;
  const total = typeof s?.totalSpots === 'number' ? s.totalSpots : 50;
  const closingDate = s?.closingDate || '';

  // Determine if a plan is the cabin/contact plan
  const isCabin = (plan) => /cabin|private/i.test(plan.name) || plan.isContactPlan;
  // Determine Most Popular
  const isMostPopular = (plan) => /dedicated/i.test(plan.name) || plan.badge === 'MOST POPULAR';

  return (
    <section
      className="bg-[#FCFAF9] text-[#0C0C0C] py-24 sm:py-36 border-y border-[rgba(12,12,12,0.14)] grid-paper-light"
      id="pricing"
      data-testid="section-pricing"
    >
      <div className="container-wide">
        {/* Header */}
        <RevealOnScroll className="mb-16 max-w-[700px]">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#0C0C0C]/50 font-bold mb-4">MEMBERSHIP</div>
          <h2
            className="font-display font-black leading-[1.04] text-[#0C0C0C] uppercase tracking-tight"
            style={{ fontSize: 'clamp(30px, 4vw, 50px)' }}
          >
            {data.headline || 'Choose the room that fits the way you work.'}
          </h2>
          <p className="mt-5 text-[14px] leading-[1.75] text-[#0C0C0C]/60 max-w-[520px]">
            {data.subheadline}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start">
            <button type="button" onClick={onReserve} className="button button-dark" data-testid="button-pricing-reserve">
              Book Your Free Trial <ArrowUpRight size={14} />
            </button>
          </div>
        </RevealOnScroll>

        {/* Plan cards: 3-col on desktop */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const popular = isMostPopular(plan);
            const cabin = isCabin(plan);
            const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hi, I'd like to know more about the Private Cabin at Deven Co-Work.")}`;

            return (
              <RevealOnScroll
                key={index}
                delay={index * 0.07}
                className={[
                  'relative flex flex-col border bg-white p-7',
                  popular
                    ? 'border-[#024E5C] shadow-lg ring-1 ring-[#024E5C]/20 -translate-y-2 sm:-translate-y-3'
                    : 'border-[rgba(12,12,12,0.12)]',
                ].join(' ')}
              >
                {/* Most Popular badge */}
                {popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#DF9716] text-[#0C0C0C] text-[8.5px] font-black uppercase tracking-[0.2em] px-4 py-1">
                    MOST POPULAR
                  </div>
                )}

                {/* Plan name */}
                <h3 className="font-display text-[14px] font-black uppercase tracking-[0.06em] text-[#0C0C0C]">{plan.name}</h3>

                {/* Description */}
                {plan.desc && (
                  <p className="mt-2 text-[12px] leading-[1.7] text-[#0C0C0C]/55">{plan.desc}</p>
                )}

                {/* Pricing anchor */}
                <div className="mt-6 border-t border-[rgba(12,12,12,0.08)] pt-5">
                  {cabin ? (
                    <div>
                      <div className="text-[11px] font-semibold text-[#0C0C0C]/50 mb-1">Custom Pricing</div>
                      <div className="font-display text-[16px] font-black text-[#0C0C0C]/70 leading-tight">
                        Based on team size &amp; requirements
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {plan.standard && (
                        <span className="text-[12px] text-red-500 line-through font-mono font-semibold">
                          {plan.standard}
                        </span>
                      )}
                      {plan.founding && (
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-[24px] font-black text-[#0C0C0C] leading-none">
                            {plan.founding}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#DF9716] bg-[#DF9716]/15 px-2 py-1">
                            Founding Price
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Features list */}
                {(plan.features || []).length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {(plan.features || []).map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-[12px] text-[#0C0C0C]/70">
                        <Check size={11} strokeWidth={3} className="text-[#024E5C] mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA */}
                <div className="mt-auto pt-7">
                  {cabin ? (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button button-dark w-full text-center flex items-center justify-center gap-2"
                      data-testid={`button-plan-cabin-${index}`}
                    >
                      Talk to Us About a Cabin <ArrowUpRight size={13} />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={onReserve}
                      className={`button w-full ${popular ? 'button-primary' : 'button-dark'}`}
                      data-testid={`button-plan-${index}`}
                    >
                      Start Free Trial <ArrowUpRight size={13} />
                    </button>
                  )}
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

        {/* Scarcity note below plans */}
        {remaining !== null && remaining > 0 && (
          <RevealOnScroll delay={0.15} className="mt-10">
            <div className="border-l-2 border-[#DF9716] pl-5">
              <p className="text-[13px] font-bold leading-[1.65] text-[#0C0C0C]">
                ⚡ Only{' '}
                <span className="bg-[#DF9716] text-[#0C0C0C] px-1.5 py-0.5 border border-[#0C0C0C] font-mono font-black">{remaining}</span>
                {' '}of {total} founding spots remaining at this price
                {closingDate ? <> &mdash; closes {closingDate}</> : null}.
              </p>
              <p className="mt-1 text-[10px] text-[#0C0C0C]/50 uppercase tracking-wider font-semibold">Maximum 7 seats per company.</p>
            </div>
          </RevealOnScroll>
        )}
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
function FAQ({ faq, faqSection, globalSettings, onReserve, cmsLoaded, cmsFailed }) {
  const [active, setActive] = useState(null);
  const sectionData = cmsLoaded ? faqSection : (cmsFailed ? defaultContent.faqSection : null);
  const rawData = cmsLoaded ? (faq || []).filter(f => f.published !== false) : (cmsFailed ? defaultContent.faq.filter(f => f.published !== false) : null);

  if (!sectionData && !rawData) return null;

  const fallbackData = defaultContent.faq;
  const data = (rawData && rawData.length > 0) ? rawData : fallbackData;

  const waNumber = (globalSettings?.whatsapp || defaultContent.globalSettings.whatsapp || '').replace(/\D/g, '');
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hi, I have a question about Deven Co-Work membership.")}`;

  return (
    <section className="bg-[#024E5C] text-[#FCFAF9] py-24 sm:py-36 border-b border-[rgba(252,250,249,0.16)]" id="faq" data-testid="section-faq">
      <div className="container-wide grid gap-y-14 gap-x-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <RevealOnScroll>
          <div className="section-label mb-6 text-[#DF9716] font-black">COMMON QUESTIONS</div>
          <h2
            className="font-display font-black leading-[1.04] text-[#FCFAF9] uppercase tracking-tight"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
          >
            {sectionData?.headline || 'Everything You Wanted to Ask'}
          </h2>
          <p className="mt-6 text-[14px] leading-[1.75] text-[#FCFAF9]/75 max-w-[380px]">
            {sectionData?.subheadline || 'Everything you need to know about memberships, pricing, rules, and billing details.'}
          </p>
          <div className="mt-10">
            <Button onClick={onReserve} testId="button-faq-reserve">Book Your Free Trial</Button>
          </div>
        </RevealOnScroll>

        <div className="flex flex-col justify-between">
          <div className="border-t border-[rgba(252,250,249,0.16)]">
            {data.map((item, index) => (
              <div key={index} className="border-b border-[rgba(252,250,249,0.16)]">
                <button
                  type="button"
                  className="flex py-6 w-full items-center justify-between gap-5 text-left group focus:outline-none focus:ring-1 focus:ring-[#DF9716]"
                  onClick={() => setActive(active === index ? null : index)}
                  aria-expanded={active === index}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-button-${index}`}
                  data-testid={`button-faq-${index}`}
                >
                  <div className="flex gap-4 items-start">
                    <span className="font-display text-[10px] font-bold text-[#DF9716] tracking-[.1em] mt-1 shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[15px] font-bold text-[#FCFAF9] tracking-[0.01em] group-hover:text-[#DF9716] transition-colors">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-[#DF9716] transition-transform duration-300 ${active === index ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {active === index && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-button-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        className="max-w-[640px] pb-6 pl-9 pr-4 text-[14px] leading-[1.75] text-[#FCFAF9]/80 font-normal"
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

          {/* WhatsApp FAQ CTA */}
          <div className="mt-10 pt-6 border-t border-[rgba(252,250,249,0.12)] text-left">
            <p className="text-[14px] text-[#FCFAF9]/85 font-medium">
              Still have a question?{' '}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#DF9716] font-bold hover:underline inline-flex items-center gap-1.5 ml-1"
                data-testid="link-faq-whatsapp"
              >
                Chat with us directly on WhatsApp &rarr;
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Authoritative Frontend Booking Payment Calculator
 */
function getBookingCalculation({ selectedPlan, selectedSeats = [], duration = 1 }) {
  const uniqueSelectedSeats = Array.isArray(selectedSeats)
    ? [...new Set(selectedSeats.filter(Boolean))]
    : [];

  if (!selectedPlan) {
    return {
      uniqueSelectedSeats: [],
      seatCount: 0,
      effectiveSeatCount: 0,
      isReservationMode: false,
      requiresSeats: false,
      reservationAmountPerSeat: 0,
      amountPayableToday: 0,
      totalAmount: 0,
      amountPaidToday: 0,
      amount: 0,
      totalMembershipValue: 0,
      fullMembershipAmount: 0,
      remainingAmountAtJoining: 0,
      remainingAmount: 0,
    };
  }

  const seatCount = uniqueSelectedSeats.length;
  const isReservationMode = selectedPlan.paymentMode === 'RESERVATION';
  const requiresSeats = selectedPlan.requiresSeatSelection || selectedPlan.usesDeposit || isReservationMode;
  const durationVal = Math.max(1, parseInt(duration) || 1);

  if (isReservationMode) {
    const reservationAmountPerSeat = Number(selectedPlan.reservationAmount || 0);
    const planPrice = Number(selectedPlan.price || 0);

    if (requiresSeats && seatCount === 0) {
      return {
        uniqueSelectedSeats: [],
        seatCount: 0,
        effectiveSeatCount: 0,
        isReservationMode: true,
        requiresSeats: true,
        reservationAmountPerSeat,
        amountPayableToday: 0,
        totalAmount: 0,
        amountPaidToday: 0,
        amount: 0,
        totalMembershipValue: 0,
        fullMembershipAmount: 0,
        remainingAmountAtJoining: 0,
        remainingAmount: 0,
      };
    }

    const effectiveCount = seatCount > 0 ? seatCount : 1;
    const amountPayableToday = reservationAmountPerSeat * effectiveCount;
    const totalMembershipValue = planPrice * effectiveCount;
    const remainingAmountAtJoining = Math.max(0, totalMembershipValue - amountPayableToday);

    return {
      uniqueSelectedSeats,
      seatCount: effectiveCount,
      effectiveSeatCount: effectiveCount,
      isReservationMode: true,
      requiresSeats,
      reservationAmountPerSeat,
      amountPayableToday,
      totalAmount: amountPayableToday,
      amountPaidToday: amountPayableToday,
      amount: amountPayableToday,
      totalMembershipValue,
      fullMembershipAmount: totalMembershipValue,
      remainingAmountAtJoining,
      remainingAmount: remainingAmountAtJoining,
    };
  } else {
    const planPrice = Number(selectedPlan.price || 0);
    const amountPayableToday = planPrice * durationVal;

    return {
      uniqueSelectedSeats: [],
      seatCount: 0,
      effectiveSeatCount: 0,
      isReservationMode: false,
      requiresSeats: false,
      reservationAmountPerSeat: 0,
      amountPayableToday,
      totalAmount: amountPayableToday,
      amountPaidToday: amountPayableToday,
      amount: amountPayableToday,
      totalMembershipValue: amountPayableToday,
      fullMembershipAmount: amountPayableToday,
      remainingAmountAtJoining: 0,
      remainingAmount: 0,
    };
  }
}

// â”€â”€â”€ RESERVATION / FINAL CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Reservation({ utm, finalCTA, reservation, reservedCount, globalSettings, freeTrial, bookingAmount, cmsLoaded, cmsFailed }) {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ name: '', phone: '', email: '', company: '', email_confirm: '' });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [plan, setPlan] = useState('');
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [duration, setDuration] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setPlansLoading(true);
    api.fetchPlans()
      .then((res) => {
        if (active && res.success) {
          const list = res.data || [];
          setPlans(list);
          const activePlans = list.filter(p => p.isActive !== false);
          if (activePlans.length > 0) {
            const defaultPlan = activePlans.find(p => p.slug === 'founders-seats') || activePlans[0];
            setSelectedPlanId(defaultPlan._id);
            setPlan(defaultPlan.name);
          }
        }
      })
      .catch((err) => {
        if (active) {
          setPlansError(err.message || 'Failed to load membership plans.');
        }
      })
      .finally(() => {
        if (active) setPlansLoading(false);
      });
    return () => { active = false; };
  }, []);

  const selectedPlan = plans.find(p => p._id === selectedPlanId) || null;

  const handlePlanSelect = (id) => {
    setSelectedPlanId(id);
    const p = plans.find(item => item._id === id);
    if (p) {
      setPlan(p.name);
      setDuration(1);
      setSelectedSeats([]); // Reset seat choices when switching plans
    }
  };

  const calc = getBookingCalculation({ selectedPlan, selectedSeats, duration });
  const {
    uniqueSelectedSeats,
    seatCount,
    effectiveSeatCount,
    isReservationMode,
    requiresSeats,
    reservationAmountPerSeat,
    amountPayableToday,
    totalAmount,
    amountPaidToday,
    amount,
    totalMembershipValue,
    fullMembershipAmount,
    remainingAmountAtJoining,
    remainingAmount,
  } = calc;

  const ctaData = cmsLoaded ? finalCTA : (cmsFailed ? defaultContent.finalCTA : null);
  const resData = cmsLoaded ? reservation : (cmsFailed ? defaultContent.reservation : null);
  const settings = cmsLoaded ? globalSettings : (cmsFailed ? defaultContent.globalSettings : null);
  const freeTrialData = cmsLoaded ? freeTrial : (cmsFailed ? defaultContent.freeTrial : null);

  if (!ctaData || !resData || !settings || !freeTrialData) {
    return (
      <section className="border-t border-[rgba(12,12,12,0.14)] bg-[#FCFAF9] py-20 sm:py-28 text-[#0C0C0C]" id="reservation" data-testid="section-reservation">
        <div className="container-wide min-h-[600px]" />
      </section>
    );
  }

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
    if (!selectedPlanId && !plan) {
      setError('Please select a preferred membership plan.');
      return;
    }
    setError('');
    setLoading(true);
    api.submitReservation({
      name: form.name, phone: form.phone, email: form.email, company: form.company,
      seatNumbers: selectedSeats, plan: selectedPlan?.name || plan, planId: selectedPlanId,
      duration, email_confirm: form.email_confirm || '', ...utmData
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
          description: `Booking: ${selectedPlan?.name || plan}${selectedSeats.length ? ` (${selectedSeats.join(', ')})` : ''}`,
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
              setError('Payment cancelled.');
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
        setError(err.message || 'Failed to initialize reservation order. Please try again.');
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
            <div className="section-label">10 â€” RESERVE</div>
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
            <div className={`inline-flex items-center gap-2 border px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] ${isFreeTrialAvailable
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

              {/* Dynamic CMS Plan Selector */}
              <label className="field-label">
                <span>Preferred Membership Plan *</span>
                {plansLoading ? (
                  <div className="p-3 text-xs text-[#0C0C0C]/60 bg-neutral-100 border border-neutral-200 animate-pulse">
                    Loading plans from CMS...
                  </div>
                ) : plansError ? (
                  <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200">
                    {plansError}
                  </div>
                ) : (
                  <select
                    value={selectedPlanId}
                    onChange={(e) => handlePlanSelect(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="">Select plan type...</option>
                    {plans.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} — {p.pricingLabel || `₹${p.price.toLocaleString('en-IN')}/${p.billingPeriod === 'hour' ? 'hr' : p.billingPeriod === 'day' ? 'day' : 'mo'}`}
                      </option>
                    ))}
                  </select>
                )}
              </label>

              {/* Duration Selector for Hourly / Daily plans */}
              {selectedPlan && (selectedPlan.billingPeriod === 'hour' || selectedPlan.billingPeriod === 'day') && (
                <label className="field-label">
                  <span>Duration ({selectedPlan.billingPeriod === 'hour' ? 'Hours' : 'Days'}) *</span>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    required
                    disabled={loading}
                  >
                    {(selectedPlan.billingPeriod === 'hour' ? [1, 2, 3, 4, 5, 6, 8, 10, 12] : [1, 2, 3, 4, 5, 7, 10, 14, 30]).map((num) => (
                      <option key={num} value={num}>
                        {num} {selectedPlan.billingPeriod === 'hour' ? (num > 1 ? 'Hours' : 'Hour') : (num > 1 ? 'Days' : 'Day')}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {/* Seat map toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="w-full border border-[rgba(2,78,92,0.25)] hover:border-[#DF9716]/40 transition-colors bg-white py-3.5 px-5 flex justify-between items-center text-[10px] font-bold tracking-[0.15em] uppercase text-[#024E5C] hover:text-[#DF9716]"
                >
                  <span>{showMap ? 'Hide Seating Floor Map (Optional)' : 'Select Specific Seat on Floor Map (Optional)'}</span>
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
                          preferredPlan={selectedPlan?.name || plan}
                          onPlanChange={setPlan}
                          reservationAmount={reservationAmountPerSeat}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Booking Summary Card */}
              {selectedPlan && (
                <div className="bg-[#024E5C]/5 border border-[#024E5C]/20 p-4 space-y-2 text-xs text-[#0C0C0C]">
                  <div className="flex justify-between items-center font-bold text-[#024E5C] border-b border-[#024E5C]/15 pb-2">
                    <span className="uppercase tracking-wider">Booking Summary</span>
                    <span className={`font-mono font-black text-[10px] px-2 py-0.5 uppercase ${isReservationMode ? 'bg-[#DF9716]/15 text-[#DF9716] border border-[#DF9716]/30' : 'bg-[#024E5C]/10 text-[#024E5C]'}`}>
                      {isReservationMode ? 'RESERVATION MODE' : 'FULL PAYMENT'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#0C0C0C]/80">
                    <span>Plan:</span>
                    <span className="font-semibold text-[#0C0C0C]">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between text-[#0C0C0C]/80">
                    <span>{isReservationMode ? 'Membership Price:' : 'Plan Rate:'}</span>
                    <span className="font-semibold text-[#0C0C0C]">
                      ₹{selectedPlan.price.toLocaleString('en-IN')}{isReservationMode ? ' / seat / month' : `/${selectedPlan.billingPeriod === 'hour' ? 'hr' : selectedPlan.billingPeriod === 'day' ? 'day' : 'mo'}`}
                    </span>
                  </div>

                  {isReservationMode ? (
                    <>
                      <div className="flex justify-between text-[#0C0C0C]/80">
                        <span>Selected Seats:</span>
                        <span className="font-semibold text-[#0C0C0C]">{seatCount} {uniqueSelectedSeats.length > 0 ? `(${uniqueSelectedSeats.join(', ')})` : '(None)'}</span>
                      </div>
                      {seatCount > 0 ? (
                        <>
                          <div className="flex justify-between text-[#0C0C0C]/80">
                            <span>Total Membership Value:</span>
                            <span className="font-semibold text-[#0C0C0C]">₹{totalMembershipValue.toLocaleString('en-IN')} / month</span>
                          </div>
                          <div className="flex justify-between text-[#0C0C0C]/80">
                            <span>Reservation Amount:</span>
                            <span className="font-semibold text-[#0C0C0C]">₹{reservationAmountPerSeat.toLocaleString('en-IN')} / seat</span>
                          </div>
                          <div className="flex justify-between text-[#DF9716] font-bold border-t border-[#024E5C]/10 pt-1.5">
                            <span>Amount Payable Today:</span>
                            <span>₹{amountPayableToday.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-[#0C0C0C]/80 font-medium">
                            <span>Remaining Amount at Joining:</span>
                            <span>₹{remainingAmountAtJoining.toLocaleString('en-IN')}</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-[11px] text-[#024E5C] font-semibold italic border-t border-[#024E5C]/10 pt-1.5">
                          Please select at least 1 seat above to view reservation amount.
                        </div>
                      )}
                    </>
                  ) : (
                    (selectedPlan.billingPeriod === 'hour' || selectedPlan.billingPeriod === 'day') && (
                      <div className="flex justify-between text-[#0C0C0C]/80">
                        <span>Duration:</span>
                        <span className="font-semibold text-[#0C0C0C]">
                          {duration} {selectedPlan.billingPeriod === 'hour' ? (duration > 1 ? 'hours' : 'hour') : (duration > 1 ? 'days' : 'day')}
                        </span>
                      </div>
                    )
                  )}

                  <div className="flex justify-between items-center text-sm font-black border-t border-[#024E5C]/15 pt-2 text-[#024E5C]">
                    <span>Total Amount Payable Today:</span>
                    <span className="font-mono text-[#DF9716] text-base">₹{amountPayableToday.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

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
                    disabled={loading || (isReservationMode && requiresSeats && seatCount === 0)}
                    onClick={handlePaidReservation}
                    className="button button-primary w-full justify-between py-4 text-[10.5px] font-bold uppercase tracking-[0.15em] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>
                      {isReservationMode && requiresSeats && seatCount === 0
                        ? 'SELECT A SEAT TO RESERVE'
                        : seatCount > 1
                          ? 'RESERVE MY SEATS'
                          : (resData.reserveButtonText || 'RESERVE MY SEAT')}
                    </span>
                    <span className="text-[10px] font-mono opacity-90">
                      Total ₹{amountPayableToday.toLocaleString('en-IN')}
                    </span>
                  </button>
                  <p className="text-[9px] text-[#0C0C0C]/60 uppercase tracking-[0.14em] text-center font-bold">
                    UPI-first Checkout · Balance Payable at Joining
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

// ────── FOOTER ───────────────────────────────────────────────────────────────
function Footer({ footer, globalSettings, cmsLoaded, cmsFailed }) {
  const data = cmsLoaded ? footer : (cmsFailed ? defaultContent.footer : null);
  const settings = cmsLoaded ? globalSettings : (cmsFailed ? defaultContent.globalSettings : null);

  if (!data || !settings) {
    return (
      <footer className="border-t border-[rgba(252,250,249,0.16)] bg-[#0C0C0C] py-24 sm:py-36 text-[#FCFAF9]">
        <div className="container-wide min-h-[300px]" />
      </footer>
    );
  }

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
                <a href={cleanPhoneHref} className="text-[#DF9716] hover:text-[#DF9716] transition-colors" data-testid="link-footer-phone">{phone}</a>
                <br />
                <a href={`mailto:${email}`} className="text-[#DF9716] hover:text-[#DF9716] transition-colors">{email}</a>
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
                  className="mt-3 inline-block text-[11px] font-bold text-[#DF9716] hover:text-[#DF9716] transition-colors"
                  data-testid="link-footer-directions"
                >
                  Get Directions â†—
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

// â”€â”€â”€ WHATSAPP FLOAT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function WhatsAppFloat({ whatsapp, message, cmsLoaded, cmsFailed }) {
  if (!cmsLoaded && !cmsFailed) return null;
  const number = whatsapp || (cmsFailed ? '+91 62605 82852' : '');
  if (!number) return null;
  const cleanNumber = number.replaceAll(' ', '').replaceAll('+', '');
  const waMessage = encodeURIComponent(
    'Hi, I saw Deven Co-Work online and wanted to know more about the Free Trial.'
  );
  return (
    <a
      href={`https://wa.me/${cleanNumber}?text=${waMessage}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="wa-float-btn"
      data-testid="link-floating-whatsapp"
    >
      <FaWhatsapp size={26} color="#ffffff" />
    </a>
  );
}

// â”€â”€â”€ MOBILE STICKY CTA BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MobileStickyCTA({ onReserve }) {
  return (
    <button
      type="button"
      onClick={onReserve}
      className="mobile-sticky-cta"
      aria-label="Book Free Trial â€” open reservation form"
      data-testid="button-mobile-sticky-cta"
    >
      Book Free Trial â†’
    </button>
  );
}

// â”€â”€â”€ HOME PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Home() {
  const [content, setContent] = useState(null);
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
      const title = seo?.title || defaultContent.seo.title;
      const description = seo?.description || defaultContent.seo.description;
      const ogTitle = seo?.ogTitle || defaultContent.seo.ogTitle || title;
      const ogDescription = seo?.ogDescription || defaultContent.seo.ogDescription || description;
      const twitterTitle = seo?.twitterTitle || defaultContent.seo.twitterTitle || ogTitle;
      const twitterDescription = seo?.twitterDescription || defaultContent.seo.twitterDescription || ogDescription;

      // Single source of truth for both browser favicon and social preview image (WhatsApp og:image)
      const faviconUrl = getMediaUrl(settings?.favicon) || '/favicon.svg';
      const absoluteSocialImage = getAbsoluteMediaUrl(settings?.favicon || seo?.ogImage, '/favicon.svg');

      document.title = title;

      const setMetaTag = (attrName, attrVal, contentVal) => {
        let meta = document.querySelector(`meta[${attrName}="${attrVal}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(attrName, attrVal);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', contentVal);
      };

      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:title', ogTitle);
      setMetaTag('property', 'og:description', ogDescription);
      setMetaTag('property', 'og:url', 'https://www.devencowork.com/');
      setMetaTag('property', 'og:type', 'website');
      setMetaTag('property', 'og:image', absoluteSocialImage);

      setMetaTag('name', 'twitter:card', 'summary_large_image');
      setMetaTag('name', 'twitter:title', twitterTitle);
      setMetaTag('name', 'twitter:description', twitterDescription);
      setMetaTag('name', 'twitter:image', absoluteSocialImage);

      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', 'https://www.devencowork.com/');

      updateFavicon(faviconUrl);
    };

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
          setContent(defaultContent);
          applySEO(defaultContent.seo, defaultContent.globalSettings);
          setCmsFailed(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load published content. Using defaults.', err);
        setContent(defaultContent);
        applySEO(defaultContent.seo, defaultContent.globalSettings);
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

  if (!cmsLoaded && !cmsFailed) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0C0C0C] text-[#FCFAF9]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#DF9716] border-t-transparent" />
          <p className="font-display text-xs font-bold tracking-widest text-[#FCFAF9]/70 uppercase">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  let sectionOrder = content?.sectionOrder || defaultContent.sectionOrder;
  if (!sectionOrder.includes('calculator')) {
    const heroIndex = sectionOrder.indexOf('hero');
    const insertPos = heroIndex !== -1 ? heroIndex + 1 : 1;
    sectionOrder = [
      ...sectionOrder.slice(0, insertPos),
      'calculator',
      ...sectionOrder.slice(insertPos)
    ];
  }
  if (!sectionOrder.includes('socialProof')) {
    const pricingIndex = sectionOrder.indexOf('pricing');
    const insertPos = pricingIndex !== -1 ? pricingIndex : sectionOrder.length - 2;
    sectionOrder = [
      ...sectionOrder.slice(0, insertPos),
      'socialProof',
      ...sectionOrder.slice(insertPos)
    ];
  }
  const sectionViz = {
    socialProof: true,
    ...(defaultContent.sectionVisibility || {}),
    ...(content?.sectionVisibility || {}),
  };

  const sectionComponents = {
    hero: <Hero key="hero" onReserve={scrollToReservation} hero={content?.hero} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />,
    calculator: <OfficeCostCalculator key="calculator" />,
    problem: <Problems key="problem" problem={content?.problem} onReserve={scrollToReservation} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />,
    guide: <Guide key="guide" guide={content?.guide} onReserve={scrollToReservation} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />,
    plan: <Plan key="plan" plan={content?.plan} onReserve={scrollToReservation} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />,
    offerStack: <OfferStack key="offerStack" offerStack={content?.offerStack} valueStack={content?.valueStack} onReserve={scrollToReservation} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />,
    valueStack: <ValueStack key="valueStack" valueStack={content?.valueStack} onReserve={scrollToReservation} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />,
    guarantee: <Guarantee key="guarantee" guarantee={content?.riskReversal} onReserve={scrollToReservation} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />,
    socialProof: <SocialProof key="socialProof" socialProof={content?.socialProof} onReserve={scrollToReservation} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />,
    pricing: <Pricing key="pricing" onReserve={scrollToReservation} pricing={content?.pricing} scarcity={content?.scarcity} globalSettings={content?.globalSettings} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />,
    faq: <FAQ key="faq" faq={content?.faq} faqSection={content?.faqSection} globalSettings={content?.globalSettings} onReserve={scrollToReservation} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />,
    finalCTA: (
      <Reservation
        key="finalCTA"
        utm={utm}
        finalCTA={content?.finalCTA}
        reservation={content?.reservation}
        reservedCount={reservedCount}
        globalSettings={content?.globalSettings}
        freeTrial={content?.freeTrial}
        bookingAmount={bookingAmount}
        cmsLoaded={cmsLoaded}
        cmsFailed={cmsFailed}
      />
    ),
  };

  return (
    <div className="site-noise min-h-[100dvh] bg-[#0C0C0C]">
      <div className="sticky top-0 z-40 w-full">
        <FoundingBanner scarcity={content?.scarcity} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />
        <Header onReserve={scrollToReservation} content={content} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />
      </div>
      <main>
        {sectionOrder
          .filter(key => sectionViz[key] !== false)
          .map(key => sectionComponents[key] || null)}
      </main>
      <Footer footer={content?.footer} globalSettings={content?.globalSettings} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />
      <WhatsAppFloat
        whatsapp={content?.footer?.whatsapp || content?.globalSettings?.whatsapp}
        message={content?.reservation?.whatsappMessage}
        cmsLoaded={cmsLoaded}
        cmsFailed={cmsFailed}
      />
      <MobileStickyCTA onReserve={scrollToReservation} />
      {reserveOpen && <span className="sr-only" aria-live="polite">Reservation form is in view.</span>}
    </div>
  );
}

// â”€â”€â”€ ROUTING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
