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

// --- Secondary Sidebar Slot ---
// Allows pages to inject custom content into the second sidebar

interface SecondarySidebarSlotContextValue {
  slotContent: React.ReactNode | null
  setSlotContent: (content: React.ReactNode | null) => void
}

const SecondarySidebarSlotContext = React.createContext<SecondarySidebarSlotContextValue>({
  slotContent: null,
  setSlotContent: () => {},
})

export function SecondarySidebarSlotProvider({ children }: { children: React.ReactNode }) {
  const [slotContent, setSlotContent] = React.useState<React.ReactNode | null>(null)
  return (
    <SecondarySidebarSlotContext.Provider value={{ slotContent, setSlotContent }}>
      {children}
    </SecondarySidebarSlotContext.Provider>
  )
}

export function useSecondarySidebarSlot() {
  return React.useContext(SecondarySidebarSlotContext)
}
