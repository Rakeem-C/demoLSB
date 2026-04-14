export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { progressQualificationForLead } from '@/lib/qualification-progress'
import { sendSmsMessage } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const { leadId, customerReply } = await request.json()

    if (!leadId || !customerReply) {
      return NextResponse.json({ error: 'Missing leadId or customerReply' }, { status: 400 })
    }

    const result = await progressQualificationForLead({
      leadId,
      inboundMessage: String(customerReply),
      source: 'api',
    })

    if (!result) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    await sendSmsMessage({ phone: result.lead.phone, body: result.reply }).catch(() => null)

    return NextResponse.json({
      success: true,
      leadId,
      systemResponse: result.reply,
      state: result.state,
      isComplete: result.state.complete,
    })
  } catch (error) {
    console.error('Qualification reply error:', error)
    return NextResponse.json({ error: 'Failed to process qualification reply' }, { status: 500 })
  }
}
