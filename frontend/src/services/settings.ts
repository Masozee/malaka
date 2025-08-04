/**
 * Settings API Service - Secure Frontend Interface
 * Handles all settings operations with proper security and data validation
 */

import { apiClient } from '@/lib/api';

// Types for settings data
export interface PublicSetting {
  category: string;
  sub_category?: string;
  setting_key: string;
  setting_value?: string;
  data_type: string;
  default_value?: string;
  description?: string;
}

export interface SettingPermission {
  can_read: boolean;
  can_write: boolean;
}

export interface SettingUpdate {
  value: string;
  change_reason?: string;
}

export interface BulkSettingUpdate {
  settings: Record<string, string>;
  change_reason?: string;
}

export interface AuditLogEntry {
  id: string;
  setting_id: string;
  old_value?: string;
  new_value?: string;
  changed_by?: string;
  change_reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Settings categories
export const SETTING_CATEGORIES = {
  GENERAL: 'general',
  CURRENCY: 'currency',
  TAX: 'tax',
  API: 'api',
  EMAIL: 'email',
  SECURITY: 'security',
  DATABASE: 'database',
  NOTIFICATIONS: 'notifications', 
  APPEARANCE: 'appearance',
  LOCALIZATION: 'localization'
} as const;

export type SettingCategory = typeof SETTING_CATEGORIES[keyof typeof SETTING_CATEGORIES];

/**
 * Settings Service Class
 * Provides secure access to settings with proper error handling and validation
 */
class SettingsService {
  private baseUrl = '/api/v1/settings';

  /**
   * Get public settings (safe for unauthenticated access)
   * These settings are marked as public in the database and contain no sensitive data
   */
  async getPublicSettings(category?: SettingCategory): Promise<Record<string, any>> {
    try {
      const params = category ? { category } : {};
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: Record<string, any>;
      }>(`${this.baseUrl}/public`, params);
      
      return response.data || {};
    } catch (error) {
      console.error('Failed to fetch public settings:', error);
      // Return empty object as fallback for public settings
      return {};
    }
  }

