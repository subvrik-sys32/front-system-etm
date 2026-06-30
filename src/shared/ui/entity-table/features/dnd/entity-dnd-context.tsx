"use client"

import type{
  PropsWithChildren,
  ReactNode,
}from"react"

import{
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type DragCancelEvent,
}from"@dnd-kit/core"

import{
  SortableContext,
  rectSortingStrategy,
}from"@dnd-kit/sortable"

type Props=PropsWithChildren<{
  ids:(string|number|null|undefined)[]
  overlay?:ReactNode
  onDragStart?:(event:DragStartEvent)=>void
  onDragEnd?:(event:DragEndEvent)=>void
  onDragCancel?:(event:DragCancelEvent)=>void
  enabled?:boolean
}>

export function EntityDnDContext({
  ids,
  children,
  onDragStart,
  onDragEnd,
  onDragCancel,
  enabled=true,
}:Props){

  const safeIds=ids
    .filter((id):id is string|number=>id!=null)
    .map(String)

  return(

    <DndContext
      collisionDetection={closestCenter}
      measuring={{
        droppable:{
          strategy:MeasuringStrategy.Always,
        },
      }}
      onDragStart={
        enabled
          ?onDragStart
          :undefined
      }
      onDragEnd={
        enabled
          ?onDragEnd
          :undefined
      }
      onDragCancel={
        enabled
          ?onDragCancel
          :undefined
      }
    >

      {enabled?(
        <SortableContext
          items={safeIds}
          strategy={rectSortingStrategy}
        >
          {children}
        </SortableContext>
      ):children}

      <DragOverlay />

    </DndContext>

  )

}