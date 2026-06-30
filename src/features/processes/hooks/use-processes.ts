"use client"

import {
  useMemo,
} from "react"

import type {
  ProcessCode,
  Task,
} from "@/features/tasks/types/task.types"

import type {
  ProcessDefinition,
  ProcessTask,
} from "../types/process.types"

import {
  PROCESSES,
} from "../constants/processes"

import {
  getWorkflowStep,
} from "@/features/workflow/selectors/get-workflow-step"

import {
  getProcessInput,
} from "@/features/workflow/selectors/get-process-input"

type Props={
  processCode:string
  tasks:Task[]
}

export function useProcesses({
  processCode,
  tasks,
}:Props){

  const processDefinition=
    useMemo<ProcessDefinition>(()=>{

      const definition=
        PROCESSES.find(
          process=>
            process.code===processCode,
        )

      if(!definition){

        throw new Error(
          `Process "${processCode}" not found`,
        )

      }

      return definition

    },[
      processCode,
    ])

  const processTasks=
    useMemo<ProcessTask[]>(()=>{

      return tasks

        .filter(
          task=>
            task.route.includes(
              processCode as ProcessCode,
            ),
        )

        .map(task=>{

          const workflowStep=
            getWorkflowStep(
              task,
              processCode as ProcessCode,
            )

          const paintStep=
            getWorkflowStep(
              task,
              "PT",
            )

          return{

            task,

            workflowStep:
              workflowStep??null,

            paintStep:
              paintStep??null,

            inputQuantity:
              getProcessInput(
                task,
                processCode as ProcessCode,
              ),

          }

        })

    },[
      processCode,
      tasks,
    ])

  return{

    processDefinition,

    processTasks,

  }

}