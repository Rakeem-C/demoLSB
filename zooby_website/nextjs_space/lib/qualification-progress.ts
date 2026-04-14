import { prisma } from '@/lib/db'
import { appendLeadActivityEvent } from '@/lib/lead-inbox'
import { advanceQualification, getInitialQualificationState, type QualificationState } from '@/lib/qualification'

function getScheduleUrl(leadId: string) {
  const baseUrl = process.env.APP_BASE_URL?.trim() || process.env.NEXTAUTH_URL?.trim() || ''
  const relative = `/schedule?lead=${encodeURIComponent(leadId)}`

  if (!baseUrl) return relative

  return `${baseUrl.replace(/\/$/, '')}${relative}`
}

function withBookingLink(reply: string, leadId: string) {
  if (!reply.includes('/schedule')) {
    return reply
  }

  return reply.replace('/schedule', getScheduleUrl(leadId))
}

function normalizeStage(stage: string | null): QualificationState['stage'] {
  if (stage === 'service' || stage === 'urgency' || stage === 'contact_time' || stage === 'complete') {
    return stage
  }
  return 'service'
}

export async function progressQualificationForLead(params: {
  leadId: string
  inboundMessage: string
  source: 'api' | 'twilio'
}) {
  const message = params.inboundMessage.trim()
  const lead = await prisma.lead.findUnique({
    where: { id: params.leadId },
    select: {
      id: true,
      phone: true,
      summary: true,
      qualificationStage: true,
      qualificationServiceNeeded: true,
      qualificationUrgency: true,
      qualificationPreferredCallbackTime: true,
      qualificationComplete: true,
    },
  })

  if (!lead) {
    return null
  }

  const currentState: QualificationState = lead.qualificationStage
    ? {
        stage: normalizeStage(lead.qualificationStage),
        serviceNeeded: lead.qualificationServiceNeeded,
        urgencyLevel:
          lead.qualificationUrgency === 'urgent' || lead.qualificationUrgency === 'soon' || lead.qualificationUrgency === 'researching'
            ? lead.qualificationUrgency
            : null,
        preferredCallbackTime: lead.qualificationPreferredCallbackTime,
        complete: Boolean(lead.qualificationComplete),
      }
    : getInitialQualificationState()

  const result = advanceQualification(currentState, message)
  const reply = withBookingLink(result.reply, lead.id)

  await appendLeadActivityEvent(lead.id, {
    type: 'status',
    title: params.source === 'twilio' ? 'Customer replied by SMS' : 'Customer replied',
    detail: message,
  })

  await appendLeadActivityEvent(lead.id, {
    type: 'notification',
    title: 'Auto response sent',
    detail: reply,
  })

  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      qualificationStage: result.state.stage,
      qualificationServiceNeeded: result.state.serviceNeeded ?? null,
      qualificationUrgency: result.state.urgencyLevel ?? null,
      qualificationPreferredCallbackTime: result.state.preferredCallbackTime ?? null,
      qualificationComplete: result.state.complete,
      status: result.updates.status ?? undefined,
      recommendedNextAction: result.updates.recommendedNextAction ?? undefined,
      summary: result.updates.summaryAppend ? `${lead.summary ?? ''}${result.updates.summaryAppend}`.trim() : undefined,
      bookingState: result.state.complete ? 'sent' : undefined,
    },
  })

  return {
    lead,
    state: result.state,
    reply,
    updates: result.updates,
  }
}

export async function findLeadIdByPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')

  if (!digits) return null

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: { id: true, phone: true },
  })

  const exact = leads.find((lead) => lead.phone.replace(/\D/g, '') === digits)
  if (exact) return exact.id

  const domestic = digits.length > 10 ? digits.slice(-10) : digits
  const suffixMatch = leads.find((lead) => {
    const leadDigits = lead.phone.replace(/\D/g, '')
    return leadDigits.endsWith(domestic)
  })

  return suffixMatch?.id ?? null
}
