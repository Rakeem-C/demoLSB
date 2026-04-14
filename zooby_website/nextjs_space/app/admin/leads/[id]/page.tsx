export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteLeadButton } from './delete-lead-button'
import { LeadQualificationSimulator } from '@/components/zooby/lead-qualification-simulator'
import {
  getLeadInboxItem,
  getLeadInboxItems,
  getLeadWorkflowStage,
  getLeadWorkflowStageLabel,
  type LeadActivityEvent,
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

const stageStyles: Record<LeadWorkflowStage, string> = {
  new_lead: 'bg-sky-100 text-sky-800 border-sky-200',
  qualified: 'bg-violet-100 text-violet-900 border-violet-200',
  booking_sent: 'bg-blue-100 text-blue-900 border-blue-200',
  appointment_booked: 'bg-emerald-100 text-emerald-900 border-emerald-200',
}

const eventStyles: Record<LeadActivityEvent['type'], string> = {
  submitted: 'bg-sky-500',
  normalized: 'bg-cyan-500',
  created: 'bg-blue-500',
  classified: 'bg-violet-500',
  confirmation: 'bg-teal-500',
  notification: 'bg-indigo-500',
  'booking-link': 'bg-blue-500',
  status: 'bg-amber-500',
  appointment: 'bg-emerald-500',
  qualification: 'bg-fuchsia-500',
}

const workflowStageOptions: Array<{ value: LeadWorkflowStage; label: string; description: string }> = [
  { value: 'new_lead', label: 'New lead', description: 'Keep the lead in the intake queue.' },
  { value: 'qualified', label: 'Qualified', description: 'Mark the lead as a fit for follow-up.' },
  { value: 'booking_sent', label: 'Booking sent', description: 'Present the booking link to the homeowner.' },
  { value: 'appointment_booked', label: 'Appointment booked', description: 'Confirm the appointment is on the schedule.' },
]

function formatSubmittedAt(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date)
}

