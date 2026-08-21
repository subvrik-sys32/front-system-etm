"use client"

import { useState } from "react"
import { Save, Layers, Loader2 } from "lucide-react"

import { FormDialog } from "@/shared/ui/dialogs/form-dialog/form-dialog"
import { cn } from "@/shared/utils/utils"
import type { PlanGeometry, Skill } from "../types"
import { cadAiApi } from "../api/cad-ai.api"

interface SaveSkillModalProps {
  geometry: PlanGeometry
  thumbnailPath: string | null
  onSaved: (skill: Skill) => void
  onClose: () => void
}

const EASE = "duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
const CARD = `rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] transition-colors ${EASE}`
/** Mismo formato que la barra de búsqueda de SkillLibrary: sin borde propio en el input, el contenedor lo aporta. */
const FIELD_WRAP = "flex items-start gap-2 rounded-lg bg-foreground/5 px-3.5 py-2.5"

export function SaveSkillModal({
  geometry,
  thumbnailPath,
  onSaved,
  onClose,
}: SaveSkillModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = name.trim().length > 0 && !loading

  const handleSave = async () => {
    if (!name.trim()) {
      setError("El nombre es obligatorio")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const skill = await cadAiApi.createSkill({
        name: name.trim(),
        description: description.trim(),
        geometry,
        thumbnailPath: thumbnailPath || undefined,
      })
      onSaved(skill)
    } catch (err: any) {
      setError(err?.message ?? "Error al guardar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormDialog
      open
      title="Guardar como Skill"
      icon={Save}
      canSave={canSave}
      saving={loading}
      saveLabel="Guardar"
      savingLabel="Guardando..."
      cancelLabel="Cancelar"
      onClose={onClose}
      onSave={handleSave}
    >
      <div className="space-y-4">
        {/* Mismo relleno de card + área de miniatura que las cards de la grilla en SkillLibrary. */}
        <div className={cn("flex aspect-[4/3] w-full items-center justify-center overflow-hidden", CARD)}>
          {thumbnailPath && !thumbnailPath.startsWith("blob:") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailPath}
              alt="Vista previa"
              className="h-full w-full object-contain p-4"
            />
          ) : (
            <Layers className="size-8 text-muted-foreground/30" />
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Nombre *
          </label>
          <div className={FIELD_WRAP}>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Soporte rectangular con agujeros"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Descripción
          </label>
          <div className={FIELD_WRAP}>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Qué hace esta skill / cuándo usarla"
              rows={3}
              className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin text-primary" />
            Guardando skill…
          </div>
        )}

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    </FormDialog>
  )
}