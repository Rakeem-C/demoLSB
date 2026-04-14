export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getLeadInboxItem, appendLeadActivityEvent } from '@/lib/lead-inbox'
import { advanceQualification, getInitialQualificationState } from '@/lib/qualification'
import { sendSmsMessage } from '@/lib/sms'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { leadId, message } = body

    if (!leadId || !message) {
      return NextResponse.json({ error: 'Missing leadId or message' }, { status: 400 })
    }

    const lead = await getLeadInboxItem(leadId)
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

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
  }
}
