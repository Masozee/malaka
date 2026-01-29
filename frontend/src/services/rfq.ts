import { api } from '@/lib/api';

export interface RFQItem {
  id: string;
  rfq_id: string;
  item_name: string;
  description: string;
  specification: string;
  quantity: number;
  unit: string;
  target_price: number;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
}

export interface RFQSupplier {
  id: string;
  rfq_id: string;
  supplier_id: string;
  invited_at: string;
  responded_at: string | null;
  status: 'invited' | 'responded' | 'declined';
  supplier?: Supplier;
  supplier_name?: string; // Backend returns this directly
  created_at: string;
  updated_at: string;
}

export interface RFQResponse {
  id: string;
  rfq_id: string;
  supplier_id: string;
  response_date: string;
  total_amount: number;
  currency: string;
  delivery_time: number;
  validity_period: number;
  terms_conditions: string;
  notes: string;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  supplier?: Supplier;
  supplier_name?: string; // Backend returns this directly
  created_at: string;
  updated_at: string;
}

export interface RFQ {
  id: string;
  rfq_number: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'closed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_by: string;
  due_date: string | null;
  published_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  items?: RFQItem[];
  suppliers?: RFQSupplier[];
  responses?: RFQResponse[];
}

export interface CreateRFQRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_by: string;
  due_date?: string;
  items: CreateRFQItemRequest[];
  supplier_ids?: string[];
}

export interface CreateRFQItemRequest {
  item_name: string;
  description: string;
  specification: string;
  quantity: number;
  unit: string;
  target_price: number;
}

export interface UpdateRFQRequest {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
}

export interface RFQFilter {
  status?: string;
  created_by?: string;
  page?: number;
  limit?: number;
}

export interface RFQStats {
  total_rfqs: number;
  draft_rfqs: number;
  published_rfqs: number;
  closed_rfqs: number;
  overdue_rfqs: number;
}

export interface RFQListResponse {
  rfqs: RFQ[];
  total: number;
  page: number;
  limit: number;
}

export class RFQService {
  // RFQ is part of Procurement module, not Inventory
  private readonly baseUrl = '/api/v1/procurement/rfqs/';

  /**
   * Get all RFQs with optional filtering and pagination
   */
  async getAllRFQs(filters?: RFQFilter, token?: string): Promise<RFQListResponse> {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.created_by) params.append('created_by', filters.created_by);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`;

    console.log('RFQ Service: Making API call to:', url);

    // Backend returns { data: [...], pagination: { page, limit, total_rows } }
    const response = await api.get<{ success: boolean; data: { data: RFQ[]; pagination: { page: number; limit: number; total_rows: number } } }>(url, {}, { token });
    console.log('RFQ Service: API response:', response);

    // Map backend response to frontend interface
    return {
      rfqs: response.data.data || [],
      total: response.data.pagination?.total_rows || 0,
      page: response.data.pagination?.page || 1,
      limit: response.data.pagination?.limit || 10,
    };
  }

  /**
   * Get RFQ by ID
   */
  async getRFQById(id: string): Promise<RFQ> {
    const response = await api.get<{ success: boolean; data: RFQ }>(`${this.baseUrl}${id}`);
    return response.data;
  }

  /**
   * Create a new RFQ
   */
  async createRFQ(rfq: CreateRFQRequest): Promise<RFQ> {
    // Transform date to RFC3339 format for backend
    const payload = {
      ...rfq,
      due_date: rfq.due_date ? new Date(rfq.due_date + 'T00:00:00Z').toISOString() : undefined,
    };
    const response = await api.post<{ data: RFQ }>(this.baseUrl, payload);
    return response.data;
  }

  /**
   * Update an existing RFQ
   */
  async updateRFQ(id: string, updates: UpdateRFQRequest): Promise<RFQ> {
    // Transform date to RFC3339 format for backend if present
    const payload = {
      ...updates,
      due_date: updates.due_date ? new Date(updates.due_date + 'T00:00:00Z').toISOString() : undefined,
    };
    const response = await api.put<{ data: RFQ }>(`${this.baseUrl}${id}`, payload);
    return response.data;
  }

  /**
   * Delete an RFQ
   */
  async deleteRFQ(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}${id}`);
  }

  /**
   * Publish an RFQ (send to suppliers)
   */
  async publishRFQ(id: string): Promise<RFQ> {
    const response = await api.post<{ data: RFQ }>(`${this.baseUrl}${id}/publish`);
    return response.data;
  }

  /**
   * Close an RFQ
   */
  async closeRFQ(id: string): Promise<RFQ> {
    const response = await api.post<{ data: RFQ }>(`${this.baseUrl}${id}/close`);
    return response.data;
  }

  /**
   * Add item to RFQ
   */
  async addRFQItem(rfqId: string, item: CreateRFQItemRequest): Promise<RFQItem> {
    const response = await api.post<{ data: RFQItem }>(`${this.baseUrl}${rfqId}/items`, item);
    return response.data;
  }

  /**
   * Invite supplier to RFQ
   */
  async inviteSupplier(rfqId: string, supplierId: string): Promise<void> {
    await api.post(`${this.baseUrl}${rfqId}/suppliers`, { supplier_id: supplierId });
  }

  /**
   * Get RFQ statistics
   */
  async getRFQStats(): Promise<RFQStats> {
    console.log('RFQ Service: Getting stats from:', `${this.baseUrl}stats`);
    const response = await api.get<{ success: boolean; data: RFQStats }>(`${this.baseUrl}stats`);
    console.log('RFQ Service: Stats response:', response);
    return response.data;
  }

  /**
   * Get status color for UI display
   */
  getStatusColor(status: RFQ['status']): string {
    switch (status) {
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'published':
        return 'text-blue-600 bg-blue-100';
      case 'closed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Get priority color for UI display
   */
  getPriorityColor(priority: RFQ['priority']): string {
    switch (priority) {
      case 'low':
        return 'text-gray-600 bg-gray-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'urgent':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Format currency value
   */
  formatCurrency(amount: number, currency = 'IDR'): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Check if RFQ is overdue
   */
  isOverdue(rfq: RFQ): boolean {
    if (!rfq.due_date || rfq.status !== 'published') return false;
    return new Date(rfq.due_date) < new Date();
  }

  /**
   * Get days until due date
   */
  getDaysUntilDue(rfq: RFQ): number | null {
    if (!rfq.due_date || rfq.status !== 'published') return null;
    const dueDate = new Date(rfq.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

// Export singleton instance
export const rfqService = new RFQService();