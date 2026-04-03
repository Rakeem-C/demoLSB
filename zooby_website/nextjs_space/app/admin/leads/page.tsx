import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getLeadInboxItems,
  getLeadWorkflowStage,
  getLeadWorkflowStageLabel,
  type LeadInboxItem,
  type LeadInboxStatus,
  type LeadInboxUrgency,
  type LeadWorkflowStage,
} from '@/lib/lead-inbox'
import { cn } from '@/lib/utils'

const statusStyles: Record<LeadInboxStatus, string> = {
  new: 'bg-sky-100 text-sky-800 border-sky-200',
  contacted: 'bg-amber-100 text-amber-900 border-amber-200',
  qualified: 'bg-violet-100 text-violet-900 border-violet-200',
  scheduled: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  closed: 'bg-slate-200 text-slate-800 border-slate-300',
}

const urgencyStyles: Record<LeadInboxUrgency, string> = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-orange-100 text-orange-900 border-orange-200',
  high: 'bg-red-100 text-red-900 border-red-200',
}

const urgencyCardStyles: Record<LeadInboxUrgency, string> = {
  low: 'border-slate-200',
  medium: 'border-orange-200 shadow-orange-100/50',
  high: 'border-red-300 bg-red-50/50 shadow-red-100/60',
}

const stageStyles: Record<LeadWorkflowStage, string> = {
  new_lead: 'bg-sky-100 text-sky-800 border-sky-200',
  qualified: 'bg-violet-100 text-violet-900 border-violet-200',
  booking_sent: 'bg-blue-100 text-blue-900 border-blue-200',
  appointment_booked: 'bg-emerald-100 text-emerald-900 border-emerald-200',
}

function formatSubmittedAt(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatAppointmentSummary(appointment: NonNullable<LeadInboxItem['appointment']>) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(appointment.appointmentDate)
}

function LeadRow({ lead }: { lead: LeadInboxItem }) {
  const workflowStage = getLeadWorkflowStage(lead)

  return (
    <Link href={`/admin/leads/${lead.id}`} className="block">
      <Card
        variant="interactive"
        className={cn(
          'border transition-colors hover:border-homeguard-purple/40',
          urgencyCardStyles[lead.urgency]
        )}
      >
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-navy">{lead.fullName}</h2>
                <Badge className={cn('border', stageStyles[workflowStage])}>{getLeadWorkflowStageLabel(workflowStage)}</Badge>
                <Badge className={cn('border', urgencyStyles[lead.urgency])}>{lead.urgency} urgency</Badge>
                <Badge className={cn('border', statusStyles[lead.status])}>{lead.status}</Badge>
              </div>
              <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <span className="font-medium text-slate-900">Service:</span> {lead.serviceCategory}
                </div>
                <div>
                  <span className="font-medium text-slate-900">Source:</span> {lead.source}
                </div>
                <div>
                  <span className="font-medium text-slate-900">Submitted:</span> {formatSubmittedAt(lead.submittedAt)}
                </div>
                <div>
                  <span className="font-medium text-slate-900">Lead score:</span> {lead.leadScore}
                </div>
                <div>
                  <span className="font-medium text-slate-900">Recommended next action:</span> {lead.recommendedNextAction}
                </div>
                {lead.appointment ? (
                  <div className="md:col-span-2 xl:col-span-3">
                    <span className="font-medium text-slate-900">Appointment:</span>{' '}
                    {formatAppointmentSummary(lead.appointment)} · {lead.appointment.timeWindow} · {lead.appointment.assignedRep}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="rounded-full bg-homeguard-purple/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-homeguard-purple">
              Open lead
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default async function AdminLeadsPage() {
  const leads = await getLeadInboxItems()

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:px-6">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="gap-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-homeguard-teal">Internal Lead Inbox</div>
            <CardTitle className="text-3xl text-navy">Lead queue</CardTitle>
            <p className="max-w-3xl text-sm text-slate-600">
              Operational view of inbound demand. Newest leads appear first, and higher urgency submissions are surfaced visually for faster follow-up.
            </p>
          </CardHeader>
        </Card>

        {leads.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-white">
            <CardContent className="flex flex-col items-start gap-2 p-8">
              <h2 className="text-xl font-semibold text-navy">No leads yet</h2>
              <p className="text-sm text-slate-600">
                Once leads are submitted through the site or seeded into the local demo layer, they will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {leads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
