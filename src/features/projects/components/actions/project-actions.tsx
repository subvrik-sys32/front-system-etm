"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { PrimaryAction } from "@/shared/ui/actions/primary-action"
import { ProjectDialog } from "../dialog/project-dialog"

export function ProjectActions(){

  const[
    open,
    setOpen,
  ]=useState(false)

  return(

    <>

      <PrimaryAction
        label="Nuevo proyecto"
        icon={Plus}
        onClick={()=>setOpen(true)}
      />

      <ProjectDialog
        open={open}
        onClose={()=>setOpen(false)}
      />

    </>

  )

}