import { apiClient } from '@/lib/api'
import type { EventFormData } from '@/components/forms/event-form'

// Types matching backend entities
export type EventType = 'event' | 'meeting' | 'task' | 'reminder' | 'holiday'
export type Priority = 'low' | 'medium' | 'high'
export type AttendeeStatus = 'pending' | 'accepted' | 'declined'

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

export interface AddAttendeeRequest {
  user_id: string
}

export interface UpdateAttendeeStatusRequest {
  status: AttendeeStatus
  response_message?: string
}

class CalendarService {
  private baseUrl = '/api/v1/calendar'

  // Event CRUD operations
  async createEvent(data: CreateEventRequest): Promise<Event> {
    const response = await apiClient.post<{success: boolean, message: string, data: Event}>(`${this.baseUrl}/events`, data)
    return response.data
  }

  async getEvent(id: string): Promise<Event> {
    const response = await apiClient.get<{success: boolean, message: string, data: Event}>(`${this.baseUrl}/events/${id}`)
    return response.data
  }

  async updateEvent(id: string, data: UpdateEventRequest): Promise<Event> {
    const response = await apiClient.put<{success: boolean, message: string, data: Event}>(`${this.baseUrl}/events/${id}`, data)
    return response.data
  }

  async deleteEvent(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/events/${id}`)
  }

  // Event listing and filtering
  async listEvents(params?: EventsListParams): Promise<EventsListResponse> {
    const response = await apiClient.get<{success: boolean, message: string, data: EventsListResponse}>(`${this.baseUrl}/events`, {
      start_date: params?.start_date,
      end_date: params?.end_date,
      event_type: params?.event_type,
      priority: params?.priority,
      created_by: params?.created_by,
      user_id: params?.user_id,
      search: params?.search,
      page: params?.page || 1,
      limit: params?.limit || 50,
    })
    return response.data
  }

  async getEventsByMonth(year: number, month: number): Promise<Event[]> {
    const response = await apiClient.get<{success: boolean, message: string, data: Event[]}>(`${this.baseUrl}/events/month/${year}/${month}`)
    return response.data
  }

  async getUserEvents(userId: string, params?: EventsListParams): Promise<EventsListResponse> {
    const response = await apiClient.get<{success: boolean, message: string, data: EventsListResponse}>(`${this.baseUrl}/events/user/${userId}`, {
      start_date: params?.start_date,
      end_date: params?.end_date,
      event_type: params?.event_type,
      priority: params?.priority,
      search: params?.search,
      page: params?.page || 1,
      limit: params?.limit || 50,
    })
    return response.data
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
    const response = await apiClient.get<{success: boolean, message: string, data: EventsListResponse}>(`${this.baseUrl}/events`, {
      start_date: startDate,
      end_date: endDate,
    })
    return response.data.events || []
  }

  // Attendee operations
  async addAttendee(eventId: string, data: AddAttendeeRequest): Promise<void> {
    await apiClient.post(`${this.baseUrl}/attendees/events/${eventId}`, data)
  }

  async removeAttendee(attendeeId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/attendees/${attendeeId}`)
  }

  async updateAttendeeStatus(
    attendeeId: string, 
    data: UpdateAttendeeStatusRequest
  ): Promise<void> {
    await apiClient.put(`${this.baseUrl}/attendees/${attendeeId}/status`, data)
  }

  // Utility methods for frontend calendar integration
  async getCalendarEvents(year: number, month: number): Promise<CalendarEvent[]> {
    try {
      const events = await this.getEventsByMonth(year, month)
      return events.map(event => this.transformToCalendarEvent(event))
    } catch (error) {
      // Return empty array as fallback when API fails
      return []
    }
  }

  async getHolidays(year: number): Promise<CalendarEvent[]> {
    try {
      // Use 2024 data for now since that's what's in the database
      const dataYear = 2024
      const response = await this.listEvents({
        event_type: 'holiday',
        start_date: `${dataYear}-01-01`,
        end_date: `${dataYear}-12-31`,
        limit: 100
      })
      
      // Transform holidays and adjust year if needed
      return response.events.map(event => {
        const calendarEvent = this.transformToCalendarEvent(event)
        // If requesting current year, adjust the holiday dates
        if (year !== dataYear) {
          const originalDate = calendarEvent.date
          calendarEvent.date = new Date(year, originalDate.getMonth(), originalDate.getDate())
          if (calendarEvent.endDate) {
            calendarEvent.endDate = new Date(year, calendarEvent.endDate.getMonth(), calendarEvent.endDate.getDate())
          }
        }
        return calendarEvent
      })
    } catch (error) {
      // Return empty array as fallback when API fails
      return []
    }
  }

  // Transform backend Event to frontend CalendarEvent format
  transformToCalendarEvent(event: Event): CalendarEvent {
    return {
      id: event.id,
      title: event.title,
      date: new Date(event.start_datetime),
      endDate: event.end_datetime ? new Date(event.end_datetime) : undefined,
      type: event.event_type,
      priority: event.priority,
      location: event.location,
      description: event.description,
      isAllDay: event.is_all_day,
      attendees: event.attendees?.map(a => ({
        id: a.user_id,
        name: a.user_name,
        email: a.user_email,
        status: a.status
      })) || []
    }
  }

  // Transform frontend EventFormData to backend CreateEventRequest
  transformFormDataToCreateRequest(formData: EventFormData): CreateEventRequest {
    return {
      title: formData.title,
      description: formData.description || '',
      start_datetime: formData.date.toISOString(),
      end_datetime: formData.endDate?.toISOString(),
      location: formData.location || '',
      event_type: formData.type,
      priority: formData.priority,
      is_all_day: formData.isAllDay || false,
      attendee_ids: formData.attendees?.map(a => a.id) || []
    }
  }

  // Transform frontend EventFormData to backend UpdateEventRequest
  transformFormDataToUpdateRequest(formData: Partial<EventFormData>): UpdateEventRequest {
    const request: UpdateEventRequest = {}
    
    if (formData.title !== undefined) request.title = formData.title
    if (formData.description !== undefined) request.description = formData.description || ''
    if (formData.date !== undefined) request.start_datetime = formData.date.toISOString()
    if (formData.endDate !== undefined) request.end_datetime = formData.endDate?.toISOString()
    if (formData.location !== undefined) request.location = formData.location || ''
    if (formData.type !== undefined) request.event_type = formData.type
    if (formData.priority !== undefined) request.priority = formData.priority
    if (formData.isAllDay !== undefined) request.is_all_day = formData.isAllDay
    if (formData.attendees !== undefined) request.attendee_ids = formData.attendees?.map(a => a.id) || []
    
    return request
  }
}

// Frontend calendar event interface (matching existing calendar component)
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

// EventFormData is imported at the top of the file

// Export singleton instance
export const calendarService = new CalendarService()
export default calendarService