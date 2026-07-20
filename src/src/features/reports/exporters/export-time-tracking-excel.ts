import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

import type { ReportModel } from "../types/report-model.types"
import { getWorkflowStatusLabel } from "@/features/workflow/utils/get-workflow-status-label"

// --- ESTILO ETM ---
const HEADER_FILL: ExcelJS.FillPattern = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFD0E1D4" },
}

const HEADER_FONT: Partial<ExcelJS.Font> = {
  color: { argb: "FF0F172A" },
  bold: true,
  size: 10,
  name: "Segoe UI",
}

const GRID_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FF1E293B" } },
  left: { style: "thin", color: { argb: "FF1E293B" } },
  bottom: { style: "thin", color: { argb: "FF1E293B" } },
  right: { style: "thin", color: { argb: "FF1E293B" } },
}

// Único origen de color permitido: el estado del workflow. Los clientes NUNCA
// determinan color — provienen del ERP y son un conjunto abierto/dinámico.
const STATUS_COLORS: Record<string, string> = {
  "PENDIENTE": "FFFEF3C7",
  "EN COLA": "FFFEE2E2",
  "EN PROCESO": "FFE0F2FE",
  "COMPLETADO": "FFE9D5FF",
  "REVISADO": "FFDCFCE7",
}

function styleHeaderRow(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.border = GRID_BORDER
    cell.alignment = { vertical: "middle", horizontal: "center" }
  })
  row.height = 24
}

/**
 * Aplica bordes de rejilla, tipografía y color condicional exclusivamente por
 * estado del workflow. No existe ninguna ramificación por cliente.
 */
function styleProductionTable(sheet: ExcelJS.Worksheet): void {
  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r)
    row.height = 22

    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = GRID_BORDER
      cell.font = { name: "Segoe UI", size: 9.5 }
      cell.alignment = { vertical: "middle", horizontal: "center" }
    })

    const statusCell = row.getCell("status")
    const statusColor = STATUS_COLORS[statusCell.value?.toString().toUpperCase() ?? ""]
    if (statusColor) {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: statusColor } }
    }
  }

  // Única columna alineada a la izquierda: REFERENCIA. Todo lo demás va centrado.
  sheet.getColumn("reference").alignment = { vertical: "middle", horizontal: "left" }
}

function toExcelDate(value: string | null): Date | null {
  return value ? new Date(value) : null
}

