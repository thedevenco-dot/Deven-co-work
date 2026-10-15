import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import {
  Header,
  Footer,
  Pricing,
  defaultContent,
  getInitialCmsData,
  mergeContent
} from '@/App';
import TourBookingModal from '@/components/TourBookingModal';
import { api } from '@/services/api';
import { SITE, PAGES } from '@/content/pages';

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
  }, []);

  if (!page) return null;

  const handleOpenTour = () => setTourModalOpen(true);

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
        {/* Hero block */}
        <section className="relative pt-16 pb-16 sm:pt-24 sm:pb-24 border-b border-[rgba(252,250,249,0.12)]">
          <div className="container-wide max-w-4xl">
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
                className="button button-outline"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Content sections */}
        {page.sections?.map((sec, idx) => (
          <section key={idx} className="py-14 sm:py-20 border-b border-[rgba(252,250,249,0.12)]">
            <div className="container-wide max-w-4xl">
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

        {/* FAQ block */}
        {page.faqs && page.faqs.length > 0 && (
          <section className="py-16 sm:py-24 border-b border-[rgba(252,250,249,0.12)]">
            <div className="container-wide max-w-4xl">
              <div className="section-label mb-4 text-[#04B8BB] font-black">QUESTIONS & ANSWERS</div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#FCFAF9] uppercase tracking-tight mb-10">
                Frequently Asked Questions
              </h2>
              <div className="border-t border-[rgba(252,250,249,0.16)] divide-y divide-[rgba(252,250,249,0.16)]">
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
            </div>
          </section>
        )}

        {/* Call to action block */}
        <section className="py-16 sm:py-24 border-b border-[rgba(252,250,249,0.12)] bg-[#024E5C]/30">
          <div className="container-wide max-w-4xl text-center">
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
                className="button button-outline"
              >
                WhatsApp Us
              </a>
              <a
                href={`tel:${SITE.phoneTel}`}
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
        </section>

        {/* Related pages */}
        {page.related && page.related.length > 0 && (
          <section className="py-14 sm:py-20 border-b border-[rgba(252,250,249,0.12)]">
            <div className="container-wide max-w-4xl">
              <div className="section-label mb-4 text-[#04B8BB] font-black">EXPLORE MORE</div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#FCFAF9] uppercase tracking-tight mb-8">
                Related Pages
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
