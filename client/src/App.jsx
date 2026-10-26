import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown,
  Clock3, MapPin, Menu, MessageCircle, Phone, ShieldCheck, Users, X,
  Wifi, Coffee, Briefcase, Home as HomeIcon, Zap, Star,
  BookOpen, Sparkles, TrendingUp
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import ThankYou from '@/pages/thank-you';
import SeatSelection from '@/components/seat-selection';
import OfficeCostCalculator from '@/components/OfficeCostCalculator';
import TourBookingModal from '@/components/TourBookingModal';
import { api } from '@/services/api';
import { getMediaUrl, getAbsoluteMediaUrl, updateFavicon, optimizeImageUrl } from '@/lib/utils';
import { trackPixelEvent } from '@/lib/metaPixel';
export { getMediaUrl, getAbsoluteMediaUrl, updateFavicon };

const AdminLogin = lazy(() => import('@/pages/admin-login'));
const AdminDashboard = lazy(() => import('@/pages/admin-dashboard'));
import ContentPage from '@/pages/content-page';
import EventsPage from '@/pages/events-page';
import AboutPage from '@/pages/about-page';
import BlogPage from '@/pages/blog-page';
import BlogPostPage from '@/pages/blog-post-page';
import { PAGE_ORDER, PAGES } from '@/content/pages';


const queryClient = new QueryClient();

