export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getLeadInboxItem } from '@/lib/lead-inbox'
import { getQualificationState } from '@/lib/conversation-store'
import { determineBookingHandoff, logBookingHandoff, type BookingHandoffConfig } from '@/lib/booking-handoff'
import { isQualificationComplete } from '@/lib/qualification-engine'

export async function POST(request: NextRequest) {
  try {
    const { leadId, config = {} } = await request.json()
    
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
    
    // Get qualification state
    const qualification = getQualificationState(leadId)
    if (!qualification) {
      return NextResponse.json(
        { error: 'No qualification data for this lead' },
        { status: 400 }
      )
    }
    
    // Check if qualification is complete
    if (!isQualificationComplete(qualification)) {
      return NextResponse.json(
        { error: 'Qualification not yet complete' },
        { status: 400 }
      )
    }
    
    // Determine booking handoff
    const handoffConfig: Partial<BookingHandoffConfig> = {
      bookingBaseUrl: `/schedule?lead=${encodeURIComponent(leadId)}`,
      useSimulated: true, // Demo mode by default
      ...config
    }
    
    const handoff = determineBookingHandoff(qualification, leadId, handoffConfig)
    
    // Log booking handoff
    await logBookingHandoff(leadId, handoff, qualification)
    
    return NextResponse.json({
      success: true,
      leadId,
      handoff,
      qualification,
      leadName: lead.firstName
    })
    
  } catch (error) {
    console.error('Booking handoff error:', error)
    return NextResponse.json(
      { error: 'Failed to generate booking handoff' },
      { status: 500 }
    )
  }
}

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
    const qualification = getQualificationState(leadId)
    
    // Get available handoff options
    const handoffOptions = [
      {
        type: 'booking_link',
        description: 'Direct booking link to schedule page',
        recommended: !qualification || qualification.urgency !== 'urgent'
      },
      {
        type: 'callback_request',
        description: 'Callback request for urgent leads',
        recommended: qualification && qualification.urgency === 'urgent'
      },
      {
        type: 'time_preference',
        description: 'Time-based callback confirmation',
        recommended: qualification && qualification.timePreference !== 'unknown' && qualification.timePreference !== 'anytime'
      },
      {
        type: 'simulated_confirmation',
        description: 'Simulated booking confirmation (demo)',
        recommended: true // Always available for demo
      }
    ]
    
    return NextResponse.json({
      success: true,
      leadId,
      hasQualification: !!qualification,
      qualification,
      handoffOptions,
      defaultConfig: {
        bookingBaseUrl: `/schedule?lead=${encodeURIComponent(leadId)}`,
        useSimulated: true
      }
    })
    
  } catch (error) {
    console.error('Booking handoff options error:', error)
    return NextResponse.json(
      { error: 'Failed to get booking handoff options' },
      { status: 500 }
    )
  }
}