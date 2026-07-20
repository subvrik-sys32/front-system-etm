"use client"

import {
  EntityTableCardRow,
} from "./entity-table-card-row"

import type {
  EntityTableProps,
} from "./types"

// Modo tabla/grid eliminado: ahora se usa siempre la vista de cards,
// en todos los breakpoints. Antes esto decidía entre grid y cards
// según el ancho del contenedor (useTableCompactMode), pero ese
// criterio vivía desincronizado del que usaba AppShell para elegir
// shell (isMobile viewport vs isCompact contenedor), lo que producía
// combinaciones de layout inconsistentes durante resize/rotación.
// Al eliminar la rama de grid, esa clase entera de bugs desaparece.
export function EntityTable<T>({
  data,
  columns,
  rowId,
  emptyMessage="Sin registros",
  renderRow,
  expandedRowId,
  onExpandedRowChange,
  renderExpandedRow,
}:EntityTableProps<T>){

  return(

    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-[#101012] ring-1 ring-white/6">

      <div
        data-entity-table-scroll
        className="erp-scrollbar min-h-0 flex-1 overflow-y-auto"
        style={{
          scrollbarGutter:"stable",
        }}
      >

        {data.length===0&&(

          <div className="flex h-60 items-center justify-center text-neutral-500">
            {emptyMessage}
          </div>

        )}

        {data.map((item,rowIndex)=>{

          const id=rowId(item)
          const isExpanded=expandedRowId===id

          const cardContent=(

            <EntityTableCardRow
              item={item}
              rowIndex={rowIndex}
              columns={columns}
              isExpanded={isExpanded}
              toggleExpanded={()=>
                onExpandedRowChange?.(
                  isExpanded?null:id,
                )
              }
            />

          )

          return(

            <div key={id} data-expanded-row-id={id}>

              {renderRow

                ?renderRow(item,cardContent,"",id)

                :cardContent

              }

              {isExpanded&&renderExpandedRow?.(item)}

            </div>

          )

        })}

      </div>

    </div>

  )

}