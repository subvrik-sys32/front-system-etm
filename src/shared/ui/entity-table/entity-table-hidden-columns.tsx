"use client"

import { MoreHorizontal } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import type {
  EntityColumn,
  EntityColumnContext,
} from "./types"

type Props<T> = {
  item: T
  context: EntityColumnContext<T>
  hiddenColumns: EntityColumn<T>[]
}

// Mismo patrón que usamos en mobile para los 4 badges de
// Cliente/Etapa/Estado/PM: en vez de perder la info de las
// columnas que no entran, se agrupan en un único indicador
// compacto ("···") que las revela en un popover al tocarlo, fila
// por fila — sin necesitar expandir toda la fila para verlas.
export function EntityTableHiddenColumns<T>({
  item,
  context,
  hiddenColumns,
}: Props<T>) {

  return (

    <Popover>

      <PopoverTrigger asChild>

        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-white/8 hover:text-neutral-200"
        >

          <MoreHorizontal size={15} />

        </button>

      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-70 space-y-1"
      >

        {hiddenColumns.map(column => (

          <div
            key={column.id}
            className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5"
          >

            <span className="shrink-0 text-xs font-semibold tracking-wide text-neutral-500">
              {column.title}
            </span>

            <div className="min-w-0">
              {column.render(item, context)}
            </div>

          </div>

        ))}

      </PopoverContent>

    </Popover>

  )

}