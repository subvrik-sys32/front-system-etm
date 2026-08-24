"use client"

import { useEffect, useState } from "react"
import { Check, FolderOpen } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/shared/utils/utils"
import {
  useUserPreferencesStore,
  type DownloadMode,
} from "../store/user-preferences-store"
import {
  clearDirectoryHandle,
  loadDirectoryHandle,
} from "../utils/directory-handle-idb"
import { pickAndRememberDownloadFolder } from "../utils/save-blob"

const MODES: { id: DownloadMode; label: string; hint: string }[] = [
  { id: "ask", label: "Preguntar", hint: "Elegir cada vez" },
  { id: "quick", label: "Rápida", hint: "Descargas del navegador" },
]

/**
 * Misma línea visual que el resto de Ajustes:
 * título xs + subtítulo 11px + control denso.
 * Checkbox = PermissionToggle de Access (caja 4.5 + check verde).
 */
export function FilesPreferencesSection() {
  const downloadMode = useUserPreferencesStore(s => s.downloadMode)
  const rememberFolder = useUserPreferencesStore(s => s.rememberFolder)
  const rememberedFolderName = useUserPreferencesStore(
    s => s.rememberedFolderName,
  )
  const setDownloadMode = useUserPreferencesStore(s => s.setDownloadMode)
  const setRememberFolder = useUserPreferencesStore(s => s.setRememberFolder)
  const setRememberedFolderName = useUserPreferencesStore(
    s => s.setRememberedFolderName,
  )

  const [picking, setPicking] = useState(false)
  const supportsFs =
    typeof window !== "undefined" && "showDirectoryPicker" in window

  useEffect(() => {
    if (!supportsFs || !rememberFolder || rememberedFolderName) return
    void (async () => {
      const handle = await loadDirectoryHandle()
      if (handle?.name) setRememberedFolderName(handle.name)
    })()
  }, [
    supportsFs,
    rememberFolder,
    rememberedFolderName,
    setRememberedFolderName,
  ])

  function toggleRemember() {
    const next = !rememberFolder
    setRememberFolder(next)
    if (!next) {
      void clearDirectoryHandle()
      setRememberedFolderName(null)
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      {/* —— Al descargar —— */}
      <section className="flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-xs font-semibold text-foreground">Al descargar</h3>
          <p className="text-[11px] leading-snug text-muted-foreground">
            Planos DXF y archivos exportados
          </p>
        </div>
        <div
          className="grid grid-cols-2 gap-0.5 rounded-lg bg-muted/50 p-0.5 dark:bg-muted/40"
          role="radiogroup"
          aria-label="Modo de descarga"
        >
          {MODES.map(m => {
            const active = downloadMode === m.id
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setDownloadMode(m.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-md px-2 py-2 text-center transition",
                  active
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="text-xs font-semibold leading-none">
                  {m.label}
                </span>
                <span className="text-[10px] leading-tight text-muted-foreground">
                  {m.hint}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* —— Carpeta habitual —— misma jerarquía tipográfica */}
      {supportsFs && (
        <section className="flex flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-xs font-semibold text-foreground">
              Carpeta habitual
            </h3>
            <p className="text-[11px] leading-snug text-muted-foreground">
              Recordar destino en Chrome y Edge
            </p>
          </div>

          {/* Un solo bloque denso, mismo radio que el segmented */}
          <div className="flex flex-col gap-0.5 rounded-lg bg-muted/50 p-0.5 dark:bg-muted/40">
            {/* Toggle — PermissionToggle (Access) */}
            <div
              role="checkbox"
              aria-checked={rememberFolder}
              tabIndex={0}
              onClick={toggleRemember}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  toggleRemember()
                }
              }}
              className={cn(
                "flex min-w-0 cursor-pointer select-none items-center gap-2.5 rounded-md px-3 py-2.5 transition-colors",
                rememberFolder
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-4.5 shrink-0 items-center justify-center rounded-md transition-colors",
                  rememberFolder ? "bg-green-500" : "bg-foreground/10",
                )}
              >
                {rememberFolder && (
                  <Check size={11} strokeWidth={3} className="text-black" />
                )}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                Recordar última carpeta
              </span>
            </div>

            {/* Path + acción — solo si recordar está on */}
            {rememberFolder && (
              <div className="flex flex-col gap-1.5 rounded-md bg-background/40 px-3 py-2">
                <p
                  className="truncate text-[11px] text-muted-foreground"
                  title={rememberedFolderName ?? undefined}
                >
                  {rememberedFolderName ? (
                    <>
                      <span className="text-foreground/70">Carpeta · </span>
                      {rememberedFolderName}
                    </>
                  ) : (
                    "Ninguna carpeta seleccionada"
                  )}
                </p>
                <p className="text-[10px] leading-snug text-muted-foreground/80">
                  El navegador solo comparte el nombre de la carpeta, no la ruta completa.
                </p>
                <button
                  type="button"
                  disabled={picking}
                  onClick={async () => {
                    setPicking(true)
                    try {
                      const ok = await pickAndRememberDownloadFolder()
                      if (ok) toast.success("Carpeta guardada")
                      else toast.message("No se eligió carpeta")
                    } finally {
                      setPicking(false)
                    }
                  }}
                  className={cn(
                    "inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md",
                    "bg-foreground/5 text-xs font-medium text-muted-foreground",
                    "transition hover:bg-foreground/10 hover:text-foreground",
                    "disabled:pointer-events-none disabled:opacity-40",
                  )}
                >
                  <FolderOpen size={14} strokeWidth={2.25} />
                  {rememberedFolderName ? "Cambiar carpeta" : "Elegir carpeta"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}