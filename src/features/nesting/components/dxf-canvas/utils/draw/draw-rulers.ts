import type { Point, ViewState } from "../../types/types"

export const RULER_SIZE = 22
const CORNER_RADIUS = 12

function theme() {
  const dark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
  return dark
    ? { bg: "#1a1a1a", border: "#333333", tick: "#737373", text: "#a3a3a3" }
    : { bg: "#f4f4f5", border: "#d4d4d4", tick: "#a3a3a3", text: "#737373" }
}

function niceStep(scale: number): number {
  const target = 80 / Math.max(scale, 1e-9)
  const pow = Math.pow(10, Math.floor(Math.log10(Math.max(target, 1e-9))))
  for (const m of [1, 2, 5, 10]) {
    if (m * pow >= target) return m * pow
  }
  return 10 * pow
}

function fmt(n: number): string {
  const v = Math.abs(n) < 1e-9 ? 0 : n
  if (Math.abs(v) >= 100) return `${Math.round(v)}`
  return `${parseFloat(v.toFixed(1))}`
}

function screenToLocal(
  sx: number,
  sy: number,
  canvasW: number,
  canvasH: number,
  view: ViewState,
): Point {
  const { scale, offsetX, offsetY, rotationDeg = 0 } = view
  let lx = sx - canvasW / 2 - offsetX
  let ly = sy - canvasH / 2 - offsetY
  if (rotationDeg === 90) {
    const rx = lx
    const ry = ly
    lx = ry
    ly = -rx
  }
  const s = Math.max(scale, 1e-9)
  return { x: lx / s, y: ly / s }
}

export function drawNestingRulers(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  view: ViewState,
  localToScreen: (p: Point) => Point,
  cursorCss: Point | null,
) {
  const { bg, border, tick, text } = theme()
  const scale = Math.max(view.scale, 1e-9)
  const step = niceStep(scale)
  const minor = step / 5

  const corners = [
    screenToLocal(RULER_SIZE, RULER_SIZE, canvasW, canvasH, view),
    screenToLocal(canvasW, RULER_SIZE, canvasW, canvasH, view),
    screenToLocal(RULER_SIZE, canvasH, canvasW, canvasH, view),
    screenToLocal(canvasW, canvasH, canvasW, canvasH, view),
  ]
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const p of corners) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }

  ctx.save()
  ctx.fillStyle = bg
  ctx.fillRect(CORNER_RADIUS, 0, canvasW - CORNER_RADIUS, RULER_SIZE)
  ctx.fillRect(0, CORNER_RADIUS, RULER_SIZE, canvasH - CORNER_RADIUS)
  ctx.beginPath()
  ctx.moveTo(0, RULER_SIZE)
  ctx.lineTo(0, CORNER_RADIUS)
  ctx.quadraticCurveTo(0, 0, CORNER_RADIUS, 0)
  ctx.lineTo(RULER_SIZE, 0)
  ctx.lineTo(RULER_SIZE, RULER_SIZE)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(RULER_SIZE + 0.5, RULER_SIZE + 0.5)
  ctx.lineTo(canvasW, RULER_SIZE + 0.5)
  ctx.moveTo(RULER_SIZE + 0.5, RULER_SIZE + 0.5)
  ctx.lineTo(RULER_SIZE + 0.5, canvasH)
  ctx.stroke()

  ctx.font = "9px ui-sans-serif, system-ui, sans-serif"
  const x0 = Math.floor(minX / minor) * minor
  for (let wx = x0; wx <= maxX + minor; wx += minor) {
    const sx = localToScreen({ x: wx, y: minY }).x
    if (sx < RULER_SIZE || sx > canvasW) continue
    const isMajor = Math.abs(wx / step - Math.round(wx / step)) < 1e-4
    ctx.strokeStyle = tick
    ctx.beginPath()
    ctx.moveTo(sx + 0.5, RULER_SIZE)
    ctx.lineTo(sx + 0.5, RULER_SIZE - (isMajor ? 8 : 4))
    ctx.stroke()
    if (isMajor) {
      ctx.fillStyle = text
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText(fmt(wx), sx, 3)
    }
  }
  const y0 = Math.floor(minY / minor) * minor
  for (let wy = y0; wy <= maxY + minor; wy += minor) {
    const sy = localToScreen({ x: minX, y: wy }).y
    if (sy < RULER_SIZE || sy > canvasH) continue
    const isMajor = Math.abs(wy / step - Math.round(wy / step)) < 1e-4
    ctx.strokeStyle = tick
    ctx.beginPath()
    ctx.moveTo(RULER_SIZE, sy + 0.5)
    ctx.lineTo(RULER_SIZE - (isMajor ? 8 : 4), sy + 0.5)
    ctx.stroke()
    if (isMajor) {
      ctx.save()
      ctx.translate(10, sy)
      ctx.rotate(-Math.PI / 2)
      ctx.fillStyle = text
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(fmt(wy), 0, 0)
      ctx.restore()
    }
  }
  if (cursorCss) {
    const { x: cx, y: cy } = cursorCss
    ctx.fillStyle = "#3b82f6"
    if (cx >= RULER_SIZE && cx <= canvasW) {
      ctx.beginPath()
      ctx.moveTo(cx - 4, RULER_SIZE)
      ctx.lineTo(cx + 4, RULER_SIZE)
      ctx.lineTo(cx, RULER_SIZE - 6)
      ctx.closePath()
      ctx.fill()
    }
    if (cy >= RULER_SIZE && cy <= canvasH) {
      ctx.beginPath()
      ctx.moveTo(RULER_SIZE, cy - 4)
      ctx.lineTo(RULER_SIZE, cy + 4)
      ctx.lineTo(RULER_SIZE - 6, cy)
      ctx.closePath()
      ctx.fill()
    }
  }
  ctx.restore()
}
