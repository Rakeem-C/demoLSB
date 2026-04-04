import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Briefcase, CheckCircle2, Clock3, FileText, Globe2, Hammer, House, ShieldCheck, Star } from 'lucide-react'
import { COMPANY, NEIGHBORHOODS } from '@/lib/constants'

type PageKind = 'service' | 'about' | 'blog' | 'careers' | 'policy' | 'neighborhood'

type PageConfig = {
  title: string
  eyebrow: string
  description: string
  kind: PageKind
}

const PAGE_MAP: Record<string, PageConfig> = {
  'about-us': {
    title: 'About HomeGuard Pro',
    eyebrow: 'About us',
    description: 'A local services team built around clear estimates, careful work, and responsive follow-up.',
    kind: 'about',
  },
  blog: {
    title: 'HomeGuard Pro Blog',
    eyebrow: 'Blog',
    description: 'Short, practical updates on roofing, painting, inspections, and what homeowners should watch for.',
    kind: 'blog',
  },
  careers: {
    title: 'Careers at HomeGuard Pro',
    eyebrow: 'Careers',
    description: 'Join a crew that values craftsmanship, punctuality, and straightforward communication.',
    kind: 'careers',
  },
  roofing: {
    title: 'Roofing Services',
    eyebrow: 'Roofing',
    description: 'Inspection-first roofing help for repairs, replacements, and long-term roof care.',
    kind: 'service',
  },
  painting: {
    title: 'Painting Services',
    eyebrow: 'Painting',
    description: 'Exterior and interior painting with prep work, premium materials, and a clean handoff.',
    kind: 'service',
  },
  'roof-repair': {
    title: 'Roof Repair',
    eyebrow: 'Roof repair',
    description: 'Targeted roof repairs to stop leaks, protect the home, and avoid unnecessary replacement.',
    kind: 'service',
  },
  'roof-replacement': {
    title: 'Roof Replacement',
    eyebrow: 'Roof replacement',
    description: 'Full roof replacement planning for homes that have reached the end of a repairable service life.',
    kind: 'service',
  },
  zoobification: {
    title: 'Roof Renewal',
    eyebrow: 'Roof renewal',
    description: 'A lighter-touch service for extending roof life when a full replacement is not needed.',
    kind: 'service',
  },
  'exterior-painting-services': {
    title: 'Exterior Painting Services',
    eyebrow: 'Exterior painting',
    description: 'Prep, protection, paint application, and cleanup for a durable exterior finish.',
    kind: 'service',
  },
  'interior-house-painting-services': {
    title: 'Interior Painting Services',
    eyebrow: 'Interior painting',
    description: 'Interior painting with careful masking, clean lines, and minimal disruption to the home.',
    kind: 'service',
  },
  'the-zooby-painting-process': {
    title: 'The Painting Process',
    eyebrow: 'Painting process',
    description: 'A step-by-step look at how we scope, prep, protect, paint, and review the final result.',
    kind: 'service',
  },
  'painting-warranty': {
    title: 'Painting Warranty',
    eyebrow: 'Warranty',
    description: 'Clear workmanship coverage so homeowners know what is and is not included.',
    kind: 'policy',
  },
  'zoobification-warranty': {
    title: 'Roof Renewal Warranty',
    eyebrow: 'Warranty',
    description: 'Warranty details for the roof renewal service and the expectations around coverage.',
    kind: 'policy',
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    eyebrow: 'Privacy',
    description: 'How HomeGuard Pro handles contact information and requests submitted through the site.',
    kind: 'policy',
  },
}

const BLOG_POSTS = [
  {
    title: 'How to tell if a roof needs repair or replacement',
    blurb: 'A quick homeowner checklist for separating urgent damage from normal wear.',
  },
  {
    title: 'What prep work really matters before painting',
    blurb: 'The jobs that look simple usually depend on the prep work nobody sees.',
  },
  {
    title: 'Why same-day follow-up matters for emergency leads',
    blurb: 'A fast response can keep a small issue from becoming a bigger repair.',
  },
]

const CAREERS = [
  {
    title: 'Field Estimator',
    detail: 'Roofing and painting estimates with a customer-first walkthrough.',
  },
  {
    title: 'Crew Lead',
    detail: 'Lead a small production crew and keep jobs moving cleanly.',
  },
  {
    title: 'Office Coordinator',
    detail: 'Help route inbound leads, confirm appointments, and keep the workflow organized.',
  },
]

const SERVICE_POINTS = [
  'Inspection-first recommendations that avoid unnecessary work.',
  'Clear communication from intake through completion.',
  'Booking support when a site visit is the next best step.',
]

