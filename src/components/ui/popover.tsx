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
  side = "bottom",
  sideOffset = 4,
  avoidCollisions = false,
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
      side={side}
      sideOffset={sideOffset}
      // Sin esto, al achicarse el viewport por el teclado virtual
      // en mobile, Radix flippea el popover hacia arriba (side=top)
      // por falta de espacio debajo. Al cerrar el teclado, el
      // viewport vuelve a su tamaño pero la posición no siempre se
      // recalcula a tiempo (iOS no dispara resize estándar, solo
      // visualViewport), y el popover queda pegado arriba — se ve
      // como un salto brusco. Fijamos el lado siempre abajo; el
      // contenido ya tiene scroll interno propio si no entra entero.
      avoidCollisions={avoidCollisions}
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
        // con el dedo en mobile.
        //
        // A diferencia del "onWheel" de arriba, acá no podemos
        // chequear "isScrollable" sobre currentTarget: el scroll
        // real ocurre en un hijo interno (ej. CommandList con
        // overflow-y-auto), no en este wrapper — currentTarget es
        // siempre este nodo exterior, que no tiene overflow propio,
        // así que ese chequeo nunca daría true. Cortamos la
        // propagación siempre; no hay downside si no hay nada para
        // scrollear, simplemente no pasa nada.
        event.stopPropagation()

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