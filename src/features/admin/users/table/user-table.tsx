"use client"

import {
  useMemo,
} from "react"

import {
  EntityTable,
} from "@/shared/ui/entity-table"

import {
  useHydrated,
} from "@/shared/hooks/use-hydrated"

import {
  EntityTableLoading,
} from "@/shared/ui/entity-table/entity-table-loading"

import {
  useUsers,
} from "@/features/users/hooks/use-users"

import {
  useUserColumns,
} from "./user-columns"

type Props={

  search:string

}

export function UserTable({
  search,
}:Props){

  const hydrated=
    useHydrated()

  const{
    users,
    loading,
  }=
    useUsers()

  const columns=
    useUserColumns()

  const data=
    useMemo(()=>{

      const query=
        search
          .trim()
          .toLowerCase()

      return users.filter(user=>

        !query ||

        user.name
          .toLowerCase()
          .includes(query)

        ||

        user.email
          .toLowerCase()
          .includes(query)

        ||

        (
          user.username ??
          ""
        )
          .toLowerCase()
          .includes(query)

      )

    },[
      users,
      search,
    ])

  if(!hydrated || loading){

    return(

      <EntityTableLoading
        label="Cargando usuarios..."
      />

    )

  }

  return(

    <EntityTable

      data={data}

      columns={columns}

      rowId={user=>
        user.id
      }

      emptyMessage=
        "Sin usuarios"

    />

  )

}