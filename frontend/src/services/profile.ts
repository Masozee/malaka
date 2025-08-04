import { apiClient } from '@/lib/api'

// Profile data types based on existing profile page interfaces
export interface UserProfile {
  // Personal Information
  id: string
  employee_id: string
  full_name: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  marital_status: 'single' | 'married' | 'divorced' | 'widowed'
  nationality: string
  religion: string
  avatar?: string
  
  // Address Information
  address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  emergency_contact: {
    name: string
    relationship: string
    phone: string
    address: string
  }
  
  // Employment Information
  position: string
  department: string
  division: string
  manager: string
  employment_type: 'full-time' | 'part-time' | 'contract' | 'intern'
  employment_status: 'active' | 'probation' | 'notice' | 'terminated'
  hire_date: string
  work_location: string
  work_schedule: string
  
  // System timestamps
  created_at: string
  updated_at: string
}

export interface UpdateProfileRequest {
  full_name?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed'
  nationality?: string
  religion?: string
  address?: {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  emergency_contact?: {
    name?: string
    relationship?: string
    phone?: string
    address?: string
  }
}

export interface NotificationSettings {
  email: {
    enabled: boolean
    types: {
      task_assignments: boolean
      deadline_reminders: boolean
      performance_reviews: boolean
      leave_approvals: boolean
      payroll_notifications: boolean
      system_updates: boolean
      security_alerts: boolean
      marketing_updates: boolean
    }
  }
  push: {
    enabled: boolean
    types: {
      urgent_messages: boolean
      meeting_reminders: boolean
      deadline_alerts: boolean
      approval_requests: boolean
      system_notifications: boolean
    }
  }
  sms: {
    enabled: boolean
    types: {
      security_alerts: boolean
      emergency_notifications: boolean
      leave_approvals: boolean
    }
  }
  desktop: {
    enabled: boolean
    types: {
      task_updates: boolean
      chat_messages: boolean
      calendar_events: boolean
      system_alerts: boolean
    }
  }
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'colleagues' | 'managers' | 'private'
  show_contact_info: boolean
  show_salary_info: boolean
  show_performance_data: boolean
  show_attendance_data: boolean
  show_education_info: boolean
  show_skills_info: boolean
  allow_direct_messages: boolean
  allow_mentions: boolean
  searchable_profile: boolean
  data_sharing: {
    analytics: boolean
    performance: boolean
    usage: boolean
  }
}

export interface SecuritySettings {
  two_factor_auth: {
    enabled: boolean
    method: 'sms' | 'email' | 'authenticator'
    backup_codes: string[]
  }
  login_sessions: Array<{
    id: string
    device: string
    location: string
    last_active: string
    current: boolean
  }>
  password_settings: {
    last_changed: string
    require_change: boolean
    strength: 'weak' | 'medium' | 'strong'
  }
  account_activity: Array<{
    id: string
    action: string
    timestamp: string
    location: string
    device: string
  }>
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  color_scheme: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  compact_mode: boolean
  font_size: 'small' | 'medium' | 'large'
  sidebar_collapsed: boolean
  animations: boolean
  high_contrast: boolean
}

export interface LanguageSettings {
  language: string
  region: string
  timezone: string
  date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  time_format: '12h' | '24h'
  currency: string
  number_format: 'US' | 'EU' | 'IN'
  first_day_of_week: 'monday' | 'sunday'
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  confirm_password: string
}

export interface ProfileStatsResponse {
  attendance_rate: number
  performance_rating: number
  leave_balance: number
  achievements_count: number
  current_goals: Array<{
    id: string
    title: string
    description: string
    progress: number
    target_date: string
  }>
  recent_achievements: Array<{
    id: string
    title: string
    description: string
    date: string
    type: string
  }>
}

class ProfileService {
  private readonly BASE_URL = '/api/v1/profile'

