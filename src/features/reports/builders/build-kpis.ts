import type { ReportKpis } from "../types/report-kpis.types"
import type { TimeTrackingRow } from "../types/reports.types"

export function buildKpis(rows: TimeTrackingRow[]): ReportKpis {
  const projects = new Set<string>()
  const operators = new Set<string>()
  const processes = new Set<string>()

  // Campos a nivel de TAREA: deben sumarse una sola vez por taskId,
  // aunque la tarea aparezca repetida (una fila por cada WorkflowStep).
  const seenTasks = new Set<string>()
  let totalPiecesExpected = 0
  let totalPaintExpected = 0

  // Piezas producidas: se cuentan del PROCESO FINAL de cada tarea únicamente.
  // isFinalStep viene decidido desde el mapeo (contra task.workflowSteps.length
  // real), así que es correcto aunque filterTimeTrackingRows haya descartado
  // otras filas de la misma tarea antes de llegar aquí.
  let totalPiecesOutput = 0

  // Campos que sí es correcto sumar por cada fila/paso.
  let totalPaintReal = 0
  let totalDurationMinutes = 0

  let completed = 0
  let reviewed = 0
  let pending = 0
  let progress = 0
  let paused = 0
  let queue = 0

  for (const row of rows) {
    projects.add(row.projectName)
    processes.add(row.processCode)

    if (row.operatorName !== "Sin asignar") {
      operators.add(row.operatorName)
    }

    if (!seenTasks.has(row.taskId)) {
      seenTasks.add(row.taskId)
      totalPiecesExpected += row.piecesExpected
      totalPaintExpected += row.paintKgExpected ?? 0
    }

    if (row.isFinalStep) {
      totalPiecesOutput += row.piecesOutput ?? 0
    }

    totalPaintReal += row.paintKgReal ?? 0
    totalDurationMinutes += row.durationMinutes ?? 0

    switch (row.status) {
      case "QUEUE":
        queue++
        break
      case "PENDING":
        pending++
        break
      case "PROGRESS":
        progress++
        break
      case "PAUSED":
        paused++
        break
      case "COMPLETED":
        completed++
        break
      case "REVIEWED":
        reviewed++
        break
    }
  }

  const totalTasks = seenTasks.size
  const finished = completed + reviewed

  return {
    totalTasks,
    totalProjects: projects.size,
    totalOperators: operators.size,
    totalProcesses: processes.size,

    totalPiecesExpected,
    totalPiecesOutput,

    totalPaintExpected,
    totalPaintReal,

    completed,
    reviewed,
    pending,
    progress,
    paused,
    queue,

    totalDurationMinutes,

    avgDurationMinutes:
      finished > 0 ? Math.round(totalDurationMinutes / finished) : 0,

    productivity:
      totalPiecesOutput > 0 && totalDurationMinutes > 0
        ? Math.round(totalPiecesOutput / (totalDurationMinutes / 60))
        : 0,
  }
}