"use client"

import{
  GripVertical,
}from"lucide-react"

import{
  useDndRow,
}from"@/shared/ui/entity-table-common/dnd-row-context"

type Props={
  hidden?:boolean
}

export function DragCell({
  hidden,
}:Props){

  const handle=
    useDndRow()

  return(

    <button

      type="button"

      onPointerDown={
        hidden
          ?undefined
          :handle?.onPointerDown
      }

      disabled={hidden}

      className="
        flex
        h-9
        w-9
        touch-none
        items-center
        justify-center
        rounded-lg
        text-neutral-500
        transition
        hover:bg-white/5
        hover:text-neutral-200
      "

    >

      <GripVertical
        size={18}
        className={
          hidden
            ?"opacity-0"
            :"opacity-100"
        }
      />

    </button>

  )

}