import type { Point, ViewState } from "../../types/types"

export const RULER_SIZE = 22
const CORNER_RADIUS = 12
const MIN_LABEL_GAP_PX = 40

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

/**
 * Reglas fijas: superior = X, izquierda = Y.
 * sx = cw/2 + ox + x·s
 * sy = ch/2 + oy + y·s
 */
export function drawNestingRulers(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  view: ViewState,
  _localToScreen: (p: Point) => Point,
  cursorCss: Point | null,
) {
  if (canvasW < 2 || canvasH < 2) return

  const { bg, border, tick, text } = theme()
  const scale = Math.max(view.scale, 1e-9)
  const step = niceStep(scale)
  const minor = step / 5
  const { offsetX, offsetY } = view

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

  // Superior = X
  {
    const xAt = (sx: number) => (sx - canvasW / 2 - offsetX) / scale
    const xMin = Math.min(xAt(RULER_SIZE), xAt(canvasW))
    const xMax = Math.max(xAt(RULER_SIZE), xAt(canvasW))
    const start = Math.floor(xMin / minor) * minor
    let lastLabel = Number.NaN

    for (let x = start; x <= xMax + minor; x += minor) {
      const sx = canvasW / 2 + offsetX + x * scale
      if (sx < RULER_SIZE || sx > canvasW) continue
      const isMajor = Math.abs(x / step - Math.round(x / step)) < 1e-4
      ctx.strokeStyle = tick
      ctx.beginPath()
      ctx.moveTo(sx + 0.5, RULER_SIZE)
      ctx.lineTo(sx + 0.5, RULER_SIZE - (isMajor ? 8 : 4))
      ctx.stroke()
      if (
        isMajor &&
        (Number.isNaN(lastLabel) || Math.abs(sx - lastLabel) >= MIN_LABEL_GAP_PX)
      ) {
        ctx.fillStyle = text
        ctx.textAlign = "left"
        ctx.textBaseline = "top"
        ctx.fillText(fmt(x), sx + 2, 3)
        lastLabel = sx
      }
    }
  }

  // Izquierda = Y
  {
    const yAt = (sy: number) => (sy - canvasH / 2 - offsetY) / scale
    const yMin = Math.min(yAt(RULER_SIZE), yAt(canvasH))
    const yMax = Math.max(yAt(RULER_SIZE), yAt(canvasH))
    const start = Math.floor(yMin / minor) * minor
    let lastLabel = Number.NaN

    for (let y = start; y <= yMax + minor; y += minor) {
      const sy = canvasH / 2 + offsetY + y * scale
      if (sy < RULER_SIZE || sy > canvasH) continue
      const isMajor = Math.abs(y / step - Math.round(y / step)) < 1e-4
      ctx.strokeStyle = tick
      ctx.beginPath()
      ctx.moveTo(RULER_SIZE, sy + 0.5)
      ctx.lineTo(RULER_SIZE - (isMajor ? 8 : 4), sy + 0.5)
      ctx.stroke()
      if (
        isMajor &&
        (Number.isNaN(lastLabel) || Math.abs(sy - lastLabel) >= MIN_LABEL_GAP_PX)
      ) {
        ctx.save()
        ctx.translate(9, sy + 2)
        ctx.rotate(-Math.PI / 2)
        ctx.fillStyle = text
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"
        ctx.fillText(fmt(y), 0, 0)
        ctx.restore()
        lastLabel = sy
      }
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

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, RULER_SIZE, RULER_SIZE)
  ctx.strokeStyle = border
  ctx.strokeRect(0.5, 0.5, RULER_SIZE - 1, RULER_SIZE - 1)

  ctx.restore()
}