  /**
   * Get settings for authenticated user based on their role
   * Includes permission checking and data filtering
   */
  async getUserSettings(category?: SettingCategory, includeValues: boolean = true): Promise<any[]> {
    try {
      const params: any = { include_values: includeValues };
      if (category) params.category = category;

      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: any[];
      }>(`${this.baseUrl}/user`, params);
      
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
      throw new Error('Failed to load settings. Please check your permissions.');
    }
  }

  /**
   * Get settings by category with proper security filtering
   */
  async getSettingsByCategory(category: SettingCategory): Promise<Record<string, any>> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: Record<string, any>;
      }>(`${this.baseUrl}/category/${category}`);
      
      return response.data || {};
    } catch (error) {
      console.error(`Failed to fetch ${category} settings:`, error);
      throw new Error(`Failed to load ${category} settings.`);
    }
  }

  /**
   * Update a single setting with validation and security checks
   */
  async updateSetting(
    category: SettingCategory, 
    key: string, 
    update: SettingUpdate
  ): Promise<void> {
    try {
      // Client-side validation
      if (!update.value && update.value !== '') {
        throw new Error('Setting value is required');
      }

      await apiClient.put<{
        success: boolean;
        message: string;
      }>(`${this.baseUrl}/${category}/${key}`, update);
      
    } catch (error: any) {
      console.error(`Failed to update setting ${category}.${key}:`, error);
      
      // Handle specific error cases
      if (error.message?.includes('permission')) {
        throw new Error('You do not have permission to update this setting.');
      } else if (error.message?.includes('validation')) {
        throw new Error('Invalid setting value. Please check the format.');
      } else {
        throw new Error('Failed to update setting. Please try again.');
      }
    }
  }

  /**
   * Update multiple settings in a single transaction
   */
  async updateBulkSettings(bulkUpdate: BulkSettingUpdate): Promise<void> {
    try {
      if (!bulkUpdate.settings || Object.keys(bulkUpdate.settings).length === 0) {
        throw new Error('No settings provided for update');
      }

      await apiClient.put<{
        success: boolean;
        message: string;
      }>(`${this.baseUrl}/bulk`, bulkUpdate);
      
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      
      if (error.message?.includes('permission')) {
        throw new Error('You do not have permission to update one or more settings.');
      } else {
        throw new Error('Failed to update settings. Please try again.');
      }
    }
  }

  /**
   * Check user permissions for a settings category
   */
  async getPermissions(category: SettingCategory): Promise<SettingPermission> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: SettingPermission;
      }>(`${this.baseUrl}/permissions`, { category });
      
      return response.data || { can_read: false, can_write: false };
    } catch (error) {
      console.error(`Failed to fetch permissions for ${category}:`, error);
      // Return restrictive permissions on error
      return { can_read: false, can_write: false };
    }
  }

  /**
   * Get audit log for a specific setting
   */
  async getAuditLog(
    category: SettingCategory, 
    key: string, 
    limit: number = 50
  ): Promise<AuditLogEntry[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: AuditLogEntry[];
      }>(`${this.baseUrl}/audit/${category}/${key}`, { limit });
      
      return response.data || [];
    } catch (error: any) {
      console.error(`Failed to fetch audit log for ${category}.${key}:`, error);
      
      if (error.message?.includes('permission')) {
        throw new Error('You do not have permission to view audit logs.');
      } else {
        throw new Error('Failed to load audit log.');
      }
    }
  }

  /**
   * Safely get a setting value with fallback
   */
  getSafeValue(
    settings: Record<string, any>, 
    key: string, 
    defaultValue: any = null,
    dataType: 'string' | 'number' | 'boolean' = 'string'
  ): any {
    const value = settings[key];
    
    if (value === undefined || value === null) {
      return defaultValue;
    }

    // Type conversion with validation
    switch (dataType) {
      case 'boolean':
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value.toLowerCase() === 'true';
        return Boolean(value);
        
      case 'number':
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const num = parseFloat(value);
          return isNaN(num) ? defaultValue : num;
        }
        return defaultValue;
        
      case 'string':
      default:
        return String(value);
    }
  }

  /**
   * Format currency according to settings
   */
  formatCurrency(
    amount: number,
    settings: Record<string, any>,
    mounted: boolean = true
  ): string {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) {
      return '';
    }

    const symbol = this.getSafeValue(settings, 'currency_symbol', 'Rp');
    const position = this.getSafeValue(settings, 'currency_position', 'before');
    const thousandSep = this.getSafeValue(settings, 'thousand_separator', '.');
    const decimalSep = this.getSafeValue(settings, 'decimal_separator', ',');
    const decimalPlaces = this.getSafeValue(settings, 'decimal_places', 2, 'number');

    // Format the number
    const formatted = amount.toFixed(decimalPlaces)
      .replace('.', '|DECIMAL|') // Temporary placeholder
      .replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep)
      .replace('|DECIMAL|', decimalSep);

    return position === 'before' ? `${symbol} ${formatted}` : `${formatted} ${symbol}`;
  }

  /**
   * Get theme settings for UI
   */
  getThemeSettings(settings: Record<string, any>) {
    return {
      theme: this.getSafeValue(settings, 'theme', 'system'),
      primaryColor: this.getSafeValue(settings, 'primary_color', 'blue'),
      sidebarCollapsed: this.getSafeValue(settings, 'sidebar_collapsed', false, 'boolean')
    };
  }

  /**
   * Get localization settings
   */
  getLocalizationSettings(settings: Record<string, any>) {
    return {
      language: this.getSafeValue(settings, 'language', 'id-ID'),
      numberFormat: this.getSafeValue(settings, 'number_format', 'id-ID'),
      timezone: this.getSafeValue(settings, 'timezone', 'Asia/Jakarta'),
      dateFormat: this.getSafeValue(settings, 'date_format', 'dd/MM/yyyy')
    };
  }
}

// Export singleton instance
export const settingsService = new SettingsService();

// Export utility functions
export const formatSafeCurrency = (
  amount: number, 
  settings: Record<string, any>, 
  mounted: boolean = true
) => settingsService.formatCurrency(amount, settings, mounted);

export const getSafeSetting = (
  settings: Record<string, any>, 
  key: string, 
  defaultValue: any = null,
  dataType: 'string' | 'number' | 'boolean' = 'string'
) => settingsService.getSafeValue(settings, key, defaultValue, dataType);

// Default export
export default settingsService;