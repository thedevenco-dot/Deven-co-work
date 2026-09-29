import { useState } from 'react';
import { useLocation } from 'wouter';
import { X, Calendar, Clock, Users, Building, Mail, Phone, User, CheckCircle2 } from 'lucide-react';
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

        // Save to local storage for thank you page
        localStorage.setItem(
          'last_reservation',
          JSON.stringify({
            ...res.data,
            type: 'TOUR',
          })
        );

        // Mark tour as completed in session storage so auto popup stops
        sessionStorage.setItem('tourPopupShown', 'true');

        if (typeof onClose === 'function') {
          onClose();
        }

        setLocation('/thank-you');
      } else {
        setError(res.message || 'Could not submit tour request. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Unable to complete your request. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0C0C0C] border border-[#024E5C] text-[#FCFAF9] p-6 sm:p-8 rounded-none shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 text-[#FCFAF9]/60 hover:text-[#04B8BB] transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 mb-6">
          <div className="eyebrow flex items-center gap-2 text-[#04B8BB] text-[10px] tracking-widest uppercase font-bold">
            <span className="h-px w-6 bg-[#04B8BB]" />
            Experience Deven Co-Work
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FCFAF9]">
            BOOK YOUR TOUR
          </h2>
          <p className="text-xs sm:text-sm text-[#FCFAF9]/75 leading-relaxed">
            Come see Deven Co-Work in person. Book a free tour and experience the space before you decide.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="field-label">
              <span className="flex items-center gap-1.5 text-xs text-[#FCFAF9]/90 font-medium">
                <User size={13} className="text-[#04B8BB]" /> Full Name *
              </span>
              <input
                type="text"
                placeholder="Rahul Sharma"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                disabled={loading}
                className="w-full bg-[#121212] border border-[rgba(252,250,249,0.2)] text-[#FCFAF9] p-3 text-xs focus:outline-none focus:border-[#04B8BB] transition-colors"
              />
            </label>

            <label className="field-label">
              <span className="flex items-center gap-1.5 text-xs text-[#FCFAF9]/90 font-medium">
                <Phone size={13} className="text-[#04B8BB]" /> Phone Number *
              </span>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                required
                disabled={loading}
                className="w-full bg-[#121212] border border-[rgba(252,250,249,0.2)] text-[#FCFAF9] p-3 text-xs focus:outline-none focus:border-[#04B8BB] transition-colors"
              />
            </label>
          </div>

          {/* Email */}
          <label className="field-label">
            <span className="flex items-center gap-1.5 text-xs text-[#FCFAF9]/90 font-medium">
              <Mail size={13} className="text-[#04B8BB]" /> Email Address *
            </span>
            <input
              type="email"
              placeholder="rahul@company.com"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
              disabled={loading}
              className="w-full bg-[#121212] border border-[rgba(252,250,249,0.2)] text-[#FCFAF9] p-3 text-xs focus:outline-none focus:border-[#04B8BB] transition-colors"
            />
          </label>

          {/* Company & People */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="field-label">
              <span className="flex items-center gap-1.5 text-xs text-[#FCFAF9]/90 font-medium">
                <Building size={13} className="text-[#04B8BB]" /> Company / Project (Optional)
              </span>
              <input
                type="text"
                placeholder="Acme Corp / Tech Studio"
                value={form.company}
                onChange={(e) => updateField('company', e.target.value)}
                disabled={loading}
                className="w-full bg-[#121212] border border-[rgba(252,250,249,0.2)] text-[#FCFAF9] p-3 text-xs focus:outline-none focus:border-[#04B8BB] transition-colors"
              />
            </label>

            <label className="field-label">
              <span className="flex items-center gap-1.5 text-xs text-[#FCFAF9]/90 font-medium">
                <Users size={13} className="text-[#04B8BB]" /> Number of People
              </span>
              <select
                value={form.numberOfPeople}
                onChange={(e) => updateField('numberOfPeople', e.target.value)}
                disabled={loading}
                className="w-full bg-[#121212] border border-[rgba(252,250,249,0.2)] text-[#FCFAF9] p-3 text-xs focus:outline-none focus:border-[#04B8BB] transition-colors"
              >
                <option value="1">1 Person</option>
                <option value="2">2 - 4 People</option>
                <option value="5">5 - 10 People</option>
                <option value="10">10+ People / Team</option>
              </select>
            </label>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="field-label">
              <span className="flex items-center gap-1.5 text-xs text-[#FCFAF9]/90 font-medium">
                <Calendar size={13} className="text-[#04B8BB]" /> Preferred Date
              </span>
              <input
                type="date"
                value={form.preferredDate}
                onChange={(e) => updateField('preferredDate', e.target.value)}
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-[#121212] border border-[rgba(252,250,249,0.2)] text-[#FCFAF9] p-3 text-xs focus:outline-none focus:border-[#04B8BB] transition-colors"
              />
            </label>

            <label className="field-label">
              <span className="flex items-center gap-1.5 text-xs text-[#FCFAF9]/90 font-medium">
                <Clock size={13} className="text-[#04B8BB]" /> Preferred Slot
              </span>
              <select
                value={form.preferredTime}
                onChange={(e) => updateField('preferredTime', e.target.value)}
                disabled={loading}
                className="w-full bg-[#121212] border border-[rgba(252,250,249,0.2)] text-[#FCFAF9] p-3 text-xs focus:outline-none focus:border-[#04B8BB] transition-colors"
              >
                <option value="Morning (10 AM - 1 PM)">Morning (10 AM - 1 PM)</option>
                <option value="Afternoon (1 PM - 5 PM)">Afternoon (1 PM - 5 PM)</option>
                <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
              </select>
            </label>
          </div>

          {/* Special Requirements / Message */}
          <label className="field-label">
            <span className="text-xs text-[#FCFAF9]/90 font-medium">Any specific workspace requirement? (Optional)</span>
            <textarea
              rows={2}
              placeholder="e.g. Interested in private cabin, podcast studio tour, dedicated desks..."
              value={form.message}
              onChange={(e) => updateField('message', e.target.value)}
              disabled={loading}
              className="w-full bg-[#121212] border border-[rgba(252,250,249,0.2)] text-[#FCFAF9] p-3 text-xs focus:outline-none focus:border-[#04B8BB] transition-colors"
            />
          </label>

          {/* Error display */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 text-xs rounded-none">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="button button-primary w-full py-4 text-xs font-bold uppercase tracking-widest justify-center gap-2 mt-2 disabled:opacity-50"
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

          <p className="text-[10px] text-[#FCFAF9]/50 text-center tracking-wider uppercase font-semibold mt-2">
            100% Free · No Credit Card Required · Team Guided Visit
          </p>
        </form>
      </div>
    </div>
  );
}
