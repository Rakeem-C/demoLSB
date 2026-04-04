import Image from 'next/image'
import Link from 'next/link'
import { COMPANY, IMAGES } from '@/lib/constants'
import { NeighborhoodGrid } from '@/components/zooby/neighborhood-grid'
import { Shield, Paintbrush, Star, ArrowRight, Wrench, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      <section className="bg-homeguard-teal text-white py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                Roofing and Painting for <span className="text-yellow-300">local homes</span> that need a fast, trustworthy response
              </h1>
              <p className="text-lg opacity-90 mb-6 leading-relaxed">
                HomeGuard Pro doesn&apos;t rush. HomeGuard Pro doesn&apos;t cut corners. You get clear estimates, fast follow-up, and work you can be proud of for years.
              </p>
              <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 mb-6">
                Automationation demo: capture, qualify, and convert more home service leads.
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <a href={COMPANY.bbbUrl} target="_blank" rel="noopener noreferrer">
                  <div className="relative w-[100px] h-[50px]">
                    <Image src={IMAGES.bbbBadge} alt="BBB Accredited Business" fill className="object-contain" />
                  </div>
                </a>
                <a href={COMPANY.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
                  <Star className="text-yellow-400 fill-yellow-400" size={16} />
                  {COMPANY.googleRating} Stars on Google
                </a>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/services" className="bg-homeguard-purple hover:bg-homeguard-purple-dark text-white px-6 py-3 rounded-full font-semibold transition shadow-lg flex items-center gap-2">
                  See all services <ArrowRight size={16} />
                </Link>
                <Link href="/contact-us" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-semibold transition flex items-center gap-2">
                  Get A Quote
                </Link>
              </div>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
              <Image src={IMAGES.roofAerial} alt="Completed roof replacement in your area by HomeGuard Pro" fill className="object-cover" priority />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="text-homeguard-teal" size={24} />
                <span className="text-homeguard-teal font-semibold text-sm uppercase tracking-wide">Roofing</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-navy mb-4">Roofing Services</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                If your roof still has life left in it, you should not replace it early. We start with inspection, then recommend the smallest possible safe fix.
              </p>
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-display font-bold text-navy mb-1">Roof Renewal™ (Shingle Renewal)</h3>
                  <p className="text-sm text-gray-600">Extend the life of your existing roof without full replacement.</p>
                  <div className="flex gap-2 mt-2">
                    <Link href="/zoobification" className="text-homeguard-purple text-sm font-semibold hover:underline">Learn More</Link>
                    <Link href="/zoobification-warranty" className="text-homeguard-purple text-sm font-semibold hover:underline">Warranty</Link>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-display font-bold text-navy mb-1">Roof Repair & Replacement</h3>
                  <p className="text-sm text-gray-600">From targeted repairs to full replacements when needed.</p>
                  <div className="flex gap-2 mt-2">
                    <Link href="/roof-repair" className="text-homeguard-purple text-sm font-semibold hover:underline">Repair</Link>
                    <Link href="/roof-replacement" className="text-homeguard-purple text-sm font-semibold hover:underline">Replacement</Link>
                  </div>
                </div>
              </div>
              <Link href="/roofing" className="text-homeguard-purple font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                Explore all roofing options <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-200">
              <Image src={IMAGES.roofRepair} alt="Workers repairing a roof in your area" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-1 grid grid-cols-2 gap-4">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg bg-gray-200">
                <Image src={IMAGES.exteriorPainting} alt="Exterior house painting in your area" fill className="object-cover" />
              </div>
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg bg-gray-200 mt-8">
                <Image src={IMAGES.interiorPainting} alt="Interior painting by HomeGuard Pro" fill className="object-cover" />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-2 mb-3">
                <Paintbrush className="text-homeguard-teal" size={24} />
                <span className="text-homeguard-teal font-semibold text-sm uppercase tracking-wide">Painting</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-navy mb-4">Painting Services</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                A paint job lasts when prep gets done right. You should know what you&apos;re paying for before you hire anyone.
              </p>
              <div className="space-y-4 mb-6">
                <Link href="/exterior-painting-services" className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                  <h3 className="font-display font-bold text-navy mb-1">Exterior House Painting</h3>
                  <p className="text-sm text-gray-600">Surface prep, premium products, documented process.</p>
                </Link>
                <Link href="/interior-house-painting-services" className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                  <h3 className="font-display font-bold text-navy mb-1">Interior House Painting</h3>
                  <p className="text-sm text-gray-600">Walls, ceilings, trim, doors — fresh look without the mess.</p>
                </Link>
              </div>
              <div className="flex flex-wrap gap-3 mb-4">
                <Link href="/painting-process" className="text-homeguard-purple text-sm font-semibold hover:underline">Our 43-Step Process</Link>
                <Link href="/painting-warranty" className="text-homeguard-purple text-sm font-semibold hover:underline">5-Year Warranty</Link>
              </div>
              <Link href="/painting" className="text-homeguard-purple font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                Explore all painting options <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-navy mb-8">Why Local Homeowners Choose HomeGuard Pro</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle, title: '20+ Years Experience', desc: 'Serving local homeowners with integrity and skill.' },
              { icon: Star, title: '4.9 Stars on Google', desc: '35 five-star reviews from real homeowners.' },
              { icon: Wrench, title: 'Inspection First', desc: 'We never recommend more than what your home actually needs.' },
            ].map((item: any, i: number) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-homeguard-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-homeguard-teal" size={24} />
                </div>
                <h3 className="font-display font-bold text-navy mb-2">{item?.title}</h3>
                <p className="text-gray-600 text-sm">{item?.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NeighborhoodGrid />
    </>
  )
}
