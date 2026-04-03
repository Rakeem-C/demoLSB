export type LeadInboxStatus = 'new' | 'contacted' | 'qualified' | 'scheduled' | 'closed'
export type LeadInboxUrgency = 'low' | 'medium' | 'high'
export type LeadInboxSource = 'Website form' | 'Google Local Services' | 'Referral' | 'Repeat customer'
export type LeadBookingState = 'not-sent' | 'sent' | 'booked'
export type LeadWorkflowStage = 'new_lead' | 'qualified' | 'booking_sent' | 'appointment_booked'
export type LeadAppointmentDetails = {
  appointmentDate: Date
  timeWindow: string
  assignedRep: string
  visitType: string
}
export type LeadServiceCategory =
  | 'Roof repair'
  | 'Roof replacement'
  | 'Roof renewal'
  | 'Exterior painting'
  | 'Interior painting'
  | 'General estimate'

export type LeadRecommendedAction =
  | 'Call in under 5 minutes'
  | 'Text and call today'
  | 'Book inspection'
  | 'Send estimate follow-up'
  | 'Nurture with callback reminder'

export type LeadActivityType =
  | 'submitted'
  | 'normalized'
  | 'classified'
  | 'created'
  | 'confirmation'
  | 'booking-link'
  | 'status'
  | 'appointment'

export type LeadActivityEvent = {
  id: string
  type: LeadActivityType
  title: string
  detail: string
  at: Date
}

export type LeadInboxItem = {
  id: string
  fullName: string
  firstName: string
  lastName: string
  serviceCategory: LeadServiceCategory
  urgency: LeadInboxUrgency
  status: LeadInboxStatus
  bookingState: LeadBookingState
  source: LeadInboxSource
  submittedAt: Date
  leadScore: number
  summary: string
  recommendedNextAction: LeadRecommendedAction
  email: string
  phone: string
  zipCode: string
  contactPreference: string
  preferredContactTime: string
  originalProjectDetails: string
  message: string
  contactMethod: string
  contactTime: string
  appointment: LeadAppointmentDetails | null
  timeline: LeadActivityEvent[]
}

const demoLeadInbox: LeadInboxItem[] = [
  {
    id: 'demo-lead-1',
    firstName: 'Ariana',
    lastName: 'Salazar',
    fullName: 'Ariana Salazar',
    serviceCategory: 'Roof repair',
    urgency: 'high',
    status: 'new',
    bookingState: 'not-sent',
    source: 'Google Local Services',
    submittedAt: new Date('2026-04-02T16:42:00-07:00'),
    leadScore: 94,
    summary: 'Active leak over the garage after the last storm.',
    recommendedNextAction: 'Call in under 5 minutes',
    email: 'ariana.salazar@example.com',
    phone: '(210) 555-0184',
    zipCode: '78258',
    message: 'Active leak over the garage after last night’s storm. Need someone out as soon as possible.',
    contactMethod: 'call',
    contactTime: 'anytime',
    contactPreference: 'call',
    preferredContactTime: 'anytime',
    originalProjectDetails: 'Active leak over the garage after the last storm. Need someone out as soon as possible.',
    appointment: null,
    timeline: [],
  },
  {
    id: 'demo-lead-2',
    firstName: 'Marcus',
    lastName: 'Nguyen',
    fullName: 'Marcus Nguyen',
    serviceCategory: 'Exterior painting',
    urgency: 'medium',
    status: 'contacted',
    bookingState: 'sent',
    source: 'Website form',
    submittedAt: new Date('2026-04-02T11:18:00-07:00'),
    leadScore: 81,
    summary: 'Looking for an exterior repaint before summer.',
    recommendedNextAction: 'Book inspection',
    email: 'marcus.nguyen@example.com',
    phone: '(210) 555-0133',
    zipCode: '78232',
    message: 'Looking for an exterior repaint before summer. Two-story home, interested in a detailed estimate.',
    contactMethod: 'text',
    contactTime: 'afternoon',
    contactPreference: 'text',
    preferredContactTime: 'afternoon',
    originalProjectDetails: 'Looking for an exterior repaint before summer. Two-story home, interested in a detailed estimate.',
    appointment: null,
    timeline: [],
  },
  {
    id: 'demo-lead-3',
    firstName: 'Denise',
    lastName: 'Ortega',
    fullName: 'Denise Ortega',
    serviceCategory: 'Interior painting',
    urgency: 'low',
    status: 'qualified',
    bookingState: 'sent',
    source: 'Referral',
    submittedAt: new Date('2026-04-01T15:06:00-07:00'),
    leadScore: 72,
    summary: 'Need living room, kitchen, and primary bedroom repainted.',
    recommendedNextAction: 'Send estimate follow-up',
    email: 'denise.ortega@example.com',
    phone: '(210) 555-0168',
    zipCode: '78209',
    message: 'Need living room, kitchen, and primary bedroom repainted. Flexible timing this month.',
    contactMethod: 'call',
    contactTime: 'evening',
    contactPreference: 'call',
    preferredContactTime: 'evening',
    originalProjectDetails: 'Need living room, kitchen, and primary bedroom repainted. Flexible timing this month.',
    appointment: null,
    timeline: [],
  },
  {
    id: 'demo-lead-4',
    firstName: 'James',
    lastName: 'Holloway',
    fullName: 'James Holloway',
    serviceCategory: 'Roof replacement',
    urgency: 'high',
    status: 'scheduled',
    bookingState: 'booked',
    source: 'Repeat customer',
    submittedAt: new Date('2026-03-31T09:24:00-07:00'),
    leadScore: 89,
    summary: 'Roof is 20+ years old and needs replacement quotes.',
    recommendedNextAction: 'Book inspection',
    email: 'james.holloway@example.com',
    phone: '(210) 555-0199',
    zipCode: '78023',
    message: 'Roof is 20+ years old and insurance asked us to get replacement quotes. Returning customer from prior paint work.',
    contactMethod: 'call',
    contactTime: 'morning',
    contactPreference: 'call',
    preferredContactTime: 'morning',
    originalProjectDetails: 'Roof is 20+ years old and insurance asked us to get replacement quotes. Returning customer from prior paint work.',
    appointment: null,
    timeline: [],
  },
]

