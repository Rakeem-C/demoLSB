export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getLeadInboxItem } from '@/lib/lead-inbox'
import { progressQualificationForLead } from '@/lib/qualification-progress'
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

    const outcome = await progressQualificationForLead({
      leadId,
      inboundMessage: String(message),
      source: 'api',
    })

    if (!outcome) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    try {
      await sendSmsMessage({
        phone: lead.phone,
        body: outcome.reply,
      })
    } catch (error) {
      console.warn('Failed to send qualification response SMS:', error)
    }

    return NextResponse.json({
      success: true,
      reply: outcome.reply,
      state: outcome.state,
      nextAction: outcome.updates.recommendedNextAction,
    })
  } catch (error) {
    console.error('Lead respond error:', error)
    return NextResponse.json({ error: 'Failed to process reply' }, { status: 500 })
  }
}
