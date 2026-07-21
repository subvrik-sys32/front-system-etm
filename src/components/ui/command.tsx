"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"

import { Search } from "lucide-react"

import { cn } from "@/shared/utils/utils"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type CommandProps=
  React.ComponentProps<
    typeof CommandPrimitive
  >

type CommandDialogProps=
  React.ComponentProps<
    typeof Dialog
  > & {
    title?:string
    description?:string
    showCloseButton?:boolean
  }

type CommandInputProps=
  React.ComponentProps<
    typeof CommandPrimitive.Input
  >

type CommandListProps=
  React.ComponentProps<
    typeof CommandPrimitive.List
  >

type CommandEmptyProps=
  React.ComponentProps<
    typeof CommandPrimitive.Empty
  >

type CommandGroupProps=
  React.ComponentProps<
    typeof CommandPrimitive.Group
  >

type CommandSeparatorProps=
  React.ComponentProps<
    typeof CommandPrimitive.Separator
  >

type CommandItemProps=
  React.ComponentProps<
    typeof CommandPrimitive.Item
  >

export function Command({
  className,
  ...props
}:CommandProps){

  return(

    <CommandPrimitive
      className={cn(
        "flex flex-col overflow-hidden rounded-xl text-white",
        className
      )}
      {...props}
    />

  )

}

export function CommandDialog({
  title="Buscar",
  description="",
  children,
  showCloseButton=false,
  ...props
}:CommandDialogProps){

  return(

    <Dialog {...props}>

      <DialogContent
        className="overflow-hidden p-0"
        showCloseButton={showCloseButton}
      >

        <DialogHeader className="sr-only">

          <DialogTitle>
            {title}
          </DialogTitle>

          <DialogDescription>
            {description}
          </DialogDescription>

        </DialogHeader>

        {children}

      </DialogContent>

    </Dialog>

  )

}

export function CommandInput({
  className,
  ...props
}:CommandInputProps){

  return(

    <div className="flex items-center gap-2 px-3 py-3">

      <Search
        size={15}
        className="text-neutral-500"
      />

      <CommandPrimitive.Input
        className={cn(
          "flex-1 bg-transparent text-sm text-neutral-300 outline-none placeholder:text-neutral-600",
          className
        )}
        {...props}
      />

    </div>

  )

}

const COMMAND_LIST_FADE_SIZE = 9

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T) => {
    refs.forEach(ref => {
      if (!ref) return
      if (typeof ref === "function") {
        ref(node)
      } else {
        (ref as React.MutableRefObject<T | null>).current = node
      }
    })
  }
}

// Igual que en VerticalScroll: el fade sólo aparece del lado en el
// que todavía hay contenido para scrollear. Si un lado ya llegó al
// final, ese borde queda sólido (sin recorte).
function getCommandListMaskImage(canScrollUp: boolean, canScrollDown: boolean) {

  if (canScrollUp && canScrollDown) {
    return `linear-gradient(to bottom, transparent 0, black ${COMMAND_LIST_FADE_SIZE}px, black calc(100% - ${COMMAND_LIST_FADE_SIZE}px), transparent 100%)`
  }

  if (canScrollUp) {
    return `linear-gradient(to bottom, transparent 0, black ${COMMAND_LIST_FADE_SIZE}px, black 100%)`
  }

  if (canScrollDown) {
    return `linear-gradient(to bottom, black 0, black calc(100% - ${COMMAND_LIST_FADE_SIZE}px), transparent 100%)`
  }

  return "none"

}

export const CommandList =
  React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.List>,
    CommandListProps
  >(
    (
      {
        className,
        style,
        ...props
      },
      ref
    ) => {

      const innerRef = useRef<HTMLDivElement>(null)

      const [canScrollUp, setCanScrollUp] = useState(false)
      const [canScrollDown, setCanScrollDown] = useState(false)

      const updateArrows = useCallback(() => {
        const el = innerRef.current
        if (!el) return
        setCanScrollUp(el.scrollTop > 4)
        setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4)
      }, [])

      useEffect(() => {
        const el = innerRef.current
        if (!el) return

        updateArrows()

        el.addEventListener("scroll", updateArrows, { passive: true })
        const observer = new ResizeObserver(updateArrows)
        observer.observe(el)

        return () => {
          el.removeEventListener("scroll", updateArrows)
          observer.disconnect()
        }
      }, [updateArrows])

      const maskImage = useMemo(
        () => getCommandListMaskImage(canScrollUp, canScrollDown),
        [canScrollUp, canScrollDown]
      )

      return (

        <div className="relative overflow-hidden rounded-xl">

          <button
            type="button"
            onClick={() => innerRef.current?.scrollBy({ top: -120, behavior: "smooth" })}
            aria-label="Desplazar arriba"
            tabIndex={-1}
            className={cn(
              "absolute left-1/2 top-1 z-20 -translate-x-1/2",
              "flex h-6 w-8 items-center justify-center rounded-full",
              "bg-[#18181b]/80 backdrop-blur-xl text-neutral-200 transition-opacity duration-200",
              canScrollUp ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <ChevronUp size={14} strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={() => innerRef.current?.scrollBy({ top: 120, behavior: "smooth" })}
            aria-label="Desplazar abajo"
            tabIndex={-1}
            className={cn(
              "absolute bottom-1 left-1/2 z-20 -translate-x-1/2",
              "flex h-6 w-8 items-center justify-center rounded-full",
              "bg-[#18181b]/80 backdrop-blur-xl text-neutral-200 transition-opacity duration-200",
              canScrollDown ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <ChevronDown size={14} strokeWidth={2.5} />
          </button>

          <CommandPrimitive.List
            ref={mergeRefs(ref, innerRef)}
            style={{
              ...style,
              WebkitMaskImage: maskImage,
              maskImage: maskImage,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
            }}
            className={cn(
              "hide-scrollbar outline-none",
              className
            )}
            {...props}
          />

        </div>

      )

    }
  )

CommandList.displayName =
  CommandPrimitive.List.displayName

export function CommandEmpty({
  className,
  ...props
}:CommandEmptyProps){

  return(

    <CommandPrimitive.Empty
      className={cn(
        "py-6 text-center text-sm text-neutral-500",
        className
      )}
      {...props}
    />

  )

}

export function CommandGroup({
  className,
  ...props
}:CommandGroupProps){

  return(

    <CommandPrimitive.Group
      className={cn(
        "p-0",
        className
      )}
      {...props}
    />

  )

}

export function CommandSeparator({
  className,
  ...props
}:CommandSeparatorProps){

  return(

    <CommandPrimitive.Separator
      className={cn(
        "h-px bg-white/10",
        className
      )}
      {...props}
    />

  )

}

export function CommandItem({
  className,
  children,
  ...props
}:CommandItemProps){

  return(

    <CommandPrimitive.Item
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors cursor-pointer",
        "hover:bg-white/5",
        "data-[disabled=true]:pointer-events-none",
        "data-[disabled=true]:opacity-40",
        className
      )}
      {...props}
    >

      {children}

    </CommandPrimitive.Item>

  )

}

export function CommandShortcut({
  className,
  ...props
}:React.ComponentProps<"span">){

  return(

    <span
      className={cn(
        "ml-auto text-xs text-neutral-500",
        className
      )}
      {...props}
    />

  )

}