function inferServiceCategory(message: string): LeadServiceCategory {
  const normalized = message.toLowerCase()

  if (normalized.includes('renewal') || normalized.includes('zoobification')) return 'Roof renewal'
  if (normalized.includes('replace') || normalized.includes('replacement')) return 'Roof replacement'
  if (normalized.includes('roof') || normalized.includes('leak') || normalized.includes('shingle')) return 'Roof repair'
  if (normalized.includes('exterior')) return 'Exterior painting'
  if (normalized.includes('interior') || normalized.includes('cabinet')) return 'Interior painting'
  if (normalized.includes('paint')) return 'Exterior painting'

  return 'General estimate'
}

function inferUrgency(message: string, contactTime: string): LeadInboxUrgency {
  const normalized = `${message} ${contactTime}`.toLowerCase()

  if (
    normalized.includes('urgent') ||
    normalized.includes('asap') ||
    normalized.includes('leak') ||
    normalized.includes('storm') ||
    normalized.includes('immediately')
  ) {
    return 'high'
  }

  if (
    normalized.includes('this week') ||
    normalized.includes('soon') ||
    normalized.includes('estimate')
  ) {
    return 'medium'
  }

  return 'low'
}

function inferLeadScore(serviceCategory: LeadServiceCategory, urgency: LeadInboxUrgency, message: string): number {
  let score = 58

  if (urgency === 'high') score += 24
  if (urgency === 'medium') score += 12

  if (serviceCategory === 'Roof replacement') score += 10
  if (serviceCategory === 'Roof repair') score += 8
  if (serviceCategory === 'Exterior painting') score += 6

  if (message.length > 80) score += 6

  return Math.min(score, 99)
}

function inferRecommendedNextAction(
  urgency: LeadInboxUrgency,
  serviceCategory: LeadServiceCategory
): LeadRecommendedAction {
  if (urgency === 'high') return 'Call in under 5 minutes'
  if (serviceCategory === 'Roof replacement' || serviceCategory === 'Roof repair') return 'Book inspection'
  if (serviceCategory === 'Exterior painting' || serviceCategory === 'Interior painting') return 'Send estimate follow-up'
  return 'Text and call today'
}

function inferVisitType(serviceCategory: LeadServiceCategory) {
  switch (serviceCategory) {
    case 'Roof repair':
    case 'Roof replacement':
    case 'Roof renewal':
      return 'Roof inspection'
    case 'Exterior painting':
      return 'Exterior estimate walk-through'
    case 'Interior painting':
      return 'Interior estimate walk-through'
    default:
      return 'General home estimate'
  }
}

