"use client"

import { useTableCompactMode } from "./use-table-compact-mode"
import { groupCardColumns } from "./entity-table-card-row"
import type { EntityColumn } from "./types"

type Props<T> = {
  columns: EntityColumn<T>[]
  rows?: number
}

const ROW_OPACITIES = [1, 0.85, 0.7, 0.55, 0.4, 0.3]

// Calco EXACTO de EntityTableHeader — mismas clases, mismo
// paddingRight inline, mismo título real por columna.
function GridHeaderRow<T>({
  columns,
}: {
  columns: EntityColumn<T>[]
}) {

  return (

    <div
      className="grid bg-white/2 px-3 select-none"
      style={{
        gridTemplateColumns: columns.map(c => c.width).join(" "),
        paddingRight: 10,
      }}
    >

      {columns.map(column => (

        <div
          key={column.id}
          className="px-2.5 py-3 text-center text-sm font-semibold tracking-[0.08em] select-none"
        >
          {column.title}
        </div>

      ))}

    </div>

  )

}

// Calco EXACTO de la fila de grilla real (entity-table-item.tsx /
// use-row-drag-reorder.tsx): "grid min-w-0 items-center rounded-lg
// border-b border-white/5 px-3 transition-colors hover:bg-white/2"
// en la fila — SIN padding vertical propio, porque el padding real
// vive en cada celda (EntityTableCell: "px-2.5 py-2.5"), no en la
// fila. Antes el skeleton tenía py-3 y gap-2 puestos directo en la
// fila (que la fila real no tiene) y le faltaba el redondeado +
// hover — por eso no calcaba.
function GridSkeletonRow<T>({
  columns,
  opacity,
}: {
  columns: EntityColumn<T>[]
  opacity: number
}) {

  return (

    <div
      className="grid min-w-0 items-center rounded-lg border-b border-white/5 px-3 transition-colors hover:bg-white/2"
      style={{
        gridTemplateColumns: columns.map(c => c.width).join(" "),
        opacity,
      }}
    >

      {columns.map(column => (

        // Mismo padding que EntityTableCell exacto (px-2.5 py-2.5),
        // con el placeholder centrado adentro en vez del contenido real.
        <div key={column.id} className="min-w-0 px-2.5 py-2.5">
          <div className="flex justify-center">
            <span className="h-4 w-4/5 max-w-24 rounded bg-white/6" />
          </div>
        </div>

      ))}

    </div>

  )

}

// Misma función (groupCardColumns) Y las mismas clases exactas que
// EntityTableCardRow — antes le faltaba rounded-xl/hover/transition
// en el wrapper externo, y el valor tenía mt-1 en vez de mt-0.5.
function CardSkeletonRow<T>({
  columns,
  opacity,
}: {
  columns: EntityColumn<T>[]
  opacity: number
}) {

  const { structural, groups } = groupCardColumns(columns)

  return (

    <div
      className="rounded-xl border-b border-white/5 px-3 py-3 transition-colors hover:bg-white/2"
      style={{ opacity }}
    >

      {structural.length > 0 && (

        <div className="mb-2 flex items-center gap-2">

          {structural.map(column => (
            <span key={column.id} className="block h-8 w-8 rounded-lg bg-white/6" />
          ))}

        </div>

      )}

      <div className="flex flex-col gap-2 rounded-lg bg-white/2 p-2">

        {groups.map((group, groupIndex) => (

          <div
            key={group.key + groupIndex}
            className="grid gap-x-4 gap-y-2"
            style={{
              gridTemplateColumns: `repeat(${Math.min(group.columns.length, 4)}, minmax(0, 1fr))`,
            }}
          >

            {group.columns.map(column => (

              <div key={column.id} className="min-w-0">

                <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                  {column.title}
                </div>

                <span className="mt-0.5 block h-3.5 w-4/5 rounded bg-white/6" />

              </div>

            ))}

          </div>

        ))}

      </div>

    </div>

  )

}

// Calca EXACTAMENTE las clases reales de header/fila/card — cero
// aproximación. Cualquier cambio de estilo futuro en esos 3
// componentes va a requerir actualizar esto también a mano (no hay
// forma automática de mantenerlos sincronizados en los WRAPPERS,
// solo en el agrupado de campos vía groupCardColumns).
export function EntityTableSkeleton<T>({
  columns,
  rows = 6,
}: Props<T>) {

  const { containerRef, isCompact } =
    useTableCompactMode(columns)

  return (

    <div
      ref={containerRef}
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-[#101012] ring-1 ring-white/6"
    >

      {!isCompact && (
        <GridHeaderRow columns={columns} />
      )}

      <div className="min-h-0 flex-1 animate-pulse overflow-hidden">

        {ROW_OPACITIES.slice(0, rows).map((opacity, i) =>

          isCompact ? (
            <CardSkeletonRow key={i} columns={columns} opacity={opacity} />
          ) : (
            <GridSkeletonRow key={i} columns={columns} opacity={opacity} />
          ),

        )}

      </div>

    </div>

  )

}