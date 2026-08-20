"use client"

import { useState } from "react"
import { Save } from "lucide-react"

import { FormDialog } from "@/shared/ui/dialogs/form-dialog/form-dialog"
import type { PlanGeometry, Skill } from "../types"
import { cadAiApi } from "../api/cad-ai.api"

interface SaveSkillModalProps {
  geometry: PlanGeometry
  thumbnailPath: string | null
  onSaved: (skill: Skill) => void
  onClose: () => void
}

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
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Nombre *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: Soporte rectangular con agujeros"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Qué hace esta skill / cuándo usarla"
            rows={3}
            className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    </FormDialog>
  )
}
