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
 * Vista unificada: adjuntar plano + chat.
 * Llena el slot immersive (sin hueco bajo el composer).
 */
export function UploadZone({
  onAnalyze,
  onGenerate,
  loading,
  messages,
}: UploadZoneProps) {
  const { isMobile, isLandscape } = useResponsive()
  const phoneLand = isMobile && isLandscape
  const compactChrome = isMobile

  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onAnalyze(acceptedFiles[0])
      }
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
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, loading])

  const handleSend = () => {
    if (!input.trim() || loading) return
    onGenerate(input.trim())
    setInput("")
  }

  const empty = messages.length === 0 && !loading

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col">
      <div
        className={cn(
          "mx-auto flex h-full min-h-0 w-full max-w-3xl flex-1 flex-col",
          phoneLand ? "px-2 pb-1 pt-0" : compactChrome ? "px-3 pb-2 pt-1" : "px-3 pt-2 pb-3 sm:px-6 sm:pt-3 sm:pb-6",
        )}
      >
        {/* Hero: solo desktop / tablet ancha */}
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
            {empty ? (
              <div className="flex min-h-0 flex-1 flex-col gap-3">
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

                {/* Desktop / tablet / landscape: drop + fila de 3 chips */}
                {phoneLand || !isMobile ? (
                  <div className="flex min-h-0 flex-1 flex-col gap-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={e => {
                        e.stopPropagation()
                        open()
                      }}
                      aria-label="Adjuntar plano"
                      title="Adjuntar plano"
                      className="flex min-h-[4.5rem] flex-1 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/50 bg-foreground/[0.03] px-3 py-3 text-center transition hover:border-primary/40 hover:bg-foreground/[0.05]"
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

                    {/* Desktop/tablet: icono + texto si hay altura; phone landscape: solo icono */}
                    <div className="grid shrink-0 grid-cols-3 gap-1.5">
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
                            "flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-foreground/5 px-2 py-2 text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground",
                            !phoneLand && "flex-col sm:flex-row sm:justify-start sm:px-3",
                          )}
                        >
                          <c.icon className="size-4 shrink-0" />
                          {!phoneLand && (
                            <span className="line-clamp-2 text-left text-[11px] leading-tight sm:text-xs">
                              {c.text}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid min-h-0 flex-1 grid-cols-1 gap-2.5">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={e => {
                        e.stopPropagation()
                        open()
                      }}
                      className="flex min-h-[7.5rem] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 bg-foreground/[0.03] px-3 py-4 text-center transition hover:border-primary/40 hover:bg-foreground/[0.05]"
                    >
                      <div className="flex size-10 items-center justify-center rounded-full bg-secondary/30">
                        <ImageIcon className="size-5 text-muted-foreground" />
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        Adjuntar plano
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        PNG, JPG, WEBP, HEIC
                      </span>
                    </button>

                    <div className="grid min-h-0 grid-rows-3 gap-1.5">
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
                          className="flex min-h-0 items-center gap-2 rounded-xl bg-foreground/5 px-3 py-2.5 text-left text-xs text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
                        >
                          <c.icon className="size-3.5 shrink-0" />
                          <span className="line-clamp-2">{c.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:gap-4">
                {messages.map((msg, i) => {
                  const isUser = msg.role === "user"
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-2",
                        isUser && "flex-row-reverse",
                      )}
                    >
                      <ChatAvatar
                        fallback={
                          isUser ? (
                            <User className="size-4" />
                          ) : (
                            <Bot className="size-4" />
                          )
                        }
                      />
                      <ChatBubble own={isUser}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        {msg.geometry && (
                          <p
                            className={cn(
                              "mt-1.5 text-[11px]",
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
                  <div className="flex items-center gap-2">
                    <ChatAvatar fallback={<Spinner size={16} />} />
                    <ChatBubble>
                      <span className="text-muted-foreground">Procesando…</span>
                    </ChatBubble>
                  </div>
                )}
              </div>
            )}

            {empty && loading && (
              <div className="mt-3 flex items-center gap-2">
                <ChatAvatar fallback={<Spinner size={16} />} />
                <ChatBubble>
                  <span className="text-muted-foreground">Procesando…</span>
                </ChatBubble>
              </div>
            )}
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
                className="min-h-9 flex-1 bg-transparent px-1 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 disabled:opacity-50"
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
                {loading ? (
                  <Spinner size={16} />
                ) : (
                  <Send className="size-4" />
                )}
              </button>
            </ChatComposerShell>
          </div>
        </div>
      </div>
    </div>
  )
}
