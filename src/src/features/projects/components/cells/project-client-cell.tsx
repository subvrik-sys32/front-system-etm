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
  useClients,
} from "@/features/clients/hooks/use-clients"

import {
  useProjectField,
} from "../../hooks/use-project-field"

import type {
  Project,
} from "../../types/project.types"

type Props={
  project:Project
  triggerVariant?:"badge"|"row"
  rowLabel?:string
}

export function ProjectClientCell({
  project,
  triggerVariant,
  rowLabel,
}:Props){

  const{

    clients,

    create,

    update,

    remove,

  }=useClients()

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

      collection="clients"

      value={project.client}

      items={clients}

      placeholder="Cliente"

      disabled={!canUpdate}

      triggerVariant={triggerVariant}

      rowLabel={rowLabel}

      onChange={client=>{

        if(!client){

          return

        }

        updateField(

          project.id,

          {

            clientId:
              client.id,

          },

          {

            client,

          },

        )

      }}

      onCreate={create}

      onEdit={update}

      onDelete={remove}

    />

  )

}