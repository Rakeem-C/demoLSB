export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getLeadInboxItem } from '@/lib/lead-inbox'
import { getQualificationState, getQualificationSummary, hasActiveQualification } from '@/lib/conversation-store'
import { isQualificationComplete } from '@/lib/qualification-engine'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const leadId = url.searchParams.get('leadId')
    
    if (!leadId) {
      return NextResponse.json(
        { error: 'Missing leadId query parameter' },
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
    
    // Get qualification state
    const state = getQualificationState(leadId)
    const summary = getQualificationSummary(leadId)
    
    return NextResponse.json({
      success: true,
      leadId,
      hasQualification: !!state,
      isActive: hasActiveQualification(leadId),
      isComplete: state ? isQualificationComplete(state) : false,
      state,
      summary,
      leadName: lead.firstName
    })
    
  } catch (error) {
    console.error('Qualification status error:', error)
    return NextResponse.json(
      { error: 'Failed to get qualification status' },
      { status: 500 }
    )
  }
}