export async function exportTimeTrackingExcel(
  report: ReportModel,
  fileName = "reporte-produccion",
): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "ERP"
  workbook.created = new Date()

  // ---------------------------------------------------------------------
  // Resumen Ejecutivo
  // ---------------------------------------------------------------------
  const resumeSheet = workbook.addWorksheet("Resumen", {
    views: [{ showGridLines: true }],
  })

  resumeSheet.columns = [
    { header: "INDICADOR", key: "label", width: 34 },
    { header: "VALOR", key: "value", width: 18 },
  ]

  resumeSheet.addRows([
    { label: "Total tareas", value: report.kpis.totalTasks },
    { label: "Total proyectos", value: report.kpis.totalProjects },
    { label: "Total operadores", value: report.kpis.totalOperators },
    { label: "Total procesos", value: report.kpis.totalProcesses },
    { label: "Piezas esperadas", value: report.kpis.totalPiecesExpected },
    { label: "Piezas producidas", value: report.kpis.totalPiecesOutput },
    { label: "Pintura esperada (kg)", value: report.kpis.totalPaintExpected },
    { label: "Pintura real (kg)", value: report.kpis.totalPaintReal },
    { label: "Tiempo total (min)", value: report.kpis.totalDurationMinutes },
    { label: "Tiempo promedio (min)", value: report.kpis.avgDurationMinutes },
    { label: "Productividad", value: report.kpis.productivity / 100 },
    { label: "En cola", value: report.kpis.queue },
    { label: "Pendientes", value: report.kpis.pending },
    { label: "En proceso", value: report.kpis.progress },
    { label: "Pausados", value: report.kpis.paused },
    { label: "Completados", value: report.kpis.completed },
    { label: "Revisados", value: report.kpis.reviewed },
  ])

  styleHeaderRow(resumeSheet.getRow(1))

  for (let r = 2; r <= resumeSheet.rowCount; r++) {
    const row = resumeSheet.getRow(r)
    row.height = 20
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = GRID_BORDER
      cell.alignment = { vertical: "middle", horizontal: "center" }
    })
    row.getCell("label").alignment = { vertical: "middle", horizontal: "left" }
  }

  resumeSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const labelText = row.getCell("label").value?.toString() ?? ""
    const valueCell = row.getCell("value")
    if (labelText.includes("Pintura") || labelText.includes("promedio")) {
      valueCell.numFmt = "#,##0.00"
    } else if (labelText.includes("Productividad")) {
      valueCell.numFmt = "0.0%"
    } else {
      valueCell.numFmt = "#,##0"
    }
  })

  // ---------------------------------------------------------------------
  // Detalle de Producción
  // ---------------------------------------------------------------------
  const detailSheet = workbook.addWorksheet("Detalle", {
    views: [{ state: "frozen", ySplit: 1, showGridLines: true }],
  })

  detailSheet.columns = [
    { header: "ID", key: "taskNumber", width: 8 },
    { header: "CÓDIGO PROYECTO", key: "projectCode", width: 16 },
    { header: "CLIENTE", key: "clientName", width: 24 },
    { header: "REFERENCIA", key: "reference", width: 34 },
    { header: "LOTE", key: "lotNumber", width: 10 },
    { header: "PRIORIDAD", key: "priorityName", width: 14 },
    { header: "PROCESO", key: "processLabel", width: 14 },
    { header: "PIEZAS", key: "piecesExpected", width: 10 },
    { header: "ESPESOR", key: "thicknessName", width: 12 },
    { header: "MATERIAL", key: "materialName", width: 14 },
    { header: "OPERADOR", key: "operatorName", width: 22 },
    { header: "ESTADO", key: "status", width: 16 },
    { header: "ENTREGA", key: "deliveryDate", width: 14 },
  ]

  for (const row of report.rows) {
    detailSheet.addRow({
      ...row,
      clientName: row.clientName?.toUpperCase() ?? "",
      status: getWorkflowStatusLabel(row.status).toUpperCase(),
      deliveryDate: toExcelDate(row.deliveryDate),
    })
  }

  styleHeaderRow(detailSheet.getRow(1))
  styleProductionTable(detailSheet)

  detailSheet.autoFilter = { from: "A1", to: "M1" }
  detailSheet.getColumn("deliveryDate").numFmt = "dd/mm/yyyy"
  detailSheet.getColumn("piecesExpected").numFmt = "#,##0"

  // ---------------------------------------------------------------------
  // Operadores
  // ---------------------------------------------------------------------
  const operatorSheet = workbook.addWorksheet("Operadores", {
    views: [{ showGridLines: true }],
  })

  operatorSheet.columns = [
    { header: "OPERADOR", key: "operatorName", width: 24 },
    { header: "PASOS ASIGNADOS", key: "stepsAssigned", width: 18 },
    { header: "PASOS COMPLETADOS", key: "stepsCompleted", width: 18 },
    { header: "TIEMPO TOTAL (MIN)", key: "totalDurationMinutes", width: 18 },
    { header: "TIEMPO PROMEDIO", key: "avgDurationMinutes", width: 18 },
    { header: "PIEZAS", key: "totalPiecesOutput", width: 16 },
    { header: "PIEZAS/HORA", key: "piecesPerHour", width: 16 },
  ]

  operatorSheet.addRows(report.operators.map((operator) => operator.summary))

  styleHeaderRow(operatorSheet.getRow(1))

  for (let r = 2; r <= operatorSheet.rowCount; r++) {
    const row = operatorSheet.getRow(r)
    row.height = 20
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = GRID_BORDER
      cell.alignment = { vertical: "middle", horizontal: "center" }
    })
  }

  operatorSheet.autoFilter = { from: "A1", to: "G1" }
  operatorSheet.getColumn("stepsAssigned").numFmt = "#,##0"
  operatorSheet.getColumn("stepsCompleted").numFmt = "#,##0"
  operatorSheet.getColumn("totalDurationMinutes").numFmt = "#,##0"
  operatorSheet.getColumn("avgDurationMinutes").numFmt = "#,##0.00"
  operatorSheet.getColumn("totalPiecesOutput").numFmt = "#,##0"
  operatorSheet.getColumn("piecesPerHour").numFmt = "#,##0.00"

  // ---------------------------------------------------------------------
  // Proyectos
  // ---------------------------------------------------------------------
  const projectSheet = workbook.addWorksheet("Proyectos", {
    views: [{ showGridLines: true }],
  })

  projectSheet.columns = [
    { header: "PROYECTO", key: "projectName", width: 30 },
    { header: "CLIENTE", key: "clientName", width: 24 },
    { header: "TAREAS", key: "tasks", width: 10 },
    { header: "OPERADORES", key: "operators", width: 14 },
    { header: "PROCESOS", key: "processes", width: 12 },
    { header: "COMPLETADOS", key: "completed", width: 14 },
    { header: "REVISADOS", key: "reviewed", width: 12 },
    { header: "EN PROCESO", key: "progress", width: 14 },
    { header: "PENDIENTES", key: "pending", width: 14 },
    { header: "TIEMPO (MIN)", key: "totalDurationMinutes", width: 16 },
  ]

  const mappedProjects = report.projects.map((proj) => ({
    ...proj,
    clientName: proj.clientName?.toUpperCase() ?? "",
  }))

  projectSheet.addRows(mappedProjects)

  styleHeaderRow(projectSheet.getRow(1))

  for (let r = 2; r <= projectSheet.rowCount; r++) {
    const row = projectSheet.getRow(r)
    row.height = 20
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = GRID_BORDER
      cell.alignment = { vertical: "middle", horizontal: "center" }
    })
    row.getCell("projectName").alignment = { vertical: "middle", horizontal: "left" }
  }

  projectSheet.autoFilter = { from: "A1", to: "J1" }

  const projectIntCols = [
    "tasks",
    "operators",
    "processes",
    "completed",
    "reviewed",
    "progress",
    "pending",
    "totalDurationMinutes",
  ]
  projectIntCols.forEach((colKey) => {
    projectSheet.getColumn(colKey).numFmt = "#,##0"
  })

  // ---------------------------------------------------------------------
  // Guardar y Descargar Archivo
  // ---------------------------------------------------------------------
  const buffer = await workbook.xlsx.writeBuffer()

  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${fileName}-${new Date().toISOString().slice(0, 10)}.xlsx`,
  )
}