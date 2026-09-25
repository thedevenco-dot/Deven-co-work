import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Check, MessageCircle, ArrowLeft, Landmark, Calendar, BadgeCheck, FileText } from 'lucide-react';
import { trackPixelEvent } from '@/lib/metaPixel';

export default function ThankYou() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState(null);
  const [trialDates, setTrialDates] = useState(null);

  useEffect(() => {
    document.title = 'Deven Cowork — Booking Confirmed';
    const saved = localStorage.getItem('last_reservation');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    
    const tStart = sessionStorage.getItem('trialStartDate');
    const tEnd = sessionStorage.getItem('trialEndDate');
    if (tStart && tEnd) {
      setTrialDates({ start: tStart, end: tEnd });
    }
  }, []);

  const isFreeTrial = data?.type === 'FREE_TRIAL' || data?.isLead;

  // Prefilled WhatsApp message
  const waMessage = data?.name
    ? `Hi, I'm ${data.name}. My pre-booking details are submitted on Deven Cowork.`
    : `Hi, my pre-booking details are submitted on Deven Cowork.`;
  const waHref = `https://wa.me/916260582852?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="site-noise min-h-screen bg-[#FCFAF9] text-[#0C0C0C] flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-[rgba(252,250,249,0.16)] bg-[#024E5C] h-[72px] flex items-center">
        <div className="container-wide flex items-center justify-between">
          <div className="logo text-[#FCFAF9] flex items-center gap-3">
            <span className="logo-mark" aria-hidden="true" style={{ borderColor: '#FCFAF9' }}><span style={{ backgroundColor: '#FCFAF9' }} /><span style={{ backgroundColor: '#FCFAF9' }} /></span>
            <div className="flex flex-col">
              <span className="font-display text-[21px] tracking-[.02em] leading-none text-[#FCFAF9]">DEVEN</span>
              <span className="mt-[3px] text-[9px] font-bold tracking-[.18em] text-[#FCFAF9]/75 leading-none">COWORK</span>
            </div>
          </div>
          <button
            onClick={() => setLocation('/')}
            className="button px-4 py-2 text-[10.5px] border border-[rgba(252,250,249,0.3)] text-[#FCFAF9] hover:bg-[#FCFAF9] hover:text-[#024E5C] flex items-center gap-2 rounded-none transition-colors"
          >
            <ArrowLeft size={14} /> Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-16 flex-grow flex items-center justify-center">
        <div className="max-w-xl w-full border border-[rgba(2,78,92,0.2)] bg-white p-8 sm:p-12 space-y-8 shadow-sm">
          
          {/* Status Indicator */}
          <div className="flex h-14 w-14 items-center justify-center border border-[#04B8BB] text-[#04B8BB] rounded-none bg-[#04B8BB]/10">
            <Check size={28} />
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <div className="eyebrow flex items-center gap-3 text-[#04B8BB] uppercase text-[10px] tracking-widest font-bold">
              <span className="h-px w-8 bg-[#04B8BB]" /> 
              {isFreeTrial ? 'Free Trial Registered' : 'Founding Member Seat Reserved'}
            </div>
            <h1 className="font-display text-3xl md:text-[40px] font-bold leading-[1.05] tracking-wider text-[#0C0C0C] uppercase">
              {isFreeTrial ? 'Your Free Trial is Booked.' : 'Reservation Confirmed'}
            </h1>
          </div>

          {/* Dynamic Card Body */}
          {data ? (
            isFreeTrial ? (
              /* FREE TRIAL STATE */
              <div className="space-y-6">
                <div className="border-y border-[rgba(2,78,92,0.15)] py-6 space-y-4 text-sm text-[#0C0C0C]/75">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <strong className="text-[#0C0C0C]">{data.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <strong className="text-[#0C0C0C]">{data.phone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <strong className="text-[#0C0C0C]">{data.email || 'N/A'}</strong>
                  </div>
                  {trialDates && (
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> Scheduled Dates:</span>
                      <strong className="text-[#0C0C0C]">
                        {new Date(trialDates.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} &amp; {new Date(trialDates.end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Trial Status:</span>
                    <strong className="text-[#04B8BB] font-bold uppercase tracking-wider text-[10px] bg-[#04B8BB]/10 border border-[#04B8BB]/20 px-2 py-0.5">
                      Request Received
                    </strong>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm leading-6 text-[#0C0C0C]/70">
                    Thanks for booking your free trial. Our team will call you shortly to confirm your visit and guide you through the next steps.
                  </p>
                  <button
                    onClick={() => setLocation('/')}
                    className="button button-primary w-full justify-center"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            ) : (
              /* PAID RESERVATION STATE */
              <div className="space-y-6">
                <div className="border-y border-[rgba(2,78,92,0.15)] py-6 space-y-4 text-sm text-[#0C0C0C]/75">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-[#04B8BB]" /> Reservation ID:</span>
                    <strong className="text-[#0C0C0C] font-mono">{data.razorpayOrderId || `DEV-${data._id?.slice(-6).toUpperCase()}`}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Selected Seat(s):</span>
                    <strong className="text-[#04B8BB] font-mono">
                      {data.seatNumbers ? data.seatNumbers.join(', ') : 'None selected'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Deposit:</span>
                    <strong className="text-[#0C0C0C] font-bold">
                      ₹{(data.amount || 1000).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> Joining Date:</span>
                    <strong className="text-[#0C0C0C]">{data.joiningDate || '15 September 2026'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <strong className="text-[#0C0C0C]">{data.email || 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 text-[#0C0C0C]/60">
                    <span className="flex items-center gap-1.5"><Landmark size={12} /> Landmark Location:</span>
                    <span className="text-right max-w-[280px]">VIP Estate, A1, VIP Colony, Shankar Nagar, Raipur</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-[#22c55e]/20 bg-[#22c55e]/5 p-3 text-xs text-[#22c55e] flex items-center gap-2">
                    <FileText size={14} />
                    <span>Your seat has been reserved. Your invoice has been sent to your email.</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setLocation('/')}
                      className="button button-outline-dark justify-center flex-1"
                    >
                      Back to Home
                    </button>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackPixelEvent('Lead', { content_name: 'WhatsApp' })}
                      className="button justify-center flex-1 gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-[#0C0C0C] font-bold border border-[#20bd5a]"
                    >
                      <MessageCircle size={16} /> WhatsApp Support
                    </a>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[#0C0C0C]/70">
                Thank you for reserving your seats. We are locking in your preferences.
              </p>
              <button
                onClick={() => setLocation('/')}
                className="button button-primary w-full justify-center"
              >
                Back to Home
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(12,12,12,0.12)] bg-[#0C0C0C] py-8 text-center text-xs text-[#FCFAF9]/70">
        <div className="container-wide">
          <p>Â© {new Date().getFullYear()} Deven Cowork Â· Pre-launch Pre-booking Confirmation</p>
        </div>
      </footer>
    </div>
  );
}

