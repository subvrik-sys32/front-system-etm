"use client"

import { FolderOpen } from "lucide-react"
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
    label: "Preguntar",
    hint: "Elegir carpeta cada vez",
  },
  {
    id: "quick",
    label: "Rápida",
    hint: "Descargas del navegador",
  },
]

/** Preferencias de descarga: solo ubicación (sin plantilla de nombre). */
export function FilesPreferencesSection() {
  const downloadMode = useUserPreferencesStore(s => s.downloadMode)
  const rememberFolder = useUserPreferencesStore(s => s.rememberFolder)
  const setDownloadMode = useUserPreferencesStore(s => s.setDownloadMode)
  const setRememberFolder = useUserPreferencesStore(s => s.setRememberFolder)

  const supportsFs =
    typeof window !== "undefined" && "showDirectoryPicker" in window

  return (
    <div className="flex w-full max-w-lg flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Al descargar planos y archivos
        </label>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1">
          {MODES.map(m => {
            const active = downloadMode === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setDownloadMode(m.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2.5 text-center transition",
                  active
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="text-sm font-semibold leading-none">
                  {m.label}
                </span>
                <span className="text-[10px] leading-tight text-muted-foreground">
                  {m.hint}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {supportsFs && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            Carpeta habitual
          </label>
          <div className="flex flex-col gap-2 rounded-xl bg-foreground/5 p-3">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={rememberFolder}
                onChange={e => {
                  setRememberFolder(e.target.checked)
                  if (!e.target.checked) void clearDirectoryHandle()
                }}
                className="size-4 shrink-0 accent-primary"
              />
              <span className="text-sm text-foreground">
                Recordar última carpeta (Chrome / Edge)
              </span>
            </label>
            <button
              type="button"
              onClick={async () => {
                const ok = await pickAndRememberDownloadFolder()
                if (ok) toast.success("Carpeta guardada")
                else toast.message("No se eligió carpeta")
              }}
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-background text-sm font-medium text-foreground shadow-xs transition hover:bg-background/80"
            >
              <FolderOpen size={15} strokeWidth={2.2} />
              Elegir carpeta
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
