"use client"

import { useEffect, useRef } from "react"

import { useDeepLinkRoute } from "@/shared/focus/deep-link-route"

type Props = {
  focusedId?: string
  setExpandedRowId: (id: string | null) => void
}

function centerEl(el: HTMLElement) {
  let parent: HTMLElement | null = el.parentElement
  while (parent) {
    const { overflowY } = window.getComputedStyle(parent)
    const scrollable =
      (overflowY === "auto" ||
        overflowY === "scroll" ||
        overflowY === "overlay") &&
      parent.scrollHeight > parent.clientHeight + 1
    if (scrollable) {
      const pr = parent.getBoundingClientRect()
      const er = el.getBoundingClientRect()
      const mid = er.top - pr.top + parent.scrollTop + er.height / 2
      const top = Math.max(
        0,
        Math.min(
          mid - parent.clientHeight / 2,
          parent.scrollHeight - parent.clientHeight,
        ),
      )
      parent.scrollTo({ top, behavior: "auto" })
      return
    }
    parent = parent.parentElement
  }
  el.scrollIntoView({ behavior: "auto", block: "center" })
}

/** directing → expand + scroll → arrive (siempre, sin esperar loading). */
export function useDeepLinkRunner({ focusedId, setExpandedRowId }: Props) {
  const phase = useDeepLinkRoute(s => s.route?.phase)
  const setExpandedRef = useRef(setExpandedRowId)
  setExpandedRef.current = setExpandedRowId

  useEffect(() => {
    if (phase !== "directing" || !focusedId) return

    setExpandedRef.current(focusedId)

    let cancelled = false
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return
        const el = document.querySelector(
          `[data-expanded-row-id="${CSS.escape(focusedId)}"]`,
        ) as HTMLElement | null
        if (el) centerEl(el)

        const state = useDeepLinkRoute.getState()
        const tab = state.route?.tab
        state.arrive()
        if (!tab) state.finish()
      })
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf1)
    }
  }, [phase, focusedId])
}
