"use client"

import { useState } from "react"

import { Pencil, Trash2 } from "lucide-react"

import { IconAction } from "@/shared/ui/actions/icon-action"

import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"

import { TaskDialog } from "../dialog/task-dialog"

import { useTasks } from "../../hooks/use-tasks"

import type { Task } from "../../types/task.types"

type TaskRowActionsProps={
  task:Task
}

export function TaskRowActions({
  task,
}:TaskRowActionsProps){

  const{
    remove,
  }=useTasks()

  const[
    editOpen,
    setEditOpen,
  ]=useState(false)

  const[
    deleteOpen,
    setDeleteOpen,
  ]=useState(false)

  const handleDelete=async()=>{

    try{

      await remove(
        task.id,
      )

      setDeleteOpen(false)

    }catch(error){

      console.error(
        "TASK DELETE ERROR",
        error,
      )

    }

  }

  return(

    <>

      <div className="ml-3 flex items-center gap-6">

        <IconAction
          icon={Pencil}
          onClick={()=>setEditOpen(true)}
        />

        <IconAction
          icon={Trash2}
          variant="danger"
          onClick={()=>setDeleteOpen(true)}
        />

      </div>

      <TaskDialog
        open={editOpen}
        task={task}
        onClose={()=>setEditOpen(false)}
      />

      <ActionDialog
        open={deleteOpen}
        title="Eliminar tarea"
        description={`Se eliminará "${task.reference}". Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onClose={()=>setDeleteOpen(false)}
        onConfirm={handleDelete}
      />

    </>

  )

}