import { create } from "zustand"

type PageTitleState = {
  title: string
  setTitle: (title: string) => void
}

// Store deliberadamente simple: cada página llama a usePageTitle("X")
// en su render y el TopBar mobile lo refleja. Si ya existe otro
// mecanismo de títulos en el proyecto, este archivo se reemplaza
// sin tocar TopBar (solo cambia de dónde lee `title`).
export const usePageTitleStore = create<PageTitleState>((set) => ({
  title: "",
  setTitle: (title) => set({ title }),
}))