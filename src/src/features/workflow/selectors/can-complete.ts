import type { WorkflowStep } from "../types/workflow.types"

const OPTIONAL_STEP_FIELDS = [
  "piecesOutput",
  "plRtReal",
  "paintKgReal",
] as const

type RequirableField = typeof OPTIONAL_STEP_FIELDS[number]

export function canCompleteStep(
  step: WorkflowStep | undefined,
  requiredFields: string[] | undefined,
) {

  if (!step || !requiredFields) {
    return false
  }

  return requiredFields.every(field => {

    if (!OPTIONAL_STEP_FIELDS.includes(field as RequirableField)) {
      return true // campo desconocido para el frontend: no bloquea, backend es la fuente final
    }

    const value = step[field as RequirableField]

    return value !== null && value !== undefined

  })

}