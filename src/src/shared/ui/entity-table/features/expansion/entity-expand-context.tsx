"use client"

import { createContext } from "react"

export type EntityExpandContextValue={
  expandedRowId:string|null
  setExpandedRowId:(id:string|null)=>void
  isExpanded:(id:string)=>boolean
  toggleExpanded:(id:string)=>void
}

export const EntityExpandContext=
  createContext<EntityExpandContextValue|null>(null)