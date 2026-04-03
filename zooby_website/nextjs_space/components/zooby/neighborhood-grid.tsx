import Link from 'next/link'
import { NEIGHBORHOODS } from '@/lib/constants'
import { MapPin } from 'lucide-react'

export function NeighborhoodGrid({ title = 'Neighborhoods We Serve' }: { title?: string }) {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-navy mb-6 flex items-center gap-2">
          <MapPin className="text-homeguard-teal" size={28} /> {title}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {(NEIGHBORHOODS ?? []).map((n: any) => (
            <Link key={n?.slug} href={`/${n?.slug ?? ''}`} className="bg-white rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:text-homeguard-purple hover:shadow-md transition">
              {n?.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
