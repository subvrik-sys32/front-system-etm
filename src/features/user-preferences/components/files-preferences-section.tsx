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
import { applyFileNameTemplate } from "../utils/apply-file-name-template"

const MODES: { id: DownloadMode; label: string; hint: string }[] = [
  {
    id: "ask",
    label: "Preguntar",
    hint: "Guardar como… cada vez",
  },
  {
    id: "quick",
    label: "Rápida",
    hint: "Carpeta del navegador",
  },
]

/** Mismo contrato tipográfico que el composer CAD AI (text-sm + chrome). */
const INPUT_CHROME =
  "flex h-10 w-full items-center rounded-xl bg-foreground/5 px-3 transition focus-within:bg-foreground/8"
const INPUT_FIELD =
  "w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"

/** Preferencias de descarga — panel Ajustes (último commit). */
export function FilesPreferencesSection() {
  const downloadMode = useUserPreferencesStore(s => s.downloadMode)
  const fileNameTemplate = useUserPreferencesStore(s => s.fileNameTemplate)
  const rememberFolder = useUserPreferencesStore(s => s.rememberFolder)
  const setDownloadMode = useUserPreferencesStore(s => s.setDownloadMode)
  const setFileNameTemplate = useUserPreferencesStore(s => s.setFileNameTemplate)
  const setRememberFolder = useUserPreferencesStore(s => s.setRememberFolder)

  const supportsFs =
    typeof window !== "undefined" && "showDirectoryPicker" in window

  const exampleOut = applyFileNameTemplate(
    fileNameTemplate || "{name}",
    "97. OMEGA_DIFERENCIAL.dxf",
  )

  return (
    <div className="flex w-full max-w-lg flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Al descargar
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

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="file-name-tpl"
          className="text-xs font-medium text-muted-foreground"
        >
          Cómo se llama el archivo al guardar
        </label>
        <div className={INPUT_CHROME}>
          <input
            id="file-name-tpl"
            value={fileNameTemplate}
            onChange={e => setFileNameTemplate(e.target.value)}
            placeholder="{name}"
            className={INPUT_FIELD}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Es el <span className="text-foreground/80">patrón del nombre</span>, no
          la carpeta.
          <br />
          <code className="rounded bg-foreground/8 px-1 text-[11px]">
            {"{name}"}
          </code>{" "}
          = nombre original sin extensión ·{" "}
          <code className="rounded bg-foreground/8 px-1 text-[11px]">
            {"{ext}"}
          </code>{" "}
          = extensión (dxf, pdf…).
          <br />
          Ejemplo: plano{" "}
          <span className="text-foreground/80">97. OMEGA_DIFERENCIAL.dxf</span> →{" "}
          <span className="font-medium text-foreground">{exampleOut}</span>
        </p>
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
