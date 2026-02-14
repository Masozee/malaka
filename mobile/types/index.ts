export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  position: string;
  employeeId: string;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface ApiResponse<T> {
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

export interface ApprovalItem {
  id: string;
  type: 'procurement' | 'finance' | 'hr' | 'inventory' | 'production';
  title: string;
  description?: string;
  requestor: string;
  department: string;
  amount?: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  referenceNumber: string;
  items?: ApprovalLineItem[];
  notes?: string;
  history?: ApprovalHistoryEntry[];
}

export interface ApprovalLineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit?: string;
}

export interface ApprovalHistoryEntry {
  action: string;
  actor: string;
  timestamp: string;
  note?: string;
}

export interface KPICard {
  id: string;
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  subtitle?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  route: string;
  color?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  icon: string;
  iconColor: string;
}

export interface NotificationItem {
  id: string;
  type: 'approval' | 'alert' | 'info' | 'hr' | 'message';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  online: boolean;
  isGroup: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface AttendanceRecord {
  id: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  duration?: string;
  status: 'present' | 'absent' | 'late' | 'holiday' | 'leave';
  location?: string;
  shiftType?: string;
}

export interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
}

export interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
}

export interface PayslipInfo {
  period: string;
  earnings: PayslipLine[];
  deductions: PayslipLine[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
}

export interface PayslipLine {
  label: string;
  amount: number;
}

export interface StockItem {
  id: string;
  articleName: string;
  sku: string;
  classification: string;
  color: string;
  colorHex?: string;
  image?: string;
  warehouses: WarehouseStock[];
}

export interface WarehouseStock {
  warehouseName: string;
  available: number;
  reserved: number;
  total: number;
  isLow: boolean;
}

export interface PendingAction {
  id: string;
  label: string;
  count: number;
  color: string;
  route: string;
}
