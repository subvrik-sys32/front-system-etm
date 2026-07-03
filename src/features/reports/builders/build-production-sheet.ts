import type{
  ProcessTask,
}from"@/features/processes/types/process.types"

import type{
  ProcessCode,
}from"@/features/tasks/types/task.types"

import{
  PROCESS_DEFINITIONS,
}from"@/features/processes/constants/process-definitions"

import type{
  ProductionScope,
}from"../types/production.types"

import type{
  ProductionSheet,
  ProductionSheetRow,
}from"../types/production-sheet.types"

export function buildProductionSheet(

  tasks:ProcessTask[],

  processCode:ProcessCode,

  scope:ProductionScope,

):ProductionSheet{

  const rows:ProductionSheetRow[]=[]

  for(const processTask of tasks){

    const{

      task,

      workflowStep,

    }=processTask

    if(!workflowStep){

      continue

    }

    if(
      scope==="active"&&
      (
        workflowStep.status==="COMPLETED"||
        workflowStep.status==="REVIEWED"
      )
    ){

      continue

    }

    if(
      scope==="history"&&
      workflowStep.status!=="REVIEWED"
    ){

      continue

    }

    rows.push({

      taskId:
        task.id,

      taskNumber:
        task.taskNumber,

      client:
        task.project.client.name,

      projectCode:
        task.project.projectCode,

      projectName:
        task.project.name,

      reference:
        task.reference,

      lotNumber:
        task.lotNumber,

      priority:
        task.priority.name,

      operator:
        workflowStep.operator?.name??
        null,

      status:
        workflowStep.status,

      pieces:
        task.pieces,

      paint:
        task.color?.name??
        null,

      material:
        task.material.name,

      thickness:
        task.thickness.name,

      plRt:
        task.plRt,

      deliveryDate:
        task.deliveryDate,

    })

  }

  rows.sort(
    (a,b)=>
      a.taskNumber-
      b.taskNumber,
  )

  return{

    processCode,

    processLabel:
      PROCESS_DEFINITIONS[
        processCode
      ].label,

    scope,

    generatedAt:
      new Date().toISOString(),

    supervisor:"",

    rows,

  }

}