import * as React from "react"

import {
  cva,
  type VariantProps,
} from "class-variance-authority"

import {
  cn,
} from "@/shared/utils/utils"

export const buttonVariants = cva(
  [
    "inline-flex",
    "items-center",
    "justify-center",

    "shrink-0",

    "rounded-lg",

    "border",
    "border-transparent",

    "font-medium",
    "whitespace-nowrap",

    "transition-colors",

    "outline-none",

    "select-none",

    "disabled:pointer-events-none",
    "disabled:opacity-50",
    
    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",

        outline:
          "border-border bg-background hover:bg-muted",

        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",

        ghost:
          "hover:bg-muted hover:text-foreground",

        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20",

        link:
          "border-none text-primary underline-offset-4 hover:underline",
      },

      size: {
        xs:
          "h-6 px-2 text-xs gap-1",

        sm:
          "h-7 px-2.5 text-sm gap-1.5",

        default:
          "h-8 px-3 text-sm gap-2",

        lg:
          "h-9 px-4 text-sm gap-2",

        icon:
          "h-8 w-8 p-0",

        "icon-xs":
          "h-6 w-6 p-0",

        "icon-sm":
          "h-7 w-7 p-0",

        "icon-lg":
          "h-9 w-9 p-0",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type ButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {

  return (

    <button
      type={type}
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
        }),
        className
      )}
      {...props}
    />

  )

}