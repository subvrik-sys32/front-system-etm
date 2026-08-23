"use client"

import { useState, useRef, useEffect } from "react"
import { Send, User, Bot, Save, Download, RotateCcw, X, MousePointerClick } from "lucide-react"
import { Spinner } from "@/shared/ui/spinner/spinner"
import type { PlanGeometry, ChatMessage, Entity, Skill } from "../types"
import { SkillParameters } from "./skill-parameters"
import { cn } from "@/shared/utils/utils"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { ChatAvatar, ChatBubble, ChatComposerShell } from "@/shared/ui/chat"

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
  const { isCompact } = useResponsive()

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
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden",
        // Móvil/dialog: sin card ni líneas — igual que composer de mensajes
        !isCompact && "bg-card",
      )}
    >
      {/* Header: misma altura (h-14) que la toolbar del canvas para que ambos paneles respiren igual */}
      <div className={cn("flex shrink-0 flex-col justify-center", isCompact ? "px-1 pb-2 pt-0" : "h-14 px-5")}>
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">Conversación</h2>
        <p className="text-[12px] text-muted-foreground">Brinda instrucciones y conversa con tu asistente IA</p>
      </div>

      {!isCompact && <div className="h-px shrink-0 bg-foreground/[0.06]" />}

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain [-webkit-overflow-scrolling:touch]"
      >
        {messages.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center">
            <Bot className="size-8 text-muted-foreground/40" />
            <p className="text-[13px] text-muted-foreground">Los cambios que pidas aparecerán aquí</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isUser = msg.role === "user"
          return (
            <div
              key={i}
              className={cn(
                "flex w-full items-center gap-2",
                isUser && "flex-row-reverse",
              )}
            >
              <ChatAvatar
                tone={isUser ? "inverse" : "muted"}
                fallback={
                  isUser ? (
                    <User className="size-4" strokeWidth={2.2} />
                  ) : (
                    <Bot className="size-4" strokeWidth={2.2} />
                  )
                }
              />
              <ChatBubble own={isUser}>
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                {msg.geometry && (
                  <p
                    className={cn(
                      "mt-1.5 text-left text-[11px]",
                      isUser ? "text-background/60" : "text-muted-foreground",
                    )}
                  >
                    {msg.geometry.entities.length} entidades ·{" "}
                    {msg.geometry.dimensions.width}×{msg.geometry.dimensions.height}{" "}
                    {msg.geometry.units}
                  </p>
                )}
              </ChatBubble>
            </div>
          )
        })}

        {loading && (
          <div className="flex items-center gap-2">
            <ChatAvatar
              fallback={<Spinner size={16} />}
            />
            <ChatBubble>
              <span className="text-muted-foreground">Procesando…</span>
            </ChatBubble>
          </div>
        )}
      </div>

      {!isCompact && <div className="h-px shrink-0 bg-foreground/[0.06]" />}

      <div className={cn("shrink-0 space-y-3 p-4", !isCompact && "bg-card")}>
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

        {/* Composer — ChatComposerShell = comment-composer */}
        <ChatComposerShell>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Describe qué cambiar…"
            rows={1}
            className={cn(
              "max-h-24 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-snug text-foreground outline-none placeholder:text-muted-foreground/70 [scrollbar-width:none] disabled:opacity-50",
              EASE
            )}
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Enviar"
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-foreground text-background shadow-xs transition",
              "disabled:opacity-40",
              EASE
            )}
          >
            {loading ? (
              <Spinner size={16} />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </ChatComposerShell>
      </div>
    </div>
  )
}