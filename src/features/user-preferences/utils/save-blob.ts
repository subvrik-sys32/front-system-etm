"use client"

import { useUserPreferencesStore } from "../store/user-preferences-store"
import { applyFileNameTemplate } from "./apply-file-name-template"
import {
  clearDirectoryHandle,
  loadDirectoryHandle,
  saveDirectoryHandle,
} from "./directory-handle-idb"

type SaveBlobOpts = {
  blob: Blob
  fileName: string
  mimeType?: string
}

function classicDownload(blob: Blob, fileName: string) {
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = fileName
  a.click()
  URL.revokeObjectURL(a.href)
}

async function ensurePermission(
  handle: FileSystemDirectoryHandle,
): Promise<boolean> {
  const h = handle as FileSystemDirectoryHandle & {
    queryPermission?: (o: { mode: string }) => Promise<PermissionState>
    requestPermission?: (o: { mode: string }) => Promise<PermissionState>
  }
  if (!h.queryPermission) return true
  let state = await h.queryPermission({ mode: "readwrite" })
  if (state === "granted") return true
  if (h.requestPermission) {
    state = await h.requestPermission({ mode: "readwrite" })
  }
  return state === "granted"
}

export async function saveBlobWithPreferences({
  blob,
  fileName,
  mimeType,
}: SaveBlobOpts): Promise<void> {
  const { downloadMode, fileNameTemplate, rememberFolder } =
    useUserPreferencesStore.getState()
  const name = applyFileNameTemplate(fileNameTemplate, fileName)
  const type = mimeType || blob.type || "application/octet-stream"

  if (downloadMode === "quick") {
    classicDownload(blob, name)
    return
  }

  if (rememberFolder && "showDirectoryPicker" in window) {
    const dir = await loadDirectoryHandle()
    if (dir && (await ensurePermission(dir))) {
      try {
        const fileHandle = await dir.getFileHandle(name, { create: true })
        const writable = await fileHandle.createWritable()
        await writable.write(blob)
        await writable.close()
        return
      } catch {
        await clearDirectoryHandle()
      }
    }
  }

  if ("showSaveFilePicker" in window) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: name,
        types: [
          {
            description: "Archivo",
            accept: { [type]: [`.${name.split(".").pop() || "bin"}`] },
          },
        ],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (e) {
      if ((e as Error).name === "AbortError") return
    }
  }

  classicDownload(blob, name)
}

export async function pickAndRememberDownloadFolder(): Promise<boolean> {
  if (!("showDirectoryPicker" in window)) return false
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dir = await (window as any).showDirectoryPicker({
      mode: "readwrite",
    })
    await saveDirectoryHandle(dir)
    useUserPreferencesStore.getState().setRememberFolder(true)
    return true
  } catch {
    return false
  }
}
