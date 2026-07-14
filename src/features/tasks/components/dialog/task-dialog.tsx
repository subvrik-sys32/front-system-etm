"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"
import { FormDialog } from "@/shared/ui/dialogs/form-dialog/form-dialog"

import { getCurrentStep } from "@/features/workflow/selectors/get-current-step"

import { TaskFormValue, useTaskForm } from "../../hooks/use-task-form"
import { useTasks } from "../../hooks/use-tasks"

import { TaskForm } from "../form/task-form"

import type { Task } from "../../types/task.types"
import type { TaskFormErrors } from "../form/types"


type Props={
  open:boolean
  onClose:()=>void
  projectId?:string
  task?:Task
  promptOpenAfterCreate?:boolean
}

function validateTask(
  form: TaskFormValue,
  projectLocked: boolean,
): TaskFormErrors {

  const errors: TaskFormErrors = {}

  if (!projectLocked && !form.projectId) {
    errors.projectId = "Selecciona un proyecto"
  }

  if (!form.reference.trim()) {
    errors.reference = "Falta completar"
  }

  if (form.lotNumber <= 0) {
    errors.lotNumber = "Falta completar"
  }

  if (form.route.length === 0) {
    errors.route = "Selecciona al menos un proceso"
  }

  if (!form.deliveryDate) {
    errors.deliveryDate = "Selecciona una fecha"
  }

  if (!form.priorityId) {
    errors.priorityId = "Selecciona una prioridad"
  }

  if (!form.materialId) {
    errors.materialId = "Selecciona un material"
  }

  if (!form.thicknessId) {
    errors.thicknessId = "Selecciona un espesor"
  }

  if (form.pieces <= 0) {
    errors.pieces = "Falta completar"
  }

  const requiresAssembly =
    form.route.includes("EN")

  const requiresPaint =
    form.route.includes("PT")

  if (
    requiresAssembly &&
    form.assemblyCount <= 0
  ) {
    errors.assemblyCount =
      "Ingresa la cantidad ensamblada"
  }

  if (
    requiresPaint &&
    !form.colorId
  ) {
    errors.colorId =
      "Selecciona un color"
  }

  if (
    requiresPaint &&
    form.paintKg <= 0
  ) {
    errors.paintKg =
      "Ingresa los kg de pintura"
  }

  return errors

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

  const[
    saving,
    setSaving,
  ]=useState(false)

  const[
    attempted,
    setAttempted,
  ]=useState(false)

  const projectLocked=!!projectId

  const errors=
    validateTask(
      form,
      projectLocked,
    )

  const isValid=
    Object.keys(errors).length===0

  const close=()=>{

    setAttempted(false)

    onClose()

  }

  const save=async()=>{

    if(!isValid){

      setAttempted(true)

      return

    }

    setSaving(true)

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

          setSaving(false)

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

        setSaving(false)

        return

      }

      close()

    }catch(error){

      console.error(
        "TASK SAVE ERROR",
        error,
      )

    }finally{

      setSaving(false)

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
        canSave={
          canSave &&
          isValid
        }
        saving={saving}
        saveLabel={
          task
            ? "Guardar"
            : "Crear tarea"
        }
        savingLabel={
          task
            ? "Guardando..."
            : "Creando tarea..."
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
          projectLocked={projectLocked}
          errors={
            attempted
              ? errors
              : undefined
          }
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

            setSaving(true)

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

            }finally{

              setSaving(false)

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