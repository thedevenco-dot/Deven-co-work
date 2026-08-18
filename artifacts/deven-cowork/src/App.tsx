import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown, Clock3, MapPin, MessageCircle, Phone, ShieldCheck, Users, X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
const PHONE_HREF = 'tel:[ADD APPROVED PHONE]';
const WHATSAPP_HREF = 'https://wa.me/';
const WHATSAPP_NOTE = '[ADD APPROVED WHATSAPP NUMBER]';

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  variant?: 'primary' | 'outline';
  testId: string;
};

function Button({ children, onClick, href, className = '', variant = 'primary', testId }: ButtonProps) {
  const content = <>{children}<ArrowUpRight size={16} strokeWidth={1.8} /></>;
  if (href) return <a href={href} className={`button button-${variant} ${className}`} data-testid={testId}>{content}</a>;
  return <button type="button" onClick={onClick} className={`button button-${variant} ${className}`} data-testid={testId}>{content}</button>;
}

function Logo() {
  return (
    <Link href="/" className="logo text-[#f4f1eb]" data-testid="link-logo">
      <span className="logo-mark" aria-hidden="true"><span /><span /></span>
      <span className="font-display text-[21px] tracking-[.02em]">DEVEN</span>
      <span className="mt-[3px] text-[9px] font-bold tracking-[.18em] text-[#8b8983]">COWORK</span>
    </Link>
  );
}

function SectionLabel({ number, children, dark = false }: { number: string; children: ReactNode; dark?: boolean }) {
  return <div className={`eyebrow flex items-center gap-3 ${dark ? 'text-[#191814]' : ''}`}><span className="text-[#FFC247]">{number}</span><span>{children}</span></div>;
}

function HonestFrame({ label, caption, className = '' }: { label: string; caption: string; className?: string }) {
  return (
    <div className={`render-frame ${className}`} data-testid={`image-placeholder-${label.toLowerCase().replaceAll(' ', '-')}`}>
      <div className="absolute left-[10%] top-[12%] h-px w-[80%] bg-white/15" />
      <div className="absolute bottom-[13%] left-[19%] h-px w-[62%] bg-[#FFC247]/35" />
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#a5a29a]"><span className="h-1.5 w-1.5 bg-[#FFC247]" />{label}</div>
      <span className="absolute right-4 top-4 max-w-[180px] text-right text-[10px] uppercase leading-[1.5] tracking-[.1em] text-white/45">{caption}</span>
    </div>
  );
}

function Header({ onReserve }: { onReserve: () => void }) {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className={`fixed left-0 top-0 z-40 w-full border-b transition-colors duration-300 ${solid ? 'border-white/10 bg-[#0D0D0D]/95 backdrop-blur-sm' : 'border-transparent bg-[#0D0D0D]'}`} data-testid="header-sticky">
      <div className="container-wide flex h-[72px] items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-3 sm:gap-5">
          <a href={PHONE_HREF} className="flex min-h-11 items-center gap-2 text-xs text-[#aaa69d] hover:text-[#FFC247]" data-testid="link-phone-placeholder"><Phone size={14} /> <span className="hidden sm:inline">[ADD APPROVED PHONE]</span><span className="sm:hidden">[PHONE]</span></a>
          <Button onClick={onReserve} className="button-small" testId="button-header-reserve">Reserve My Seat</Button>
        </div>
      </div>
    </header>
  );
}

