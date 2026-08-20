import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Check, MessageCircle, ArrowLeft, Landmark, Calendar, BadgeCheck, FileText } from 'lucide-react';

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
    <div className="site-noise min-h-screen bg-[#000000] text-[#F1F1F1] flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-[#242424] bg-[#000000] h-[72px] flex items-center">
        <div className="container-wide flex items-center justify-between">
          <div className="logo text-[#F1F1F1]">
            <span className="logo-mark" aria-hidden="true"><span /><span /></span>
            <span className="font-display text-[21px] tracking-[.02em]">DEVEN</span>
            <span className="mt-[3px] text-[9px] font-bold tracking-[.18em] text-[#A3A3A3]">COWORK</span>
          </div>
          <button
            onClick={() => setLocation('/')}
            className="button button-outline button-small gap-2"
          >
            <ArrowLeft size={14} /> Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-16 flex-grow flex items-center justify-center">
        <div className="max-w-xl w-full border border-[#242424] bg-[#0A0A0A] p-8 sm:p-12 space-y-8">
          
          {/* Status Indicator */}
          <div className="flex h-14 w-14 items-center justify-center border border-[#FFC400] text-[#FFC400] rounded-none">
            <Check size={28} />
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <div className="eyebrow flex items-center gap-3 text-[#FFC400] uppercase text-[10px] tracking-widest font-bold">
              <span className="h-px w-8 bg-[#FFC400]" /> 
              {isFreeTrial ? 'Free Trial Registered' : 'Founding Member Seat Reserved'}
            </div>
            <h1 className="font-display text-3xl md:text-[40px] font-bold leading-[1.05] tracking-wider text-[#F1F1F1] uppercase">
              {isFreeTrial ? 'Your Free Trial is Booked.' : 'Reservation Confirmed'}
            </h1>
          </div>

          {/* Dynamic Card Body */}
          {data ? (
            isFreeTrial ? (
              /* FREE TRIAL STATE */
              <div className="space-y-6">
                <div className="border-y border-[#242424] py-6 space-y-4 text-sm text-[#b5b1a7]">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <strong className="text-white">{data.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <strong className="text-white">{data.phone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <strong className="text-white">{data.email || 'N/A'}</strong>
                  </div>
                  {trialDates && (
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> Scheduled Dates:</span>
                      <strong className="text-white">
                        {new Date(trialDates.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} &amp; {new Date(trialDates.end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Trial Status:</span>
                    <strong className="text-[#FFC400] font-bold uppercase tracking-wider text-[10px] bg-[#FFC400]/10 border border-[#FFC400]/20 px-2 py-0.5">
                      Request Received
                    </strong>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm leading-6 text-[#96928a]">
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
                <div className="border-y border-[#242424] py-6 space-y-4 text-sm text-[#b5b1a7]">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-[#FFC400]" /> Reservation ID:</span>
                    <strong className="text-white font-mono">{data.razorpayOrderId || `DEV-${data._id?.slice(-6).toUpperCase()}`}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Selected Seat(s):</span>
                    <strong className="text-[#FFC400] font-mono">
                      {data.seatNumbers ? data.seatNumbers.join(', ') : 'None selected'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Deposit:</span>
                    <strong className="text-white font-bold">
                      ₹{(data.amount || 1000).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> Joining Date:</span>
                    <strong className="text-white">{data.joiningDate || '15 September 2026'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <strong className="text-white">{data.email || 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 text-[#A3A3A3]">
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
                      className="button button-outline justify-center flex-1"
                    >
                      Back to Home
                    </button>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noreferrer"
                      className="button button-primary justify-center flex-1 gap-2"
                    >
                      <MessageCircle size={16} /> WhatsApp Support
                    </a>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[#A3A3A3]">
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
      <footer className="border-t border-[#242424] bg-[#0A0A0A] py-8 text-center text-xs text-[#A3A3A3]">
        <div className="container-wide">
          <p>© {new Date().getFullYear()} Deven Cowork · Pre-launch Pre-booking Confirmation</p>
        </div>
      </footer>
    </div>
  );
}
