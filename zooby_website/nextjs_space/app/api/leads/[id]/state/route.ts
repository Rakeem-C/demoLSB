export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import {
  setLeadWorkflowStage,
  updateLeadWorkflow,
  type LeadBookingState,
  type LeadInboxStatus,
  type LeadWorkflowStage,
} from '@/lib/lead-inbox'

function isLeadStatus(value: string | null): value is LeadInboxStatus {
  return value === 'new' || value === 'contacted' || value === 'qualified' || value === 'scheduled' || value === 'closed'
}

function isBookingState(value: string | null): value is LeadBookingState {
  return value === 'not-sent' || value === 'sent' || value === 'booked'
}

function isWorkflowStage(value: string | null): value is LeadWorkflowStage {
  return value === 'new_lead' || value === 'qualified' || value === 'booking_sent' || value === 'appointment_booked'
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData()
    const status = formData.get('status')?.toString() ?? null
    const bookingState = formData.get('bookingState')?.toString() ?? null
    const workflowStage = formData.get('workflowStage')?.toString() ?? null

    if (isWorkflowStage(workflowStage)) {
      await setLeadWorkflowStage(params.id, workflowStage)
      return NextResponse.redirect(new URL(`/admin/leads/${params.id}`, request.url))
    }

    if (isLeadStatus(status)) {
      await updateLeadWorkflow(params.id, { kind: 'status', value: status })
    }

    if (isBookingState(bookingState)) {
      if (bookingState === 'booked') {
        await updateLeadWorkflow(params.id, { kind: 'status', value: 'scheduled' })
      }
      await updateLeadWorkflow(params.id, { kind: 'booking', value: bookingState })
    }

    return NextResponse.redirect(new URL(`/admin/leads/${params.id}`, request.url))
  } catch (error) {
    console.error('Lead workflow update error:', error)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}
