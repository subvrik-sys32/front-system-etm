"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"
import { FormDialog } from "@/shared/ui/dialogs/form-dialog/form-dialog"

import { getCurrentStep } from "@/features/workflow/selectors/get-current-step"

import { useTaskForm } from "../../hooks/use-task-form"
import { useTasks } from "../../hooks/use-tasks"

import { TaskForm } from "../form/task-form"

import type { Task } from "../../types/task.types"

type Props={
  open:boolean
  onClose:()=>void
  projectId?:string
  task?:Task
  promptOpenAfterCreate?:boolean
}

export function TaskDialog({
  open,
  onClose,
  projectId,
  task,
  promptOpenAfterCreate=false,
}:Props){

  const{
    form,
    update,
    buildTask,
    canSave,
  }=useTaskForm(
    task,
    projectId,
  )

  const{
    create,
    update:updateTask,
  }=useTasks()

  const router=useRouter()

  const[
    confirmRouteReset,
    setConfirmRouteReset,
  ]=useState(false)

  const[
    confirmOpenTask,
    setConfirmOpenTask,
  ]=useState(false)

  const[
    createdTaskId,
    setCreatedTaskId,
  ]=useState<string|null>(null)

  const[
    pendingData,
    setPendingData,
  ]=useState<ReturnType<typeof buildTask>|null>(null)

  const close=()=>onClose()

  const save=async()=>{

    if(!canSave){

      return

    }

    try{

      if(task){

        const data=buildTask()

        const routeChanged=

          JSON.stringify(task.route)!==

          JSON.stringify(data.route)

        const started=

          getCurrentStep(
            task.workflowSteps,
          )!==null

        if(
          routeChanged &&
          started
        ){

          setPendingData(data)

          setConfirmRouteReset(true)

          return

        }

        await updateTask({

          id:task.id,

          dto:data,

        })

        close()

        return

      }

      const createdTask=
        await create({

          projectId:form.projectId,
          reference:form.reference,
          lotNumber:form.lotNumber,
          pieces:form.pieces,
          assemblyCount:form.assemblyCount,
          paintKg:form.paintKg,
          route:form.route,
          priorityId:form.priorityId,
          materialId:form.materialId,
          thicknessId:form.thicknessId,
          colorId:form.colorId,
          plRt:form.plRt,
          deliveryDate:form.deliveryDate,

        })

      if(promptOpenAfterCreate){

        setCreatedTaskId(
          createdTask.id,
        )

        setConfirmOpenTask(true)

        return

      }

      close()

    }catch(error){

      console.error(
        "TASK SAVE ERROR",
        error,
      )

    }

  }

  return(

    <>

      <FormDialog
        open={open}
        title={
          task
            ? "Editar tarea"
            : "Nueva tarea"
        }
        icon={Plus}
        canSave={canSave}
        saveLabel={
          task
            ? "Guardar cambios"
            : "Crear tarea"
        }
        onClose={close}
        onSave={save}
      >

        <TaskForm
          form={{
            ...form,
            projectId:
              projectId ??
              form.projectId,
          }}
          update={update}
          projectLocked={!!projectId}
        />

      </FormDialog>

      <ActionDialog
        open={confirmRouteReset}
        title="Reiniciar flujo"
        description="
          La tarea ya inició producción.
          Cambiar la ruta reiniciará
          el workflow actual.
        "
        confirmLabel="Continuar"
        variant="danger"
        onClose={()=>{

          setPendingData(null)

          setConfirmRouteReset(false)

        }}
        onConfirm={async()=>{

          if(task&&pendingData){

            try{

              await updateTask({

                id:task.id,

                dto:pendingData,

              })

            }catch(error){

              console.error(
                "TASK UPDATE ERROR",
                error,
              )

            }

          }

          setPendingData(null)

          setConfirmRouteReset(false)

          close()

        }}
      />

      <ActionDialog
        open={confirmOpenTask}
        title="Abrir tarea"
        description="
          La tarea fue creada correctamente.
          ¿Deseas abrirla ahora?
        "
        cancelLabel="Más tarde"
        confirmLabel="Abrir"
        onClose={()=>{

          setCreatedTaskId(null)

          setConfirmOpenTask(false)

          close()

        }}
        onConfirm={()=>{

          if(createdTaskId){

            if(form.projectId){

              sessionStorage.setItem(
                "task-origin-project-id",
                form.projectId,
              )

            }else{

              sessionStorage.removeItem(
                "task-origin-project-id",
              )

            }

            router.push(
              `/tasks?taskId=${createdTaskId}`,
            )

          }

          setCreatedTaskId(null)

          setConfirmOpenTask(false)

          close()

        }}
      />

    </>

  )

}