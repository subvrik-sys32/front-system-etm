"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import {
  Upload,
  FileCode2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  List,
} from "lucide-react"

import {
  ProductionEngine,
  ProductionDocument,
  ProductionGeometry,
  ProductionPiece,
} from "@/production-engine/production-engine"

const DEFAULT_CLUSTER_GAP = 1.5

// ---------------------------------------------------------------------------
// Geometría del visor
// ---------------------------------------------------------------------------

type ViewBox = { x: number; y: number; w: number; h: number }
type Bounds = { minX: number; minY: number; maxX: number; maxY: number }

const NICE_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000]
const LAYER_PALETTE = ["#FF5B2E", "#5EEAD4", "#FBBF24", "#818CF8", "#F472B6", "#34D399"]

function niceStep(raw: number) {
  for (const s of NICE_STEPS) if (s >= raw) return s
  return NICE_STEPS[NICE_STEPS.length - 1]
}

function layerColor(layer: string | undefined, index: number) {
  if (!layer) return LAYER_PALETTE[index % LAYER_PALETTE.length]
  let hash = 0
  for (let i = 0; i < layer.length; i++) hash = (hash * 31 + layer.charCodeAt(i)) >>> 0
  return LAYER_PALETTE[hash % LAYER_PALETTE.length]
}

// Puntos en convención Y-arriba (como CAD), invertimos la Y del motor (Y-abajo en SVG)
function flippedBounds(geometries: ProductionGeometry[]): Bounds {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const g of geometries) {
    for (const p of g.points) {
      const fx = p.x, fy = -p.y
      if (fx < minX) minX = fx
      if (fx > maxX) maxX = fx
      if (fy < minY) minY = fy
      if (fy > maxY) maxY = fy
    }
  }
  if (!isFinite(minX)) return { minX: 0, minY: 0, maxX: 100, maxY: 100 }
  return { minX, minY, maxX, maxY }
}

function fitViewBox(bounds: Bounds, containerW: number, containerH: number): ViewBox {
  const rawW = Math.max(bounds.maxX - bounds.minX, 1e-6) * 1.2
  const rawH = Math.max(bounds.maxY - bounds.minY, 1e-6) * 1.2
  const cAspect = containerW / containerH || 1
  const bAspect = rawW / rawH
  let w: number, h: number
  if (bAspect > cAspect) {
    w = rawW
    h = rawW / cAspect
  } else {
    h = rawH
    w = rawH * cAspect
  }
  const cx = (bounds.minX + bounds.maxX) / 2
  const cy = (bounds.minY + bounds.maxY) / 2
  return { x: cx - w / 2, y: cy - h / 2, w, h }
}

