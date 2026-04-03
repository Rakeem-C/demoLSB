import Link from 'next/link'
import Image from 'next/image'
import { COMPANY, NEIGHBORHOODS, IMAGES } from '@/lib/constants'
import { Phone, Facebook, Youtube, Instagram } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer>
      <section className="bg-white py-12">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-homeguard-red text-xl md:text-2xl font-display font-bold">
              Call <a href={COMPANY.phoneTel} className="underline hover:no-underline">{COMPANY.phone}</a> to Book a Visit, Explore Plans and for Pricing
            </p>
          </div>
          <div className="relative w-[280px] h-[140px] flex-shrink-0">
            <Image src={IMAGES.truck} alt="HomeGuard Pro branded pickup truck" fill className="object-contain" />
          </div>
        </div>
      </section>

      <div className="bg-homeguard-teal text-white">
        <div className="max-w-[1200px] mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 text-center sm:text-left">
            <a href={COMPANY.phoneTel} className="flex items-center gap-2 text-lg font-semibold hover:opacity-80 transition">
              <Phone size={20} /> {COMPANY.phone}
            </a>
            <span className="text-sm opacity-80">{COMPANY.hours}</span>
          </div>

          <div className="mb-8">
            <h3 className="font-display text-lg font-bold mb-4">Who We Serve</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {(NEIGHBORHOODS ?? []).map((n: any) => (
                <Link key={n?.slug} href={`/${n?.slug ?? ''}`} className="text-sm opacity-80 hover:opacity-100 hover:underline transition">
                  {n?.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <a href={COMPANY.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:opacity-80 transition"><Facebook size={22} /></a>
            <a href={COMPANY.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:opacity-80 transition"><Youtube size={22} /></a>
            <a href={COMPANY.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-80 transition"><Instagram size={22} /></a>
          </div>

          <div className="border-t border-white/20 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm opacity-70">
            <span>{COMPANY.copyright}</span>
            <Link href="/privacy-policy" className="hover:opacity-100 hover:underline transition">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