// â"€â"€â"€ DEFAULT CONTENT â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
export const defaultContent = {
  globalSettings: {
    businessName: 'Deven Co-Work',
    shortDesc: "Raipur's Most Premium Coworking Space",
    address: 'VIP Estate, A1, VIP Colony, Shankar Nagar, Raipur, Chhattisgarh 492001',
    phone: '+91 62605 82852',
    whatsapp: '+91 62605 82852',
    email: 'hellodevencowork@gmail.com',
    mapsEmbedSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.5284307521743!2d81.6731683!3d21.2595151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28ddb73efa82a7%3A0xb99b968caba2d846!2sDeven+Co-Work%2C+VIP+Estate%2C+A1%2C+VIP+Colony%2C+Raipur%2C+Chhattisgarh+492001!5e0!3m2!1sen!2sin!4v1717800000000!5m2!1sen!2sin',
    mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Deven+Co-Work,+VIP+Estate,+A1,+VIP+Colony,+Raipur,+Chhattisgarh+492001',
    instagram: 'https://instagram.com/',
    googleBusiness: 'https://www.google.com/maps/',
    copyright: '© {year} Deven Co-Work · Founding rate locked for 12 months from your join date.',
    favicon: 'https://res.cloudinary.com/cyxow5rb/image/upload/v1790711841/deven_cowork/kkfdzhxg3i8vrprjcw9o.png',
    logo: 'https://res.cloudinary.com/cyxow5rb/image/upload/v1790711830/deven_cowork/hupv1daduww9ykgc6t52.png',
    ogImage: '',
  },
  seo: {
    title: 'Deven Co-Work — Coworking Space in Raipur | Free 2-Day Trial',
    description: "Raipur's premier coworking space in Shankar Nagar for startups, founders, and growing teams. 500 Mbps Wi-Fi, private cabins, podcast studio, and founder community. Book your free 2-day trial today.",
    keywords: 'coworking space in raipur, coworking in raipur, coworking space in raipur for startups, premium coworking space in raipur',
    ogTitle: 'Deven Co-Work — Coworking Space in Raipur | Free 2-Day Trial',
    ogDescription: "Raipur's premier coworking space in Shankar Nagar for startups, founders, and growing teams. 500 Mbps Wi-Fi, private cabins, podcast studio, and founder community. Book your free 2-day trial today.",
    ogImage: '',
    twitterTitle: 'Deven Co-Work — Coworking Space in Raipur',
    twitterDescription: "Raipur's premier coworking space in Shankar Nagar for startups, founders, and growing teams. 500 Mbps Wi-Fi, private cabins, podcast studio, and founder community.",
    twitterImage: '',
  },
  navigation: {
    items: [
      { label: 'Our Space', url: '/#space', external: false, visible: true, order: 0 },
      {
        label: 'Workspace',
        url: '#workspace',
        isDropdown: true,
        visible: true,
        order: 1,
        items: [
          { label: 'Private Cabins', url: '/private-cabins' },
          { label: 'Hot Desks', url: '/hot-desk' },
          { label: 'Dedicated Desks', url: '/dedicated-desk' },
          { label: 'Meeting Room', url: '/meeting-room' },
          { label: 'Podcast Studio', url: '/podcast-studio' },
          { label: 'Amenities', url: '/amenities' },
        ],
      },
      { label: 'Pricing', url: '/pricing', external: false, visible: true, order: 2 },
      { label: 'Events', url: '/events', external: false, visible: true, order: 3 },
      { label: 'About', url: '/about', external: false, visible: true, order: 4 },
      { label: 'Blog', url: '/blog', external: false, visible: true, order: 5 },
      { label: 'FAQ', url: '/faq', external: false, visible: true, order: 6 },
      { label: 'Contact', url: '/contact', external: false, visible: true, order: 7 },
    ],
    ctaLabel: 'Book a Tour',
    ctaUrl: '#reservation',
    ctaVisible: true,
  },
  header: {
    phone: '+91 62605 82852',
    logo: '',
  },
  hero: {
    eyebrow: "Raipur's most beautiful office",
    location: 'VIP ESTATE, A1, VIP COLONY, SHANKAR NAGAR, RAIPUR, CHHATTISGARH 492001',
    headline: "Not Just a Desk. Your Complete Founder's Operating System",
    subheadline: "Raipur's most premium coworking space -- private cabins, a content studio, a real community, and everything you need to grow, not just work.",
    primaryCtaLabel: 'Book Your Free Tour',
    primaryCtaUrl: '#reservation',
    secondaryCtaLabel: 'See Founding Member Pricing',
    secondaryCtaUrl: '/pricing',
    foundingPriceNote: 'Founding plan from ₹5,999 / month · Rate locked for founding batch',
    videoUrl: 'https://res.cloudinary.com/cyxow5rb/video/upload/v1791881113/deven_cowork/t2orrvxnsrid1kg8eh2k.mp4',
    imageUrl: 'https://res.cloudinary.com/cyxow5rb/image/upload/v1791881124/deven_cowork/qwzxar4m5f4zgp3masqb.webp',
    highlightWords: '',
    floatingStats: [
      { value: '50', label: 'Founding Seats' },
    ],
    metaItems: ['RAIPUR', 'VIP ESTATE', '50 SEATS', '2-DAY FREE TRIAL'],
    stats: [
      { main: '2-Day Free Trial', sub: 'No card required' },
      { main: '500 Mbps Wifi', sub: 'High Speed' },
      { main: '9 AM–9 PM, Mon–Sat', sub: 'Access Hours' },
      { main: 'Central Raipur', sub: 'City Centre' },
    ],
  },
  problem: {
    headline: 'Still Working From Your Dining Table, a Noisy Café, or a Cramped Office?',
    body: 'You\'ve outgrown working from home. The wifi drops during client calls. There\'s nowhere professional to host a meeting. And every "coworking space" you\'ve seen in Raipur feels like a leftover office with some beanbags thrown in.\n\nYou didn\'t start your business to work like this.',
    imageUrl: 'https://res.cloudinary.com/cyxow5rb/image/upload/v1787314494/deven_cowork/kpmcygjw6pp62a12cgmg.png',
    quoteText: "You're not lazy. Your environment is holding you back.",
    quoteAuthor: '',
    blocks: [
      { title: 'The Dining Table Trap', description: 'Your family loves you, but they are also your loudest distractions. You cannot build a company between laundry cycles and kitchen noise.', icon: 'Home' },
      { title: 'The Noisy Café Tax', description: 'Buying ₹300 lattes just to borrow WiFi for two hours is not a business model. It is a slow leak in your runway.', icon: 'Coffee' },
      { title: 'The Cramped Office Prison', description: 'Renting a tiny, windowless room in a commercial building is depressing. It kills your creativity and makes client meetings awkward.', icon: 'Briefcase' },
    ],
    problemPoints: [],
    cta: {
      label: 'Book Your Free Tour',
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
      { image: 'https://res.cloudinary.com/cyxow5rb/image/upload/v1791190574/deven_cowork/bal8rx1brctx4uxirgdy.jpg', label: 'MAIN AREA', caption: '', size: 'medium' },
      { image: 'https://res.cloudinary.com/cyxow5rb/image/upload/v1791190563/deven_cowork/v9xcnxv8oyxlkfiz2jyr.jpg', label: 'Studio', caption: '', size: 'medium' },
      { image: 'https://res.cloudinary.com/cyxow5rb/image/upload/v1791190554/deven_cowork/ab9rdnxpyhiosjym6fya.webp', label: 'MEETING ROOM', caption: '', size: 'medium' },
      { image: 'https://res.cloudinary.com/cyxow5rb/image/upload/v1787305754/deven_cowork/ik2bo3j2ymgyvl4ewu6w.webp', label: 'GREEN ZONE', caption: '', size: 'medium' },
      { image: 'https://res.cloudinary.com/cyxow5rb/image/upload/v1791190534/deven_cowork/uusxjpnowumjwznp4dmx.jpg', label: 'TECH LOUNGE', caption: '', size: 'medium' },
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
      { title: 'Book Your Free Tour', description: 'No card, no pressure, just come work from here.' },
      { title: 'Pick Your Plan', description: 'Hot Desk, Dedicated Desk or Dedicated Desk — whatever fits.' },
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
      { inclusion: 'Dedicated Workspace, 9 AM–9 PM, Mon–Sat', val: '₹6,000/mo' },
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
    foundingPrice: 'From ₹4,999/month',
  },
  riskReversal: {
    headline: 'Try Deven Co-Work — Completely Risk Free',
    subheadline: "No risk, no lock-in. Come in and experience Raipur's most premium space with total confidence.",
    closingText: "We can offer this guarantee because we've built something we're genuinely proud of. We want you to feel that the moment you walk in.",
    ctaLabel: 'Book Your Free Tour',
    blocks: [
      { title: '2-Day Free Trial', description: "Walk in. Work from Raipur's best desk. Use the coffee bar. Meet the community. Leave with a clear picture of what your work life could look like. No credit card. No obligation. No awkward sales pitch. Just come." },
      { title: '7-Day "Love It or Leave It" Guarantee', description: "Join after your trial. If Deven Co-Work doesn't transform your focus and productivity in your first 7 days, walk away with a 100% full refund. No questions asked. Zero risk." },
    ],
  },
  socialProof: {
    headline: 'What Founders Are Saying',
    subheadline: 'Hear from our members who switched to Deven Co-Work. Real reviews, updated dynamically.',
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
      { name: 'Dedicated Desk', standard: '₹11,000/mo', founding: '₹8,999/mo', desc: 'Your own place to build from. Includes dedicated desk, 9 AM–9 PM, 7 days access, studio + growth engine, photoshoot, and member network.' },
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
    priceLockText: 'Founding rate locked for 12 months from your join date',
  },
  faqSection: {
    headline: 'Before You Come In',
    subheadline: 'Everything you need to know about memberships, pricing, rules, and billing details.',
  },
  faq: [
    { question: 'Who is Deven Co-Work designed for?', answer: "Solo freelancers, startup founders, consultants, remote employees, and small business teams who've outgrown working from home or a noisy café, and want a professional space without the cost or hassle of setting up their own office.", published: true, order: 0 },
    { question: 'What are your operating hours?', answer: "We're open 9 AM to 9 PM, Monday to Saturday — so whether you're an early starter or someone who works better in the evening, the space is available on your schedule.", published: true, order: 1 },
    { question: 'What is your cancellation policy?', answer: "Simple and fair — just 30 days' notice, with no penalties and no hidden fees. We'd rather earn your membership every month than lock you into something that isn't working for you.", published: true, order: 2 },
    { question: 'Do I need to sign a long-term contract?', answer: 'No. Month-to-month membership is available with no long-term lock-in. If you\'d like to save more, our annual plan gives you 2 months free — but it\'s entirely your choice.', published: true, order: 3 },
    { question: 'Do you have private cabins?', answer: 'Yes, we have a limited number of private, lockable cabins — ideal for founders or small teams who want a dedicated, quiet space of their own within the larger Deven community.', published: true, order: 4 },
    { question: 'Where exactly is Deven Co-Work located?', answer: "Deven Co-Work is centrally located in Raipur, easily accessible from every part of the city. VIP Estate, A1, VIP Colony, Shankar Nagar, Raipur, Chhattisgarh 492001. You'll also find us pinned on Google Maps.", published: true, order: 5 },
    { question: 'Can I book the meeting room even if I\'m not a member?', answer: 'Absolutely. Our Team Meeting Room, complete with an interactive digital panel, is available for hourly booking to members and non-members alike — perfect for client meetings, interviews, or workshops.', published: true, order: 0 },
    { question: 'Is food, coffee, and parking available?', answer: 'Yes to all three. We have a coffee bar with 20+ varieties of coffee and 5+ varieties of tea, a kitchen/food-heating space for your own meals, and dedicated parking for both two-wheelers and four-wheelers.', published: true, order: 0 },
    { question: 'How is Deven different from renting my own private office?', answer: 'Setting up a private office in Raipur can easily cost Rs. 16-30 lakhs upfront and take 3-4 months of your time — searching, negotiating, and managing vendors. At Deven, you walk in and start working immediately, with zero setup cost and none of the hassle.', published: true, order: 0 },
    { question: 'How do I book a visit or free trial?', answer: 'Easiest way — message us on WhatsApp or Instagram, call us directly, or book through our website. Our team will help you find a time that works and get you started on your free trial right away.', published: true, order: 0 },
  ],
  finalCTA: {
    headline: 'Your First Day Is Free. Come See Why Founders Are Switching.',
    body: "No card. No pressure. Just come work from Raipur's most premium coworking space for 2 full days, completely free.",
    primaryCtaLabel: 'Book Your Free Tour',
    primaryCtaUrl: '#reservation',
  },
  reservation: {
    step1Title: 'Step 1: Choose Your founding desks on live map',
    step2Title: 'Step 2: Enter Contact details',
    depositNote: '100% Free · No Payment Required',
    whatsappMessage: "Hi, I'd like to learn more about Deven Co-Work",
    scarcityNote: 'Only {remaining} founding desks left in Raipur founding batch. Capped at max 7 per company.',
    reservationHeading: 'LOCK IN YOUR FOUNDING MEMBER SEAT TODAY.',
    reservationDescription: 'Only 50 seats are available in the founding batch. Choose your next step below.',
    scarcityText: "FOUNDING BATCH\nLimited seats available",
    totalFoundingSeats: 50,

    joiningDate: '15 September 2026',
    trialButtonText: 'GET 2 DAYS FREE TRIAL',
    whatsappButtonText: 'BOOK VIA WHATSAPP →',
    reserveButtonText: 'RESERVE MY SEAT →',
    trialConfirmationTitle: 'Your 2-Day Free Trial is Booked.',
    trialConfirmationMessage: 'Thanks for booking your free trial. Our team will call you shortly to confirm your visit and guide you through the next steps.',
    paymentConfirmationTitle: 'RESERVATION CONFIRMED',
    paymentConfirmationMessage: "You're officially in. Your founding member seat has been reserved successfully. Your invoice has been sent to your email.",
    whatsappNumber: '+91 62605 82852',
    reservationEmailSettings: 'hellodevencowork@gmail.com',
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
      { label: 'Pricing', href: '/pricing' },
      { label: 'About Us', href: '/about' },
      { label: 'Events', href: '/events' },
      { label: 'Blog', href: '/blog' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' },
      { label: 'Instagram', href: 'https://instagram.com/' },
      { label: 'GMB', href: 'https://www.google.com/maps/' },
    ],
    address: 'VIP Estate, A1, VIP Colony, Shankar Nagar, Raipur, Chhattisgarh 492001',
    phone: '+91 62605 82852',
    whatsapp: '+91 62605 82852',
    email: 'hellodevencowork@gmail.com',
    copyright: '',
    ctaLabel: '',
    ctaUrl: '',
  },
  about: {
    hero: {
      eyebrow: 'ABOUT DEVEN',
      headline: 'A Space for People Building What\'s Next.',
      subheadline: 'Raipur\'s premier coworking space and founder community in Shankar Nagar, built for focused work, meaningful collaboration, and ambitious teams.',
    },
    story: {
      heading: 'Our Story',
      paragraphs: [
        'Deven Co-Work was established to solve a pressing challenge for founders and professionals in Raipur: finding a workspace that balances enterprise-grade infrastructure with genuine community.',
        'Working from home or noisy cafés often leads to distraction and isolation. Renting a traditional office in Raipur comes with long commercial leases, expensive fit-outs, and ongoing facility management headaches.',
        'We built Deven Co-Work to give professionals and startups a complete operating system: private cabins, dedicated desks, team meeting rooms with digital boards, a high-fidelity podcast studio, and 500 Mbps fiber internet — all anchored by active founder meetups, workshops, and peer collaboration.'
      ],
      image: 'https://res.cloudinary.com/cyxow5rb/image/upload/v1787305622/deven_cowork/y6mbwgpiltsde9n3cvhr.webp',
    },
    mission: {
      heading: 'Our Mission',
      text: 'To empower Raipur\'s entrepreneurs, creators, and professionals with premium workspace infrastructure, productive environments, and an active community that accelerates business growth.',
    },
    vision: {
      heading: 'Our Vision',
      text: 'To establish Raipur as a leading hub of innovation and modern enterprise in Central India, connecting ambitious founders who build enduring companies.',
    },
    audiences: {
      heading: 'Who Deven Co-Work Is For',
      items: [
        { title: 'Startup Founders', description: 'Early-stage and scaling founders building ambitious tech, service, and product businesses in Raipur.' },
        { title: 'Freelancers & Consultants', description: 'Independent professionals who need ultra-reliable internet, polished client meeting spaces, and professional credibility.' },
        { title: 'Remote Professionals', description: 'Distributed team members and remote engineers looking to escape home distractions for focused, high-energy work.' },
        { title: 'Small Teams', description: 'Teams of 2 to 7 people who require private cabins and meeting facilities without long-term commercial lease lock-ins.' },
        { title: 'Creators & Podcasters', description: 'Content creators, educators, and podcasters leveraging our sound-treated audio and video studio.' },
      ],
    },
    seo: {
      title: 'About Deven Co-Work — Raipur\'s Premier Coworking & Founder Space',
      description: 'Discover the story, mission, workspace philosophy, and founder community behind Deven Co-Work in Shankar Nagar, Raipur. Book a free tour.',
    },
  },
  sectionOrder: ['hero', 'problem', 'guide', 'plan', 'offerStack', 'guarantee', 'socialProof', 'pricing', 'faq', 'finalCTA'],
  sectionVisibility: {
    hero: true, calculator: true, problem: true, guide: true, plan: true, offerStack: true,
    valueStack: false, guarantee: true, socialProof: true, pricing: true, faq: true, finalCTA: true,
  },
};

// â"€â"€â"€ DEEP MERGE â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
export function mergeContent(defaults, fetched) {
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

  // Ensure valueStack is never in homepage sectionOrder
  if (merged.sectionOrder && Array.isArray(merged.sectionOrder)) {
    merged.sectionOrder = merged.sectionOrder.filter(key => key !== 'valueStack');
  }

  // Normalize navigation items to use dedicated pages instead of outdated homepage-only anchors
  if (merged.navigation && Array.isArray(merged.navigation.items)) {
    merged.navigation.items = merged.navigation.items.map(item => {
      const label = item.label?.toLowerCase().trim();
      if (label === 'pricing' || item.url === '#pricing') {
        return { ...item, url: '/pricing' };
      }
      if (label === 'faq' || item.url === '#faq') {
        return { ...item, url: '/faq' };
      }
      if (label === 'contact' || item.url === '#reservation' || item.url === '#contact') {
        return { ...item, url: '/contact' };
      }
      if (label === 'events' || item.url === '#events') {
        return { ...item, url: '/events' };
      }
      if (label === 'about' || label === 'about us' || item.url === '#about') {
        return { ...item, url: '/about' };
      }
      if (label === 'blog' || item.url === '#blog') {
        return { ...item, url: '/blog' };
      }
      if (label === 'our space' || item.url === '#space') {
        return { ...item, url: '/#space' };
      }
      if (label === 'workspace') {
        return {
          ...item,
          isDropdown: true,
          items: [
            { label: 'Private Cabins', url: '/private-cabins' },
            { label: 'Meeting Room', url: '/meeting-room' },
            { label: 'Podcast Studio', url: '/podcast-studio' },
            { label: 'Amenities', url: '/amenities' },
          ],
        };
      }
      return item;
    });

    // Ensure Workspace dropdown is always present between Our Space and Pricing
    const hasWorkspace = merged.navigation.items.some(
      item => item.label?.toLowerCase().trim() === 'workspace' || item.isDropdown
    );
    if (!hasWorkspace) {
      const spaceIdx = merged.navigation.items.findIndex(
        item => item.label?.toLowerCase().trim() === 'our space'
      );
      const insertAt = spaceIdx !== -1 ? spaceIdx + 1 : 1;
      merged.navigation.items.splice(insertAt, 0, {
        label: 'Workspace',
        url: '#workspace',
        isDropdown: true,
        visible: true,
        order: 1,
        items: [
          { label: 'Private Cabins', url: '/private-cabins' },
          { label: 'Meeting Room', url: '/meeting-room' },
          { label: 'Podcast Studio', url: '/podcast-studio' },
          { label: 'Amenities', url: '/amenities' },
        ],
      });
    }

    // Normalize CTA label to 'Book a Tour'
    if (!merged.navigation.ctaLabel || merged.navigation.ctaLabel === 'BOOK FREE TOUR') {
      merged.navigation.ctaLabel = 'Book a Tour';
    }
  }

  // Ensure footer quick links always route to dedicated pages
  if (merged.footer && Array.isArray(merged.footer.quickLinks)) {
    merged.footer.quickLinks = merged.footer.quickLinks.map(link => {
      const label = link.label?.toLowerCase().trim();
      if (label === 'pricing' || link.href === '#pricing') return { ...link, href: '/pricing' };
      if (label === 'about' || label === 'about us' || link.href === '#about') return { ...link, href: '/about' };
      if (label === 'events' || link.href === '#events') return { ...link, href: '/events' };
      if (label === 'blog' || link.href === '#blog') return { ...link, href: '/blog' };
      if (label === 'faq' || link.href === '#faq') return { ...link, href: '/faq' };
      if (label === 'contact' || link.href === '#reservation') return { ...link, href: '/contact' };
      return link;
    });
  }

  return merged;
}


// â"€â"€â"€ ANIMATION VARIANTS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
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

// â"€â"€â"€ SCROLL REVEAL WRAPPER â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
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

// â"€â"€â"€ HIGHLIGHT WORDS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
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
          ? <span key={i} className="text-[#04B8BB]">{part}</span>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

// â"€â"€â"€ SHARED COMPONENTS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

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
        <img src={optimizeImageUrl(logoUrl, 320)} alt="Deven Co-Work" className="h-8 object-contain" />
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

// â"€â"€â"€ IMAGE WITH FALLBACK â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function SafeImage({ src, alt = '', className = '', style }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <img
      src={optimizeImageUrl(src, 1000)}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

// â"€â"€â"€ HEADER â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
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
    <div className="bg-white text-[#0C0C0C] py-2 px-4 text-center text-xs font-bold tracking-wide border-b border-[#0C0C0C]/10 flex items-center justify-center gap-2 relative z-30">
      <span>⚡ Only <span className="underline font-extrabold">{remaining} of {total}</span> Founding Member spots remaining &mdash; {priceLock}</span>
    </div>
  );
}

