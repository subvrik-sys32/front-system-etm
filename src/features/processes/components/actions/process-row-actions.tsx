"use client"

import { toast } from "sonner"

import {
  PermissionCode,
} from "@/shared/core/enums/permission-code.enum"

import {
  WorkflowAction,
} from "@/shared/ui/actions/workflow-action"

import {
  usePermissions,
} from "@/features/permissions/hooks/use-permissions"

import {
  useWorkflow,
} from "@/features/workflow/hooks/use-workflow"

import {
  isWorkflowCompleted,
} from "@/features/workflow/selectors/is-completed"

import type{
  ProcessCode,
  Task,
}from"@/features/tasks/types/task.types"

import type{
  WorkflowStatus,
}from"@/features/workflow/types/workflow.types"

type Props={

  task:Task

  stepId:string

  status:WorkflowStatus

  processCode:ProcessCode

}

const PROCESS_NAMES:Record<ProcessCode,string>={

  CT:"Corte",

  PL:"Plegado",

  SD:"Soldadura",

  PT:"Pintura",

  EN:"Ensamble",

  DS:"Despacho",

}

export function ProcessRowActions({

  task,

  stepId,

  status,

  processCode,

}:Props){

  const{

    startStep,

    pauseStep,

    resumeStep,

    completeStep,

    reviewStep,

  }=
    useWorkflow()

  const{
    has,
  }=
    usePermissions()

  // Iniciar / pausar / reanudar / completar: permiso operativo estándar.
  const canUpdate=
    has(
      PermissionCode.WORKFLOW_UPDATE,
    )

  // Revisar: acción de validación, reservada a roles con más responsabilidad
  // (Supervisor, Project Manager, Gerencia, Admin). Operario no la tiene.
  const canReview=
    has(
      PermissionCode.WORKFLOW_REVIEW,
    )

  const safeRequest=async(

    action:()=>Promise<unknown>,

    successMsg:string,

  )=>{

    try{

      await action()

      toast.success(
        successMsg,
      )

    }catch(error){

      toast.error(

        error instanceof Error

          ?error.message

          :"Error inesperado.",

      )

    }

  }

  const handleStart=()=>{

    if(!canUpdate){
      return
    }

    return safeRequest(

      ()=>startStep(
        stepId,
      ),

      "Proceso iniciado.",

    )

  }

  const handlePause=()=>{

    if(!canUpdate){
      return
    }

    return safeRequest(

      ()=>pauseStep(
        stepId,
      ),

      "Proceso pausado.",

    )

  }

  const handleResume=()=>{

    if(!canUpdate){
      return
    }

    return safeRequest(

      ()=>resumeStep(
        stepId,
      ),

      "Proceso reanudado.",

    )

  }

  const handleComplete=async()=>{

    if(!canUpdate){
      return
    }

    const currentStep=

      task.workflowSteps.find(

        s=>s.id===stepId,

      )

    if(

      !currentStep||

      currentStep.status!=="PROGRESS"

    ){

      return

    }

    await safeRequest(

      ()=>completeStep({

        stepId,

        dto:{

          piecesOutput:
            currentStep.piecesOutput??undefined,

          plRtReal:
            currentStep.plRtReal??undefined,

          paintKgReal:
            currentStep.paintKgReal??undefined,

        },

      }),

      "Proceso completado.",

    )

  }

  const handleReview=async()=>{

    if(!canReview){
      return
    }

    const currentIndex=

      task.workflowSteps.findIndex(

        s=>s.id===stepId,

      )

    const wasCompleted=

      isWorkflowCompleted(

        task.workflowSteps,

      )

    await safeRequest(

      ()=>reviewStep(
        stepId,
      ),

      !wasCompleted

        ?"Tarea finalizada."

        :`${PROCESS_NAMES[processCode]} revisado.`,

    )

    const next=

      task.workflowSteps[
        currentIndex+1
      ]

    if(next){

      toast.success(

        `${PROCESS_NAMES[processCode]} revisado. Enviado a ${PROCESS_NAMES[next.processCode]}`,

      )

    }

  }

  if(status==="QUEUE"){

    return(

      <div className="flex w-full items-center justify-center">

        <div className="flex h-8 min-w-30 items-center justify-center rounded-lg border-2 border-dashed border-neutral-600/40 bg-transparent">

          <div className="h-1.5 w-1.5 rounded-full bg-white/20"/>

        </div>

      </div>

    )

  }

  if(status==="REVIEWED"){

    return(

      <div className="flex w-full items-center justify-center">

        <div className="flex h-8 min-w-30 items-center justify-center rounded-lg bg-emerald-500/5 px-4 text-xs font-semibold uppercase text-emerald-300">

          ✓ Revisado

        </div>

      </div>

    )

  }

  return(

    <div className="flex w-full items-center justify-center gap-2">

      {status==="PENDING"&&(

        <WorkflowAction

          label="Iniciar"

          variant="start"

          disabled={!canUpdate}

          onClick={handleStart}

        />

      )}

      {status==="PROGRESS"&&(

        <>

          <WorkflowAction

            label="Pausar"

            variant="pause"

            iconOnly

            disabled={!canUpdate}

            onClick={handlePause}

          />

          <WorkflowAction

            label="Completar"

            variant="complete"

            iconOnly

            disabled={!canUpdate}

            onClick={handleComplete}

          />

        </>

      )}

      {status==="PAUSED"&&(

        <WorkflowAction

          label="Reanudar"

          variant="start"

          disabled={!canUpdate}

          onClick={handleResume}

        />

      )}

      {status==="COMPLETED"&&(

        <WorkflowAction

          label="Revisar"

          variant="review"

          disabled={!canReview}

          onClick={handleReview}

        />

      )}

    </div>

  )

}