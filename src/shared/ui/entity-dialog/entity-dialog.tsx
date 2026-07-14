"use client"

import { useRef } from "react"
import { Palette } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { EntityPreview } from "./components/entity-preview"
import { EntityIconPicker } from "./components/entity-icon-picker"
import { EntityColorPicker } from "./components/entity-color-picker"
import { EntityCustomColor } from "./components/entity-custom-color"
import { EntityNameInput } from "./components/entity-name-input"
import { EntitySaveButton } from "./components/entity-save-button"

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

    <Dialog
      open={open}
      onOpenChange={(v) => {

        if (saving) {
          return
        }

        if (!v) {
          onClose()
        }

      }}
    >

      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          requestAnimationFrame(() => {
            inputRef.current?.focus()
          })
        }}
      >

        <DialogHeader>

          <DialogTitle className="flex items-center gap-3">
            <Palette size={18} />
            {title}
          </DialogTitle>

          <DialogDescription className="sr-only">
            Entity form
          </DialogDescription>

        </DialogHeader>

        <div className="space-y-5 pt-3">

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

          <div className="flex justify-end pt-2">

            <EntitySaveButton
              disabled={!canSave}
              saving={saving}
              savingLabel="Guardando..."
              onClick={save}
            />

          </div>

        </div>

      </DialogContent>

    </Dialog>

  )

}