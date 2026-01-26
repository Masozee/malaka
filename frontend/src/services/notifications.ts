/**
 * Notifications API Service
 * Type-safe API calls for notification endpoints
 */

import { apiClient } from '@/lib/api'

// Types
export type NotificationType =
  | 'order'
  | 'inventory'
  | 'payment'
  | 'production'
  | 'procurement'
  | 'hr'
  | 'system'
  | 'alert'
  | 'info'

export type NotificationStatus = 'unread' | 'read' | 'archived'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  status: NotificationStatus
  action_url?: string
  reference_type?: string
  reference_id?: string
  metadata?: Record<string, unknown>
  sender_id?: string
  sender_name?: string
  created_at: string
  read_at?: string
  archived_at?: string
  expires_at?: string
}

export interface NotificationPreferences {
  id: string
  user_id: string
  in_app_enabled: boolean
  email_enabled: boolean
  order_notifications: boolean
  inventory_notifications: boolean
  payment_notifications: boolean
  production_notifications: boolean
  procurement_notifications: boolean
  hr_notifications: boolean
  system_notifications: boolean
  quiet_hours_start?: string
  quiet_hours_end?: string
  created_at: string
  updated_at: string
}

export interface ListNotificationsResponse {
  notifications: Notification[]
  unread_count: number
  total: number
}

export interface UpdatePreferencesRequest {
  in_app_enabled?: boolean
  email_enabled?: boolean
  order_notifications?: boolean
  inventory_notifications?: boolean
  payment_notifications?: boolean
  production_notifications?: boolean
  procurement_notifications?: boolean
  hr_notifications?: boolean
  system_notifications?: boolean
  quiet_hours_start?: string
  quiet_hours_end?: string
}

export interface CreateTestNotificationRequest {
  title: string
  message: string
  type?: NotificationType
  priority?: NotificationPriority
}

// Service class
class NotificationService {
  private baseUrl = '/api/v1/notifications'

  /**
   * List notifications for the current user
   */
  async listNotifications(options?: {
    limit?: number
    offset?: number
    include_read?: boolean
  }): Promise<ListNotificationsResponse> {
    try {
      const params: Record<string, string> = {}
      if (options?.limit) params.limit = options.limit.toString()
      if (options?.offset) params.offset = options.offset.toString()
      if (options?.include_read) params.include_read = 'true'

      return await apiClient.get<ListNotificationsResponse>(this.baseUrl, params)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      // Return empty response on error
      return { notifications: [], unread_count: 0, total: 0 }
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>(`${this.baseUrl}/unread-count`)
      return response.count
    } catch (error) {
      console.error('Failed to get unread count:', error)
      return 0
    }
  }

  /**
   * Get a specific notification by ID
   */
  async getNotification(id: string): Promise<Notification | null> {
    try {
      return await apiClient.get<Notification>(`${this.baseUrl}/${id}`)
    } catch (error) {
      console.error('Failed to get notification:', error)
      return null
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<boolean> {
    try {
      await apiClient.post(`${this.baseUrl}/${id}/read`)
      return true
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      return false
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      await apiClient.post(`${this.baseUrl}/mark-all-read`)
      return true
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      return false
    }
  }

  /**
   * Archive a notification
   */
  async archiveNotification(id: string): Promise<boolean> {
    try {
      await apiClient.post(`${this.baseUrl}/${id}/archive`)
      return true
    } catch (error) {
      console.error('Failed to archive notification:', error)
      return false
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
      return true
    } catch (error) {
      console.error('Failed to delete notification:', error)
      return false
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences | null> {
    try {
      return await apiClient.get<NotificationPreferences>(`${this.baseUrl}/preferences`)
    } catch (error) {
      console.error('Failed to get notification preferences:', error)
      return null
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(prefs: UpdatePreferencesRequest): Promise<NotificationPreferences | null> {
    try {
      return await apiClient.put<NotificationPreferences>(`${this.baseUrl}/preferences`, prefs)
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
      return null
    }
  }

  /**
   * Create a test notification (for development)
   */
  async createTestNotification(data: CreateTestNotificationRequest): Promise<boolean> {
    try {
      await apiClient.post(`${this.baseUrl}/test`, data)
      return true
    } catch (error) {
      console.error('Failed to create test notification:', error)
      return false
    }
  }

  /**
   * Format the time difference for display
   */
  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  /**
   * Get icon color based on notification type
   */
  getTypeColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      order: 'text-blue-500',
      inventory: 'text-orange-500',
      payment: 'text-green-500',
      production: 'text-purple-500',
      procurement: 'text-indigo-500',
      hr: 'text-pink-500',
      system: 'text-gray-500',
      alert: 'text-red-500',
      info: 'text-cyan-500'
    }
    return colors[type] || 'text-gray-500'
  }

  /**
   * Get priority badge color
   */
  getPriorityColor(priority: NotificationPriority): string {
    const colors: Record<NotificationPriority, string> = {
      low: 'bg-gray-100 text-gray-600',
      normal: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    }
    return colors[priority] || 'bg-gray-100 text-gray-600'
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

// Export for convenience
export default notificationService
