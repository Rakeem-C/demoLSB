export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
<<<<<<< HEAD
import { getLeadInboxItem } from '@/lib/lead-inbox'
import { getQualificationState, hasActiveQualification, processQualificationReply } from '@/lib/conversation-store'
import { isQualificationComplete, logQualificationActivity } from '@/lib/qualification-engine'
import { determineBookingHandoff, logBookingHandoff } from '@/lib/booking-handoff'

export async function POST(request: NextRequest) {
  try {
    const { leadId, message } = await request.json()
=======
import { prisma } from '@/lib/db'
import { getLeadInboxItem, appendLeadActivityEvent } from '@/lib/lead-inbox'
import { advanceQualification, getInitialQualificationState } from '@/lib/qualification'
import { sendSmsMessage } from '@/lib/sms'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { leadId, message } = body
>>>>>>> f675b2303cd4ed9a74bdcc768bba6f5599a3cd03

    if (!leadId || !message) {
      return NextResponse.json({ error: 'Missing leadId or message' }, { status: 400 })
    }

    const lead = await getLeadInboxItem(leadId)
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

<<<<<<< HEAD
    if (!hasActiveQualification(leadId)) {
      return NextResponse.json({ error: 'No active qualification for this lead' }, { status: 400 })
    }

    await logQualificationActivity(leadId, {
      type: 'customer_reply',
      stage: getQualificationState(leadId)?.stage ?? 'service_inquiry',
      details: `Customer replied: "${String(message).slice(0, 200)}"`,
    })

    const result = processQualificationReply(leadId, String(message), lead.firstName)

    if (result.systemResponse) {
      await logQualificationActivity(leadId, {
        type: 'system_response',
        stage: result.updatedState.stage,
        details: `System response: "${result.systemResponse}"`,
      })
    }

    let bookingHandoff = null

    if (isQualificationComplete(result.updatedState)) {
      await logQualificationActivity(leadId, {
        type: 'qualification_completed',
        stage: 'completed',
        details: 'Qualification sequence completed successfully',
        state: result.updatedState,
      })

      bookingHandoff = determineBookingHandoff(result.updatedState, leadId, { useSimulated: true })
      await logBookingHandoff(leadId, bookingHandoff, result.updatedState)
    }

    return NextResponse.json({
      success: true,
      leadId,
      state: result.updatedState,
      systemResponse: result.systemResponse,
      bookingHandoff,
      isComplete: isQualificationComplete(result.updatedState),
    })
  } catch (error) {
    console.error('Lead respond error:', error)
    return NextResponse.json({ error: 'Failed to process lead response' }, { status: 500 })
=======
    let persistedState = getInitialQualificationState()
    try {
      const record = await prisma.lead.findUnique({
        where: { id: leadId },
        select: {
          qualificationStage: true,
          qualificationServiceNeeded: true,
          qualificationUrgency: true,
          qualificationPreferredCallbackTime: true,
          qualificationComplete: true,
        },
      })
      if (record?.qualificationStage) {
        persistedState = {
          stage: record.qualificationStage as any,
          serviceNeeded: record.qualificationServiceNeeded,
          urgencyLevel: record.qualificationUrgency as any,
          preferredCallbackTime: record.qualificationPreferredCallbackTime,
          complete: Boolean(record.qualificationComplete),
        }
      }
    } catch {}

    const result = advanceQualification(persistedState, message)

    await appendLeadActivityEvent(leadId, {
      type: 'status',
      title: 'Customer replied',
      detail: message,
    })

    await appendLeadActivityEvent(leadId, {
      type: 'notification',
      title: 'Auto response sent',
      detail: result.reply,
    })

    try {
      await prisma.lead.update({
        where: { id: leadId },
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
    } catch {}

    try {
      await sendSmsMessage({
        phone: lead.phone,
        body: result.reply,
      })
    } catch {}

    return NextResponse.json({
      success: true,
      reply: result.reply,
      state: result.state,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to process reply' }, { status: 500 })
>>>>>>> f675b2303cd4ed9a74bdcc768bba6f5599a3cd03
  }
}
