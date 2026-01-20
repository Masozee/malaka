"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ModalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  loading?: boolean
  onSubmit: (e: React.FormEvent) => void
  children: React.ReactNode
  submitText?: string
  cancelText?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl"
}

export function ModalForm({
  open,
  onOpenChange,
  title,
  loading = false,
  onSubmit,
  children,
  submitText = "Save",
  cancelText = "Cancel",
  size = "md"
}: ModalFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            {children}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : submitText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}