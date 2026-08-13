import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Play,
  Send,
  Users,
  X,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
const WHATSAPP = 'https://wa.me/917000000000?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20Deven%20Cowork.';
const PHONE = 'tel:+917000000000';
const EMAIL = 'mailto:hello@devencowork.com';

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  variant?: 'primary' | 'outline' | 'text';
  testId?: string;
};

function Button({ children, onClick, href, className = '', variant = 'primary', testId }: ButtonProps) {
  const classes = `button button-${variant} ${className}`;
  const content = <>{children}<ArrowUpRight size={16} strokeWidth={1.8} /></>;
  if (href) {
    return <a href={href} className={classes} data-testid={testId}>{content}</a>;
  }
  return <button type="button" onClick={onClick} className={classes} data-testid={testId}>{content}</button>;
}

function Logo({ light = true }: { light?: boolean }) {
  return (
    <Link href="/" className={`logo ${light ? 'text-[#f1f1f1]' : 'text-black'}`} data-testid="link-logo">
      <span className="logo-mark" aria-hidden="true"><span /><span /></span>
      <span className="font-display text-[18px] font-semibold tracking-[-.05em]">DEVEN</span>
      <span className="mt-[2px] text-[9px] font-semibold tracking-[.18em] opacity-60">COWORK</span>
    </Link>
  );
}

function SectionLabel({ number, children, light = false }: { number: string; children: ReactNode; light?: boolean }) {
  return <div className={`eyebrow flex items-center gap-3 ${light ? 'text-[#000]' : ''}`}><span className="text-[#f8bc06]">{number}</span><span className={light ? 'text-black/60' : ''}>{children}</span></div>;
}

function ImagePlaceholder({ label, className = '', caption }: { label: string; className?: string; caption?: string }) {
  return (
    <div className={`image-slot relative overflow-hidden ${className}`} data-testid={`image-placeholder-${label.toLowerCase().replaceAll(' ', '-')}`}>
      <div className="absolute inset-0 opacity-70">
        <div className="absolute left-[12%] top-[18%] h-[55%] w-[35%] border border-[#f8bc06]/35" />
        <div className="absolute bottom-[12%] right-[10%] h-[42%] w-[42%] border border-white/15" />
        <div className="absolute left-[20%] top-[43%] h-px w-[62%] bg-white/20" />
        <div className="absolute left-[52%] top-[18%] h-[58%] w-px bg-white/15" />
      </div>
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-[#a3a3a3]">
        <span className="h-1.5 w-1.5 bg-[#f8bc06]" /> {label}
      </div>
      {caption && <span className="absolute right-4 top-4 max-w-[145px] text-right text-[10px] uppercase leading-[1.5] tracking-[.12em] text-white/45">{caption}</span>}
    </div>
  );
}

function Navbar({ onTour }: { onTour: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handle, { passive: true });
    handle();
    return () => window.removeEventListener('scroll', handle);
  }, []);
  const links = [
    ['/plans', 'Plans'], ['/teams', 'Teams'], ['/studio', 'Studio'], ['/gallery', 'Gallery'], ['/about', 'About'],
  ];
  return (
    <header className={`fixed left-0 top-0 z-40 w-full transition-colors duration-300 ${scrolled || open ? 'bg-black/95 backdrop-blur-sm' : 'bg-transparent'}`}>
      <div className="container-wide flex h-[76px] items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {links.map(([href, label]) => <Link key={href} href={href} className={`nav-link ${location === href ? 'nav-active' : ''}`} data-testid={`link-nav-${label.toLowerCase()}`}>{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <a href={PHONE} className="nav-phone" data-testid="link-nav-call"><Phone size={14} /> Call</a>
          <button className="button button-primary button-small" type="button" onClick={onTour} data-testid="button-nav-tour">Book a Free Tour <ArrowUpRight size={15} /></button>
        </div>
        <button type="button" className="flex h-11 w-11 items-center justify-center border border-white/15 text-white md:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} data-testid="button-mobile-menu">
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-black px-5 pb-7 pt-5 md:hidden">
          <nav className="flex flex-col" aria-label="Mobile navigation">
            {[...links, ['/contact', 'Contact']].map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="border-b border-white/10 py-4 font-display text-xl text-white" data-testid={`link-mobile-${label.toLowerCase()}`}>{label}<ArrowUpRight className="float-right text-[#f8bc06]" size={18} /></Link>)}
            <button className="button button-primary mt-5 w-full justify-between" type="button" onClick={() => { setOpen(false); onTour(); }} data-testid="button-mobile-tour">Book a Free Tour <ArrowUpRight size={16} /></button>
          </nav>
        </div>
      )}
    </header>
  );
}

function TourModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', seats: '', day: '' });
  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setLoading(false);
      setError('');
      setForm({ name: '', phone: '', seats: '', day: '' });
    }
  }, [open]);
  if (!open) return null;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name || !form.phone || !form.seats || !form.day) {
      setError('Please complete all four fields so we can prepare for your visit.');
      return;
    }
    setError('');
    setLoading(true);
    window.setTimeout(() => { setLoading(false); setSubmitted(true); }, 650);
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="tour-modal-title" data-testid="modal-tour">
      <div className="relative w-full max-w-[560px] border border-white/15 bg-[#151515] p-6 sm:p-10">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center text-[#a3a3a3] hover:text-white" aria-label="Close tour booking" data-testid="button-close-tour"><X size={20} /></button>
        {!submitted ? (
          <>
            <SectionLabel number="VISIT" >BOOK YOUR TOUR</SectionLabel>
            <h2 id="tour-modal-title" className="mt-5 max-w-[420px] font-display text-3xl leading-[1.12] tracking-[-.04em] text-white sm:text-4xl">See where your next chapter could happen.</h2>
            <p className="mt-4 max-w-[410px] text-sm leading-6 text-[#a3a3a3]">Four quick details. We will confirm a time for your visit to City Centre, Raipur.</p>
            <form onSubmit={submit} className="mt-8 space-y-4">
              <label className="field-label">Name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" data-testid="input-tour-name" /></label>
              <label className="field-label">Phone<input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 00000 00000" data-testid="input-tour-phone" /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field-label">Seats required<select required value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} data-testid="select-tour-seats"><option value="">Select</option><option>1 seat</option><option>2–5 seats</option><option>6–10 seats</option><option>10+ seats</option></select></label>
                <label className="field-label">Preferred day<input required type="date" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} data-testid="input-tour-day" /></label>
              </div>
              {error && <p className="text-sm text-[#ffb4a8]" role="alert" data-testid="status-tour-error">{error}</p>}
              <button type="submit" className="button button-primary mt-2 w-full justify-between" disabled={loading} data-testid="button-submit-tour">{loading ? 'Sending request…' : 'Request a free tour'}<Send size={16} /></button>
              <p className="text-center text-[11px] leading-5 text-[#686868]">No payment required. Your information is only used to arrange this visit.</p>
            </form>
          </>
        ) : (
          <div className="py-12 text-center" data-testid="status-tour-success">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#f8bc06] text-[#f8bc06]"><Check size={25} /></div>
            <h2 className="mt-6 font-display text-3xl tracking-[-.04em] text-white">Tour request received.</h2>
            <p className="mx-auto mt-4 max-w-[350px] text-sm leading-6 text-[#a3a3a3]">Thank you, {form.name}. A Deven team member will confirm your preferred day shortly.</p>
            <button type="button" className="button button-outline mt-8" onClick={onClose} data-testid="button-close-success">Back to Deven <ArrowRight size={15} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function Hero({ onTour }: { onTour: () => void }) {
  return (
    <section className="relative isolate min-h-[720px] overflow-hidden border-b border-white/10 pt-[76px] md:min-h-[820px]">
      <div className="absolute inset-0 line-grid opacity-30" />
      <div className="absolute -right-[12%] top-[13%] h-[580px] w-[64%] max-w-[850px] border border-white/15 md:top-[18%]">
        <div className="absolute inset-[12px] border border-[#f8bc06]/35" />
        <div className="absolute inset-0 bg-[#141414]" />
        <ImagePlaceholder label="ADD WORKSPACE IMAGE" className="absolute inset-[13px]" caption="Hero image slot / replace with Deven photography" />
        <div className="absolute -left-5 top-8 h-16 w-1 bg-[#f8bc06]" />
      </div>
      <div className="container-wide relative z-10 flex min-h-[644px] flex-col justify-center pb-16 pt-20 md:min-h-[744px] md:pb-28">
        <div className="max-w-[710px]">
          <div className="reveal eyebrow flex items-center gap-3 text-[#f8bc06]"><span className="h-px w-8 bg-[#f8bc06]" /> BUSINESS CLUB / CITY CENTRE, RAIPUR</div>
          <h1 className="reveal reveal-delay-1 mt-6 max-w-[700px] font-display text-[clamp(2.8rem,8vw,6.7rem)] font-medium leading-[.98] tracking-[-.075em] text-[#f1f1f1]">A workspace built for <span className="text-[#f8bc06]">people building something.</span></h1>
          <p className="reveal reveal-delay-2 mt-7 max-w-[500px] text-[16px] leading-7 text-[#b7b7b7] md:text-[18px]">Coworking, dedicated desks, private cabins and a professional studio — brought together for founders, independent professionals and growing teams in Raipur.</p>
          <div className="reveal reveal-delay-3 mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button onClick={onTour} testId="button-hero-tour">Book a Free Tour</Button>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="text-link" data-testid="link-hero-whatsapp"><MessageCircle size={17} /> WhatsApp us</a>
          </div>
        </div>
        <div className="mt-auto grid max-w-[730px] grid-cols-2 border-t border-white/20 pt-5 sm:grid-cols-4">
          {['60 seats', '7-day trial', '24/7 access', 'City Centre, Raipur'].map((item, i) => <div key={item} className={`pr-3 ${i > 1 ? 'mt-5 sm:mt-0' : ''}`}><p className="font-display text-[15px] text-white">{item}</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-[#6c6c6c]">{i === 3 ? 'location' : 'workspace detail'}</p></div>)}
        </div>
      </div>
      <div className="absolute bottom-7 right-8 hidden items-center gap-3 text-[10px] uppercase tracking-[.16em] text-[#777] lg:flex"><ArrowDownRight size={16} className="text-[#f8bc06]" /> Scroll to explore</div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="border-b border-white/10 bg-[#111] py-10">
      <div className="container-wide flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div><p className="eyebrow">Proof, not promises</p><p className="mt-3 text-sm text-[#8c8c8c]">Real member stories and ratings will live here as they are approved.</p></div>
        <div className="grid grid-cols-3 gap-8 text-left md:gap-16">
          <div><p className="font-display text-2xl text-white">[ADD]</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-[#777]">Google rating</p></div>
          <div><p className="font-display text-2xl text-white">[ADD]</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-[#777]">member stories</p></div>
          <div><p className="font-display text-2xl text-[#f8bc06]">Raipur</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-[#777]">on the ground</p></div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const problems = ['The kitchen table became your office.', 'Every client meeting needs an apology.', 'Your business has outgrown your spare room.', 'The day ends, but work never really does.'];
  return (
    <section className="container-wide py-24 md:py-36" id="why-deven">
      <div className="grid gap-12 md:grid-cols-[.75fr_1.25fr] md:gap-24">
        <div><SectionLabel number="01">THE REFRAME</SectionLabel><p className="mt-8 max-w-[220px] text-sm leading-6 text-[#777]">The right environment does more than hold your laptop. It changes how the work feels — and how the work is seen.</p></div>
        <div><h2 className="max-w-[750px] font-display text-[clamp(2.2rem,5vw,4.6rem)] leading-[1.04] tracking-[-.07em] text-white">You do better work when your space takes the work seriously.</h2><div className="mt-12 border-t border-white/15">{problems.map((problem, i) => <div className="flex items-center gap-5 border-b border-white/15 py-5" key={problem}><span className="font-mono text-xs text-[#f8bc06]">0{i + 1}</span><p className="text-[17px] text-[#d4d4d4]">{problem}</p></div>)}</div></div>
      </div>
    </section>
  );
}

function ReframeSection() {
  return (
    <section className="bg-[#f8bc06] py-20 text-black md:py-28">
      <div className="container-wide">
        <SectionLabel number="02" light>THE DIFFERENCE</SectionLabel>
        <div className="mt-10 grid items-end gap-12 md:grid-cols-[1.25fr_.75fr]">
          <h2 className="max-w-[800px] font-display text-[clamp(2.8rem,7vw,6.8rem)] leading-[.91] tracking-[-.08em]">This isn't just a coworking space.</h2>
          <div className="border-l border-black/25 pl-6 text-[15px] leading-7 text-black/70">It is one considered place to focus, meet, make and move your business forward. <span className="font-semibold text-black">Workspace + Studio + Growth.</span></div>
        </div>
        <div className="mt-16 grid grid-cols-3 border-t border-black/25 pt-5">
          {['WORKSPACE', 'STUDIO', 'GROWTH'].map((word, i) => <div key={word} className="border-r border-black/20 pr-4 last:border-0"><p className="font-mono text-[11px] text-black/60">0{i + 1}</p><p className="mt-3 font-display text-lg tracking-[-.04em] md:text-2xl">{word}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function SpaceShowcase() {
  const spaces = [{ title: 'Main workspace', label: 'ADD MAIN WORKSPACE IMAGE', span: 'md:col-span-7 md:row-span-2' }, { title: 'Private cabins', label: 'ADD PRIVATE CABIN IMAGE', span: 'md:col-span-5' }, { title: 'Meeting rooms', label: 'ADD MEETING ROOM IMAGE', span: 'md:col-span-5' }, { title: 'Content studio', label: 'ADD STUDIO IMAGE', span: 'md:col-span-4' }, { title: 'Coffee area', label: 'ADD COFFEE AREA IMAGE', span: 'md:col-span-3' }, { title: 'Reception', label: 'ADD RECEPTION IMAGE', span: 'md:col-span-5' }];
  return (
    <section id="space" className="container-wide py-24 md:py-36">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><SectionLabel number="03">THE SPACE</SectionLabel><h2 className="mt-6 max-w-[600px] font-display text-[clamp(2.3rem,5vw,4.5rem)] leading-[1.02] tracking-[-.07em] text-white">A place with room for the work to get bigger.</h2></div><Link href="/gallery" className="text-link" data-testid="link-space-gallery">See the gallery <ArrowRight size={16} /></Link></div>
      <div className="mt-14 grid auto-rows-[190px] grid-cols-1 gap-3 md:auto-rows-[230px] md:grid-cols-12">
        {spaces.map(space => <div key={space.title} className={`${space.span} group relative`}><ImagePlaceholder label={space.label} className="h-full w-full transition-transform duration-500 group-hover:scale-[.99]" /><div className="absolute bottom-4 left-4 font-display text-sm text-white">{space.title}</div></div>)}
      </div>
    </section>
  );
}

function OfferSection() {
  const benefits = ['Dedicated workspace', 'High-speed internet', 'Meeting room access', 'Coffee, always close', 'Content studio access', 'Professional content support', 'Growth sessions', 'Business address where applicable'];
  return (
    <section className="border-y border-white/10 bg-[#111] py-24 md:py-32">
      <div className="container-wide grid gap-14 md:grid-cols-[.9fr_1.1fr] md:gap-24">
        <div><SectionLabel number="04">THE OFFER</SectionLabel><h2 className="mt-7 max-w-[480px] font-display text-[clamp(2.3rem,5vw,4.5rem)] leading-[1.02] tracking-[-.07em] text-white">Your desk comes with more than a desk.</h2><p className="mt-7 max-w-[390px] text-[16px] leading-7 text-[#8c8c8c]">The essentials are handled, so your attention can stay on the work that only you can do.</p></div>
        <div className="border-t border-white/20">{benefits.map((benefit, i) => <div key={benefit} className="flex items-center justify-between border-b border-white/15 py-4"><span className="font-mono text-xs text-[#f8bc06]">0{i + 1}</span><p className="mr-auto pl-5 text-[15px] text-[#ddd]">{benefit}</p><Check size={16} className="text-[#f8bc06]" /></div>)}</div>
      </div>
    </section>
  );
}

function StudioSection() {
  return (
    <section id="studio" className="container-wide py-24 md:py-36">
      <div className="grid items-center gap-12 md:grid-cols-[1.1fr_.9fr] md:gap-20">
        <div className="relative"><ImagePlaceholder label="ADD STUDIO IMAGE" className="aspect-[4/3] w-full" caption="A professional content studio, not a borrowed corner" /><div className="absolute -bottom-6 -right-3 flex h-24 w-24 items-center justify-center bg-[#f8bc06] text-black md:-right-8 md:h-32 md:w-32"><Play size={22} fill="currentColor" /></div></div>
        <div><SectionLabel number="05">THE STUDIO</SectionLabel><h2 className="mt-7 font-display text-[clamp(2.3rem,5vw,4.4rem)] leading-[1.02] tracking-[-.07em] text-white">Your workspace should help your business get seen.</h2><p className="mt-7 text-[16px] leading-7 text-[#999]">Make the reel. Record the idea. Photograph the product. Deven includes a professional content studio in the same ecosystem as your desk — because good businesses deserve to look the part.</p><Link href="/studio" className="text-link mt-8 inline-flex" data-testid="link-studio-details">Explore the studio <ArrowRight size={16} /></Link></div>
      </div>
    </section>
  );
}

type Billing = 'monthly' | 'quarterly' | 'annual';
function PricingSection({ onTour }: { onTour: () => void }) {
  const [billing, setBilling] = useState<Billing>('monthly');
  const plans = [{ name: 'Hot Desk', desc: 'Flexible access for focused days.', meta: 'For independent professionals', features: ['Shared workspace', 'High-speed internet', 'Meeting room access'] }, { name: 'Dedicated Desk', desc: 'Your own place to build from.', meta: 'For consistent momentum', features: ['Dedicated workspace', 'Member community', 'Studio access where applicable'], recommended: true }, { name: 'Private Cabin', desc: 'A quieter room for your team.', meta: 'For growing teams', features: ['Private workspace', 'Team-ready setup', 'Meeting room access'] }];
  return (
    <section id="plans" className="bg-[#f1f1f1] py-24 text-black md:py-32">
      <div className="container-wide"><div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"><div><SectionLabel number="06" light>PLANS</SectionLabel><h2 className="mt-6 max-w-[650px] font-display text-[clamp(2.4rem,5vw,4.6rem)] leading-[1] tracking-[-.07em]">Choose the room your work needs.</h2></div><div className="flex self-start border border-black/20 p-1 md:self-auto" role="group" aria-label="Billing period">{(['monthly', 'quarterly', 'annual'] as Billing[]).map(option => <button key={option} type="button" onClick={() => setBilling(option)} className={`min-h-10 px-3 text-[11px] font-semibold uppercase tracking-[.08em] transition-colors ${billing === option ? 'bg-black text-[#f8bc06]' : 'text-black/55 hover:text-black'}`} data-testid={`button-billing-${option}`}>{option}</button>)}</div></div><p className="mt-6 text-sm text-black/55">Pricing is being finalized. Approved rates will be published here before launch.</p>
        <div className="mt-12 grid gap-3 md:grid-cols-3">{plans.map(plan => <article key={plan.name} className={`relative flex min-h-[440px] flex-col border p-6 md:p-7 ${plan.recommended ? 'border-black bg-black text-white' : 'border-black/20 bg-transparent'}`} data-testid={`card-plan-${plan.name.toLowerCase().replaceAll(' ', '-')}`}>{plan.recommended && <span className="absolute right-5 top-5 bg-[#f8bc06] px-2 py-1 text-[9px] font-bold uppercase tracking-[.13em] text-black">Recommended</span>}<p className={`eyebrow ${plan.recommended ? 'text-[#f8bc06]' : 'text-black/45'}`}>{plan.meta}</p><h3 className="mt-8 font-display text-3xl tracking-[-.06em]">{plan.name}</h3><p className={`mt-3 max-w-[220px] text-sm leading-6 ${plan.recommended ? 'text-[#aaa]' : 'text-black/60'}`}>{plan.desc}</p><div className="mt-9 border-y border-current/15 py-5"><p className={`font-display text-2xl tracking-[-.05em] ${plan.recommended ? 'text-[#f8bc06]' : ''}`}>[ADD APPROVED PRICE]</p><p className={`mt-1 text-[10px] uppercase tracking-[.13em] ${plan.recommended ? 'text-[#777]' : 'text-black/45'}`}>per {billing} / final rate pending</p></div><ul className="mt-6 space-y-3">{plan.features.map(feature => <li key={feature} className="flex gap-2 text-sm"><Check size={15} className={plan.recommended ? 'text-[#f8bc06]' : 'text-black'} />{feature}</li>)}</ul><button type="button" onClick={onTour} className={`mt-auto flex min-h-11 items-center justify-between border-b pb-2 pt-8 text-sm font-semibold ${plan.recommended ? 'border-[#f8bc06] text-[#f8bc06]' : 'border-black/30'}`} data-testid={`button-plan-tour-${plan.name.toLowerCase().replaceAll(' ', '-')}`}>Talk through this plan <ArrowUpRight size={16} /></button></article>)}</div>
        <p className="mt-6 text-xs text-black/55">Rates, inclusions and trial terms shown here will be replaced with approved business information.</p>
      </div>
    </section>
  );
}

function TeamsSection() {
  return (
    <section id="teams" className="container-wide py-24 md:py-32"><div className="border border-white/15 p-6 md:p-12"><div className="grid gap-12 md:grid-cols-[1.2fr_.8fr] md:gap-20"><div><SectionLabel number="07">TEAMS & CABINS</SectionLabel><h2 className="mt-7 max-w-[650px] font-display text-[clamp(2.4rem,5vw,4.8rem)] leading-[.99] tracking-[-.07em] text-white">Building a team in Raipur?</h2><p className="mt-6 max-w-[490px] text-[16px] leading-7 text-[#999]">Private, operationally ready space for teams that need more than a few extra desks. Tell us what you are building and we will map the right setup.</p><Link href="/teams" className="button button-outline mt-8 inline-flex" data-testid="link-teams-explore">Explore team spaces <ArrowUpRight size={16} /></Link></div><div className="grid grid-cols-2 border-l border-white/15 pl-6 md:pl-10">{['10–20 seat teams', 'Corporate teams', 'Consulting teams', 'Regional offices'].map((item, i) => <div key={item} className="border-b border-white/15 py-5 first:pt-0"><Users size={16} className="mb-3 text-[#f8bc06]" /><p className="text-sm text-[#ddd]">{item}</p><p className="mt-1 font-mono text-[10px] text-[#666]">0{i + 1}</p></div>)}</div></div></div></section>
  );
}

function TestimonialSection() {
  return (
    <section className="border-y border-white/10 bg-[#111] py-24 md:py-32"><div className="container-wide"><div className="grid gap-12 md:grid-cols-[.6fr_1.4fr] md:gap-24"><div><SectionLabel number="08">THE COMMUNITY</SectionLabel><p className="mt-7 text-sm leading-6 text-[#777]">The people who make this place matter. Member stories will be added once approved.</p></div><div><blockquote className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.1] tracking-[-.06em] text-white">“[ADD TESTIMONIAL — replace with a real member story.]”</blockquote><div className="mt-8 flex items-center gap-4 border-t border-white/15 pt-5"><div className="flex h-11 w-11 items-center justify-center border border-[#f8bc06] font-display text-sm text-[#f8bc06]">DS</div><div><p className="text-sm text-[#ddd]">[ADD MEMBER NAME]</p><p className="mt-1 text-xs text-[#777]">[ADD ROLE / COMPANY]</p></div></div></div></div></div></section>
  );
}

function TrialSection({ onTour }: { onTour: () => void }) {
  return (
    <section className="relative overflow-hidden bg-[#f8bc06] py-24 text-black md:py-32"><div className="absolute -right-12 -top-20 font-display text-[18rem] leading-none tracking-[-.15em] text-black/[.05]">07</div><div className="container-wide relative"><SectionLabel number="09" light>LOW-RISK START</SectionLabel><div className="mt-9 grid items-end gap-10 md:grid-cols-[1.2fr_.8fr]"><div><h2 className="max-w-[700px] font-display text-[clamp(3rem,7vw,6.8rem)] leading-[.91] tracking-[-.08em]">Try it for 7 days.</h2><p className="mt-7 max-w-[460px] text-[16px] leading-7 text-black/70">A proper tour first. Then, if the approved trial policy is right for you, a chance to feel the difference in your own working rhythm.</p></div><div className="border-l border-black/25 pl-6 text-sm leading-6 text-black/70">Trial terms and eligibility will be updated with the approved policy.<button type="button" className="mt-6 flex items-center gap-2 border-b border-black pb-2 font-semibold text-black" onClick={onTour} data-testid="button-trial-tour">Book a Free Tour <ArrowUpRight size={16} /></button></div></div></div></section>
  );
}

const faqs = [
  ['Is there a lock-in?', 'Membership terms will be confirmed with the approved plan. Ask us during your tour and we will walk through the options clearly.'],
  ['Can clients visit?', 'Yes, visitor policy and meeting access are part of the membership conversation. We will confirm the applicable details for your plan.'],
  ['Can I use the business address?', 'Business address availability depends on the selected service and applicable requirements. Contact us for the current, approved terms.'],
  ['What happens during a power outage?', 'Infrastructure and backup details will be published once the operating specifications are finalized.'],
  ['What is included?', 'Each plan includes a different combination of workspace access and shared services. See the plans above, or book a tour for a precise walkthrough.'],
  ['What are the working hours?', 'Access hours vary by membership. Confirm the current hours with the Deven team before your visit.'],
];
function FAQSection() {
  const [active, setActive] = useState<number | null>(0);
  return (
    <section id="faq" className="container-wide py-24 md:py-32"><div className="grid gap-12 md:grid-cols-[.7fr_1.3fr] md:gap-24"><div><SectionLabel number="10">FAQ</SectionLabel><h2 className="mt-7 max-w-[360px] font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-[1] tracking-[-.07em] text-white">The useful answers.</h2><p className="mt-6 text-sm leading-6 text-[#777]">Still have a question? <a className="text-[#f8bc06] underline underline-offset-4" href={WHATSAPP} target="_blank" rel="noreferrer" data-testid="link-faq-whatsapp">Ask on WhatsApp.</a></p></div><div className="border-t border-white/20">{faqs.map(([question, answer], i) => <div key={question} className="border-b border-white/15"><button type="button" className="flex min-h-[72px] w-full items-center justify-between gap-5 text-left text-[16px] text-white" onClick={() => setActive(active === i ? null : i)} aria-expanded={active === i} data-testid={`button-faq-${i}`}><span>{question}</span><ChevronDown size={18} className={`shrink-0 text-[#f8bc06] transition-transform ${active === i ? 'rotate-180' : ''}`} /></button>{active === i && <p className="max-w-[650px] pb-6 pr-8 text-sm leading-6 text-[#8b8b8b]" data-testid={`text-faq-answer-${i}`}>{answer}</p>}</div>)}</div></div></section>
  );
}

function LocationSection() {
  return (
    <section id="contact" className="border-t border-white/10 bg-[#111] py-24 md:py-32"><div className="container-wide grid gap-12 md:grid-cols-[1fr_1fr] md:gap-20"><div><SectionLabel number="11">FIND DEVEN</SectionLabel><h2 className="mt-7 max-w-[560px] font-display text-[clamp(2.5rem,5vw,4.8rem)] leading-[.98] tracking-[-.07em] text-white">Come see what a serious place to build feels like.</h2><div className="mt-10 space-y-5 border-t border-white/15 pt-6 text-sm"><div className="flex gap-4"><MapPin size={18} className="text-[#f8bc06]" /><div><p className="text-white">City Centre, Raipur, Chhattisgarh</p><p className="mt-1 text-[#777]">[ADD ACTUAL ADDRESS]</p></div></div><div className="flex gap-4"><Clock3 size={18} className="text-[#f8bc06]" /><div><p className="text-white">Visit hours</p><p className="mt-1 text-[#777]">[ADD APPROVED WORKING HOURS]</p></div></div></div><div className="mt-8 flex flex-wrap gap-5"><a className="text-link" href={PHONE} data-testid="link-location-call"><Phone size={16} /> Call Deven</a><a className="text-link" href={WHATSAPP} target="_blank" rel="noreferrer" data-testid="link-location-whatsapp"><MessageCircle size={16} /> WhatsApp</a></div></div><div className="relative min-h-[330px] border border-white/15 md:min-h-[430px]"><div className="absolute inset-0 line-grid opacity-50" /><div className="absolute left-[22%] top-[24%] h-[52%] w-[50%] border border-[#f8bc06]"><div className="absolute -left-2 -top-2 h-3 w-3 bg-[#f8bc06]" /><div className="absolute bottom-3 right-3 text-right text-[10px] uppercase tracking-[.14em] text-[#f8bc06]">DEVEN COWORK<br /><span className="text-white/45">CITY CENTRE / RAIPUR</span></div></div><div className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[.14em] text-[#777]">MAP PLACEHOLDER / ADD EMBED</div></div></div></section>
  );
}

function FinalCTA({ onTour }: { onTour: () => void }) {
  return <section className="border-t border-black/20 bg-[#f1f1f1] py-20 text-black md:py-28"><div className="container-wide flex flex-col items-start justify-between gap-10 md:flex-row md:items-end"><div><p className="eyebrow text-black/50">12 / MAKE A VISIT</p><h2 className="mt-7 max-w-[720px] font-display text-[clamp(3rem,7vw,7rem)] leading-[.88] tracking-[-.09em]">Ready to see it?</h2></div><div><p className="mb-6 max-w-[250px] text-sm leading-6 text-black/55">The best way to know if Deven is right for your work is to walk through it.</p><Button onClick={onTour} testId="button-final-tour">Book a Free Tour</Button></div></div></section>;
}

function Footer() {
  return <footer className="bg-black py-14"><div className="container-wide"><div className="grid gap-12 border-b border-white/15 pb-12 md:grid-cols-[1.4fr_.6fr_.6fr_.8fr]"><div><Logo /><p className="mt-6 max-w-[290px] text-sm leading-6 text-[#777]">A premium business club and growth workspace for people building something in Raipur.</p></div><div><p className="eyebrow">Explore</p><div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa]"><Link href="/plans" data-testid="link-footer-plans">Plans</Link><Link href="/teams" data-testid="link-footer-teams">Teams & Cabins</Link><Link href="/studio" data-testid="link-footer-studio">Studio</Link><Link href="/gallery" data-testid="link-footer-gallery">Gallery</Link></div></div><div><p className="eyebrow">Deven</p><div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa]"><Link href="/about" data-testid="link-footer-about">About</Link><Link href="/contact" data-testid="link-footer-contact">Contact</Link><Link href="/founding-member" data-testid="link-footer-founding">Founding Member</Link><Link href="/enterprise" data-testid="link-footer-enterprise">Enterprise</Link></div></div><div><p className="eyebrow">Talk to us</p><div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa]"><a href={WHATSAPP} target="_blank" rel="noreferrer" data-testid="link-footer-whatsapp">WhatsApp</a><a href={PHONE} data-testid="link-footer-phone">+91 [ADD PHONE]</a><a href={EMAIL} data-testid="link-footer-email">[ADD EMAIL]</a><span>City Centre, Raipur</span></div></div></div><div className="flex flex-col justify-between gap-4 pt-6 text-[11px] uppercase tracking-[.12em] text-[#555] md:flex-row"><p>© {new Date().getFullYear()} Deven Cowork. All rights reserved.</p><div className="flex gap-5"><span>Privacy</span><span>Terms</span><span>Refund / cancellation</span></div></div></div></footer>;
}

function WhatsAppFloat() {
  return <a href={WHATSAPP} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-30 flex h-12 items-center gap-2 border border-[#f8bc06] bg-black px-4 text-xs font-semibold text-[#f8bc06] shadow-[0_8px_30px_rgba(0,0,0,.35)] transition-transform hover:-translate-y-1" data-testid="link-floating-whatsapp"><MessageCircle size={17} /> <span className="hidden sm:inline">WhatsApp Deven</span></a>;
}

function Home() {
  const [tourOpen, setTourOpen] = useState(false);
  useEffect(() => {
    document.title = 'Deven Cowork — A workspace built for people building something';
    const description = 'Deven Cowork is a premium coworking and growth workspace in City Centre, Raipur for founders, independent professionals and growing teams.';
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) { tag = document.createElement('meta'); tag.setAttribute('name', 'description'); document.head.appendChild(tag); }
    tag.setAttribute('content', description);
  }, []);
  return <div className="site-noise min-h-[100dvh] bg-black"><Navbar onTour={() => setTourOpen(true)} /><main><Hero onTour={() => setTourOpen(true)} /><TrustSection /><ProblemSection /><ReframeSection /><SpaceShowcase /><OfferSection /><StudioSection /><PricingSection onTour={() => setTourOpen(true)} /><TeamsSection /><TestimonialSection /><TrialSection onTour={() => setTourOpen(true)} /><FAQSection /><LocationSection /><FinalCTA onTour={() => setTourOpen(true)} /></main><Footer /><WhatsAppFloat /><TourModal open={tourOpen} onClose={() => setTourOpen(false)} /></div>;
}

const pageData: Record<string, { eyebrow: string; title: string; intro: string; items: string[]; image: string }> = {
  plans: { eyebrow: 'PLANS / COMPARE YOUR OPTIONS', title: 'Choose the room your work needs.', intro: 'Clear plans for focused individuals, consistent builders and growing teams. Approved pricing will be published here before launch.', items: ['Hot Desk — flexible workspace access', 'Dedicated Desk — your own place to build from', 'Private Cabin — quieter room for your team', 'Transparent monthly, quarterly and annual options'], image: 'ADD PLANS IMAGE' },
  teams: { eyebrow: 'TEAMS & CABINS / PRIVATE SPACE', title: 'Space that keeps pace with your team.', intro: 'A practical starting point for 10–20 seat teams, corporate teams, consultants and regional offices looking for a better base in Raipur.', items: ['Capacity planning and configuration', 'Privacy for deep work and conversations', 'Meeting rooms and visitor management', 'Proposal-led commercial conversation'], image: 'ADD TEAM SPACE IMAGE' },
  studio: { eyebrow: 'THE STUDIO / MAKE YOUR BUSINESS SEEN', title: 'A professional content studio, inside your workday.', intro: 'Create reels, product photography and video without leaving the place where the strategy happens.', items: ['Content creation space', 'Professional photography and video use cases', 'Portfolio and reel showcase — coming soon', 'External booking details to be confirmed'], image: 'ADD STUDIO IMAGE' },
  gallery: { eyebrow: 'GALLERY / A PLACE TO SEE IN PERSON', title: 'The details matter here.', intro: 'A visual record of the desks, cabins, meeting rooms, studio and shared moments that make Deven feel like Deven.', items: ['Main workspace', 'Dedicated desks and private cabins', 'Meeting rooms and reception', 'Studio and community moments'], image: 'ADD GALLERY IMAGE' },
  about: { eyebrow: 'ABOUT / WHY DEVEN EXISTS', title: 'A serious place for the next kind of work in Raipur.', intro: 'Deven is being built as a business club and growth workspace — a considered home for people building independently, together.', items: ['Founder story — to be added', 'Our point of view on work', 'Raipur as the place to build from', 'The Deven ecosystem'], image: 'ADD FOUNDER IMAGE' },
  contact: { eyebrow: 'CONTACT / COME BY', title: 'Start with a conversation, then see the space.', intro: 'Find Deven in City Centre, Raipur. Address, hours and the fastest way to reach us will be updated with approved details.', items: ['[ADD ACTUAL ADDRESS]', '[ADD APPROVED WORKING HOURS]', '[ADD PHONE]', '[ADD EMAIL]'], image: 'ADD LOCATION IMAGE' },
  'virtual-office': { eyebrow: 'VIRTUAL OFFICE / A PROFESSIONAL PRESENCE', title: 'Give your business a place to belong.', intro: 'A professional business address and virtual office service for businesses that need a stronger presence in Raipur. Availability and terms to be confirmed.', items: ['Professional business address', 'Mail handling — details to be confirmed', 'GST-related use where applicable', 'Registration support only where offered'], image: 'ADD VIRTUAL OFFICE IMAGE' },
  'meeting-rooms': { eyebrow: 'MEETING ROOMS / MAKE ROOM FOR THE CONVERSATION', title: 'A room that makes the meeting feel considered.', intro: 'Practical rooms for client conversations, team sessions and focused work. Capacity, equipment and hourly availability will be published with approved details.', items: ['Room types and capacity — to be confirmed', 'Wi-Fi, screen and whiteboard details', 'Coffee and visitor experience', 'Check availability with the Deven team'], image: 'ADD MEETING ROOM IMAGE' },
  'founding-member': { eyebrow: 'FOUNDING MEMBER / A BETTER START', title: 'Build your first chapter from a place built for momentum.', intro: 'A focused, conversion-led path into Deven for early members. Tour first. Understand the space. Then decide.', items: ['Workspace access', 'Studio and growth ecosystem', '7-day trial policy — terms to be confirmed', 'Approved founding member details coming soon'], image: 'ADD FOUNDING MEMBER IMAGE' },
  enterprise: { eyebrow: 'ENTERPRISE / SPACE FOR GROWING TEAMS', title: 'A better operating base for your team in Raipur.', intro: 'Structured, private workspace for regional offices, consulting teams and companies that need reliability without unnecessary complexity.', items: ['Private spaces and capacity planning', 'Infrastructure and operational details', 'Meeting rooms and visitor flow', 'Request a proposal'], image: 'ADD ENTERPRISE IMAGE' },
  'day-pass': { eyebrow: 'DAY PASS / A DAY TO FOCUS', title: 'Need a proper place for the day?', intro: 'A short, conversion-focused entry point for focused work, a change of scene or a first feel for Deven.', items: ['Workspace access — inclusions to be confirmed', 'Location: City Centre, Raipur', 'Approved day pass pricing coming soon', 'Book a Free Tour to see the full space'], image: 'ADD DAY PASS IMAGE' },
};

function InternalPage({ kind }: { kind: string }) {
  const data = pageData[kind] ?? pageData.about;
  const [tourOpen, setTourOpen] = useState(false);
  useEffect(() => { document.title = `${data.title} — Deven Cowork`; window.scrollTo(0, 0); }, [data.title]);
  return <div className="site-noise min-h-[100dvh] bg-black"><Navbar onTour={() => setTourOpen(true)} /><main className="pt-[76px]"><section className="container-wide grid min-h-[660px] items-center gap-12 py-24 md:grid-cols-[1.05fr_.95fr] md:py-32"><div><div className="eyebrow text-[#f8bc06]">{data.eyebrow}</div><h1 className="mt-7 max-w-[700px] font-display text-[clamp(3rem,7vw,6.5rem)] leading-[.94] tracking-[-.08em] text-white">{data.title}</h1><p className="mt-8 max-w-[520px] text-[17px] leading-7 text-[#aaa]">{data.intro}</p><div className="mt-9 flex flex-wrap gap-5"><Button onClick={() => setTourOpen(true)} testId={`button-${kind}-tour`}>Book a Free Tour</Button><a href={WHATSAPP} target="_blank" rel="noreferrer" className="text-link" data-testid={`link-${kind}-whatsapp`}><MessageCircle size={17} /> WhatsApp</a></div></div><ImagePlaceholder label={data.image} className="aspect-[4/5] min-h-[390px]" caption="Replace with approved Deven photography" /></section><section className="border-y border-white/10 bg-[#111] py-20 md:py-28"><div className="container-wide grid gap-12 md:grid-cols-[.65fr_1.35fr]"><div><SectionLabel number="01">WHAT TO EXPECT</SectionLabel></div><div className="border-t border-white/20">{data.items.map((item, i) => <div key={item} className="flex items-center gap-5 border-b border-white/15 py-5"><span className="font-mono text-xs text-[#f8bc06]">0{i + 1}</span><p className="text-[17px] text-[#ddd]">{item}</p></div>)}</div></div></section><FinalCTA onTour={() => setTourOpen(true)} /></main><Footer /><WhatsAppFloat /><TourModal open={tourOpen} onClose={() => setTourOpen(false)} /></div>;
}

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/plans" component={() => <InternalPage kind="plans" />} /><Route path="/teams" component={() => <InternalPage kind="teams" />} /><Route path="/studio" component={() => <InternalPage kind="studio" />} /><Route path="/gallery" component={() => <InternalPage kind="gallery" />} /><Route path="/about" component={() => <InternalPage kind="about" />} /><Route path="/contact" component={() => <InternalPage kind="contact" />} /><Route path="/virtual-office" component={() => <InternalPage kind="virtual-office" />} /><Route path="/meeting-rooms" component={() => <InternalPage kind="meeting-rooms" />} /><Route path="/founding-member" component={() => <InternalPage kind="founding-member" />} /><Route path="/enterprise" component={() => <InternalPage kind="enterprise" />} /><Route path="/day-pass" component={() => <InternalPage kind="day-pass" />} /><Route component={NotFound} /></Switch>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Router /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;