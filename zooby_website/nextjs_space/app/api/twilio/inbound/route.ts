export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { appendLeadActivityEvent } from '@/lib/lead-inbox'
import { advanceQualification, getInitialQualificationState } from '@/lib/qualification'
import { normalizePhone, sendSmsMessage } from '@/lib/sms'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const from = String(formData.get('From') ?? '')
  const body = String(formData.get('Body') ?? '').trim()

  if (!from || !body) {
    return new NextResponse('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }

  const normalizedFrom = normalizePhone(from)

  try {
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
    const lead = leads.find((item) => normalizePhone(item.phone) === normalizedFrom)

    if (!lead) {
      return new NextResponse('<Response></Response>', {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    const currentState = lead.qualificationStage
      ? {
          stage: lead.qualificationStage as any,
          serviceNeeded: lead.qualificationServiceNeeded,
          urgencyLevel: lead.qualificationUrgency as any,
          preferredCallbackTime: lead.qualificationPreferredCallbackTime,
          complete: Boolean(lead.qualificationComplete),
        }
      : getInitialQualificationState()

    const result = advanceQualification(currentState, body)

    await appendLeadActivityEvent(lead.id, {
      type: 'status',
      title: 'Customer replied by SMS',
      detail: body,
    })

    await appendLeadActivityEvent(lead.id, {
      type: 'notification',
      title: 'Auto response sent',
      detail: result.reply,
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
      },
    })

    await sendSmsMessage({ phone: lead.phone, body: result.reply })
  } catch (error) {
    console.warn('Twilio inbound qualification failed:', error)
  }

  return new NextResponse('<Response></Response>', {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}
