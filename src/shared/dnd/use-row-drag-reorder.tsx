"use client"

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"

import { DndRowProvider } from "@/shared/ui/entity-table-common/dnd-row-context"

type RowRect = {
  id: string
  top: number
  height: number
  center: number
}

type DragState<T> = {
  item: T
  id: string
  left: number
  width: number
}

type Props<T> = {
  items: T[]
  getId: (item: T) => string
  onReorder: (next: T[]) => void
  renderDragLabel: (item: T) => ReactNode
  disabled?: boolean
  isRowDisabled?: (item: T) => boolean
}

export function useRowDragReorder<T>({
  items,
  getId,
  onReorder,
  renderDragLabel,
  disabled,
  isRowDisabled,
}: Props<T>) {

  const [drag, setDrag] = useState<DragState<T> | null>(null)
  const [insertIndex, setInsertIndex] = useState<number | null>(null)

  const itemsRef = useRef(items)
  itemsRef.current = items

  const dragRef = useRef(drag)
  dragRef.current = drag

  const insertIndexRef = useRef(insertIndex)
  insertIndexRef.current = insertIndex

  const rowEls = useRef<Record<string, HTMLDivElement | null>>({})
  const rects = useRef<RowRect[]>([])
  const raf = useRef<number | null>(null)

  function capture() {
    rects.current = itemsRef.current.map(item => {
      const id = getId(item)
      const el = rowEls.current[id]

      if (!el) {
        return { id, top: 0, height: 0, center: 0 }
      }

      const r = el.getBoundingClientRect()

      return {
        id,
        top: r.top,
        height: r.height,
        center: r.top + r.height / 2,
      }
    })
  }

  function getInsertIndex(y: number, dragId: string) {
    let index = 0

    for (const rect of rects.current) {
      if (rect.id === dragId) continue
      if (y < rect.center) return index
      index++
    }

    return index
  }

  function beginDrag(
    e: ReactPointerEvent<HTMLElement>,
    item: T,
  ) {
    if (disabled) return

    const id = getId(item)
    const rowEl = rowEls.current[id]
    if (!rowEl) return

    const rect = rowEl.getBoundingClientRect()

    capture()

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // noop
    }

    setInsertIndex(itemsRef.current.findIndex(i => getId(i) === id))

    setDrag({
      item,
      id,
      left: rect.left,
      width: rect.width,
    })
  }

  function finishDrag() {
    const current = dragRef.current
    const finalInsertIndex = insertIndexRef.current

    if (current && finalInsertIndex !== null) {
      const list = itemsRef.current
      const from = list.findIndex(i => getId(i) === current.id)
      const next = [...list]
      const [moved] = next.splice(from, 1)
      next.splice(finalInsertIndex, 0, moved)
      onReorder(next)
    }

    // Mantenemos insertIndex fijo mientras el overlay sigue visible,
    // para que lineTop no salte a 0 durante el fade-out.

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDrag(null)
        setInsertIndex(null)
      })
    })
  }

  useEffect(() => {
    if (!drag) return

    const dragId = drag.id

    function onMove(e: PointerEvent) {
      if (raf.current) cancelAnimationFrame(raf.current)

      raf.current = requestAnimationFrame(() => {
        setInsertIndex(getInsertIndex(e.clientY, dragId))
      })
    }

    function onUp() {
      finishDrag()
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag])

  const lineTop = (() => {
    if (insertIndex === null) return 0

    if (insertIndex >= rects.current.length) {
      const last = rects.current.at(-1)
      return last ? last.top + last.height : 0
    }

    return rects.current[insertIndex]?.top ?? 0
  })()

  function renderRow(
    item: T,
    content: ReactNode,
    templateColumns: string,
    rowId: string,
  ) {
    const isDragging = drag?.id === rowId
    const rowDisabled = disabled || isRowDisabled?.(item)

    return (
      <div
        style={{
          height: isDragging ? 0 : undefined,
          overflow: isDragging ? "hidden" : undefined,
          transition: "height 180ms cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <div
          ref={el => { rowEls.current[rowId] = el }}
          className="grid min-w-0 items-center border-b border-white/5"
          style={{
            gridTemplateColumns: templateColumns,
            opacity: isDragging ? 0 : 1,
            transform: isDragging ? "scale(0.98)" : "scale(1)",
            transition: "opacity 160ms ease, transform 160ms ease",
          }}
        >
          <DndRowProvider
            value={
              rowDisabled
                ? null
                : { onPointerDown: e => beginDrag(e, item) }
            }
          >
            {content}
          </DndRowProvider>
        </div>
      </div>
    )
  }

  const overlay = drag && (
    <div
      style={{
        position: "fixed",
        left: drag.left,
        top: lineTop,
        width: drag.width,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <div className="relative h-0.5">
        <div className="absolute inset-0 rounded-full bg-linear-to-r from-transparent via-sky-500 to-transparent" />
        <div className="absolute inset-0 rounded-full bg-linear-to-r from-transparent via-sky-500 to-transparent opacity-70 blur-[3px]" />
      </div>

      <div className="mt-2 flex w-64 items-center gap-3 rounded-xl border border-white/10 bg-neutral-900/95 px-3 py-2 backdrop-blur-xl shadow-[0_28px_70px_rgba(0,0,0,.45)]">
        <span className="text-white/35 shrink-0">≡</span>
        <div className="min-w-0 overflow-hidden">
          {renderDragLabel(drag.item)}
        </div>
      </div>
    </div>
  )

  return {
    renderRow,
    overlay,
    isDragging: !!drag,
  }
}