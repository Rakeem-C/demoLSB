"use client"

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function LeadQualificationSimulator({ leadId }: { leadId: string }) {
  const [message, setMessage] = useState('')
  const [lastReply, setLastReply] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function submit() {
    if (!message.trim()) return

    const response = await fetch('/api/leads/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, message }),
    })

    const payload = await response.json().catch(() => ({}))
    if (payload?.reply) {
      setLastReply(payload.reply)
      setMessage('')
      startTransition(() => router.refresh())
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Qualification simulator</p>
      <p className="text-sm text-slate-600">Send a test customer reply through the qualification flow.</p>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Example: I need roof repair"
        className="min-h-[110px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-homeguard-purple"
      />
      <button
        type="button"
        onClick={submit}
        disabled={isPending || !message.trim()}
        className="rounded-lg bg-homeguard-purple px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Sending...' : 'Send simulated reply'}
      </button>
      {lastReply ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-slate-700">
          <span className="font-medium text-navy">Last auto-response:</span> {lastReply}
        </div>
      ) : null}
    </div>
  )
}
