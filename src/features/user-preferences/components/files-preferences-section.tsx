"use client"

import { FolderOpen, HardDriveDownload } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/shared/utils/utils"
import {
  useUserPreferencesStore,
  type DownloadMode,
} from "../store/user-preferences-store"
import { clearDirectoryHandle } from "../utils/directory-handle-idb"
import { pickAndRememberDownloadFolder } from "../utils/save-blob"

const MODES: { id: DownloadMode; label: string; hint: string }[] = [
  {
    id: "ask",
    label: "Preguntar ubicación",
    hint: "Guardar como… en cada descarga (recomendado)",
  },
  {
    id: "quick",
    label: "Descarga rápida",
    hint: "Carpeta por defecto del navegador, sin diálogo",
  },
]

/** Bloque de ajustes de archivos — vive en la página Ajustes. */
export function FilesPreferencesSection() {
  const downloadMode = useUserPreferencesStore(s => s.downloadMode)
  const fileNameTemplate = useUserPreferencesStore(s => s.fileNameTemplate)
  const rememberFolder = useUserPreferencesStore(s => s.rememberFolder)
  const setDownloadMode = useUserPreferencesStore(s => s.setDownloadMode)
  const setFileNameTemplate = useUserPreferencesStore(s => s.setFileNameTemplate)
  const setRememberFolder = useUserPreferencesStore(s => s.setRememberFolder)

  const supportsFs =
    typeof window !== "undefined" && "showDirectoryPicker" in window

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Al descargar planos / archivos
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {MODES.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setDownloadMode(m.id)}
              className={cn(
                "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-3 text-left transition",
                downloadMode === m.id
                  ? "border-primary/40 bg-primary/10"
                  : "border-transparent bg-foreground/5 hover:bg-foreground/8",
              )}
            >
              <span className="text-sm font-semibold text-foreground">
                {m.label}
              </span>
              <span className="text-[11px] text-muted-foreground">{m.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Nombre de archivo
        </h3>
        <p className="text-[11px] text-muted-foreground">
          Tokens: {"{name}"} nombre base · {"{ext}"} extensión
        </p>
        <input
          value={fileNameTemplate}
          onChange={e => setFileNameTemplate(e.target.value)}
          placeholder="{name}"
          className="w-full max-w-md rounded-xl bg-foreground/5 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:bg-foreground/8"
        />
      </section>

      {supportsFs && (
        <section className="flex max-w-md flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Carpeta habitual (Chrome / Edge)
          </h3>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-foreground/5 px-3 py-2.5">
            <input
              type="checkbox"
              checked={rememberFolder}
              onChange={e => {
                setRememberFolder(e.target.checked)
                if (!e.target.checked) void clearDirectoryHandle()
              }}
              className="size-4 accent-primary"
            />
            <span className="text-sm text-foreground">
              Recordar última carpeta elegida
            </span>
          </label>
          <button
            type="button"
            onClick={async () => {
              const ok = await pickAndRememberDownloadFolder()
              if (ok) toast.success("Carpeta de descarga guardada")
              else toast.message("No se eligió carpeta")
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground/10 px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-foreground/15"
          >
            <FolderOpen size={16} strokeWidth={2.2} />
            Elegir carpeta ahora
          </button>
          <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <HardDriveDownload size={12} className="mt-0.5 shrink-0" />
            El permiso lo da el navegador; no guardamos una ruta de disco como
            texto.
          </p>
        </section>
      )}
    </div>
  )
}
