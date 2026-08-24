import type { NestedSheet, Point2D, SheetConfig } from "../engine/types"
import { groupIdenticalSheets } from "../utils/svg-render"
import { writeSheetDxfEntities, type BridgeSettings } from "./dxf-export"
import { buildBaseName, type Nomenclatura } from "./nomenclatura"

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

export function buildMosaicFileName(
  nom: Nomenclatura,
  totalPieces: number,
  uniqueSheetCount: number,
): string {
  return `${buildBaseName(nom)}_Q${totalPieces}_R01_P${String(uniqueSheetCount).padStart(2, "0")}_MOSAICO`
}

/** Mosaico = mismos sheetGroups que las tabs, una tile por layout. */
export function generateMosaicDxf(
  sheets: NestedSheet[],
  sheetConfig: SheetConfig,
  bridges?: BridgeSettings,
): string {
  const groups = groupIdenticalSheets(sheets.filter((s) => s.pieces.length > 0))
  if (groups.length === 0) {
    return ["  0", "SECTION", "  2", "ENTITIES", "  0", "ENDSEC", "  0", "EOF", ""].join("\n")
  }

  const cols = Math.max(1, Math.ceil(Math.sqrt(groups.length)))
  const rows = Math.max(1, Math.ceil(groups.length / cols))
  const { width, height } = sheetConfig

  let entities = ""
  for (let i = 0; i < groups.length; i++) {
    entities += writeSheetDxfEntities(
      groups[i].sheet,
      sheetConfig,
      bridges,
      tileOrigin(i, cols, rows, width, height),
    )
  }

  return (
    ["  0", "SECTION", "  2", "ENTITIES", ""].join("\n") +
    entities +
    ["  0", "ENDSEC", "  0", "EOF", ""].join("\n")
  )
}
