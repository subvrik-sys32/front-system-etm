import type { NestingPiece } from "../engine/types"
import { parseDxf } from "./dxf-parser"
import { parseGeo } from "./geo-parser"
import type { CadData } from "./types"

export type LocalCadParseResult = {
  pieces: NestingPiece[]
  pieceCount: number
  width?: number
  height?: number
  valid: boolean
  drawing?: NestingPiece
}

/**
 * CAD Y↑ → canvas/nesting Y↓ (igual que CadParseService.flipYPiece en el back).
 * No voltea planos exportados por nesting (capa MARCO_CHAPA).
 */
function flipYPiece(piece: NestingPiece): NestingPiece {
  const fromNesting = (piece.subEntities ?? []).some((s) =>
    (s.layer ?? "").toUpperCase().includes("MARCO_CHAPA"),
  )
  if (fromNesting) return piece

  let minY = Infinity
  let maxY = -Infinity
  const eat = (pts: { y: number }[]) => {
    for (const p of pts) {
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
    }
  }
  eat(piece.outline.points)
  for (const sub of piece.subEntities ?? []) eat(sub.outline.points)
  if (!Number.isFinite(minY)) return piece
  const fy = (p: { x: number; y: number }) => ({
    x: p.x,
    y: maxY - p.y + minY,
  })

  return {
    ...piece,
    outline: { points: piece.outline.points.map(fy) },
    subEntities: (piece.subEntities ?? []).map((s) => ({
      ...s,
      outline: { points: s.outline.points.map(fy) },
    })),
  }
}

function cadDataToPiece(id: string, cad: CadData): NestingPiece {
  return {
    id,
    outline: cad.outline,
    subEntities: cad.entities.map((e) => ({
      outline: e.outline,
      color: e.color != null ? String(e.color) : undefined,
      layer: e.layer,
      text: e.text,
      textHeight: e.textHeight,
    })),
    quantity: 1,
  }
}

function isDxf(name: string) {
  return name.toLowerCase().endsWith(".dxf")
}
function isGeo(name: string) {
  return name.toLowerCase().endsWith(".geo")
}

/**
 * Parse DXF/GEO 100% en el browser — 0 RTT al API.
 * Misma geometría que POST /engineering/cad/parse.
 */
export function parseCadLocal(
  fileName: string,
  content: string,
): LocalCadParseResult {
  const cad = isGeo(fileName)
    ? parseGeo(content)
    : isDxf(fileName)
      ? parseDxf(content)
      : null

  if (!cad || !cad.valid || cad.outline.points.length === 0) {
    return { pieces: [], pieceCount: 0, valid: false }
  }

  const base = fileName.replace(/\.[^.]+$/, "") || "piece"
  const piece = flipYPiece(cadDataToPiece(base, cad))
  return {
    pieces: [piece],
    pieceCount: 1,
    width: cad.width,
    height: cad.height,
    valid: true,
    drawing: piece,
  }
}

export async function parseCadLocalFile(file: File): Promise<LocalCadParseResult> {
  const content = await file.text()
  return parseCadLocal(file.name, content)
}
