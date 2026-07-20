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

  // Mismo patrón que "update" de más arriba: parchea el status del
  // workflowStep en la cache YA, antes de que el servidor confirme.
  // Sin esto (como estaba antes en start/pause/resume/complete/
  // review), el botón no cambiaba de estado hasta que la respuesta
  // volvía — con la latencia actual del server (700ms-3s), cada
  // toque se sentía como si el botón estuviera trabado/sin
  // responder. Son justo los botones que más se tocan en el piso
  // de producción.
  function optimisticStepUpdate(
    stepId:string,
    status:WorkflowStep["status"],
  ){

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
            id:stepId,
            status,
          },

        ),

    )

  }

  async function onMutateStep(
    stepId:string,
    status:WorkflowStep["status"],
  ){

    await queryClient.cancelQueries({
      queryKey:["tasks"],
    })

    const previous=
      queryClient.getQueryData<Task[]>([
        "tasks",
      ])??[]

    optimisticStepUpdate(stepId,status)

    return{ previous }

  }

  function onErrorRollback(
    _err:unknown,
    _vars:unknown,
    context:{ previous:Task[] }|undefined,
  ){

    if(!context){
      return
    }

    queryClient.setQueryData(
      ["tasks"],
      context.previous,
    )

  }

  const start=useMutation({
    mutationFn:workflowService.start,
    onMutate:(stepId:string)=>onMutateStep(stepId,"PROGRESS"),
    onError:onErrorRollback,
    onSuccess:propagate,
  })

  const pause=useMutation({
    mutationFn:workflowService.pause,
    onMutate:(stepId:string)=>onMutateStep(stepId,"PAUSED"),
    onError:onErrorRollback,
    onSuccess:propagate,
  })

  const resume=useMutation({
    mutationFn:workflowService.resume,
    onMutate:(stepId:string)=>onMutateStep(stepId,"PROGRESS"),
    onError:onErrorRollback,
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

    onMutate:({
      stepId,
    }:{
      stepId:string
      dto:WorkflowActionPayload
    })=>
      onMutateStep(stepId,"COMPLETED"),

    onError:onErrorRollback,

    onSuccess:propagate,

  })

  const review=useMutation({
    mutationFn:workflowService.review,
    onMutate:(stepId:string)=>onMutateStep(stepId,"REVIEWED"),
    onError:onErrorRollback,
    onSuccess:propagate,
  })

  const reopen=useMutation({
    mutationFn:workflowService.reopen,
    onMutate:(stepId:string)=>onMutateStep(stepId,"PROGRESS"),
    onError:onErrorRollback,
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