import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getSecureItem, setSecureItem, deleteSecureItem } from '@/utils/storage';
import { API_BASE_URL } from '@/constants/theme';
import type { ApiResponse, PaginatedResponse } from '@/types';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getSecureItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear stored token on auth failure
      await deleteSecureItem('accessToken');
    }
    return Promise.reject(error);
  }
);

export default api;

// ============================================================
// Auth API — POST /api/v1/masterdata/users/login
// ============================================================
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/v1/masterdata/users/login', { email, password }),

  // Store/clear token helpers
  setToken: (token: string) => setSecureItem('accessToken', token),
  clearToken: () => deleteSecureItem('accessToken'),
  getToken: () => getSecureItem('accessToken'),
};

// ============================================================
// Notifications API — /api/v1/notifications
// ============================================================
export const notificationsApi = {
  list: (params?: { limit?: number; offset?: number; include_read?: boolean }) =>
    api.get('/api/v1/notifications', { params }),
  getById: (id: string) =>
    api.get(`/api/v1/notifications/${id}`),
  getUnreadCount: () =>
    api.get('/api/v1/notifications/unread-count'),
  markRead: (id: string) =>
    api.post(`/api/v1/notifications/${id}/read`),
  markAllRead: () =>
    api.post('/api/v1/notifications/mark-all-read'),
  archive: (id: string) =>
    api.post(`/api/v1/notifications/${id}/archive`),
  delete: (id: string) =>
    api.delete(`/api/v1/notifications/${id}`),
  getPreferences: () =>
    api.get('/api/v1/notifications/preferences'),
  updatePreferences: (prefs: any) =>
    api.put('/api/v1/notifications/preferences', prefs),
};

// ============================================================
// Messaging API — /api/v1/messaging
// ============================================================
export const messagingApi = {
  // Conversations
  getConversations: (params?: { type?: string; limit?: number; offset?: number }) =>
    api.get('/api/v1/messaging/conversations', { params }),
  getOrCreateConversation: (recipientId: string) =>
    api.post('/api/v1/messaging/conversations', { recipient_id: recipientId }),
  getConversation: (id: string) =>
    api.get(`/api/v1/messaging/conversations/${id}`),
  markConversationRead: (id: string) =>
    api.post(`/api/v1/messaging/conversations/${id}/read`),

  // Messages
  getMessages: (conversationId: string, params?: { limit?: number; offset?: number }) =>
    api.get(`/api/v1/messaging/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId: string, content: string, opts?: { nonce?: string; attachment_ids?: string[] }) =>
    api.post(`/api/v1/messaging/conversations/${conversationId}/messages`, { content, ...opts }),
  deleteMessage: (messageId: string) =>
    api.post(`/api/v1/messaging/messages/${messageId}/delete`),

  // Unread count
  getUnreadCount: () =>
    api.get('/api/v1/messaging/unread-count'),

  // Users (contact list)
  getCompanyUsers: () =>
    api.get('/api/v1/messaging/users'),

  // Groups
  createGroup: (name: string, participantIds: string[]) =>
    api.post('/api/v1/messaging/conversations/group', { name, participant_ids: participantIds }),
  getGroupMembers: (id: string) =>
    api.get(`/api/v1/messaging/conversations/${id}/members`),
};

// ============================================================
// Action Items API — /api/v1/action-items (dashboard badges)
// ============================================================
export const actionItemsApi = {
  get: () => api.get('/api/v1/action-items'),
};

// ============================================================
// HR API — /api/v1/hr
// ============================================================
export const hrApi = {
  // Employees
  getEmployees: (params?: any) =>
    api.get('/api/v1/hr/employees/', { params }),
  getEmployee: (id: string) =>
    api.get(`/api/v1/hr/employees/${id}`),
  getEmployeeByUserId: (userId: string) =>
    api.get(`/api/v1/hr/employees/by-user/${userId}`),

  // Attendance
  listAttendance: (params?: any) =>
    api.get('/api/v1/hr/attendance/', { params }),
  createAttendance: (data: any) =>
    api.post('/api/v1/hr/attendance/', data),
  getEmployeeAttendance: (employeeId: string) =>
    api.get(`/api/v1/hr/attendance/employee/${employeeId}`),
  updateAttendance: (id: string, data: any) =>
    api.put(`/api/v1/hr/attendance/${id}`, data),

  // Leave
  listLeaveRequests: (params?: any) =>
    api.get('/api/v1/hr/leave/requests/', { params }),
  createLeaveRequest: (data: any) =>
    api.post('/api/v1/hr/leave/requests/', data),
  getLeaveRequest: (id: string) =>
    api.get(`/api/v1/hr/leave/requests/${id}`),
  approveLeave: (id: string) =>
    api.post(`/api/v1/hr/leave/requests/${id}/approve`),
  rejectLeave: (id: string, reason?: string) =>
    api.post(`/api/v1/hr/leave/requests/${id}/reject`, { reason }),
  cancelLeave: (id: string) =>
    api.post(`/api/v1/hr/leave/requests/${id}/cancel`),
  getLeaveTypes: () =>
    api.get('/api/v1/hr/leave/types/'),
  getLeaveStatistics: () =>
    api.get('/api/v1/hr/leave/statistics'),
  getLeaveBalance: (employeeId: string) =>
    api.get(`/api/v1/hr/leave/balances/employee/${employeeId}`),

  // Payroll
  listPayrollPeriods: (params?: any) =>
    api.get('/api/v1/hr/payroll/periods/', { params }),
  getPayrollPeriod: (id: string) =>
    api.get(`/api/v1/hr/payroll/periods/${id}`),
  getPayrollItems: (params?: any) =>
    api.get('/api/v1/hr/payroll/items', { params }),
};

// ============================================================
// Procurement API — /api/v1/procurement
// ============================================================
export const procurementApi = {
  // Purchase Requests
  listPurchaseRequests: (params?: any) =>
    api.get('/api/v1/procurement/purchase-requests/', { params }),
  getPurchaseRequest: (id: string) =>
    api.get(`/api/v1/procurement/purchase-requests/${id}`),
  approvePurchaseRequest: (id: string, notes?: string) =>
    api.post(`/api/v1/procurement/purchase-requests/${id}/approve`, { notes }),
  rejectPurchaseRequest: (id: string, reason: string) =>
    api.post(`/api/v1/procurement/purchase-requests/${id}/reject`, { reason }),

  // Purchase Orders
  listPurchaseOrders: (params?: any) =>
    api.get('/api/v1/procurement/purchase-orders/', { params }),
  getPurchaseOrder: (id: string) =>
    api.get(`/api/v1/procurement/purchase-orders/${id}`),
};

// ============================================================
// Inventory API — /api/v1/inventory
// ============================================================
export const inventoryApi = {
  getStock: (params?: any) =>
    api.get('/api/v1/inventory/stock/', { params }),
  getStockByArticle: (articleId: string) =>
    api.get(`/api/v1/inventory/stock/${articleId}`),
  listGoodsReceipts: (params?: any) =>
    api.get('/api/v1/inventory/goods-receipts/', { params }),
  listTransfers: (params?: any) =>
    api.get('/api/v1/inventory/transfers/', { params }),
};

// ============================================================
// Master Data API — /api/v1/masterdata
// ============================================================
export const masterdataApi = {
  getUsers: (params?: any) =>
    api.get('/api/v1/masterdata/users/', { params }),
  getUser: (id: string) =>
    api.get(`/api/v1/masterdata/users/${id}`),
  getCurrentUser: () =>
    api.get('/api/v1/masterdata/users/me'),
};
