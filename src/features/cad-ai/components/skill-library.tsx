"use client"

import { useState, useEffect } from "react"
import { Search, Trash2, Layers, Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FormDialogHeader } from "@/shared/ui/dialogs/form-dialog/form-dialog-header"
import { cn } from "@/shared/utils/utils"
import type { Skill } from "../types"
import { cadAiApi } from "../api/cad-ai.api"

interface SkillLibraryProps {
  onOpenSkill: (skill: Skill) => void
  onClose: () => void
}

/**
 * Mismo shell que ExportDialog / FormDialog:
 * Dialog + DialogContent size="large" → overlay del sistema
 * (bg-black/50 + backdrop-blur-sm) y fullscreen en mobile.
 */
export function SkillLibrary({ onOpenSkill, onClose }: SkillLibraryProps) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await cadAiApi.getSkills()
        if (!cancelled) setSkills(data)
      } catch (err) {
        console.error("Failed to load skills:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("¿Eliminar esta skill?")) return
    try {
      await cadAiApi.deleteSkill(id)
      setSkills(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      console.error("Failed to delete skill:", err)
    }
  }

  const filtered = skills.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Dialog open onOpenChange={next => { if (!next) onClose() }}>
      <DialogContent
        size="large"
        className={cn(
          "flex flex-col gap-0 overflow-hidden rounded-2xl p-0 text-foreground shadow-2xl",
          "h-[85vh] max-h-[85vh] w-full max-w-4xl bg-popover",
        )}
      >
        <div className="shrink-0">
          <FormDialogHeader
            title="Biblioteca de Skills"
            description="Piezas paramétricas guardadas"
            icon={Layers}
          />
        </div>

        <div className="shrink-0 px-5 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar skills..."
              className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="relative min-h-0 w-full flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="px-5 pb-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <p className="text-sm">Cargando skills...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-foreground/5 text-primary">
                    <Layers className="size-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {search ? "Sin resultados" : "No hay skills guardadas aún"}
                  </p>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    {search
                      ? "Prueba con otro término de búsqueda"
                      : "Analiza un plano y guárdalo como skill para reutilizarlo"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 desktop:grid-cols-3">
                  {filtered.map(skill => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => onOpenSkill(skill)}
                      className="group flex flex-col rounded-xl border border-border bg-card p-3 text-left transition hover:border-primary/40 hover:shadow-md"
                    >
                      <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-secondary/40">
                        {skill.thumbnail && !skill.thumbnail.startsWith("blob:") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={skill.thumbnail}
                            alt={skill.name}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <Layers className="size-8 text-muted-foreground/40" />
                        )}
                      </div>
                      <h3 className="truncate text-sm font-semibold">
                        {skill.name}
                      </h3>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {skill.description || "Sin descripción"}
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2">
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {skill.parameters.length} parámetros
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={e => {
                            e.stopPropagation()
                            void handleDelete(skill.id, e as unknown as React.MouseEvent)
                          }}
                          onKeyDown={e => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              e.stopPropagation()
                              void handleDelete(skill.id, e as unknown as React.MouseEvent)
                            }
                          }}
                          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                          title="Eliminar skill"
                        >
                          <Trash2 className="size-3.5" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="shrink-0 border-t border-border/40 px-5 py-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-foreground/5 px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
            >
              Cerrar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
