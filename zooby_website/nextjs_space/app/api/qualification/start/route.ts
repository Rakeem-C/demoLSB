export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getLeadInboxItem } from '@/lib/lead-inbox'
import { hasActiveQualification, initializeQualification } from '@/lib/conversation-store'
import { logQualificationActivity } from '@/lib/qualification-engine'

export async function POST(request: NextRequest) {
  try {
    const { leadId } = await request.json()
    
    if (!leadId) {
      return NextResponse.json(
        { error: 'Missing leadId' },
        { status: 400 }
      )
    }
    
    // Get lead details
    const lead = await getLeadInboxItem(leadId)
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }
    
    // Check if qualification already started
    if (hasActiveQualification(leadId)) {
      return NextResponse.json(
        { error: 'Qualification already in progress' },
        { status: 400 }
      )
    }
    
    // Initialize qualification
    const { state, firstMessage } = initializeQualification(leadId, lead.firstName)
    
    // Log activity
    await logQualificationActivity(leadId, {
      type: 'stage_started',
      stage: state.stage,
      details: `Qualification sequence started. First message: "${firstMessage}"`
    })
    
    return NextResponse.json({
      success: true,
      leadId,
      stage: state.stage,
      systemMessage: firstMessage,
      state
    })
    
  } catch (error) {
    console.error('Qualification start error:', error)
    return NextResponse.json(
      { error: 'Failed to start qualification' },
      { status: 500 }
    )
  }
}