function formatEventAt(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatAppointmentDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function TimelineItem({ event }: { event: LeadActivityEvent }) {
  return (
    <li className="relative pl-8">
      <span className={cn('absolute left-0 top-1.5 h-3 w-3 rounded-full ring-4 ring-white', eventStyles[event.type])} />
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-navy">{event.title}</p>
          <span className="text-xs text-slate-500">{formatEventAt(event.at)}</span>
        </div>
        <p className="text-sm leading-6 text-slate-600">{event.detail}</p>
      </div>
    </li>
  )
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await getLeadInboxItem(params.id)

  if (!lead) {
    notFound()
  }
  const workflowStage = getLeadWorkflowStage(lead)

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-homeguard-teal">Lead Detail</div>
            <h1 className="mt-2 text-3xl font-semibold text-navy">{lead.fullName}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Operational detail view for the inbound lead. This shows the raw submission, the current workflow state, and the activity trail behind it.
            </p>
          </div>
          <Link href="/admin/leads" className="text-sm font-medium text-homeguard-purple hover:underline">
            Back to inbox
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Card className="border-slate-200 bg-white">
              <CardContent className="space-y-5 p-6">
                <div className="flex flex-wrap gap-2">
                  <Badge className={cn('border', stageStyles[workflowStage])}>workflow {getLeadWorkflowStageLabel(workflowStage)}</Badge>
                  <Badge className={cn('border', urgencyStyles[lead.urgency])}>{lead.urgency} urgency</Badge>
                  <Badge className={cn('border', statusStyles[lead.status])}>{lead.status}</Badge>
                  <Badge className={cn('border', stageStyles[workflowStage])}>
                    booking {lead.bookingState.replace('-', ' ')}
                  </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Contact</p>
                    <div className="mt-2 space-y-1 text-sm text-slate-700">
                      <p>
                        <span className="font-medium text-navy">Email:</span> {lead.email || 'Not provided'}
                      </p>
                      <p>
                        <span className="font-medium text-navy">Phone:</span> {lead.phone || 'Not provided'}
                      </p>
                      <p>
                        <span className="font-medium text-navy">ZIP:</span> {lead.zipCode || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Preference</p>
                    <div className="mt-2 space-y-1 text-sm text-slate-700">
                      <p>
                        <span className="font-medium text-navy">Contact preference:</span> {lead.contactPreference || lead.contactMethod || 'Not provided'}
                      </p>
                      <p>
                        <span className="font-medium text-navy">Preferred time:</span> {lead.preferredContactTime || lead.contactTime || 'Not provided'}
                      </p>
                      <p>
                        <span className="font-medium text-navy">Source:</span> {lead.source}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Identity and intake</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1 text-sm text-slate-700">
                      <p>
                        <span className="font-medium text-navy">Name:</span> {lead.fullName}
                      </p>
                      <p>
                        <span className="font-medium text-navy">Submitted:</span> {formatSubmittedAt(lead.submittedAt)}
                      </p>
                    </div>
                    <div className="space-y-1 text-sm text-slate-700">
                      <p>
                        <span className="font-medium text-navy">Original project details:</span>{' '}
                        {lead.originalProjectDetails || lead.message || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Raw problem description</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{lead.message || 'No problem description provided.'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-navy">Timeline</CardTitle>
                <p className="text-sm text-slate-600">Current activity trail for this lead. New admin actions append new entries here.</p>
              </CardHeader>
              <CardContent>
                {lead.timeline.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                    No activity has been recorded yet.
                  </div>
                ) : (
                  <ol className="space-y-5">
                    {lead.timeline.map((event) => (
                      <TimelineItem key={event.id} event={event} />
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-navy">Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid gap-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Service category</p>
                    <p className="mt-1 font-medium text-navy">{lead.serviceCategory}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Urgency</p>
                    <p className="mt-1 font-medium text-navy">{lead.urgency}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Lead score</p>
                    <p className="mt-1 text-2xl font-semibold text-navy">{lead.leadScore}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Summary</p>
                    <p className="mt-1 leading-6 text-slate-700">{lead.summary}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Recommended next action</p>
                    <p className="mt-1 leading-6 text-slate-700">{lead.recommendedNextAction}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-navy">Appointment</CardTitle>
                <p className="text-sm text-slate-600">Concrete appointment data is shown here when the lead reaches the booked state.</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {lead.appointment ? (
                  <>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Scheduled visit</p>
                      <p className="mt-1 font-medium text-navy">{formatAppointmentDate(lead.appointment.appointmentDate)}</p>
                      <p className="mt-1 text-slate-700">{lead.appointment.timeWindow}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Assigned rep</p>
                        <p className="mt-1 font-medium text-navy">{lead.appointment.assignedRep}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Visit type</p>
                        <p className="mt-1 font-medium text-navy">{lead.appointment.visitType}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-600">
                    No appointment is scheduled yet. Mark the lead as appointment booked to generate a visit record.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-navy">Qualification State</CardTitle>
                <p className="text-sm text-slate-600">Persisted qualification fields from the lead record.</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Current stage</p>
                  <p className="mt-1 font-medium text-navy">{lead.qualificationStage ?? 'not started'}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Service needed</p>
                    <p className="mt-1 text-slate-700">{lead.qualificationServiceNeeded ?? '—'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Urgency</p>
                    <p className="mt-1 text-slate-700">{lead.qualificationUrgency ?? '—'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Preferred callback time</p>
                    <p className="mt-1 text-slate-700">{lead.qualificationPreferredCallbackTime ?? '—'}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Complete</p>
                  <p className="mt-1 font-medium text-navy">{lead.qualificationComplete ? 'Yes' : 'No'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-navy">Qualification Flow</CardTitle>
                <p className="text-sm text-slate-600">Use this to test the SMS qualification sequence without waiting for a real inbound text.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <LeadQualificationSimulator leadId={lead.id} />
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-navy">Workflow Actions</CardTitle>
                <p className="text-sm text-slate-600">These are simple demo controls for state changes. They update the lead record and append timeline entries.</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Transition stage</p>
                  <div className="grid gap-2">
                    {workflowStageOptions.map((option) => (
                      <form key={option.value} action={`/api/leads/${lead.id}/state`} method="post">
                        <input type="hidden" name="workflowStage" value={option.value} />
                        <button
                          type="submit"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-homeguard-purple/40 hover:bg-homeguard-purple/5"
                        >
                          <div className="text-sm font-medium text-navy">{option.label}</div>
                          <div className="mt-1 text-xs leading-5 text-slate-600">{option.description}</div>
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 border-t border-slate-200 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Danger zone</p>
                  <p className="text-sm leading-6 text-slate-600">
                    Remove the lead from the inbox and detail view if it was submitted as a duplicate or test record.
                  </p>
                  <DeleteLeadButton leadId={lead.id} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

export async function generateStaticParams() {
  const leads = await getLeadInboxItems()
  return leads.map((lead) => ({ id: lead.id }))
}
