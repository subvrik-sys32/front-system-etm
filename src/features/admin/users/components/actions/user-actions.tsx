"use client"

import {
  useState,
} from "react"

import {
  Plus,
} from "lucide-react"

import {
  PrimaryAction,
} from "@/shared/ui/actions/primary-action"

import {
  UserDialog,
} from "../dialog/user-dialog"

export function UserActions(){

  const [open,setOpen]=
    useState(false)

  return(

    <>

      <PrimaryAction

        label="Nuevo usuario"

        icon={Plus}

        onClick={()=>
          setOpen(true)
        }

      />

      <UserDialog

        open={open}

        onClose={()=>
          setOpen(false)
        }

      />

    </>

  )

}