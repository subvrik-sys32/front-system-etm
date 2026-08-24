import type { ViewState } from "../../types/types"

/** Paso de cuadrícula en mm que se ve ~24–48 px en pantalla. */
function niceGridStep(scale: number): number {
  const targetPx = 32
  const raw = targetPx / Math.max(scale, 1e-9)
  const exp = Math.floor(Math.log10(raw))
  const base = Math.pow(10, exp)
  const frac = raw / base
  let mult = 1
  if (frac > 5) mult = 10
  else if (frac > 2) mult = 5
  else if (frac > 1) mult = 2
  return mult * base
}

function gridTheme() {
  const dark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
  // Estilo CAD AI: líneas suaves en light; equivalentes en dark
  return dark
    ? { minor: "#2a2a2e", major: "#3f3f46", dot: "#52525b" }
    : { minor: "#e8e8e8", major: "#cccccc", dot: "#a3a3a3" }
}

/**
 * Dibuja la cuadrícula en coords mundo (caller ya aplicó translate/rotate/scale).
 * Default visual = líneas tipo CAD AI; dots/cross con contraste light/dark.
 */
export function drawWorldGrid(
  ctx: CanvasRenderingContext2D,
  view: ViewState,
  canvasW: number,
  canvasH: number,
  scale: number,
  style: "dots" | "lines" | "cross",
) {
  const { offsetX, offsetY, rotationDeg = 0 } = view
  const inv = 1 / Math.max(scale, 1e-12)
  const theme = gridTheme()

  const corners: { x: number; y: number }[] = []
  for (const [sx, sy] of [
    [0, 0],
    [canvasW, 0],
    [0, canvasH],
    [canvasW, canvasH],
  ] as const) {
    let cx = sx - canvasW / 2 - offsetX
    let cy = sy - canvasH / 2 - offsetY
    if (rotationDeg === 90) {
      const ix = cy
      const iy = -cx
      cx = ix
      cy = iy
    }
    corners.push({ x: cx * inv, y: cy * inv })
  }

  let worldLeft = corners[0].x
  let worldRight = corners[0].x
  let worldTop = corners[0].y
  let worldBottom = corners[0].y
  for (const c of corners) {
    if (c.x < worldLeft) worldLeft = c.x
    if (c.x > worldRight) worldRight = c.x
    if (c.y < worldTop) worldTop = c.y
    if (c.y > worldBottom) worldBottom = c.y
  }

  const MAX_CELLS = 80
  let step = niceGridStep(scale)
  const spanX = Math.max(1e-6, worldRight - worldLeft)
  const spanY = Math.max(1e-6, worldBottom - worldTop)
  if (spanX / step > MAX_CELLS) step = spanX / MAX_CELLS
  if (spanY / step > MAX_CELLS) step = Math.max(step, spanY / MAX_CELLS)

  const pad = step
  const x0 = Math.floor((worldLeft - pad) / step) * step
  const y0 = Math.floor((worldTop - pad) / step) * step
  const x1 = worldRight + pad
  const y1 = worldBottom + pad
  const majorEvery = 5

  ctx.save()
  ctx.lineCap = "butt"

  if (style === "lines" || style === "cross") {
    for (let x = x0; x <= x1; x += step) {
      const major = Math.abs(Math.round(x / step)) % majorEvery === 0
      ctx.strokeStyle = major ? theme.major : theme.minor
      ctx.lineWidth = (major ? 1 : 0.5) / scale
      ctx.beginPath()
      ctx.moveTo(x, y0)
      ctx.lineTo(x, y1)
      ctx.stroke()
    }
    for (let y = y0; y <= y1; y += step) {
      const major = Math.abs(Math.round(y / step)) % majorEvery === 0
      ctx.strokeStyle = major ? theme.major : theme.minor
      ctx.lineWidth = (major ? 1 : 0.5) / scale
      ctx.beginPath()
      ctx.moveTo(x0, y)
      ctx.lineTo(x1, y)
      ctx.stroke()
    }
  }

  if (style === "dots" || style === "cross") {
    const r = 1.1 / scale
    const d = r * 2
    ctx.fillStyle = theme.dot
    for (let x = x0; x <= x1; x += step) {
      for (let y = y0; y <= y1; y += step) {
        ctx.fillRect(x - r, y - r, d, d)
      }
    }
  }

  ctx.restore()
}