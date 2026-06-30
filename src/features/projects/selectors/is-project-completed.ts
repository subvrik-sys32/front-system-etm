import type {
  Project,
} from "../types/project.types"

export function isProjectCompleted(
  project:Project,
){

  return(

    project.status?.code===

    "COMPLETED"

  )

}