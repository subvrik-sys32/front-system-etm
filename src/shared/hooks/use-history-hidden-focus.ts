"use client"

import {
  useEffect,
  useRef,
} from "react"

type Params<T> = {
  focusedId?: string
  focusToken?: string
  showHistory: boolean
  visibleItems: T[]
  allItems: T[]
  getId: (item: T) => string
  onHistoryRequired?: () => void
}

export function useHistoryHiddenFocus<T>({
  focusedId,
  focusToken,
  showHistory,
  visibleItems,
  allItems,
  getId,
  onHistoryRequired,
}: Params<T>) {

  const resolvedForRef = useRef<string | null>(null)

  // La clave de deduplicación es la SOLICITUD (id + token de foco),
  // no la identidad de la entidad. Sin token (rutas que no lo envían:
  // Projects, Search, Dashboard, links antiguos) cae al comportamiento
  // anterior: dedup solo por focusedId.
  const requestKey = focusedId
    ? `${focusedId}:${focusToken ?? ""}`
    : null

  useEffect(() => {

    if (!requestKey) {
      resolvedForRef.current = null
      return
    }

    const isVisible = visibleItems.some(
      item => getId(item) === focusedId,
    )

    if (isVisible) {
      // Ya se puede ver (sea porque siempre fue visible, o porque
      // el usuario ya confirmó el diálogo antes). Marcado como resuelto
      // para que un futuro toggle no vuelva a preguntar por esta misma
      // solicitud.
      resolvedForRef.current = requestKey
      return
    }

    if (resolvedForRef.current === requestKey) {
      // Ya se preguntó (o resolvió) para esta solicitud exacta. No insistir.
      return
    }

    if (showHistory) {
      return
    }

    const existsHidden = allItems.some(
      item => getId(item) === focusedId,
    )

    if (existsHidden) {
      resolvedForRef.current = requestKey
      onHistoryRequired?.()
    }

  }, [
    requestKey,
    focusedId,
    showHistory,
    visibleItems,
    allItems,
    onHistoryRequired,
  ])

}