const appointmentWindows = ['8:00 AM - 10:00 AM', '10:30 AM - 12:30 PM', '1:00 PM - 3:00 PM', '3:30 PM - 5:30 PM']
const appointmentReps = ['Maya Hernandez', 'Jordan Patel', 'Elena Torres', 'Chris Walker']

function hashString(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function setAppointmentTime(date: Date, windowIndex: number) {
  const next = new Date(date)
  const hours = [8, 10, 13, 15][windowIndex] ?? 9
  next.setHours(hours, 0, 0, 0)
  return next
}

function inferAppointmentDetails(
  lead: Pick<LeadInboxItem, 'id' | 'submittedAt' | 'serviceCategory' | 'fullName'>
): LeadAppointmentDetails {
  const hash = hashString(`${lead.id}:${lead.fullName}`)
  const windowIndex = hash % appointmentWindows.length
  return {
    appointmentDate: setAppointmentTime(addDays(lead.submittedAt, 2 + (hash % 3)), windowIndex),
    timeWindow: appointmentWindows[windowIndex],
    assignedRep: appointmentReps[hash % appointmentReps.length],
    visitType: inferVisitType(lead.serviceCategory),
  }
}

function formatAppointmentSummary(appointment: LeadAppointmentDetails) {
  return `${appointment.appointmentDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })} · ${appointment.timeWindow} · ${appointment.assignedRep} · ${appointment.visitType}`
}

function inferSummary(message: string) {
  const normalized = message.replace(/\s+/g, ' ').trim()
  if (!normalized) return 'No description provided.'

  const sentenceEnd = normalized.search(/[.!?]/)
  const summary = sentenceEnd > 0 ? normalized.slice(0, sentenceEnd + 1) : normalized
  return summary.length > 140 ? `${summary.slice(0, 137).trimEnd()}...` : summary
}

function normalizeStatus(status?: string): LeadInboxStatus {
  switch ((status ?? '').toLowerCase()) {
    case 'contacted':
      return 'contacted'
    case 'qualified':
      return 'qualified'
    case 'scheduled':
      return 'scheduled'
    case 'closed':
      return 'closed'
    default:
      return 'new'
  }
}

function deriveBookingState(status: LeadInboxStatus): LeadBookingState {
  if (status === 'scheduled') return 'booked'
  if (status === 'contacted' || status === 'qualified') return 'sent'
  return 'not-sent'
}

export function getLeadWorkflowStage(lead: Pick<LeadInboxItem, 'status' | 'bookingState'>): LeadWorkflowStage {
  if (lead.bookingState === 'booked' || lead.status === 'scheduled') return 'appointment_booked'
  if (lead.bookingState === 'sent') return 'booking_sent'
  if (lead.status === 'qualified') return 'qualified'
  return 'new_lead'
}

export function getLeadWorkflowStageLabel(stage: LeadWorkflowStage) {
  switch (stage) {
    case 'qualified':
      return 'qualified'
    case 'booking_sent':
      return 'booking sent'
    case 'appointment_booked':
      return 'appointment booked'
    default:
      return 'new lead'
  }
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000)
}

function buildTimeline(lead: LeadInboxItem, appointment: LeadAppointmentDetails | null = lead.appointment): LeadActivityEvent[] {
  const statusLabels: Record<LeadInboxStatus, string> = {
    new: 'Lead entered the new queue',
    contacted: 'Status changed to contacted',
    qualified: 'Status changed to qualified',
    scheduled: 'Status changed to scheduled',
    closed: 'Status changed to closed',
  }

  const bookingLabels: Record<LeadBookingState, string | null> = {
    'not-sent': null,
    sent: 'Booking link presented',
    booked: 'Appointment booked',
  }

  const events: LeadActivityEvent[] = [
    {
      id: `${lead.id}-submitted`,
      type: 'submitted',
      title: 'Form submitted',
      detail: `Captured through ${lead.source}.`,
      at: lead.submittedAt,
    },
    {
      id: `${lead.id}-normalized`,
      type: 'normalized',
      title: 'Lead normalized',
      detail: 'Public form data was normalized into the canonical lead shape.',
      at: addMinutes(lead.submittedAt, 1),
    },
    {
      id: `${lead.id}-classified`,
      type: 'classified',
      title: 'AI classified',
      detail: `Service category: ${lead.serviceCategory}. Urgency: ${lead.urgency}. Score ${lead.leadScore}. Recommended action: ${lead.recommendedNextAction}.`,
      at: addMinutes(lead.submittedAt, 2),
    },
    {
      id: `${lead.id}-created`,
      type: 'created',
      title: 'Lead created',
      detail: 'Lead record written to the shared demo data layer.',
      at: addMinutes(lead.submittedAt, 3),
    },
    {
      id: `${lead.id}-confirmation`,
      type: 'confirmation',
      title: 'Customer confirmation sent',
      detail: 'The homeowner received a confirmation that the request was received.',
      at: addMinutes(lead.submittedAt, 4),
    },
  ]

  const bookingLabel = bookingLabels[lead.bookingState]
  if (bookingLabel) {
    const appointmentSummary = appointment ? formatAppointmentSummary(appointment) : ''
    events.push({
      id: `${lead.id}-booking`,
      type: lead.bookingState === 'booked' ? 'appointment' : 'booking-link',
      title: bookingLabel,
      detail:
        lead.bookingState === 'booked'
          ? `The appointment is confirmed and on the schedule. ${appointmentSummary}`.trim()
          : 'A booking link was presented to continue scheduling.',
      at: addMinutes(lead.submittedAt, lead.bookingState === 'booked' ? 7 : 5),
    })
  }

  events.push({
    id: `${lead.id}-status`,
    type: 'status',
    title: statusLabels[lead.status],
    detail: `Current status is ${lead.status}.`,
    at: addMinutes(lead.submittedAt, lead.bookingState === 'booked' ? 8 : 6),
  })

  return events.sort((a, b) => a.at.getTime() - b.at.getTime())
}

