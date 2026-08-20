import { useState, useEffect } from "react"
import { Search, Trash2, Plus, Layers, ArrowLeft, Loader2 } from "lucide-react"
import type { Skill } from "../types"
import { cadAiApi } from "../api/cad-ai.api"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

interface SkillLibraryProps {
  onOpenSkill: (skill: Skill) => void
  onClose: () => void
}

export function SkillLibrary({ onOpenSkill, onClose }: SkillLibraryProps) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const { isMobile } = useResponsive()

  const loadSkills = async () => {
    try {
      const data = await cadAiApi.getSkills()
      setSkills(data)
    } catch (err) {
      console.error("Failed to load skills:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSkills()
  }, [])

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("¿Eliminar esta skill?")) return
    try {
      await cadAiApi.deleteSkill(id)
      setSkills(skills.filter(s => s.id !== id))
    } catch (err) {
      console.error("Failed to delete skill:", err)
    }
  }

  const filtered = skills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-0 sm:p-4">
      <div className={`bg-card w-full flex flex-col min-h-0 shadow-xl ${
        isMobile 
          ? "h-full max-h-none rounded-none" 
          : "rounded-xl max-w-4xl max-h-[85vh]"
      }`}>
        
        {/* Cabecera adaptada al estilo de diálogos móviles / wizard */}
        <div className="p-4 sm:p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {isMobile && (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground transition"
                  aria-label="Atrás"
                >
                  <ArrowLeft size={18} strokeWidth={2.5} />
                </button>
              )}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">Biblioteca de Skills</h2>
            </div>
            {!isMobile && (
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground text-2xl leading-none flex-shrink-0 ml-2"
                aria-label="Cerrar"
              >
                ×
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar skills..."
              className="w-full rounded-xl border border-input bg-background pl-10 pr-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Contenido principal con altura mínima garantizada para evitar saltos */}
        <div className="flex-1 min-h-[320px] overflow-y-auto p-4 sm:p-6 flex flex-col">
          {loading ? (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Cargando skills...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground py-16">
              <Plus className="w-12 h-12 mx-auto mb-3 opacity-40 text-primary" />
              <p className="font-medium text-foreground">No hay skills guardadas aún</p>
              <p className="text-xs mt-1">Analiza un plano y guárdalo como skill para reutilizarlo</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {filtered.map(skill => (
                <div
                  key={skill.id}
                  onClick={() => onOpenSkill(skill)}
                  className="group relative rounded-xl border border-border bg-card p-3 sm:p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-square mb-3 rounded-lg bg-secondary/60 flex items-center justify-center overflow-hidden border border-border/50">
                      {skill.thumbnail && !skill.thumbnail.startsWith("blob:") ? (
                        <img
                          src={skill.thumbnail}
                          alt={skill.name}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <Layers className="w-8 h-8 text-muted-foreground/40" />
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-foreground truncate">{skill.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{skill.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
                    <span className="text-[11px] font-medium bg-secondary px-2 py-0.5 rounded-md text-muted-foreground">
                      {skill.parameters.length} parámetros
                    </span>
                    <button
                      type="button"
                      onClick={e => handleDelete(skill.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                      title="Eliminar skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer móvil adaptado de cierre rápido */}
        {isMobile && (
          <div className="p-3 border-t border-border bg-card flex items-center justify-end gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-secondary py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary/80"
            >
              Cerrar
            </button>
          </div>
        )}

      </div>
    </div>
  )
}