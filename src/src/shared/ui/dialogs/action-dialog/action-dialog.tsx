"use client"

import { useState } from "react"

import type {
  LucideIcon,
} from "lucide-react"

import {
  AlertTriangle,
  Loader2,
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

import { preventNestedDialogClose } from "@/shared/ui/dialogs/prevent-nested-dialog-close"

type Props = {
  open: boolean

  title: string
  description: string

  icon?: LucideIcon

  confirmLabel?: string

  cancelLabel?: string

  variant?: "default" | "danger"

  onClose: () => void

  onConfirm: () => void | Promise<void>
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

  const [submitting, setSubmitting] = useState(false)

  const danger =
    variant === "danger"

  async function handleConfirm() {

    if (submitting) {
      return
    }

    setSubmitting(true)

    try {

      await onConfirm()

    } catch {

      // El error ya se comunica vía toast donde corresponda
      // (ej. safeRequest de useWorkflowStepActions); acá solo
      // evitamos que la promesa quede sin manejar y que el
      // diálogo se rompa o quede en un estado inconsistente.

    } finally {

      setSubmitting(false)

    }

  }

  return (

    <Dialog
      open={open}
      onOpenChange={nextOpen => {

        if (nextOpen || submitting) {
          return
        }

        requestAnimationFrame(
          onClose,
        )

      }}
    >

      <DialogContent
        className="max-w-90 rounded-2xl bg-[#101012] p-5 text-white shadow-2xl"
        onPointerDownOutside={preventNestedDialogClose}
        onInteractOutside={preventNestedDialogClose}
      >

        <DialogHeader>

          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">

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
            disabled={submitting}
            className="rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >

            {cancelLabel}

          </button>

          <button
            onClick={handleConfirm}
            disabled={submitting}
            className={cn(
              "flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
              danger
                ? "bg-red-500 text-white hover:bg-red-400"
                : "bg-white text-black hover:bg-neutral-200",
            )}
          >

            {submitting && (
              <Loader2 size={14} className="animate-spin" />
            )}

            {submitting ? "Guardando..." : confirmLabel}

          </button>

        </div>

      </DialogContent>

    </Dialog>

  )

}