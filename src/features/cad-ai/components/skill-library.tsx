"use client"

import { useState, useEffect } from "react"
import { Search, Trash2, Layers, Loader2, LayoutGrid, List } from "lucide-react"

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

export function SkillLibrary({ onOpenSkill, onClose }: SkillLibraryProps) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

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
          "h-[75vh] max-h-[600px] w-full max-w-2xl bg-background",
        )}
      >
        <div className="shrink-0">
          <FormDialogHeader
            title="Biblioteca de Skills"
            description="Piezas paramétricas guardadas"
            icon={Layers}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2 px-5 py-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg bg-foreground/5 px-3 py-2">
            <Search size={15} className="shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar skills..."
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/80"
            />
          </div>

          {/* Toggle de vistas corregido a shadow-xs */}
          <div className="flex items-center rounded-lg bg-card p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-md p-1.5 text-muted-foreground transition",
                viewMode === "grid" && "bg-muted text-foreground shadow-xs"
              )}
              title="Vista de cuadrícula"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md p-1.5 text-muted-foreground transition",
                viewMode === "list" && "bg-muted text-foreground shadow-xs"
              )}
              title="Vista de lista"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>

        <div className="relative min-h-0 w-full flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="px-5 pb-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin text-primary" />
                  <p className="text-xs">Cargando skills...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-card text-primary shadow-xs">
                    <Layers className="size-5" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {search ? "Sin resultados" : "No hay skills guardadas aún"}
                  </p>
                  <p className="max-w-xs text-[11px] text-muted-foreground">
                    {search ? "Prueba con otro término de búsqueda" : "Analiza un plano y guárdalo como skill"}
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {filtered.map(skill => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => onOpenSkill(skill)}
                      className="group relative flex flex-col rounded-xl bg-card p-2.5 text-left transition hover:border-border hover:shadow-md"
                    >
                      <div className="mb-2 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg bg-muted/50">
                        {skill.thumbnail && !skill.thumbnail.startsWith("blob:") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={skill.thumbnail}
                            alt={skill.name}
                            className="h-full w-full object-contain p-1.5"
                          />
                        ) : (
                          <Layers className="size-6 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="truncate text-xs font-semibold text-foreground">
                        {skill.name}
                      </h3>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {skill.description || "Sin descripción"}
                      </p>
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
                        className="absolute right-2 top-2 rounded-lg bg-background/90 p-1.5 text-muted-foreground shadow-xs backdrop-blur-xs transition hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                        title="Eliminar skill"
                      >
                        <Trash2 className="size-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {filtered.map(skill => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => onOpenSkill(skill)}
                      className="group flex items-center justify-between rounded-xl bg-card px-3 py-2 text-left transition hover:border-border hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/50">
                          {skill.thumbnail && !skill.thumbnail.startsWith("blob:") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={skill.thumbnail}
                              alt={skill.name}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <Layers className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-xs font-semibold text-foreground">
                            {skill.name}
                          </h3>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {skill.description || "Sin descripción"} • {skill.parameters.length} parámetros
                          </p>
                        </div>
                      </div>
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
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="shrink-0 px-5 py-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-muted/60 px-3.5 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Cerrar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}