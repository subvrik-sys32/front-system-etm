export interface Nomenclatura {
  /** YY automático (no editable). */
  anio: string
  /** Número de proyecto (ej. 130). */
  proyecto: string
  /** Tag opcional (ej. EM). Si vacío no entra en el nombre. */
  tag: string
  /** Lote inicial (ej. 1 o 4); las demás planchas suman +1. */
  lote: string
  /**
   * Material por defecto / fallback. Preferir material por plancha
   * en el mapa del export dialog.
   */
  material: string
  /** Espesor resuelto por plancha al exportar (no es input del usuario). */
  espesor: string
}

export function currentExportYear(): string {
  return String(new Date().getFullYear()).slice(-2)
}

/**
 * PRY{yy}-{proyecto}[-{tag}]_L{lote}_{material}_{espesor}
 * ej: PRY26-130_L1_GO_1.5
 *     PRY26-123-EM_L4_LAF_2
 */
export function buildBaseName(nom: Nomenclatura): string {
  const tag = nom.tag?.trim()
  const proj = tag
    ? `${nom.proyecto}-${tag}`
    : nom.proyecto
  // Nombre de archivo siempre UPPERCASE
  return `PRY${nom.anio}-${proj}_L${nom.lote}_${nom.material}_${nom.espesor}`.toUpperCase()
}

/** Plancha: {base}_Q{piezas}_P{nn} — sin R01. */
export function buildSheetFileName(
  nom: Nomenclatura,
  pieceCountOnSheet: number,
  sheetIndex: number,
): string {
  const base = buildBaseName(nom)
  const sheetNumber = String(sheetIndex + 1).padStart(2, "0")
  return `${base}_Q${pieceCountOnSheet}_P${sheetNumber}`
}

/** Mosaico: {base}_Q{total}_P{layouts}_MOSAICO */
export function buildMosaicFileName(
  nom: Nomenclatura,
  totalPieces: number,
  _uniqueSheetCount?: number,
): string {
  return `${buildBaseName(nom)}_Q${totalPieces}_MOSAICO`
}

export function buildProjectReportName(
  nom: Nomenclatura,
  totalPieceCount: number,
): string {
  return `${buildBaseName(nom)}_Q${totalPieceCount}`
}

export type NomenclaturaErrors = {
  proyecto?: string
  lote?: string
  material?: string
}

/** Proyecto + lote siempre; material se valida por plancha o global. */
export function validateNomenclatura(
  nom: Nomenclatura,
  opts?: { requireMaterial?: boolean },
): NomenclaturaErrors {
  const errors: NomenclaturaErrors = {}
  if (!nom.proyecto?.trim()) errors.proyecto = "Ingresá el número de proyecto"
  if (!nom.lote?.trim()) errors.lote = "Ingresá el lote inicial"
  if (opts?.requireMaterial !== false && !nom.material?.trim()) {
    errors.material = "Elegí el material"
  }
  return errors
}

export function isNomenclaturaReady(
  nom: Nomenclatura,
  opts?: { requireMaterial?: boolean },
): boolean {
  return Object.keys(validateNomenclatura(nom, opts)).length === 0
}
