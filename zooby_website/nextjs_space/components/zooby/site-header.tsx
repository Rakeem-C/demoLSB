'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { COMPANY, NAV_ITEMS, IMAGES } from '@/lib/constants'
import { Phone, Clock, Facebook, Youtube, Menu, X, ChevronDown } from 'lucide-react'

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-homeguard-teal text-white">
        <div className="max-w-[1200px] mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <a href={COMPANY.phoneTel} className="flex items-center gap-1 hover:opacity-80 transition">
              <Phone size={14} /> Call {COMPANY.phone}
            </a>
            <span className="hidden sm:flex items-center gap-1">
              <Clock size={14} /> {COMPANY.hours}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href={COMPANY.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:opacity-80 transition"><Facebook size={18} /></a>
            <a href={COMPANY.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:opacity-80 transition"><Youtube size={18} /></a>
          </div>
        </div>
      </div>

      <nav className="bg-homeguard-teal/95 backdrop-blur-sm text-white shadow-md">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <div className="relative w-[140px] h-[50px]">
              <Image src={IMAGES.logoWhite} alt="HomeGuard Pro - Professional Roofing and Painting" fill className="object-contain" priority />
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {(NAV_ITEMS ?? []).map((item: any) => (
              <div key={item?.label} className="relative group"
                onMouseEnter={() => item?.children && setOpenDropdown(item?.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link href={item?.href ?? '/'} className="px-3 py-2 text-sm font-medium hover:bg-white/10 rounded transition flex items-center gap-1">
                  {item?.label}
                  {item?.children && <ChevronDown size={14} />}
                </Link>
                {item?.children && openDropdown === item?.label && (
                  <div className="absolute top-full left-0 bg-white text-gray-800 rounded-md shadow-lg min-w-[220px] py-2 z-50">
                    {(item?.children ?? []).map((child: any) => (
                      <Link key={child?.href} href={child?.href ?? '/'} className="block px-4 py-2 text-sm hover:bg-gray-50 transition">
                        {child?.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/admin/leads"
              className="ml-2 px-3 py-2 text-sm font-semibold rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              Lead Inbox
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/contact-us" className="bg-homeguard-purple hover:bg-homeguard-purple-dark text-white px-5 py-2 rounded-full text-sm font-semibold transition">
              Get A Quote
            </Link>
            <a href={COMPANY.phoneTel} className="text-sm font-medium hover:opacity-80 transition">
              Call {COMPANY.phone}
            </a>
          </div>

          <button className="lg:hidden p-2 hover:bg-white/10 rounded" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden bg-homeguard-teal border-t border-white/20 pb-4">
            <div className="max-w-[1200px] mx-auto px-4">
              {(NAV_ITEMS ?? []).map((item: any) => (
                <div key={item?.label}>
                  <Link href={item?.href ?? '/'} className="block py-3 text-sm font-medium border-b border-white/10" onClick={() => !item?.children && setMobileOpen(false)}>
                    {item?.label}
                  </Link>
                  {item?.children && (
                    <div className="pl-4">
                      {(item?.children ?? []).map((child: any) => (
                        <Link key={child?.href} href={child?.href ?? '/'} className="block py-2 text-sm opacity-80 hover:opacity-100" onClick={() => setMobileOpen(false)}>
                          {child?.label}
                        </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
              <Link
                href="/admin/leads"
                className="block py-3 text-sm font-semibold border-b border-white/10"
                onClick={() => setMobileOpen(false)}
              >
                Lead Inbox
              </Link>
              <div className="mt-4 flex flex-col gap-2">
                <Link href="/contact-us" className="bg-homeguard-purple text-white text-center px-5 py-2.5 rounded-full text-sm font-semibold" onClick={() => setMobileOpen(false)}>Get A Quote</Link>
                <a href={COMPANY.phoneTel} className="text-center text-sm font-medium py-2">Call {COMPANY.phone}</a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
