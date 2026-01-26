import { apiClient } from '@/lib/api'

export interface ValidateInvitationResponse {
  valid: boolean
  email?: string
  role?: string
  company_name?: string
  inviter_name?: string
  expires_at?: string
  error?: string
}

export interface AcceptInvitationRequest {
  token: string
  full_name: string
  password: string
  phone?: string
}

export interface AcceptInvitationResponse {
  user: {
    id: string
    email: string
    fullName: string
    role: string
  }
}

export interface CreateInvitationRequest {
  email: string
  role: string
  company_id: string
  message?: string
}

export interface Invitation {
  id: string
  email: string
  role: string
  company_id: string
  company_name?: string
  invited_by: string
  inviter_name?: string
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  expires_at: string
  created_at: string
  updated_at: string
  metadata?: Record<string, unknown>
}

export interface ListInvitationsResponse {
  invitations: Invitation[]
  total: number
  limit: number
  offset: number
}

class InvitationService {
  /**
   * Validate an invitation token (public endpoint)
   */
  async validateToken(token: string): Promise<ValidateInvitationResponse> {
    try {
      const response = await apiClient.get<{ data: ValidateInvitationResponse }>(
        `/api/v1/invitations/validate/${token}`
      )
      return response.data
    } catch (error: unknown) {
      // Return error response for invalid tokens
      const err = error as { response?: { data?: { message?: string } } }
      return {
        valid: false,
        error: err.response?.data?.message || 'Invalid or expired invitation'
      }
    }
  }

  /**
   * Accept an invitation and create user account (public endpoint)
   */
  async acceptInvitation(data: AcceptInvitationRequest): Promise<AcceptInvitationResponse> {
    const response = await apiClient.post<{ data: AcceptInvitationResponse }>(
      '/api/v1/invitations/accept',
      data
    )
    return response.data
  }

  /**
   * Create a new invitation (requires authentication)
   */
  async createInvitation(data: CreateInvitationRequest): Promise<Invitation> {
    const response = await apiClient.post<{ data: Invitation }>(
      '/api/v1/invitations',
      data
    )
    return response.data
  }

  /**
   * List invitations with optional filters (requires authentication)
   */
  async listInvitations(params?: {
    status?: string
    company_id?: string
    email?: string
    limit?: number
    offset?: number
  }): Promise<ListInvitationsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.company_id) queryParams.append('company_id', params.company_id)
    if (params?.email) queryParams.append('email', params.email)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())

    const queryString = queryParams.toString()
    const url = `/api/v1/invitations${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<{ data: ListInvitationsResponse }>(url)
    return response.data
  }

  /**
   * Get invitation by ID (requires authentication)
   */
  async getInvitation(id: string): Promise<Invitation> {
    const response = await apiClient.get<{ data: Invitation }>(
      `/api/v1/invitations/${id}`
    )
    return response.data
  }

  /**
   * Revoke an invitation (requires authentication)
   */
  async revokeInvitation(id: string): Promise<void> {
    await apiClient.post(`/api/v1/invitations/${id}/revoke`)
  }

  /**
   * Resend invitation email (requires authentication)
   */
  async resendInvitation(id: string): Promise<void> {
    await apiClient.post(`/api/v1/invitations/${id}/resend`)
  }

  /**
   * Delete an invitation (requires authentication)
   */
  async deleteInvitation(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/invitations/${id}`)
  }

  // Alias methods for easier access
  list = this.listInvitations.bind(this)
  create = (data: CreateInvitationRequest) => this.createInvitation(data)
  resend = (id: string) => this.resendInvitation(id)
  revoke = (id: string) => this.revokeInvitation(id)
  delete = (id: string) => this.deleteInvitation(id)
}

export const invitationService = new InvitationService()
export default invitationService
