"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

const GAP = 6
const PAD = 8

type Tip = { text: string; top: number; left: number }

function closestHintEl(node: EventTarget | null): HTMLElement | null {
  if (!(node instanceof Element)) return null
  const el = node.closest("[title], [data-hint]") as HTMLElement | null
  if (!el) return null
  if (el.closest("[data-no-hint]")) return null
  return el
}

function consumeLabel(el: HTMLElement): string {
  const title = el.getAttribute("title")?.trim()
  if (title) {
    el.setAttribute("data-hint", title)
    el.removeAttribute("title")
    return title
  }
  return el.getAttribute("data-hint")?.trim() ?? ""
}

function place(el: HTMLElement, text: string): Tip {
  const r = el.getBoundingClientRect()
  const estW = Math.min(280, Math.max(64, text.length * 6.2 + 16))
  const estH = 24
  let left = r.left + r.width / 2
  let top = r.bottom + GAP
  const minL = PAD + estW / 2
  const maxL = window.innerWidth - PAD - estW / 2
  left = Math.min(Math.max(left, minL), Math.max(minL, maxL))
  if (top + estH + PAD > window.innerHeight) {
    top = r.top - GAP - estH
  }
  if (top < PAD) top = PAD
  return { text, top, left }
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
      current.current = el
      textRef.current = text
      setTip(place(el, text))
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

    const mo = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type !== "attributes" || m.attributeName !== "title") continue
        const el = m.target
        if (!(el instanceof HTMLElement) || !el.hasAttribute("title")) continue
        consumeLabel(el)
      }
    })
    mo.observe(document.body, {
      attributes: true,
      attributeFilter: ["title"],
      subtree: true,
    })

    document.addEventListener("pointerover", onOver, true)
    document.addEventListener("pointerout", onOut, true)
    window.addEventListener("scroll", hide, true)
    window.addEventListener("resize", hide)
    return () => {
      mo.disconnect()
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
      className="pointer-events-none fixed z-300 hidden max-w-[min(18rem,calc(100vw-1rem))] -translate-x-1/2 truncate rounded-md bg-popover px-2 py-1 text-[10px] font-medium text-popover-foreground shadow-md sm:block"
      style={{ top: tip.top, left: tip.left }}
    >
      {tip.text}
    </span>,
    document.body,
  )
}
