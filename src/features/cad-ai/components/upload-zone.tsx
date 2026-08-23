"use client"

import { Spinner } from "@/shared/ui/spinner/spinner"

import { useCallback, useState, useRef, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import {
  ImageIcon,
  ScanSearch,
  MessageSquareText,
  Layers,
  FileImage,
  PencilRuler,
  Send,
  Bot,
  User,
  Sparkles,
} from "lucide-react"

import { cn } from "@/shared/utils/utils"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { ChatAvatar, ChatBubble, ChatComposerShell } from "@/shared/ui/chat"
import { EntityToggle } from "@/shared/ui/entity-toggle/entity-toggle"
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

export function UploadZone({
  onAnalyze,
  onGenerate,
  loading,
  messages,
}: UploadZoneProps) {
  const { isMobile, isLandscape } = useResponsive()
  /** Phone landscape: layout denso, sin hero, scroll controlado. */
  const phoneLand = isMobile && isLandscape

  const [preview, setPreview] = useState<string | null>(null)
  const [mode, setMode] = useState<"upload" | "chat">("upload")
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setPreview(URL.createObjectURL(file))
        onAnalyze(file)
      }
    },
    [onAnalyze],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".heic", ".heif"],
      "image/heic": [".heic", ".heif"],
      "image/heif": [".heic", ".heif"],
    },
    maxFiles: 1,
    disabled: loading,
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

  const modeToggle = (
    <div
      className={cn(
        "flex shrink-0 justify-center",
        phoneLand ? "mb-1.5" : "mb-4 sm:mb-5",
      )}
    >
      <EntityToggle
        value={mode}
        onChange={setMode}
        aria-label="Modo de entrada CAD"
        compact={phoneLand}
        options={[
          { value: "upload" as const, label: "Subir plano", icon: FileImage },
          { value: "chat" as const, label: "Crear con chat", icon: MessageSquareText },
        ]}
      />
    </div>
  )

  const chatMessages = (
    <>
      {messages.length === 0 && !loading && (
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-3 text-center",
            phoneLand ? "py-2" : "h-full",
          )}
        >
          {!phoneLand && (
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary/30">
              <Sparkles className="size-7 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-foreground">
              ¿Qué pieza diseñamos hoy?
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Describe las medidas o la forma geométrica en lenguaje natural.
            </p>
          </div>
          <div
            className={cn(
              "mt-1 w-full max-w-sm gap-2",
              phoneLand
                ? "flex flex-row flex-wrap justify-center"
                : "flex flex-col",
            )}
          >
            {CHIPS.map(c => (
              <button
                key={c.text}
                type="button"
                disabled={loading}
                onClick={() => onGenerate(c.text)}
                className={cn(
                  "flex items-center gap-2 rounded-xl bg-foreground/5 px-3 py-2 text-left text-xs text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground",
                  phoneLand && "max-w-[14rem]",
                )}
              >
                <c.icon className="size-3.5 shrink-0" />
                <span className="line-clamp-2">{c.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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
            <ChatBubble user={isUser}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              {msg.geometry && (
                <p
                  className={cn(
                    "mt-1.5 text-[11px]",
                    isUser ? "text-background/60" : "text-muted-foreground",
                  )}
                >
                  {msg.geometry.entities.length} entidades ·{" "}
                  {msg.geometry.dimensions.width}×
                  {msg.geometry.dimensions.height} {msg.geometry.units}
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
    </>
  )

  const chatComposer = (
    <div className={cn("shrink-0 bg-card", phoneLand ? "p-2" : "p-3 sm:p-4")}>
      <ChatComposerShell>
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
          placeholder="Ej: Plato circular de 120mm con 6 perforaciones..."
          disabled={loading}
          className="min-h-9 flex-1 bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 disabled:opacity-50"
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
  )

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col bg-transparent">
      <div
        className={cn(
          "mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col",
          phoneLand ? "px-2 py-1" : "px-3 py-3 sm:px-6 sm:py-6",
        )}
      >
        {/* Hero: oculto en phone landscape (libera altura al drop/chat) */}
        {!phoneLand && (
          <div className="mb-4 shrink-0 px-4 sm:mb-6">
            <div className="flex flex-col items-center gap-x-3 gap-y-1.5 text-center md:flex-row md:items-baseline md:justify-start md:text-left">
              <h2
                className="shrink-0 font-bold tracking-tight text-foreground"
                style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}
              >
                De la idea al{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent dark:from-foreground dark:to-foreground/60">
                  corte
                </span>
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                <span className="size-1 shrink-0 rounded-full bg-muted-foreground/50" />
                <span>
                  Sube un plano o describe tu pieza — la IA genera el DXF listo
                  para corte láser
                </span>
              </div>
            </div>
          </div>
        )}

        {modeToggle}

        {mode === "upload" ? (
          phoneLand ? (
            /* Landscape: dropzone a pantalla del slot, scroll interno si hace falta */
            <div
              {...getRootProps()}
              className={cn(
                "flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-center overflow-y-auto rounded-2xl border border-dashed border-border/40 bg-card px-4 py-4 shadow-xs transition-colors hover:border-primary/50",
                isDragActive && "border-primary bg-card/80",
                loading && "pointer-events-none opacity-60",
              )}
            >
              <input {...getInputProps()} />
              {loading ? (
                <Spinner size={28} className="text-muted-foreground" />
              ) : (
                <>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-secondary/30">
                    <ImageIcon className="size-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    Arrastra tu plano o haz click
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    PNG, JPG, WEBP, HEIC · máx 20MB
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="flex w-full flex-col gap-3 sm:gap-4">
              <div
                {...getRootProps()}
                className={cn(
                  "flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 bg-card px-4 py-8 shadow-xs transition-colors hover:border-primary/50 sm:min-h-[220px]",
                  isDragActive && "border-primary bg-card/80",
                  loading && "pointer-events-none opacity-60",
                )}
              >
                <input {...getInputProps()} />
                {loading ? (
                  <Spinner size={32} className="text-muted-foreground" />
                ) : (
                  <>
                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-secondary/30 sm:size-14">
                      <ImageIcon className="size-6 text-muted-foreground sm:size-7" />
                    </div>
                    <p className="text-sm font-semibold text-foreground sm:text-base">
                      Arrastra tu plano o haz click
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG, WEBP, BMP, HEIC · máx 20MB
                    </p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {[
                  {
                    icon: ScanSearch,
                    title: "Detección IA",
                    desc: "Detecta líneas, círculos y arcos automáticamente",
                    shortDesc: "Detecta líneas y arcos",
                  },
                  {
                    icon: MessageSquareText,
                    title: "Iteración en vivo",
                    desc: "Refina geometría compleja utilizando lenguaje natural",
                    shortDesc: "Refina con lenguaje natural",
                  },
                  {
                    icon: Layers,
                    title: "Skills reutilizables",
                    desc: "Guarda y repara piezas paramétricas corporativas",
                    shortDesc: "Guarda piezas paramétricas",
                  },
                ].map(c => (
                  <div
                    key={c.title}
                    className="flex flex-col justify-between rounded-xl bg-card p-3 shadow-xs transition hover:bg-card/80 sm:rounded-2xl sm:p-4"
                  >
                    <div>
                      <c.icon className="mb-1.5 size-4 text-muted-foreground sm:mb-2 sm:size-5" />
                      <p className="line-clamp-1 text-xs font-semibold text-foreground sm:text-sm">
                        {c.title}
                      </p>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                      <span className="sm:hidden">{c.shortDesc}</span>
                      <span className="hidden sm:inline">{c.desc}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          /* Chat: columna flex fija; solo el body hace scroll */
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl bg-card shadow-xs">
            <div
              ref={scrollRef}
              className={cn(
                "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                phoneLand ? "p-3" : "space-y-5 p-5 sm:p-6",
              )}
            >
              {chatMessages}
            </div>
            {chatComposer}
          </div>
        )}
      </div>
    </div>
  )
}
