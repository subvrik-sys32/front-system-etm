"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/shared/utils/utils"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root>
type DialogTriggerProps = React.ComponentProps<typeof DialogPrimitive.Trigger>
type DialogCloseProps = React.ComponentProps<typeof DialogPrimitive.Close>
type DialogPortalProps = React.ComponentProps<typeof DialogPrimitive.Portal>
type DialogOverlayProps = React.ComponentProps<typeof DialogPrimitive.Overlay>
type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  size?: "default" | "large"
}

export function Dialog({ onOpenChange, open, ...props }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  React.useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent("close-all-popovers"))
    }
  }, [isOpen])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  return <DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange} {...props} />
}

export function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger {...props} />
}

export function DialogClose(props: DialogCloseProps) {
  return <DialogPrimitive.Close {...props} />
}

export const DIALOG_CLOSE_BTN_CLASS =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"

export function DialogHeaderCloseButton({
  onClick,
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      title="Cerrar"
      aria-label="Cerrar"
      onClick={onClick}
      className={cn(DIALOG_CLOSE_BTN_CLASS, className)}
      {...props}
    >
      <X size={16} strokeWidth={2} />
    </button>
  )
}

export function DialogPortal(props: DialogPortalProps) {
  return <DialogPrimitive.Portal {...props} />
}

export function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm",
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
  size = "default",
  ...props
}: DialogContentProps) {
  const { isMobile } = useResponsive()
  const isFullscreenMobile = size === "large" && isMobile

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        onWheel={(event) => event.stopPropagation()}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
        }}
        className={cn(
          "fixed left-1/2 top-1/2 z-40 w-full max-w-lg max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden overscroll-contain rounded-2xl bg-popover p-6 shadow-xs outline-none select-none",
          className,
          // Móvil large: llena el body. resizes-content achica el body;
          // esta caja es h-full → el flex del consumidor (header / hilo / input) hace el resto.
          isFullscreenMobile && [
            "inset-0",
            "left-0",
            "right-0",
            "top-0",
            "bottom-0",
            "h-full",
            "w-full",
            "max-w-none",
            "max-h-none",
            "translate-x-0",
            "translate-y-0",
            "rounded-none",
            "border-0",
          ]
        )}
        {...props}
      >
        {children}

        {showCloseButton && (
          <DialogClose
            className={cn(
              "absolute right-3 top-3 z-10",
              DIALOG_CLOSE_BTN_CLASS,
              isFullscreenMobile && "h-9 w-9 bg-foreground/5"
            )}
          >
            <X size={isFullscreenMobile ? 18 : 16} strokeWidth={2} />
          </DialogClose>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />
}

export function DialogFooter({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("mt-6 flex justify-end gap-2", className)} {...props}>
      {children}
    </div>
  )
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-lg font-semibold text-foreground", className)} {...props} />
}

export function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-sm text-muted-foreground", className)} {...props} />
}