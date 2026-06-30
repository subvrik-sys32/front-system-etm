"use client"

import {
  useState,
} from "react"

import {
  EntityExpandProvider,
} from "@/shared/ui/entity-table/features/expansion"

import {
  EntityToolbar,
} from "@/shared/ui/entity-toolbar/entity-toolbar"

import {
  EntityToolbarSearch,
} from "@/shared/ui/entity-toolbar/entity-toolbar-search"

import {
  UserTable,
} from "../table/user-table"

export function UsersPageContent(){

  const [search,setSearch]=
    useState("")

  return(

    <div className="mx-auto w-full max-w-400">

      <EntityToolbar

        left={

          <div className="flex flex-wrap items-center gap-2 py-1">

            <EntityToolbarSearch
              value={search}
              onChange={setSearch}
            />

          </div>

        }

      />

      <EntityExpandProvider>

        <UserTable
          search={search}
        />

      </EntityExpandProvider>

    </div>

  )

}