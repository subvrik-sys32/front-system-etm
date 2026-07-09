"use client"

import type {
  LucideIcon,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

import {
  FormDialogHeader,
} from "./form-dialog-header"

import {
  FormDialogFooter,
} from "./form-dialog-footer"

type Props = {
  open: boolean
  title: string
  icon: LucideIcon
  canSave: boolean
  saving?: boolean
  saveLabel?: string
  savingLabel?: string
  children: React.ReactNode
  onClose: () => void
  onSave: () => void
}

export function FormDialog({
  open,
  title,
  icon,
  canSave,
  saving = false,
  saveLabel,
  savingLabel,
  children,
  onClose,
  onSave,
}: Props) {

  const handleOpenChange = (
    value: boolean
  ) => {

    if (saving) {
      return
    }

    if (!value) {
      onClose()
    }

  }

  return (

    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >

      <DialogContent className="flex max-h-screen w-180 max-w-180 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101012] p-0 text-white shadow-2xl">

        <FormDialogHeader
          title={title}
          icon={icon}
        />

        <div className="erp-scrollbar overflow-y-auto px-5 py-4">

          {children}

        </div>

        <div className="border-t border-white/10 px-5 py-4">

          <FormDialogFooter
            canSave={canSave}
            saving={saving}
            saveLabel={saveLabel}
            savingLabel={savingLabel}
            onCancel={onClose}
            onSave={onSave}
          />

        </div>

      </DialogContent>

    </Dialog>

  )

}