"use client"

import { useEffect, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { PrimaryAction } from "@/shared/ui/actions/primary-action"
import { HexColorPicker } from "@/shared/ui/color-picker/components/hex-color-picker"
import { Save } from "lucide-react"
import { cn } from "@/shared/utils/utils"

import { useActivityTypeMutations } from "../hooks/use-activity-type-mutations"
import { ACTIVITY_ICONS, getActivityIcon } from "../constants/activity-icons"
import type { ActivityType } from "../types/activity-log.types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Si viene un tipo, es edición — si no, es alta nueva.
  editingType?: ActivityType | null
}

export function ActivityTypeFormDialog({
  open,
  onOpenChange,
  editingType,
}: Props) {

  const { createType, updateType, creating, updating } = useActivityTypeMutations()

  const [label, setLabel] = useState("")
  const [icon, setIcon] = useState("sparkles")
  const [color, setColor] = useState("#0EA5E9")

  const isEditing = !!editingType
  const busy = creating || updating

  useEffect(() => {

    if (open) {
      setLabel(editingType?.label ?? "")
      setIcon(editingType?.icon ?? "sparkles")
      setColor(editingType?.color ?? "#0EA5E9")
    }

  }, [open, editingType])

  const handleSubmit = async () => {

    if (!label.trim()) {
      return
    }

    if (isEditing) {

      await updateType({
        id: editingType.id,
        dto: { label: label.trim(), icon, color },
      })

    } else {

      await createType({
        label: label.trim(),
        icon,
        color,
      })

    }

    onOpenChange(false)

  }

  return (

    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="max-w-sm">

        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar actividad" : "Nueva actividad"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-5 pb-5">

          <div>

            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Nombre
            </label>

            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej: Inventario"
              className="w-full rounded-xl bg-white/6 px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600"
            />

          </div>

          <div className="flex items-center gap-4">

            <div>

              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Color
              </label>

              <HexColorPicker
                value={color}
                onChange={setColor}
                showLabel={false}
                className="h-9 w-16"
              />

            </div>

            <div className="min-w-0 flex-1">

              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Ícono
              </label>

              <div className="grid grid-cols-7 gap-1.5">

                {Object.keys(ACTIVITY_ICONS).map((key) => {

                  const Icon = getActivityIcon(key)
                  const isSelected = icon === key

                  return (

                    <button
                      key={key}
                      type="button"
                      onClick={() => setIcon(key)}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg transition-colors",
                        isSelected ? "bg-white/16 ring-1 ring-white/25" : "bg-white/6 hover:bg-white/10",
                      )}
                    >
                      <Icon size={14} className="text-neutral-200" />
                    </button>

                  )

                })}

              </div>

            </div>

          </div>

          <PrimaryAction
            label={busy ? "Guardando..." : "Guardar"}
            icon={Save}
            onClick={handleSubmit}
            disabled={!label.trim() || busy}
          />

        </div>

      </DialogContent>

    </Dialog>

  )

}