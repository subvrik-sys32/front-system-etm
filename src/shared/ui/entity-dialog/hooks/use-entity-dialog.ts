"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import type {
  EntityForm,
} from "../entity-dialog.types"

import type {
  EntityIcon,
} from "@/shared/constants/entity-icons"

type Props={
  open:boolean
  value?:EntityForm
  fixedIcon?:EntityIcon
  onSave:(value:EntityForm)=>Promise<void>|void
  onClose:()=>void
}

const INITIAL_FORM:EntityForm={

  name:"",

  icon:undefined,

  color:"#3B82F6",

}

export function useEntityDialog({

  open,

  value,

  fixedIcon,

  onSave,

  onClose,

}:Props){

  const[
    form,

    setForm,

  ]=

    useState<EntityForm>(

      INITIAL_FORM,

    )

  useEffect(()=>{

    if(!open){

      return

    }

    setForm(

      value

        ?structuredClone(

            value,

          )

        :structuredClone(

            INITIAL_FORM,

          ),

    )

  },[

    open,

    value,

  ])

  const canSave=

    useMemo(

      ()=>form.name.trim().length>0,

      [

        form.name,

      ],

    )

  async function save(){

    if(!canSave){

      return

    }

    await onSave({

      ...form,

      name:form.name.trim(),

      icon:fixedIcon??form.icon,

    })

    onClose()

  }

  return{

    form,

    setForm,

    canSave,

    save,

  }

}