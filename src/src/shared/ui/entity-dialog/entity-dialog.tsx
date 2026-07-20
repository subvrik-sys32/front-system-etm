"use client"

import { useRef } from "react"
import { Palette } from "lucide-react"

import { FormDialog } from "@/shared/ui/dialogs/form-dialog/form-dialog"

import { EntityPreview } from "./components/entity-preview"
import { EntityIconPicker } from "./components/entity-icon-picker"
import { EntityColorPicker } from "./components/entity-color-picker"
import { EntityCustomColor } from "./components/entity-custom-color"
import { EntityNameInput } from "./components/entity-name-input"

import { useEntityDialog } from "./hooks/use-entity-dialog"

import type { EntityForm } from "./entity-dialog.types"
import type { EntityIcon } from "@/shared/constants/entity-icons"

type Props = {
  open: boolean
  title: string
  initialValue?: EntityForm
  fixedIcon?: EntityIcon
  allowedIcons?: EntityIcon[]
  showIconPicker: boolean
  previewVariant: "solid" | "subtle"
  onClose: () => void
  onSubmit: (value: EntityForm) => void | Promise<void>
}

// Migrado de un Dialog/DialogContent a medida al mismo FormDialog
// compartido que ya usan ProjectDialog/TaskDialog/UserDialog — mismo
// header (ícono + título), mismo footer (Cancelar/Guardar blanco),
// mismo comportamiento fullscreen en mobile. Antes era un modal
// chico aparte con su propio look, inconsistente con el resto de
// los diálogos de creación/edición de la app.
export function EntityDialog({
  open,
  title,
  initialValue,
  fixedIcon,
  allowedIcons,
  showIconPicker,
  previewVariant,
  onClose,
  onSubmit,
}: Props) {

  const inputRef = useRef<HTMLInputElement>(null)

  const {
    form,
    setForm,
    save,
    canSave,
    saving,
  } = useEntityDialog({
    open,
    value: initialValue,
    fixedIcon,
    onSave: onSubmit,
    onClose,
  })

  return (

    <FormDialog
      open={open}
      title={title}
      icon={Palette}
      canSave={canSave}
      saving={saving}
      savingLabel="Guardando..."
      onClose={onClose}
      onSave={save}
    >

      <div className="space-y-5">

        <EntityPreview value={form} variant={previewVariant} />

        <EntityNameInput
          ref={inputRef}
          value={form}
          onChange={setForm}
        />

        {showIconPicker && (
          <EntityIconPicker
            value={form}
            onChange={setForm}
            allowedIcons={allowedIcons}
          />
        )}

        <EntityColorPicker value={form} onChange={setForm} />

        <EntityCustomColor value={form} onChange={setForm} />

      </div>

    </FormDialog>

  )

}