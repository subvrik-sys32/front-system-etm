"use client"

import type {
  EntityColumn,
} from "./types"

type Props<T> = {
  columns: EntityColumn<T>[]
}

export function EntityTableHeader<T>({
  columns,
}: Props<T>) {

  return (

    <div
      className="grid bg-white/2"
      style={{
        gridTemplateColumns:
          columns
            .map(
              column =>
                column.width
            )
            .join(" "),
        paddingRight: 10,
      }}
    >

      {columns.map(column => (

        <div
          key={column.id}
          className="px-2.5 py-3 text-center text-sm font-semibold tracking-[0.08em]"
        >

          {column.title}

        </div>

      ))}

    </div>

  )

}