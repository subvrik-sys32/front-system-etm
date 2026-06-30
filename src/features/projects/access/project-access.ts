import type { Project } from "../types/project.types"

export const projectAccess={

  isCompleted:(project:Project)=>
    project.status.code==="COMPLETED",

  isActive:(project:Project)=>
    project.status.code==="ACTIVE",

  isPaused:(project:Project)=>
    project.status.code==="PAUSED",

  clientLabel:(project:Project)=>project.client,

  pmLabel:(project:Project)=>project.pm,

  stageLabel:(project:Project)=>project.stage,

  statusLabel:(project:Project)=>project.status,

}