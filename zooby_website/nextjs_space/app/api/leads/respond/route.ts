export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getLeadInboxItem, appendLeadActivityEvent } from '@/lib/lead-inbox'
import { advanceQualification, getInitialQualificationState } from '@/lib/qualification'
import { sendLeadSubmissionSms } from '@/lib/sms'

const stateStore = new Map<string, any>()

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

    const currentState = stateStore.get(leadId) || getInitialQualificationState()

    const result = advanceQualification(currentState, message)

    stateStore.set(leadId, result.state)

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
      await sendLeadSubmissionSms({
        firstName: lead.firstName,
        phone: lead.phone,
      })
    } catch {}

    return NextResponse.json({
      success: true,
      reply: result.reply,
      state: result.state,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to process reply' }, { status: 500 })
  }
}