type LeadWorkflowSnapshot = {
  status: LeadInboxStatus
  bookingState: LeadBookingState
  appointment: LeadAppointmentDetails | null
  timeline: LeadActivityEvent[]
}

type LeadWorkflowStore = Record<string, LeadWorkflowSnapshot>

const workflowGlobal = globalThis as typeof globalThis & {
  __leadWorkflowStore?: LeadWorkflowStore
}

type LeadCreatedStore = LeadInboxItem[]

const intakeGlobal = globalThis as typeof globalThis & {
  __leadCreatedLeads?: LeadCreatedStore
}

function getWorkflowStore() {
  if (!workflowGlobal.__leadWorkflowStore) {
    workflowGlobal.__leadWorkflowStore = {}
  }

  return workflowGlobal.__leadWorkflowStore
}

function getCreatedLeadStore() {
  if (!intakeGlobal.__leadCreatedLeads) {
    intakeGlobal.__leadCreatedLeads = []
  }

  return intakeGlobal.__leadCreatedLeads
}

function upsertCreatedLead(lead: LeadInboxItem) {
  const store = getCreatedLeadStore()
  const index = store.findIndex((item) => item.id === lead.id)

  if (index >= 0) {
    store[index] = lead
    return
  }

  store.unshift(lead)
}

function mergeLeadItems(...groups: LeadInboxItem[][]) {
  const byId = new Map<string, LeadInboxItem>()

  for (const group of groups) {
    for (const lead of group) {
      byId.set(lead.id, lead)
    }
  }

  return sortNewestFirst([...byId.values()])
}

function mapLeadRecord(lead: {
  id: string
  firstName: string
  lastName: string
  zipCode: string
  email: string
  phone: string
  contactMethod: string
  contactTime: string
  message: string
  status: string
  createdAt: Date
}): LeadInboxItem {
  const serviceCategory = inferServiceCategory(lead.message)
  const urgency = inferUrgency(lead.message, lead.contactTime)
  const status = normalizeStatus(lead.status)
  const bookingState = deriveBookingState(status)
  const summary = inferSummary(lead.message)

  return {
    id: lead.id,
    firstName: lead.firstName,
    lastName: lead.lastName,
    fullName: `${lead.firstName} ${lead.lastName}`.trim(),
    serviceCategory,
    urgency,
    status,
    bookingState,
    source: 'Website form',
    submittedAt: lead.createdAt,
    leadScore: inferLeadScore(serviceCategory, urgency, lead.message),
    summary,
    recommendedNextAction: inferRecommendedNextAction(urgency, serviceCategory),
    email: lead.email,
    phone: lead.phone,
    zipCode: lead.zipCode,
    contactPreference: lead.contactMethod,
    preferredContactTime: lead.contactTime,
    originalProjectDetails: lead.message,
    message: lead.message,
    contactMethod: lead.contactMethod,
    contactTime: lead.contactTime,
    appointment: null,
    timeline: [],
  }
}

function sortNewestFirst(leads: LeadInboxItem[]) {
  return [...leads].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
}