function geometryPath(g: ProductionGeometry) {
  if (g.points.length === 0) return ""
  let d = `M ${g.points[0].x} ${-g.points[0].y}`
  for (let i = 1; i < g.points.length; i++) d += ` L ${g.points[i].x} ${-g.points[i].y}`
  if (g.closed) d += " Z"
  return d
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function ProductionPage() {
  const [summary, setSummary] = useState<any>(null)
  const [doc, setDoc] = useState<ProductionDocument | null>(null)
  const [pieces, setPieces] = useState<ProductionPiece[]>([])
  const [fileName, setFileName] = useState("")
  const [dragging, setDragging] = useState(false)
  const [showPieces, setShowPieces] = useState(true)
  const [showStats, setShowStats] = useState(false)
  const [clusterGap, setClusterGap] = useState(DEFAULT_CLUSTER_GAP)

  const [viewBox, setViewBox] = useState<ViewBox>({ x: 0, y: 0, w: 100, h: 100 })
  const [containerSize, setContainerSize] = useState({ w: 800, h: 560 })
  const [cursorWorld, setCursorWorld] = useState<{ x: number; y: number } | null>(null)
  const [isPanning, setIsPanning] = useState(false)

  const viewportRef = useRef<HTMLDivElement>(null)
  const lastPos = useRef({ x: 0, y: 0 })
  const boundsRef = useRef<Bounds>({ minX: 0, minY: 0, maxX: 100, maxY: 100 })
  const engineRef = useRef<ProductionEngine | null>(null)

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const box = entries[0].contentRect
      setContainerSize({ w: box.width, h: box.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const fitToExtents = useCallback(() => {
    const vb = fitViewBox(boundsRef.current, containerSize.w || 800, containerSize.h || 560)
    setViewBox(vb)
  }, [containerSize])

  async function loadFile(file: File) {
    const text = await file.text()
    const engine = new ProductionEngine()
    await engine.load(text)
    engineRef.current = engine

    const bounds = flippedBounds(engine.geometries)
    boundsRef.current = bounds

    setFileName(file.name)
    setSummary(engine.summary())
    setDoc(engine.document)
    setPieces(engine.pieces(clusterGap))
    setViewBox(fitViewBox(bounds, viewportRef.current?.clientWidth || 800, viewportRef.current?.clientHeight || 560))
    setShowPieces(true)
  }

  // Si se ajusta la tolerancia de agrupamiento, se recalculan las piezas
  // sobre la misma geometría ya cargada, sin volver a leer el archivo.
  useEffect(() => {
    if (engineRef.current) setPieces(engineRef.current.pieces(clusterGap))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterGap])

  const pxPerUnit = containerSize.w / (viewBox.w || 1)
  const rawStep = 90 / (pxPerUnit || 1)
  const step = niceStep(rawStep)
  const stepPx = step * pxPerUnit

  const screenToWorld = useCallback(
    (px: number, py: number) => ({
      x: viewBox.x + (px / containerSize.w) * viewBox.w,
      y: -(viewBox.y + (py / containerSize.h) * viewBox.h),
    }),
    [viewBox, containerSize]
  )

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    if (!viewportRef.current) return
    const rect = viewportRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const factor = e.deltaY > 0 ? 1.12 : 1 / 1.12

    const worldX = viewBox.x + (mx / containerSize.w) * viewBox.w
    const worldY = viewBox.y + (my / containerSize.h) * viewBox.h
    const newW = Math.min(Math.max(viewBox.w * factor, 1e-3), 1e9)
    const newH = Math.min(Math.max(viewBox.h * factor, 1e-3), 1e9)

    setViewBox({
      w: newW,
      h: newH,
      x: worldX - (mx / containerSize.w) * newW,
      y: worldY - (my / containerSize.h) * newH,
    })
  }

  function zoomBy(factor: number) {
    const cx = viewBox.x + viewBox.w / 2
    const cy = viewBox.y + viewBox.h / 2
    const newW = viewBox.w * factor
    const newH = viewBox.h * factor
    setViewBox({ w: newW, h: newH, x: cx - newW / 2, y: cy - newH / 2 })
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!viewportRef.current) return
    const rect = viewportRef.current.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    setCursorWorld(screenToWorld(px, py))

    if (isPanning) {
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      const worldDx = (dx / containerSize.w) * viewBox.w
      const worldDy = (dy / containerSize.h) * viewBox.h
      setViewBox((v) => ({ ...v, x: v.x - worldDx, y: v.y - worldDy }))
      lastPos.current = { x: e.clientX, y: e.clientY }
    }
  }

  const scaleLabel = pxPerUnit >= 1 ? `${pxPerUnit.toFixed(2)}px/mm` : `1:${(1 / pxPerUnit).toFixed(1)}`

  // Ticks de regla
  const xTicks = useMemo(() => {
    if (!step || step <= 0) return []
    const ticks: { world: number; screen: number }[] = []
    const start = Math.ceil(viewBox.x / step) * step
    for (let v = start; v <= viewBox.x + viewBox.w; v += step) {
      ticks.push({ world: v, screen: ((v - viewBox.x) / viewBox.w) * containerSize.w })
    }
    return ticks
  }, [viewBox, step, containerSize.w])

  const yTicks = useMemo(() => {
    if (!step || step <= 0) return []
    const ticks: { world: number; screen: number }[] = []
    const start = Math.ceil(viewBox.y / step) * step
    for (let v = start; v <= viewBox.y + viewBox.h; v += step) {
      ticks.push({ world: v, screen: ((v - viewBox.y) / viewBox.h) * containerSize.h })
    }
    return ticks
  }, [viewBox, step, containerSize.h])

  const layers = useMemo(() => {
    if (!doc) return []
    const seen = new Map<string, string>()
    doc.geometries.forEach((g, i) => {
      const name = g.layer || "0"
      if (!seen.has(name)) seen.set(name, layerColor(name, seen.size))
    })
    return Array.from(seen.entries())
  }, [doc])

  const stats = summary
    ? [
        { label: "Tipo", value: summary.type },
        { label: "Geometrías", value: summary.geometries },
        { label: "Puntos", value: summary.points },
        { label: "Ancho", value: `${summary.width.toFixed(2)} mm` },
        { label: "Alto", value: `${summary.height.toFixed(2)} mm` },
        { label: "Área", value: `${summary.area.toFixed(2)} mm²` },
        { label: "Perímetro", value: `${summary.perimeter.toFixed(2)} mm` },
      ]
    : []

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#0A0B0D] px-6 py-5 text-[#EDEDEF] sm:px-10 sm:py-6">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden">
        {/* Encabezado, compacto */}
        <header className="mb-4 flex shrink-0 items-center justify-between">
          <div className="flex items-baseline gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FF5B2E]">
              CAM · NESTING ENGINE
            </p>
            <h1 className="text-lg font-semibold tracking-tight text-white">Production</h1>
          </div>
        </header>

        {/* Dropzone inicial: ocupa el protagonismo solo hasta que hay archivo */}
        {!fileName && (
          <label
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={async (e) => {
              e.preventDefault()
              setDragging(false)
              const file = e.dataTransfer.files?.[0]
              if (file) loadFile(file)
            }}
            className={`relative flex flex-1 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border transition-all ${
              dragging
                ? "border-[#FF5B2E]/60 bg-[#FF5B2E]/[0.04]"
                : "border-dashed border-white/[0.1] bg-white/[0.015]"
            }`}
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          >
            <Upload size={32} className="text-[#4B5157]" />
            <h2 className="mt-4 text-sm font-medium text-white">Arrastra un NSP o DXF</h2>
            <p className="mt-1 font-mono text-[11px] text-[#868D96]">o haz click para seleccionarlo</p>
            <input
              hidden
              type="file"
              accept=".nsp,.dxf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) loadFile(file)
              }}
            />
          </label>
        )}

        {/* Visor CAD: el elemento protagonista, con archivo, capas y stats integrados en su propia cabecera */}
        {fileName && (
          <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-[#0D0F11]">
            {/* Barra superior: archivo · capas · escala */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-2.5">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileCode2 size={14} className="shrink-0 text-[#FF5B2E]" />
                <span className="truncate text-sm text-white">{fileName}</span>
                <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[#868D96] transition hover:border-white/20 hover:text-white">
                  <RefreshCw size={11} />
                  Reemplazar
                  <input
                    hidden
                    type="file"
                    accept=".nsp,.dxf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) loadFile(file)
                    }}
                  />
                </label>
              </div>

              <div className="flex items-center gap-3">
                {layers.length > 0 && (
                  <div className="flex items-center gap-2.5 font-mono text-[10px] text-[#868D96]">
                    {layers.map(([name, color]) => (
                      <span key={name} className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                        {name}
                      </span>
                    ))}
                  </div>
                )}
                <span className="font-mono text-[10px] text-[#868D96]">{scaleLabel}</span>
                <button
                  onClick={() => setShowStats((v) => !v)}
                  className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[#868D96] transition hover:border-white/20 hover:text-white"
                >
                  Datos
                  {showStats ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
              </div>
            </div>

            {/* Franja de instrumentos, colapsable, no compite con el lienzo */}
            {showStats && summary && (
              <div className="flex shrink-0 flex-wrap divide-x divide-white/[0.07] overflow-hidden border-b border-white/[0.07] bg-white/[0.015]">
                {stats.map((s) => (
                  <div key={s.label} className="min-w-[7rem] flex-1 px-4 py-2">
                    <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#868D96]">
                      {s.label}
                    </div>
                    <div className="mt-0.5 truncate font-mono text-[13px] tabular-nums text-white">
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Lienzo, ahora ocupa todo el espacio disponible */}
            <div className="relative flex-1">
              {/* Regla horizontal */}
              <div className="pointer-events-none absolute left-6 right-0 top-0 z-10 h-6 border-b border-white/[0.08] bg-[#0A0B0D]/80">
                {doc &&
                  xTicks.map((t) => (
                    <div key={t.world} className="absolute top-0 h-full" style={{ left: t.screen }}>
                      <div className="h-2 w-px bg-white/20" />
                      <span className="absolute left-1 top-0.5 font-mono text-[9px] text-[#868D96]">
                        {t.world.toFixed(step < 1 ? 1 : 0)}
                      </span>
                    </div>
                  ))}
              </div>
              {/* Regla vertical */}
              <div className="pointer-events-none absolute bottom-0 left-0 top-6 z-10 w-6 border-r border-white/[0.08] bg-[#0A0B0D]/80">
                {doc &&
                  yTicks.map((t) => (
                    <div key={t.world} className="absolute left-0 w-full" style={{ top: t.screen }}>
                      <div className="h-px w-2 bg-white/20" />
                    </div>
                  ))}
              </div>

              {/* Lienzo */}
              <div
                ref={viewportRef}
                className="absolute bottom-0 right-0 top-6 z-0 cursor-grab overflow-hidden active:cursor-grabbing"
                style={{
                  left: 24,
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
                  backgroundSize: `${stepPx}px ${stepPx}px`,
                }}
                onWheel={handleWheel}
                onMouseDown={(e) => {
                  setIsPanning(true)
                  lastPos.current = { x: e.clientX, y: e.clientY }
                }}
                onMouseUp={() => setIsPanning(false)}
                onMouseLeave={() => {
                  setIsPanning(false)
                  setCursorWorld(null)
                }}
                onMouseMove={handleMouseMove}
              >
                {doc && doc.geometries.length > 0 ? (
                  <svg
                    width="100%"
                    height="100%"
                    viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
                    preserveAspectRatio="none"
                  >
                    {doc.geometries.map((g, i) => (
                      <path
                        key={g.id}
                        d={geometryPath(g)}
                        fill="none"
                        stroke={layerColor(g.layer, i)}
                        strokeWidth={Math.max(viewBox.w / containerSize.w, 0.001) * 1.4}
                        strokeLinejoin="round"
                      />
                    ))}
                  </svg>
                ) : (
                  <div className="flex h-full items-center justify-center font-mono text-xs text-[#4B5157]">
                    Importa un NSP o DXF para ver la geometría
                  </div>
                )}

                {/* Controles de zoom */}
                <div className="absolute bottom-3 left-3 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      zoomBy(1 / 1.3)
                    }}
                    className="rounded-md border border-white/10 bg-[#14171A] p-1.5 text-[#868D96] transition hover:text-white"
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      zoomBy(1.3)
                    }}
                    className="rounded-md border border-white/10 bg-[#14171A] p-1.5 text-[#868D96] transition hover:text-white"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      fitToExtents()
                    }}
                    className="rounded-md border border-white/10 bg-[#14171A] p-1.5 text-[#868D96] transition hover:text-white"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>

                {/* Lectura de cursor */}
                {cursorWorld && (
                  <div className="absolute bottom-3 right-3 rounded-md border border-white/10 bg-[#14171A]/90 px-2.5 py-1.5 font-mono text-[10px] tabular-nums text-[#868D96]">
                    X {cursorWorld.x.toFixed(2)} &nbsp; Y {cursorWorld.y.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabla de piezas: nombre/capa, dimensiones, superficie, perímetro */}
        {doc && pieces.length > 0 && (
          <div className="mt-3 flex max-h-64 shrink-0 flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.015]">
            <div className="flex w-full shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-2">
              <button
                onClick={() => setShowPieces((v) => !v)}
                className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-[#868D96] transition hover:text-white"
              >
                <List size={12} />
                Piezas ({pieces.length})
                {showPieces ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showPieces && (
                <label className="flex items-center gap-2 font-mono text-[10px] text-[#868D96]">
                  Tolerancia de agrupado
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={clusterGap}
                    onChange={(e) => setClusterGap(Number(e.target.value))}
                    className="w-24 accent-[#FF5B2E]"
                  />
                  <span className="tabular-nums text-white">{clusterGap.toFixed(1)} mm</span>
                </label>
              )}
            </div>
            {showPieces && (
              <div className="overflow-auto border-t border-white/[0.07]">
                <table className="w-full border-collapse text-left">
                  <thead className="sticky top-0 bg-[#0D0F11]">
                    <tr className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#868D96]">
                      <th className="px-4 py-2 font-normal">#</th>
                      <th className="px-4 py-2 font-normal">Nombre / Capa</th>
                      <th className="px-4 py-2 font-normal">Dimensión</th>
                      <th className="px-4 py-2 font-normal">Superficie</th>
                      <th className="px-4 py-2 font-normal">Perímetro</th>
                      <th className="px-4 py-2 font-normal">Entidades</th>
                      <th className="px-4 py-2 font-normal">Agujeros</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {pieces.map((p) => (
                      <tr key={p.index} className="font-mono text-[12px] text-white transition hover:bg-white/[0.02]">
                        <td className="px-4 py-2 tabular-nums text-[#868D96]">{p.index}</td>
                        <td className="max-w-[220px] truncate px-4 py-2">{p.name}</td>
                        <td className="whitespace-nowrap px-4 py-2 tabular-nums">
                          {p.width.toFixed(1)} × {p.height.toFixed(1)} mm
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 tabular-nums">
                          {p.area > 0 ? `${p.area.toFixed(0)} mm²` : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 tabular-nums">{p.perimeter.toFixed(1)} mm</td>
                        <td className="px-4 py-2 tabular-nums text-[#868D96]">{p.entityCount}</td>
                        <td className="px-4 py-2 tabular-nums text-[#868D96]">{p.holeCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}