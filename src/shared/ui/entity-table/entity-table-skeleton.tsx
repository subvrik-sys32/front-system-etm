"use client"

import { groupCardColumns } from "./entity-table-card-row"
import type { EntityColumn } from "./types"

type Props<T> = {
  columns: EntityColumn<T>[]
  rows?: number
}

const ROW_OPACITIES = [1, 0.85, 0.7, 0.55, 0.4, 0.3]

function ShapePlaceholder({
  shape,
}: {
  shape: EntityColumn<unknown>["skeletonShape"]
}) {
  switch (shape) {
    case "badge":
      return <span className="block min-h-8 w-full rounded-full bg-white/6" />

    case "icon":
      return <span className="block h-9 w-9 rounded-lg bg-white/6" />

    case "actions-pair":
      return (
        <div className="ml-3 flex items-center gap-6">
          <span className="block h-8 w-8 rounded-lg bg-white/6" />
          <span className="block h-8 w-8 rounded-lg bg-white/6" />
        </div>
      )

    case "workflow-action":
      return <span className="block h-9 w-full rounded-lg bg-white/6" />

    case "none":
      return null

    default:
      return <span className="block h-4 w-4/5 max-w-24 rounded bg-white/6" />
  }
}

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
            <div key={column.id}>
              <ShapePlaceholder shape={column.skeletonShape ?? "icon"} />
            </div>
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

                <div className="mt-0.5">
                  <ShapePlaceholder shape={column.skeletonShape} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Modo tabla/grid eliminado, igual que en EntityTable: el skeleton
// ahora solo calca la forma de card, en todos los breakpoints.
export function EntityTableSkeleton<T>({
  columns,
  rows = 6,
}: Props<T>) {
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-[#101012] ring-1 ring-white/6">
      <div className="flex min-h-0 flex-1">
        <div
          data-entity-table-scroll
          className="min-h-0 flex-1 animate-pulse overflow-hidden"
        >
          {ROW_OPACITIES.slice(0, rows).map((opacity, i) => (
            <CardSkeletonRow key={i} columns={columns} opacity={opacity} />
          ))}
        </div>

        {/* Espacio reservado para el scrollbar */}
        <div className="w-3 shrink-0" />
      </div>
    </div>
  )
}
