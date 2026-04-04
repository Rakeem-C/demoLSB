export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { deleteLeadById } from '@/lib/lead-inbox'

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const deletedLead = await deleteLeadById(params.id)

    if (!deletedLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, id: params.id })
  } catch (error) {
    console.error('Lead delete error:', error)
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
