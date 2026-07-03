import pdfMake from "pdfmake/build/pdfmake"
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces"
import type { ProductionSheet } from "../types/production-sheet.types"
import { PRODUCTION_SHEET_COLUMNS } from "../constants/production-sheet-columns"

let fontsRegistered = false

function ensureFonts(): void {
  if (fontsRegistered) return

  pdfMake.addFonts({
    Roboto: {
      normal: "https://unpkg.com/pdfmake@0.3/build/fonts/Roboto/Roboto-Regular.ttf",
      bold: "https://unpkg.com/pdfmake@0.3/build/fonts/Roboto/Roboto-Medium.ttf",
      italics: "https://unpkg.com/pdfmake@0.3/build/fonts/Roboto/Roboto-Italic.ttf",
      bolditalics: "https://unpkg.com/pdfmake@0.3/build/fonts/Roboto/Roboto-MediumItalic.ttf",
    },
  })

  fontsRegistered = true
}

function headerCell(text: string): Content {
  return { text, bold: true, color: "white", alignment: "center" }
}

function bodyCell(text: string): Content {
  return { text, alignment: "center" }
}

// Únicos dos campos que necesitan transformación antes de mostrarse como texto:
// operator (fallback) y deliveryDate (formato local). El resto se muestra tal
// cual viene del ERP. Si mañana agregas una columna nueva, cae en el default.
function formatCellValue(key: string, value: unknown): string {
  if (key === "operator") {
    return (value as string | null) ?? "Sin asignar"
  }

  if (key === "deliveryDate") {
    return value ? new Date(value as string).toLocaleDateString("es-PE") : "—"
  }

  return value == null ? "" : String(value)
}

function signatureBlock(label: string) {
  return {
    width: "*",
    stack: [
      { text: label, alignment: "center", bold: true, margin: [0, 0, 0, 32] },
      {
        canvas: [
          {
            type: "line" as const,
            x1: 20,
            y1: 0,
            x2: 180,
            y2: 0,
            lineWidth: 0.8,
            lineColor: "#9CA3AF",
          },
        ],
      },
    ],
  }
}

function divider() {
  return {
    canvas: [
      { type: "line" as const, x1: 0, y1: 0, x2: 780, y2: 0, lineWidth: 1, lineColor: "#D1D5DB" },
    ],
    margin: [0, 0, 0, 18],
  }
}

function tableLayout() {
  return {
    hLineWidth: () => 0.6,
    vLineWidth: () => 0.6,
    hLineColor: () => "#D1D5DB",
    vLineColor: () => "#D1D5DB",
    fillColor: (row: number) => (row === 0 ? "#1F2937" : row % 2 === 0 ? "#F9FAFB" : null),
    paddingLeft: () => 5,
    paddingRight: () => 5,
    paddingTop: () => 4,
    paddingBottom: () => 4,
  }
}

function buildHeader(sheet: ProductionSheet) {
  return {
    table: {
      widths: ["*", 220],
      body: [
        [
          {
            stack: [
              { text: "HOJA DE PRODUCCIÓN", fontSize: 18, bold: true },
              {
                text: sheet.processLabel.toUpperCase(),
                fontSize: 11,
                color: "#6B7280",
                margin: [0, 4, 0, 0],
              },
            ],
            border: [false, false, false, false],
          },
          {
            table: {
              widths: [80, "*"],
              body: [
                [{ text: "Área", bold: true }, { text: sheet.processLabel }],
                [
                  { text: "Tipo", bold: true },
                  { text: sheet.scope === "active" ? "Producción Actual" : "Histórico" },
                ],
                [
                  { text: "Generado", bold: true },
                  { text: new Date(sheet.generatedAt).toLocaleString("es-PE") },
                ],
                [
                  { text: "Supervisor", bold: true },
                  { text: sheet.supervisor || "________________" },
                ],
              ],
            },
            layout: "lightHorizontalLines",
          },
        ],
      ],
    },
    layout: "noBorders",
    margin: [0, 0, 0, 18],
  }
}

function buildProductionTable(sheet: ProductionSheet) {
  const columns = PRODUCTION_SHEET_COLUMNS[sheet.processCode]
  const record = sheet.rows as unknown as Record<string, unknown>[]

  return {
    table: {
      headerRows: 1,
      widths: columns.map((column) => column.width),
      body: [
        columns.map((column) => headerCell(column.label)),
        ...record.map((row) =>
          columns.map((column) => bodyCell(formatCellValue(column.key, row[column.key]))),
        ),
      ],
    },
    layout: tableLayout(),
    margin: [0, 0, 0, 18],
  }
}

function buildSummary(sheet: ProductionSheet) {
  const observationLines = [18, 42, 66].map((y) => ({
    type: "line" as const,
    x1: 0,
    y1: y,
    x2: 220,
    y2: y,
  }))

  return {
    columns: [
      {
        width: "33%",
        stack: [
          { text: "OBSERVACIONES", bold: true, margin: [0, 0, 0, 8] },
          { canvas: observationLines },
        ],
      },
      {
        width: "67%",
        stack: [
          { text: `TOTAL TAREAS : ${sheet.rows.length}`, bold: true, margin: [0, 0, 0, 6] },
          { text: `ÁREA : ${sheet.processLabel}`, margin: [0, 0, 0, 6] },
          { text: `TIPO : ${sheet.scope === "active" ? "Producción Actual" : "Histórico"}` },
        ],
      },
    ],
    margin: [0, 12, 0, 20],
  }
}

function buildSignatures() {
  return {
    columns: [
      signatureBlock("RESPONSABLE"),
      signatureBlock("SUPERVISOR"),
      signatureBlock("JEFE DE PRODUCCIÓN"),
    ],
    margin: [0, 30, 0, 0],
  }
}

export async function exportProductionSheetPdf(sheet: ProductionSheet): Promise<void> {
  ensureFonts()

  const content = [
    buildHeader(sheet),
    divider(),
    { text: "LISTADO DE PRODUCCIÓN", fontSize: 12, bold: true, margin: [0, 0, 0, 8] },
    buildProductionTable(sheet),
    buildSummary(sheet),
    buildSignatures(),
  ] as unknown as Content[]

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [24, 24, 24, 24],
    content,
    defaultStyle: { font: "Roboto", fontSize: 8 },
  }

  const fileName = `${sheet.processLabel.toLowerCase().replace(/\s+/g, "-")}-${sheet.scope}-${new Date().toISOString().slice(0, 10)}.pdf`

  await pdfMake.createPdf(docDefinition).download(fileName)
}