"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import {
  cn,
} from "@/shared/utils/utils"

import {
  useResponsive,
} from "@/shared/responsive/hooks/use-responsive"

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

// Qué tan cerca del borde de la pantalla tiene que estar el
// trigger para considerarlo "no visible cómodamente" y disparar el
// autoscroll — 18% del alto de la ventana arriba y abajo.
const EDGE_MARGIN_RATIO = 0.18

export function PopoverTrigger({
  className,
  ...props
}: PopoverTriggerProps) {

  const { isMobile } = useResponsive()

  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {

    // Solo en mobile: en desktop el popover ya resuelve bien su
    // propia colisión con el viewport (avoidCollisions/flip) sin
    // necesitar mover la página del usuario.
    if (!isMobile) {
      return
    }

    const el = ref.current

    if (!el) {
      return
    }

    // Radix marca el trigger con data-state="open"|"closed" — lo
    // observamos en vez de necesitar que cada Select individual nos
    // avise, así esto queda centralizado acá y aplica a cualquier
    // popover/select que use este componente (UserSelect, RoleSelect,
    // EntitySelect, etc.) sin tocarlos uno por uno.
    const observer = new MutationObserver(() => {

      if (el.getAttribute("data-state") !== "open") {
        return
      }

      const rect = el.getBoundingClientRect()
      const margin = window.innerHeight * EDGE_MARGIN_RATIO

      const comfortablyVisible =
        rect.top > margin &&
        rect.bottom < window.innerHeight - margin

      // Si ya está cómodo en pantalla, no lo movemos — el
      // autoscroll es solo para cuando el trigger quedó pegado a
      // un borde (o directamente afuera) y el popover que se abre
      // corre riesgo de quedar cortado.
      if (comfortablyVisible) {
        return
      }

      // requestAnimationFrame: dejamos que el popover ya haya
      // empezado a posicionarse antes de scrollear, para que el
      // navegador calcule bien cuánto hace falta mover.
      requestAnimationFrame(() => {

        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })

      })

    })

    observer.observe(el, {
      attributes: true,
      attributeFilter: ["data-state"],
    })

    return () => observer.disconnect()

  }, [isMobile])

  return (

    <PopoverPrimitive.Trigger
      ref={ref}
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