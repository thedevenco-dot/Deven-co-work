import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true, // 'draft' or 'published'
    },

    // ─── GLOBAL SETTINGS ───────────────────────────────────────────────────────
    globalSettings: {
      businessName: { type: String, default: 'Deven Co-Work' },
      shortDesc: { type: String, default: "Raipur's Most Premium Coworking Space" },
      longDesc: { type: String, default: '' },
      address: { type: String, default: 'VIP Estate, A1, VIP Colony, Shankar Nagar, Raipur, Chhattisgarh 492001' },
      landmark: { type: String, default: '5 mins from Marine Drive, near Shankar Nagar' },
      phone: { type: String, default: '+91 62605 82852' },
      whatsapp: { type: String, default: '+91 62605 82852' },
      email: { type: String, default: 'bookings@devencowork.com' },
      mapsUrl: { type: String, default: 'https://www.google.com/maps/dir/22.510398,82.552375/Deven+Co-Work' },
      mapsEmbedSrc: { type: String, default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.5284307521743!2d81.6731683!3d21.2595151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28ddb73efa82a7%3A0xb99b968caba2d846!2sDeven+Co-Work%2C+VIP+Estate%2C+A1%2C+VIP+Colony%2C+Raipur%2C+Chhattisgarh+492001!5e0!3m2!1sen!2sin!4v1717800000000!5m2!1sen!2sin' },
      instagram: { type: String, default: 'https://instagram.com/' },
      facebook: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
      googleBusiness: { type: String, default: 'https://www.google.com/maps/' },
      copyright: { type: String, default: '© {year} Deven Co-Work · Approved founding rate is locked upon deposit reservation' },
      favicon: { type: mongoose.Schema.Types.Mixed, default: '' },
      logo: { type: mongoose.Schema.Types.Mixed, default: '' },
      logoWhite: { type: mongoose.Schema.Types.Mixed, default: '' },
      ogImage: { type: mongoose.Schema.Types.Mixed, default: '' },
      // Analytics (non-secret IDs only — never expose secrets here)
      gaId: { type: String, default: '' },
      gtmId: { type: String, default: '' },
      metaPixelId: { type: String, default: '' },
    },

    // ─── SEO ──────────────────────────────────────────────────────────────────
    seo: {
      title: { type: String, default: 'Deven Co-Work | Premium Coworking Space in Raipur' },
      description: { type: String, default: 'Raipur’s premium coworking space — a content studio, real community, and everything you need to grow, not just work. Only 50 founding seats. Maximum 7 seats per client, founder, or company.' },
      keywords: { type: String, default: 'coworking raipur, coworking space raipur, founder workspace raipur, deven cowork' },
      ogTitle: { type: String, default: 'Deven Co-Work | Premium Coworking Space in Raipur' },
      ogDescription: { type: String, default: 'Raipur’s premium coworking space — a content studio, real community, and everything you need to grow, not just work. Only 50 founding seats. Maximum 7 seats per client, founder, or company.' },
      ogImage: { type: mongoose.Schema.Types.Mixed, default: '' },
      twitterTitle: { type: String, default: 'Deven Co-Work | Premium Coworking Space in Raipur' },
      twitterDescription: { type: String, default: 'Raipur’s premium coworking space — a content studio, real community, and everything you need to grow, not just work. Only 50 founding seats. Maximum 7 seats per client, founder, or company.' },
      twitterImage: { type: mongoose.Schema.Types.Mixed, default: '' },
    },

    // ─── NAVIGATION ───────────────────────────────────────────────────────────
    navigation: {
      items: {
        type: [
          {
            label: { type: String, default: '' },
            url: { type: String, default: '#' },
            external: { type: Boolean, default: false },
            visible: { type: Boolean, default: true },
            order: { type: Number, default: 0 },
          },
        ],
        default: [
          { label: 'Pricing', url: '#pricing', external: false, visible: true, order: 0 },
          { label: 'Contact', url: '#reservation', external: false, visible: true, order: 2 },
        ],
      },
      ctaLabel: { type: String, default: 'Book Free Trial' },
      ctaUrl: { type: String, default: '#reservation' },
      ctaVisible: { type: Boolean, default: true },
    },

    // ─── HEADER ───────────────────────────────────────────────────────────────
    header: {
      phone: { type: String, default: '+91 62605 82852' },
      logo: { type: mongoose.Schema.Types.Mixed, default: '' },
    },

    // ─── HERO ─────────────────────────────────────────────────────────────────
    hero: {
      eyebrow: { type: String, default: "RAIPUR'S FOUNDERS' WORKSPACE" },
      location: { type: String, default: 'VIP ESTATE, A1, VIP COLONY, SHANKAR NAGAR, RAIPUR, CHHATTISGARH 492001' },
      headline: { type: String, default: "Not Just a Desk.\nYour Complete Founder's Operating System." },
      subheadline: { type: String, default: "Raipur's most premium coworking space — a content studio, a real community, and everything you need to grow, not just work. Only 50 founding seats. Maximum 7 seats per client, founder or company." },
      primaryCtaLabel: { type: String, default: 'Book Your Free 2-Day Trial' },
      primaryCtaUrl: { type: String, default: '#reservation' },
      secondaryCtaLabel: { type: String, default: 'See Founding Member Pricing ↓' },
      secondaryCtaUrl: { type: String, default: '#pricing' },
      foundingPriceNote: { type: String, default: 'Founding plan from ₹5,999 / month · Rate locked for founding batch' },
      videoUrl: { type: mongoose.Schema.Types.Mixed, default: '/assets/hero-workspace.mp4' },
      imageUrl: { type: mongoose.Schema.Types.Mixed, default: '/assets/hero-fallback.png' },
      stats: {
        type: [
          {
            main: { type: String, default: '' },
            sub: { type: String, default: '' },
          },
        ],
        default: [
          { main: '2-Day Free Trial', sub: 'No card required' },
          { main: '500 Mbps Wifi', sub: 'High Speed' },
          { main: '9 AM–9 PM, 7 Days', sub: 'Access Hours' },
          { main: 'Central Raipur Location', sub: 'City Centre' },
        ],
      },
      // Floating info cards on hero image (e.g. "50 / FOUNDING SEATS")
      floatingStats: {
        type: [
          {
            value: { type: String, default: '' },
            label: { type: String, default: '' },
          },
        ],
        default: [
          { value: '50', label: 'Founding Seats' },
          { value: '₹1,000', label: 'Refundable Deposit' },
        ],
      },
      // Bottom metadata strip items
      metaItems: {
        type: [String],
        default: ['RAIPUR', 'VIP ESTATE', '50 SEATS', 'FRI — SAT FREE TRIAL'],
      },
      // Words to highlight in cyan accent (comma-separated)
      highlightWords: { type: String, default: '' },
    },

    // ─── PROBLEM ──────────────────────────────────────────────────────────────
    problem: {
      headline: { type: String, default: 'Still Working From Your Dining Table, a Noisy Café, or a Cramped Office?' },
      body: { type: String, default: "You've outgrown working from home. The wifi drops during client calls. There's nowhere professional to host a meeting. And every \"coworking space\" you've seen in Raipur feels like a leftover office with some beanbags thrown in.\n\nYou didn't start your business to work like this." },
      imageUrl: { type: mongoose.Schema.Types.Mixed, default: '' },
      // Overlapping quote card on the image
      quoteText: { type: String, default: "You're not lazy. Your environment is holding you back." },
      quoteAuthor: { type: String, default: '' },
      blocks: {
        type: [
          {
            title: { type: String, default: '' },
            description: { type: String, default: '' },
            icon: { type: String, default: '' },
          },
        ],
        default: [
          { title: 'The Dining Table Trap', description: 'Your family loves you, but they are also your loudest distractions. You cannot build a company between laundry cycles and kitchen noise.', icon: 'Home' },
          { title: 'The Noisy Café Tax', description: 'Buying ₹300 lattes just to borrow WiFi for two hours is not a business model. It is a slow leak in your runway.', icon: 'Coffee' },
          { title: 'The Cramped Office Prison', description: 'Renting a tiny, windowless room in a commercial building is depressing. It kills your creativity and makes client meetings awkward.', icon: 'Briefcase' },
        ],
      },
      // Canonical repeatable problem points (replaces blocks)
      problemPoints: {
        type: [
          {
            title: { type: String, default: '' },
            description: { type: String, default: '' },
          },
        ],
        default: [],
      },
      cta: {
        label: { type: String, default: 'Book Your Free 2-Day Trial' },
        url: { type: String, default: '#reservation' },
        enabled: { type: Boolean, default: true },
      },
    },

    // ─── GUIDE ────────────────────────────────────────────────────────────────
    guide: {
      headline: { type: String, default: 'We Built the Space Raipur Founders Actually Deserve' },
      body1: { type: String, default: "We know what it's like to need a professional address, a reliable internet connection, and a room that doesn't embarrass you in front of a client — because we built Deven Co-Work solving that exact problem for ourselves first." },
      body2: { type: String, default: "Deven Co-Work is Raipur's most premium coworking space — right in the heart of the city, built for founders, freelancers, consultants, and teams who refuse to compromise on how they work." },
      galleryTitle: { type: String, default: 'A Space Built for Professional Work' },
      gallery: {
        type: [
          {
            image: { type: mongoose.Schema.Types.Mixed, default: '' },
            label: { type: String, default: '' },
            caption: { type: String, default: '' },
            // 'large' | 'medium' | 'small' — hints for masonry layout
            size: { type: String, default: 'medium' },
          },
        ],
        default: [
          { image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', label: 'MAIN AREA', caption: 'The main workspace floor', size: 'large' },
          { image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80', label: 'PODCAST DESK', caption: 'Content studio setup', size: 'small' },
          { image: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=400&q=80', label: 'MEETING ROOM', caption: 'Private meeting space', size: 'small' },
          { image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80', label: 'CAFE LOBBY', caption: 'Coffee bar & lounge', size: 'medium' },
          { image: 'https://images.unsplash.com/photo-1530745342582-0795f23ec976?auto=format&fit=crop&w=600&q=80', label: 'GREEN ZONE', caption: 'Natural light workspace', size: 'medium' },
          { image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80', label: 'TECH LOUNGE', caption: 'Tech & collaboration zone', size: 'medium' },
        ],
      },
      blocks: {
        type: [
          {
            title: { type: String, default: '' },
            description: { type: String, default: '' },
          },
        ],
        default: [
          { title: 'Built by Founders', description: 'Solving the exact address, internet, and client meeting problems we faced.' },
          { title: 'Raipur City Center', description: 'Located in Shankar Nagar (VIP Estate), easily reachable from anywhere.' },
          { title: 'Premium Only', description: 'Designed specifically for teams and founders who refuse to compromise.' },
        ],
      },
    },

    // ─── PLAN (3-STEP PROCESS) ─────────────────────────────────────────────────
    plan: {
      headline: { type: String, default: 'Getting Started Is Simple' },
      ctaLabel: { type: String, default: 'Start With Your Free Trial' },
      ctaUrl: { type: String, default: '#reservation' },
      steps: {
        type: [
          {
            title: { type: String, default: '' },
            description: { type: String, default: '' },
          },
        ],
        default: [
          { title: 'Book Your Free 2-Day Trial', description: 'No card, no pressure, just come work from here.' },
          { title: 'Pick Your Plan', description: 'Hot Desk or Dedicated Desk — whatever fits.' },
          { title: 'Move In & Grow', description: 'Join a real community, not just a shared room.' },
        ],
      },
    },

    // ─── OFFER STACK ──────────────────────────────────────────────────────────
    offerStack: {
      headline: { type: String, default: "Everything Included in The Deven Founder's OS" },
      subheadline: { type: String, default: 'Not a list of amenities. A complete system to work, grow, and be seen.' },
      tiers: {
        type: [
          {
            heading: { type: String, default: '' },
            items: { type: [String], default: [] },
            isDevenEdge: { type: Boolean, default: false },
          },
        ],
        default: [
          {
            heading: 'THE WORKSPACE',
            items: ['Team Meeting Room with Interactive Digital Panel', 'Reception', '500 Mbps Wifi', '9 AM–9 PM Access', 'Locker & Drawer', '75% Natural Light', 'Power Backup', 'High-Quality Lighting', 'Daily Cleaning & Maintenance', '2 Charging Points at Every Desk', 'Color Printer', 'Coffee Bar — 20+ Coffees, 5+ Teas', '2 Cups Tea/Coffee Daily', '50+ Plants', 'Recreation Space', 'Kitchen/Food Heating Space', 'First-Aid & Wellness Kit', 'Unlimited RO Water & Healthy Snacks', 'Dedicated Parking'],
            isDevenEdge: false,
          },
          {
            heading: 'THE GROWTH ENGINE',
            items: ["Raipur Founder's Workspace Checklist", '20 Free Business Templates', '100 Deven Business Cards', 'Welcome Kit'],
            isDevenEdge: true,
          },
          {
            heading: 'THE PERSONAL BRAND BOOST',
            items: ['Content Studio Access', '1 Professional Founder Podcast Episode', '1 Instagram Collaboration/Month', '1 Professional Founder Photoshoot Every 6 Months', 'Founding Member Badge', 'Annual Deven Awards Night Invite'],
            isDevenEdge: true,
          },
          {
            heading: 'THE LEARNING',
            items: ['1 AI Workshop/Month', '1 Book Reading Workshop/Month', 'Deven Library — 100+ Books', '1 Ask Me Anything Session/Month'],
            isDevenEdge: true,
          },
          {
            heading: 'THE CONNECT',
            items: ["Founder's Growth WhatsApp Community", '2 Events/Month — 1 Fun + 1 Educational'],
            isDevenEdge: false,
          },
          {
            heading: 'THE RISK-FREE ENTRY',
            items: ['2-Day Free Trial', '7-Day "Love It or Leave It" Guarantee'],
            isDevenEdge: false,
          },
        ],
      },
    },

    // ─── VALUE STACK ──────────────────────────────────────────────────────────
    valueStack: {
      headline: { type: String, default: "Here's Everything You Actually Get" },
      body: { type: String, default: 'No inflated comparison price, no hidden bundle. We publish our true market value transparently.' },
      subheadline: { type: String, default: '' },
      rows: {
        type: [
          {
            inclusion: { type: String, default: '' },
            val: { type: String, default: '' }, // legacy string like '₹6,000/mo'
          },
        ],
        default: [
          { inclusion: 'Dedicated Workspace, 9 AM–9 PM, 7 Days', val: '₹6,000/mo' },
          { inclusion: '500 Mbps Wifi, Printer, Locker, Charging Points', val: 'Priceless' },
          { inclusion: 'Coffee Bar — 20+ Coffees, 5+ Teas', val: '₹1,500/mo' },
          { inclusion: '2 Events + AI Workshop + Book Workshop/month', val: '₹2,500/mo' },
          { inclusion: 'Deven Library Access — 100+ Books', val: '₹500/mo' },
          { inclusion: "Founder's Growth WhatsApp Community", val: 'Priceless' },
          { inclusion: 'Content Studio + Podcast + Instagram Collab', val: '₹8,000+/mo' },
          { inclusion: 'Professional Photoshoot — every 6 months', val: '₹15,000 one-time' },
        ],
      },
      // Canonical repeatable value items (replaces rows)
      valueItems: {
        type: [
          {
            title: { type: String, default: '' },
            description: { type: String, default: '' },
            value: { type: Number, default: 0 },
            displayValue: { type: String, default: '' },
            visible: { type: Boolean, default: true },
            // Highlighted state — used for total/founding price rows
            highlighted: { type: Boolean, default: false },
            icon: { type: String, default: '' },
          },
        ],
        default: [],
      },
      totalValue: { type: String, default: '₹25,000+/month' },
      foundingPrice: { type: String, default: 'From ₹5,999/month' },
    },

    // ─── RISK REVERSAL / GUARANTEE ────────────────────────────────────────────
    riskReversal: {
      headline: { type: String, default: 'Try Deven Co-Work — Completely Risk Free' },
      subheadline: { type: String, default: 'No risk, no lock-in. Come in and experience Raipur\'s most premium space with total confidence.' },
      blocks: {
        type: [
          {
            title: { type: String, default: '' },
            description: { type: String, default: '' },
          },
        ],
        default: [
          { title: 'The 2-Day Free Trial', description: 'Full desk access, wifi, coffee bar, and one community intro — no card required, no obligation.' },
          { title: 'The "Love It or Leave It" Guarantee', description: "Join after your trial and attend 1 event + 1 workshop in your first 30 days. If you haven't made a genuine business connection or walked away with something useful — we'll refund your first month, no argument." },
        ],
      },
    },

    // ─── SOCIAL PROOF / TESTIMONIALS ─────────────────────────────────────────
    socialProof: {
      headline: { type: String, default: 'What Founders Are Saying' },
      subheadline: { type: String, default: 'Hear from our members who switched to Deven Co-Work. Real reviews, updated dynamically.' },
      testimonials: {
        type: [
          {
            quote: { type: String, default: '' },
            author: { type: String, default: '' },
            role: { type: String, default: '' },
            featured: { type: Boolean, default: false },
            published: { type: Boolean, default: true },
            order: { type: Number, default: 0 },
          },
        ],
        default: [],
      },
    },

    // ─── PRICING ──────────────────────────────────────────────────────────────
    pricing: {
      headline: { type: String, default: 'Choose the room that fits the way you work.' },
      subheadline: { type: String, default: 'Choose the membership tier that fits your workflow. Reserve your spot today to lock in these exclusive founding rates.' },
      spotsLeft: { type: String, default: '[X]' },
      closesDate: { type: String, default: '[date]' },
      stickyScarcityNote: { type: String, default: '23 of 50 founding seats reserved. Maximum 7 seats per business. Founding pricing closes soon.' },
      foundingPriceNote: { type: String, default: '' },
      plans: {
        type: [
          {
            name: { type: String, default: '' },
            standard: { type: String, default: '' },
            founding: { type: String, default: '' },
            desc: { type: String, default: '' },
          },
        ],
        default: [
          { name: 'Hot Desk', standard: '₹7,500/mo', founding: '₹5,999/mo', desc: 'Flexible access for focused days. Includes shared workspace, meeting rooms, coffee bar, and community membership.' },
          { name: 'Dedicated Desk', standard: '₹11,000/mo', founding: '₹8,999/mo', desc: 'Your own place to build from. Includes 24/7 dedicated desk, studio + growth engine, photoshoot, and member network.' },
          { name: 'Meeting Room', standard: '₹500/hr', founding: '₹399/hr', desc: 'Professional team meeting space. Interactive digital panel, high-speed connection, and host credentials.' },
          { name: 'Studio Hourly', standard: '₹1,500/hr', founding: '₹999/hr', desc: 'Professional audio/video podcast and content recording setup. High-grade gear, lighting, and audio backdrops.' },
        ],
      },
      // Legacy numeric fields kept for backwards compat
      hotDeskMonthly: { type: Number, default: 5999 },
      hotDeskQuarterly: { type: Number, default: 16497 },
      hotDeskAnnual: { type: Number, default: 59990 },
      dedicatedDeskMonthly: { type: Number, default: 8999 },
      dedicatedDeskQuarterly: { type: Number, default: 24747 },
      dedicatedDeskAnnual: { type: Number, default: 89990 },
    },

    // ─── SCARCITY ─────────────────────────────────────────────────────────────
    scarcity: {
      seatsRemainingText: { type: String, default: 'Only 27 of 50 founding seats left.' },
      deadlineDate: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
      totalSpots: { type: Number, default: 50 },
      remainingSpots: { type: Number, default: 27 },
      closingDate: { type: String, default: '30 September 2026' },
    },

    // ─── FAQ SECTION ──────────────────────────────────────────────────────────
    faqSection: {
      headline: { type: String, default: 'Before You Come In' },
      subheadline: { type: String, default: 'Everything you need to know about memberships, pricing, rules, and billing details.' },
    },

    // ─── FAQ ITEMS (array at top level) ───────────────────────────────────────
    faq: {
      type: [
        {
          question: { type: String, default: '' },
          answer: { type: String, default: '' },
          published: { type: Boolean, default: true },
          order: { type: Number, default: 0 },
        },
      ],
      default: [
        { question: 'Do I need to commit long-term?', answer: 'No. Month-to-month is available. Annual plans get 2 free months if you want to lock in the lowest rate.', published: true, order: 0 },
        { question: 'What happens after the 2-day free trial?', answer: 'Nothing automatic — no card is charged. If you love it, our team helps you pick the right plan.', published: true, order: 1 },
        { question: 'What if I want to cancel?', answer: "30 days' notice, no penalties, no hidden fees.", published: true, order: 2 },
        { question: 'Can I upgrade later?', answer: 'Yes, anytime — Founding Members get priority access.', published: true, order: 3 },
        { question: 'Is the Founding Member price really locked?', answer: 'Yes — for 12 months from the day you join, even as standard prices increase.', published: true, order: 4 },
        { question: 'Where exactly is Deven Co-Work located?', answer: 'VIP Estate, A1, VIP Colony, Shankar Nagar, Raipur, Chhattisgarh 492001 — right in the heart of Raipur, easily reachable from anywhere in the city.', published: true, order: 5 },
      ],
    },

    // ─── FINAL CTA / RESERVATION ──────────────────────────────────────────────
    finalCTA: {
      headline: { type: String, default: 'Your First Day Is Free. Come See Why Founders Are Switching.' },
      body: { type: String, default: "No card. No pressure. Just come work from Raipur's most premium coworking space for 2 full days, completely free." },
      primaryCtaLabel: { type: String, default: 'Book Your Free 2-Day Trial' },
      primaryCtaUrl: { type: String, default: '#reservation' },
    },

    // ─── RESERVATION SECTION TEXTS ────────────────────────────────────────────
    reservation: {
      step1Title: { type: String, default: 'Step 1: Choose Your founding desks on live map' },
      step2Title: { type: String, default: 'Step 2: Enter Contact details' },
      depositNote: { type: String, default: 'Deposit required: ₹1,000 per seat · Refundable · UPI-first Checkout' },
      whatsappMessage: { type: String, default: "Hi, I'd like to learn more about Deven Co-Work" },
      scarcityNote: { type: String, default: 'Only {remaining} founding desks left in Raipur founding batch. Capped at max 7 per company.' },
      
      // New customizable fields for refactored reservation flow
      reservationHeading: { type: String, default: 'LOCK IN YOUR FOUNDING MEMBER SEAT TODAY.' },
      reservationDescription: { type: String, default: 'Only 50 seats are available in the founding batch. Choose your next step below.' },
      scarcityText: { type: String, default: "FOUNDING BATCH\nLimited seats available" },
      totalFoundingSeats: { type: Number, default: 50 },
      joiningDate: { type: String, default: '15 September 2026' },
      trialButtonText: { type: String, default: 'GET 2 DAYS FREE TRIAL' },
      whatsappButtonText: { type: String, default: 'BOOK VIA WHATSAPP →' },
      reserveButtonText: { type: String, default: 'RESERVE MY SEAT →' },
      trialConfirmationTitle: { type: String, default: 'Your 2-Day Free Trial is Booked.' },
      trialConfirmationMessage: { type: String, default: 'Thanks for booking your free trial. Our team will call you shortly to confirm your visit and guide you through the next steps.' },
      paymentConfirmationTitle: { type: String, default: 'RESERVATION CONFIRMED' },
      paymentConfirmationMessage: { type: String, default: "You're officially in. Your founding member seat has been reserved successfully. Your invoice has been sent to your email." },
      whatsappNumber: { type: String, default: '+91 62605 82852' },
      reservationEmailSettings: { type: String, default: 'bookings@devencowork.com' }
    },

    // ─── FREE TRIAL LOGIC ─────────────────────────────────────────────────────
    freeTrial: {
      enabled: { type: Boolean, default: true },
      days: { type: [String], default: ['Friday', 'Saturday'] },
      duration: { type: String, default: '2 Days' },
      description: { type: String, default: 'Visit us Friday & Saturday and experience the space before you commit.' },
      startTime: { type: String, default: '09:00 AM' },
      endTime: { type: String, default: '09:00 PM' },
    },

    // ─── FOOTER ───────────────────────────────────────────────────────────────
    footer: {
      tagline: { type: String, default: "Raipur's Most Premium Coworking Space" },
      quickLinks: {
        type: [
          {
            label: { type: String, default: '' },
            href: { type: String, default: '#' },
          },
        ],
        default: [
          { label: 'Pricing', href: '#pricing' },
          { label: 'Contact', href: '#reservation' },
          { label: 'Instagram', href: 'https://instagram.com/' },
          { label: 'GMB', href: 'https://www.google.com/maps/' },
        ],
      },
      address: { type: String, default: 'VIP Estate, A1, VIP Colony, Shankar Nagar, Raipur, Chhattisgarh 492001' },
      phone: { type: String, default: '+91 62605 82852' },
      whatsapp: { type: String, default: '+91 62605 82852' },
      email: { type: String, default: 'bookings@devencowork.com' },
      copyright: { type: String, default: '' },
      ctaLabel: { type: String, default: '' },
      ctaUrl: { type: String, default: '' },
    },

    // ─── LOCATION ─────────────────────────────────────────────────────────────
    location: {
      mapEmbedSrc: { type: String, default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.5284307521743!2d81.6731683!3d21.2595151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28ddb73efa82a7%3A0xb99b968caba2d846!2sDeven+Co-Work%2C+VIP+Estate%2C+A1%2C+VIP+Colony%2C+Raipur%2C+Chhattisgarh+492001!5e0!3m2!1sen!2sin!4v1717800000000!5m2!1sen!2sin' },
      directionsUrl: { type: String, default: 'https://www.google.com/maps/dir/22.510398,82.552375/Deven+Co-Work,+VIP+Estate,+A1,+VIP+Colony,+Raipur,+Chhattisgarh+492001' },
      driveTimeText: { type: String, default: 'Located in the heart of Raipur, within 10-15 minutes drive of major commercial hubs and transport links.' },
      landmarks: { type: [String], default: ['5 mins from Marine Drive', '10 mins from Railway Station', 'Opposite central park'] },
    },

    // ─── SECTION ORDER & VISIBILITY ───────────────────────────────────────────
    sectionOrder: {
      type: [String],
      default: ['hero', 'calculator', 'problem', 'guide', 'plan', 'offerStack', 'valueStack', 'guarantee', 'socialProof', 'pricing', 'faq', 'finalCTA'],
    },
    sectionVisibility: {
      hero: { type: Boolean, default: true },
      calculator: { type: Boolean, default: true },
      problem: { type: Boolean, default: true },
      guide: { type: Boolean, default: true },
      plan: { type: Boolean, default: true },
      offerStack: { type: Boolean, default: true },
      valueStack: { type: Boolean, default: true },
      guarantee: { type: Boolean, default: true },
      socialProof: { type: Boolean, default: true },
      pricing: { type: Boolean, default: true },
      faq: { type: Boolean, default: true },
      finalCTA: { type: Boolean, default: true },
    },

    // Legacy fields kept for backwards compat
    trustBar: {
      credibilityLine: { type: String, default: '' },
      reframeHeadline: { type: String, default: '' },
      reframeBody: { type: String, default: '' },
    },
    whyReserve: {
      steps: { type: [mongoose.Schema.Types.Mixed], default: [] },
      points: { type: [String], default: [] },
    },
    spacePreview: {
      gallery: { type: [mongoose.Schema.Types.Mixed], default: [] },
    },
    differentiator: {
      headline: { type: String, default: '' },
      body: { type: String, default: '' },
      mediaUrl: { type: String, default: '' },
      mediaType: { type: String, default: 'video' },
    },
  },
  {
    timestamps: true,
  }
);

const Content = mongoose.model('Content', contentSchema);
export default Content;
