import { useState, useRef, useEffect } from "react"
import { Send, Loader2, User, Bot, Save, Download, RotateCcw, X, MousePointerClick } from "lucide-react"
import type { PlanGeometry, ChatMessage, Entity, Skill } from "../types"
import { SkillParameters } from "./skill-parameters"

interface IterationPanelProps {
  geometry: PlanGeometry
  dxf: string
  imagePath: string | null
  onIterate: (feedback: string) => void
  onSaveSkill: () => void
  onDownload: () => void
  onReset: () => void
  loading: boolean
  messages: ChatMessage[]
  selectedForAI?: Entity[] | null
  onClearAISelection?: () => void
  activeSkill?: Skill | null
  skillParams?: Record<string, number | string> | null
  onSkillParamsChange?: (params: Record<string, number | string>) => void
  onSkillRegenerate?: () => void
}

export function IterationPanel({
  geometry,
  dxf: _dxf,
  imagePath,
  onIterate,
  onSaveSkill,
  onDownload,
  onReset,
  loading,
  messages,
  selectedForAI,
  onClearAISelection,
  activeSkill,
  skillParams,
  onSkillParamsChange,
  onSkillRegenerate,
}: IterationPanelProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, loading])

  const handleSend = () => {
    if (!input.trim() || loading) return
    onIterate(input.trim())
    setInput("")
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-card overflow-hidden">
      <div className="p-3.5  flex-shrink-0 bg-card">
        <h2 className="font-semibold text-foreground text-sm">Iteración</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">Describe cambios en lenguaje natural</p>
      </div>

      {/* Scroll oculto sin barras nativas */}
      <div 
        ref={scrollRef} 
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain [-webkit-overflow-scrolling:touch]"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === "user" ? "bg-primary text-primary-foreground dark:bg-foreground dark:text-background" : "bg-secondary text-foreground"
            }`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`flex-1 min-w-0 rounded-lg p-3 text-sm ${
              msg.role === "user" ? "bg-primary text-primary-foreground dark:bg-foreground dark:text-background" : "bg-secondary text-foreground"
            }`}>
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              {msg.geometry && (
                <p className="text-xs mt-2 opacity-70">
                  {msg.geometry.entities.length} entidades · {msg.geometry.dimensions.width}×{msg.geometry.dimensions.height} {msg.geometry.units}
                </p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-secondary rounded-lg p-3 text-sm text-muted-foreground">
              Procesando...
            </div>
          </div>
        )}
      </div>

      <div className="p-3  space-y-2.5 flex-shrink-0 bg-card">
        {activeSkill && skillParams && onSkillParamsChange && onSkillRegenerate && (
          <SkillParameters
            skill={activeSkill}
            params={skillParams}
            onParamsChange={onSkillParamsChange}
            onRegenerate={onSkillRegenerate}
            loading={loading}
          />
        )}

        {selectedForAI && selectedForAI.length > 0 && (
          <div className="rounded-md bg-orange-50 border border-orange-200 px-3 py-1.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-orange-700">
              <MousePointerClick className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{selectedForAI.length} seleccionada(s)</span>
            </div>
            <button onClick={onClearAISelection} className="text-orange-500 hover:text-orange-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Botones de acción compactos: Guardar Skill muestra solo icono en móvil/tablet pequeño */}
        <div className="flex gap-2">
          <button
            onClick={onDownload}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground dark:bg-foreground dark:text-background px-3 py-2 text-xs font-medium hover:bg-primary/90"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>DXF</span>
          </button>
          <button
            onClick={onSaveSkill}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-foreground/5 bg-card px-3 py-2 text-xs font-medium hover:bg-foreground/5"
            title="Guardar Skill"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span className="hidden desktop:inline">Guardar Skill</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center justify-center rounded-md bg-foreground/5 bg-card px-3 py-2 text-sm font-medium hover:bg-foreground/5"
            title="Empezar de nuevo"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
          </button>
        </div>

        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Describe qué cambiar..."
            rows={1}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-xs md:text-sm resize-none max-h-20 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] focus:outline-none focus:ring-1 focus:ring-ring"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="self-end rounded-md bg-primary text-primary-foreground dark:bg-foreground dark:text-background p-2 hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}