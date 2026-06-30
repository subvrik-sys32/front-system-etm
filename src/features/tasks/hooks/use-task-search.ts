"use client"

import {
  useMemo,
} from "react"

import {
  normalizeSearch,
} from "@/shared/utils/search"

import type {
  Task,
} from "../types/task.types"

export function useTaskSearch(
  tasks:Task[],
  search:string,
){

  return useMemo(()=>{

    const term=
      normalizeSearch(search)

    if(!term){
      return tasks
    }

    if(term.length<2){
      return[]
    }

    const isNumeric=
      /^\d+$/.test(term)

    return tasks.filter(task=>{

      const taskNumber=
        String(task.taskNumber)

      const taskNumberPadded=
        taskNumber.padStart(3,"0")

      if(isNumeric){

        return(

          taskNumber===term ||

          taskNumberPadded===term

        )

      }

      const reference=
        normalizeSearch(task.reference)

      const projectCode=
        normalizeSearch(task.project.projectCode)

      const projectName=
        normalizeSearch(task.project.name)

      const client=
        normalizeSearch(task.project.client.name)

      const pm=
        normalizeSearch(task.project.pm.name)

      const material=
        normalizeSearch(task.material.name)

      const thickness=
        normalizeSearch(task.thickness.name)

      const color=
        normalizeSearch(task.color?.name ?? "")

      return(

        reference.includes(term) ||

        projectCode.includes(term) ||

        projectName.includes(term) ||

        client.includes(term) ||

        pm.includes(term) ||

        material.includes(term) ||

        thickness.includes(term) ||

        color.includes(term)

      )

    })

  },[
    tasks,
    search,
  ])

}