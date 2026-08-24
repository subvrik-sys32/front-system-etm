"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AlertTriangle } from "lucide-react"
import type { CanvasTool, DxfCanvasProps, Entity, Point, SnapCandidate } from "./types/types"

import { CanvasToolbar } from "./components/canvas-toolbar"
import { CanvasContextMenu } from "./components/canvas-context-menu"
import { CanvasStatusBar } from "./components/canvas-status-bar"
import { CanvasCoords } from "./components/canvas-coords"
import { CanvasMeasurePanel } from "./components/canvas-measure-panel"
import { drawScene } from "./utils/draw/draw"
import { drawNestingRulers, RULER_SIZE } from "./utils/draw/draw-rulers"
import { buildToolpath, computeLayerList, piecesToEntities } from "./utils/entities"
import {
  buildCollisionIndex,
  type CollisionIndex,
  type SnapGuide,
} from "./utils/collision"
import { useCanvasView } from "./hooks/use-canvas-view"
import { useMeasurements, measurementsFromBBox } from "./hooks/use-measurements"
import { useSimulation } from "./hooks/use-simulation"
import { useCanvasKeyboard } from "./hooks/use-canvas-keyboard"
import { useCanvasPointers } from "./hooks/use-canvas-pointers"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"

export type { NestingPieceInput, LayerInfo, DxfCanvasProps } from "./types/types"
export { computeLayerList } from "./utils/entities"

type PieceDragState = {
  pieceIndices: number[]
  startLocal: Point
  offset: Point
  axisLock: "x" | "y" | null
}

