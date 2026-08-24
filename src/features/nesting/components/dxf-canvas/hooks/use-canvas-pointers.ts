"use client"

import {
  useEffect,
  type Dispatch,
  type MutableRefObject,
  type RefObject,
  type SetStateAction,
} from "react"
import type {
  CanvasTool,
  Entity,
  NestingPieceInput,
  Point,
  SnapCandidate,
  TransformMode,
} from "../types/types"
import type { CollisionIndex, SnapGuide } from "../utils/collision"
import { resolveDragOffset } from "../utils/collision"
import { resolveAxisLock } from "../../../utils/transform-mode"
import { findSmartSnap } from "../utils/snap"
import { findSmartSpansAtPoint } from "../utils/geometry-utils"
import {
  hitTestPieceAt,
  piecesInBox,
  hitTestDimensionLine,
} from "../utils/hit-test"
import { applyOrthoConstraint } from "./use-measurements"
import type { useCanvasView } from "./use-canvas-view"
import type { useMeasurements } from "./use-measurements"
import type { useSimulation } from "./use-simulation"

type PieceDragState = {
  pieceIndices: number[]
  startLocal: Point
  offset: Point
  axisLock: "x" | "y" | null
}

type BoxState = {
  startScreen: { x: number; y: number }
  curScreen: { x: number; y: number }
  startLocal: { x: number; y: number }
  curLocal: { x: number; y: number }
}

type PinchState = {
  startDist: number
  startScale: number
  startOffsetX: number
  startOffsetY: number
  midX: number
  midY: number
}

type DragPanState = {
  startX: number
  startY: number
  startOffsetX: number
  startOffsetY: number
  moved: boolean
}

type RotateDragState = {
  pivot: { x: number; y: number }
  startAngle: number
  currentDelta: number
  pieceIndices: number[]
}

type SheetSize = { width: number; height: number }

type Params = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  entitiesRef: MutableRefObject<Entity[]>
  draggingRef: MutableRefObject<DragPanState | null>
  pieceDragRef: MutableRefObject<PieceDragState | null>
  measurementDragRef: MutableRefObject<{ id: string; a: Point; b: Point } | null>
  lockedPieceIndicesRef: MutableRefObject<number[]>
  spaceHeldRef: MutableRefObject<boolean>
  pointersRef: MutableRefObject<Map<number, { x: number; y: number }>>
  pinchRef: MutableRefObject<PinchState | null>
  boxSelectRef: MutableRefObject<BoxState | null>
  zoomWindowRef: MutableRefObject<BoxState | null>
  rotateDragRef: MutableRefObject<RotateDragState | null>
  collisionIndexRef: MutableRefObject<CollisionIndex | null>
  snapGuidesRef: MutableRefObject<SnapGuide[]>
  cursorCssRef: MutableRefObject<{ x: number; y: number } | null>
  coordsLabelRef: MutableRefObject<HTMLSpanElement | null>

  view: ReturnType<typeof useCanvasView>
  measure: ReturnType<typeof useMeasurements>
  sim: ReturnType<typeof useSimulation>
  scheduleDraw: () => void

  canvasTool: CanvasTool
  setCanvasTool: Dispatch<SetStateAction<CanvasTool>>
  setCtxMenu: Dispatch<
    SetStateAction<{ x: number; y: number; pieceIndex: number | null } | null>
  >
  setBoxSelectScreen: Dispatch<
    SetStateAction<{ x0: number; y0: number; x1: number; y1: number } | null>
  >
  setRotatePivotScreen: Dispatch<SetStateAction<{ x: number; y: number } | null>>
  setRotatePreviewDelta: Dispatch<SetStateAction<number>>
  setSnapCandidate: Dispatch<SetStateAction<SnapCandidate | null>>
  setSmartSpans: Dispatch<
    SetStateAction<{
      h: { a: Point; b: Point; value: number } | null
      v: { a: Point; b: Point; value: number } | null
      center: Point
    } | null>
  >
  setAreaHoverContour: Dispatch<SetStateAction<Point[] | null>>

  pieces: NestingPieceInput[]
  sheetSize?: SheetSize | null
  selectedPieceIndices: number[]
  snapEnabled: boolean
  transformMode: TransformMode
  isCompact: boolean
  onSelectPiece?: (index: number | null, additive: boolean) => void
  onMovePieces?: (indices: number[], dx: number, dy: number) => void
  onRotateAroundPivot?: (
    indices: number[],
    pivot: Point,
    deltaDeg: number,
  ) => void
}

