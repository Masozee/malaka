// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8084';

// App Configuration
export const APP_NAME = 'Malaka ERP Mobile';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Mobile access to Malaka ERP system';

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'malaka_auth_token',
  REFRESH_TOKEN: 'malaka_refresh_token',
  USER_DATA: 'malaka_user_data',
  SETTINGS: 'malaka_settings',
  CACHE_PREFIX: 'malaka_cache_',
  OFFLINE_QUEUE: 'malaka_offline_queue',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  HR: {
    EMPLOYEES: '/hr/employees',
    ATTENDANCE: '/hr/attendance',
    LEAVE: '/hr/leave',
    PAYROLL: '/hr/payroll',
    PERFORMANCE: '/hr/performance',
  },
  INVENTORY: {
    ITEMS: '/inventory/items',
    STOCK: '/inventory/stock',
    MOVEMENTS: '/inventory/movements',
    RECEIPTS: '/inventory/receipts',
  },
  MASTER_DATA: {
    COMPANIES: '/master-data/companies',
    CUSTOMERS: '/master-data/customers',
    SUPPLIERS: '/master-data/suppliers',
    WAREHOUSES: '/master-data/warehouses',
  },
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// Cache Constants
export const CACHE_DURATION = {
  SHORT: 5 * TIME_CONSTANTS.MINUTE,
  MEDIUM: 30 * TIME_CONSTANTS.MINUTE,
  LONG: 2 * TIME_CONSTANTS.HOUR,
  VERY_LONG: TIME_CONSTANTS.DAY,
} as const;

// PWA Constants
export const PWA_CONFIG = {
  INSTALL_PROMPT_DELAY: 3 * TIME_CONSTANTS.DAY,
  UPDATE_CHECK_INTERVAL: TIME_CONSTANTS.HOUR,
  OFFLINE_FALLBACK_URL: '/offline',
} as const;

// Geolocation Constants
export const GEOLOCATION_CONFIG = {
  HIGH_ACCURACY: {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
  },
  LOW_ACCURACY: {
    enableHighAccuracy: false,
    timeout: 15000,
    maximumAge: 600000, // 10 minutes
  },
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ALL: ['image/*', 'application/pdf', '.doc', '.docx'],
  },
} as const;

// Theme Constants
export const THEME = {
  COLORS: {
    PRIMARY: '#2563eb',
    SECONDARY: '#64748b',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6',
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
  },
} as const;

// Validation Constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  LOCATION_ERROR: 'Unable to get your location. Please enable location services.',
  CAMERA_ERROR: 'Unable to access camera. Please check permissions.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  UNSUPPORTED_FILE: 'File type not supported.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  SAVE_SUCCESS: 'Changes saved successfully.',
  DELETE_SUCCESS: 'Item deleted successfully.',
  UPLOAD_SUCCESS: 'File uploaded successfully.',
  ATTENDANCE_SUCCESS: 'Attendance recorded successfully.',
} as const;

// Feature Flags
export const FEATURES = {
  BIOMETRIC_AUTH: true,
  OFFLINE_MODE: true,
  PUSH_NOTIFICATIONS: true,
  CAMERA_UPLOAD: true,
  GEOLOCATION: true,
  DARK_MODE: false, // Coming soon
  MULTI_LANGUAGE: false, // Coming soon
} as const;