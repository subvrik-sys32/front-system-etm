"use client"

import { useEffect, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { EntityNameInput } from "@/shared/ui/entity-dialog/components/entity-name-input"
import { EntityColorPicker } from "@/shared/ui/entity-dialog/components/entity-color-picker"
import { EntityIconPicker } from "@/shared/ui/entity-dialog/components/entity-icon-picker"
import { EntityPreview } from "@/shared/ui/entity-dialog/components/entity-preview"
import { EntitySaveButton } from "@/shared/ui/entity-dialog/components/entity-save-button"

import { useActivityTypeMutations } from "../hooks/use-activity-type-mutations"
import type { ActivityType } from "../types/activity-log.types"
import type { EntityForm } from "@/shared/ui/entity-dialog/entity-dialog.types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Si viene un tipo, es edición — si no, es alta nueva.
  editingType?: ActivityType | null
}

const DEFAULT_VALUE: EntityForm = {
  name: "",
  color: "#3B82F6",
  icon: undefined,
}

// Mismo kit que ya usa Cliente y el resto de entidades con
// nombre+color+ícono (EntityNameInput/EntityColorPicker/
// EntityIconPicker/EntityPreview/EntitySaveButton) — antes esto
// tenía su propio grid de 7 íconos hardcodeados y un input de texto
// suelto, sin relación con el resto de la app.
export function ActivityTypeFormDialog({
  open,
  onOpenChange,
  editingType,
}: Props) {

  const { createType, updateType, creating, updating } = useActivityTypeMutations()

  const [value, setValue] = useState<EntityForm>(DEFAULT_VALUE)

  const isEditing = !!editingType
  const busy = creating || updating

  useEffect(() => {

    if (open) {
      setValue(
        editingType
          ? { name: editingType.label, color: editingType.color, icon: editingType.icon as EntityForm["icon"] }
          : DEFAULT_VALUE,
      )
    }

  }, [open, editingType])

  const handleSubmit = async () => {

    if (!value.name.trim() || !value.icon) {
      return
    }

    if (isEditing) {

      await updateType({
        id: editingType.id,
        dto: { label: value.name.trim(), icon: value.icon, color: value.color },
      })

    } else {

      await createType({
        label: value.name.trim(),
        icon: value.icon,
        color: value.color,
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

          <EntityPreview value={value} />

          <EntityNameInput value={value} onChange={setValue} />

          <EntityColorPicker value={value} onChange={setValue} />

          <EntityIconPicker value={value} onChange={setValue} />

          <div className="flex justify-center">

            <EntitySaveButton
              disabled={!value.name.trim() || !value.icon}
              saving={busy}
              onClick={handleSubmit}
            />

          </div>

        </div>

      </DialogContent>

    </Dialog>

  )

}