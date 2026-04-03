import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getLeadInboxItems,
  getLeadWorkflowStage,
  getLeadWorkflowStageLabel,
  type LeadInboxItem,
  type LeadInboxUrgency,
  type LeadWorkflowStage,
} from '@/lib/lead-inbox'
import { cn } from '@/lib/utils'

const stageOrder: LeadWorkflowStage[] = ['new_lead', 'qualified', 'booking_sent', 'appointment_booked']

const stageStyles: Record<LeadWorkflowStage, string> = {
  new_lead: 'bg-sky-100 text-sky-800 border-sky-200',
  qualified: 'bg-violet-100 text-violet-900 border-violet-200',
  booking_sent: 'bg-blue-100 text-blue-900 border-blue-200',
  appointment_booked: 'bg-emerald-100 text-emerald-900 border-emerald-200',
}

const urgencyStyles: Record<LeadInboxUrgency, string> = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-orange-100 text-orange-900 border-orange-200',
  high: 'bg-red-100 text-red-900 border-red-200',
}

const stageDescriptions: Record<LeadWorkflowStage, string> = {
  new_lead: 'Fresh inbound requests waiting for review.',
  qualified: 'Leads confirmed as a fit for follow-up.',
  booking_sent: 'Booking option presented and awaiting commitment.',
  appointment_booked: 'Concrete scheduled visits now on the board.',
}

function formatSubmittedAt(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
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

function PipelineCard({ lead }: { lead: LeadInboxItem }) {
  const workflowStage = getLeadWorkflowStage(lead)

  return (
    <Link href={`/admin/leads/${lead.id}`} className="block">
      <Card variant="interactive" className="border-slate-200 bg-white hover:border-homeguard-purple/40">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-navy">{lead.fullName}</h3>
            <Badge className={cn('border', urgencyStyles[lead.urgency])}>{lead.urgency}</Badge>
          </div>
          <div className="space-y-1 text-xs leading-5 text-slate-600">
            <p><span className="font-medium text-slate-900">Service:</span> {lead.serviceCategory}</p>
            <p><span className="font-medium text-slate-900">Submitted:</span> {formatSubmittedAt(lead.submittedAt)}</p>
            <p><span className="font-medium text-slate-900">Score:</span> {lead.leadScore}</p>
            <p><span className="font-medium text-slate-900">Next:</span> {lead.recommendedNextAction}</p>
            {lead.appointment ? (
              <p><span className="font-medium text-slate-900">Appointment:</span> {formatAppointmentSummary(lead.appointment)} · {lead.appointment.timeWindow}</p>
            ) : null}
          </div>
          <div className="pt-1">
            <Badge className={cn('border', stageStyles[workflowStage])}>{getLeadWorkflowStageLabel(workflowStage)}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default async function PipelinePage() {
  const leads = await getLeadInboxItems()
  const grouped = stageOrder.reduce<Record<LeadWorkflowStage, LeadInboxItem[]>>((acc, stage) => {
    acc[stage] = leads.filter((lead) => getLeadWorkflowStage(lead) === stage)
    return acc
  }, {
    new_lead: [],
    qualified: [],
    booking_sent: [],
    appointment_booked: [],
  })

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:px-6">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="gap-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-homeguard-teal">Lead Pipeline</div>
            <CardTitle className="text-3xl text-navy">Workflow board</CardTitle>
            <p className="max-w-3xl text-sm text-slate-600">
              High-level pipeline view for the demo. This makes the sales flow legible at a glance: new lead, qualified, booking sent, and appointment booked.
            </p>
          </CardHeader>
        </Card>

        <div className="grid gap-4 xl:grid-cols-4">
          {stageOrder.map((stage) => (
            <section key={stage} className="flex min-h-[420px] flex-col rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <Badge className={cn('border', stageStyles[stage])}>{getLeadWorkflowStageLabel(stage)}</Badge>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{stageDescriptions[stage]}</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {grouped[stage].length}
                </div>
              </div>

              {grouped[stage].length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm text-slate-500">
                  No leads currently in this stage.
                </div>
              ) : (
                <div className="grid gap-3">
                  {grouped[stage].map((lead) => (
                    <PipelineCard key={lead.id} lead={lead} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
