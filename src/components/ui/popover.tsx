"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import {
  cn,
} from "@/shared/utils/utils"

type PopoverProps =
  React.ComponentProps<
    typeof PopoverPrimitive.Root
  >

type PopoverTriggerProps =
  React.ComponentProps<
    typeof PopoverPrimitive.Trigger
  >

type PopoverContentProps =
  React.ComponentProps<
    typeof PopoverPrimitive.Content
  > & {
    portal?: boolean
  }

type PopoverAnchorProps =
  React.ComponentProps<
    typeof PopoverPrimitive.Anchor
  >

export function Popover(
  props: PopoverProps
) {

  return (

    <PopoverPrimitive.Root
      data-slot="popover"
      {...props}
    />

  )

}

export function PopoverTrigger({
  className,
  ...props
}: PopoverTriggerProps) {

  return (

    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      className={className}
      {...props}
    />

  )

}

export function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  portal = true,
  ...props
}: PopoverContentProps) {

  const content = (

    <PopoverPrimitive.Content
      // Se renderiza vía Portal fuera del árbol del overlay/scroll,
      // así que necesita su propio marcador para que useDragScroll
      // no le cancele los clicks después de un scroll horizontal.
      data-drag-scroll-ignore
      align={align}
      sideOffset={sideOffset}
      onOpenAutoFocus={event => {
        event.preventDefault()
      }}
      onCloseAutoFocus={event => {
        event.preventDefault()
      }}
      onWheel={event => {

        const element =
          event.currentTarget

        const isScrollable =
          element.scrollHeight >
          element.clientHeight

        if (isScrollable) {
          event.stopPropagation()
        }

      }}
      onTouchMove={event => {

        // El popover sale por Portal directo a document.body, como
        // hermano del Dialog (no descendiente). El scroll-lock que
        // Radix Dialog instala globalmente sobre "touchmove" no lo
        // reconoce como parte del árbol permitido y le hace
        // preventDefault, dejando el contenido sin poder scrollear
        // con el dedo en mobile. Cortamos la propagación acá —igual
        // que ya se hace arriba con "wheel"— antes de que el evento
        // llegue al listener global, así el scroll táctil interno
        // funciona con normalidad cuando hay contenido de sobra.
        const element =
          event.currentTarget

        const isScrollable =
          element.scrollHeight >
          element.clientHeight

        if (isScrollable) {
          event.stopPropagation()
        }

      }}
      className={cn(
        "z-40",
        "pointer-events-auto",
        "flex",
        "flex-col",
        "gap-2.5",
        "rounded-xl",
        "bg-popover",
        "p-2.5",
        "text-sm",
        "shadow-xl",
        "outline-none",
        className
      )}
      {...props}
    />

  )

  if (!portal) {
    return content
  }

  return (

    <PopoverPrimitive.Portal>
      {content}
    </PopoverPrimitive.Portal>

  )

}
export function PopoverAnchor(
  props: PopoverAnchorProps
) {

  return (

    <PopoverPrimitive.Anchor
      data-slot="popover-anchor"
      {...props}
    />

  )

}

export function PopoverHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {

  return (

    <div
      data-slot="popover-header"
      className={cn(
        "flex flex-col gap-0.5 text-sm",
        className
      )}
      {...props}
    />

  )

}

export function PopoverTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {

  return (

    <h2
      data-slot="popover-title"
      className={cn(
        "font-medium",
        className
      )}
      {...props}
    />

  )

}

export function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {

  return (

    <p
      data-slot="popover-description"
      className={cn(
        "text-muted-foreground",
        className
      )}
      {...props}
    />

  )

}

export {
  PopoverPrimitive,
}