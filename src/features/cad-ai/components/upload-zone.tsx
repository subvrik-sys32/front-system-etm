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
import type { ChatMessage } from "../types"

interface UploadZoneProps {
  onAnalyze: (file: File) => void
  onGenerate: (prompt: string) => void
  loading: boolean
  messages: ChatMessage[]
}

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
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-3 py-2">
        {/* Cabecera optimizada para no robar espacio vertical en móviles */}
        <div className="mb-2 shrink-0 text-center">
          <h2 className="text-base font-bold tracking-tight text-foreground tablet:text-lg">
            De la idea al <span className="text-primary">corte</span>
          </h2>
          <p className="mx-auto text-[11px] text-muted-foreground tablet:text-xs">
            Sube un plano o describe la pieza — genera DXF listo para corte
          </p>
        </div>

        {/* Toggle modo compacto */}
        <div className="relative mx-auto mb-2 flex w-full shrink-0 items-center gap-1 rounded-lg border border-border bg-card p-1 tablet:w-fit">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors tablet:flex-none ${
              mode === "upload"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Subir plano
          </button>
          <button
            type="button"
            onClick={() => setMode("chat")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors tablet:flex-none ${
              mode === "chat"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            Crear con chat
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex min-h-0 flex-1 flex-col">
          {mode === "upload" ? (
            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <div
                {...getRootProps()}
                className={`flex min-h-[120px] flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-3 py-4 transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40 hover:bg-secondary/40"
                } ${loading ? "pointer-events-none opacity-60" : ""}`}
              >
                <input {...getInputProps()} />
                {loading ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">Analizando plano…</p>
                  </div>
                ) : preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Vista previa"
                    className="max-h-32 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-medium text-foreground">
                      {isDragActive ? "Suelta la imagen aquí" : "Arrastra tu plano o haz click"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      PNG, JPG, WEBP, BMP · máx 20MB
                    </p>
                  </div>
                )}
              </div>

              {/* Pasos */}
              <div className="grid shrink-0 grid-cols-1 gap-1.5 tablet:grid-cols-3">
                <Step icon={FileImage} step="1" label="Sube tu plano" />
                <Step icon={PencilRuler} step="2" label="Mide y edita" />
                <Step icon={FileDown} step="3" label="Exporta DXF" />
              </div>

              <div className="grid shrink-0 grid-cols-1 gap-1.5 pb-1 tablet:grid-cols-3">
                <FeatureCard icon={ScanSearch} title="Detección IA" description="Líneas, círculos y agujeros" />
                <FeatureCard icon={MessageSquareText} title="Iteración" description="Refina con lenguaje natural" />
                <FeatureCard icon={Layers} title="Skills" description="Piezas paramétricas" />
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">Asistente de diseño</span>
                </div>
              </div>

              <div
                ref={scrollRef}
                className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]"
              >
                {messages.length === 0 && !loading && (
                  <div className="flex flex-col items-center gap-2.5 py-2 text-center">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Bot className="h-4 w-4 text-primary/60" />
                      <p className="text-xs">Describe la pieza que necesitas</p>
                    </div>
                    <div className="flex max-w-md flex-wrap items-center justify-center gap-1">
                      {chips.map(({ icon: Icon, text }) => (
                        <button
                          key={text}
                          type="button"
                          onClick={() => {
                            setInput(text)
                            textareaRef.current?.focus()
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        >
                          <Icon className="h-3 w-3 shrink-0" />
                          <span className="line-clamp-1">{text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando…
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-border p-2">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Ej: placa 200×100 con 4 agujeros…"
                    disabled={loading}
                    className="min-h-[36px] max-h-[100px] w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-xs md:text-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 [scrollbar-width:none]"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Step({ icon: Icon, step, label }: { icon: React.ComponentType<{ className?: string }>; step: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
        {step}
      </span>
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate text-xs font-medium text-foreground">{label}</span>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-2.5 py-2">
      <div className="mb-0.5 flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-primary shrink-0" />
        <span className="text-xs font-semibold text-foreground truncate">{title}</span>
      </div>
      <p className="text-[10px] leading-snug text-muted-foreground line-clamp-1">{description}</p>
    </div>
  )
}