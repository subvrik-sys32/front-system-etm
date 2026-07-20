"use client"

import { useState,type PropsWithChildren } from "react"

import { EntityExpandContext } from "./entity-expand-context"

type Props=PropsWithChildren

export function EntityExpandProvider({
  children,
}:Props){

  const [expandedRowId,setExpandedRowId]=
    useState<string|null>(null)

  const value={
    expandedRowId,
    setExpandedRowId,
    isExpanded:(id:string)=>
      expandedRowId===id,
    toggleExpanded:(id:string)=>
      setExpandedRowId(
        current=>
          current===id
            ? null
            : id
      ),
  }

  return(

    <EntityExpandContext.Provider
      value={value}
    >
      {children}
    </EntityExpandContext.Provider>

  )

}