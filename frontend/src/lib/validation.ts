export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  email?: boolean
  url?: boolean
  custom?: (value: string) => string | undefined
}

export interface ValidationErrors {
  [key: string]: string
}

export function validateField(value: string, rules: ValidationRule): string | undefined {
  // Required check
  if (rules.required && (!value || value.trim() === '')) {
    return 'This field is required'
  }
  
  // Skip other validations if field is empty and not required
  if (!value || value.trim() === '') {
    return undefined
  }
  
  // Min length check
  if (rules.minLength && value.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`
  }
  
  // Max length check
  if (rules.maxLength && value.length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters`
  }
  
  // Email validation
  if (rules.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
  }
  
  // URL validation
  if (rules.url) {
    try {
      new URL(value)
    } catch {
      return 'Please enter a valid URL'
    }
  }
  
  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    return 'Please enter a valid format'
  }
  
  // Custom validation
  if (rules.custom) {
    return rules.custom(value)
  }
  
  return undefined
}

export function validateForm<T extends Record<string, unknown>>(
  data: T, 
  rules: Record<keyof T, ValidationRule>
): ValidationErrors {
  const errors: ValidationErrors = {}
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = String(data[field as keyof T] || '')
    const error = validateField(value, fieldRules)
    if (error) {
      errors[field] = error
    }
  }
  
  return errors
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

// Common validation rules
export const commonRules = {
  required: { required: true },
  email: { required: true, email: true },
  phone: { 
    pattern: /^[+]?[\d\s\-\(\)]{10,}$/,
    custom: (value: string) => {
      if (value && !/^[+]?[\d\s\-\(\)]{10,}$/.test(value)) {
        return 'Please enter a valid phone number'
      }
      return undefined
    }
  },
  hexColor: {
    pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    custom: (value: string) => {
      if (value && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
        return 'Please enter a valid hex color (e.g., #FF0000)'
      }
      return undefined
    }
  },
  code: {
    required: true,
    minLength: 2,
    maxLength: 20,
    pattern: /^[A-Z0-9_-]+$/i,
    custom: (value: string) => {
      if (value && !/^[A-Z0-9_-]+$/i.test(value)) {
        return 'Code can only contain letters, numbers, hyphens, and underscores'
      }
      return undefined
    }
  }
}