"use client"

import { useMemo } from "react"

import { normalizeSearch } from "@/shared/utils/search"

import type { Project } from "../types/project.types"

export function useProjectSearch(
  projects:Project[],
  search:string,
){

  return useMemo(()=>{

    const term=
      normalizeSearch(search)

    if(!term){
      return projects
    }

    if(term.length<2){
      return[]
    }

    const isNumeric=
      /^\d+$/.test(term)

    return projects.filter(project=>{

      const sequence=
        String(project.sequence)

      const sequencePadded=
        sequence.padStart(3,"0")

      if(isNumeric){

        return(

          sequence===term ||

          sequencePadded===term

        )

      }

      const projectCode=
        normalizeSearch(project.projectCode)

      const projectName=
        normalizeSearch(project.name)

      const client=
        normalizeSearch(project.client?.name ?? "")

      const pm=
        normalizeSearch(project.pm?.name ?? "")

      return(

        projectCode.includes(term) ||

        projectName.includes(term) ||

        client.includes(term) ||

        pm.includes(term)

      )

    })

  },[
    projects,
    search,
  ])

}