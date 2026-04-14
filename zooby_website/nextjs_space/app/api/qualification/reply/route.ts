export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getLeadInboxItem } from '@/lib/lead-inbox'
import { getQualificationState, hasActiveQualification, processQualificationReply } from '@/lib/conversation-store'
import { logQualificationActivity } from '@/lib/qualification-engine'

export async function POST(request: NextRequest) {
  try {
    const { leadId, customerReply } = await request.json()
    
    if (!leadId || !customerReply) {
      return NextResponse.json(
        { error: 'Missing leadId or customerReply' },
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
    
    // Check if qualification is active
    if (!hasActiveQualification(leadId)) {
      return NextResponse.json(
        { error: 'No active qualification for this lead' },
        { status: 400 }
      )
    }
    
    // Log customer reply
    await logQualificationActivity(leadId, {
      type: 'customer_reply',
      stage: getQualificationState(leadId)?.stage ?? 'service_inquiry',
      details: `Customer replied: "${customerReply.substring(0, 100)}${customerReply.length > 100 ? '...' : ''}"`
    })
    
    // Process reply
    const result = processQualificationReply(leadId, customerReply, lead.firstName)
    
    // Log system response if any
    if (result.systemResponse) {
      await logQualificationActivity(leadId, {
        type: 'system_response',
        stage: result.updatedState.stage,
        details: `System response: "${result.systemResponse}"`
      })
    }
    
    let bookingHandoff: unknown = null

    // Log completion if qualified
    if (result.updatedState.stage === 'completed') {
      await logQualificationActivity(leadId, {
        type: 'qualification_completed',
        stage: 'completed',
        details: 'Qualification sequence completed successfully',
        state: result.updatedState
      })
      
      // Layer 3: Generate and log booking handoff
      try {
        const bookingModule = await import('@/lib/booking-handoff')
        bookingHandoff = bookingModule.determineBookingHandoff(result.updatedState, leadId, { useSimulated: true })
        await bookingModule.logBookingHandoff(leadId, bookingHandoff as any, result.updatedState)
      } catch (handoffError) {
        console.warn('Failed to generate booking handoff:', handoffError)
      }
    }
    
    return NextResponse.json({
      success: true,
      leadId,
      stage: result.updatedState.stage,
      systemResponse: result.systemResponse,
      shouldAdvance: result.shouldAdvance,
      state: result.updatedState,
      bookingHandoff,
      isComplete: result.updatedState.stage === 'completed'
    })
    
  } catch (error) {
    console.error('Qualification reply error:', error)
    return NextResponse.json(
      { error: 'Failed to process qualification reply' },
      { status: 500 }
    )
  }
}