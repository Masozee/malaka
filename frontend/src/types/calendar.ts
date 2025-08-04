// Shared calendar types for the frontend application

export type EventType = 'event' | 'meeting' | 'task' | 'reminder' | 'holiday'
export type Priority = 'low' | 'medium' | 'high'
export type AttendeeStatus = 'pending' | 'accepted' | 'declined'

// Main event interface matching backend
export interface Event {
  id: string
  title: string
  description: string
  start_datetime: string  // ISO string
  end_datetime?: string   // ISO string
  location: string
  event_type: EventType
  priority: Priority
  is_all_day: boolean
  recurrence_rule?: string
  created_by: string
  created_at: string
  updated_at: string
  attendees?: EventAttendee[]
}

// Event attendee interface
export interface EventAttendee {
  id: string
  event_id: string
  user_id: string
  user_name: string
  user_email: string
  status: AttendeeStatus
  response_message?: string
  invited_at: string
  responded_at?: string
}

// Calendar-specific event interface for UI components
export interface CalendarEvent {
  id: string
  title: string
  date: Date
  endDate?: Date
  type: EventType
  priority: Priority
  location?: string
  description?: string
  isAllDay?: boolean
  attendees?: Array<{
    id: string
    name: string
    email: string
    status: AttendeeStatus
  }>
}

// Form data interface for event creation/editing
export interface EventFormData {
  title: string
  description?: string
  date: Date
  endDate?: Date
  location?: string
  type: EventType
  priority: Priority
  isAllDay?: boolean
  attendees?: Array<{
    id: string
    name: string
    email: string
  }>
}

// API request interfaces
export interface CreateEventRequest {
  title: string
  description?: string
  start_datetime: string
  end_datetime?: string
  location?: string
  event_type: EventType
  priority: Priority
  is_all_day?: boolean
  recurrence_rule?: string
  attendee_ids?: string[]
}

export interface UpdateEventRequest {
  title?: string
  description?: string
  start_datetime?: string
  end_datetime?: string
  location?: string
  event_type?: EventType
  priority?: Priority
  is_all_day?: boolean
  recurrence_rule?: string
  attendee_ids?: string[]
}

export interface EventsListParams {
  start_date?: string
  end_date?: string
  event_type?: EventType
  priority?: Priority
  created_by?: string
  user_id?: string
  search?: string
  page?: number
  limit?: number
}

export interface EventsListResponse {
  events: Event[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

// Attendee operation interfaces
export interface AddAttendeeRequest {
  user_id: string
}

export interface UpdateAttendeeStatusRequest {
  status: AttendeeStatus
  response_message?: string
}

// Color mapping for event types (for UI)
export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  event: 'bg-blue-500',
  meeting: 'bg-green-500',
  task: 'bg-orange-500',
  reminder: 'bg-purple-500',
  holiday: 'bg-red-500'
}

// Priority colors
export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-red-500'
}

// Event type labels
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  event: 'Event',
  meeting: 'Meeting',
  task: 'Task',
  reminder: 'Reminder',
  holiday: 'Holiday'
}

// Priority labels
export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
}

// Attendee status labels
export const ATTENDEE_STATUS_LABELS: Record<AttendeeStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined'
}