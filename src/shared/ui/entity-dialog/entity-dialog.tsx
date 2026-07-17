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

import { VerticalScroll } from "@/shared/ui/vertical-scroll/vertical-scroll"

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

      {/*
        Migrado al mismo patrón que FormDialog: header fijo arriba,
        cuerpo scrolleable con flechas (VerticalScroll) en el medio,
        botón Guardar fijo abajo en su propio footer — en vez de
        vivir adentro del área scrolleable, donde en formularios
        largos (con selector de ícono, por ejemplo) quedaba fuera de
        vista hasta scrollear hasta el final. "p-0" + "overflow-hidden"
        pisan los defaults del DialogContent base (p-6, overflow-y-auto)
        vía tailwind-merge, para que el scroll real lo maneje
        VerticalScroll y no el propio DialogContent.
      */}
      <DialogContent
        className="flex max-h-[85vh] flex-col overflow-hidden p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          requestAnimationFrame(() => {
            inputRef.current?.focus()
          })
        }}
      >

        <div className="shrink-0 px-6 pt-6">

          <DialogHeader>

            <DialogTitle className="flex items-center gap-3">
              <Palette size={18} />
              {title}
            </DialogTitle>

            <DialogDescription className="sr-only">
              Entity form
            </DialogDescription>

          </DialogHeader>

        </div>

        <VerticalScroll
          containerClassName="flex min-h-0 flex-1 flex-col"
          className="px-6 py-4"
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

        </VerticalScroll>

        <div className="flex shrink-0 justify-end px-6 pb-6 pt-2">

          <EntitySaveButton
            disabled={!canSave}
            saving={saving}
            savingLabel="Guardando..."
            onClick={save}
          />

        </div>

      </DialogContent>

    </Dialog>

  )

}