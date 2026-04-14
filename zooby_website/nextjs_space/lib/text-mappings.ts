/**
 * Shared text mappings for DemoLSB qualification system
 * 
 * Centralized text mappings to avoid duplication
 */

import type { ServiceCategory, UrgencyLevel, TimePreference } from './qualification-engine'

/**
 * Get display text for service category
 */
export function getServiceDisplayText(service: ServiceCategory): string {
  switch (service) {
    case 'roof_repair': return 'roof repair'
    case 'roof_replacement': return 'roof replacement'
    case 'exterior_painting': return 'exterior painting'
    case 'interior_painting': return 'interior painting'
    case 'general_estimate': return 'a general estimate'
    case 'unknown': return 'home services'
  }
}

/**
 * Get display text for urgency level
 */
export function getUrgencyDisplayText(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'urgent': return 'urgent'
    case 'soon': return 'soon'
    case 'exploring': return 'exploring options'
    case 'unknown': return 'standard priority'
  }
}

/**
 * Get display text for time preference
 */
export function getTimeDisplayText(time: TimePreference): string {
  switch (time) {
    case 'morning': return 'in the morning'
    case 'afternoon': return 'in the afternoon'
    case 'evening': return 'in the evening'
    case 'anytime': return 'at a convenient time'
    case 'unknown': return 'soon'
  }
}

/**
 * Get friendly stage name for display
 */
export function getStageDisplayText(stage: string): string {
  return stage
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}