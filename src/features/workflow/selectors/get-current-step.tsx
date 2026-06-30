import type { WorkflowStep } from "../types/workflow.types"

export function getCurrentStep(
  workflow:WorkflowStep[],
){

  return(

    workflow.find(

      step=>

        step.status==="PENDING"||

        step.status==="PROGRESS"||

        step.status==="PAUSED"||

        step.status==="COMPLETED",

    )??

    null

  )

}