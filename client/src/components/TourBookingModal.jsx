import { useState } from 'react';
import { useLocation } from 'wouter';
import { X, Calendar, Clock, Users, Mail, Phone, User, CheckCircle2, ChevronRight } from 'lucide-react';
import { api } from '@/services/api';
import { trackPixelEvent } from '@/lib/metaPixel';

export default function TourBookingModal({ isOpen, onClose, utm = {} }) {
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
  const [showOptional, setShowOptional] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const updateField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!form.phone.trim() || form.phone.trim().length < 8) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        numberOfPeople: parseInt(form.numberOfPeople, 10) || 1,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        message: form.message.trim(),
        email_confirm: form.email_confirm || '',
        utmSource: utm.source || '',
        utmMedium: utm.medium || '',
        utmCampaign: utm.campaign || '',
      };

      const res = await api.bookTour(payload);

      if (res.success && res.data) {
        trackPixelEvent('Lead', { content_name: 'Book Your Tour Form' });
        trackPixelEvent('Schedule');

        localStorage.setItem(
          'last_reservation',
          JSON.stringify({
            ...res.data,
            type: 'TOUR',
          })
        );

        sessionStorage.setItem('tourPopupShown', 'true');

        if (typeof onClose === 'function') {
          onClose();
        }

        setLocation('/thank-you');
      } else {
        setError(res.message || 'Could not submit tour request. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Unable to complete request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0F0F10] border border-[#222224] text-[#FCFAF9] p-6 sm:p-7 rounded-2xl shadow-2xl my-6">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-6">
          <span className="inline-block text-[10px] font-bold tracking-widest text-[#04B8BB] uppercase mb-1">
            Free Guided Visit
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            BOOK YOUR TOUR
          </h2>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            Experience Deven Co-Work in person. No commitments or payment required.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot */}
          <input
            type="text"
            name="email_confirm"
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
            value={form.email_confirm}
            onChange={(e) => updateField('email_confirm', e.target.value)}
          />

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-[#1A1A1C] border border-[#2B2B2E] text-white placeholder-neutral-500 pl-10 pr-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:border-[#04B8BB] focus:ring-1 focus:ring-[#04B8BB] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-[#1A1A1C] border border-[#2B2B2E] text-white placeholder-neutral-500 pl-10 pr-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:border-[#04B8BB] focus:ring-1 focus:ring-[#04B8BB] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Email & Team Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="email"
                  placeholder="rahul@company.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-[#1A1A1C] border border-[#2B2B2E] text-white placeholder-neutral-500 pl-10 pr-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:border-[#04B8BB] focus:ring-1 focus:ring-[#04B8BB] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Number of People
              </label>
              <div className="relative">
                <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <select
                  value={form.numberOfPeople}
                  onChange={(e) => updateField('numberOfPeople', e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#1A1A1C] border border-[#2B2B2E] text-white pl-10 pr-8 py-2.5 text-xs rounded-lg focus:outline-none focus:border-[#04B8BB] focus:ring-1 focus:ring-[#04B8BB] transition-all appearance-none"
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 - 4 People</option>
                  <option value="5">5 - 10 People</option>
                  <option value="10">10+ People / Team</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Preferred Date
              </label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                <input
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) => updateField('preferredDate', e.target.value)}
                  disabled={loading}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-[#1A1A1C] border border-[#2B2B2E] text-white pl-10 pr-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:border-[#04B8BB] focus:ring-1 focus:ring-[#04B8BB] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Preferred Slot
              </label>
              <div className="relative">
                <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                <select
                  value={form.preferredTime}
                  onChange={(e) => updateField('preferredTime', e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#1A1A1C] border border-[#2B2B2E] text-white pl-10 pr-8 py-2.5 text-xs rounded-lg focus:outline-none focus:border-[#04B8BB] focus:ring-1 focus:ring-[#04B8BB] transition-all appearance-none"
                >
                  <option value="Morning (10 AM - 1 PM)">Morning (10 AM - 1 PM)</option>
                  <option value="Afternoon (1 PM - 5 PM)">Afternoon (1 PM - 5 PM)</option>
                  <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Optional Details Accordion Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="text-xs text-[#04B8BB] hover:underline font-medium flex items-center gap-1 focus:outline-none"
            >
              <ChevronRight size={14} className={`transition-transform duration-200 ${showOptional ? 'rotate-90' : ''}`} />
              {showOptional ? 'Hide optional details' : '+ Add company or specific requirements'}
            </button>
          </div>

          {showOptional && (
            <div className="space-y-3.5 pt-1 animate-fadeIn">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Company / Project Name
                </label>
                <input
                  type="text"
                  placeholder="Acme Corp / Tech Studio"
                  value={form.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#1A1A1C] border border-[#2B2B2E] text-white placeholder-neutral-500 px-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:border-[#04B8BB] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Specific Requirements
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Private cabin enquiry, podcast studio tour..."
                  value={form.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#1A1A1C] border border-[#2B2B2E] text-white placeholder-neutral-500 px-3.5 py-2 text-xs rounded-lg focus:outline-none focus:border-[#04B8BB] transition-all"
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-950/70 border border-red-500/50 text-red-300 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#04B8BB] hover:bg-[#039da0] text-[#0C0C0C] font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#04B8BB]/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> BOOK YOUR TOUR
                </>
              )}
            </button>
          </div>

          <p className="text-[10.5px] text-neutral-400 text-center tracking-wider uppercase font-semibold pt-1">
            100% Free · No credit card required · Team guided visit
          </p>
        </form>
      </div>
    </div>
  );
}
