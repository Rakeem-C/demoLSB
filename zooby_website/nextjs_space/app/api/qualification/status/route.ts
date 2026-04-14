export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const leadId = url.searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId query parameter' }, { status: 400 })
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        firstName: true,
        qualificationStage: true,
        qualificationServiceNeeded: true,
        qualificationUrgency: true,
        qualificationPreferredCallbackTime: true,
        qualificationComplete: true,
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      leadId,
      hasQualification: Boolean(lead.qualificationStage),
      isActive: Boolean(lead.qualificationStage) && !lead.qualificationComplete,
      isComplete: Boolean(lead.qualificationComplete),
      state: {
        stage: lead.qualificationStage,
        serviceNeeded: lead.qualificationServiceNeeded,
        urgencyLevel: lead.qualificationUrgency,
        preferredCallbackTime: lead.qualificationPreferredCallbackTime,
        complete: Boolean(lead.qualificationComplete),
      },
      leadName: lead.firstName,
    })
  } catch (error) {
    console.error('Qualification status error:', error)
    return NextResponse.json({ error: 'Failed to get qualification status' }, { status: 500 })
  }
}
