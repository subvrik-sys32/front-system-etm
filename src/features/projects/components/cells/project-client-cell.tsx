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
}

export function ProjectClientCell({
  project,
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

  // project.client es un snapshot embebido que viaja pegado al
  // proyecto desde el fetch original: no se entera si el cliente se
  // edita desde OTRA fila o desde datos maestros (solo se invalida la
  // lista ["clients"], no ["projects"]). Acá lo resolvemos contra la
  // lista viva de clientes, que sí está siempre sincronizada; si por
  // algún motivo no aparece ahí (ej. recién creado y aún no llegó el
  // refetch), caemos al snapshot para no romper el badge.
  const client=
    clients.find(
      c=>c.id===project.client?.id,
    )??project.client

  console.log("CLIENTS EN ESTA FILA:", project.name, clients.length, clients.map(c=>c.name))
  
  return(

    <EntitySelect

      collection="clients"

      value={client}

      items={clients}

      placeholder="Cliente"

      disabled={!canUpdate}

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