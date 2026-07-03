import type{
  ProductionScope,
}from"./production.types"

import type{
  ProcessCode,
}from"@/features/tasks/types/task.types"

export interface ProductionSheet{

  processCode:ProcessCode

  processLabel:string

  scope:ProductionScope

  generatedAt:string

  supervisor:string

  rows:ProductionSheetRow[]

}

export interface ProductionSheetRow{

  taskId:string

  taskNumber:number

  client:string

  projectCode:string

  projectName:string

  reference:string

  lotNumber:number

  priority:string

  operator:string|null

  status:string

  pieces:number

  paint:string|null

  material:string

  thickness:string

  plRt:string|null

  deliveryDate:string|null

}