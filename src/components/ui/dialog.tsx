"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

import { X } from "lucide-react"

import { cn } from "@/shared/utils/utils"

type DialogProps =
  React.ComponentProps<
    typeof DialogPrimitive.Root
  >

type DialogTriggerProps =
  React.ComponentProps<
    typeof DialogPrimitive.Trigger
  >

type DialogCloseProps =
  React.ComponentProps<
    typeof DialogPrimitive.Close
  >

type DialogPortalProps =
  React.ComponentProps<
    typeof DialogPrimitive.Portal
  >

type DialogOverlayProps =
  React.ComponentProps<
    typeof DialogPrimitive.Overlay
  >

type DialogContentProps =
  React.ComponentProps<
    typeof DialogPrimitive.Content
  > & {
    showCloseButton?: boolean
  }

export function Dialog(
  props: DialogProps
) {

  return (
    <DialogPrimitive.Root
      {...props}
    />
  )

}

export function DialogTrigger(
  props: DialogTriggerProps
) {

  return (
    <DialogPrimitive.Trigger
      {...props}
    />
  )

}

export function DialogClose(
  props: DialogCloseProps
) {

  return (
    <DialogPrimitive.Close
      {...props}
    />
  )

}

export function DialogPortal(
  props: DialogPortalProps
) {

  return (
    <DialogPrimitive.Portal
      {...props}
    />
  )

}

export function DialogOverlay({
  className,
  ...props
}: DialogOverlayProps) {

  return (

    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50",
        "bg-black/50",
        "backdrop-blur-sm",
        className
      )}
      {...props}
    />

  )

}

export function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps) {

  return (

    <DialogPortal>

      <DialogOverlay />

      <DialogPrimitive.Content
        onWheel={event=>
          event.stopPropagation()
        }
        className={cn(
          "fixed",
          "left-1/2",
          "top-1/2",
          "z-60",
          "w-full",
          "max-w-lg",
          "max-h-[90vh]",
          "-translate-x-1/2",
          "-translate-y-1/2",
          "overflow-y-auto",
          "overscroll-contain",
          "rounded-2xl",
          "border",
          "border-white/10",
          "bg-[#101012]",
          "p-6",
          "shadow-2xl",
          "outline-none",
          className
        )}
      >

        {children}

        {showCloseButton && (

          <DialogClose
            className={cn(
              "absolute",
              "right-3",
              "top-3",
              "flex",
              "h-7",
              "w-7",
              "items-center",
              "justify-center",
              "rounded-lg",
              "text-neutral-400",
              "transition-colors",
              "hover:bg-white/5",
              "hover:text-white"
            )}
          >

            <X size={16} />

          </DialogClose>

        )}

      </DialogPrimitive.Content>

    </DialogPortal>

  )

}

export function DialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {

  return (

    <div
      className={cn(
        "flex flex-col gap-2",
        className
      )}
      {...props}
    />

  )

}

type DialogFooterProps =
  React.ComponentProps<"div">

export function DialogFooter({
  className,
  children,
  ...props
}: DialogFooterProps) {

  return (

    <div
      className={cn(
        "mt-6",
        "flex",
        "justify-end",
        "gap-2",
        className
      )}
      {...props}
    >

      {children}

    </div>

  )

}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<
  typeof DialogPrimitive.Title
>) {

  return (

    <DialogPrimitive.Title
      className={cn(
        "text-lg",
        "font-semibold",
        "text-white",
        className
      )}
      {...props}
    />

  )

}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<
  typeof DialogPrimitive.Description
>) {

  return (

    <DialogPrimitive.Description
      className={cn(
        "text-sm",
        "text-neutral-400",
        className
      )}
      {...props}
    />

  )

}