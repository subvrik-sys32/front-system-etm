"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

const GAP = 6

type Tip = { text: string; top: number; left: number }

function closestHintEl(node: EventTarget | null): HTMLElement | null {
  if (!(node instanceof Element)) return null
  const el = node.closest("[title], [data-hint]") as HTMLElement | null
  if (!el) return null
  if (el.closest("[data-no-hint]")) return null
  return el
}

/** Siempre gana el `title` vivo (React lo reescribe al cambiar el estado). */
function consumeLabel(el: HTMLElement): string {
  const title = el.getAttribute("title")?.trim()
  if (title) {
    el.setAttribute("data-hint", title)
    el.removeAttribute("title")
    return title
  }
  return el.getAttribute("data-hint")?.trim() ?? ""
}

export function HintProvider() {
  const [tip, setTip] = useState<Tip | null>(null)
  const current = useRef<HTMLElement | null>(null)
  const textRef = useRef("")

  useEffect(() => {
    const hide = () => {
      current.current = null
      textRef.current = ""
      setTip(null)
    }

    const showFor = (el: HTMLElement) => {
      const text = consumeLabel(el)
      if (!text) return
      const r = el.getBoundingClientRect()
      current.current = el
      textRef.current = text
      setTip({
        text,
        top: r.bottom + GAP,
        left: r.left + r.width / 2,
      })
    }

    const onOver = (e: PointerEvent) => {
      const el = closestHintEl(e.target)
      if (!el) {
        if (current.current) hide()
        return
      }
      const next = consumeLabel(el)
      if (!next) {
        hide()
        return
      }
      if (el === current.current && next === textRef.current) return
      showFor(el)
    }

    const onOut = (e: PointerEvent) => {
      if (!current.current) return
      const next = closestHintEl(e.relatedTarget)
      if (next === current.current) return
      if (!current.current.contains(e.relatedTarget as Node)) hide()
    }

    document.addEventListener("pointerover", onOver, true)
    document.addEventListener("pointerout", onOut, true)
    window.addEventListener("scroll", hide, true)
    window.addEventListener("resize", hide)
    return () => {
      document.removeEventListener("pointerover", onOver, true)
      document.removeEventListener("pointerout", onOut, true)
      window.removeEventListener("scroll", hide, true)
      window.removeEventListener("resize", hide)
    }
  }, [])

  if (!tip || typeof document === "undefined") return null

  return createPortal(
    <span
      role="tooltip"
      className="pointer-events-none fixed z-300 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-[10px] font-medium text-popover-foreground shadow-md ring-0 sm:block"
      style={{ top: tip.top, left: tip.left }}
    >
      {tip.text}
    </span>,
    document.body,
  )
}
