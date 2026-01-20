import { useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'

interface UseSessionActivityOptions {
  inactivityTimeout?: number // Milliseconds before considering user inactive
  sessionWarningTime?: number // Time before session expires to show warning
}

export function useSessionActivity(options: UseSessionActivityOptions = {}) {
  const { 
    isAuthenticated, 
    refreshSession, 
    logout 
  } = useAuth()
  
  const {
    inactivityTimeout = 30 * 60 * 1000, // 30 minutes default
    sessionWarningTime = 5 * 60 * 1000   // 5 minutes default
  } = options

  const handleActivity = useCallback(async () => {
    if (!isAuthenticated) return
    
    // Refresh session on user activity
    await refreshSession()
    
    // Store last activity time
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastActivity', Date.now().toString())
    }
  }, [isAuthenticated, refreshSession])

  const checkInactivity = useCallback(async () => {
    if (!isAuthenticated) return

    if (typeof window !== 'undefined') {
      const lastActivity = localStorage.getItem('lastActivity')
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
        
        // Auto-logout if user inactive for too long
        if (timeSinceLastActivity > inactivityTimeout) {
          console.log('User inactive for too long, logging out...')
          logout()
          return
        }
        
        // Show warning if session expires soon
        if (timeSinceLastActivity > inactivityTimeout - sessionWarningTime) {
          console.log('Session expiring soon due to inactivity')
          // You could show a warning dialog here
        }
      }
    }
  }, [isAuthenticated, inactivityTimeout, sessionWarningTime, logout])

  useEffect(() => {
    if (!isAuthenticated) return

    // Track user activity events
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    // Throttle activity tracking to avoid excessive calls
    let activityTimeout: NodeJS.Timeout
    const throttledHandleActivity = () => {
      clearTimeout(activityTimeout)
      activityTimeout = setTimeout(handleActivity, 1000) // Throttle to once per second
    }

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledHandleActivity, { passive: true })
    })

    // Set up inactivity checker
    const inactivityInterval = setInterval(checkInactivity, 60 * 1000) // Check every minute

    // Initial activity tracking
    handleActivity()

    return () => {
      // Clean up event listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledHandleActivity)
      })
      
      clearInterval(inactivityInterval)
      clearTimeout(activityTimeout)
    }
  }, [isAuthenticated, handleActivity, checkInactivity])

  return {
    triggerActivity: handleActivity,
    checkInactivity
  }
}