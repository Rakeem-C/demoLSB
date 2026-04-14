/**
 * Booking handoff for DemoLSB lead response system
 * 
 * Layer 3: Guide qualified leads toward booking action
 * 
 * Options:
 * 1. Booking link (to existing schedule page)
 * 2. Callback request capture
 * 3. "Best time to call" handoff
 * 4. Simulated booking confirmation (demo mode)
 */

import { appendLeadActivityEvent } from './lead-inbox'
import type { QualificationState, TimePreference } from './qualification-engine'
import { getServiceDisplayText, getUrgencyDisplayText, getTimeDisplayText } from './text-mappings'

export type BookingHandoffType = 
  | 'booking_link'
  | 'callback_request'
  | 'time_preference'
  | 'simulated_confirmation'

export type BookingHandoffResult = {
  type: BookingHandoffType
  message: string
  actionUrl?: string
  actionLabel?: string
  simulated?: boolean
}

export type BookingHandoffConfig = {
  // Which handoff type to use based on qualification
  defaultType: BookingHandoffType
  // Base URL for booking links
  bookingBaseUrl: string
  // Whether to use simulated mode (for demo)
  useSimulated: boolean
}

// Default configuration - demo mode
const DEFAULT_CONFIG: BookingHandoffConfig = {
  defaultType: 'simulated_confirmation',
  bookingBaseUrl: '/schedule',
  useSimulated: true // Demo mode by default
}

// Production configuration
const PRODUCTION_CONFIG: BookingHandoffConfig = {
  defaultType: 'booking_link',
  bookingBaseUrl: '/schedule',
  useSimulated: false
}

/**
 * Determine appropriate booking handoff based on qualification
 */
export function determineBookingHandoff(
  qualification: QualificationState,
  leadId: string,
  config: Partial<BookingHandoffConfig> = {}
): BookingHandoffResult {
  // Choose config based on environment
  const baseConfig = process.env.NODE_ENV === 'production' && !config.useSimulated 
    ? PRODUCTION_CONFIG 
    : DEFAULT_CONFIG
  const fullConfig = { ...baseConfig, ...config }
  
  // Use simulated mode if configured
  if (fullConfig.useSimulated) {
    return createSimulatedConfirmation(qualification, leadId)
  }
  
  // Determine handoff type based on qualification
  const handoffType = determineHandoffType(qualification, fullConfig.defaultType)
  
  switch (handoffType) {
    case 'booking_link':
      return createBookingLinkHandoff(qualification, leadId, fullConfig.bookingBaseUrl)
    
    case 'callback_request':
      return createCallbackRequestHandoff(qualification)
    
    case 'time_preference':
      return createTimePreferenceHandoff(qualification)
    
    case 'simulated_confirmation':
      return createSimulatedConfirmation(qualification, leadId)
    
    default:
      return createBookingLinkHandoff(qualification, leadId, fullConfig.bookingBaseUrl)
  }
}

/**
 * Determine best handoff type based on qualification
 */
function determineHandoffType(
  qualification: QualificationState,
  defaultType: BookingHandoffType
): BookingHandoffType {
  // Urgent leads get callback request
  if (qualification.urgency === 'urgent') {
    return 'callback_request'
  }
  
  // Leads with specific time preference get time-based handoff
  if (qualification.timePreference !== 'unknown' && qualification.timePreference !== 'anytime') {
    return 'time_preference'
  }
  
  // All others use default
  return defaultType
}

/**
 * Create booking link handoff
 */
function createBookingLinkHandoff(
  qualification: QualificationState,
  leadId: string,
  baseUrl: string
): BookingHandoffResult {
  const url = `${baseUrl}?lead=${encodeURIComponent(leadId)}&service=${qualification.serviceCategory}`
  
  const serviceText = getServiceDisplayText(qualification.serviceCategory)
  const urgencyText = getUrgencyDisplayText(qualification.urgency)
  
  return {
    type: 'booking_link',
    message: `Based on your interest in ${serviceText} (${urgencyText}), you can schedule a consultation here:`,
    actionUrl: url,
    actionLabel: 'Schedule Consultation',
    simulated: false
  }
}

/**
 * Create callback request handoff
 */
function createCallbackRequestHandoff(
  qualification: QualificationState
): BookingHandoffResult {
  const serviceText = getServiceDisplayText(qualification.serviceCategory)
  
  let callbackTime = 'today'
  if (qualification.timePreference === 'morning') callbackTime = 'this morning'
  if (qualification.timePreference === 'afternoon') callbackTime = 'this afternoon'
  if (qualification.timePreference === 'evening') callbackTime = 'this evening'
  
  return {
    type: 'callback_request',
    message: `Since you need ${serviceText} urgently, a team member will call you ${callbackTime} to discuss immediate next steps.`,
    actionUrl: undefined,
    actionLabel: undefined,
    simulated: false
  }
}

