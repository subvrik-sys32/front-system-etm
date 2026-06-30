"use client"

import type {
  LucideIcon,
} from "lucide-react"

import {
  AlertTriangle,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  cn,
} from "@/shared/utils/utils"

type Props = {
  open: boolean

  title: string
  description: string

  icon?: LucideIcon

  confirmLabel?: string

  cancelLabel?: string

  variant?: "default" | "danger"

  onClose: () => void

  onConfirm: () => void
}

export function ActionDialog({
  open,
  title,
  description,
  icon: Icon = AlertTriangle,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  onClose,
  onConfirm,
}: Props) {

  const danger =
    variant === "danger"

  return (

    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {

        if (!nextOpen) {
          onClose()
        }

      }}
    >

      <DialogContent
        className="max-w-90 rounded-2xl border border-white/10 bg-[#101012] p-5 text-white shadow-2xl"
      >

        <DialogHeader>

          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">

            <Icon size={20} />

          </div>

          <DialogTitle className="text-lg font-bold">

            {title}

          </DialogTitle>

          <DialogDescription className="pt-3 text-sm leading-relaxed text-neutral-400">

            {description}

          </DialogDescription>

        </DialogHeader>

        <div className="mt-6 flex justify-end gap-2">

          <button
            onClick={onClose}
            className="rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          >

            {cancelLabel}

          </button>

          <button
            onClick={() => {

              onConfirm()
              onClose()

            }}
            className={cn(
              "rounded-xl px-5 py-3 text-sm font-semibold transition",
              danger
                ? "bg-red-500 text-white hover:bg-red-400"
                : "bg-white text-black hover:bg-neutral-200"
            )}
          >

            {confirmLabel}

          </button>

        </div>

      </DialogContent>

    </Dialog>

  )

}