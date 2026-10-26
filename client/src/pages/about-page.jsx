import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import {
  Building2,
  Users,
  Compass,
  Target,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Tv,
  Mic,
  Briefcase,
  Layers,
  Calendar,
  ExternalLink
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

export default function AboutPage() {
  const [content, setContent] = useState(defaultContent);
  const [tourModalOpen, setTourModalOpen] = useState(false);

  useEffect(() => {
    document.title = "About Deven Co-Work — Raipur's Founder & Startup Workspace";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Learn about Deven Co-Work in Shankar Nagar, Raipur. Founded to provide ambitious founders, creators, and teams with world-class workspace infrastructure.");
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', "https://www.devencowork.com/about");
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
        .catch((err) => console.error('Failed to load CMS content for about page:', err));
    }
  }, []);

  const about = content?.about || defaultContent.about || {};
  const hero = about.hero || {};
  const story = about.story || {};
  const mission = about.mission || {};
  const vision = about.vision || {};
  const audiences = about.audiences?.items || [
    { title: 'Startup Founders', description: 'Early-stage and scaling founders building ambitious tech, service, and product businesses in Raipur.' },
    { title: 'Freelancers & Consultants', description: 'Independent professionals who need ultra-reliable internet, polished client meeting spaces, and professional credibility.' },
    { title: 'Remote Professionals', description: 'Distributed team members and remote engineers looking to escape home distractions for focused, high-energy work.' },
    { title: 'Small Teams', description: 'Teams of 2 to 7 people who require private cabins and meeting facilities without long-term commercial lease lock-ins.' },
    { title: 'Creators & Podcasters', description: 'Content creators, educators, and podcasters leveraging our sound-treated audio and video studio.' },
  ];

  const amenities = [
    {
      title: 'Workspaces & Memberships',
      desc: 'Ergonomic hot desks and dedicated desks with 500 Mbps fiber internet and power backup.',
      link: '/pricing',
      linkText: 'View Memberships',
      icon: Briefcase,
    },
    {
      title: 'Private Office Cabins',
      desc: 'Furnished lockable cabins for teams of 2–7 who require privacy without building maintenance.',
      link: '/private-cabins',
      linkText: 'Explore Cabins',
      icon: Building2,
    },
    {
      title: 'Team Meeting Room',
      desc: 'Seats 10–15 people equipped with an interactive digital panel and presentation whiteboard.',
      link: '/meeting-room',
      linkText: 'Book Meeting Room',
      icon: Tv,
    },
    {
      title: 'Content & Podcast Studio',
      desc: 'Acoustically treated podcast and media studio equipped with professional lighting and microphones.',
      link: '/podcast-studio',
      linkText: 'Explore Studio',
      icon: Mic,
    },
    {
      title: 'Founder & Community Events',
      desc: 'Bi-weekly workshops, AI sessions, founder AMA roundtables, and peer masterminds.',
      link: '/events',
      linkText: 'View Community Events',
      icon: Calendar,
    },
  ];

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
                <span>{hero.eyebrow || 'ABOUT DEVEN'}</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FCFAF9] leading-[1.1] mb-6">
                {hero.headline || 'A Space for People Building What\'s Next.'}
              </h1>
              <p className="text-base sm:text-lg text-[#FCFAF9]/75 leading-relaxed mb-8">
                {hero.subheadline || 'Raipur\'s premier coworking space and founder community in Shankar Nagar, built for focused work, meaningful collaboration, and ambitious teams.'}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setTourModalOpen(true)}
                  className="px-6 py-3.5 bg-[#04B8BB] text-black font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#039e9f] transition-colors shadow-lg shadow-[#04B8BB]/20"
                >
                  Book a Free Tour
                </button>
                <Link
                  href="/pricing"
                  className="px-6 py-3.5 border border-[rgba(252,250,249,0.2)] bg-[#141414] text-[#FCFAF9] font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#1f1f1f] hover:border-[#04B8BB] transition-colors"
                >
                  Explore Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* B. Our Story Section */}
        <section className="py-16 md:py-24 border-b border-[rgba(252,250,249,0.08)] bg-[#0F0F10]">
          <div className="container-wide">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="text-xs font-bold uppercase tracking-widest text-[#04B8BB]">
                  OUR JOURNEY & PHILOSOPHY
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FCFAF9] leading-tight">
                  {story.heading || 'Why We Built Deven Co-Work in Raipur'}
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-[#FCFAF9]/75 leading-relaxed">
                  {(story.paragraphs && story.paragraphs.length > 0 ? story.paragraphs : [
                    'Deven Co-Work was established to solve a pressing challenge for founders and professionals in Raipur: finding a workspace that balances enterprise-grade infrastructure with genuine community.',
                    'Working from home or noisy cafés often leads to distraction and isolation. Renting a traditional office in Raipur comes with long commercial leases, expensive fit-outs, and ongoing facility management headaches.',
                    'We built Deven Co-Work to give professionals and startups a complete operating system: private cabins, dedicated desks, team meeting rooms with digital boards, a high-fidelity podcast studio, and 500 Mbps fiber internet — all anchored by active founder meetups, workshops, and peer collaboration.'
                  ]).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative rounded-2xl overflow-hidden border border-[rgba(252,250,249,0.12)] bg-[#151517] shadow-2xl">
                  <img
                    src={story.image || 'https://res.cloudinary.com/cyxow5rb/image/upload/v1787305622/deven_cowork/y6mbwgpiltsde9n3cvhr.webp'}
                    alt="Deven Co-Work Workspace in Raipur"
                    className="w-full aspect-[4/3] object-cover"
                    loading="lazy"
                  />
                  <div className="p-6 bg-[#151517]">
                    <div className="flex items-center gap-3 text-xs text-[#04B8BB] font-semibold uppercase tracking-wider mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Shankar Nagar, Raipur</span>
                    </div>
                    <p className="text-xs text-[#FCFAF9]/60">
                      500 Mbps fiber internet, private cabins, meeting room with digital board, and podcast studio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* C. Mission and Vision Section */}
        <section className="py-16 md:py-20 border-b border-[rgba(252,250,249,0.08)]">
          <div className="container-wide">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mission Card */}
              <div className="p-8 sm:p-10 rounded-2xl border border-[rgba(252,250,249,0.1)] bg-[#121213] relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-[#04B8BB]/10 text-[#04B8BB] flex items-center justify-center mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#FCFAF9] mb-4">
                  {mission.heading || 'Our Mission'}
                </h3>
                <p className="text-sm sm:text-base text-[#FCFAF9]/75 leading-relaxed">
                  {mission.text || 'To empower Raipur\'s entrepreneurs, creators, and professionals with premium workspace infrastructure, productive environments, and an active community that accelerates business growth.'}
                </p>
              </div>

              {/* Vision Card */}
              <div className="p-8 sm:p-10 rounded-2xl border border-[rgba(252,250,249,0.1)] bg-[#121213] relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-[#04B8BB]/10 text-[#04B8BB] flex items-center justify-center mb-6">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#FCFAF9] mb-4">
                  {vision.heading || 'Our Vision'}
                </h3>
                <p className="text-sm sm:text-base text-[#FCFAF9]/75 leading-relaxed">
                  {vision.text || 'To establish Raipur as a leading hub of innovation and modern enterprise in Central India, connecting ambitious founders who build enduring companies.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* D. Who It's For Section */}
        <section className="py-16 md:py-24 border-b border-[rgba(252,250,249,0.08)] bg-[#0F0F10]">
          <div className="container-wide">
            <div className="max-w-2xl mb-12">
              <span className="text-[#04B8BB] text-xs font-bold uppercase tracking-wider mb-2 block">
                AUDIENCE & MEMBERSHIP
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FCFAF9]">
                Who Deven Co-Work Is For
              </h2>
              <p className="text-sm sm:text-base text-[#FCFAF9]/65 mt-2">
                We intentionally cultivate a high-standard community of builders, founders, and professionals in Raipur.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {audiences.map((aud, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border border-[rgba(252,250,249,0.08)] bg-[#141416] hover:border-[#04B8BB]/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#04B8BB]/10 text-[#04B8BB] flex items-center justify-center mb-4 text-xs font-bold">
                    0{index + 1}
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#FCFAF9] mb-2">
                    {aud.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#FCFAF9]/65 leading-relaxed">
                    {aud.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* E. The Deven Experience (Dedicated Services & Facilities) */}
        <section className="py-16 md:py-24 border-b border-[rgba(252,250,249,0.08)]">
          <div className="container-wide">
            <div className="max-w-2xl mb-12">
              <span className="text-[#04B8BB] text-xs font-bold uppercase tracking-wider mb-2 block">
                FACILITIES & AMENITIES
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FCFAF9]">
                The Deven Experience
              </h2>
              <p className="text-sm sm:text-base text-[#FCFAF9]/65 mt-2">
                Every space and service is designed from the ground up for productivity and founder focus.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {amenities.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="p-6 rounded-xl border border-[rgba(252,250,249,0.08)] bg-[#121213] flex flex-col justify-between hover:border-[#04B8BB]/50 transition-colors group"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-[#04B8BB]/10 text-[#04B8BB] flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-[#FCFAF9] mb-2 group-hover:text-[#04B8BB] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#FCFAF9]/65 leading-relaxed mb-6">
                        {item.desc}
                      </p>
                    </div>

                    <Link
                      href={item.link}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#04B8BB] hover:underline"
                    >
                      <span>{item.linkText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* F. Verified Location Section */}
        <section className="py-16 md:py-20 border-b border-[rgba(252,250,249,0.08)] bg-[#0F0F10]">
          <div className="container-wide">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5 space-y-6">
                <span className="text-[#04B8BB] text-xs font-bold uppercase tracking-wider block">
                  VISIT OUR SPACE
                </span>
                <h2 className="font-display text-3xl font-bold text-[#FCFAF9]">
                  Centrally Located in Raipur
                </h2>
                <div className="space-y-4 text-sm text-[#FCFAF9]/75">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#04B8BB] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-medium">Verified Address</strong>
                      <p className="text-xs sm:text-sm text-[#FCFAF9]/65 mt-0.5">
                        VIP Estate, A1, VIP Colony, Shankar Nagar, Raipur, Chhattisgarh 492001
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#04B8BB] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-medium">Access Hours</strong>
                      <p className="text-xs sm:text-sm text-[#FCFAF9]/65 mt-0.5">
                        Monday to Saturday: 9:00 AM – 9:00 PM
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=Deven+Co-Work,+VIP+Estate,+A1,+VIP+Colony,+Raipur,+Chhattisgarh+492001"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 border border-[#04B8BB] text-[#04B8BB] hover:bg-[#04B8BB] hover:text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
                  >
                    <span>Get Directions on Google Maps</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Map Embed */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-[rgba(252,250,249,0.12)] overflow-hidden h-[340px] bg-[#0A0A0A]">
                  <iframe
                    title="Deven Co-Work Google Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.5284307521743!2d81.6731683!3d21.2595151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28ddb73efa82a7%3A0xb99b968caba2d846!2sDeven+Co-Work%2C+VIP+Estate%2C+A1%2C+VIP+Colony%2C+Raipur%2C+Chhattisgarh+492001!5e0!3m2!1sen!2sin!4v1717800000000!5m2!1sen!2sin"
                    className="w-full h-full border-0"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* G. Final CTA */}
        <section className="py-16 md:py-24 border-t border-[rgba(252,250,249,0.08)] bg-gradient-to-b from-[#0F0F10] to-[#0C0C0C]">
          <div className="container-wide text-center max-w-3xl mx-auto">
            <span className="text-[#04B8BB] text-xs font-bold uppercase tracking-wider mb-3 block">
              EXPERIENCE THE DIFFERENCE
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FCFAF9] tracking-tight mb-4">
              Find Your Space at Deven
            </h2>
            <p className="text-sm sm:text-base text-[#FCFAF9]/70 leading-relaxed mb-8 max-w-xl mx-auto">
              Ready to upgrade from noisy cafés or isolated home offices? Book a guided walkthrough and claim your complimentary 2-day trial pass.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/pricing"
                className="px-6 py-3.5 bg-[#04B8BB] text-black font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#039e9f] transition-colors shadow-lg shadow-[#04B8BB]/20"
              >
                View Plans & Pricing
              </Link>
              <button
                onClick={() => setTourModalOpen(true)}
                className="px-6 py-3.5 border border-[rgba(252,250,249,0.2)] bg-[#18181A] text-[#FCFAF9] font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#202022] hover:border-[#04B8BB] transition-colors"
              >
                Book Guided Tour
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer footer={content?.footer} globalSettings={content?.globalSettings} cmsLoaded={true} cmsFailed={false} />
      <WhatsAppFloat whatsapp={content?.footer?.whatsapp || content?.globalSettings?.whatsapp} message="Hi! I'd like to book a tour of Deven Co-Work" cmsLoaded={true} cmsFailed={false} />
      <TourBookingModal isOpen={tourModalOpen} onClose={() => setTourModalOpen(false)} />
    </div>
  );
}