function getWorkflowSnapshot(lead: LeadInboxItem): LeadWorkflowSnapshot {
  const store = getWorkflowStore()

  if (!store[lead.id]) {
    const appointment = lead.bookingState === 'booked' ? lead.appointment ?? inferAppointmentDetails(lead) : lead.appointment
    store[lead.id] = {
      status: lead.status,
      bookingState: lead.bookingState,
      appointment,
      timeline: buildTimeline({ ...lead, appointment }, appointment),
    }
  }

  return store[lead.id]
}

function attachWorkflow(lead: LeadInboxItem): LeadInboxItem {
  const snapshot = getWorkflowSnapshot(lead)
  return {
    ...lead,
    status: snapshot.status,
    bookingState: snapshot.bookingState,
    appointment: snapshot.appointment,
    timeline: snapshot.timeline,
  }
}

type LeadIntakeInput = {
  firstName: string
  lastName: string
  zipCode: string
  email: string
  phone: string
  contactMethod: string
  contactTime: string
  message: string
  agreedToTerms: boolean
}

function normalizeLeadIntake(input: Partial<LeadIntakeInput>): LeadIntakeInput {
  return {
    firstName: String(input.firstName ?? '').trim(),
    lastName: String(input.lastName ?? '').trim(),
    zipCode: String(input.zipCode ?? '').trim(),
    email: String(input.email ?? '').trim().toLowerCase(),
    phone: String(input.phone ?? '').trim(),
    contactMethod: String(input.contactMethod ?? 'call').trim().toLowerCase(),
    contactTime: String(input.contactTime ?? 'anytime').trim().toLowerCase(),
    message: String(input.message ?? '').trim(),
    agreedToTerms: Boolean(input.agreedToTerms ?? true),
  }
}

export async function createLeadIntake(input: Partial<LeadIntakeInput>) {
  const normalized = normalizeLeadIntake(input)

  if (!normalized.firstName || !normalized.lastName || !normalized.email || !normalized.phone || !normalized.message) {
    throw new Error('Missing required lead fields')
  }

  let leadRecord: {
    id: string
    firstName: string
    lastName: string
    zipCode: string
    email: string
    phone: string
    contactMethod: string
    contactTime: string
    message: string
    status: string
    createdAt: Date
  }

  try {
    const { prisma } = await import('@/lib/db')
    leadRecord = await prisma.lead.create({
      data: {
        firstName: normalized.firstName,
        lastName: normalized.lastName,
        zipCode: normalized.zipCode,
        email: normalized.email,
        phone: normalized.phone,
        contactMethod: normalized.contactMethod,
        contactTime: normalized.contactTime,
        message: normalized.message,
        agreedToTerms: normalized.agreedToTerms,
      },
    })
  } catch {
    leadRecord = {
      id: `demo-${crypto.randomUUID()}`,
      firstName: normalized.firstName,
      lastName: normalized.lastName,
      zipCode: normalized.zipCode,
      email: normalized.email,
      phone: normalized.phone,
      contactMethod: normalized.contactMethod,
      contactTime: normalized.contactTime,
      message: normalized.message,
      status: 'new',
      createdAt: new Date(),
    }
  }

  const lead = attachWorkflow(mapLeadRecord(leadRecord))
  const workflow = getWorkflowStore()

  workflow[lead.id] = {
    status: lead.status,
    bookingState: lead.bookingState,
    appointment: lead.appointment,
    timeline: buildTimeline(lead, lead.appointment),
  }

  const createdLead = {
    ...lead,
    timeline: workflow[lead.id].timeline,
  }

  upsertCreatedLead(createdLead)

  return createdLead
}

export async function getLeadInboxItems(): Promise<LeadInboxItem[]> {
  try {
    const { prisma } = await import('@/lib/db')
    const leads = await Promise.race([
      prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Lead query timeout')), 2500)
      ),
    ])

    const dbLeads = leads.map(mapLeadRecord).map(attachWorkflow)
    const createdLeads = getCreatedLeadStore().map(attachWorkflow)

    if (!dbLeads.length && !createdLeads.length) {
      return sortNewestFirst(demoLeadInbox.map(attachWorkflow))
    }

    return mergeLeadItems(dbLeads, createdLeads)
  } catch {
    const createdLeads = getCreatedLeadStore().map(attachWorkflow)
    if (!createdLeads.length) {
      return sortNewestFirst(demoLeadInbox.map(attachWorkflow))
    }

    return mergeLeadItems(demoLeadInbox.map(attachWorkflow), createdLeads)
  }
}

