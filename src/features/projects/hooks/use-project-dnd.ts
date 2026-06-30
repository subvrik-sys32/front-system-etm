"use client"

import { useState } from "react"

import { arrayMove } from "@dnd-kit/sortable"

import type {
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core"

import type {
  Project,
} from "../types/project.types"

type Props={
  projects:Project[]
  reorderProjects:(projects:Project[])=>void
}

export function useProjectDnD({
  projects,
  reorderProjects,
}:Props){

  const[
    activeProject,
    setActiveProject,
  ]=useState<Project|null>(null)

  const handleDragStart=(
    event:DragStartEvent,
  )=>{

    setActiveProject(

      projects.find(
        project=>
          project.id===event.active.id,
      )??null,

    )

  }

  const handleDragEnd=(
    event:DragEndEvent,
  )=>{

    setActiveProject(null)

    const{
      active,
      over,
    }=event

    if(
      !over ||
      active.id===over.id
    ){
      return
    }

    const oldIndex=
      projects.findIndex(
        project=>
          project.id===active.id,
      )

    const newIndex=
      projects.findIndex(
        project=>
          project.id===over.id,
      )

    if(
      oldIndex===-1 ||
      newIndex===-1
    ){
      return
    }

    reorderProjects(
      arrayMove(
        projects,
        oldIndex,
        newIndex,
      ),
    )

  }

  const handleDragCancel=()=>{

    setActiveProject(null)

  }

  return{

    activeProject,

    handleDragStart,

    handleDragEnd,

    handleDragCancel,

  }

}