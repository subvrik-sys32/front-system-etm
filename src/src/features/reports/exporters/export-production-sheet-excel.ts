import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

import type { ProductionSheet } from "../types/production-sheet.types"
import { PRODUCTION_SHEET_COLUMNS } from "../constants/production-sheet-columns"

const HEADER_FILL: ExcelJS.FillPattern = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1F2937" },
}

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
}

function styleHeaderRow(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.alignment = { vertical: "middle", horizontal: "center" }
  })
  row.height = 22
}

export async function exportProductionSheetExcel(sheet: ProductionSheet): Promise<void> {
  const columns = PRODUCTION_SHEET_COLUMNS[sheet.processCode]

  const workbook = new ExcelJS.Workbook()
  workbook.creator = "ERP"
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet(sheet.processLabel)

  worksheet.mergeCells(1, 1, 1, columns.length)
  worksheet.getCell("A1").value = `HOJA DE PRODUCCIÓN - ${sheet.processLabel.toUpperCase()}`
  worksheet.getCell("A1").font = { bold: true, size: 16 }

  worksheet.addRow([])
  worksheet.addRow(["Área", sheet.processLabel, "Tipo", sheet.scope, "Generado", new Date(sheet.generatedAt)])
  worksheet.addRow([])

  worksheet.columns = columns.map((column) => ({
    header: column.label,
    key: column.key,
    width: column.width / 8,
  }))

  const headerRow = worksheet.getRow(4)
  styleHeaderRow(headerRow)

  for (const row of sheet.rows) {
    worksheet.addRow({
      ...row,
      operator: row.operator ?? "Sin asignar",
      deliveryDate: row.deliveryDate ? new Date(row.deliveryDate) : null,
    })
  }

  worksheet.autoFilter = {
    from: "A4",
    to: `${worksheet.getColumn(columns.length).letter}4`,
  }

  worksheet.views = [{ state: "frozen", ySplit: 4 }]

  if (columns.some((column) => column.key === "deliveryDate")) {
    worksheet.getColumn("deliveryDate").numFmt = "dd/mm/yyyy"
  }

  worksheet.eachRow((row, index) => {
    if (index <= 4) return

    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "center" }
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()

  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${sheet.processLabel.toLowerCase().replace(/\s+/g, "-")}-${sheet.scope}-${new Date().toISOString().slice(0, 10)}.xlsx`,
  )
}