export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { appendLeadActivityEvent } from '@/lib/lead-inbox'
import { getInitialQualificationPrompt } from '@/lib/qualification'
import { sendSmsMessage } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const { leadId } = await request.json()

    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId' }, { status: 400 })
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const prompt = getInitialQualificationPrompt(lead.firstName)

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        qualificationStage: 'service',
        qualificationComplete: false,
      },
    })

    const smsResult = await sendSmsMessage({ phone: lead.phone, body: prompt })
    await appendLeadActivityEvent(leadId, {
      type: 'notification',
      title: smsResult.sent ? 'Qualification started' : 'Qualification kickoff skipped',
      detail: smsResult.sent ? prompt : `Kickoff skipped: ${smsResult.reason ?? 'provider unavailable'}`,
    })

    return NextResponse.json({ success: true, leadId, stage: 'service', systemMessage: prompt, sent: smsResult.sent })
  } catch (error) {
    console.error('Qualification start error:', error)
    return NextResponse.json({ error: 'Failed to start qualification' }, { status: 500 })
  }
}
