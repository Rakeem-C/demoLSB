export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { appendLeadActivityEvent } from '@/lib/lead-inbox'

function scheduleUrl(leadId: string) {
  const base = process.env.APP_BASE_URL?.trim() || process.env.NEXTAUTH_URL?.trim() || ''
  const relative = `/schedule?lead=${encodeURIComponent(leadId)}`
  return base ? `${base.replace(/\/$/, '')}${relative}` : relative
}

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

    if (!lead.qualificationComplete) {
      return NextResponse.json({ error: 'Qualification not yet complete' }, { status: 400 })
    }

    const url = scheduleUrl(lead.id)
    const message = `Thanks again — the fastest next step is to book here: ${url}`

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        status: lead.status === 'scheduled' ? lead.status : 'qualified',
        bookingState: 'sent',
        recommendedNextAction: 'Book inspection',
      },
    })

    await appendLeadActivityEvent(lead.id, {
      type: 'booking-link',
      title: 'Booking handoff sent',
      detail: message,
    })

    return NextResponse.json({ success: true, leadId: lead.id, handoff: { type: 'booking_link', message, actionUrl: url } })
  } catch (error) {
    console.error('Booking handoff error:', error)
    return NextResponse.json({ error: 'Failed to generate booking handoff' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const leadId = url.searchParams.get('leadId')

  if (!leadId) {
    return NextResponse.json({ error: 'Missing leadId query parameter' }, { status: 400 })
  }

  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    leadId,
    qualificationComplete: lead.qualificationComplete,
    bookingUrl: scheduleUrl(leadId),
  })
}
