// use-history-hidden-focus.ts (completo, actualizado)
"use client"

import {
  useEffect,
  useRef,
} from "react"

type Params<T> = {
  focusedId?: string
  showHistory: boolean
  visibleItems: T[]
  allItems: T[]
  getId: (item: T) => string
  onHistoryRequired?: () => void
}

export function useHistoryHiddenFocus<T>({
  focusedId,
  showHistory,
  visibleItems,
  allItems,
  getId,
  onHistoryRequired,
}: Params<T>) {

  const notifiedForRef = useRef<string | null>(null) // nuevo

  useEffect(() => {

    if (!focusedId) {
      notifiedForRef.current = null // nuevo: reset cuando ya no hay foco
      return
    }

    if (notifiedForRef.current === focusedId) { // nuevo: ya preguntamos por este id, no insistir
      return
    }

    if (showHistory) {
      return
    }

    const isVisible = visibleItems.some(
      item => getId(item) === focusedId,
    )

    if (isVisible) {
      return
    }

    const existsHidden = allItems.some(
      item => getId(item) === focusedId,
    )

    if (existsHidden) {
      notifiedForRef.current = focusedId // nuevo: marcar como ya notificado
      onHistoryRequired?.()
    }

  }, [
    focusedId,
    showHistory,
    visibleItems,
    allItems,
    onHistoryRequired,
  ])

}