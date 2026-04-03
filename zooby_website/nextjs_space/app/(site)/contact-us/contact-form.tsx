'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2, Clock3, Loader2, Send, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    zipCode: '',
    email: '',
    phone: '',
    contactMethod: 'call',
    contactTime: 'anytime',
    message: '',
    agreedToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!formData?.agreedToTerms) {
      const message = 'Please agree to the terms and conditions.';
      setSubmitError(message);
      toast.error(message);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const payload = await res.json().catch(() => ({}));
      if (res?.ok) {
        setSubmittedLeadId(payload?.id ?? '');
        setSubmitted(true);
        toast.success(payload?.message ?? 'Thank you! We\'ll be in touch soon.');
      } else {
        const message = payload?.error ?? 'Something went wrong. Please try again.';
        setSubmitError(message);
        toast.error(message);
      }
    } catch (err: any) {
      console.error('Form submission error:', err);
      const message = 'Failed to submit. Please try again.';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-6 py-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="text-emerald-700" size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Submission complete</p>
                <h2 className="font-display text-2xl font-bold text-navy">We’ve received your request</h2>
              </div>
            </div>

            <p className="text-sm leading-6 text-slate-700">
              Thanks for reaching out. Your request is now in our lead queue and will be reviewed by the HomeGuard Pro team.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Reference ID</p>
                <p className="mt-1 font-mono text-sm font-semibold text-navy">{submittedLeadId || 'Pending'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">What happens next</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">We’ll review the details, confirm fit, and reach out with the next step.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Expected timing</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">Usually within 1 business hour during the day.</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/70 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 text-homeguard-teal" size={18} />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-navy">Your request is in good hands</p>
                  <p className="text-sm leading-6 text-slate-600">
                    If your project needs an inspection or booking link, we’ll send it after the initial review. For urgent roofing issues, we’ll prioritize a same-day response when possible.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-navy">
              <Clock3 size={16} className="text-homeguard-purple" />
              Next steps
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>We’ll verify the request and route it to the right specialist.</li>
              <li>If booking is needed, we’ll send a secure scheduling link.</li>
              <li>Once scheduled, you’ll receive a confirmation with appointment details.</li>
            </ul>

            <div className="mt-5 space-y-3">
              <Link
                href="/contact-us"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-homeguard-purple/20 bg-homeguard-purple/5 px-4 py-3 text-sm font-semibold text-homeguard-purple transition hover:bg-homeguard-purple/10"
              >
                Submit another request
              </Link>
              <Link
                href="/roof-replacement"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-homeguard-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-homeguard-purple-dark"
              >
                Continue to booking
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-6 text-xs text-slate-500">
          Lead ID: {submittedLeadId || 'Pending'} · We’ll never share your information with third parties.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {submitError}
        </div>
      ) : null}
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1">Name <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input type="text" placeholder="First Name" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-homeguard-purple focus:border-transparent outline-none" value={formData?.firstName ?? ''} onChange={(e: any) => setFormData({ ...(formData ?? {}), firstName: e?.target?.value ?? '' })} />
            <span className="text-xs text-gray-500 mt-1">First Name</span>
          </div>
          <div>
            <input type="text" placeholder="Last Name" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-homeguard-purple focus:border-transparent outline-none" value={formData?.lastName ?? ''} onChange={(e: any) => setFormData({ ...(formData ?? {}), lastName: e?.target?.value ?? '' })} />
            <span className="text-xs text-gray-500 mt-1">Last Name</span>
          </div>
        </div>
      </div>

      {/* Zip Code */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1">Zip Code <span className="text-red-500">*</span></label>
        <input type="text" placeholder="e.g., 12345" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-homeguard-purple focus:border-transparent outline-none" value={formData?.zipCode ?? ''} onChange={(e: any) => setFormData({ ...(formData ?? {}), zipCode: e?.target?.value ?? '' })} />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1">Email <span className="text-red-500">*</span></label>
        <input type="email" placeholder="example@example.com" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-homeguard-purple focus:border-transparent outline-none" value={formData?.email ?? ''} onChange={(e: any) => setFormData({ ...(formData ?? {}), email: e?.target?.value ?? '' })} />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1">Phone Number <span className="text-red-500">*</span></label>
        <input type="tel" placeholder="(000) 000-0000" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-homeguard-purple focus:border-transparent outline-none" value={formData?.phone ?? ''} onChange={(e: any) => setFormData({ ...(formData ?? {}), phone: e?.target?.value ?? '' })} />
      </div>

      {/* Contact Method */}
      <div>
        <label className="block text-sm font-medium text-navy mb-2">Would you prefer call or text? <span className="text-red-500">*</span></label>
        <div className="flex gap-4">
          {['call', 'text'].map((method: string) => (
            <label key={method} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="contactMethod" value={method} checked={formData?.contactMethod === method} onChange={(e: any) => setFormData({ ...(formData ?? {}), contactMethod: e?.target?.value ?? 'call' })} className="accent-homeguard-purple" />
              <span className="text-sm text-gray-700 capitalize">{method === 'text' ? 'Text Only' : 'Call'}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={formData?.agreedToTerms ?? false} onChange={(e: any) => setFormData({ ...(formData ?? {}), agreedToTerms: e?.target?.checked ?? false })} className="accent-homeguard-purple mt-1" />
          <span className="text-xs text-gray-600">I agree to terms & conditions. By checking this box, I agree to receive text messages from HomeGuard Pro Services regarding appointments, services, promotions, and updates. Message frequency varies. Message & data rates may apply. Reply STOP to cancel. Reply HELP for help.</span>
        </label>
      </div>

      {/* Best Time */}
      <div>
        <label className="block text-sm font-medium text-navy mb-2">When is the best time to contact you? <span className="text-red-500">*</span></label>
        <div className="flex flex-wrap gap-3">
          {['morning', 'afternoon', 'evening', 'anytime'].map((time: string) => (
            <label key={time} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="contactTime" value={time} checked={formData?.contactTime === time} onChange={(e: any) => setFormData({ ...(formData ?? {}), contactTime: e?.target?.value ?? 'anytime' })} className="accent-homeguard-purple" />
              <span className="text-sm text-gray-700 capitalize">{time}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1">Please tell us how HomeGuard Pro can help <span className="text-red-500">*</span></label>
        <textarea rows={4} required placeholder="Describe your project or question..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-homeguard-purple focus:border-transparent outline-none resize-none" value={formData?.message ?? ''} onChange={(e: any) => setFormData({ ...(formData ?? {}), message: e?.target?.value ?? '' })} />
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading} className="w-full bg-homeguard-purple hover:bg-homeguard-purple-dark text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50">
        {loading ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : <><Send size={18} /> Click here so HomeGuard Pro can help</>}
      </button>

      <p className="text-xs text-gray-500 text-center">Your information is kept private and secure. We will never share your data with third parties.</p>
    </form>
  );
}
