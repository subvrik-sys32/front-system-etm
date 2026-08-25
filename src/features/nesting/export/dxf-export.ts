import { mapColorToCypCutLayer, resolveLayerName } from "./color-layer-map"
import { applyCutBridges } from "../engine/geometry"
import type { NestedSheet, Point2D, PieceOutline, SheetConfig } from "../engine/types"

const CLOSE_TOLERANCE = 1e-4

/** Parámetros de micro-uniones (puentes) para el corte. Si `enabled` es false o `count` es 0, cada contorno se exporta cerrado y continuo, igual que antes. */
export interface BridgeSettings {
  enabled: boolean
  count: number
  widthMm: number
}

const NO_BRIDGES: BridgeSettings = { enabled: false, count: 0, widthMm: 0 }

/**
 * Si los puentes están activos, parte el contorno cerrado en N tramos
 * abiertos con huecos chicos entre ellos (ver applyCutBridges). Si no,
 * devuelve el contorno tal cual, como único elemento — mismo camino
 * que el comportamiento anterior a esta función.
 */
function splitForBridges(outline: PieceOutline, bridges: BridgeSettings): PieceOutline[] {
  if (!bridges.enabled || bridges.count <= 0) return [outline]
  return applyCutBridges(outline, bridges.count, bridges.widthMm)
}

/**
 * Escribe una POLYLINE R12 (grupo 0 POLYLINE + VERTEX... + SEQEND),
 * puerto de escribirPolylineR12. Detecta cierre automáticamente
 * (primer punto == último punto) para marcar el flag 70=1 y no
 * duplicar el vértice de cierre, igual que el original.
 *
 * NOTA IMPORTANTE (simplificación consciente frente al original): el
 * original reconstruye el "bulge" (curvatura) de cada segmento a
 * partir de las curvas Bézier reales de Qt (extractBulgePaths), así
 * que sus arcos salen como arcos DXF nativos (compactos). Mi pipeline
 * de import ya tesela arcos/círculos a polilíneas de puntos (64
 * segmentos por círculo completo — ver geometry-sampling.ts) y no
 * conserva el arco paramétrico original, así que exporto siempre con
 * bulge=0 (segmentos rectos). El archivo resultante es dimensionalmente
 * idéntico y perfectamente cortable — solo pesa más y no tiene arcos
 * "nativos" compactos. Si esto llega a importar (ej. tamaño de archivo
 * para máquinas viejas), se puede agregar ajuste de arco por
 * mínimos cuadrados sobre 3+ puntos consecutivos más adelante.
 */
function writePolylineR12(points: Point2D[], layer: string, color: number): string {
  if (points.length < 2) return ""

  let verts = points
  const first = points[0]
  const last = points[points.length - 1]
  const closed =
    Math.abs(first.x - last.x) < CLOSE_TOLERANCE && Math.abs(first.y - last.y) < CLOSE_TOLERANCE

  if (closed) verts = points.slice(0, -1)

  let out = "  0\nPOLYLINE\n"
  out += `  8\n${layer}\n`
  out += ` 62\n${color}\n`
  out += " 66\n1\n"
  out += ` 70\n${closed ? 1 : 0}\n`
  out += " 10\n0.0\n 20\n0.0\n 30\n0.0\n"

  for (const p of verts) {
    out += "  0\nVERTEX\n"
    out += `  8\n${layer}\n`
    out += ` 10\n${p.x.toFixed(4)}\n`
    out += ` 20\n${p.y.toFixed(4)}\n`
    out += " 30\n0.0\n"
  }

  out += "  0\nSEQEND\n"
  out += `  8\n${layer}\n`
  return out
}

/**
 * Puerto de Exporter::generarDXF. Genera el contenido de texto de un
 * DXF R12 (cabecera mínima y universal, sin dependencias externas) con
 * el marco de la plancha (capa MARCO_CHAPA) y cada pieza colocada, con
 * sus entidades agrupadas por capa/color según la convención CypCut.
 */
/**
 * Entidades de una plancha (marco + piezas). origin = tile en mosaico.
 */

