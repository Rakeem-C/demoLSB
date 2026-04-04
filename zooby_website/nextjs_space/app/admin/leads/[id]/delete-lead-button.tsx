'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function DeleteLeadButton({ leadId }: { leadId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this lead? This will remove it from the inbox and detail view.')
    if (!confirmed || loading) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.error ?? 'Failed to delete lead')
      }

      router.push('/admin/leads')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete lead'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 size={16} />
        {loading ? 'Deleting...' : 'Delete lead'}
      </button>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  )
}
