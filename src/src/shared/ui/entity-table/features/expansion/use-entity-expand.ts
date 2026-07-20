"use client"

import { useContext } from "react"

import { EntityExpandContext } from "./entity-expand-context"

export function useEntityExpand(){

  const context=
    useContext(
      EntityExpandContext
    )

  if(!context){

    throw new Error(
      "useEntityExpand must be used within EntityExpandContext"
    )

  }

  return context

}