/** Texto DXF R12 (TEXT). Capa LEYENDA / color 2 como los planos de referencia. */
function writeTextR12(
  x: number,
  y: number,
  height: number,
  value: string,
  layer = "LEYENDA",
  color = 2,
): string {
  if (!value.trim()) return ""
  return (
    "  0\nTEXT\n" +
    `  8\n${layer}\n` +
    ` 62\n${color}\n` +
    ` 10\n${x.toFixed(4)}\n` +
    ` 20\n${y.toFixed(4)}\n` +
    ` 40\n${height.toFixed(4)}\n` +
    `  1\n${value}\n`
  )
}

export type SheetLabelInfo = {
  /** Índice 0-based de la primera plancha del rango. */
  startIndex: number
  /** Cuántas planchas idénticas representa este layout (default 1). */
  count?: number
  thicknessMm?: number
  material?: string
}

/**
 * Etiqueta unificada de exportación:
 *   PLANCHA 1 - 1.50 mm - LAF
 *   PLANCHAS 2-14 - 1.50 mm - LAF
 */
export function formatSheetExportLabel(info: SheetLabelInfo): string {
  const count = info.count ?? 1
  const first = info.startIndex + 1
  const head =
    count <= 1
      ? `PLANCHA ${first}`
      : `PLANCHAS ${first}-${info.startIndex + count}`

  const parts = [head]
  const t = info.thicknessMm
  if (t != null && t > 0) {
    const rounded = Math.round(t * 100) / 100
    const thick =
      Number.isInteger(rounded) ? `${rounded}` : `${rounded.toFixed(2)}`
    parts.push(`${thick} mm`)
  }
  const mat = info.material?.trim()
  if (mat && mat.toUpperCase() !== "N/D" && mat.toUpperCase() !== "MAT") {
    parts.push(mat.toUpperCase())
  }
  return parts.join(" - ")
}

export function writeSheetDxfEntities(
  sheet: NestedSheet,
  sheetConfig: SheetConfig,
  bridges: BridgeSettings = NO_BRIDGES,
  origin: Point2D = { x: 0, y: 0 },
  label?: SheetLabelInfo,
): string {
  const { width, height } = sheetConfig
  const ox = origin.x
  const oy = origin.y
  const flipY = (p: Point2D): Point2D => ({
    x: p.x + ox,
    y: height - p.y + oy,
  })

  let out = ""
  const frame: Point2D[] = [
    { x: ox, y: oy },
    { x: width + ox, y: oy },
    { x: width + ox, y: height + oy },
    { x: ox, y: height + oy },
    { x: ox, y: oy },
  ]
  out += writePolylineR12(frame, "MARCO_CHAPA", 7)

  // Etiqueta PLANCHA N - espesor - material (arriba del marco)
  if (label) {
    const textH = Math.max(40, Math.min(120, height * 0.04))
    const text = formatSheetExportLabel({
      ...label,
      thicknessMm: label.thicknessMm ?? sheet.thicknessMm,
    })
    out += writeTextR12(ox, oy + height + textH * 0.35, textH, text)
  }

  for (const piece of sheet.pieces) {
    if (piece.subEntities && piece.subEntities.length > 0) {
      for (const sub of piece.subEntities) {
        const layerInfo = mapColorToCypCutLayer(sub.color ?? "#00FF00")
        const layerName = resolveLayerName(sub.layer, layerInfo)
        for (const tramo of splitForBridges(sub.outline, bridges)) {
          out += writePolylineR12(tramo.points.map(flipY), layerName, layerInfo.dxfColor)
        }
      }
    } else {
      for (const tramo of splitForBridges(piece.outline, bridges)) {
        out += writePolylineR12(tramo.points.map(flipY), "CORTE_PRINCIPAL", 3)
      }
    }
  }
  return out
}

export function generateSheetDxf(
  sheet: NestedSheet,
  sheetConfig: SheetConfig,
  bridges: BridgeSettings = NO_BRIDGES,
  label?: SheetLabelInfo,
): string {
  return (
    ["  0", "SECTION", "  2", "ENTITIES", ""].join("\n") +
    writeSheetDxfEntities(sheet, sheetConfig, bridges, { x: 0, y: 0 }, label) +
    ["  0", "ENDSEC", "  0", "EOF", ""].join("\n")
  )
}
