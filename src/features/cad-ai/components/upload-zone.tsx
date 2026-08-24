"use client"

import { Spinner } from "@/shared/ui/spinner/spinner"

import { useCallback, useState, useRef, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import {
  ImageIcon,
  ScanSearch,
  Layers,
  PencilRuler,
  Send,
  Bot,
  User,
  Paperclip,
} from "lucide-react"

import { cn } from "@/shared/utils/utils"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { ChatAvatar, ChatBubble, ChatComposerShell } from "@/shared/ui/chat"
import type { ChatMessage } from "../types"

interface UploadZoneProps {
  onAnalyze: (file: File) => void
  onGenerate: (prompt: string) => void
  loading: boolean
  messages: ChatMessage[]
}

const EASE = "duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"

const CHIPS = [
  { icon: PencilRuler, text: "Rectángulo 100×50 con 4 agujeros Ø5" },
  { icon: Layers, text: "L-bracket con pliegue a 90°" },
  { icon: ScanSearch, text: "Círculo Ø80 con agujero central Ø20" },
] as const

/**
 * Un solo frame (como iteration chat):
 * - Sin mensajes: drop altura media + intro bot + 3 chips en fila
 * - Con mensajes / loading: mismo thread (ChatAvatar + ChatBubble)
 * No hay un “segundo chat” vacío solo con Procesando.
 */
export function UploadZone({
  onAnalyze,
  onGenerate,
  loading,
  messages,
}: UploadZoneProps) {
  const { isMobile, isLandscape, isCompact } = useResponsive()
  const phoneLand = isMobile && isLandscape
  const compactChrome = isMobile || isCompact

  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) onAnalyze(acceptedFiles[0])
    },
    [onAnalyze],
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".heic", ".heif"],
      "image/heic": [".heic", ".heif"],
      "image/heif": [".heic", ".heif"],
    },
    maxFiles: 1,
    disabled: loading,
    noClick: true,
    noKeyboard: true,
  })

  useEffect(() => {
    if (messages.length === 0 && !loading) return
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, loading])

  const handleSend = () => {
    if (!input.trim() || loading) return
    onGenerate(input.trim())
    setInput("")
  }

  /**
   * Onboarding (drop + intro bot + chips) se mantiene hasta la PRIMERA
   * respuesta del asistente — no desaparece en el primer "Procesando…".
   */
  const hasAssistantReply = messages.some(m => m.role === "assistant")
  const showOnboarding = !hasAssistantReply
  /** Thread: mensajes del usuario/IA y/o loading. */
  const showThread = messages.length > 0 || loading

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col">
      <div
        className={cn(
          "mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col",
          phoneLand
            ? "px-2 pb-1 pt-0"
            : compactChrome
              ? "px-3 pb-2 pt-1"
              : "px-3 pt-1 pb-2 sm:px-5 sm:pt-2 sm:pb-3",
        )}
      >
        {!compactChrome && (
          <div className="mb-2 shrink-0 px-2 sm:mb-3 sm:px-4">
            <div className="flex flex-col items-center gap-x-3 gap-y-1 text-center md:flex-row md:items-baseline md:justify-start md:text-left">
              <h2
                className="shrink-0 font-bold tracking-tight text-foreground"
                style={{ fontSize: "clamp(1.35rem, 3.2vw, 2rem)" }}
              >
                De la idea al{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent dark:from-foreground dark:to-foreground/60">
                  corte
                </span>
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Sube un plano o describe la pieza — la IA genera el DXF
              </p>
            </div>
          </div>
        )}

        <div
          {...getRootProps()}
          className={cn(
            "flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl bg-card shadow-xs transition-colors",
            isDragActive && "ring-2 ring-primary/40",
          )}
        >
          <input {...getInputProps()} />

          <div
            ref={scrollRef}
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
              phoneLand ? "p-2.5" : "p-3 sm:p-5",
            )}
          >
            {/* min-h-full: el thread se ancla abajo (junto al composer), no pegado a chips */}
            <div className="flex min-h-full w-full flex-col gap-3">
              {showOnboarding && (
                <>
                  {compactChrome && !phoneLand && (
                    <div className="shrink-0 text-center">
                      <p className="text-sm font-semibold text-foreground">
                        ¿Qué pieza diseñamos hoy?
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Adjunta un plano o escribe en lenguaje natural.
                      </p>
                    </div>
                  )}

                  {/* Drop altura media (ni gigante flex-1 ni fila py-3) */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={e => {
                      e.stopPropagation()
                      open()
                    }}
                    aria-label="Adjuntar plano"
                    title="Adjuntar plano"
                    className={cn(
                      "flex h-28 w-full shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/50 bg-foreground/[0.03] px-3 text-center transition sm:h-32",
                      "hover:border-primary/40 hover:bg-foreground/[0.05]",
                      isDragActive && "border-primary/50 bg-primary/5",
                      EASE,
                    )}
                  >
                    <div className="flex size-9 items-center justify-center rounded-full bg-secondary/30">
                      <ImageIcon className="size-5 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      Adjuntar plano
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      PNG, JPG, WEBP o HEIC
                    </span>
                  </button>

                  {/* Intro bot — mismo ChatAvatar/Bubble que iteration */}
                  <div className="flex w-full items-center gap-2">
                    <ChatAvatar
                      fallback={<Bot className="size-4" strokeWidth={2.2} />}
                    />
                    <ChatBubble>
                      <p className="leading-[1.45]">
                        Describe la pieza o adjunta un plano. Prueba un ejemplo:
                      </p>
                    </ChatBubble>
                  </div>

                  {/* 3 prompts en fila (grid-cols-3), como antes */}
                  <div
                    className={cn(
                      "grid shrink-0 gap-1.5",
                      phoneLand || isMobile
                        ? "grid-cols-1"
                        : "grid-cols-3",
                    )}
                  >
                    {CHIPS.map(c => (
                      <button
                        key={c.text}
                        type="button"
                        disabled={loading}
                        title={c.text}
                        aria-label={c.text}
                        onClick={e => {
                          e.stopPropagation()
                          onGenerate(c.text)
                        }}
                        className={cn(
                          "flex min-h-11 items-center gap-1.5 rounded-xl bg-foreground/5 px-2.5 py-2 text-left text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground",
                          !isMobile && !phoneLand && "flex-col items-start sm:px-3",
                          EASE,
                        )}
                      >
                        <c.icon className="size-3.5 shrink-0" />
                        <span className="line-clamp-2 text-[11px] leading-tight sm:text-xs">
                          {c.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Empuja el thread hacia el composer cuando hay mensajes */}
              {showThread && <div className="min-h-3 flex-1" aria-hidden />}

              {/* Thread = iteration panel; anclado abajo */}
              {showThread && (
                <div className="mt-auto flex shrink-0 flex-col gap-3 sm:gap-4">
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
                          <p className="whitespace-pre-wrap break-words leading-[1.45]">
                            {msg.content}
                          </p>
                          {msg.geometry && (
                            <p
                              className={cn(
                                "mt-1.5 text-left text-[11px]",
                                isUser
                                  ? "text-background/60"
                                  : "text-muted-foreground",
                              )}
                            >
                              {msg.geometry.entities.length} entidades ·{" "}
                              {msg.geometry.dimensions.width}×
                              {msg.geometry.dimensions.height}{" "}
                              {msg.geometry.units}
                            </p>
                          )}
                        </ChatBubble>
                      </div>
                    )
                  })}

                  {loading && (
                    <div className="flex w-full items-center gap-2">
                      <ChatAvatar fallback={<Spinner size={16} />} />
                      <ChatBubble>
                        <span className="text-muted-foreground">
                          Procesando…
                        </span>
                      </ChatBubble>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div
            className={cn(
              "shrink-0 border-t border-border/30 bg-card",
              phoneLand ? "p-2" : "p-2.5 sm:p-4",
            )}
            onClick={e => e.stopPropagation()}
          >
            <ChatComposerShell>
              <button
                type="button"
                aria-label="Adjuntar plano"
                title="Adjuntar plano"
                disabled={loading}
                onClick={() => open()}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-[10px] text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground disabled:opacity-40",
                  EASE,
                )}
              >
                <Paperclip className="size-4" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Describe la pieza o adjunta un plano…"
                disabled={loading}
                className="min-h-9 flex-1 bg-transparent px-1 py-2 text-[15px] leading-snug text-foreground outline-none placeholder:text-muted-foreground/70 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                aria-label="Enviar"
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-foreground text-background shadow-xs transition disabled:opacity-40",
                  EASE,
                )}
              >
                {loading ? <Spinner size={16} /> : <Send className="size-4" />}
              </button>
            </ChatComposerShell>
          </div>
        </div>
      </div>
    </div>
  )
}