  // Profile Management
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: UserProfile}>(`${this.BASE_URL}`)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    try {
      const response = await apiClient.put<{success: boolean, message: string, data: UserProfile}>(`${this.BASE_URL}`, data)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await apiClient.post<{success: boolean, message: string, data: { avatar_url: string }}>(`${this.BASE_URL}/avatar`, formData, {
        'Content-Type': 'multipart/form-data'
      })
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw error
    }
  }

  async deleteAvatar(): Promise<void> {
    try {
      const response = await apiClient.delete<{success: boolean, message: string}>(`${this.BASE_URL}/avatar`)
      
      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }
    } catch (error) {
      console.error('Error deleting avatar:', error)
      throw error
    }
  }

  // Settings Management
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: NotificationSettings}>(`${this.BASE_URL}/settings/notifications`)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error fetching notification settings:', error)
      throw error
    }
  }

  async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    try {
      const response = await apiClient.put<{success: boolean, message: string, data: NotificationSettings}>(`${this.BASE_URL}/settings/notifications`, settings)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error updating notification settings:', error)
      throw error
    }
  }

  async getPrivacySettings(): Promise<PrivacySettings> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: PrivacySettings}>(`${this.BASE_URL}/settings/privacy`)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error fetching privacy settings:', error)
      throw error
    }
  }

  async updatePrivacySettings(settings: PrivacySettings): Promise<PrivacySettings> {
    try {
      const response = await apiClient.put<{success: boolean, message: string, data: PrivacySettings}>(`${this.BASE_URL}/settings/privacy`, settings)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error updating privacy settings:', error)
      throw error
    }
  }

  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: SecuritySettings}>(`${this.BASE_URL}/settings/security`)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error fetching security settings:', error)
      throw error
    }
  }

  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    try {
      const response = await apiClient.put<{success: boolean, message: string, data: SecuritySettings}>(`${this.BASE_URL}/settings/security`, settings)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error updating security settings:', error)
      throw error
    }
  }

  async getAppearanceSettings(): Promise<AppearanceSettings> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: AppearanceSettings}>(`${this.BASE_URL}/settings/appearance`)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error fetching appearance settings:', error)
      throw error
    }
  }

  async updateAppearanceSettings(settings: AppearanceSettings): Promise<AppearanceSettings> {
    try {
      const response = await apiClient.put<{success: boolean, message: string, data: AppearanceSettings}>(`${this.BASE_URL}/settings/appearance`, settings)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error updating appearance settings:', error)
      throw error
    }
  }

  async getLanguageSettings(): Promise<LanguageSettings> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: LanguageSettings}>(`${this.BASE_URL}/settings/language`)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error fetching language settings:', error)
      throw error
    }
  }

  async updateLanguageSettings(settings: LanguageSettings): Promise<LanguageSettings> {
    try {
      const response = await apiClient.put<{success: boolean, message: string, data: LanguageSettings}>(`${this.BASE_URL}/settings/language`, settings)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error updating language settings:', error)
      throw error
    }
  }

  // Security Management
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      const response = await apiClient.post<{success: boolean, message: string}>(`${this.BASE_URL}/change-password`, data)
      
      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  }

  async enableTwoFactorAuth(method: 'sms' | 'email' | 'authenticator'): Promise<{ qr_code?: string, backup_codes: string[] }> {
    try {
      const response = await apiClient.post<{success: boolean, message: string, data: { qr_code?: string, backup_codes: string[] }}>(`${this.BASE_URL}/security/2fa/enable`, { method })
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error enabling 2FA:', error)
      throw error
    }
  }

  async disableTwoFactorAuth(password: string): Promise<void> {
    try {
      const response = await apiClient.post<{success: boolean, message: string}>(`${this.BASE_URL}/security/2fa/disable`, { password })
      
      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error)
      throw error
    }
  }

  async terminateSession(sessionId: string): Promise<void> {
    try {
      const response = await apiClient.delete<{success: boolean, message: string}>(`${this.BASE_URL}/security/sessions/${sessionId}`)
      
      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }
    } catch (error) {
      console.error('Error terminating session:', error)
      throw error
    }
  }

  async getProfileStats(): Promise<ProfileStatsResponse> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: ProfileStatsResponse}>(`${this.BASE_URL}/stats`)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error fetching profile stats:', error)
      throw error
    }
  }

  async downloadProfileData(): Promise<Blob> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/export`, {}, 'blob')
      return response as Blob
    } catch (error) {
      console.error('Error downloading profile data:', error)
      throw error
    }
  }

  async deleteAccount(password: string): Promise<void> {
    try {
      const response = await apiClient.delete<{success: boolean, message: string}>(`${this.BASE_URL}/delete-account`, { password })
      
      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      throw error
    }
  }
}

export const profileService = new ProfileService()
export default profileService