import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

export default function LeadNotFound() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-4xl px-4 py-16 md:px-6">
        <Card className="w-full border-slate-200 bg-white">
          <CardContent className="space-y-3 p-8">
            <h1 className="text-2xl font-semibold text-navy">Lead not found</h1>
            <p className="text-sm leading-6 text-slate-600">
              This lead ID does not exist in the demo inbox, or the lead is unavailable in the current local data set.
            </p>
            <Link href="/admin/leads" className="inline-flex text-sm font-medium text-homeguard-purple hover:underline">
              Return to the lead inbox
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
