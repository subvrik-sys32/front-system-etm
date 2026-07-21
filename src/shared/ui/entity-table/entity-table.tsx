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
//
// NOTA sobre "border" en vez de "ring": el resto de la app usa
// "ring-1 ring-white/6" para este mismo hairline decorativo, pero
// acá específicamente causaba un corte visual en el borde superior
// del panel (confirmado a mano, reproducible con hardware
// acceleration prendida — un bug de compositor GPU con ring/
// box-shadow + border-radius + overflow-hidden anidado varias veces
// en el shell). "border" se pinta como parte normal de la caja, no
// como una capa de sombra aparte, y no lo sufre. Es una excepción
// puntual a propósito, no un cambio de lenguaje visual general.
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

    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/6 bg-[#101012]">

      <div
        data-entity-table-scroll
        className="erp-scrollbar min-h-0 flex-1 overflow-y-auto p-1.5"
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