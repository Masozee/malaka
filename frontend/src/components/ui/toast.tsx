"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, XCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

export type ToastType = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col space-y-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 200)
  }

  const getTypeStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
          icon: CheckCircle,
          iconColor: "text-green-500 dark:text-green-400"
        }
      case "error":
        return {
          bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
          icon: XCircle,
          iconColor: "text-red-500 dark:text-red-400"
        }
      case "warning":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
          icon: AlertCircle,
          iconColor: "text-yellow-500 dark:text-yellow-400"
        }
      case "info":
        return {
          bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
          icon: Info,
          iconColor: "text-blue-500 dark:text-blue-400"
        }
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
          icon: Info,
          iconColor: "text-gray-500 dark:text-gray-400"
        }
    }
  }

  const typeStyles = getTypeStyles(toast.type)
  const Icon = typeStyles.icon

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        ${typeStyles.bg}
        border rounded-lg p-4 shadow-lg backdrop-blur-sm
        transform transition-all duration-200 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${typeStyles.iconColor}`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {toast.title}
          </p>
          {toast.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {toast.description}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

// Convenience functions for common toast types
export const toast = {
  success: (title: string, description?: string, duration?: number) => ({
    type: "success" as const,
    title,
    description,
    duration
  }),
  error: (title: string, description?: string, duration?: number) => ({
    type: "error" as const,
    title,
    description,
    duration
  }),
  warning: (title: string, description?: string, duration?: number) => ({
    type: "warning" as const,
    title,
    description,
    duration
  }),
  info: (title: string, description?: string, duration?: number) => ({
    type: "info" as const,
    title,
    description,
    duration
  })
}