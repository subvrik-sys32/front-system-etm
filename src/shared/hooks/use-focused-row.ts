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
const POST_EXPAND_MS = 220

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

function scrollExpandAndSettle(
  el: HTMLElement,
  isActive: () => boolean,
  expand: () => void,
  onSettled: (() => void) | undefined,
): () => void {
  let disposed = false
  let timer: number | null = null
  const finish = () => {
    useFocusNavStore.getState().end()
    onSettled?.()
  }
  if (disposed || !isActive()) return () => {}
  centerInScrollParent(el)
  expand()
  timer = window.setTimeout(() => {
    if (disposed || !isActive()) return
    centerInScrollParent(el)
    if (!disposed && isActive()) finish()
  }, POST_EXPAND_MS)
  return () => {
    disposed = true
    if (timer !== null) window.clearTimeout(timer)
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
    const el = root.querySelector<HTMLElement>(selector)
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

/** Deep-link / F5 / notificaciones / tab=comments. URL = fuente de verdad. */
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

  const settleOnly = () => {
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
      useFocusSettleStore.getState().reset()
      const prev = prevFocusedIdRef.current
      prevFocusedIdRef.current = undefined
      if (prev && expandedRowIdRef.current === prev) {
        setExpandedRowIdRef.current(null)
      }
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
    useFocusNavStore.getState().start("Dirigiendo…")
    useFocusSettleStore.getState().reset()

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

    const stopWait = waitForRow(
      selector,
      el => {
        if (!isActive()) return
        stopTracking()
        stopTrackingRef.current = scrollExpandAndSettle(
          el,
          isActive,
          expand,
          settleOnly,
        )
      },
      FIND_TIMEOUT_MS,
      isActive,
      () => {
        if (!isActive()) return
        expand()
        useFocusNavStore.getState().end()
        settleOnly()
      },
    )

    stopTrackingRef.current = () => {
      stopWait()
    }

    return () => {
      stopTracking()
    }
  }, [focusedId, focusToken])
}
