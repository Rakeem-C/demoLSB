export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getLeadInboxItem } from '@/lib/lead-inbox'
import { getQualificationState, hasActiveQualification, processQualificationReply } from '@/lib/conversation-store'
import { isQualificationComplete, logQualificationActivity } from '@/lib/qualification-engine'
import { determineBookingHandoff, logBookingHandoff } from '@/lib/booking-handoff'

export async function POST(request: NextRequest) {
  try {
    const { leadId, message } = await request.json()

    if (!leadId || !message) {
      return NextResponse.json({ error: 'Missing leadId or message' }, { status: 400 })
    }

    const lead = await getLeadInboxItem(leadId)
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

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
  }
}