function getNeighborhood(slug: string) {
  return (NEIGHBORHOODS ?? []).find((item) => item.slug === slug)
}

function buildStaticParams() {
  return [
    ...Object.keys(PAGE_MAP).map((slug) => ({ slug })),
    ...(NEIGHBORHOODS ?? []).map((item) => ({ slug: item.slug })),
  ]
}

function getPageConfig(slug: string): PageConfig | null {
  if (PAGE_MAP[slug]) return PAGE_MAP[slug]
  const neighborhood = getNeighborhood(slug)
  if (neighborhood) {
    return {
      title: neighborhood.name,
      eyebrow: 'Service area',
      description: `HomeGuard Pro serves homeowners in ${neighborhood.name} with roofing and painting support.`,
      kind: 'neighborhood',
    }
  }
  return null
}

export function generateStaticParams() {
  return buildStaticParams()
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const page = getPageConfig(params.slug)
  if (!page) return {}
  return {
    title: `${page.title} | ${COMPANY.shortName}`,
    description: page.description,
  }
}

export default function SitePage({ params }: { params: { slug: string } }) {
  const page = getPageConfig(params.slug)
  if (!page) notFound()

  const neighborhood = page.kind === 'neighborhood' ? getNeighborhood(params.slug) : null

  return (
    <main className="bg-white">
      <section className="bg-homeguard-teal text-white py-14 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">{page.eyebrow}</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight mt-3">{page.title}</h1>
            <p className="mt-4 max-w-2xl text-base md:text-lg leading-7 text-white/85">{page.description}</p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {page.kind === 'blog' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-homeguard-purple font-semibold">
                    <FileText size={18} />
                    <span>Recent posts</span>
                  </div>
                  <div className="space-y-4">
                    {BLOG_POSTS.map((post) => (
                      <div key={post.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h2 className="font-display text-xl font-bold text-navy">{post.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{post.blurb}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {page.kind === 'careers' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-homeguard-purple font-semibold">
                    <Briefcase size={18} />
                    <span>Open roles</span>
                  </div>
                  <div className="space-y-4">
                    {CAREERS.map((role) => (
                      <div key={role.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h2 className="font-display text-xl font-bold text-navy">{role.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{role.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {page.kind === 'about' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-homeguard-purple font-semibold">
                    <ShieldCheck size={18} />
                    <span>Why customers call us</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { title: 'Clear estimates', text: 'We explain scope before work begins.' },
                      { title: 'Respectful crews', text: 'We protect the property and leave it clean.' },
                      { title: 'Follow-through', text: 'The workflow stays visible from lead to finish.' },
                    ].map((item) => (
                      <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h2 className="font-semibold text-navy">{item.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {page.kind === 'policy' && (
                <div className="space-y-4 text-sm leading-6 text-slate-600">
                  <p>
                    HomeGuard Pro uses the information you submit only to respond to service requests, follow up on quotes, and coordinate booking when needed.
                  </p>
                  <p>
                    We do not sell or rent customer contact information. Access is limited to the team members who need it to work the request.
                  </p>
                  <p>
                    This demo site stores lead data so the intake flow, inbox, and booking timeline can be shown end to end.
                  </p>
                </div>
              )}

              {page.kind === 'service' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-homeguard-purple font-semibold">
                    <Hammer size={18} />
                    <span>What to expect</span>
                  </div>
                  <ul className="grid gap-3 sm:grid-cols-3">
                    {SERVICE_POINTS.map((point) => (
                      <li key={point} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                        <CheckCircle2 className="mb-2 text-emerald-600" size={18} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {page.kind === 'neighborhood' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-homeguard-purple font-semibold">
                    <Globe2 size={18} />
                    <span>Local coverage</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    {neighborhood?.name} homeowners can use the same intake flow to request roofing or painting help, and the request will route into the internal lead inbox for follow-up.
                  </p>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    Service coverage is based on the demo neighborhoods in the footer, so every listed area resolves to a real page.
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <div className="flex items-center gap-2 text-homeguard-purple font-semibold">
              <Clock3 size={16} />
              <span>Next step</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              If you need pricing or want a specialist to review the project, start with the quote form and the team will route it from there.
            </p>

            <Link
              href="/contact-us"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-homeguard-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-homeguard-purple-dark"
            >
              Get a quote
              <ArrowRight size={16} />
            </Link>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-navy">Need help fast?</p>
              <p className="mt-2 leading-6">
                Call {COMPANY.phone} during business hours if you need to talk through the request before submitting.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