export function useCanvasPointers(p: Params) {
  const {
    canvasRef,
    entitiesRef,
    draggingRef,
    pieceDragRef,
    measurementDragRef,
    lockedPieceIndicesRef,
    spaceHeldRef,
    pointersRef,
    pinchRef,
    boxSelectRef,
    zoomWindowRef,
    rotateDragRef,
    collisionIndexRef,
    snapGuidesRef,
    cursorCssRef,
    coordsLabelRef,
    view,
    measure,
    sim,
    scheduleDraw,
    canvasTool,
    setCanvasTool,
    setCtxMenu,
    setBoxSelectScreen,
    setRotatePivotScreen,
    setRotatePreviewDelta,
    setSnapCandidate,
    setSmartSpans,
    setAreaHoverContour,
    pieces,
    sheetSize,
    selectedPieceIndices,
    snapEnabled,
    transformMode,
    isCompact,
    onSelectPiece,
    onMovePieces,
    onRotateAroundPivot,
  } = p

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const sheet: SheetSize | undefined = sheetSize ?? undefined

    const setCursor = (c: string) => {
      canvas.style.cursor = c
    }

    const canvasCssPoint = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      const sx = (canvas.clientWidth || rect.width) / (rect.width || 1)
      const sy = (canvas.clientHeight || rect.height) / (rect.height || 1)
      return {
        x: (clientX - rect.left) * sx,
        y: (clientY - rect.top) * sy,
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      setCtxMenu(null)
      if (e.button === 2) return

      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (pointersRef.current.size === 2) {
        const pts = [...pointersRef.current.values()]
        const dx = pts[1].x - pts[0].x
        const dy = pts[1].y - pts[0].y
        const dist = Math.hypot(dx, dy) || 1
        const midX = (pts[0].x + pts[1].x) / 2
        const midY = (pts[0].y + pts[1].y) / 2
        pinchRef.current = {
          startDist: dist,
          startScale: view.viewRef.current.scale,
          startOffsetX: view.viewRef.current.offsetX,
          startOffsetY: view.viewRef.current.offsetY,
          midX,
          midY,
        }
        draggingRef.current = null
        pieceDragRef.current = null
        boxSelectRef.current = null
        zoomWindowRef.current = null
        setBoxSelectScreen(null)
        canvas.setPointerCapture(e.pointerId)
        return
      }

      const rawPoint = view.screenToLocal(canvas, e.clientX, e.clientY)
      if (!rawPoint) return

      const forcePan =
        spaceHeldRef.current || e.button === 1 || canvasTool === "pan"
      if (forcePan) {
        draggingRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          startOffsetX: view.viewRef.current.offsetX,
          startOffsetY: view.viewRef.current.offsetY,
          moved: false,
        }
        canvas.setPointerCapture(e.pointerId)
        setCursor("grabbing")
        return
      }

      if (canvasTool === "zoomWindow" && measure.activeTool === "none") {
        const screenPt = canvasCssPoint(e.clientX, e.clientY)
        zoomWindowRef.current = {
          startScreen: screenPt,
          curScreen: screenPt,
          startLocal: rawPoint,
          curLocal: rawPoint,
        }
        setBoxSelectScreen({
          x0: screenPt.x,
          y0: screenPt.y,
          x1: screenPt.x,
          y1: screenPt.y,
        })
        canvas.setPointerCapture(e.pointerId)
        setCursor("crosshair")
        return
      }

      if (canvasTool === "rotate" && measure.activeTool === "none") {
        const locked = new Set(lockedPieceIndicesRef.current)
        const movable = selectedPieceIndices.filter((i) => !locked.has(i))
        if (movable.length === 0) return
        const pivot = { x: rawPoint.x, y: rawPoint.y }
        rotateDragRef.current = {
          pivot,
          startAngle: Number.NaN,
          currentDelta: 0,
          pieceIndices: movable,
        }
        const rect = canvas.getBoundingClientRect()
        setRotatePivotScreen({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
        setRotatePreviewDelta(0)
        canvas.setPointerCapture(e.pointerId)
        setCursor("crosshair")
        return
      }

      if (measure.activeTool === "none") {
        const measurementHit = hitTestDimensionLine(
          measure.measurements,
          rawPoint,
          view.viewRef.current.scale,
        )
        if (measurementHit) {
          measurementDragRef.current = {
            id: measurementHit.id,
            a: measurementHit.a,
            b: measurementHit.b,
          }
          canvas.setPointerCapture(e.pointerId)
          setCursor("move")
          return
        }

        const hit = hitTestPieceAt(
          entitiesRef.current,
          rawPoint,
          view.viewRef.current.scale,
        )

        if (hit !== null && selectedPieceIndices.includes(hit)) {
          const locked = new Set(lockedPieceIndicesRef.current)
          const movable = selectedPieceIndices.filter((i) => !locked.has(i))
          if (movable.length === 0) return
          pieceDragRef.current = {
            pieceIndices: movable,
            startLocal: rawPoint,
            offset: { x: 0, y: 0 },
            axisLock: null,
          }
          canvas.setPointerCapture(e.pointerId)
          setCursor("move")
          return
        }

        if (hit === null && canvasTool === "select") {
          if (isCompact) {
            draggingRef.current = {
              startX: e.clientX,
              startY: e.clientY,
              startOffsetX: view.viewRef.current.offsetX,
              startOffsetY: view.viewRef.current.offsetY,
              moved: false,
            }
            canvas.setPointerCapture(e.pointerId)
            setCursor("grabbing")
            return
          }
          const screenPt = canvasCssPoint(e.clientX, e.clientY)
          boxSelectRef.current = {
            startScreen: screenPt,
            curScreen: screenPt,
            startLocal: rawPoint,
            curLocal: rawPoint,
          }
          setBoxSelectScreen({
            x0: screenPt.x,
            y0: screenPt.y,
            x1: screenPt.x,
            y1: screenPt.y,
          })
          canvas.setPointerCapture(e.pointerId)
          setCursor("crosshair")
          return
        }

        draggingRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          startOffsetX: view.viewRef.current.offsetX,
          startOffsetY: view.viewRef.current.offsetY,
          moved: false,
        }
        canvas.setPointerCapture(e.pointerId)
        return
      }

      draggingRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startOffsetX: view.viewRef.current.offsetX,
        startOffsetY: view.viewRef.current.offsetY,
        moved: false,
      }
      canvas.setPointerCapture(e.pointerId)
    }

    const writeCursor = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      const sx = canvas.clientWidth / (rect.width || 1)
      const sy = canvas.clientHeight / (rect.height || 1)
      cursorCssRef.current = {
        x: (clientX - rect.left) * sx,
        y: (clientY - rect.top) * sy,
      }
      const local = view.screenToLocal(canvas, clientX, clientY)
      if (local && coordsLabelRef.current) {
        coordsLabelRef.current.textContent = `X: ${local.x.toFixed(2)}  Y: ${local.y.toFixed(2)} mm`
      }
    }

    // Cursor / reglas: solo si el puntero está EN el canvas.
    // El toolbar es overlay hermano; no recibe estos eventos.
    const onCanvasHoverMove = (e: PointerEvent) => {
      const gesture =
        draggingRef.current ||
        pieceDragRef.current ||
        measurementDragRef.current ||
        pinchRef.current ||
        boxSelectRef.current ||
        zoomWindowRef.current
      if (gesture) return
      writeCursor(e.clientX, e.clientY)
    }

    const onCanvasHoverLeave = () => {
      const gesture =
        draggingRef.current ||
        pieceDragRef.current ||
        measurementDragRef.current ||
        pinchRef.current
      if (gesture) return
      cursorCssRef.current = null
    }

    const onPointerMove = (e: PointerEvent) => {
      const gesture =
        draggingRef.current ||
        pieceDragRef.current ||
        measurementDragRef.current ||
        pinchRef.current ||
        boxSelectRef.current ||
        zoomWindowRef.current
      // Window move solo para gestos que empezaron en el canvas.
      // No pinta cursor: eso es onCanvasHoverMove.
      if (gesture) {
        writeCursor(e.clientX, e.clientY)
      }
      if (pointersRef.current.has(e.pointerId)) {
        pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      }

      if (measurementDragRef.current) {
        const rawPoint = view.screenToLocal(canvas, e.clientX, e.clientY)
        if (rawPoint) {
          const { id, a, b } = measurementDragRef.current
          const dx = b.x - a.x
          const dy = b.y - a.y
          const len = Math.hypot(dx, dy) || 1
          const nx = -dy / len
          const ny = dx / len
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
          const offset =
            (rawPoint.x - mid.x) * nx + (rawPoint.y - mid.y) * ny
          measure.updateMeasurementOffset(id, offset)
          scheduleDraw()
        }
        return
      }

      if (pinchRef.current && pointersRef.current.size >= 2) {
        const pts = [...pointersRef.current.values()]
        const dx = pts[1].x - pts[0].x
        const dy = pts[1].y - pts[0].y
        const dist = Math.hypot(dx, dy) || 1
        const midX = (pts[0].x + pts[1].x) / 2
        const midY = (pts[0].y + pts[1].y) / 2
        const pinch = pinchRef.current
        const factor = dist / pinch.startDist
        const newScale = Math.min(
          200,
          Math.max(0.01, pinch.startScale * factor),
        )
        const rect = canvas.getBoundingClientRect()
        const cx = midX - rect.left - rect.width / 2
        const cy = midY - rect.top - rect.height / 2
        const scaleRatio = newScale / pinch.startScale
        const midDx = midX - pinch.midX
        const midDy = midY - pinch.midY
        view.markUserInteracted()
        view.viewRef.current = {
          scale: newScale,
          offsetX:
            pinch.startOffsetX * scaleRatio +
            cx * (1 - scaleRatio) +
            midDx,
          offsetY:
            pinch.startOffsetY * scaleRatio +
            cy * (1 - scaleRatio) +
            midDy,
          rotationDeg: 0,
        }
        scheduleDraw()
        return
      }

      if (boxSelectRef.current || zoomWindowRef.current) {
        const screenPt = canvasCssPoint(e.clientX, e.clientY)
        const local = view.screenToLocal(canvas, e.clientX, e.clientY)
        const active = boxSelectRef.current ?? zoomWindowRef.current
        if (active) {
          active.curScreen = screenPt
          if (local) active.curLocal = local
          setBoxSelectScreen({
            x0: active.startScreen.x,
            y0: active.startScreen.y,
            x1: screenPt.x,
            y1: screenPt.y,
          })
        }
        scheduleDraw()
        return
      }

      if (rotateDragRef.current) {
        const local = view.screenToLocal(canvas, e.clientX, e.clientY)
        if (local) {
          const rd = rotateDragRef.current
          const dx = local.x - rd.pivot.x
          const dy = local.y - rd.pivot.y
          if (Math.hypot(dx, dy) > 1e-3) {
            const ang = Math.atan2(dy, dx)
            if (Number.isNaN(rd.startAngle)) rd.startAngle = ang
            let delta = ((ang - rd.startAngle) * 180) / Math.PI
            if (e.shiftKey) delta = Math.round(delta / 15) * 15
            rd.currentDelta = delta
            setRotatePreviewDelta(delta)
          }
        }
        scheduleDraw()
        return
      }

      if (measure.activeTool !== "none" && measure.activeTool !== "smart") {
        setCursor("crosshair")
        const rawPoint = view.screenToLocal(canvas, e.clientX, e.clientY)
        const rect = canvas.getBoundingClientRect()
        const usesPointSnap =
          measure.activeTool === "distance" ||
          measure.activeTool === "angle" ||
          measure.activeTool === "coords" ||
          measure.activeTool === "radius"
        const snap =
          snapEnabled && usesPointSnap && rawPoint
            ? findSmartSnap(
                entitiesRef.current,
                rawPoint,
                view.viewRef.current.scale,
                sheet,
              )
            : null
        setSnapCandidate(snap)
        setSmartSpans(null)

        if (measure.activeTool === "area" && rawPoint) {
          setAreaHoverContour(
            measure.hitTestClosedContour(entitiesRef.current, rawPoint),
          )
        } else {
          setAreaHoverContour(null)
        }

        let hoverPt = snap ? snap.point : rawPoint
        if (
          measure.activeTool === "distance" &&
          measure.pendingPoints.length === 1 &&
          hoverPt
        ) {
          hoverPt = applyOrthoConstraint(measure.pendingPoints[0], hoverPt, {
            force: e.shiftKey,
          })
        }
        measure.setHoverLocal(hoverPt)
        measure.setHoverScreen({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
        scheduleDraw()
      }

      const pieceDrag = pieceDragRef.current
      if (pieceDrag) {
        const rawPoint = view.screenToLocal(canvas, e.clientX, e.clientY)
        if (rawPoint) {
          let wantDx = rawPoint.x - pieceDrag.startLocal.x
          let wantDy = rawPoint.y - pieceDrag.startLocal.y
          const axisResult = resolveAxisLock(
            transformMode,
            wantDx,
            wantDy,
            pieceDrag.axisLock,
          )
          wantDx = axisResult.dx
          wantDy = axisResult.dy
          pieceDrag.axisLock = axisResult.lock
          const resolved = resolveDragOffset(
            pieces,
            pieceDrag.pieceIndices,
            wantDx,
            wantDy,
            view.viewRef.current.scale,
            sheet,
            {
              clearance: 0,
              snapPx: 10,
              snapEnabled: snapEnabled && transformMode === "free",
              index: collisionIndexRef.current ?? undefined,
            },
          )
          pieceDrag.offset.x = resolved.dx
          pieceDrag.offset.y = resolved.dy
          snapGuidesRef.current = resolved.guides
          const pushed =
            resolved.blocked &&
            (Math.abs(wantDx - resolved.dx) > 0.5 ||
              Math.abs(wantDy - resolved.dy) > 0.5)
          setCursor(pushed ? "not-allowed" : "move")
          scheduleDraw()
        }
        return
      }

      if (measure.activeTool === "none" && !draggingRef.current) {
        const rawPoint = view.screenToLocal(canvas, e.clientX, e.clientY)
        if (rawPoint) {
          const hit = hitTestPieceAt(
            entitiesRef.current,
            rawPoint,
            view.viewRef.current.scale,
          )
          if (hit !== null && selectedPieceIndices.includes(hit)) {
            setCursor("move")
          } else if (hit !== null) {
            setCursor("pointer")
          } else {
            setCursor(canvasTool === "pan" ? "grab" : "default")
          }
        }
        setSnapCandidate(null)
        setSmartSpans(null)
        setAreaHoverContour(null)
      }

      if (measure.activeTool === "smart" && !draggingRef.current) {
        setCursor("crosshair")
        setAreaHoverContour(null)
        const rawPoint = view.screenToLocal(canvas, e.clientX, e.clientY)
        if (!rawPoint) return
        const scale = view.viewRef.current.scale
        const edgeSnap = findSmartSnap(
          entitiesRef.current,
          rawPoint,
          scale,
          sheet,
        )

        let preferEdge = false
        if (edgeSnap?.segment) {
          const { a, b } = edgeSnap.segment
          const vx = b.x - a.x
          const vy = b.y - a.y
          const len2 = vx * vx + vy * vy || 1
          let tt = ((rawPoint.x - a.x) * vx + (rawPoint.y - a.y) * vy) / len2
          tt = Math.max(0, Math.min(1, tt))
          const proj = { x: a.x + tt * vx, y: a.y + tt * vy }
          const distPx =
            Math.hypot(rawPoint.x - proj.x, rawPoint.y - proj.y) * scale
          preferEdge = distPx < 10
        }

        const spans = findSmartSpansAtPoint(entitiesRef.current, rawPoint)
        if (spans && (spans.h || spans.v)) {
          setSnapCandidate(null)
          setSmartSpans(spans)
          measure.setHoverLocal(rawPoint)
        } else if (preferEdge && edgeSnap) {
          setSnapCandidate(edgeSnap)
          setSmartSpans(null)
          measure.setHoverLocal(edgeSnap.point)
        } else if (edgeSnap) {
          setSnapCandidate(edgeSnap)
          setSmartSpans(null)
          measure.setHoverLocal(edgeSnap.point)
        } else {
          setSnapCandidate(null)
          setSmartSpans(null)
          measure.setHoverLocal(rawPoint)
        }
        const rect = canvas.getBoundingClientRect()
        measure.setHoverScreen({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
        scheduleDraw()
      }

      const drag = draggingRef.current
      if (!drag) return
      const dx = e.clientX - drag.startX
      const dy = e.clientY - drag.startY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        if (!drag.moved) {
          drag.moved = true
          sim.clearOverlayIfIdle()
          setCursor("grabbing")
        }
      }
      view.panBy(dx, dy, drag.startOffsetX, drag.startOffsetY)
      scheduleDraw()
    }

    const onPointerUp = (e: PointerEvent) => {
      pointersRef.current.delete(e.pointerId)
      if (pointersRef.current.size < 2) {
        pinchRef.current = null
      }

      if (measurementDragRef.current) {
        measurementDragRef.current = null
        setCursor("default")
        scheduleDraw()
        return
      }

      if (zoomWindowRef.current) {
        const box = zoomWindowRef.current
        zoomWindowRef.current = null
        setBoxSelectScreen(null)
        const minX = Math.min(box.startLocal.x, box.curLocal.x)
        const maxX = Math.max(box.startLocal.x, box.curLocal.x)
        const minY = Math.min(box.startLocal.y, box.curLocal.y)
        const maxY = Math.max(box.startLocal.y, box.curLocal.y)
        if (maxX - minX > 1e-2 && maxY - minY > 1e-2) {
          view.fitToBounds(canvas, { minX, minY, maxX, maxY }, 0.95)
        }
        setCursor("crosshair")
        scheduleDraw()
        return
      }

      if (rotateDragRef.current) {
        const rd = rotateDragRef.current
        rotateDragRef.current = null
        setRotatePivotScreen(null)
        const delta = rd.currentDelta
        setRotatePreviewDelta(0)
        if (Math.abs(delta) > 0.05) {
          onRotateAroundPivot?.(rd.pieceIndices, rd.pivot, delta)
        }
        setCursor("crosshair")
        scheduleDraw()
        return
      }

      if (boxSelectRef.current) {
        const box = boxSelectRef.current
        boxSelectRef.current = null
        setBoxSelectScreen(null)
        const minX = Math.min(box.startLocal.x, box.curLocal.x)
        const maxX = Math.max(box.startLocal.x, box.curLocal.x)
        const minY = Math.min(box.startLocal.y, box.curLocal.y)
        const maxY = Math.max(box.startLocal.y, box.curLocal.y)
        const w = maxX - minX
        const h = maxY - minY
        if (w < 1e-3 && h < 1e-3) {
          if (onSelectPiece && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
            onSelectPiece(null, false)
          }
          setCursor("default")
          scheduleDraw()
          return
        }
        const mode =
          box.curScreen.x >= box.startScreen.x ? "contain" : "intersect"
        const hits = piecesInBox(
          entitiesRef.current,
          { minX, minY, maxX, maxY },
          mode,
        )
        if (onSelectPiece) {
          const additive = e.shiftKey || e.ctrlKey || e.metaKey
          if (!additive) onSelectPiece(null, false)
          for (const idx of hits) onSelectPiece(idx, true)
        }
        setCursor("default")
        scheduleDraw()
        return
      }

      const pieceDrag = pieceDragRef.current
      pieceDragRef.current = null
      if (pieceDrag) {
        const { offset, pieceIndices } = pieceDrag
        if (Math.abs(offset.x) > 0.01 || Math.abs(offset.y) > 0.01) {
          onMovePieces?.(pieceIndices, offset.x, offset.y)
        }
        snapGuidesRef.current = []
        setCursor("default")
        scheduleDraw()
        return
      }

      const drag = draggingRef.current
      draggingRef.current = null
      if (!drag) return

      if (!drag.moved) {
        const rawPoint = view.screenToLocal(canvas, e.clientX, e.clientY)
        if (!rawPoint) return

        if (
          measure.activeTool !== "none" &&
          measure.activeTool !== "coords" &&
          measure.activeTool !== "smart"
        ) {
          const usesPointSnap =
            measure.activeTool === "distance" ||
            measure.activeTool === "angle" ||
            measure.activeTool === "radius"
          const snap =
            snapEnabled && usesPointSnap
              ? findSmartSnap(
                  entitiesRef.current,
                  rawPoint,
                  view.viewRef.current.scale,
                  sheet,
                )
              : null
          measure.handleToolClick(
            snap ? snap.point : rawPoint,
            entitiesRef.current,
            view.viewRef.current.scale,
            { shiftKey: e.shiftKey },
          )
          return
        }

        if (measure.activeTool === "none" && onSelectPiece) {
          const hit = hitTestPieceAt(
            entitiesRef.current,
            rawPoint,
            view.viewRef.current.scale,
          )
          onSelectPiece(hit, e.shiftKey || e.ctrlKey || e.metaKey)
        }
      }
      setCursor("default")
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      sim.clearOverlayIfIdle()
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
      view.zoomAt(canvas, e.clientX, e.clientY, factor)
      scheduleDraw()
    }

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault()

      if (measure.activeTool !== "none") {
        measure.resetTool()
        setSnapCandidate(null)
        setCursor("default")
        scheduleDraw()
        return
      }

      if (canvasTool === "zoomWindow" || canvasTool === "rotate") {
        setCanvasTool("select")
        zoomWindowRef.current = null
        rotateDragRef.current = null
        setBoxSelectScreen(null)
        setRotatePivotScreen(null)
        setCursor("default")
        scheduleDraw()
        return
      }

      const rawPoint = view.screenToLocal(canvas, e.clientX, e.clientY)
      if (!rawPoint) return
      const hit =
        measure.activeTool === "none"
          ? hitTestPieceAt(
              entitiesRef.current,
              rawPoint,
              view.viewRef.current.scale,
            )
          : null
      if (
        hit !== null &&
        onSelectPiece &&
        !selectedPieceIndices.includes(hit)
      ) {
        onSelectPiece(hit, false)
      }
      setCtxMenu({ x: e.clientX, y: e.clientY, pieceIndex: hit })
    }

    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointermove", onCanvasHoverMove)
    canvas.addEventListener("pointerleave", onCanvasHoverLeave)
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
    canvas.addEventListener("wheel", onWheel, { passive: false })
    canvas.addEventListener("contextmenu", onContextMenu)

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointermove", onCanvasHoverMove)
      canvas.removeEventListener("pointerleave", onCanvasHoverLeave)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      canvas.removeEventListener("wheel", onWheel)
      canvas.removeEventListener("contextmenu", onContextMenu)
    }
  }, [
    canvasRef,
    entitiesRef,
    draggingRef,
    pieceDragRef,
    measurementDragRef,
    lockedPieceIndicesRef,
    spaceHeldRef,
    pointersRef,
    pinchRef,
    boxSelectRef,
    zoomWindowRef,
    rotateDragRef,
    collisionIndexRef,
    snapGuidesRef,
    cursorCssRef,
    coordsLabelRef,
    view,
    measure,
    sim,
    scheduleDraw,
    canvasTool,
    setCanvasTool,
    setCtxMenu,
    setBoxSelectScreen,
    setRotatePivotScreen,
    setRotatePreviewDelta,
    setSnapCandidate,
    setSmartSpans,
    setAreaHoverContour,
    pieces,
    sheetSize,
    selectedPieceIndices,
    snapEnabled,
    transformMode,
    isCompact,
    onSelectPiece,
    onMovePieces,
    onRotateAroundPivot,
  ])
}