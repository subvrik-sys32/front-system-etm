"use client"

import { useEffect, useRef } from "react"

import { useFocusSettleStore } from "@/shared/focus/store/focus-settle-store"
import { useFocusNavStore } from "@/shared/focus/store/focus-nav-store"

type Props = {
  focusedId?: string
  expandedRowId?: string | null
  setExpandedRowId: (id: string | null) => void
  focusToken?: string
  onSettled?: () => void
}

const FIND_TIMEOUT_MS = 2500

function isScrollable(el: HTMLElement): boolean {
  const { overflowY } = window.getComputedStyle(el)
  if (
    overflowY !== "auto" &&
    overflowY !== "scroll" &&
    overflowY !== "overlay"
  ) {
    return false
  }
  return el.scrollHeight > el.clientHeight + 1
}

function getScrollParent(el: HTMLElement): HTMLElement | null {
  let parent = el.parentElement
  while (parent) {
    if (isScrollable(parent)) return parent
    parent = parent.parentElement
  }
  return null
}

function centerInScrollParent(el: HTMLElement) {
  const parent = getScrollParent(el)
  if (!parent) {
    el.scrollIntoView({ behavior: "auto", block: "center" })
    return
  }
  const parentRect = parent.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const elMid =
    elRect.top - parentRect.top + parent.scrollTop + elRect.height / 2
  const target = elMid - parent.clientHeight / 2
  const max = Math.max(0, parent.scrollHeight - parent.clientHeight)
  const top = Math.max(0, Math.min(target, max))
  parent.scrollTo({ top, behavior: "auto" })
}

/** Después del paint del expand (sin setTimeout de 220ms). */
function afterPaint(cb: () => void): () => void {
  let raf1 = 0
  let raf2 = 0
  let cancelled = false
  raf1 = window.requestAnimationFrame(() => {
    raf2 = window.requestAnimationFrame(() => {
      if (!cancelled) cb()
    })
  })
  return () => {
    cancelled = true
    window.cancelAnimationFrame(raf1)
    window.cancelAnimationFrame(raf2)
  }
}

function waitForRow(
  selector: string,
  onFound: (el: HTMLElement) => void,
  timeoutMs: number,
  isActive: () => boolean,
  onTimeout?: () => void,
): () => void {
  const root = document.body
  let cancelled = false
  let raf = 0
  const start = performance.now()
  const tryFind = () => {
    if (cancelled || !isActive()) return
    const el = root.querySelector(selector) as HTMLElement | null
    if (el) {
      onFound(el)
      return
    }
    if (performance.now() - start >= timeoutMs) {
      onTimeout?.()
      return
    }
    raf = window.requestAnimationFrame(tryFind)
  }
  raf = window.requestAnimationFrame(tryFind)
  return () => {
    cancelled = true
    window.cancelAnimationFrame(raf)
  }
}

/**
 * Secuencia deep-link:
 * 1. Dirigiendo ON
 * 2. Expand inmediato + scroll al row
 * 3. Dirigiendo OFF
 * 4. markSettled → recién ahí Mensajes puede abrir
 *
 * Nunca markSettled con overlay activo (dialog no queda detrás).
 */
export function useFocusedRow({
  focusedId,
  expandedRowId = null,
  setExpandedRowId,
  focusToken,
  onSettled,
}: Props) {
  const prevFocusedIdRef = useRef<string | undefined>(undefined)
  const expandedRowIdRef = useRef<string | null>(expandedRowId)
  expandedRowIdRef.current = expandedRowId

  const onSettledRef = useRef(onSettled)
  onSettledRef.current = onSettled
  const focusTokenRef = useRef(focusToken)
  focusTokenRef.current = focusToken
  const setExpandedRowIdRef = useRef(setExpandedRowId)
  setExpandedRowIdRef.current = setExpandedRowId

  /** Orden fijo: cerrar overlay → marcar settled → callback. */
  const completeNavigation = () => {
    useFocusNavStore.getState().end()
    const token = focusTokenRef.current
    if (token) useFocusSettleStore.getState().markSettled(token)
    onSettledRef.current?.()
  }

  const stopTrackingRef = useRef<(() => void) | null>(null)
  const stopTracking = () => {
    stopTrackingRef.current?.()
    stopTrackingRef.current = null
  }

  useEffect(() => {
    if (!focusedId) return
    if (expandedRowId != null && expandedRowId !== focusedId) stopTracking()
  }, [expandedRowId, focusedId])

  useEffect(() => {
    if (!focusedId) {
      stopTracking()
      useFocusNavStore.getState().end()
      prevFocusedIdRef.current = undefined
      return
    }

    if (
      expandedRowIdRef.current != null &&
      expandedRowIdRef.current !== focusedId
    ) {
      stopTracking()
      return
    }

    prevFocusedIdRef.current = focusedId

    const animate = Boolean(focusTokenRef.current)
    if (animate) {
      useFocusNavStore.getState().start("Dirigiendo…")
      // Invalidar settled previo para que Mensajes no abra a mitad de ruta.
      useFocusSettleStore.getState().reset()
    }

    const selector = `[data-expanded-row-id="${CSS.escape(focusedId)}"]`
    const isActive = () => {
      const expanded = expandedRowIdRef.current
      return (
        prevFocusedIdRef.current === focusedId &&
        (expanded == null || expanded === focusedId)
      )
    }

    stopTracking()
    const expand = () => setExpandedRowIdRef.current(focusedId)

    // Expand al inicio: el row ya está en DOM (data-expanded-row-id en el wrapper).
    expand()

    if (!animate) {
      completeNavigation()
      return () => {
        stopTracking()
      }
    }

    let cancelPaint: (() => void) | null = null

    const stopWait = waitForRow(
      selector,
      el => {
        if (!isActive()) return
        centerInScrollParent(el)
        cancelPaint = afterPaint(() => {
          if (!isActive()) return
          centerInScrollParent(el)
          completeNavigation()
        })
      },
      FIND_TIMEOUT_MS,
      isActive,
      () => {
        if (!isActive()) return
        completeNavigation()
      },
    )

    stopTrackingRef.current = () => {
      stopWait()
      cancelPaint?.()
    }

    return () => {
      stopTracking()
    }
  }, [focusedId, focusToken])
}
