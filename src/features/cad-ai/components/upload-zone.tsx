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
} from "lucide-react"

import { cn } from "@/shared/utils/utils"
import type { ChatMessage } from "../types"

interface UploadZoneProps {
  onAnalyze: (file: File) => void
  onGenerate: (prompt: string) => void
  loading: boolean
  messages: ChatMessage[]
}

/** CTA primario: primary en light, blanco (foreground) en dark — mismo criterio FormDialog. */
const primaryBtn =
  "bg-primary text-primary-foreground dark:bg-foreground dark:text-background hover:opacity-90"

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

        {/* Toggle de modo responsivo */}
        <div className="mb-4 flex shrink-0 justify-center sm:mb-5">
          <div className="inline-flex rounded-xl bg-background/40 backdrop-blur-md p-1 border border-border/20 shadow-sm">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors",
                mode === "upload"
                  ? "bg-foreground/15 text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <FileImage className="size-3.5" />
              Subir plano
            </button>
            <button
              type="button"
              onClick={() => setMode("chat")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors",
                mode === "chat"
                  ? "bg-foreground/15 text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <MessageSquareText className="size-3.5" />
              Crear con chat
            </button>
          </div>
        </div>

        {mode === "upload" ? (
          <div className="flex w-full flex-col gap-3 sm:gap-4">
            <div
              {...getRootProps()}
              className={cn(
                "flex min-h-[180px] sm:min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl bg-background/30 backdrop-blur-md px-4 py-8 transition-colors border border-dashed border-border/40 hover:border-primary/50 shadow-sm",
                isDragActive && "bg-background/50 border-primary",
                loading && "pointer-events-none opacity-60",
              )}
            >
              <input {...getInputProps()} />
              {loading ? (
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-foreground/5 sm:size-14">
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

            {/* Steps grid optimizado */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { n: "1", label: "Importa", fullLabel: "Importa tu plano o imagen" },
                { n: "2", label: "Edita", fullLabel: "Mide, edita y ajusta" },
                { n: "3", label: "Exporta", fullLabel: "Exporta tu DXF" },
              ].map(s => (
                <div
                  key={s.n}
                  className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 rounded-xl bg-background/30 backdrop-blur-md border border-border/20 p-2.5 sm:px-3 text-center sm:text-left shadow-2xs"
                >
                  <span className="flex size-5 sm:size-6 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-[10px] sm:text-xs font-bold text-foreground">
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
                  className="rounded-xl sm:rounded-2xl bg-background/30 backdrop-blur-md border border-border/20 p-3 sm:p-4 transition hover:bg-background/40 flex flex-col justify-between shadow-2xs"
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
          <div className="flex min-h-[300px] sm:min-h-[360px] w-full flex-col overflow-hidden rounded-2xl bg-background/30 backdrop-blur-md border border-border/30 shadow-md">
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 [scrollbar-width:none]"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2.5 py-12 text-center">
                  <Bot className="size-9 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Describe la pieza que necesitas fabricar
                  </p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {chips.map(c => (
                      <button
                        key={c.text}
                        type="button"
                        onClick={() => {
                          setInput(c.text)
                          textareaRef.current?.focus()
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-background/50 backdrop-blur-xs border border-border/20 px-3 py-2 text-xs text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
                      >
                        <c.icon className="size-3.5" />
                        {c.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed backdrop-blur-xs",
                    m.role === "user"
                      ? "ml-8 bg-primary/15 text-foreground border border-primary/20"
                      : "mr-8 bg-background/60 text-foreground border border-border/20",
                  )}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                  <Loader2 className="size-3.5 animate-spin" />
                  Generando geometría con IA...
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-end gap-2.5 p-3.5 border-t border-border/20 bg-background/20 backdrop-blur-md">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                rows={1}
                placeholder="Ej: Plato circular de 120mm con 6 perforaciones..."
                disabled={loading}
                className="min-h-[42px] max-h-[120px] w-full resize-none rounded-xl bg-background/50 backdrop-blur-xs border border-border/20 px-3.5 py-2.5 text-sm outline-none focus:bg-background/80 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl transition disabled:opacity-40 shadow-sm",
                  primaryBtn,
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
        )}
      </div>
    </div>
  )
}