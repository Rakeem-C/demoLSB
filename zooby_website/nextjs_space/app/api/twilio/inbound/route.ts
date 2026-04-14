export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { findLeadIdByPhone, progressQualificationForLead } from '@/lib/qualification-progress'
import { sendSmsMessage } from '@/lib/sms'

function twimlEmpty() {
  return '<Response></Response>'
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const from = String(formData.get('From') ?? '').trim()
    const body = String(formData.get('Body') ?? '').trim()

    if (!from || !body) {
      return new NextResponse(twimlEmpty(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    const leadId = await findLeadIdByPhone(from)

    if (!leadId) {
      console.warn('Twilio inbound could not match lead by phone:', from)
      return new NextResponse(twimlEmpty(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    const outcome = await progressQualificationForLead({
      leadId,
      inboundMessage: body,
      source: 'twilio',
    })

    if (!outcome) {
      return new NextResponse(twimlEmpty(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    await sendSmsMessage({ phone: outcome.lead.phone, body: outcome.reply })

    return new NextResponse(twimlEmpty(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.warn('Twilio inbound qualification failed:', error)
    return new NextResponse(twimlEmpty(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}
