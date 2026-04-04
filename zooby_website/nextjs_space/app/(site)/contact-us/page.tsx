import { ContactForm } from './contact-form'

export default function ContactUsPage() {
  return (
    <main className="bg-white">
      <section className="bg-homeguard-teal text-white py-14 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">Request a quote</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight mt-3">
              Tell us about the project and we&apos;ll route it to the right HomeGuard Pro specialist.
            </h1>
            <p className="mt-4 max-w-2xl text-base md:text-lg leading-7 text-white/85">
              Use this form to request roofing or painting help. We&apos;ll review the details, confirm the right next step, and follow up with a clear plan.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h2 className="font-display text-2xl font-bold text-navy">Share a few details</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This helps us triage the request quickly and get the right person on it without a long back-and-forth.
              </p>
            </div>

            <ContactForm />
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-homeguard-purple">What happens next</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>We review the request and assign it to the right service team.</li>
              <li>Urgent roofing jobs are prioritized for faster contact.</li>
              <li>If needed, you&apos;ll get a booking link or appointment confirmation next.</li>
            </ul>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-navy">Good to know</p>
              <p className="mt-2 leading-6">
                This demo intake is tied to the internal lead inbox, so you can see the workflow from public request to follow-up in one place.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