export function DxfCanvas({
  pieces,
  sheetSize,
  selectedPieceIndices = [],
  onSelectPiece,
  hiddenKeys,
  collidingPieceIndices = [],
  lockedPieceIndices = [],
  onMovePieces,
  onRotateSelected,
  onRotateAroundPivot,
  onDeleteSelected,
  transformMode = "free",
  onTransformModeChange,
  rotationStep = 90,
  sheetKey,
  className,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: DxfCanvasProps) {
  const { isCompact, isMobile } = useResponsive()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const entitiesRef = useRef<Entity[]>([])
  const drawRafRef = useRef<number | null>(null)
  const cursorCssRef = useRef<{ x: number; y: number } | null>(null)
  const coordsLabelRef = useRef<HTMLSpanElement | null>(null)

  const draggingRef = useRef<{
    startX: number
    startY: number
    startOffsetX: number
    startOffsetY: number
    moved: boolean
  } | null>(null)
  const pieceDragRef = useRef<PieceDragState | null>(null)
  const measurementDragRef = useRef<{ id: string; a: Point; b: Point } | null>(null)
  const lockedPieceIndicesRef = useRef(lockedPieceIndices)
  lockedPieceIndicesRef.current = lockedPieceIndices
  const spaceHeldRef = useRef(false)
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const pinchRef = useRef<{
    startDist: number
    startScale: number
    startOffsetX: number
    startOffsetY: number
    midX: number
    midY: number
  } | null>(null)

  const [canvasTool, setCanvasTool] = useState<CanvasTool>("select")
  const [toolsChromeOpen, setToolsChromeOpen] = useState(false)
  const [ctxMenu, setCtxMenu] = useState<{
    x: number
    y: number
    pieceIndex: number | null
  } | null>(null)

  const boxSelectRef = useRef<{
    startScreen: { x: number; y: number }
    curScreen: { x: number; y: number }
    startLocal: { x: number; y: number }
    curLocal: { x: number; y: number }
  } | null>(null)
  const [boxSelectScreen, setBoxSelectScreen] = useState<{
    x0: number
    y0: number
    x1: number
    y1: number
  } | null>(null)
  const zoomWindowRef = useRef<typeof boxSelectRef.current>(null)
  const rotateDragRef = useRef<{
    pivot: { x: number; y: number }
    startAngle: number
    currentDelta: number
    pieceIndices: number[]
  } | null>(null)
  const [rotatePivotScreen, setRotatePivotScreen] = useState<{
    x: number
    y: number
  } | null>(null)
  const [rotatePreviewDelta, setRotatePreviewDelta] = useState(0)
  const collisionIndexRef = useRef<CollisionIndex | null>(null)
  const snapGuidesRef = useRef<SnapGuide[]>([])

  const [showGrid, setShowGrid] = useState(true)
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [gridStyle, setGridStyle] = useState<"dots" | "lines" | "cross" | "none">("lines")
  const [snapCandidate, setSnapCandidate] = useState<SnapCandidate | null>(null)
  const [smartSpans, setSmartSpans] = useState<{
    h: { a: Point; b: Point; value: number } | null
    v: { a: Point; b: Point; value: number } | null
    center: Point
  } | null>(null)
  const [areaHoverContour, setAreaHoverContour] = useState<Point[] | null>(null)

  const view = useCanvasView()
  const sim = useSimulation()
  const measure = useMeasurements()

  const sheetKeyRef = useRef(sheetKey)
  useEffect(() => {
    if (sheetKeyRef.current === sheetKey) return
    sheetKeyRef.current = sheetKey
    measure.resetMeasurementsOnly()
  }, [sheetKey, measure])

  const scheduleDraw = useCallback(() => {
    if (drawRafRef.current !== null) return
    drawRafRef.current = requestAnimationFrame(() => {
      drawRafRef.current = null
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w === 0 || h === 0) return

      const tw = Math.round(w * dpr)
      const th = Math.round(h * dpr)
      if (canvas.width !== tw || canvas.height !== th) {
        canvas.width = tw
        canvas.height = th
      }

      const drag = pieceDragRef.current
      const dragPreview =
        drag &&
        (Math.abs(drag.offset.x) > 1e-12 || Math.abs(drag.offset.y) > 1e-12)
          ? { indices: drag.pieceIndices, dx: drag.offset.x, dy: drag.offset.y }
          : null

      drawScene({
        ctx,
        view: view.viewRef.current,
        canvasWidth: w,
        canvasHeight: h,
        entities: entitiesRef.current,
        sheetSize,
        selectedPieceIndices,
        collidingPieceIndices,
        simProgress: sim.progressRef.current,
        toolpath: sim.segmentsRef.current,
        totalPathLength: sim.totalLengthRef.current,
        fullPath2D: sim.fullPath2DRef.current,
        measurements: measure.measurements,
        pendingPoints: measure.pendingPoints,
        hoverLocal: measure.hoverLocal,
        hoverScreen: measure.hoverScreen,
        snapCandidate,
        activeTool: measure.activeTool,
        localToScreen: (pt) => view.localToScreen(canvas, pt),
        dragPreview,
        snapGuides: snapGuidesRef.current,
        boxSelectScreen,
        showGrid,
        gridStyle,
        smartSpans,
        areaHoverContour,
      })

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawNestingRulers(
        ctx,
        w,
        h,
        view.viewRef.current,
        (pt) => view.localToScreen(canvas, pt),
        cursorCssRef.current,
      )
    })
  }, [
    view,
    sheetSize,
    selectedPieceIndices,
    collidingPieceIndices,
    sim,
    measure.measurements,
    measure.pendingPoints,
    measure.hoverLocal,
    measure.hoverScreen,
    measure.activeTool,
    snapCandidate,
    smartSpans,
    areaHoverContour,
    boxSelectScreen,
    showGrid,
    gridStyle,
  ])

  const setToolpath = sim.setToolpath
  useEffect(() => {
    collisionIndexRef.current = buildCollisionIndex(pieces)
    const entities = piecesToEntities(pieces, hiddenKeys)
    entitiesRef.current = entities
    const { segments, totalLength, fullPath } = buildToolpath(entities)
    setToolpath(segments, totalLength, fullPath)
    requestAnimationFrame(() => {
      if (!view.hasUserInteracted()) {
        view.fitToSheetOrEntities(canvasRef.current, entities, sheetSize, isCompact)
      }
      scheduleDraw()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pieces, sheetSize, hiddenKeys, view, setToolpath])

  useEffect(() => {
    scheduleDraw()
  }, [scheduleDraw, sim.progress])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let raf = 0
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const canvasEl = canvasRef.current
        if (!canvasEl) return
        if (!view.hasUserInteracted()) {
          view.fitToSheetOrEntities(
            canvasEl,
            entitiesRef.current,
            sheetSize,
            isCompact,
          )
        }
        scheduleDraw()
      })
    })
    observer.observe(container)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [scheduleDraw, view, sheetSize, isCompact])

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    if (!view.hasUserInteracted()) {
      view.fitToSheetOrEntities(
        canvasEl,
        entitiesRef.current,
        sheetSize,
        isCompact,
      )
    }
    scheduleDraw()
  }, [isCompact, sheetSize, view, scheduleDraw])

  useCanvasPointers({
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
  })

  useCanvasKeyboard({
    spaceHeldRef,
    selectedPieceIndices,
    rotationStep,
    onRotateSelected,
    onDeleteSelected,
    onSelectPiece,
    setCanvasTool,
    resetMeasureTool: measure.resetTool,
  })

  const handleZoom = useCallback(
    (direction: "in" | "out") => {
      sim.clearOverlayIfIdle()
      view.zoomBy(direction === "in" ? 1.25 : 0.8)
      scheduleDraw()
    },
    [view, sim, scheduleDraw],
  )

  const handleFit = useCallback(() => {
    view.allowAutoFit()
    view.fitToSheetOrEntities(
      canvasRef.current,
      entitiesRef.current,
      sheetSize,
      isCompact,
    )
    scheduleDraw()
  }, [view, sheetSize, isCompact, scheduleDraw])

  const handleFocus = useCallback(() => {
    view.allowAutoFit()
    if (selectedPieceIndices.length === 0) return
    const selectedSet = new Set(selectedPieceIndices)
    const selected = entitiesRef.current.filter(
      (e) => e.pieceIndex !== undefined && selectedSet.has(e.pieceIndex),
    )
    view.focusEntities(canvasRef.current, selected)
    scheduleDraw()
  }, [view, selectedPieceIndices, scheduleDraw])

  const handleAutoBboxDim = useCallback(() => {
    if (selectedPieceIndices.length === 0) return
    if (measure.measurements.some((m) => m.id.startsWith("bbox-"))) return

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity
    for (const i of selectedPieceIndices) {
      const piece = pieces[i]
      if (!piece) continue
      const pts =
        piece.outline && piece.outline.length
          ? piece.outline
          : (piece.subOutlines ?? []).flatMap((s) => s.points)
      for (const pt of pts) {
        minX = Math.min(minX, pt.x)
        minY = Math.min(minY, pt.y)
        maxX = Math.max(maxX, pt.x)
        maxY = Math.max(maxY, pt.y)
      }
    }
    if (!Number.isFinite(minX)) return
    measure.addMeasurements(
      measurementsFromBBox({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      }),
    )
    scheduleDraw()
  }, [selectedPieceIndices, pieces, measure, scheduleDraw])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full overflow-hidden rounded-xl border border-border bg-background",
        className,
      )}
      style={{ backgroundColor: "var(--background, #0a0a0c)" }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none select-none"
        style={{ cursor: "default" }}
      />

      <CanvasStatusBar
        isCompact={isCompact}
        selectedCount={selectedPieceIndices.length}
        collidingCount={collidingPieceIndices.length}
        rotationStep={rotationStep}
        canvasTool={canvasTool}
        onDeselect={() => onSelectPiece?.(null, false)}
        onDelete={
          onDeleteSelected
            ? () => onDeleteSelected(selectedPieceIndices)
            : undefined
        }
        onRotate={
          onRotateSelected
            ? (deg) => onRotateSelected(selectedPieceIndices, deg)
            : undefined
        }
        onFreeRotate={() => setCanvasTool("rotate")}
        canDelete={Boolean(onDeleteSelected) && selectedPieceIndices.length > 0}
        canRotate={Boolean(onRotateSelected) && selectedPieceIndices.length > 0}
      />


      <CanvasCoords labelRef={coordsLabelRef} />

      <CanvasContextMenu
        ctxMenu={ctxMenu}
        onClose={() => setCtxMenu(null)}
        selectedPieceIndices={selectedPieceIndices}
        rotationStep={rotationStep}
        transformMode={transformMode}
        onRotateSelected={onRotateSelected}
        onTransformModeChange={onTransformModeChange}
        onDeleteSelected={onDeleteSelected}
        onSelectPiece={onSelectPiece}
        onFit={handleFit}
        onFocusSelected={handleFocus}
        onSetCanvasTool={setCanvasTool}
      />

      <CanvasToolbar
        canvasTool={canvasTool}
        onCanvasToolChange={setCanvasTool}
        onOpenChange={setToolsChromeOpen}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((v) => !v)}
        onZoomIn={() => handleZoom("in")}
        onZoomOut={() => handleZoom("out")}
        onFit={handleFit}
        onFocusSelected={handleFocus}
        canFocusSelected={selectedPieceIndices.length > 0}
        onAutoBboxDim={handleAutoBboxDim}
        canAutoBboxDim={selectedPieceIndices.length > 0}
        activeTool={measure.activeTool}
        onToggleTool={measure.toggleTool}
        onResetTool={measure.resetTool}
        snapEnabled={snapEnabled}
        onToggleSnap={() => setSnapEnabled((v) => !v)}
        transformMode={transformMode}
        onTransformModeChange={onTransformModeChange}
        gridStyle={gridStyle}
        onGridStyleChange={setGridStyle}
        hasToolpath={sim.hasToolpath}
        simPanelOpen={sim.panelOpen}
        simRunning={sim.running}
        simProgress={sim.progress}
        simSpeed={sim.speed}
        onOpenSim={sim.openPanel}
        onCloseSim={sim.closePanel}
        onTogglePlay={sim.togglePlay}
        onResetSim={sim.reset}
        onSeek={sim.seek}
        onSpeedChange={sim.setSpeed}
        onDeleteSelected={
          onDeleteSelected && selectedPieceIndices.length > 0
            ? () => onDeleteSelected(selectedPieceIndices)
            : undefined
        }
        canDelete={selectedPieceIndices.length > 0}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {rotatePivotScreen && (
        <div
          className="pointer-events-none absolute z-20"
          style={{
            left: rotatePivotScreen.x,
            top: rotatePivotScreen.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="relative flex h-6 w-6 items-center justify-center">
            <div className="absolute h-px w-6 bg-primary" />
            <div className="absolute h-6 w-px bg-primary" />
            <div className="absolute h-2 w-2 rounded-full border border-primary/50 bg-primary/30" />
          </div>
          {Math.abs(rotatePreviewDelta) > 0.05 && (
            <div className="absolute left-4 top-4 whitespace-nowrap rounded bg-muted/90 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {rotatePreviewDelta > 0 ? "+" : ""}
              {rotatePreviewDelta.toFixed(1)}°
            </div>
          )}
        </div>
      )}

      {canvasTool === "zoomWindow" && !boxSelectScreen && (
        <div
          className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rounded-full bg-muted/90 px-3 py-1.5 text-[11px] text-muted-foreground shadow-xs"
          style={{ top: RULER_SIZE + 56 }}
        >
          Arrastra un rectángulo para hacer zoom (Anticlick para salir)
        </div>
      )}
      {canvasTool === "rotate" && !rotatePivotScreen && (
        <div
          className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rounded-full bg-muted/90 px-3 py-1.5 text-[11px] text-muted-foreground shadow-xs"
          style={{ top: RULER_SIZE + 56 }}
        >
          Clic = pivot · arrastrar = ángulo (Shift = 15°) (Anticlick para salir)
        </div>
      )}

      {measure.activeTool !== "none" && (
        <div
          className="absolute left-1/2 z-10 -translate-x-1/2 rounded-full bg-muted/90 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur-md transition-opacity duration-200"
          style={{ top: RULER_SIZE + 56 }}
        >
          {measure.activeTool === "distance" &&
            (measure.pendingPoints.length === 0
              ? "Cota: clic en el primer punto (snap a arista/extremo)"
              : measure.pendingPoints.length === 1
                ? "Cota: clic en el segundo punto"
                : "Cota: clic para colocar la línea de cota")}
          {measure.activeTool === "radius" && "Clic sobre un círculo o arco"}
          {measure.activeTool === "angle" &&
            (measure.pendingPoints.length === 0
              ? "Clic en el vértice"
              : measure.pendingPoints.length === 1
                ? "Clic en el primer punto"
                : "Clic en el segundo punto")}
          {measure.activeTool === "area" && "Clic dentro de un contorno cerrado"}
          {measure.activeTool === "coords" && "Mueve el mouse para ver X / Y"}
          {measure.activeTool === "smart" &&
            "Cota inteligente: acerca el puntero al centro o a una arista (sin clic)"}
          {" (Anticlick para salir)"}
        </div>
      )}

      {collidingPieceIndices.length > 0 && (
        <div
          className="absolute left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-400 backdrop-blur-md"
          style={{ top: RULER_SIZE + 56 }}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          {collidingPieceIndices.length === 1
            ? "1 pieza se solapa con otra"
            : `${collidingPieceIndices.length} piezas se solapan`}
        </div>
      )}

      <CanvasMeasurePanel
        measurements={measure.measurements}
        onClear={measure.clearMeasurements}
        onRemove={measure.removeMeasurement}
      />
    </div>
  )
}