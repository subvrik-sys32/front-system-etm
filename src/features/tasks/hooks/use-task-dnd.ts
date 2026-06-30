"use client"

import {
  useState,
} from "react"

import {
  arrayMove,
} from "@dnd-kit/sortable"

import type {
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core"

import type {
  Task,
} from "../types/task.types"

type Props={
  tasks:Task[]
  reorderTasks:(tasks:Task[])=>void
}

export function useTaskDnD({
  tasks,
  reorderTasks,
}:Props){

  const[
    activeTask,
    setActiveTask,
  ]=useState<Task|null>(null)

  const handleDragStart=(
    event:DragStartEvent,
  )=>{

    setActiveTask(

      tasks.find(
        task=>
          task.id===event.active.id,
      )??null,

    )

  }

  const handleDragEnd=(
    event:DragEndEvent,
  )=>{

    setActiveTask(null)

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
      tasks.findIndex(
        task=>
          task.id===active.id,
      )

    const newIndex=
      tasks.findIndex(
        task=>
          task.id===over.id,
      )

    if(
      oldIndex===-1 ||
      newIndex===-1
    ){
      return
    }

    reorderTasks(
      arrayMove(
        tasks,
        oldIndex,
        newIndex,
      ),
    )

  }

  const handleDragCancel=()=>{

    setActiveTask(null)

  }

  return{

    activeTask,

    handleDragStart,

    handleDragEnd,

    handleDragCancel,

  }

}