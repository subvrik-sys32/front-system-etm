"use client"

import { useMutation,useQueryClient } from "@tanstack/react-query"

import {
  workflowService,
  type WorkflowResponse,
} from "../services/workflow.services"

import type {
  WorkflowActionPayload,
  WorkflowUpdatePayload,
} from "../types/workflow.payloads"

import type { WorkflowStep } from "../types/workflow.types"
import type { Task } from "@/features/tasks/types/task.types"

import { replaceNestedEntity } from "@/shared/core/entity/cache/replace-nested-entity"
import { propagateWorkflowUpdate } from "../cache/propagate-workflow-update"

type UpdateWorkflowInput={
  id:string
  dto:WorkflowUpdatePayload
  optimistic?:Partial<WorkflowStep>
}

export function useWorkflow(){

  const queryClient=useQueryClient()

  const propagate=(
    response:WorkflowResponse,
  )=>

    propagateWorkflowUpdate(
      queryClient,
      response,
    )

  const update=useMutation<
    WorkflowResponse,
    Error,
    UpdateWorkflowInput,
    { previous:Task[] }
  >({

    mutationFn:({
      id,
      dto,
    })=>
      workflowService.update(
        id,
        dto,
      ),

    onMutate:async({
      id,
      optimistic,
    })=>{

      await queryClient.cancelQueries({
        queryKey:["tasks"],
      })

      const previous=
        queryClient.getQueryData<Task[]>([
          "tasks",
        ])??[]

      if(optimistic){

        queryClient.setQueryData<Task[]>(

          ["tasks"],

          current=>

            replaceNestedEntity(

              current??[],

              task=>task.workflowSteps,

              (task,workflowSteps)=>({
                ...task,
                workflowSteps,
              }),

              {
                id,
                ...optimistic,
              },

            ),

        )

      }

      return{ previous }

    },

    onError:(
      _,
      __,
      context,
    )=>{

      if(!context){
        return
      }

      queryClient.setQueryData(
        ["tasks"],
        context.previous,
      )

    },

    onSuccess:propagate,

  })

  const start=useMutation({
    mutationFn:workflowService.start,
    onSuccess:propagate,
  })

  const pause=useMutation({
    mutationFn:workflowService.pause,
    onSuccess:propagate,
  })

  const resume=useMutation({
    mutationFn:workflowService.resume,
    onSuccess:propagate,
  })

  const complete=useMutation({

    mutationFn:({
      stepId,
      dto,
    }:{
      stepId:string
      dto:WorkflowActionPayload
    })=>
      workflowService.complete(
        stepId,
        dto,
      ),

    onSuccess:propagate,

  })

  const review=useMutation({
    mutationFn:workflowService.review,
    onSuccess:propagate,
  })

  const reopen=useMutation({
    mutationFn:workflowService.reopen,
    onSuccess:propagate,
  })

  return{
    updateStep:update.mutateAsync,
    startStep:start.mutateAsync,
    pauseStep:pause.mutateAsync,
    resumeStep:resume.mutateAsync,
    completeStep:complete.mutateAsync,
    reviewStep:review.mutateAsync,
    reopenStep:reopen.mutateAsync,
  }

}