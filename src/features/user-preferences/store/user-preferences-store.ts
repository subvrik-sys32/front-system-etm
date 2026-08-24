"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type DownloadMode = "ask" | "quick"

type State = {
  downloadMode: DownloadMode
  fileNameTemplate: string
  rememberFolder: boolean
  rememberedFolderName: string | null
  setDownloadMode: (mode: DownloadMode) => void
  setFileNameTemplate: (tpl: string) => void
  setRememberFolder: (v: boolean) => void
  setRememberedFolderName: (name: string | null) => void
}

export const useUserPreferencesStore = create<State>()(
  persist(
    set => ({
      downloadMode: "ask",
      fileNameTemplate: "{name}",
      rememberFolder: true,
      rememberedFolderName: null,
      setDownloadMode: downloadMode => set({ downloadMode }),
      setFileNameTemplate: fileNameTemplate => set({ fileNameTemplate }),
      setRememberFolder: rememberFolder => set({ rememberFolder }),
      setRememberedFolderName: rememberedFolderName =>
        set({ rememberedFolderName }),
    }),
    {
      name: "etm-user-preferences-v1",
      partialize: s => ({
        downloadMode: s.downloadMode,
        fileNameTemplate: s.fileNameTemplate,
        rememberFolder: s.rememberFolder,
        rememberedFolderName: s.rememberedFolderName,
      }),
    },
  ),
)