"use client"

import { useState } from "react"

import type { LucideIcon } from "lucide-react"

import { AlertTriangle, Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { cn } from "@/shared/utils/utils"

import { preventNestedDialogClose } from "@/shared/ui/dialogs/prevent-nested-dialog-close"

type Props = {
  open: boolean

  title: string
  description: string

  icon?: LucideIcon

  confirmLabel?: string

  cancelLabel?: string

  /**
   * Texto que se muestra mientras se procesa la acción.
   * Si no se proporciona, usará "Eliminando..." si variant es "danger", o "Guardando..." por defecto.
   */
  submittingLabel?: string

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
  submittingLabel,
  variant = "default",
  onClose,
  onConfirm,
}: Props) {
  const [submitting, setSubmitting] = useState(false)

  const danger = variant === "danger"

  // Determinar automáticamente el texto de carga según la variante
  const loadingText =
    submittingLabel ?? (danger ? "Eliminando..." : "Guardando...")

  async function handleConfirm() {
    if (submitting) {
      return
    }

    setSubmitting(true)

    try {
      await onConfirm()
    } catch {
      // El error ya se comunica vía toast donde corresponda
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

        requestAnimationFrame(onClose)
      }}
    >
      <DialogContent
        className={cn(
          "max-w-[calc(100vw-2rem)] sm:max-w-90 rounded-2xl p-5 text-white shadow-2xl",
          "bg-neutral-900 backdrop-blur-xl"
        )}
        onPointerDownOutside={preventNestedDialogClose}
        onInteractOutside={preventNestedDialogClose}
      >
        <DialogHeader>
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-neutral-200">
            <Icon size={20} />
          </div>

          <DialogTitle className="text-lg font-bold text-white">{title}</DialogTitle>

          <DialogDescription className="pt-3 text-sm leading-relaxed text-neutral-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* En móviles los botones se ordenan verticalmente (flex-col-reverse) para dar suficiente espacio al spinner */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-full sm:w-auto rounded-xl bg-white/5 px-4 py-2.5 text-center text-sm font-medium text-neutral-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            onClick={handleConfirm}
            disabled={submitting}
            className={cn(
              "relative isolate transform-gpu flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
              danger
                ? "bg-red-500 text-white hover:bg-red-400"
                : "bg-white text-black hover:bg-neutral-200",
            )}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin shrink-0" />
                <span className="relative z-10 block transform-gpu">{loadingText}</span>
              </>
            ) : (
              <span className="relative z-10 block transform-gpu">{confirmLabel}</span>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}