export const WORKSPACE_ITEMS = [
  { label: 'Private Cabins', url: '/private-cabins', desc: 'Dedicated private office cabins' },
  { label: 'Hot Desks', url: '/hot-desk', desc: 'Flexible day passes & shared desks' },
  { label: 'Dedicated Desks', url: '/dedicated-desk', desc: 'Permanent assigned workstations' },
  { label: 'Meeting Room', url: '/meeting-room', desc: 'Interactive panel & conference room' },
  { label: 'Podcast Studio', url: '/podcast-studio', desc: 'Audio & video recording studio' },
  { label: 'Amenities', url: '/amenities', desc: '500 Mbps Wi-Fi, 20+ coffees & lounge' },
];

function WorkspaceDropdown({ location, onNavigate }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const isChildActive = WORKSPACE_ITEMS.some(it => location === it.url);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Workspace pages"
        className={`flex items-center gap-1.5 transition-colors relative group py-2 uppercase tracking-[.16em] cursor-pointer focus-visible:outline-none focus-visible:text-[#04B8BB] ${
          isChildActive ? 'text-[#04B8BB] font-black' : 'text-[#FCFAF9]/85 hover:text-[#04B8BB]'
        }`}
        data-testid="nav-workspace"
      >
        <span>Workspace</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${
            open ? 'rotate-180 text-[#04B8BB]' : 'text-[#FCFAF9]/60 group-hover:text-[#04B8BB]'
          }`}
        />
        <span
          className={`absolute -bottom-0.5 left-0 h-px bg-[#04B8BB] transition-all duration-300 ${
            isChildActive ? 'w-full' : 'w-0 group-hover:w-full'
          }`}
        />
      </button>

      {/* Desktop Dropdown Menu */}
      <div
        className={`absolute top-full left-0 mt-1 min-w-[230px] bg-[#024E5C]/98 backdrop-blur-md border border-[rgba(252,250,249,0.16)] rounded-xl shadow-2xl p-2 z-50 text-[11px] font-semibold tracking-normal normal-case transition-all duration-150 ${
          open ? 'opacity-100 visible pointer-events-auto translate-y-0' : 'opacity-0 invisible pointer-events-none -translate-y-1'
        }`}
        role="menu"
        aria-label="Workspace submenu"
      >
        {WORKSPACE_ITEMS.map((item) => {
          const isActive = location === item.url;
          return (
            <Link
              key={item.url}
              href={item.url}
              onClick={() => {
                setOpen(false);
                if (onNavigate) onNavigate();
              }}
              role="menuitem"
              className={`flex flex-col gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-white/10 text-[#04B8BB] font-bold'
                  : 'text-[#FCFAF9]/90 hover:bg-white/10 hover:text-[#04B8BB]'
              }`}
              data-testid={`dropdown-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs">{item.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#04B8BB]" />}
              </div>
              <span className="text-[10px] text-[#FCFAF9]/55 font-normal tracking-tight">
                {item.desc}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Header({ onReserve, content, cmsLoaded, cmsFailed }) {
  const [solid, setSolid] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileWorkspaceOpen, setMobileWorkspaceOpen] = useState(false);
  const [location, navigate] = useLocation();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileWorkspaceOpen(false);
  }, [location]);

  const handleNavClick = (e, url) => {
    if (url && (url.startsWith('#') || url.startsWith('/#'))) {
      const hash = url.startsWith('/#') ? url.slice(2) : url.slice(1);
      if (location === '/') {
        if (e) e.preventDefault();
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `/#${hash}`);
        }
      } else {
        if (e) e.preventDefault();
        navigate(`/#${hash}`);
      }
    }
  };

  const handleTourCta = (e) => {
    if (e) e.preventDefault();
    if (onReserve) {
      onReserve();
    } else {
      if (location === '/') {
        document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/#reservation');
      }
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

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-7 text-[10.5px] xl:text-[11.5px] font-bold uppercase tracking-[.14em] xl:tracking-[.18em]">
          {visibleNav.map((item, idx) => {
            const labelLower = item.label?.toLowerCase().trim();
            const isWorkspace = labelLower === 'workspace' || item.isDropdown;

            if (isWorkspace) {
              return (
                <WorkspaceDropdown
                  key="nav-workspace-dropdown"
                  location={location}
                />
              );
            }

            const isSpace = labelLower === 'our space' || item.url === '#space' || item.url === '/#space';
            if (isSpace) {
              return (
                <a
                  key={idx}
                  href="/#space"
                  onClick={(e) => handleNavClick(e, '/#space')}
                  className="hover:text-[#04B8BB] transition-colors relative group text-[#FCFAF9]/85 py-2 cursor-pointer"
                  data-testid="nav-space"
                >
                  {item.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#04B8BB] transition-all duration-300 group-hover:w-full" />
                </a>
              );
            }

            if (item.external) {
              return (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#04B8BB] transition-colors relative group text-[#FCFAF9]/85 py-2"
                >
                  {item.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#04B8BB] transition-all duration-300 group-hover:w-full" />
                </a>
              );
            }

            const itemUrl = item.url;
            const isHash = itemUrl.startsWith('#');
            const href = isHash && location !== '/' ? `/${itemUrl}` : itemUrl;
            const isActive = location === href || (href === '/blog' && location.startsWith('/blog/'));

            if (isHash && location === '/') {
              return (
                <a
                  key={idx}
                  href={itemUrl}
                  onClick={(e) => handleNavClick(e, itemUrl)}
                  className="hover:text-[#04B8BB] transition-colors relative group text-[#FCFAF9]/85 py-2 cursor-pointer"
                  data-testid={`nav-item-${idx}`}
                >
                  {item.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#04B8BB] transition-all duration-300 group-hover:w-full" />
                </a>
              );
            }

            return (
              <Link
                key={idx}
                href={href}
                className={`transition-colors relative group py-2 ${
                  isActive ? 'text-[#04B8BB] font-black' : 'text-[#FCFAF9]/85 hover:text-[#04B8BB]'
                }`}
                data-testid={`nav-item-${labelLower.replace(/\s+/g, '-')}`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-[#04B8BB] transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 sm:gap-5">
          <a
            href={cleanPhoneHref}
            onClick={() => trackPixelEvent('Contact')}
            className="hidden text-[10px] font-bold uppercase tracking-wider text-[#04B8BB] transition-colors hover:text-white xl:inline"
            data-testid="link-header-phone"
          >
            {phone}
          </a>
          {nav.ctaVisible !== false && (
            <Button
              onClick={handleTourCta}
              className="button-small"
              testId="button-header-reserve"
            >
              {nav.ctaLabel || 'Book a Tour'}
            </Button>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-2 text-[#FCFAF9] hover:text-[#04B8BB] transition-colors focus:outline-none"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden bg-[#024E5C]/98 backdrop-blur-md border-t border-[rgba(252,250,249,0.14)] px-6 py-4 shadow-2xl transition-all"
          data-testid="nav-mobile-menu"
        >
          <nav className="flex flex-col gap-1 text-xs font-bold uppercase tracking-[.18em]">
            {visibleNav.map((item, idx) => {
              const labelLower = item.label?.toLowerCase().trim();
              const isWorkspace = labelLower === 'workspace' || item.isDropdown;

              if (isWorkspace) {
                const isChildActive = WORKSPACE_ITEMS.some(it => location === it.url);
                return (
                  <div key="mobile-workspace" className="border-b border-[rgba(252,250,249,0.08)] py-2">
                    <button
                      type="button"
                      onClick={() => setMobileWorkspaceOpen(prev => !prev)}
                      className="w-full flex items-center justify-between text-[#FCFAF9]/85 hover:text-[#04B8BB] py-1 text-left uppercase tracking-[.18em] transition-colors cursor-pointer"
                      aria-expanded={mobileWorkspaceOpen}
                      data-testid="mobile-workspace-toggle"
                    >
                      <span className={isChildActive ? 'text-[#04B8BB] font-black' : ''}>
                        Workspace
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 text-[#04B8BB] ${
                          mobileWorkspaceOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {mobileWorkspaceOpen && (
                      <div className="mt-2 ml-2 pl-3 border-l-2 border-[#04B8BB]/40 flex flex-col gap-2">
                        {WORKSPACE_ITEMS.map((child) => {
                          const isSubActive = location === child.url;
                          return (
                            <Link
                              key={child.url}
                              href={child.url}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`py-1.5 transition-colors flex items-center justify-between ${
                                isSubActive ? 'text-[#04B8BB] font-black' : 'text-[#FCFAF9]/80 hover:text-white'
                              }`}
                              data-testid={`mobile-workspace-${child.label.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <span>{child.label}</span>
                              {isSubActive && <span className="text-[10px] text-[#04B8BB]">●</span>}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isSpace = labelLower === 'our space' || item.url === '#space' || item.url === '/#space';
              if (isSpace) {
                return (
                  <a
                    key={idx}
                    href="/#space"
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      handleNavClick(e, '/#space');
                    }}
                    className="text-[#FCFAF9]/85 hover:text-[#04B8BB] py-2.5 transition-colors border-b border-[rgba(252,250,249,0.08)] flex items-center justify-between cursor-pointer"
                    data-testid="mobile-nav-space"
                  >
                    <span>{item.label}</span>
                  </a>
                );
              }

              if (item.external) {
                return (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[#FCFAF9]/85 hover:text-[#04B8BB] py-2.5 transition-colors border-b border-[rgba(252,250,249,0.08)] flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                  </a>
                );
              }

              const itemUrl = item.url;
              const isHash = itemUrl.startsWith('#');
              const href = isHash && location !== '/' ? `/${itemUrl}` : itemUrl;
              const isActive = location === href || (href === '/blog' && location.startsWith('/blog/'));

              if (isHash && location === '/') {
                return (
                  <a
                    key={idx}
                    href={itemUrl}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      handleNavClick(e, itemUrl);
                    }}
                    className="text-[#FCFAF9]/85 hover:text-[#04B8BB] py-2.5 transition-colors border-b border-[rgba(252,250,249,0.08)] flex items-center justify-between cursor-pointer"
                  >
                    <span>{item.label}</span>
                  </a>
                );
              }

              return (
                <Link
                  key={idx}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2.5 transition-colors flex items-center justify-between border-b border-[rgba(252,250,249,0.08)] ${
                    isActive ? 'text-[#04B8BB] font-black' : 'text-[#FCFAF9]/85 hover:text-[#04B8BB]'
                  }`}
                  data-testid={`mobile-nav-${labelLower.replace(/\s+/g, '-')}`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="text-[10px] text-[#04B8BB]">●</span>}
                </Link>
              );
            })}

            {/* Mobile Contact Phone */}
            <div className="pt-3 pb-1">
              <a
                href={cleanPhoneHref}
                className="text-xs font-bold uppercase tracking-wider text-[#04B8BB] hover:text-white flex items-center gap-2"
                data-testid="mobile-link-phone"
              >
                <Phone size={14} />
                <span>{phone}</span>
              </a>
            </div>

            {/* Mobile Book a Tour CTA */}
            {nav.ctaVisible !== false && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleTourCta(e);
                  }}
                  className="w-full button button-primary py-3 text-center text-xs font-bold tracking-wider uppercase justify-center cursor-pointer"
                  data-testid="button-mobile-reserve"
                >
                  {nav.ctaLabel || 'Book a Tour'}
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

// â"€â"€â"€ HERO â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function Hero({ onReserve, hero, cmsLoaded = false, cmsFailed = false }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [videoAllowed, setVideoAllowed] = useState(false);

  useEffect(() => {
    const conn = typeof navigator !== 'undefined' ? navigator.connection : null;
    if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return;
    const start = () => setTimeout(() => setVideoAllowed(true), 800);
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
  }, []);

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
  const baseImageUrl = data?.imageUrl || defaultContent.hero.imageUrl;

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
      {videoAllowed && currentVideoUrl && (
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
      {baseImageUrl && (
        <img
          ref={imgRef}
          src={optimizeImageUrl(getMediaUrl(baseImageUrl), 1200)}
          alt="Deven Cowork space"
          className="absolute inset-0 w-full h-full object-cover z-0"
          fetchPriority="high"
          decoding="async"
          style={{
            opacity: (videoAllowed && currentVideoUrl && mediaReady) ? 0 : 0.35,
            transition: 'opacity 0.4s ease-in-out',
          }}
        />
      )}

      <div className="container-wide relative z-20 flex min-h-[calc(100dvh-70px)] flex-col justify-center pb-16 pt-16 sm:min-h-[820px] sm:pb-28">

        {/* Eyebrow */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="section-label mb-8"
          style={{ '--section-label-color': '#04B8BB' }}
        >
          {data.eyebrow || "DEVEN WORKSPACE - RAIPUR"}
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-[1fr_auto] lg:gap-16 items-end">
          {/* Left: Headline + CTAs */}
          <div className="max-w-[820px]">
            <motion.h1
              initial={false}
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
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
              className="mt-8 max-w-[520px] text-[15px] leading-[1.75] text-[#FCFAF9]/80"
            >
              {data.subheadline}
            </motion.p>

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
              className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center"
            >
              <Button
                onClick={data.primaryCtaUrl?.startsWith('#') ? onReserve : undefined}
                href={data.primaryCtaUrl?.startsWith('#') ? undefined : data.primaryCtaUrl}
                testId="button-hero-reserve"
              >
                {data.primaryCtaLabel || 'Book Your Free Tour'}
              </Button>
              <Link
                href="/pricing"
                className="text-link"
                data-testid="link-hero-pricing"
              >
                {data.secondaryCtaLabel || 'See Founding Member Pricing'}
              </Link>
            </motion.div>

            {/* Trust bar - factual, from existing content */}
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.38 }}
              className="mt-7 flex flex-wrap gap-x-6 gap-y-2"
              data-testid="hero-trust-bar"
            >
              {[
                { icon: <Check size={10} strokeWidth={3} />, text: 'Free Tour - No card required' },
                { icon: <Wifi size={10} strokeWidth={2.5} />, text: '500 Mbps WiFi' },
                { icon: <MapPin size={10} strokeWidth={2.5} />, text: 'Raipur City Centre' },
              ].map((item, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#FCFAF9]/60"
                >
                  <span className="text-[#04B8BB]">{item.icon}</span>
                  {item.text}
                </span>
              ))}
            </motion.div>

            {/* Guarantee hero badge */}
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.41 }}
              className="mt-7"
              data-testid="hero-guarantee-badge"
            >
              <div className="inline-flex items-center gap-3 bg-[#024E5C] border border-[#04B8BB]/50 px-4 py-2.5 rounded-sm">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#04B8BB] flex items-center justify-center">
                  <Check size={13} strokeWidth={3} className="text-black" />
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#04B8BB]">Risk-Free Guarantee</div>
                  <div className="text-[10px] font-semibold text-[#FCFAF9]/90 leading-tight mt-0.5">
                    Free Tour &middot; Love It or Leave It
                  </div>
                </div>
              </div>
            </motion.div>

            {data.foundingPriceNote && (
              <motion.p
                initial={false}
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
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
            className="hidden lg:flex flex-col gap-3 mb-4"
          >
            {floatingStats.map((stat, i) => (
              <div key={i} className="floating-card min-w-[160px]">
                <div className="font-display font-black text-[28px] leading-none text-[#04B8BB]">
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
          initial={false}
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
        <ArrowDownRight size={13} className="text-[#04B8BB]" />
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
    <section className="bg-[#024E5C] text-[#FCFAF9] border-y border-[rgba(252,250,249,0.16)] py-24 sm:py-36 scroll-mt-20 sm:scroll-mt-24" id="space" data-testid="section-guide">
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
            <div className="flex flex-col gap-4">
              <button onClick={onReserve} className="button button-primary self-start" data-testid="button-guide-tour">
                Book Your Tour <ArrowUpRight size={15} />
              </button>
              <div className="flex flex-wrap gap-2 items-center pt-1">
                <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#FCFAF9]/50 mr-1 block sm:inline">Explore Spaces:</span>
                <Link
                  href="/private-cabins"
                  className="text-[11px] font-bold text-[#FCFAF9] hover:text-[#04B8BB] bg-[rgba(252,250,249,0.08)] hover:bg-[rgba(4,184,187,0.12)] px-3 py-1.5 border border-[rgba(252,250,249,0.15)] hover:border-[#04B8BB] transition-colors inline-flex items-center gap-1"
                  data-testid="link-guide-private-cabins"
                >
                  <span>Private Cabins</span>
                  <span className="text-[#04B8BB]">→</span>
                </Link>
                <Link
                  href="/meeting-room"
                  className="text-[11px] font-bold text-[#FCFAF9] hover:text-[#04B8BB] bg-[rgba(252,250,249,0.08)] hover:bg-[rgba(4,184,187,0.12)] px-3 py-1.5 border border-[rgba(252,250,249,0.15)] hover:border-[#04B8BB] transition-colors inline-flex items-center gap-1"
                  data-testid="link-guide-meeting-room"
                >
                  <span>Meeting Room</span>
                  <span className="text-[#04B8BB]">→</span>
                </Link>
                <Link
                  href="/podcast-studio"
                  className="text-[11px] font-bold text-[#FCFAF9] hover:text-[#04B8BB] bg-[rgba(252,250,249,0.08)] hover:bg-[rgba(4,184,187,0.12)] px-3 py-1.5 border border-[rgba(252,250,249,0.15)] hover:border-[#04B8BB] transition-colors inline-flex items-center gap-1"
                  data-testid="link-guide-podcast-studio"
                >
                  <span>Podcast Studio</span>
                  <span className="text-[#04B8BB]">→</span>
                </Link>
              </div>
            </div>
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
  const imgSrc = getMediaUrl(data.imageUrl) || 'https://res.cloudinary.com/cyxow5rb/image/upload/v1787314494/deven_cowork/kpmcygjw6pp62a12cgmg.png';
  const showCta = data.cta?.enabled !== false;
  const ctaUrl = data.cta?.url || '#reservation';
  const ctaLabel = data.cta?.label || 'Book Your Free Tour';
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
                    <><span className="text-[#0C0C0C]/60">{line.slice(0, -1)}</span><span className="text-[#04B8BB]">{line.slice(-1)}</span></>
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
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#04B8BB]">
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
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#04B8BB] font-bold mb-3">HOW IT WORKS</div>
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
              <div className="bg-[#141414] border border-[rgba(252,250,249,0.12)] p-8 flex flex-col justify-between h-full rounded-sm relative group hover:border-[#04B8BB]/60 transition-colors">
                <div>
                  <div className="font-display font-black text-3xl text-[#04B8BB] mb-4">
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
            {data.ctaLabel || 'Book Your Free Tour'} &rarr;
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
                <div className="bg-white border border-[rgba(12,12,12,0.12)] hover:border-[#04B8BB]/60 p-7 sm:p-8 flex flex-col justify-between h-full transition-all duration-300 shadow-sm hover:shadow-md relative group rounded-sm">
                  {tier.isDevenEdge && (
                    <span className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-[.18em] bg-[#04B8BB] text-[#0C0C0C] px-2.5 py-1 rounded-xs">
                      DEVEN EDGE
                    </span>
                  )}
                  <div>
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-[#024E5C]/10 border border-[#024E5C]/20 flex items-center justify-center text-[#024E5C] group-hover:bg-[#04B8BB]/15 group-hover:text-[#0C0C0C] transition-colors mb-5">
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
                    <div className="mt-5 pt-3 border-t border-[rgba(12,12,12,0.06)] flex items-center justify-between text-[11px] font-bold text-[#024E5C] uppercase tracking-wider">
                      <Link
                        href="/amenities"
                        className="hover:text-[#04B8BB] transition-colors inline-flex items-center gap-1 group/link"
                        data-testid={`link-amenities-card-${index}`}
                      >
                        <span>+ {tier.items.length - 4} more benefits included</span>
                        <span className="text-[#04B8BB] font-mono group-hover/link:translate-x-0.5 transition-transform">→</span>
                      </Link>
                      <Link
                        href="/amenities"
                        className="text-[10px] text-[#04B8BB] font-bold hover:underline"
                        data-testid={`link-view-all-amenities-${index}`}
                      >
                        View All Amenities
                      </Link>
                    </div>
                  )}
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

        {/* Contextual CTA for Amenities */}
        <div className="mt-8 text-center">
          <Link
            href="/amenities"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#024E5C] hover:text-[#04B8BB] py-2.5 px-5 border border-[#024E5C]/20 hover:border-[#04B8BB] bg-white transition-all shadow-sm rounded-sm"
            data-testid="link-view-all-amenities-section"
          >
            <span>View All Workspace Amenities & Facilities</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Dramatic Value Reveal Block */}
        <RevealOnScroll delay={0.2} className="mt-16">
          <div className="bg-[#024E5C] border border-[#024E5C] p-8 sm:p-12 text-[#FCFAF9] text-center max-w-[880px] mx-auto rounded-sm relative overflow-hidden shadow-xl">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#04B8BB] mb-4">
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
              <div className="text-2xl text-[#04B8BB] font-bold hidden sm:block">➔</div>
              <div className="text-xl text-[#04B8BB] font-bold block sm:hidden">↓</div>

              {/* Founding Price */}
              <div className="text-center sm:text-left">
                <div className="text-[11px] font-bold text-[#04B8BB] uppercase tracking-widest mb-1">Your Founding Price</div>
                <div className="font-display font-black text-3xl sm:text-5xl text-[#04B8BB] tracking-tight leading-none">
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

// â"€â"€â"€ VALUE STACK â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
export function ValueStack({ valueStack, onReserve, cmsLoaded, cmsFailed }) {
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
          <div className="section-label mb-8">05 - THE VALUE</div>
          <h2
            className="font-display font-black leading-[1.01] tracking-tight uppercase"
            style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
          >
            {headlineLines.map((line, i) => {
              // Highlight the last line (assumed to be "a desk.")
              if (i === headlineLines.length - 1) {
                return (
                  <span key={i} className="block text-[#04B8BB]">{line}</span>
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
            <div className="flex items-center justify-between bg-[#04B8BB] text-[#0C0C0C] p-6">
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
  const ctaLabel = data.ctaLabel || 'Book Your Free Tour';
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
                  <Check size={32} strokeWidth={3} className="text-[#04B8BB] mb-2" />
                  <div className="text-[8px] font-black uppercase tracking-[0.18em] text-[#04B8BB] leading-tight px-4">Risk Free</div>
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
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[#04B8BB] flex-shrink-0 flex items-center justify-center">
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
    return <img src={optimizeImageUrl(photo.url, 120)} alt={name || 'Member'} className="w-12 h-12 rounded-full object-cover border-2 border-[#04B8BB]/40" loading="lazy" />;
  }
  if (photo && typeof photo === 'string' && photo.startsWith('http')) {
    return <img src={optimizeImageUrl(photo, 120)} alt={name || 'Member'} className="w-12 h-12 rounded-full object-cover border-2 border-[#04B8BB]/40" loading="lazy" />;
  }
  return (
    <div className="w-12 h-12 rounded-full bg-[#04B8BB]/20 border-2 border-[#04B8BB]/30 flex items-center justify-center flex-shrink-0">
      <span className="text-[13px] font-black text-[#04B8BB]">{initials}</span>
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
                  <span className="text-[#04B8BB] text-[14px] tracking-tight">
                    {'★'.repeat(googleStars)}{'☆'.repeat(5 - googleStars)}
                  </span>
                  <span className="text-[11px] text-[#FCFAF9]/80 font-semibold">
                    {googleRating} on Google &middot; {googleReviewCount} Reviews
                  </span>
                </a>
              ) : null}
              <button onClick={onReserve} className="button button-primary text-sm font-bold tracking-wider uppercase" data-testid="button-social-reserve">
                BOOK YOUR TOUR
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
              className="border border-[rgba(252,250,249,0.16)] bg-[#024E5C] p-7 flex flex-col justify-between hover:border-[#04B8BB]/40 transition-colors duration-300 rounded-sm"
            >
              <div>
                <span className="font-display font-black text-[40px] leading-none text-[#04B8BB]/25 block mb-3">&ldquo;</span>
                <p className="text-[13px] leading-[1.75] text-[#FCFAF9]/90 font-medium">{t.quote}</p>
              </div>
              <div className="mt-8 border-t border-[rgba(252,250,249,0.12)] pt-5 flex items-center gap-3">
                <TestimonialAvatar photo={t.photo} name={t.author} />
                <div>
                  <span className="font-display font-bold text-[#04B8BB] text-[11px] uppercase tracking-wider block">{t.author}</span>
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

// ─── PRICING / MEMBERSHIP ───────────────────────────────────────────────────
export function Pricing({ onReserve, pricing, dbPlans = [], scarcity, globalSettings, cmsLoaded, cmsFailed }) {
  useEffect(() => {
    trackPixelEvent('ViewContent', { content_name: 'Pricing' });
  }, []);

  const data = cmsLoaded ? pricing : (cmsFailed ? defaultContent.pricing : null);
  const s = scarcity || defaultContent.scarcity;
  const waNumber = (globalSettings?.whatsapp || defaultContent.globalSettings.whatsapp || '').replace(/\D/g, '');

  if (!data && (!dbPlans || dbPlans.length === 0)) {
    return (
      <section className="bg-[#FCFAF9] text-[#0C0C0C] py-24 sm:py-36 border-y border-[rgba(12,12,12,0.14)] grid-paper-light" id="pricing" data-testid="section-pricing">
        <div className="container-wide min-h-[500px]" />
      </section>
    );
  }

  const cmsPlans = data?.plans || [];
  const activeDbPlans = (dbPlans || []).filter(p => p.isActive !== false);

  // Dynamic connection: map database plans to membership section cards
  let plans = [];
  if (activeDbPlans.length > 0) {
    plans = activeDbPlans.map(dbPlan => {
      const cmsMatch = cmsPlans.find(cp =>
        (cp.slug && dbPlan.slug && cp.slug === dbPlan.slug) ||
        cp.name.toLowerCase().trim() === dbPlan.name.toLowerCase().trim()
      );
      return {
        _id: dbPlan._id,
        name: dbPlan.name,
        slug: dbPlan.slug,
        desc: dbPlan.description || cmsMatch?.desc || '',
        founding: dbPlan.pricingLabel || (dbPlan.price ? `₹${dbPlan.price.toLocaleString('en-IN')}/mo` : cmsMatch?.founding || ''),
        standard: dbPlan.standardPrice || cmsMatch?.standard || '',
        imageUrl: dbPlan.imageUrl || cmsMatch?.imageUrl || '',
        badge: dbPlan.badge || cmsMatch?.badge || (dbPlan.slug === 'dedicated-desk' ? 'MOST POPULAR' : ''),
        features: (dbPlan.features && dbPlan.features.length > 0) ? dbPlan.features : (cmsMatch?.features || []),
        isContactPlan: dbPlan.isContactPlan || (cmsMatch ? /cabin|private/i.test(cmsMatch.name) : false),
      };
    });
  } else {
    plans = cmsPlans;
  }

  const remaining = typeof s?.remainingSpots === 'number' ? s.remainingSpots : null;
  const total = typeof s?.totalSpots === 'number' ? s.totalSpots : 50;
  const closingDate = s?.closingDate || '';

  const [, setLocation] = useLocation();

  // Determine if a plan is the cabin/contact plan
  const isCabin = (plan) => /cabin|private/i.test(plan.name) || plan.isContactPlan;
  // Determine Most Popular
  const isMostPopular = (plan) => /dedicated/i.test(plan.name) || plan.badge === 'MOST POPULAR';

  const getPlanTargetUrl = (p) => {
    const name = (p.name || '').toLowerCase();
    const slug = (p.slug || '').toLowerCase();
    if (name.includes('cabin') || name.includes('private') || slug.includes('cabin') || p.isContactPlan) {
      return '/private-cabins';
    }
    if (name.includes('meeting') || slug.includes('meeting')) {
      return '/meeting-room';
    }
    if (name.includes('studio') || name.includes('podcast') || slug.includes('studio') || slug.includes('podcast')) {
      return '/podcast-studio';
    }
    return '/pricing';
  };

  const getPlanLinkText = (p) => {
    const name = (p.name || '').toLowerCase();
    const slug = (p.slug || '').toLowerCase();
    if (name.includes('cabin') || name.includes('private') || slug.includes('cabin') || p.isContactPlan) {
      return 'View Cabin Details';
    }
    if (name.includes('meeting') || slug.includes('meeting')) {
      return 'View Meeting Room Details';
    }
    if (name.includes('studio') || name.includes('podcast') || slug.includes('studio') || slug.includes('podcast')) {
      return 'View Studio Details';
    }
    return 'View Plan Details';
  };

  const handleCardClick = (e, url) => {
    if (e.target.closest('a, button, input, select, textarea')) return;
    if (url) {
      setLocation(url);
    }
  };

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
            {data?.headline || 'Choose the room that fits the way you work.'}
          </h2>
          <p className="mt-5 text-[14px] leading-[1.75] text-[#0C0C0C]/60 max-w-[520px]">
            {data?.subheadline || 'Choose the membership tier that fits your workflow. Experience Deven Co-Work in person.'}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start">
            <button type="button" onClick={onReserve} className="button button-dark" data-testid="button-pricing-reserve">
              BOOK YOUR TOUR <ArrowUpRight size={14} />
            </button>
          </div>
        </RevealOnScroll>

        {/* Plan cards: 3-col on desktop */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const popular = isMostPopular(plan);
            const cabin = isCabin(plan);
            const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hi, I'd like to know more about the Private Cabin at Deven Co-Work.")}`;
            const targetUrl = getPlanTargetUrl(plan);
            const linkText = getPlanLinkText(plan);

            return (
              <RevealOnScroll
                key={plan._id || index}
                delay={index * 0.07}
                className={[
                  'relative flex flex-col border bg-white overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-md hover:border-[#04B8BB]/40',
                  popular
                    ? 'border-[#024E5C] shadow-lg ring-1 ring-[#024E5C]/20 -translate-y-2 sm:-translate-y-3'
                    : 'border-[rgba(12,12,12,0.12)]',
                ].join(' ')}
                onClick={(e) => handleCardClick(e, targetUrl)}
                tabIndex={0}
                role="article"
                aria-label={`${plan.name} plan card`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (e.target.closest('a, button')) return;
                    e.preventDefault();
                    handleCardClick(e, targetUrl);
                  }
                }}
              >
                {/* Most Popular badge */}
                {popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-[#04B8BB] text-[#0C0C0C] text-[8.5px] font-black uppercase tracking-[0.2em] px-4 py-1 mt-3">
                    MOST POPULAR
                  </div>
                )}

                {/* Membership Plan Image — Fetched dynamically from Backend/Database Plan model */}
                {plan.imageUrl ? (
                  <Link
                    href={targetUrl}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="w-full overflow-hidden border-b border-[rgba(12,12,12,0.08)] bg-[#f4f4f4] block"
                    style={{ aspectRatio: '16/9' }}
                  >
                    <img
                      src={optimizeImageUrl(getMediaUrl(plan.imageUrl), 800)}
                      alt={`${plan.name} at Deven Co-Work`}
                      loading={index < 3 ? 'eager' : 'lazy'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.parentElement) e.currentTarget.parentElement.style.display = 'none'; }}
                    />
                  </Link>
                ) : null}

                {/* Card body */}
                <div className="p-7 flex flex-col flex-1">
                  {/* Plan name */}
                  <h3 className="font-display text-[14px] font-black uppercase tracking-[0.06em] text-[#0C0C0C]">
                    <Link
                      href={targetUrl}
                      className="hover:text-[#04B8BB] transition-colors inline-block"
                    >
                      {plan.name}
                    </Link>
                  </h3>

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
                            <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#04B8BB] bg-[#04B8BB]/15 px-2 py-1">
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

                  {/* Contextual Link to relevant page */}
                  <div className="mt-auto pt-5 border-t border-[rgba(12,12,12,0.06)] text-center">
                    <Link
                      href={targetUrl}
                      className="text-[11px] font-bold text-[#024E5C] hover:text-[#04B8BB] transition-colors inline-flex items-center gap-1 group/link"
                      data-testid={`link-plan-details-${index}`}
                    >
                      <span>{linkText}</span>
                      <span className="text-[#04B8BB] font-mono group-hover/link:translate-x-0.5 transition-transform">→</span>
                    </Link>
                  </div>

                  {/* Retain appropriate plan-related CTA (e.g. cabin WhatsApp CTA), remove tour booking CTA */}
                  {cabin && (
                    <div className="pt-3">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackPixelEvent('Lead', { content_name: 'WhatsApp' })}
                        className="button button-dark w-full text-center flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider"
                        data-testid={`button-plan-cabin-${index}`}
                      >
                        Talk to Us About a Cabin <ArrowUpRight size={13} />
                      </a>
                    </div>
                  )}
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

        {/* Contextual CTAs for Pricing & Cost Comparison */}
        <RevealOnScroll delay={0.12} className="mt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 p-6 bg-[#FCFAF9] border border-[rgba(12,12,12,0.1)] rounded-sm">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#04B8BB] block">COMPARE & EXPLORE PLANS</span>
            <p className="text-[13px] text-[#0C0C0C]/80 font-medium mt-1">
              Want a comprehensive feature breakdown or to calculate your team's workspace savings vs an independent office in Raipur?
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/pricing"
              className="button button-dark text-xs px-5 py-2.5 font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
              data-testid="link-pricing-view-plan-details"
            >
              <span>View Plan Details</span>
              <ArrowUpRight size={13} />
            </Link>
            <Link
              href="/cost-calculator"
              className="button button-outline text-xs px-5 py-2.5 font-bold uppercase tracking-wider text-[#0C0C0C] border-[#0C0C0C]/25 hover:border-[#04B8BB] inline-flex items-center gap-1.5"
              data-testid="link-pricing-compare-costs"
            >
              <span>Compare Workspace Costs</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </RevealOnScroll>

        {/* Scarcity note below plans */}
        {remaining !== null && remaining > 0 && (
          <RevealOnScroll delay={0.15} className="mt-10">
            <div className="border-l-2 border-[#04B8BB] pl-5">
              <p className="text-[13px] font-bold leading-[1.65] text-[#0C0C0C]">
                ⚡ Only{' '}
                <span className="bg-[#04B8BB] text-[#0C0C0C] px-1.5 py-0.5 border border-[#0C0C0C] font-mono font-black">{remaining}</span>
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
      <div className="container-wide">
        <RevealOnScroll className="text-center max-w-2xl mx-auto mb-14">
          <div className="section-label mb-6 text-[#04B8BB] font-black justify-center">COMMON QUESTIONS</div>
          <h2
            className="font-display font-black leading-[1.04] text-[#FCFAF9] uppercase tracking-tight"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
          >
            {sectionData?.headline || 'Everything You Wanted to Ask'}
          </h2>
          <p className="mt-6 text-[14px] leading-[1.75] text-[#FCFAF9]/75 max-w-[520px] mx-auto">
            {sectionData?.subheadline || 'Everything you need to know about memberships, pricing, rules, and billing details.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-4 items-center justify-center">
            <Button onClick={onReserve} testId="button-faq-reserve">Book Your Free Tour</Button>
            <Link
              href="/faq"
              className="button button-outline"
              data-testid="link-faq-view-all"
            >
              View All FAQs <ArrowUpRight size={14} />
            </Link>
          </div>
        </RevealOnScroll>

        <div className="max-w-3xl mx-auto flex flex-col justify-between">
          <div className="border-t border-[rgba(252,250,249,0.16)]">
            {data.map((item, index) => (
              <div key={index} className="border-b border-[rgba(252,250,249,0.16)]">
                <button
                  type="button"
                  className="flex py-6 w-full items-center justify-between gap-5 text-left group focus:outline-none focus:ring-1 focus:ring-[#04B8BB]"
                  onClick={() => setActive(active === index ? null : index)}
                  aria-expanded={active === index}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-button-${index}`}
                  data-testid={`button-faq-${index}`}
                >
                  <div className="flex gap-4 items-start">
                    <span className="font-display text-[10px] font-bold text-[#04B8BB] tracking-[.1em] mt-1 shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[15px] font-bold text-[#FCFAF9] tracking-[0.01em] group-hover:text-[#04B8BB] transition-colors">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-[#04B8BB] transition-transform duration-300 ${active === index ? 'rotate-180' : ''}`}
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
                        className="max-w-[700px] pb-6 pl-9 pr-4 text-[14px] leading-[1.75] text-[#FCFAF9]/80 font-normal"
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

          <div className="mt-8 pt-6 border-t border-[rgba(252,250,249,0.16)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#FCFAF9]/70 text-center sm:text-left">
            <span>Have questions about pricing, cabins, or trial access?</span>
            <Link
              href="/faq"
              className="text-[#04B8BB] hover:underline font-bold inline-flex items-center gap-1"
              data-testid="link-faq-view-all-bottom"
            >
              <span>View All FAQs</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── RESERVATION SECTION ─────────────────────────────────────────────────────
function Reservation({ utm, finalCTA, reservation, reservedCount, globalSettings, freeTrial, bookingAmount, cmsLoaded, cmsFailed }) {
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

  const resData = cmsLoaded ? reservation : (cmsFailed ? defaultContent.reservation : null);
  const settings = cmsLoaded ? globalSettings : (cmsFailed ? defaultContent.globalSettings : null);

  if (!resData || !settings) {
    return (
      <section className="border-t border-[rgba(12,12,12,0.14)] bg-[#FCFAF9] py-20 sm:py-28 text-[#0C0C0C]" id="reservation" data-testid="section-reservation">
        <div className="container-wide min-h-[600px]" />
      </section>
    );
  }

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const utmData = {
    utmSource: utm?.source || '',
    utmMedium: utm?.medium || '',
    utmCampaign: utm?.campaign || '',
  };

  const handleSubmitTour = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Please complete Name, Phone, and Email fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.bookTour({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        numberOfPeople: parseInt(form.numberOfPeople, 10) || 1,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        message: form.message.trim(),
        email_confirm: form.email_confirm || '',
        ...utmData,
      });
      trackPixelEvent('Lead', { content_name: 'Book Your Tour Section' });
      trackPixelEvent('Schedule');
      localStorage.setItem('last_reservation', JSON.stringify({ ...res.data, type: 'TOUR' }));
      sessionStorage.setItem('tourPopupShown', 'true');
      setLocation('/thank-you');
    } catch (err) {
      setError(err.message || 'Failed to submit tour booking request.');
    } finally {
      setLoading(false);
    }
  };

  const headlineLines = (resData.reservationHeading || 'Book Your\nFree Tour.').split('\n');

  return (
    <section
      className="border-t border-[rgba(12,12,12,0.14)] bg-[#FCFAF9] py-20 sm:py-28 text-[#0C0C0C]"
      id="reservation"
      data-testid="section-reservation"
    >
      <div className="container-wide">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20 items-start">

          {/* Left: Heading & Info */}
          <RevealOnScroll className="space-y-6 lg:sticky lg:top-24">
            <div className="section-label">10 — TOUR BOOKING</div>
            <h2
              className="font-display font-black leading-[1.04] text-[#0C0C0C] uppercase tracking-tight"
              style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
            >
              {headlineLines.map((line, i) => (
                <span key={i} className="block">
                  {i === headlineLines.length - 1
                    ? <span className="text-[#04B8BB]">{line}</span>
                    : line}
                </span>
              ))}
            </h2>
            <p className="text-[14px] leading-[1.75] text-[#0C0C0C]/75 max-w-[440px]">
              {resData.reservationDescription || 'Experience Deven Co-Work in person. Book a free tour and experience the space before you decide.'}
            </p>

            <div className="scarcity-badge flex-col items-start py-2 border border-[#04B8BB]/30 bg-[#04B8BB]/5 p-4 rounded-none">
              <span className="text-[#04B8BB] text-[10px] font-black uppercase tracking-wider">100% FREE TOUR</span>
              <span className="text-[#0C0C0C]/75 text-[11px] mt-1">
                No payment or credit card required. Experience Raipur's most inspiring work environment first-hand.
              </span>
            </div>

            <div className="pt-3 border-t border-[rgba(12,12,12,0.08)]">
              <p className="text-[12px] text-[#0C0C0C]/65 mb-2 font-medium">
                Prefer to call our team directly, chat on WhatsApp, or get map directions?
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#024E5C] hover:text-[#04B8BB] transition-colors underline decoration-[#04B8BB] underline-offset-4"
                data-testid="link-reservation-contact-our-team"
              >
                <span>Contact Our Team</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </RevealOnScroll>

          {/* Right: Tour Form */}
          <RevealOnScroll delay={0.1} className="space-y-5 min-w-0 w-full overflow-hidden">
            <form className="space-y-4 w-full min-w-0 bg-[#0F0F10] p-6 sm:p-8 border border-[#222224] rounded-2xl shadow-xl text-[#FCFAF9]" onSubmit={handleSubmitTour}>
              {/* Honeypot */}
              <input type="text" name="email_confirm" style={{ display: 'none' }} tabIndex={-1} autoComplete="off"
                onChange={(e) => update('email_confirm', e.target.value)} value={form.email_confirm || ''} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="tour-form-name" className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input id="tour-form-name" type="text" placeholder="Rahul Sharma" value={form.name}
                    onChange={(e) => update('name', e.target.value)} required disabled={loading}
                    className="w-full bg-[#1A1A1C] border border-[#2B2B2E] text-white placeholder-neutral-500 px-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:border-[#04B8BB] transition-all" />
                </div>
                <div>
                  <label htmlFor="tour-form-phone" className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Phone Number *
                  </label>
                  <input id="tour-form-phone" type="tel" placeholder="+91 98765 43210" value={form.phone}
                    onChange={(e) => update('phone', e.target.value)} required disabled={loading}
                    className="w-full bg-[#1A1A1C] border border-[#2B2B2E] text-white placeholder-neutral-500 px-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:border-[#04B8BB] transition-all" />
                </div>
              </div>

              <div>
                <label htmlFor="tour-form-email" className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input id="tour-form-email" type="email" placeholder="rahul@company.com" value={form.email}
                  onChange={(e) => update('email', e.target.value)} required disabled={loading}
                  className="w-full bg-[#1A1A1C] border border-[#2B2B2E] text-white placeholder-neutral-500 px-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:border-[#04B8BB] transition-all" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="tour-form-date" className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    id="tour-form-date"
                    type="date"
                    value={form.preferredDate}
                    onChange={(e) => update('preferredDate', e.target.value)}
                    disabled={loading}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#1A1A1C] border border-[#2B2B2E] text-white px-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:border-[#04B8BB] transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="tour-form-time" className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Preferred Time Slot
                  </label>
                  <select
                    id="tour-form-time"
                    value={form.preferredTime}
                    onChange={(e) => update('preferredTime', e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#1A1A1C] border border-[#2B2B2E] text-white px-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:border-[#04B8BB] transition-all appearance-none"
                  >
                    <option value="Morning (10 AM - 1 PM)">Morning (10 AM - 1 PM)</option>
                    <option value="Afternoon (1 PM - 5 PM)">Afternoon (1 PM - 5 PM)</option>
                    <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="tour-form-company" className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Company / Project (Optional)
                  </label>
                  <input id="tour-form-company" type="text" placeholder="Your Startup / Project" value={form.company}
                    onChange={(e) => update('company', e.target.value)} disabled={loading}
                    className="w-full bg-[#1A1A1C] border border-[#2B2B2E] text-white placeholder-neutral-500 px-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:border-[#04B8BB] transition-all" />
                </div>

                <div>
                  <label htmlFor="tour-form-people" className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Number of People
                  </label>
                  <select
                    id="tour-form-people"
                    value={form.numberOfPeople}
                    onChange={(e) => update('numberOfPeople', e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#1A1A1C] border border-[#2B2B2E] text-white px-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:border-[#04B8BB] transition-all appearance-none"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 - 4 People</option>
                    <option value="5">5 - 10 People</option>
                    <option value="10">10+ People / Team</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="tour-form-message" className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Specific Requirements (Optional)
                </label>
                <textarea
                  id="tour-form-message"
                  rows={2}
                  placeholder="e.g. Private cabin enquiry, podcast studio tour..."
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#1A1A1C] border border-[#2B2B2E] text-white placeholder-neutral-500 p-3 text-xs rounded-lg focus:outline-none focus:border-[#04B8BB] transition-all"
                />
              </div>

              {error && (
                <p className="text-[11px] text-red-300 bg-red-950/70 p-3 rounded-lg border border-red-500/40">
                  {error}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#04B8BB] hover:bg-[#039da0] text-[#0C0C0C] font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#04B8BB]/20 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'BOOK YOUR TOUR'}
                </button>
              </div>
            </form>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

// ────── FOOTER ───────────────────────────────────────────────────────────────
export function Footer({ footer, globalSettings, cmsLoaded, cmsFailed }) {
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
  const email = data.email || settings.email || 'hellodevencowork@gmail.com';
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
              <a key={idx} href={link.href} className="hover:text-[#04B8BB] transition-colors">{link.label}</a>
            ))}
          </div>
          <div className="mt-6">
            <span className="font-display text-[10px] font-bold text-[#FCFAF9]/40 uppercase tracking-[.15em] block mb-2">Explore</span>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10.5px] text-[#FCFAF9]/55">
              <Link href="/private-cabins" className="hover:text-[#04B8BB] transition-colors">Private Cabins</Link>
              <Link href="/meeting-room" className="hover:text-[#04B8BB] transition-colors">Meeting Room</Link>
              <Link href="/podcast-studio" className="hover:text-[#04B8BB] transition-colors">Podcast Studio</Link>
              <Link href="/free-trial" className="hover:text-[#04B8BB] transition-colors">Free Trial</Link>
              <Link href="/pricing" className="hover:text-[#04B8BB] transition-colors">Pricing</Link>
              <Link href="/amenities" className="hover:text-[#04B8BB] transition-colors">Amenities</Link>
              <Link href="/faq" className="hover:text-[#04B8BB] transition-colors">FAQ</Link>
              <Link href="/cost-calculator" className="hover:text-[#04B8BB] transition-colors">Cost Calculator</Link>
              <Link href="/contact" className="hover:text-[#04B8BB] transition-colors">Contact</Link>
            </div>
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
                <a href={cleanPhoneHref} onClick={() => trackPixelEvent('Contact')} className="text-[#04B8BB] hover:text-[#04B8BB] transition-colors" data-testid="link-footer-phone">{phone}</a>
                <br />
                <a href={`mailto:${email}`} className="text-[#04B8BB] hover:text-[#04B8BB] transition-colors">{email}</a>
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
                  className="mt-3 inline-block text-[11px] font-bold text-[#04B8BB] hover:text-[#04B8BB] transition-colors"
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

// â"€â"€â"€ WHATSAPP FLOAT â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
export function WhatsAppFloat({ whatsapp, message, cmsLoaded, cmsFailed }) {
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
      onClick={() => trackPixelEvent('Lead', { content_name: 'WhatsApp' })}
      className="wa-float-btn"
      data-testid="link-floating-whatsapp"
    >
      <FaWhatsapp size={26} color="#ffffff" />
    </a>
  );
}

// â"€â"€â"€ MOBILE STICKY CTA BAR â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function MobileStickyCTA({ onReserve }) {
  return (
    <button
      type="button"
      onClick={onReserve}
      className="mobile-sticky-cta"
      aria-label="Book Your Tour — open tour modal"
      data-testid="button-mobile-sticky-cta"
    >
      BOOK YOUR TOUR →
    </button>
  );
}

// â"€â"€â"€ HOME PAGE â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
export const getInitialCmsData = () => {
  if (typeof window !== 'undefined' && window.__INITIAL_CMS_DATA__) {
    return mergeContent(defaultContent, window.__INITIAL_CMS_DATA__);
  }
  if (typeof window === 'undefined' && globalThis.__SSR_CMS_DATA__) {
    return mergeContent(defaultContent, globalThis.__SSR_CMS_DATA__);
  }
  return null;
};

function Home() {
  const initialData = getInitialCmsData();
  const [content, setContent] = useState(() => initialData || defaultContent);
  const [cmsLoaded, setCmsLoaded] = useState(!!initialData || typeof window === 'undefined');
  const [cmsFailed, setCmsFailed] = useState(false);
  const [utm, setUtm] = useState({ source: '', medium: '', campaign: '' });
  const [reserveOpen, setReserveOpen] = useState(false);
  const [reservedCount, setReservedCount] = useState(23);
  const [bookingAmount, setBookingAmount] = useState(null);
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [dbPlans, setDbPlans] = useState([]);

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
      const faviconUrl = getMediaUrl(settings?.favicon) || '/favicon-96x96.png';
      const absoluteSocialImage = getAbsoluteMediaUrl(settings?.favicon || seo?.ogImage, '/favicon-96x96.png');

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

    api.fetchPlans()
      .then((res) => {
        if (res.success && res.data) {
          setDbPlans(res.data);
        }
      })
      .catch((err) => console.error('Failed to fetch DB plans', err));

    fetchLiveSeatsCount();

    let ws = null;
    try {
      if (typeof window !== 'undefined' && window.WebSocket) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        ws = new WebSocket(`${protocol}//${host}`);
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'SEAT_UPDATE') fetchLiveSeatsCount();
          } catch (err) {
            console.error('Error in App.jsx WS message listener', err);
          }
        };
      }
    } catch (e) {
      console.warn('WebSocket init skipped or failed in current environment:', e);
    }
    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Automatic tour popup delay (~7 seconds)
  useEffect(() => {
    if (sessionStorage.getItem('tourPopupShown')) return;
    const timer = setTimeout(() => {
      setTourModalOpen(true);
      sessionStorage.setItem('tourPopupShown', 'true');
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToReservation = () => {
    setTourModalOpen(true);
  };

  // Cross-page & direct hash scroller (e.g. /#space, /#pricing)
  useEffect(() => {
    if (!cmsLoaded && !cmsFailed) return;
    const hash = window.location.hash?.replace(/^#/, '');
    if (!hash) return;

    let attempts = 0;
    const maxAttempts = 20;
    const tryScroll = () => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryScroll, 100);
      }
    };
    const timer = setTimeout(tryScroll, 150);
    return () => clearTimeout(timer);
  }, [cmsLoaded, cmsFailed]);

  // Listen for hash changes while staying on Home
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash?.replace(/^#/, '');
      if (hash) {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (!cmsLoaded && !cmsFailed) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0C0C0C] text-[#FCFAF9]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#04B8BB] border-t-transparent" />
          <p className="font-display text-xs font-bold tracking-widest text-[#FCFAF9]/70 uppercase">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  let sectionOrder = content?.sectionOrder || defaultContent.sectionOrder;
  // Move valueStack from homepage to /pricing page
  sectionOrder = sectionOrder.filter(key => key !== 'valueStack');
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
    guarantee: <Guarantee key="guarantee" guarantee={content?.riskReversal} onReserve={scrollToReservation} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />,
    socialProof: <SocialProof key="socialProof" socialProof={content?.socialProof} onReserve={scrollToReservation} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />,
    pricing: <Pricing key="pricing" onReserve={scrollToReservation} pricing={content?.pricing} dbPlans={dbPlans} scarcity={content?.scarcity} globalSettings={content?.globalSettings} cmsLoaded={cmsLoaded} cmsFailed={cmsFailed} />,
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
      <TourBookingModal isOpen={tourModalOpen} onClose={() => setTourModalOpen(false)} utm={utm} />
      {reserveOpen && <span className="sr-only" aria-live="polite">Reservation form is in view.</span>}
    </div>
  );
}

// â"€â"€â"€ ROUTING â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function Router() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/thank-you" component={ThankYou} />
        <Route path="/events" component={EventsPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:slug">
          {(params) => <BlogPostPage params={params} />}
        </Route>
        {PAGE_ORDER.map((slug) => (
          <Route key={slug} path={PAGES[slug].path}>
            <ContentPage slug={slug} />
          </Route>
        ))}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function RoutedErrorBoundary({ children }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function MetaPixelRouteTracker() {
  const [location] = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trackPixelEvent('PageView');
  }, [location]);

  return null;
}

function App({ ssrLocation } = {}) {
  const routerProps = ssrLocation
    ? { hook: memoryLocation({ path: ssrLocation, static: true }).hook }
    : { base: import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/$/, '') : '' };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter {...routerProps}>
          {!ssrLocation && <MetaPixelRouteTracker />}
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
