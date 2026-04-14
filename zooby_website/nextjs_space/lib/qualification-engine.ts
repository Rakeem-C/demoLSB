/**
 * Qualification engine for DemoLSB lead response system
 * 
 * Layer 2: Simple deterministic qualification sequence
 * 
 * Sequence:
 * 1. Service inquiry
 * 2. Urgency assessment
 * 3. Scheduling preference
 */

import { appendLeadActivityEvent } from './lead-inbox'
import { getServiceDisplayText, getUrgencyDisplayText, getTimeDisplayText } from './text-mappings'

export type QualificationStage = 
  | 'not_started'
  | 'service_inquiry'
  | 'urgency_assessment'
  | 'scheduling_preference'
  | 'completed'

export type ServiceCategory =
  | 'roof_repair'
  | 'roof_replacement'
  | 'exterior_painting'
  | 'interior_painting'
  | 'general_estimate'
  | 'unknown'

export type UrgencyLevel =
  | 'urgent'
  | 'soon'
  | 'exploring'
  | 'unknown'

export type TimePreference =
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'anytime'
  | 'unknown'

export interface QualificationState {
  stage: QualificationStage
  serviceCategory: ServiceCategory
  urgency: UrgencyLevel
  timePreference: TimePreference
  lastMessageSent: string
  lastCustomerReply?: string
  completedAt?: Date
}

export interface ConversationMessage {
  id: string
  type: 'system' | 'customer'
  content: string
  timestamp: Date
  stage: QualificationStage
}

/**
 * Default empty qualification state
 */
export function createDefaultQualificationState(): QualificationState {
  return {
    stage: 'not_started',
    serviceCategory: 'unknown',
    urgency: 'unknown',
    timePreference: 'unknown',
    lastMessageSent: ''
  }
}

/**
 * Parse service category from customer reply
 */
export function parseServiceCategory(reply: string): ServiceCategory {
  const normalized = reply.toLowerCase().trim()
  
  if (normalized.includes('roof') && (normalized.includes('repair') || normalized.includes('fix') || normalized.includes('leak'))) {
    return 'roof_repair'
  }
  
  if (normalized.includes('roof') && normalized.includes('replace')) {
    return 'roof_replacement'
  }
  
  if (normalized.includes('exterior') && normalized.includes('paint')) {
    return 'exterior_painting'
  }
  
  if (normalized.includes('interior') && normalized.includes('paint')) {
    return 'interior_painting'
  }
  
  if (normalized.includes('estimate') || normalized.includes('quote') || normalized.includes('inspection')) {
    return 'general_estimate'
  }
  
  return 'unknown'
}

/**
 * Parse urgency level from customer reply
 */
export function parseUrgencyLevel(reply: string): UrgencyLevel {
  const normalized = reply.toLowerCase().trim()
  
  if (normalized.includes('urgent') || normalized.includes('emergency') || normalized.includes('asap') || normalized.includes('immediately')) {
    return 'urgent'
  }
  
  if (normalized.includes('soon') || normalized.includes('this week') || normalized.includes('next week')) {
    return 'soon'
  }
  
  if (normalized.includes('exploring') || normalized.includes('just looking') || normalized.includes('not sure')) {
    return 'exploring'
  }
  
  return 'unknown'
}

/**
 * Parse time preference from customer reply
 */
export function parseTimePreference(reply: string): TimePreference {
  const normalized = reply.toLowerCase().trim()
  
  if (normalized.includes('morning') || normalized.includes('am') || normalized.includes('before noon')) {
    return 'morning'
  }
  
  if (normalized.includes('afternoon') || normalized.includes('pm') || normalized.includes('1') || normalized.includes('2') || normalized.includes('3')) {
    return 'afternoon'
  }
  
  if (normalized.includes('evening') || normalized.includes('night') || normalized.includes('after 5') || normalized.includes('after 6')) {
    return 'evening'
  }
  
  if (normalized.includes('anytime') || normalized.includes('flexible') || normalized.includes('whatever')) {
    return 'anytime'
  }
  
  return 'unknown'
}

/**
 * Get next system message based on current stage
 */
export function getNextSystemMessage(
  stage: QualificationStage,
  customerName: string,
  previousState?: Partial<QualificationState>
): { message: string; nextStage: QualificationStage } {
  switch (stage) {
    case 'not_started':
      return {
        message: `Hey ${customerName}, got your request — quick question so I can help you faster: what service are you looking for?`,
        nextStage: 'service_inquiry'
      }
    
    case 'service_inquiry':
      return {
        message: `Got it — is this something you're looking to get done soon or just exploring?`,
        nextStage: 'urgency_assessment'
      }
    
    case 'urgency_assessment':
      return {
        message: `Perfect — what's the best time for a quick call to discuss details?`,
        nextStage: 'scheduling_preference'
      }
    
    case 'scheduling_preference':
      // Layer 3: Booking handoff integration
      // Note: leadId must be provided by caller
      const defaultMessage = `Thanks for the details! A team member will reach out at your preferred time.`
      
      return {
        message: defaultMessage,
        nextStage: 'completed'
      }
    
    case 'completed':
      return {
        message: `All set! We'll be in touch soon.`,
        nextStage: 'completed'
      }
    
    default:
      return {
        message: `Thanks for reaching out! We'll follow up shortly.`,
        nextStage: 'completed'
      }
  }
}

