"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon01Icon, Sun01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
      <HugeiconsIcon icon={Sun01Icon} className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-600 dark:text-gray-300" />
      <HugeiconsIcon icon={Moon01Icon} className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-600 dark:text-gray-300" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}