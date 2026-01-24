"use client"

import * as React from "react"

interface SidebarContextValue {
  isSecondSidebarCollapsed: boolean
  toggleSecondSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function SidebarProvider({
  children,
  collapsed,
  onToggle
}: {
  children: React.ReactNode
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <SidebarContext.Provider value={{
      isSecondSidebarCollapsed: collapsed,
      toggleSecondSidebar: onToggle
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  return context
}
