import type { NestedSheet, Point2D, SheetConfig } from "../engine/types"
import { groupIdenticalSheets } from "../utils/svg-render"
import { writeSheetDxfEntities, type BridgeSettings, type SheetLabelInfo } from "./dxf-export"
import { buildMosaicFileName } from "./nomenclatura"
export { buildMosaicFileName }

const MARGIN_MM = 200

function tileOrigin(
  index: number,
  cols: number,
  rows: number,
  width: number,
  height: number,
): Point2D {
  const row = Math.floor(index / cols)
  const col = index % cols
  const invertedRow = rows - 1 - row
  return {
    x: col * (width + MARGIN_MM),
    y: invertedRow * (height + MARGIN_MM),
  }
}

/** Mosaico = mismos sheetGroups que las tabs, una tile por layout. */
export type MosaicLabelOptions = {
  material?: string
  baseLote?: string | number
  proyecto?: string
  /** Material por startIndex de plancha. */
  materialsByIndex?: Record<number, string>
}

function parseBaseLote(raw?: string | number): number | undefined {
  if (raw == null || raw === "") return undefined
  const n = typeof raw === "number" ? raw : parseInt(String(raw).replace(/^L/i, ""), 10)
  return Number.isFinite(n) ? n : undefined
}

export function generateMosaicDxf(
  sheets: NestedSheet[],
  sheetConfig: SheetConfig,
  bridges?: BridgeSettings,
  labelOpts?: string | MosaicLabelOptions,
): string {
  const opts: MosaicLabelOptions =
    typeof labelOpts === "string" ? { material: labelOpts } : (labelOpts ?? {})
  const material = opts.material
  const baseLoteNum = parseBaseLote(opts.baseLote)

  const groups = groupIdenticalSheets(sheets.filter((s) => s.pieces.length > 0))
  if (groups.length === 0) {
    return ["  0", "SECTION", "  2", "ENTITIES", "  0", "ENDSEC", "  0", "EOF", ""].join("\n")
  }

  const cols = Math.max(1, Math.ceil(Math.sqrt(groups.length)))
  const rows = Math.max(1, Math.ceil(groups.length / cols))
  const { width, height } = sheetConfig

  let entities = ""
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i]
    const mat =
      opts.materialsByIndex?.[g.startIndex]?.trim() ||
      material
    const label: SheetLabelInfo = {
      startIndex: g.startIndex,
      count: g.count,
      thicknessMm: g.sheet.thicknessMm,
      material: mat,
      pieces: g.sheet.pieces.length,
      lote: baseLoteNum != null ? baseLoteNum + i : undefined,
    }
    entities += writeSheetDxfEntities(
      g.sheet,
      sheetConfig,
      bridges,
      tileOrigin(i, cols, rows, width, height),
      label,
    )
  }

  return (
    ["  0", "SECTION", "  2", "ENTITIES", ""].join("\n") +
    entities +
    ["  0", "ENDSEC", "  0", "EOF", ""].join("\n")
  )
}