export async function getLeadInboxItem(id: string): Promise<LeadInboxItem | null> {
  const leads = await getLeadInboxItems()
  return leads.find((lead) => lead.id === id) ?? null
}

export async function updateLeadWorkflow(
  leadId: string,
  transition:
    | { kind: 'status'; value: LeadInboxStatus }
    | { kind: 'booking'; value: LeadBookingState }
) {
  const lead = await getLeadInboxItem(leadId)

  if (!lead) return null

  const store = getWorkflowStore()
  const snapshot = store[leadId] ?? {
    status: lead.status,
    bookingState: lead.bookingState,
    appointment: lead.appointment,
    timeline: buildTimeline(lead, lead.appointment),
  }

  const now = new Date()

  if (transition.kind === 'status' && snapshot.status !== transition.value) {
    snapshot.status = transition.value
    const statusEvent: LeadActivityEvent = {
      id: `${leadId}-${transition.kind}-${now.getTime()}`,
      type: 'status',
      title: `Status changed to ${transition.value}`,
      detail: `Admin updated the lead status to ${transition.value}.`,
      at: now,
    }
    snapshot.timeline = [
      ...snapshot.timeline,
      statusEvent,
    ].sort((a, b) => a.at.getTime() - b.at.getTime())
  }

  if (transition.kind === 'booking' && snapshot.bookingState !== transition.value) {
    snapshot.bookingState = transition.value
    if (transition.value === 'booked' && !snapshot.appointment) {
      snapshot.appointment = inferAppointmentDetails({
        id: lead.id,
        submittedAt: lead.submittedAt,
        serviceCategory: lead.serviceCategory,
        fullName: lead.fullName,
      })
    }
    const bookingEvent: LeadActivityEvent = {
      id: `${leadId}-${transition.kind}-${now.getTime()}`,
      type: transition.value === 'booked' ? 'appointment' : 'booking-link',
      title: transition.value === 'booked' ? 'Appointment booked' : 'Booking link presented',
      detail:
        transition.value === 'booked'
          ? `The appointment is confirmed and on the schedule. ${snapshot.appointment ? formatAppointmentSummary(snapshot.appointment) : ''}`.trim()
          : 'The booking link was sent to the homeowner.',
      at: now,
    }
    snapshot.timeline = [
      ...snapshot.timeline,
      bookingEvent,
    ].sort((a, b) => a.at.getTime() - b.at.getTime())
  }

  if (transition.kind === 'status' && transition.value === 'scheduled') {
    if (snapshot.bookingState !== 'booked') {
      if (!snapshot.appointment) {
        snapshot.appointment = inferAppointmentDetails({
          id: lead.id,
          submittedAt: lead.submittedAt,
          serviceCategory: lead.serviceCategory,
          fullName: lead.fullName,
        })
      }
      const bookingEvent: LeadActivityEvent = {
        id: `${leadId}-booking-${now.getTime()}`,
        type: 'appointment',
        title: 'Appointment booked',
        detail: `The lead is scheduled and marked as booked. ${snapshot.appointment ? formatAppointmentSummary(snapshot.appointment) : ''}`.trim(),
        at: now,
      }
      snapshot.bookingState = 'booked'
      snapshot.timeline = [...snapshot.timeline, bookingEvent].sort((a, b) => a.at.getTime() - b.at.getTime())
    }
  }

  store[leadId] = snapshot

  try {
    const { prisma } = await import('@/lib/db')
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: snapshot.status },
    })
  } catch {
    // Demo workflow still works from the in-memory snapshot if Prisma is unavailable.
  }

  return getLeadInboxItem(leadId)
}

export async function setLeadWorkflowStage(leadId: string, stage: LeadWorkflowStage) {
  switch (stage) {
    case 'new_lead':
      await updateLeadWorkflow(leadId, { kind: 'status', value: 'new' })
      return getLeadInboxItem(leadId)
    case 'qualified':
      await updateLeadWorkflow(leadId, { kind: 'status', value: 'qualified' })
      return getLeadInboxItem(leadId)
    case 'booking_sent':
      await updateLeadWorkflow(leadId, { kind: 'status', value: 'qualified' })
      await updateLeadWorkflow(leadId, { kind: 'booking', value: 'sent' })
      return getLeadInboxItem(leadId)
    case 'appointment_booked':
      await updateLeadWorkflow(leadId, { kind: 'booking', value: 'booked' })
      await updateLeadWorkflow(leadId, { kind: 'status', value: 'scheduled' })
      return getLeadInboxItem(leadId)
    default:
      return null
  }
}
