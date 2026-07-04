"use client"

import {
  EntitySelect,
} from "@/shared/ui/entity-select/entity-select"

import {
  PermissionCode,
} from "@/shared/core/enums/permission-code.enum"

import {
  usePermissions,
} from "@/features/permissions/hooks/use-permissions"

import {
  useStages,
} from "@/features/stages/hooks/use-stages"

import {
  useProjectField,
} from "../../hooks/use-project-field"

import type {
  Project,
} from "../../types/project.types"

type Props={
  project:Project
}

export function ProjectStageCell({
  project,
}:Props){

  const{

    stages,

    create,

    update,

    remove,

  }=useStages()

  const updateField=
    useProjectField()

  const{
    has,
  }=usePermissions()

  const canUpdate=
    has(
      PermissionCode.PROJECT_UPDATE,
    )

  return(

    <EntitySelect

      collection="stages"

      value={project.stage}

      items={stages}

      placeholder="Etapa"

      disabled={!canUpdate}

      onChange={stage=>{

        if(!stage){

          return

        }

        updateField(

          project.id,

          {

            stageId:
              stage.id,

          },

          {

            stage,

          },

        )

      }}

      onCreate={create}

      onEdit={update}

      onDelete={remove}

    />

  )

}