// Common Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  department?: string;
  position?: string;
  employeeId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// HR Types
export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'terminated';
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours?: number;
  overtime?: number;
  status: 'present' | 'absent' | 'late' | 'holiday' | 'leave';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'annual' | 'sick' | 'personal' | 'emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  attachments?: string[];
}

export interface PayrollInfo {
  id: string;
  employeeId: string;
  period: string;
  basicSalary: number;
  allowances: number;
  overtime: number;
  deductions: number;
  netSalary: number;
  payDate: string;
  status: 'draft' | 'processed' | 'paid';
}

// Inventory Types
export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  minStock: number;
  maxStock: number;
  location?: string;
  barcode?: string;
  image?: string;
  isActive: boolean;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference: string;
  reason?: string;
  location: string;
  createdBy: string;
  createdAt: string;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  supplierId: string;
  warehouseId: string;
  items: {
    itemId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  receivedBy: string;
  receivedAt: string;
  status: 'draft' | 'received' | 'cancelled';
}

// Master Data Types
export interface Company {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  type: 'individual' | 'company';
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  creditLimit?: number;
  isActive: boolean;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  city?: string;
  manager?: string;
  phone?: string;
  isActive: boolean;
}

// UI Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// PWA Types
export interface InstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface FormData {
  [key: string]: unknown;
}

// Settings Types
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    enabled: boolean;
    types: string[];
  };
  location: {
    enabled: boolean;
    highAccuracy: boolean;
  };
  offline: {
    enabled: boolean;
    syncInterval: number;
  };
}

// Cache Types
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface OfflineAction {
  id: string;
  type: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: unknown;
  timestamp: number;
  retries: number;
}