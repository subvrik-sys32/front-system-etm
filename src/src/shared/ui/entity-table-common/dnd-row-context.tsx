"use client"

import {
  createContext,
  useContext,
  type PointerEvent as ReactPointerEvent,
} from "react"

type DndRowHandle = {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void
}

const DndRowContext = createContext<DndRowHandle | null>(null)

export function DndRowProvider({
  value,
  children,
}: {
  value: DndRowHandle | null
  children: React.ReactNode
}) {
  return (
    <DndRowContext.Provider value={value}>
      {children}
    </DndRowContext.Provider>
  )
}

export function useDndRow() {
  return useContext(DndRowContext)
}