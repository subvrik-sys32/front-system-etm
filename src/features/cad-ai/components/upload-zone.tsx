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
  FileDown,
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

const secondaryBtn =
  "bg-foreground/5 text-foreground hover:bg-foreground/10"

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
    <div className="relative flex w-full flex-col bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-1 py-2 pb-6 tablet:px-2">
        <div className="mb-3 shrink-0 text-center">
          <h2 className="text-base font-bold tracking-tight text-foreground tablet:text-lg">
            De la idea al{" "}
            <span className="text-primary dark:text-foreground">corte</span>
          </h2>
          <p className="mx-auto mt-1 max-w-md text-[11px] text-muted-foreground tablet:text-xs">
            Sube un plano o describe tu pieza — la IA genera el DXF listo para corte láser
          </p>
        </div>

        {/* Toggle modo — sin borde, tokens */}
        <div className="mb-3 flex shrink-0 justify-center">
          <div className="inline-flex rounded-xl bg-muted/60 p-1 dark:bg-muted/80">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
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
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
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
          <div className="flex w-full flex-col gap-3">
            <div
              {...getRootProps()}
              className={cn(
                "flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl bg-foreground/[0.03] px-4 py-8 transition-colors",
                isDragActive && "bg-foreground/10",
                loading && "pointer-events-none opacity-60",
              )}
            >
              <input {...getInputProps()} />
              {loading ? (
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-foreground/5">
                    <ImageIcon className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {isDragActive
                      ? "Suelta el plano aquí"
                      : "Arrastra tu plano o haz click"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    PNG, JPG, WEBP, BMP · máx 20MB
                  </p>
                </>
              )}
            </div>

            {/* Steps */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { n: "1", label: "Sube tu plano", icon: FileImage },
                { n: "2", label: "Mide y edita", icon: PencilRuler },
                { n: "3", label: "Exporta DXF", icon: FileDown },
              ].map(s => (
                <div
                  key={s.n}
                  className="flex items-center gap-2 rounded-xl bg-foreground/[0.03] px-2.5 py-2"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-[11px] font-bold text-foreground">
                    {s.n}
                  </span>
                  <span className="truncate text-[11px] font-medium text-muted-foreground">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 gap-2 tablet:grid-cols-3">
              {[
                {
                  icon: ScanSearch,
                  title: "Detección IA",
                  desc: "Detecta líneas, círculos, arcos y agujeros",
                },
                {
                  icon: MessageSquareText,
                  title: "Iteración",
                  desc: "Refina con lenguaje natural",
                },
                {
                  icon: Layers,
                  title: "Skills",
                  desc: "Guarda y reutiliza piezas paramétricas",
                },
              ].map(c => (
                <div
                  key={c.title}
                  className="rounded-2xl bg-foreground/[0.03] p-3.5"
                >
                  <c.icon className="mb-2 size-5 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">
                    {c.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[280px] w-full flex-col overflow-hidden rounded-2xl bg-foreground/[0.03]">
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 [scrollbar-width:none]"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Bot className="size-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Describe la pieza que necesitas
                  </p>
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                    {chips.map(c => (
                      <button
                        key={c.text}
                        type="button"
                        onClick={() => {
                          setInput(c.text)
                          textareaRef.current?.focus()
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-foreground/5 px-2.5 py-1.5 text-[11px] text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
                      >
                        <c.icon className="size-3" />
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
                    "rounded-xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "ml-8 bg-foreground/10 text-foreground"
                      : "mr-8 bg-foreground/5 text-foreground",
                  )}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Generando...
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-end gap-2 p-3">
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
                placeholder="Describe la pieza..."
                disabled={loading}
                className="min-h-[40px] max-h-[100px] w-full resize-none rounded-xl bg-foreground/5 px-3 py-2.5 text-sm outline-none focus:bg-foreground/10 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl transition disabled:opacity-40",
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