/**
 * Create time preference handoff
 */
function createTimePreferenceHandoff(
  qualification: QualificationState
): BookingHandoffResult {
  const serviceText = getServiceDisplayText(qualification.serviceCategory)
  const timeText = getTimeDisplayText(qualification.timePreference)
  
  return {
    type: 'time_preference',
    message: `Perfect! For your ${serviceText}, we'll call you ${timeText} as requested. Look for a call from our team.`,
    actionUrl: undefined,
    actionLabel: undefined,
    simulated: false
  }
}

/**
 * Create simulated booking confirmation (demo mode)
 */
function createSimulatedConfirmation(
  qualification: QualificationState,
  leadId: string
): BookingHandoffResult {
  const serviceText = getServiceDisplayText(qualification.serviceCategory)
  const urgencyText = getUrgencyDisplayText(qualification.urgency)
  const timeText = getTimeDisplayText(qualification.timePreference)
  
  // Generate a simulated booking reference
  const bookingRef = `BK-${leadId.substring(0, 8).toUpperCase()}`
  const simulatedTime = getSimulatedBookingTime(qualification.timePreference)
  
  return {
    type: 'simulated_confirmation',
    message: `✅ **Booking Confirmed**\n\n` +
             `Service: ${serviceText}\n` +
             `Priority: ${urgencyText}\n` +
             `Scheduled: ${simulatedTime}\n` +
             `Reference: ${bookingRef}\n\n` +
             `(Demo: This simulates a real booking confirmation. In production, this would connect to your scheduling system.)`,
    actionUrl: undefined,
    actionLabel: undefined,
    simulated: true
  }
}

// Text mapping functions now imported from text-mappings.ts

/**
 * Generate simulated booking time based on preference
 */
function getSimulatedBookingTime(timePreference: TimePreference): string {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  let timeOfDay = '10:00 AM'
  switch (timePreference) {
    case 'morning': timeOfDay = '9:00 AM'; break
    case 'afternoon': timeOfDay = '2:00 PM'; break
    case 'evening': timeOfDay = '5:30 PM'; break
  }
  
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  }
  
  const dateStr = tomorrow.toLocaleDateString('en-US', options)
  return `${dateStr} at ${timeOfDay}`
}

/**
 * Log booking handoff to lead timeline
 */
export async function logBookingHandoff(
  leadId: string,
  handoff: BookingHandoffResult,
  qualification: QualificationState
): Promise<void> {
  try {
    let title = 'Booking handoff'
    let detail = handoff.message
    
    switch (handoff.type) {
      case 'booking_link':
        title = 'Booking link presented'
        detail = `Customer directed to booking page for ${getServiceDisplayText(qualification.serviceCategory)}`
        if (handoff.actionUrl) {
          detail += `: ${handoff.actionUrl}`
        }
        break
        
      case 'callback_request':
        title = 'Callback requested'
        detail = `Urgent callback scheduled for ${getTimeDisplayText(qualification.timePreference)}`
        break
        
      case 'time_preference':
        title = 'Time preference confirmed'
        detail = `Callback scheduled for ${getTimeDisplayText(qualification.timePreference)}`
        break
        
      case 'simulated_confirmation':
        title = 'Simulated booking confirmation'
        detail = `Demo booking confirmation sent. Service: ${getServiceDisplayText(qualification.serviceCategory)}, Priority: ${getUrgencyDisplayText(qualification.urgency)}`
        break
    }
    
    if (handoff.simulated) {
      detail += ' (simulated)'
    }
    
    const result = await appendLeadActivityEvent(leadId, {
      type: 'booking-link',
      title,
      detail
    })
    
    if (!result) {
      console.warn(`Failed to log booking handoff for lead ${leadId}`)
    }
  } catch (error) {
    console.warn('Failed to log booking handoff:', error)
  }
}

/**
 * Get final qualification completion message with booking handoff
 */
export function getQualificationCompletionMessage(
  qualification: QualificationState,
  leadId: string,
  config: Partial<BookingHandoffConfig> = {}
): string {
  const handoff = determineBookingHandoff(qualification, leadId, config)
  
  let baseMessage = `Thanks for completing the qualification! `
  
  switch (handoff.type) {
    case 'booking_link':
      return baseMessage + handoff.message + ` ${handoff.actionUrl}`
    
    case 'callback_request':
      return baseMessage + handoff.message
    
    case 'time_preference':
      return baseMessage + handoff.message
    
    case 'simulated_confirmation':
      return handoff.message // Simulated message includes everything
    
    default:
      return baseMessage + 'A team member will contact you shortly.'
  }
}