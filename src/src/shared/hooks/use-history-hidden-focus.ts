"use client"

import {
  useLayoutEffect,
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
  // Informa si la solicitud de foco actual sigue "en resuelto" (true) o
  // ya se resolvió (false), sea porque el item ya es visible o porque
  // el diálogo de historial ya fue disparado (y trae su propio overlay).
  // Permite que el componente contenedor mantenga un overlay/blur
  // continuo mientras se decide, sin dejar un frame sin nada de blur.
  onResolvingChange?: (resolving: boolean) => void
}

export function useHistoryHiddenFocus<T>({
  focusedId,
  focusToken,
  showHistory,
  visibleItems,
  allItems,
  getId,
  onHistoryRequired,
  onResolvingChange,
}: Params<T>) {

  const resolvedForRef = useRef<string | null>(null)

  // La clave de deduplicación es la SOLICITUD (id + token de foco),
  // no la identidad de la entidad. Sin token (rutas que no lo envían:
  // Projects, Search, Dashboard, links antiguos) cae al comportamiento
  // anterior: dedup solo por focusedId.
  const requestKey = focusedId
    ? `${focusedId}:${focusToken ?? ""}`
    : null

  // useLayoutEffect (no useEffect): la decisión de abrir el diálogo o
  // marcar como resuelto debe tomarse ANTES de que el navegador pinte,
  // para no dejar un frame visible sin overlay entre el cierre del
  // popover de notificaciones y la apertura del ActionDialog.
  useLayoutEffect(() => {

    if (!requestKey) {
      resolvedForRef.current = null
      onResolvingChange?.(false)
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
      onResolvingChange?.(false)
      return
    }

    if (resolvedForRef.current === requestKey) {
      // Ya se preguntó (o resolvió) para esta solicitud exacta. No insistir.
      onResolvingChange?.(false)
      return
    }

    if (showHistory) {
      // El historial ya está visible pero el item aún no aparece
      // (probablemente los datos todavía están cargando). Seguimos
      // "resolviendo" para no soltar el overlay antes de tiempo.
      onResolvingChange?.(true)
      return
    }

    const existsHidden = allItems.some(
      item => getId(item) === focusedId,
    )

    if (existsHidden) {
      resolvedForRef.current = requestKey
      onHistoryRequired?.()
      // El ActionDialog trae su propio overlay con blur: podemos
      // soltar el overlay puente en el mismo commit, sin dejar hueco.
      onResolvingChange?.(false)
      return
    }

    // Ni visible ni confirmado como oculto todavía (datos cargando).
    // Seguimos resolviendo.
    onResolvingChange?.(true)

  }, [
    requestKey,
    focusedId,
    showHistory,
    visibleItems,
    allItems,
    onHistoryRequired,
    onResolvingChange,
  ])

}