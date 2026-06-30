import {
  cn,
} from "@/shared/utils/utils"

type Props = {
  canSave: boolean

  saveLabel?: string

  onCancel: () => void

  onSave: () => void
}

export function FormDialogFooter({
  canSave,
  saveLabel = "Guardar",
  onCancel,
  onSave,
}: Props) {

  return (

    <div className="flex justify-end gap-3">

      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
      >

        Cancelar

      </button>

      <button
        type="button"
        disabled={!canSave}
        onClick={onSave}
        className={cn(
          "rounded-xl px-5 py-2.5 text-sm font-semibold transition",
          canSave
            ? "bg-white text-black hover:bg-neutral-200"
            : "cursor-not-allowed bg-white/10 text-neutral-600"
        )}
      >

        {saveLabel}

      </button>

    </div>

  )

}