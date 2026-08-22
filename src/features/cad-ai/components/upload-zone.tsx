"use client"

import { useCallback, useState, useRef, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import {
  ImageIcon,
  Loader2,
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

export function UploadZone({
  onAnalyze,
  onGenerate,
  loading,
  messages,
}: UploadZoneProps) {
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
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".bmp"] },
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

  const chips = [
    { icon: PencilRuler, text: "Rectángulo 100×50 con 4 agujeros Ø5" },
    { icon: Layers, text: "L-bracket con pliegue a 90°" },
    { icon: ScanSearch, text: "Círculo Ø80 con agujero central Ø20" },
  ]

  return (
    <div className="relative flex h-full w-full flex-col bg-transparent">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-3 py-3 sm:px-6 sm:py-6">
        
        {/* Encabezado */}
        <div className="mb-4 shrink-0 sm:mb-6 px-4">
          <div className="flex flex-col items-center text-center md:flex-row md:items-baseline md:justify-start md:text-left gap-x-3 gap-y-1.5">
            <h2 
              className="font-bold tracking-tight text-foreground shrink-0"
              style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}
            >
              De la idea al{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent dark:from-foreground dark:to-foreground/60">
                corte
              </span>
            </h2>
            
            <div className="hidden md:flex items-center gap-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <span className="size-1 rounded-full bg-muted-foreground/50 shrink-0" />
              <span>Sube un plano o describe tu pieza — la IA genera el DXF listo para corte láser</span>
            </div>
          </div>
        </div>

        {/* Toggle de modo — SSOT EntityToggle (mismo look Día/Semana/Mes) */}
        <div className="mb-4 flex shrink-0 justify-center sm:mb-5">
          <EntityToggle
            value={mode}
            onChange={setMode}
            aria-label="Modo de entrada CAD"
            options={[
              { value: "upload", label: "Subir plano", icon: FileImage },
              { value: "chat", label: "Crear con chat", icon: MessageSquareText },
            ]}
          />
        </div>

        {mode === "upload" ? (
          <div className="flex w-full flex-col gap-3 sm:gap-4">
            <div
              {...getRootProps()}
              className={cn(
                "flex min-h-[180px] sm:min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl bg-card px-4 py-8 transition-colors border border-dashed border-border/40 hover:border-primary/50 shadow-xs",
                isDragActive && "bg-card/80 border-primary",
                loading && "pointer-events-none opacity-60",
              )}
            >
              <input {...getInputProps()} />
              {loading ? (
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-secondary/30 sm:size-14">
                    <ImageIcon className="size-6 text-muted-foreground sm:size-7" />
                  </div>
                  <p className="text-sm font-semibold text-foreground sm:text-base">
                    {isDragActive
                      ? "Suelta el plano aquí"
                      : "Arrastra tu plano o haz click"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG, WEBP, BMP · máx 20MB
                  </p>
                </>
              )}
            </div>

            {/* Steps grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { n: "1", label: "Importa", fullLabel: "Importa tu plano o imagen" },
                { n: "2", label: "Edita", fullLabel: "Mide, edita y ajusta" },
                { n: "3", label: "Exporta", fullLabel: "Exporta tu DXF" },
              ].map(s => (
                <div
                  key={s.n}
                  className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 rounded-xl bg-card p-2.5 sm:px-3 text-center sm:text-left shadow-xs"
                >
                  <span className="flex size-5 sm:size-6 shrink-0 items-center justify-center rounded-full bg-secondary/40 text-[10px] sm:text-xs font-bold text-foreground">
                    {s.n}
                  </span>
                  <span className="text-[11px] sm:text-xs font-medium text-muted-foreground leading-tight">
                    <span className="sm:hidden">{s.label}</span>
                    <span className="hidden sm:inline">{s.fullLabel}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Feature cards grid */}
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
                  className="rounded-xl sm:rounded-2xl bg-card p-3 sm:p-4 transition hover:bg-card/80 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <c.icon className="mb-1.5 sm:mb-2 size-4 sm:size-5 text-muted-foreground" />
                    <p className="text-xs sm:text-sm font-semibold text-foreground line-clamp-1">
                      {c.title}
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    <span className="sm:hidden">{c.shortDesc}</span>
                    <span className="hidden sm:inline">{c.desc}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[380px] sm:min-h-[440px] w-full flex-col overflow-hidden rounded-2xl bg-card shadow-xs">
            
            {/* Contenedor del chat estilizado */}
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain [-webkit-overflow-scrolling:touch]"
            >
              {messages.length === 0 && !loading && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary/40 text-foreground">
                    <Sparkles className="size-6" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <p className="text-sm font-semibold text-foreground">
                      ¿Qué pieza diseñamos hoy?
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Describe las medidas o la forma geométrica en lenguaje natural.
                    </p>
                  </div>
                  
                  {/* Grid responsive para los chips */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-lg">
                    {chips.map(c => (
                      <button
                        key={c.text}
                        type="button"
                        onClick={() => {
                          setInput(c.text)
                          inputRef.current?.focus()
                        }}
                        className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5 rounded-xl bg-background/50 p-3 text-xs text-muted-foreground transition-all hover:bg-background hover:text-foreground shadow-xs active:scale-95"
                      >
                        <c.icon className="size-4 text-foreground/70" />
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
                    fallback={<Loader2 className="size-4 animate-spin" />}
                  />
                  <ChatBubble>
                    <span className="text-muted-foreground">Procesando…</span>
                  </ChatBubble>
                </div>
              )}
            </div>

            {/* Composer — mismo shell que comment-composer */}
            <div className="shrink-0 bg-card p-3 sm:p-4">
              <ChatComposerShell>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
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
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </button>
              </ChatComposerShell>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}