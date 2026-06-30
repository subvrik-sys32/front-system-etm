"use client"

import {
  EntitySelect,
} from "@/shared/ui/entity-select/entity-select"

import {
  useStatuses,
} from "@/features/statuses/hooks/use-statuses"

import {
  useProjectField,
} from "../../hooks/use-project-field"

import type {
  Project,
} from "../../types/project.types"

type Props={
  project:Project
}

export function ProjectStatusCell({
  project,
}:Props){

  const{

    statuses,

    create,

    update,

    remove,

  }=useStatuses()

  const updateField=
    useProjectField()

  return(

    <EntitySelect

      collection="statuses"

      value={project.status}

      items={statuses}

      placeholder="Estado"

      onChange={status=>{

        if(!status){

          return

        }

        updateField(

          project.id,

          {

            statusId:status.id,

          },

          {

            status,

          },

        )

      }}

      onCreate={create}

      onEdit={update}

      onDelete={remove}

    />

  )

}