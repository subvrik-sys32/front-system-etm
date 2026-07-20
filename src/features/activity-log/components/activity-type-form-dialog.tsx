"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  ListChecks,
} from "lucide-react"

import {
  FormDialog,
} from "@/shared/ui/dialogs/form-dialog/form-dialog"

import {
  EntityColorPicker,
} from "@/shared/ui/entity-dialog/components/entity-color-picker"
import {
  EntityIconPicker,
} from "@/shared/ui/entity-dialog/components/entity-icon-picker"
import {
  EntityNameInput,
} from "@/shared/ui/entity-dialog/components/entity-name-input"
import {
  EntityPreview,
} from "@/shared/ui/entity-dialog/components/entity-preview"

import {
  useActivityTypeMutations,
} from "../hooks/use-activity-type-mutations"

import type {
  ActivityType,
} from "../types/activity-log.types"

import type {
  EntityForm,
} from "@/shared/ui/entity-dialog/entity-dialog.types"

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

// Usa el mismo FormDialog que el resto de entidades del sistema
// (Usuarios, Clientes, etc.) para mantener una experiencia visual
// consistente y reutilizar el footer con Guardar/Cancelar.
export function ActivityTypeFormDialog({
  open,
  onOpenChange,
  editingType,
}: Props) {

  const {
    createType,
    updateType,
    creating,
    updating,
  } = useActivityTypeMutations()

  const [
    value,
    setValue,
  ] = useState<EntityForm>(DEFAULT_VALUE)

  const isEditing =
    !!editingType

  const busy =
    creating ||
    updating

  useEffect(() => {

    if (open) {

      setValue(
        editingType
          ? {
              name: editingType.label,
              color: editingType.color,
              icon: editingType.icon as EntityForm["icon"],
            }
          : DEFAULT_VALUE,
      )

    }

  }, [
    open,
    editingType,
  ])

  async function handleSubmit() {

    if (
      !value.name.trim() ||
      !value.icon
    ) {
      return
    }

    if (isEditing) {

      await updateType({
        id: editingType.id,
        dto: {
          label: value.name.trim(),
          icon: value.icon,
          color: value.color,
        },
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

    <FormDialog
      open={open}
      title={
        isEditing
          ? "Editar actividad"
          : "Nueva actividad"
      }
      icon={ListChecks}
      canSave={
        !!value.name.trim() &&
        !!value.icon
      }
      saving={busy}
      saveLabel={
        isEditing
          ? "Guardar"
          : "Crear actividad"
      }
      savingLabel={
        isEditing
          ? "Guardando..."
          : "Creando actividad..."
      }
      onClose={() => onOpenChange(false)}
      onSave={handleSubmit}
    >

      <div className="flex flex-col gap-4">

        <EntityPreview value={value} />

        <EntityNameInput
          value={value}
          onChange={setValue}
        />

        <EntityColorPicker
          value={value}
          onChange={setValue}
        />

        <EntityIconPicker
          value={value}
          onChange={setValue}
        />

      </div>

    </FormDialog>

  )

}