/**
 * Process customer reply and update qualification state
 */
export function processCustomerReply(
  currentState: QualificationState,
  customerReply: string,
  customerName: string
): { 
  updatedState: QualificationState
  systemResponse?: string
  shouldAdvance: boolean
} {
  const updatedState = { ...currentState }
  updatedState.lastCustomerReply = customerReply
  
  let systemResponse: string | undefined
  let shouldAdvance = false
  
  switch (currentState.stage) {
    case 'service_inquiry':
      const serviceCategory = parseServiceCategory(customerReply)
      updatedState.serviceCategory = serviceCategory
      
      if (serviceCategory !== 'unknown') {
        shouldAdvance = true
        const next = getNextSystemMessage('service_inquiry', customerName, updatedState)
        systemResponse = next.message
        updatedState.stage = next.nextStage
        updatedState.lastMessageSent = systemResponse
      } else {
        // Ask for clarification
        systemResponse = `I'm not sure I understand. Are you looking for roof repair, painting, or a general estimate?`
        updatedState.lastMessageSent = systemResponse
        // Stay in same stage
      }
      break
    
    case 'urgency_assessment':
      const urgency = parseUrgencyLevel(customerReply)
      updatedState.urgency = urgency
      
      if (urgency !== 'unknown') {
        shouldAdvance = true
        const next = getNextSystemMessage('urgency_assessment', customerName, updatedState)
        systemResponse = next.message
        updatedState.stage = next.nextStage
        updatedState.lastMessageSent = systemResponse
      } else {
        // Ask for clarification
        systemResponse = `Just to clarify, is this urgent (needs immediate attention), soon (within a few weeks), or are you just exploring options?`
        updatedState.lastMessageSent = systemResponse
        // Stay in same stage
      }
      break
    
    case 'scheduling_preference':
      const timePreference = parseTimePreference(customerReply)
      updatedState.timePreference = timePreference
      
      if (timePreference !== 'unknown') {
        shouldAdvance = true
        const next = getNextSystemMessage('scheduling_preference', customerName, updatedState)
        systemResponse = next.message
        updatedState.stage = next.nextStage
        updatedState.lastMessageSent = systemResponse
        updatedState.completedAt = new Date()
        
        // Layer 3: Booking handoff will be handled by API route
        // The API route will have access to the actual leadId
      } else {
        // Ask for clarification
        systemResponse = `What time generally works best for you: morning, afternoon, or evening?`
        updatedState.lastMessageSent = systemResponse
        // Stay in same stage
      }
      break
    
    default:
      // If we're in an unexpected stage, just acknowledge
      systemResponse = `Thanks for your message! We'll follow up shortly.`
      updatedState.lastMessageSent = systemResponse
      updatedState.stage = 'completed'
      updatedState.completedAt = new Date()
  }
  
  return {
    updatedState,
    systemResponse,
    shouldAdvance
  }
}

/**
 * Start qualification sequence for a new lead
 */
export function startQualificationSequence(customerName: string): {
  initialState: QualificationState
  firstMessage: string
} {
  const initialState = createDefaultQualificationState()
  const { message, nextStage } = getNextSystemMessage('not_started', customerName)
  
  initialState.stage = nextStage
  initialState.lastMessageSent = message
  
  return {
    initialState,
    firstMessage: message
  }
}

/**
 * Log qualification activity to lead timeline
 */
export async function logQualificationActivity(
  leadId: string,
  activity: {
    type: 'stage_started' | 'customer_reply' | 'system_response' | 'qualification_completed'
    stage: QualificationStage
    details: string
    state?: Partial<QualificationState>
  }
): Promise<void> {
  try {
    let title = ''
    let detail = activity.details
    
    switch (activity.type) {
      case 'stage_started':
        title = `Qualification: ${activity.stage.replace('_', ' ')}`
        break
      case 'customer_reply':
        title = 'Customer replied to qualification'
        break
      case 'system_response':
        title = 'System qualification response'
        break
      case 'qualification_completed':
        title = 'Qualification sequence completed'
        if (activity.state) {
          detail += ` Service: ${activity.state.serviceCategory}, Urgency: ${activity.state.urgency}, Time: ${activity.state.timePreference}`
        }
        break
    }
    
    const result = await appendLeadActivityEvent(leadId, {
      type: 'notification',
      title,
      detail
    })
    
    if (!result) {
      console.warn(`Failed to log qualification activity for lead ${leadId}`)
    }
  } catch (error) {
    console.warn('Failed to log qualification activity:', error)
  }
}

/**
 * Check if qualification is complete
 */
export function isQualificationComplete(state: QualificationState): boolean {
  return state.stage === 'completed' && state.completedAt !== undefined
}

/**
 * Get summary of qualification results
 */
export function getQualificationSummary(state: QualificationState): string {
  if (!isQualificationComplete(state)) {
    return 'Qualification in progress'
  }
  
  const serviceText = getServiceDisplayText(state.serviceCategory)
  const urgencyText = getUrgencyDisplayText(state.urgency)
  const timeText = getTimeDisplayText(state.timePreference)
  
  return `Service: ${serviceText}, Urgency: ${urgencyText}, Preferred time: ${timeText}`
}