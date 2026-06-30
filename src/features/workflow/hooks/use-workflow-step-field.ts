"use client"

import {
  useWorkflow,
} from "./use-workflow"

import type {
  WorkflowStep,
} from "../types/workflow.types"

import type {
  WorkflowUpdatePayload,
} from "../types/workflow.payloads"

export function useWorkflowStepField(){

  const{
    updateStep,
  }=useWorkflow()

  return async(

    stepId:string,

    dto:WorkflowUpdatePayload,

    optimistic?:Partial<WorkflowStep>,

  )=>{

    await updateStep({

      id:stepId,

      dto,

      optimistic,

    })

  }

}