// use-history-hidden-focus.ts
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

  const resolvedForRef = useRef<string | null>(null)

  useEffect(() => {

    if (!focusedId) {
      resolvedForRef.current = null
      return
    }

    const isVisible = visibleItems.some(
      item => getId(item) === focusedId,
    )

    if (isVisible) {
      // Ya se puede ver (sea porque siempre fue visible, o porque
      // el usuario ya confirmó el diálogo antes). Marcado como resuelto
      // para que un futuro toggle no vuelva a preguntar por este mismo id.
      resolvedForRef.current = focusedId
      return
    }

    if (resolvedForRef.current === focusedId) {
      // Ya se preguntó (o resolvió) para este id. No insistir.
      return
    }

    if (showHistory) {
      return
    }

    const existsHidden = allItems.some(
      item => getId(item) === focusedId,
    )

    if (existsHidden) {
      resolvedForRef.current = focusedId
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