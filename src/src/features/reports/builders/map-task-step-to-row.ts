import type { Task } from "@/features/tasks/types/task.types"
import type { WorkflowStep } from "@/features/workflow/types/workflow.types"
import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"

import type { TimeTrackingRow } from "../types/reports.types"
import { diffMinutes } from "../utils/diff-minutes"

export function mapTaskStepToRow(
  task: Task,
  step: WorkflowStep,
  stepIndex: number,
): TimeTrackingRow {
  return {
    taskId: task.id,
    taskNumber: task.taskNumber,
    stepIndex,
    isFinalStep: stepIndex === task.workflowSteps.length - 1,

    projectCode: task.project.projectCode,
    projectName: task.project.name,
    clientName: task.project.client.name,
    reference: task.reference,

    priorityName: task.priority.name,
    materialName: task.material.name,
    thicknessName: task.thickness.name,
    lotNumber: task.lotNumber,

    piecesExpected: task.pieces,
    piecesOutput: step.piecesOutput,

    processCode: step.processCode,
    processLabel: PROCESS_DEFINITIONS[step.processCode].label,
    operatorName: step.operator?.name ?? "Sin asignar",

    status: step.status,

    startedAt: step.startedAt,
    completedAt: step.completedAt,
    reviewedAt: step.reviewedAt,
    deliveryDate: task.deliveryDate,

    durationMinutes: diffMinutes(step.startedAt, step.completedAt),

    paintKgExpected: task.paintKg,
    paintKgReal: step.paintKgReal,

    plRtExpected: task.plRt,
    plRtReal: step.plRtReal,
  }
}