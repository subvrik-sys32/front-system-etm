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
  useResponsive,
} from "@/shared/responsive/hooks/use-responsive"

import {
  cn,
} from "@/shared/utils/utils"

import {
  UserTable,
} from "../table/user-table"

export function UsersPageContent(){

  const { isMobile } = useResponsive()

  const [search,setSearch]=
    useState("")

  return(

    // Mismo patrón que ProjectPageContent/TaskPageContent: en
    // desktop, contenedor con altura fija y scroll interno acotado
    // (h-full/min-h-0/overflow-hidden) — es lo que le da a
    // EntityTable el 100% del que depende su propio h-full. Sin
    // esto, EntityTable colapsa al alto de su contenido (3 filas)
    // en vez de ocupar el espacio disponible de la página.
    <div className={cn(
      "mx-auto flex w-full max-w-400 flex-col",
      isMobile ? "" : "h-full min-h-0 overflow-hidden",
    )}>

      <div className="shrink-0">

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

      </div>

      <div className={cn(
        isMobile ? "" : "min-h-0 flex-1 overflow-hidden",
      )}>

        <EntityExpandProvider>

          <UserTable
            search={search}
          />

        </EntityExpandProvider>

      </div>

    </div>

  )

}