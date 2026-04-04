'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle2, Clock3, Loader2, Send, ShieldCheck, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { COMPANY } from '@/lib/constants'

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
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedLeadId, setSubmittedLeadId] = useState('')
  const [scheduleUrl, setScheduleUrl] = useState('/schedule')
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (!formData?.agreedToTerms) {
      const message = 'Please agree to the terms and conditions.'
      setSubmitError(message)
      toast.error(message)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const payload = await res.json().catch(() => ({}))

      if (res?.ok) {
        const leadId = payload?.id ?? ''
        setSubmittedLeadId(leadId)
        setScheduleUrl(payload?.scheduleUrl ?? `/schedule?lead=${encodeURIComponent(leadId)}`)
        setSubmitted(true)
        toast.success(payload?.message ?? 'Thanks - your request has been received.')
      } else {
        const message = payload?.error ?? 'Something went wrong. Please try again.'
        setSubmitError(message)
        toast.error(message)
      }
    } catch (err: any) {
      console.error('Form submission error:', err)
      const message = 'Failed to submit. Please try again.'
      setSubmitError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

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
                <h2 className="font-display text-2xl font-bold text-navy">Thanks - your request has been received</h2>
              </div>
            </div>

            <p className="text-sm leading-6 text-slate-700">
              A team member will text you shortly to confirm details and scheduling.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Reference ID</p>
                <p className="mt-1 font-mono text-sm font-semibold text-navy">{submittedLeadId || 'Pending'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">What happens next</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  We&apos;ll confirm the details, set the right next step, and keep scheduling moving.
                </p>
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
                    If your project needs an inspection or a booking handoff, we&apos;ll send the next step after the initial review. For urgent roofing issues, we&apos;ll prioritize a same-day response when possible.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-navy">
              <Clock3 size={16} className="text-homeguard-purple" />
              Scheduling handoff
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>We&apos;ll verify the request and route it to the right specialist.</li>
              <li>If a visit is needed, we&apos;ll move you into the scheduling handoff.</li>
              <li>You&apos;ll receive confirmation with the appointment details once it&apos;s set.</li>
            </ul>

            <div className="mt-5 space-y-3">
              <Link
                href="/contact-us"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-homeguard-purple/20 bg-homeguard-purple/5 px-4 py-3 text-sm font-semibold text-homeguard-purple transition hover:bg-homeguard-purple/10"
              >
                Submit another request
              </Link>
              <Link
                href={scheduleUrl}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-homeguard-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-homeguard-purple-dark"
              >
                Continue to scheduling
                <ArrowRight size={16} />
              </Link>
              <a
                href={COMPANY.phoneTel}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-navy transition hover:bg-slate-50"
              >
                Call {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>
        <p className="mt-6 text-xs text-slate-500">
          Lead ID: {submittedLeadId || 'Pending'} · We&apos;ll never share your information with third parties.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {submitError}
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-medium text-navy">
          Name <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              placeholder="First Name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-homeguard-purple"
              value={formData?.firstName ?? ''}
              onChange={(e: any) => setFormData({ ...(formData ?? {}), firstName: e?.target?.value ?? '' })}
            />
            <span className="mt-1 text-xs text-gray-500">First Name</span>
          </div>
          <div>
            <input
              type="text"
              placeholder="Last Name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-homeguard-purple"
              value={formData?.lastName ?? ''}
              onChange={(e: any) => setFormData({ ...(formData ?? {}), lastName: e?.target?.value ?? '' })}
            />
            <span className="mt-1 text-xs text-gray-500">Last Name</span>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-navy">
          Zip Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g., 12345"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-homeguard-purple"
          value={formData?.zipCode ?? ''}
          onChange={(e: any) => setFormData({ ...(formData ?? {}), zipCode: e?.target?.value ?? '' })}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-navy">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          placeholder="example@example.com"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-homeguard-purple"
          value={formData?.email ?? ''}
          onChange={(e: any) => setFormData({ ...(formData ?? {}), email: e?.target?.value ?? '' })}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-navy">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          placeholder="(000) 000-0000"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-homeguard-purple"
          value={formData?.phone ?? ''}
          onChange={(e: any) => setFormData({ ...(formData ?? {}), phone: e?.target?.value ?? '' })}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-navy">
          Would you prefer call or text? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          {['call', 'text'].map((method: string) => (
            <label key={method} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="contactMethod"
                value={method}
                checked={formData?.contactMethod === method}
                onChange={(e: any) => setFormData({ ...(formData ?? {}), contactMethod: e?.target?.value ?? 'call' })}
                className="accent-homeguard-purple"
              />
              <span className="text-sm capitalize text-gray-700">{method === 'text' ? 'Text Only' : 'Call'}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-navy">
          When is the best time to contact you? <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {['morning', 'afternoon', 'evening', 'anytime'].map((time: string) => (
            <label key={time} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="contactTime"
                value={time}
                checked={formData?.contactTime === time}
                onChange={(e: any) => setFormData({ ...(formData ?? {}), contactTime: e?.target?.value ?? 'anytime' })}
                className="accent-homeguard-purple"
              />
              <span className="text-sm capitalize text-gray-700">{time}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-navy">
          Please tell us how HomeGuard Pro can help <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          required
          placeholder="Describe your project or question..."
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-homeguard-purple"
          value={formData?.message ?? ''}
          onChange={(e: any) => setFormData({ ...(formData ?? {}), message: e?.target?.value ?? '' })}
        />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={formData?.agreedToTerms ?? false}
            onChange={(e: any) => setFormData({ ...(formData ?? {}), agreedToTerms: e?.target?.checked ?? false })}
            className="mt-1 accent-homeguard-purple"
          />
          <span className="text-xs text-gray-600">
            I agree to terms and conditions. By checking this box, I agree to receive text messages from HomeGuard Pro Services regarding appointments, services, promotions, and updates. Message frequency varies. Message and data rates may apply. Reply STOP to cancel. Reply HELP for help.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-homeguard-purple py-3 font-semibold text-white transition hover:bg-homeguard-purple-dark disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send size={18} />
            Send request to HomeGuard Pro
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        Your information is kept private and secure. We will never share your data with third parties.
      </p>
    </form>
  )
}
