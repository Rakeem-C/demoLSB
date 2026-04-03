'use client'

import { COMPANY } from '@/lib/constants'
import { FileText, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

export function StickyCTA() {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-2">
      <Link href="/contact-us" className="bg-homeguard-purple hover:bg-homeguard-purple-dark text-white px-4 py-3 rounded-l-lg shadow-lg transition flex items-center gap-2 text-sm font-semibold">
        <FileText size={16} /> Get Proposal
      </Link>
      <a href={COMPANY.phoneTel} className="bg-homeguard-purple hover:bg-homeguard-purple-dark text-white px-4 py-3 rounded-l-lg shadow-lg transition flex items-center gap-2 text-sm font-semibold">
        <Phone size={16} /> Call {COMPANY.phone}
      </a>
      <a href={`mailto:${COMPANY.email}`} className="bg-homeguard-purple hover:bg-homeguard-purple-dark text-white px-4 py-3 rounded-l-lg shadow-lg transition flex items-center gap-2 text-sm font-semibold">
        <Mail size={16} /> Email Us
      </a>
    </div>
  )
}