function Hero({ onReserve }: { onReserve: () => void }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 pt-[72px]" data-testid="section-hero">
      <div className="absolute right-[-18%] top-[20%] h-[360px] w-[76%] border border-white/10 sm:right-[-8%] sm:h-[540px] sm:w-[58%]">
        <HonestFrame label="SPACE PREVIEW" caption="Concept render placeholder — the space is currently being finished." className="absolute inset-3" />
      </div>
      <div className="container-wide relative z-10 flex min-h-[calc(100dvh-72px)] flex-col justify-center pb-10 pt-14 sm:min-h-[750px] sm:pb-20">
        <div className="max-w-[730px]">
          <div className="reveal eyebrow flex items-center gap-3 text-[#FFC247]"><span className="h-px w-8 bg-[#FFC247]" />PRE-LAUNCH / CITY CENTRE, RAIPUR</div>
          <h1 className="reveal reveal-delay-1 mt-6 max-w-[700px] font-display text-[clamp(3.65rem,15vw,8rem)] leading-[.86] tracking-[-.015em] text-[#f4f1eb]">Raipur's next work address.<br /><span className="text-[#FFC247]">Opening soon.</span></h1>
          <p className="reveal reveal-delay-2 mt-7 max-w-[540px] text-[16px] leading-7 text-[#b7b3ab]">A workspace, content studio and growth team in City Centre, Raipur. Only 50 founding seats. Maximum 7 seats per client, founder or company.</p>
          <div className="reveal reveal-delay-3 mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button onClick={onReserve} testId="button-hero-reserve">Reserve My Seat</Button>
            <a href={`${WHATSAPP_HREF}`} target="_blank" rel="noreferrer" className="text-link" data-testid="link-hero-whatsapp"><MessageCircle size={17} /> WhatsApp pre-booking</a>
          </div>
          <div className="mt-5 flex max-w-[580px] flex-wrap gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[.08em] text-[#85827b]"><span>2-day free trial</span><span>7-day 100% refund</span><span>Refundable deposit</span><span>[ADD OPENING MONTH]</span></div>
          <p className="mt-6 text-xs text-[#6f6c65]">Founding plan from <strong className="text-[#FFC247]">₹[ADD APPROVED FOUNDING PRICE] / month</strong>. Final rate will be confirmed before launch.</p>
        </div>
        <div className="mt-14 grid max-w-[750px] grid-cols-2 border-t border-white/20 pt-5 sm:grid-cols-4">
          {['50 seats total', '7-seat cap', '2 days free', 'City Centre, Raipur'].map((item, index) => <div key={item} className={`pr-3 ${index > 1 ? 'mt-5 sm:mt-0' : ''}`}><p className="font-display text-[20px] tracking-[.02em] text-[#f4f1eb]">{item}</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-[#706e68]">{index === 3 ? 'location' : 'founding batch'}</p></div>)}
        </div>
      </div>
      <div className="absolute bottom-7 right-8 hidden items-center gap-3 text-[10px] uppercase tracking-[.16em] text-[#777] lg:flex"><ArrowDownRight size={16} className="text-[#FFC247]" /> Scroll to reserve</div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="border-b border-white/10 bg-[#11110f] py-9" data-testid="section-trust">
      <div className="container-wide grid gap-7 md:grid-cols-[1.2fr_.8fr_.8fr] md:items-center">
        <div><p className="eyebrow">Built by DEVEN</p><p className="mt-3 max-w-[440px] text-[15px] leading-6 text-[#b0ada5]">The agency behind <span className="text-[#FFC247]">[ADD APPROVED RAIPUR BRANDS]</span>. Credibility first; member stories will be added after opening.</p></div>
        <div className="flex items-center gap-3 border-l border-white/15 pl-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#FFC247] text-center text-[8px] font-bold uppercase leading-3 text-[#FFC247]">[ADD<br />PHOTO]</div><div><p className="text-sm text-[#e8e3da]">[ADD APPROVED FOUNDER NAME]</p><p className="mt-1 text-xs text-[#79766f]">Founder / DEVEN</p></div></div>
        <div className="border-l border-white/15 pl-5"><p className="text-sm text-[#e8e3da]">City Centre, Raipur</p><p className="mt-1 text-xs text-[#79766f]">Opening [ADD APPROVED MONTH YEAR]</p></div>
      </div>
    </section>
  );
}

function Problems() {
  const problems = [
    'A client asks where your office is — and you change the subject.',
    'Your best work happens between a doorbell, a delivery and the television in the next room.',
    'You look smaller on a video call than your business actually is.',
  ];
  return (
    <section className="container-wide py-24 sm:py-32" data-testid="section-problems">
      <div className="grid gap-12 md:grid-cols-[.72fr_1.28fr] md:gap-24">
        <div><SectionLabel number="01">THE PROBLEM</SectionLabel><p className="mt-8 max-w-[250px] text-sm leading-6 text-[#85827b]">Not an abstract productivity problem. Three moments your current setup makes harder than they need to be.</p></div>
        <div><h2 className="max-w-[690px] font-display text-[clamp(2.8rem,7vw,5.8rem)] leading-[.91] tracking-[.01em] text-[#f4f1eb]">Your work has outgrown the room it happens in.</h2><div className="mt-12 border-t border-white/15">{problems.map((problem, index) => <div className="flex gap-5 border-b border-white/15 py-6" key={problem}><span className="font-mono text-xs text-[#FFC247]">0{index + 1}</span><p className="max-w-[610px] text-[16px] leading-7 text-[#d4d0c8]">{problem}</p></div>)}</div></div>
      </div>
    </section>
  );
}

function Reframe() {
  return (
    <section className="border-y border-[#FFC247]/25 bg-[#FFC247] py-24 text-[#0D0D0D] sm:py-32" data-testid="section-reframe">
      <div className="container-wide">
        <SectionLabel number="02" dark>THE REFRAME</SectionLabel>
        <div className="mt-10 grid gap-12 md:grid-cols-[1.2fr_.8fr] md:items-end">
          <h2 className="max-w-[800px] font-display text-[clamp(3.5rem,9vw,8.6rem)] leading-[.83] tracking-[.01em]">This is not a coworking space.</h2>
          <p className="border-l border-black/30 pl-6 text-[16px] leading-7 text-black/70">It is a workspace with a content studio and growth team attached. Deven is designed for people who want to focus, make better work and be taken seriously — not simply rent a chair.</p>
        </div>
        <div className="mt-16 grid grid-cols-3 border-t border-black/30 pt-5">{['WORKSPACE', 'STUDIO', 'GROWTH'].map((word, index) => <div key={word} className="border-r border-black/20 pr-3 last:border-0"><p className="font-mono text-[11px] text-black/60">0{index + 1}</p><p className="mt-3 font-display text-xl tracking-[.02em] sm:text-3xl">{word}</p></div>)}</div>
      </div>
    </section>
  );
}

function ReserveBeforeOpening({ onReserve }: { onReserve: () => void }) {
  const reasons = [
    ['Founding pricing locked', 'Your approved founding rate stays with you for as long as you stay, even after launch rates change.'],
    ['First choice of location', 'Choose your desk or cabin location first once the space opens, subject to the final layout.'],
    ['Month-one studio priority', 'Early reservers get priority booking access for studio slots in the first month.'],
    ['Refundable by design', 'Reserve with a refundable deposit. Change your mind before opening? You can walk away.'],
  ];
  return (
    <section className="border-b border-white/10 bg-[#11110f] py-24 sm:py-32" data-testid="section-why-reserve">
      <div className="container-wide grid gap-12 md:grid-cols-[.8fr_1.2fr] md:gap-24">
        <div><SectionLabel number="03">WHY RESERVE BEFORE OPENING</SectionLabel><h2 className="mt-7 max-w-[480px] font-display text-[clamp(3rem,7vw,6.2rem)] leading-[.87] tracking-[.01em] text-[#f4f1eb]">Being early should pay you back.</h2><p className="mt-7 max-w-[400px] text-[16px] leading-7 text-[#97938b]">The founding batch is the only window to choose first, lock the approved founding rate and reserve without taking a blind leap.</p><Button onClick={onReserve} className="mt-8" testId="button-why-reserve">Reserve My Seat</Button></div>
        <div className="border-t border-white/20">{reasons.map(([title, body], index) => <div key={title} className="grid gap-3 border-b border-white/15 py-6 sm:grid-cols-[48px_1fr]"><span className="font-mono text-xs text-[#FFC247]">0{index + 1}</span><div><h3 className="font-display text-2xl tracking-[.02em] text-[#f4f1eb]">{title}</h3><p className="mt-2 max-w-[500px] text-[15px] leading-6 text-[#9d9991]">{body}</p></div></div>)}</div>
      </div>
    </section>
  );
}

const offerItems = [
  ['Dedicated desk · 24/7 access', '₹[ADD APPROVED VALUE]'],
  ['Unlimited Coffee Lab', '₹[ADD APPROVED VALUE]'],
  ['Meeting room hours / month', '₹[ADD APPROVED VALUE]'],
  ['Monthly studio reel', '₹[ADD APPROVED VALUE]'],
  ['GMB setup', '₹[ADD APPROVED VALUE]'],
  ['Monthly growth session', '₹[ADD APPROVED VALUE]'],
  ['GST business address', '₹[ADD APPROVED VALUE]'],
  ['Raipur Founders feature', '₹[ADD APPROVED VALUE]'],
  ['Member network', '₹[ADD APPROVED VALUE]'],
];

function OfferStack() {
  return (
    <section className="container-wide py-24 sm:py-32" data-testid="section-offer">
      <div className="grid gap-12 md:grid-cols-[.78fr_1.22fr] md:gap-24">
        <div><SectionLabel number="04">THE OFFER STACK</SectionLabel><h2 className="mt-7 max-w-[460px] font-display text-[clamp(3rem,7vw,6rem)] leading-[.88] tracking-[.01em] text-[#f4f1eb]">More than a desk. A better business base.</h2><p className="mt-7 max-w-[390px] text-[16px] leading-7 text-[#99958d]">Every inclusion will be published with its approved rupee value before launch. No inflated comparison price, no hidden bundle.</p></div>
        <div className="border-t border-white/20" data-testid="table-offer-stack">
          {offerItems.map(([item, value], index) => <div key={item} className="grid grid-cols-[24px_1fr_auto] items-center gap-3 border-b border-white/15 py-4"><span className="font-mono text-[11px] text-[#FFC247]">0{index + 1}</span><p className={`text-[15px] ${index === 3 || index === 4 || index === 5 ? 'font-bold text-[#f4f1eb]' : 'text-[#d0ccc4]'}`}>{item}{index === 3 || index === 4 || index === 5 ? <span className="ml-2 text-[10px] font-bold uppercase tracking-[.1em] text-[#FFC247]">Deven edge</span> : null}</p><span className="text-right text-xs text-[#8d8981]">{value}</span></div>)}
          <div className="flex items-center justify-between border-b border-[#FFC247]/40 py-5"><span className="font-display text-2xl tracking-[.02em] text-[#f4f1eb]">Total included value</span><span className="font-display text-xl text-[#FFC247]">₹[ADD APPROVED TOTAL]</span></div>
          <p className="mt-4 text-xs text-[#74716b]">Actual founding price: <span className="text-[#FFC247]">₹[ADD APPROVED FOUNDING PRICE] / month</span></p>
        </div>
      </div>
    </section>
  );
}

function SpacePreview({ onReserve }: { onReserve: () => void }) {
  return (
    <section className="border-y border-white/10 bg-[#11110f] py-24 sm:py-32" data-testid="section-preview">
      <div className="container-wide">
        <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between"><div><SectionLabel number="05">SPACE PREVIEW</SectionLabel><h2 className="mt-7 max-w-[680px] font-display text-[clamp(3rem,7vw,6rem)] leading-[.88] tracking-[.01em] text-[#f4f1eb]">See the work in progress.</h2></div><p className="max-w-[260px] text-sm leading-6 text-[#89857d]">The space is currently being finished. These are honest preview slots, not completed-space photography.</p></div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 md:grid-cols-3"><HonestFrame label="MAIN WORKSPACE" caption="Third-floor windows on two sides — render to be added." className="min-h-[260px] sm:col-span-2 md:row-span-2 md:min-h-[540px]" /><HonestFrame label="PRIVATE CABINS" caption="Cabin layout render — to be added." className="min-h-[210px]" /><HonestFrame label="CONTENT STUDIO" caption="Studio equipment preview — to be added." className="min-h-[210px]" /></div>
        <Button onClick={onReserve} className="mt-8" testId="button-preview-reserve">Reserve My Seat</Button>
      </div>
    </section>
  );
}

function StudioGrowth() {
  return (
    <section className="container-wide py-24 sm:py-32" data-testid="section-studio-growth">
      <div className="grid items-center gap-12 md:grid-cols-[1.05fr_.95fr] md:gap-20">
        <HonestFrame label="STUDIO PREVIEW" caption="Professional content setup — final preview to be added." className="aspect-[4/3] w-full" />
        <div><SectionLabel number="06">STUDIO + GROWTH</SectionLabel><h2 className="mt-7 max-w-[560px] font-display text-[clamp(3rem,7vw,6rem)] leading-[.87] tracking-[.01em] text-[#f4f1eb]">Your workspace should help you get seen.</h2><p className="mt-7 max-w-[480px] text-[16px] leading-7 text-[#9d9991]">A monthly studio reel gives your ideas somewhere to go. A monthly growth session gives the next move a room and a point of view. This is the difference between having a place to work and having a place that moves the business forward.</p><div className="mt-8 grid gap-4 border-t border-white/15 pt-5 sm:grid-cols-2"><div><p className="font-display text-2xl text-[#FFC247]">01 / MAKE</p><p className="mt-2 text-sm leading-6 text-[#8e8a82]">Create the reel, product shot or idea your business keeps postponing.</p></div><div><p className="font-display text-2xl text-[#FFC247]">02 / MOVE</p><p className="mt-2 text-sm leading-6 text-[#8e8a82]">Leave each growth session with a clearer next action.</p></div></div></div>
      </div>
    </section>
  );
}

type Billing = 'monthly' | 'quarterly' | 'annual';
const plans = [
  { name: 'Hot Desk', description: 'Flexible access for focused days.', audience: 'For independent professionals', price: '₹[ADD APPROVED PRICE]', features: ['Shared workspace access', 'Meeting room access', 'Community membership'] },
  { name: 'Dedicated Desk', description: 'Your own place to build from.', audience: 'For consistent momentum', price: '₹[ADD APPROVED PRICE]', features: ['Dedicated workspace', 'Studio + growth ecosystem', 'Member network'], featured: true },
  { name: 'Private Cabin', description: 'A quieter room for your team.', audience: 'For teams that need privacy', price: '₹[ADD APPROVED PRICE]', features: ['Private workspace', 'Team-ready setup', 'Meeting room access'] },
];

function Pricing({ onReserve }: { onReserve: () => void }) {
  const [billing, setBilling] = useState<Billing>('monthly');
  return (
    <section className="bg-[#e8e2d7] py-24 text-[#0D0D0D] sm:py-32" id="pricing" data-testid="section-pricing">
      <div className="container-wide">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"><div><SectionLabel number="07" dark>PRICING + SEAT RESERVATION</SectionLabel><h2 className="mt-7 max-w-[720px] font-display text-[clamp(3.3rem,7vw,6.5rem)] leading-[.85] tracking-[.01em]">Choose the room your work needs.</h2></div><div className="flex self-start border border-black/25 p-1" role="group" aria-label="Billing period">{(['monthly', 'quarterly', 'annual'] as Billing[]).map(option => <button key={option} type="button" onClick={() => setBilling(option)} className={`min-h-11 px-3 text-[11px] font-bold uppercase tracking-[.08em] ${billing === option ? 'bg-[#0D0D0D] text-[#FFC247]' : 'text-black/60 hover:text-black'}`} data-testid={`button-billing-${option}`}>{option}</button>)}</div></div>
        <p className="mt-6 text-sm text-black/60">Approved rates are being finalized. Reserve now to hold your place in the founding batch; this is not online membership checkout.</p>
        <div className="mt-12 grid gap-3 md:grid-cols-3">{plans.map(plan => <article key={plan.name} className={`relative flex min-h-[425px] flex-col border p-6 sm:p-7 ${plan.featured ? 'border-[#0D0D0D] bg-[#0D0D0D] text-[#f4f1eb]' : 'border-black/20'}`} data-testid={`card-plan-${plan.name.toLowerCase().replaceAll(' ', '-')}`}>{plan.featured && <span className="absolute right-5 top-5 bg-[#FFC247] px-2 py-1 text-[9px] font-bold uppercase tracking-[.13em] text-[#0D0D0D]">Most popular</span>}<p className={`eyebrow ${plan.featured ? 'text-[#FFC247]' : 'text-black/50'}`}>{plan.audience}</p><h3 className="mt-8 font-display text-3xl tracking-[.02em]">{plan.name}</h3><p className={`mt-3 max-w-[230px] text-sm leading-6 ${plan.featured ? 'text-[#aaa69e]' : 'text-black/60'}`}>{plan.description}</p><div className={`mt-8 border-y py-5 ${plan.featured ? 'border-white/15' : 'border-black/15'}`}><p className={`font-display text-2xl ${plan.featured ? 'text-[#FFC247]' : ''}`}>{plan.price}</p><p className={`mt-1 text-[10px] uppercase tracking-[.13em] ${plan.featured ? 'text-[#77736d]' : 'text-black/45'}`}>per {billing} / final rate pending</p></div><ul className="mt-6 space-y-3">{plan.features.map(feature => <li key={feature} className="flex gap-2 text-sm"><Check size={15} className={plan.featured ? 'text-[#FFC247]' : 'text-black'} />{feature}</li>)}</ul><button type="button" onClick={onReserve} className={`mt-auto flex min-h-11 items-center justify-between border-b pb-2 pt-8 text-sm font-bold ${plan.featured ? 'border-[#FFC247] text-[#FFC247]' : 'border-black/30'}`} data-testid={`button-plan-reserve-${plan.name.toLowerCase().replaceAll(' ', '-')}`}>Reserve My Seat <ArrowUpRight size={16} /></button></article>)}</div>
        <div className="mt-8 border-l-2 border-[#FFC247] pl-5"><p className="max-w-[800px] text-[16px] font-bold leading-7">50 seats total for our founding batch. Maximum 7 seats per client or founder — this keeps the space diverse and every member gets real access to the community, not just a desk.</p><p className="mt-2 text-sm text-black/60">Annual saving: ₹[ADD APPROVED ANNUAL SAVING].</p></div>
      </div>
    </section>
  );
}

const faqs = [
  ['When exactly do you open?', 'Deven is opening soon in City Centre, Raipur. The approved month and year will be published here once confirmed: [ADD APPROVED OPENING MONTH YEAR].'],
  ['Is my deposit really refundable, and how do I get it back?', 'Yes. Your pre-launch deposit is fully refundable if you change your mind before opening. Refund instructions and the approved timeline will be confirmed with your reservation.'],
  ['Can my company reserve more than 7 seats?', 'No. The founding policy caps every client, founder or company at 7 seats.'],
  ['What happens to my price if I reserve now vs. after launch?', 'Your approved founding price is locked for as long as you stay. Post-launch rates will be different once finalized.'],
  ['Is there a lock-in period once we open?', 'The approved lock-in policy is still being finalized. It will be shared before any membership is activated.'],
  ['Can I use this address for GST registration?', 'GST business-address use is part of the offer stack where applicable. Eligibility and documentation will be confirmed before launch.'],
  ['What if the opening date shifts?', 'Your reservation remains refundable before opening. We will communicate any approved timeline change directly; no one is locked into a date that has moved.'],
  ['Do I choose my desk or cabin, or is it assigned?', 'Founding reservers get first choice of desk or cabin location once the final layout is ready, subject to availability and plan.'],
  ['How does the 2-day free trial work?', 'Walk in for your first two days at no cost. No membership payment is due upfront on this page. The exact start process will be confirmed before opening.'],
  ['If I take the 7-day refund, do I get my deposit back too?', 'Yes. If Deven is not right for you after the 2-day free trial and 7-day decision window, the reservation deposit and applicable membership payment are 100% refunded.'],
  ['Is there a catch to love it or leave it?', 'No conditions and no fine print. If it is not the best place you have worked in Raipur, leave within the 7-day decision window and receive 100% back.'],
  ['What about parking, hours and meeting rooms?', 'Parking details, approved operating hours and meeting-room specifications will be published before opening: [ADD APPROVED OPERATING DETAILS].'],
];

function FAQ() {
  const [active, setActive] = useState<number | null>(0);
  return (
    <section className="container-wide py-24 sm:py-32" id="faq" data-testid="section-faq">
      <div className="grid gap-12 md:grid-cols-[.7fr_1.3fr] md:gap-24"><div><SectionLabel number="08">FAQ</SectionLabel><h2 className="mt-7 max-w-[410px] font-display text-[clamp(3rem,7vw,6rem)] leading-[.86] tracking-[.01em] text-[#f4f1eb]">The useful answers.</h2><p className="mt-7 max-w-[300px] text-sm leading-6 text-[#85827b]">The space is not open yet, so some operating details are clearly marked for approval rather than guessed.</p></div><div className="border-t border-white/20">{faqs.map(([question, answer], index) => <div key={question} className="border-b border-white/15"><button type="button" className="flex min-h-[72px] w-full items-center justify-between gap-5 text-left text-[16px] font-semibold text-[#f4f1eb]" onClick={() => setActive(active === index ? null : index)} aria-expanded={active === index} data-testid={`button-faq-${index}`}><span>{question}</span><ChevronDown size={18} className={`shrink-0 text-[#FFC247] transition-transform ${active === index ? 'rotate-180' : ''}`} /></button>{active === index && <p className="max-w-[680px] pb-6 pr-8 text-[15px] leading-7 text-[#99958d]" data-testid={`text-faq-answer-${index}`}>{answer}</p>}</div>)}</div></div>
    </section>
  );
}

function RiskReversal({ onReserve }: { onReserve: () => void }) {
  return (
    <section className="border-y border-[#FFC247]/30 bg-[#FFC247] py-24 text-[#0D0D0D] sm:py-36" data-testid="section-risk-reversal">
      <div className="container-wide"><SectionLabel number="09" dark>THE RISK REVERSAL</SectionLabel><div className="mt-10 grid gap-12 md:grid-cols-[1.15fr_.85fr] md:items-end"><div><h2 className="max-w-[850px] font-display text-[clamp(3.8rem,10vw,9.4rem)] leading-[.78] tracking-[.01em]">2 days, free.<br />Then 7 days<br />to decide.</h2><p className="mt-8 max-w-[590px] text-[19px] font-bold leading-8">Love it or leave it, 100% refunded.</p><p className="mt-4 max-w-[590px] text-[16px] leading-7 text-black/70">Walk in for your first two days at no cost. Keep working here for a week. If Deven Cowork is not the best place you have worked in Raipur, leave — and get every rupee back. No conditions, no fine print.</p></div><div className="border-l border-black/30 pl-6"><ShieldCheck size={30} className="mb-5" /><p className="font-display text-3xl leading-none tracking-[.02em]">REFUNDABLE PRE-LAUNCH DEPOSIT</p><p className="mt-4 text-[15px] leading-6 text-black/70">Reserving now? Your deposit is fully refundable if you change your mind before we open, or if your 7-day trial does not work out once we do.</p><Button onClick={onReserve} className="mt-8" testId="button-risk-reserve">Reserve My Seat</Button></div></div></div>
    </section>
  );
}

function Scarcity() {
  return (
    <section className="container-wide border-b border-white/10 py-20 sm:py-24" data-testid="section-scarcity">
      <div className="grid gap-8 md:grid-cols-[1.2fr_.8fr] md:items-center"><div><SectionLabel number="10">FOUNDING BATCH</SectionLabel><h2 className="mt-6 max-w-[730px] font-display text-[clamp(2.8rem,7vw,6rem)] leading-[.88] tracking-[.01em] text-[#f4f1eb]">50 seats. No fake counter.</h2><p className="mt-5 max-w-[600px] text-[16px] leading-7 text-[#9d9991]"><span className="text-[#FFC247]">[ADD LIVE RESERVED COUNT]</span> of 50 founding seats reserved. We will update this number honestly as deposits are received. Founding pricing disappears the day we open.</p></div><div className="border-l border-white/15 pl-6"><Users size={24} className="text-[#FFC247]" /><p className="mt-4 font-display text-3xl text-[#f4f1eb]">MAXIMUM 7 SEATS</p><p className="mt-2 text-sm leading-6 text-[#8c8981]">Per client, founder or company. Reserve what you need now rather than assuming more can be added later.</p></div></div>
    </section>
  );
}

function Location() {
  return (
    <section className="border-t border-white/10 bg-[#11110f] py-24 sm:py-32" data-testid="section-location">
      <div className="container-wide grid gap-12 md:grid-cols-[.9fr_1.1fr] md:gap-20"><div><SectionLabel number="11">LOCATION PROOF</SectionLabel><h2 className="mt-7 max-w-[560px] font-display text-[clamp(3rem,7vw,6rem)] leading-[.86] tracking-[.01em] text-[#f4f1eb]">City Centre, Raipur. Close to the work.</h2><div className="mt-10 space-y-5 border-t border-white/15 pt-6 text-[15px]"><div className="flex gap-4"><MapPin size={18} className="shrink-0 text-[#FFC247]" /><div><p className="text-[#e8e3da]">City Centre, Raipur, Chhattisgarh</p><p className="mt-1 text-[#77736d]">[ADD APPROVED STREET ADDRESS / LANDMARK]</p></div></div><div className="flex gap-4"><Clock3 size={18} className="shrink-0 text-[#FFC247]" /><div><p className="text-[#e8e3da]">Opening soon</p><p className="mt-1 text-[#77736d]">[ADD APPROVED OPENING MONTH YEAR]</p></div></div></div><div className="mt-8 flex flex-wrap gap-5"><a className="text-link" href={PHONE_HREF} data-testid="link-location-phone"><Phone size={16} /> [ADD APPROVED PHONE]</a><a className="text-link" href={WHATSAPP_HREF} target="_blank" rel="noreferrer" data-testid="link-location-whatsapp"><MessageCircle size={16} /> WhatsApp pre-booking</a></div></div><div className="grid-paper relative min-h-[340px] border border-white/15 sm:min-h-[440px]" data-testid="map-placeholder"><div className="absolute left-[18%] top-[23%] h-[53%] w-[58%] border border-[#FFC247]"><div className="absolute -left-2 -top-2 h-3 w-3 bg-[#FFC247]" /><div className="absolute bottom-3 right-3 text-right text-[10px] uppercase tracking-[.14em] text-[#FFC247]">DEVEN COWORK<br /><span className="text-white/45">CITY CENTRE / RAIPUR</span></div></div><div className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[.14em] text-[#77736d]">MAP EMBED / ADD APPROVED MAP</div><div className="absolute right-4 top-4 max-w-[150px] text-right text-[10px] uppercase leading-5 tracking-[.12em] text-white/45">Drive times from known landmarks<br />[ADD APPROVED TIMES]</div></div></div>
    </section>
  );
}

type ReservationForm = { name: string; phone: string; seats: string; plan: string };
function Reservation() {
  const [form, setForm] = useState<ReservationForm>({ name: '', phone: '', seats: '', plan: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const update = (key: keyof ReservationForm, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.seats || !form.plan) {
      setError('Please complete all four fields. Seats are capped at 7 per business.');
      return;
    }
    if (Number(form.seats) < 1 || Number(form.seats) > 7) {
      setError('Seats needed must be between 1 and 7.');
      return;
    }
    setError('');
    setLoading(true);
    window.setTimeout(() => { setLoading(false); setSubmitted(true); }, 850);
  };
  return (
    <section className="border-t border-white/10 bg-[#0D0D0D] py-24 sm:py-32" id="reservation" data-testid="section-reservation">
      <div className="container-wide grid gap-12 md:grid-cols-[.82fr_1.18fr] md:gap-24"><div><SectionLabel number="12">RESERVE YOUR SEAT</SectionLabel><h2 className="mt-7 max-w-[520px] font-display text-[clamp(3.4rem,8vw,7rem)] leading-[.82] tracking-[.01em] text-[#f4f1eb]">Be in the first 50.</h2><p className="mt-7 max-w-[410px] text-[16px] leading-7 text-[#a19d95]">Leave four details. We will confirm the approved founding plan, deposit steps and opening timeline directly.</p><div className="mt-9 border-l-2 border-[#FFC247] pl-5"><p className="font-display text-2xl tracking-[.02em] text-[#FFC247]">RESERVATION, NOT A SALE</p><p className="mt-2 text-sm leading-6 text-[#8e8a82]">No online checkout or membership payment is implemented here. Your place is held pending deposit confirmation.</p></div></div><div className="border border-white/15 bg-[#11110f] p-5 sm:p-8">{!submitted ? <form onSubmit={submit} noValidate className="space-y-5" data-testid="form-reservation"><div className="grid gap-5 sm:grid-cols-2"><label className="field-label">Name<input required value={form.name} onChange={event => update('name', event.target.value)} placeholder="Your full name" autoComplete="name" data-testid="input-reservation-name" /></label><label className="field-label">Phone<input required type="tel" value={form.phone} onChange={event => update('phone', event.target.value)} placeholder="+91 00000 00000" autoComplete="tel" data-testid="input-reservation-phone" /></label></div><div className="grid gap-5 sm:grid-cols-2"><div><label className="field-label">Seats needed<select required value={form.seats} onChange={event => update('seats', event.target.value)} data-testid="select-reservation-seats"><option value="">Select seats</option>{[1, 2, 3, 4, 5, 6, 7].map(seat => <option key={seat} value={seat}>{seat} {seat === 1 ? 'seat' : 'seats'}</option>)}</select></label><p className="mt-2 text-xs font-bold text-[#FFC247]">Maximum 7 seats per business.</p></div><label className="field-label">Preferred plan<select required value={form.plan} onChange={event => update('plan', event.target.value)} data-testid="select-reservation-plan"><option value="">Select a plan</option><option>Hot Desk</option><option>Dedicated Desk</option><option>Private Cabin</option><option>Virtual Office</option></select></label></div>{error && <p className="border border-[#a85a4f] bg-[#301b18] p-3 text-sm leading-5 text-[#ffc0b6]" role="alert" data-testid="status-reservation-error">{error}</p>}<button type="submit" className="button button-primary w-full justify-between" disabled={loading} data-testid="button-submit-reservation">{loading ? <><span className="animate-pulse">Saving your reservation</span><span className="flex gap-1" aria-hidden="true"><i className="h-1.5 w-1.5 bg-[#0D0D0D]" /><i className="h-1.5 w-1.5 bg-[#0D0D0D]" /><i className="h-1.5 w-1.5 bg-[#0D0D0D]" /></span></> : <>Reserve My Seat <ArrowUpRight size={16} /></>}</button><p className="text-center text-xs leading-5 text-[#6f6c65]">Refundable deposit · no card required on this page · takes about 2 minutes</p></form> : <div className="py-8 sm:py-12" data-testid="status-reservation-success"><div className="flex h-12 w-12 items-center justify-center border border-[#FFC247] text-[#FFC247]"><Check size={22} /></div><h3 className="mt-6 font-display text-4xl tracking-[.02em] text-[#f4f1eb]">Your reservation is saved.</h3><p className="mt-4 text-[16px] leading-7 text-[#c1bdb5]">Thanks, {form.name}. <strong className="text-[#FFC247]">Reservation status: pending deposit.</strong> Deposit received status: not received — checkout is not implemented yet.</p><div className="mt-7 border-t border-white/15 pt-6"><p className="font-bold text-[#f4f1eb]">What happens next</p><p className="mt-2 text-sm leading-6 text-[#96928a]">The ready-for-connection handoff will confirm your preferred plan, approved deposit amount, opening timeline and how to complete the refundable deposit. We will not treat this as a completed sale.</p></div><a href={WHATSAPP_HREF} target="_blank" rel="noreferrer" className="text-link mt-7" data-testid="link-success-whatsapp"><MessageCircle size={16} /> Continue on WhatsApp <span className="text-[10px] text-[#6f6c65]">{WHATSAPP_NOTE}</span></a></div>}</div></div>
    </section>
  );
}

function Footer() {
  return <footer className="border-t border-white/10 bg-[#0a0a09] py-12"><div className="container-wide flex flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><Logo /><p className="mt-5 max-w-[340px] text-sm leading-6 text-[#77736d]">A workspace, content studio and growth team for people building something in City Centre, Raipur.</p></div><div className="text-left text-xs leading-6 text-[#77736d] sm:text-right"><p>Opening soon · 50 founding seats</p><p>Maximum 7 seats per client / founder / company</p><p className="mt-2">Phone: <a href={PHONE_HREF} className="text-[#FFC247]" data-testid="link-footer-phone">[ADD APPROVED PHONE]</a></p></div></div><div className="container-wide mt-10 border-t border-white/10 pt-5 text-[10px] uppercase tracking-[.13em] text-[#55514b]"><p>© {new Date().getFullYear()} Deven Cowork · Reservation handoff ready for connection</p></div></footer>;
}

function WhatsAppFloat() {
  return <a href={WHATSAPP_HREF} target="_blank" rel="noreferrer" className="fixed bottom-5 right-4 z-30 flex min-h-12 items-center gap-2 border border-[#FFC247] bg-[#0D0D0D] px-4 text-xs font-bold text-[#FFC247] shadow-[0_8px_30px_rgba(0,0,0,.35)] transition-transform hover:-translate-y-1 sm:right-5" data-testid="link-floating-whatsapp"><MessageCircle size={17} /><span className="hidden sm:inline">WhatsApp pre-booking</span></a>;
}

function Home() {
  const [reserveOpen, setReserveOpen] = useState(false);
  useEffect(() => {
    document.title = 'Deven Cowork — Reserve your founding seat';
    const description = 'Deven Cowork is opening soon in City Centre, Raipur. Reserve one of 50 founding seats with a refundable deposit.';
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) { tag = document.createElement('meta'); tag.setAttribute('name', 'description'); document.head.appendChild(tag); }
    tag.setAttribute('content', description);
  }, []);
  const scrollToReservation = () => {
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
    setReserveOpen(true);
  };
  return <div className="site-noise min-h-[100dvh] bg-[#0D0D0D]"><Header onReserve={scrollToReservation} /><main><Hero onReserve={scrollToReservation} /><TrustBar /><Problems /><Reframe /><ReserveBeforeOpening onReserve={scrollToReservation} /><OfferStack /><SpacePreview onReserve={scrollToReservation} /><StudioGrowth /><Pricing onReserve={scrollToReservation} /><RiskReversal onReserve={scrollToReservation} /><Scarcity /><FAQ /><Location /><Reservation /></main><Footer /><WhatsAppFloat />{reserveOpen && <span className="sr-only" aria-live="polite">Reservation form is in view.</span>}</div>;
}

function Router() {
  return <Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Router /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;