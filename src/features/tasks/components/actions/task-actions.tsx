"use client"

import { useState } from "react"

import { Plus } from "lucide-react"

import { PrimaryAction } from "@/shared/ui/actions/primary-action"

import { TaskDialog } from "../dialog/task-dialog"

export function TaskActions(){

  const[
    open,
    setOpen,
  ]=useState(false)

  return(

    <>

      <PrimaryAction
        label="Nueva tarea"
        icon={Plus}
        onClick={()=>setOpen(true)}
      />

      {open&&(

        <TaskDialog
          open={open}
          promptOpenAfterCreate
          onClose={()=>setOpen(false)}
        />

      )}

    </>

  )

}