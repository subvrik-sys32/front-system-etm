"use client"

import { Loader2 } from "lucide-react"

import {
  cn,
} from "@/shared/utils/utils"

type Props = {
  canSave: boolean
  saving?: boolean
  saveLabel?: string
  savingLabel?: string
  cancelLabel?: string
  onCancel: () => void
  onSave: () => void
}

export function FormDialogFooter({
  canSave,
  saving = false,
  saveLabel = "Guardar",
  savingLabel = "Guardando...",
  cancelLabel = "Cancelar",
  onCancel,
  onSave,
}: Props) {

  return (

    <div className="flex justify-end gap-3">

      <button
        type="button"
        disabled={saving}
        onClick={onCancel}
        className="rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >

        {cancelLabel}

      </button>

      <button
        type="button"
        disabled={saving}
        onClick={onSave}
        className={cn(
          "flex min-w-38 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition",

          saving
            ? "cursor-not-allowed bg-white/10 text-neutral-400"
            : canSave
              ? "bg-white text-black hover:bg-neutral-200"
              : "bg-white/10 text-neutral-400 hover:bg-white/15",
        )}
      >

        {saving && (

          <Loader2
            size={16}
            className="animate-spin"
          />

        )}

        {saving ? savingLabel : saveLabel}

      </button>

    </div>

  )

}