"use client"

import {
  useState,
} from "react"

import {
  Plus,
} from "lucide-react"

import {
  PermissionCode,
} from "@/shared/core/enums/permission-code.enum"

import {
  usePermissions,
} from "@/features/permissions/hooks/use-permissions"

import {
  PrimaryAction,
} from "@/shared/ui/actions/primary-action"

import {
  UserDialog,
} from "../dialog/user-dialog"

export function UserActions(){

  const[
    open,
    setOpen,
  ]=useState(false)

  const{
    has,
  }=
    usePermissions()

  const canCreate=
    has(
      PermissionCode.USER_CREATE,
    )

  return(

    <>

      <PrimaryAction

        label="Nuevo usuario"

        icon={Plus}

        disabled={!canCreate}

        onClick={()=>{

          if(!canCreate){
            return
          }

          setOpen(true)

        }}

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