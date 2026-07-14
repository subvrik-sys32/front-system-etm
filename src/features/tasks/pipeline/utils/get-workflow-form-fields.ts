import type { ProcessCode } from "@/features/tasks/types/task.types"

import {
  WORKFLOW_FORM_FIELDS,
  type WorkflowFieldType,
} from "../config/workflow-form-fields"

import type {
  WorkflowFormVariant,
} from "../components/task-workflow-overlay"

export function getWorkflowFormFields(
  processCode: ProcessCode,
  variant: WorkflowFormVariant,
): WorkflowFieldType[] {

  return (
    WORKFLOW_FORM_FIELDS[variant][processCode] ??
    []
  )

}