/**
 * Payroll Utility Functions
 * Hydration-safe formatters for payroll data
 */

/**
 * Get month name safely with bounds checking
 */
export const getMonthName = (month: number): string => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  if (typeof month !== 'number' || month < 1 || month > 12) {
    return 'Invalid Month'
  }
  
  return monthNames[month - 1]
}

/**
 * Format currency safely with hydration protection
 */
export const formatCurrency = (amount?: number, mounted: boolean = true): string => {
  if (!mounted || typeof amount !== 'number' || isNaN(amount)) {
    return ''
  }
  return `Rp ${amount.toLocaleString('id-ID')}`
}

/**
 * Format date safely with hydration protection
 */
export const formatDate = (dateString?: string, mounted: boolean = true): string => {
  if (!mounted || !dateString) {
    return ''
  }
  
  try {
    return new Date(dateString).toLocaleDateString('id-ID')
  } catch {
    return ''
  }
}

/**
 * Format period display (month + year)
 */
export const formatPeriod = (month?: number, year?: number, mounted: boolean = true): string => {
  if (!mounted || typeof month !== 'number' || typeof year !== 'number') {
    return ''
  }
  return `${getMonthName(month)} ${year}`
}

/**
 * Safe calculation helper for complex payroll calculations
 */
export const safeCalculate = (calculation: () => number, mounted: boolean = true): string => {
  if (!mounted) return ''
  
  try {
    const result = calculation()
    return isNaN(result) ? '' : formatCurrency(result, mounted)
  } catch {
    return ''
  }
}

/**
 * Safe property access helper
 */
export const safeAccess = <T>(obj: any, path: string, defaultValue: T): T => {
  try {
    return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? defaultValue
  } catch {
    return defaultValue
  }
}