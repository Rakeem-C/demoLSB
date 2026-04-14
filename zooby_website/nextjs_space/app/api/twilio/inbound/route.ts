export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
<<<<<<< HEAD
import { getLeadInboxItems } from '@/lib/lead-inbox'
import { getQualificationState, processQualificationReply } from '@/lib/conversation-store'
import { isQualificationComplete, logQualificationActivity } from '@/lib/qualification-engine'
import { determineBookingHandoff, logBookingHandoff } from '@/lib/booking-handoff'

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '').replace(/^1/, '')
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function twiml(message: string) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${xmlEscape(message)}</Message></Response>`
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const from = String(form.get('From') || '')
    const body = String(form.get('Body') || '').trim()

    if (!from || !body) {
      return new NextResponse(twiml('Thanks, we received your message.'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    const leads = await getLeadInboxItems()
    const normalizedFrom = normalizePhone(from)
    const lead = leads.find((item) => normalizePhone(item.phone) === normalizedFrom)

    if (!lead) {
      return new NextResponse(twiml('Thanks for your message. We could not match it to an active lead yet, but our team will review it shortly.'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    await logQualificationActivity(lead.id, {
      type: 'customer_reply',
      stage: getQualificationState(lead.id)?.stage ?? 'service_inquiry',
      details: `Inbound SMS reply: "${body.slice(0, 200)}"`,
    })

    const result = processQualificationReply(lead.id, body, lead.firstName)
    let responseMessage = result.systemResponse || 'Thanks, we received your update.'

    if (result.systemResponse) {
      await logQualificationActivity(lead.id, {
        type: 'system_response',
        stage: result.updatedState.stage,
        details: `System response: "${result.systemResponse}"`,
      })
    }

    if (isQualificationComplete(result.updatedState)) {
      await logQualificationActivity(lead.id, {
        type: 'qualification_completed',
        stage: 'completed',
        details: 'Qualification sequence completed successfully via Twilio inbound',
        state: result.updatedState,
      })

      const handoff = determineBookingHandoff(result.updatedState, lead.id, { useSimulated: true })
      await logBookingHandoff(lead.id, handoff, result.updatedState)
      responseMessage = handoff.message
    }

    return new NextResponse(twiml(responseMessage), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('Twilio inbound error:', error)
    return new NextResponse(twiml('Thanks, we received your message. Our team will follow up shortly.'), {
=======
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
>>>>>>> f675b2303cd4ed9a74bdcc768bba6f5599a3cd03
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }
<<<<<<< HEAD
=======

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
>>>>>>> f675b2303cd4ed9a74bdcc768bba6f5599a3cd03
}
