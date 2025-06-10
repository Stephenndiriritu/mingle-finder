import React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface CustomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function CustomDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: CustomDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        {/* Always include a DialogTitle, even if visually hidden */}
        <DialogTitle className={!title ? "sr-only" : undefined}>
          {title || "Dialog"}
        </DialogTitle>
        
        {description && <DialogDescription>{description}</DialogDescription>}
        
        {children}
      </DialogContent>
    </Dialog>
  )
}