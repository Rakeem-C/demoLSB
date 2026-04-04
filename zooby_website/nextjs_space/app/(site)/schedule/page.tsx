import Link from 'next/link'
import { COMPANY } from '@/lib/constants'
import { ArrowRight, CalendarCheck2, Phone, ShieldCheck } from 'lucide-react'

export default function SchedulePage({ searchParams }: { searchParams: { lead?: string } }) {
  const leadId = searchParams?.lead ?? ''

  return (
    <main className="bg-white">
      <section className="bg-homeguard-teal text-white py-14 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">Scheduling handoff</p>
            <h1 className="font-display mt-3 text-3xl font-bold leading-tight md:text-5xl">
              Your request is in motion.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 md:text-lg">
              A team member will text you shortly to confirm details and scheduling. If you want to move faster, use the options below to continue the handoff.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto grid gap-8 px-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CalendarCheck2 size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-homeguard-purple">Lead reference</p>
                <p className="font-mono text-sm font-semibold text-navy">{leadId || 'Pending'}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-navy">Step 1</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">We confirm the request and make sure the right specialist has it.</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-navy">Step 2</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">We text to confirm timing, access, and any inspection details.</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-navy">Step 3</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">You receive the appointment details and the workflow moves to booked.</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 text-emerald-700" size={18} />
                <p className="text-sm leading-6 text-slate-700">
                  This is a live demo handoff, not a dead end. If the job is urgent, call now and we&apos;ll prioritize the next available slot.
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-navy">
              <Phone size={16} className="text-homeguard-purple" />
              Need help now?
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Reach the HomeGuard Pro team directly and we&apos;ll help you move the request forward.
            </p>

            <a
              href={COMPANY.phoneTel}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-homeguard-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-homeguard-purple-dark"
            >
              Call {COMPANY.phone}
              <ArrowRight size={16} />
            </a>

            <Link
              href="/contact-us"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-homeguard-purple/20 bg-homeguard-purple/5 px-4 py-3 text-sm font-semibold text-homeguard-purple transition hover:bg-homeguard-purple/10"
            >
              Back to request form
            </Link>
          </aside>
        </div>
      </section>
    </main>
  )
}
