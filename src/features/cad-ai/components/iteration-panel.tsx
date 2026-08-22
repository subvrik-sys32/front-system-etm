"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, User, Bot, Save, Download, RotateCcw, X, MousePointerClick } from "lucide-react"
import type { PlanGeometry, ChatMessage, Entity, Skill } from "../types"
import { SkillParameters } from "./skill-parameters"
import { cn } from "@/shared/utils/utils"

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

const EASE = "duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"

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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card">
      {/* Header: misma altura (h-14) que la toolbar del canvas para que ambos paneles respiren igual */}
      <div className="flex h-14 shrink-0 flex-col justify-center px-5">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">Conversación</h2>
        <p className="text-[12px] text-muted-foreground">Brinda instrucciones y conversa con tu asistente IA</p>
      </div>

      <div className="h-px shrink-0 bg-foreground/[0.06]" />

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain [-webkit-overflow-scrolling:touch]"
      >
        {messages.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center">
            <Bot className="size-7 text-muted-foreground/40" />
            <p className="text-[13px] text-muted-foreground">Los cambios que pidas aparecerán aquí</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn("flex items-center gap-2.5", msg.role === "user" && "flex-row-reverse")}>
            <div className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full shadow-xs",
              msg.role === "user" ? "bg-foreground text-background" : "bg-muted text-foreground"
            )}>
              {msg.role === "user" ? <User className="size-3.5" strokeWidth={2.2} /> : <Bot className="size-3.5" strokeWidth={2.2} />}
            </div>
            <div className={cn(
              "max-w-[85%] min-h-9 min-w-0 rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-xs",
              msg.role === "user" ? "bg-foreground text-background" : "bg-muted/80 text-foreground dark:bg-foreground/[0.06]"
            )}>
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              {msg.geometry && (
                <p className={`mt-1.5 text-[11px] ${msg.role === "user" ? "text-background/60" : "text-muted-foreground"}`}>
                  {msg.geometry.entities.length} entidades · {msg.geometry.dimensions.width}×{msg.geometry.dimensions.height} {msg.geometry.units}
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground shadow-xs">
              <Loader2 className="size-3.5 animate-spin" />
            </div>
            <div className="min-h-9 rounded-2xl bg-muted/80 px-3.5 py-2 text-[13px] text-muted-foreground shadow-xs dark:bg-foreground/[0.06]">
              Procesando…
            </div>
          </div>
        )}
      </div>

      <div className="h-px shrink-0 bg-foreground/[0.06]" />

      <div className="shrink-0 space-y-3 bg-card p-4">
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
          <div className="flex items-center justify-between gap-2 rounded-[10px] bg-orange-50 px-3 py-2 dark:bg-orange-500/10 shadow-xs">
            <div className="flex items-center gap-2 text-[12px] text-orange-700 dark:text-orange-400">
              <MousePointerClick className="size-3.5 shrink-0" />
              <span>{selectedForAI.length} seleccionada(s)</span>
            </div>
            <button onClick={onClearAISelection} className="text-orange-500 hover:text-orange-700 dark:text-orange-400">
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Acciones secundarias */}
        <div className="flex gap-2">
          <button
            onClick={onDownload}
            className={cn(
              "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-foreground px-3 text-[13px] font-medium text-background shadow-xs transition-opacity hover:opacity-85",
              EASE
            )}
          >
            <Download className="size-4 shrink-0" />
            <span>DXF</span>
          </button>
          <button
            onClick={onSaveSkill}
            title="Guardar Skill"
            className={cn(
              "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-foreground/[0.05] px-3 text-[13px] font-medium text-foreground shadow-xs transition-colors hover:bg-foreground/[0.08]",
              EASE
            )}
          >
            <Save className="size-4 shrink-0" />
            <span className="hidden desktop:inline">Guardar Skill</span>
          </button>
          <button
            onClick={onReset}
            title="Empezar de nuevo"
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-foreground/[0.05] text-foreground shadow-xs transition-colors hover:bg-foreground/[0.08]",
              EASE
            )}
          >
            <RotateCcw className="size-4 shrink-0" />
          </button>
        </div>

        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Describe qué cambiar…"
            rows={1}
            className={cn(
              "min-h-10 max-h-24 flex-1 resize-none rounded-[10px] bg-foreground/[0.05] px-3.5 py-2.5 text-[13px] outline-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch] shadow-xs transition-colors focus:bg-foreground/[0.08] disabled:opacity-50",
              EASE
            )}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-foreground text-background shadow-xs transition-all",
              "hover:opacity-85 active:scale-95 disabled:opacity-30 disabled:pointer-events-none",
              EASE
            )}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}