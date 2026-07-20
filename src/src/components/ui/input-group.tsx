"use client"

import * as React from "react"

import { cn } from "@/shared/utils/utils"

type InputGroupProps =
  React.ComponentProps<"div">

export function InputGroup({
  className,
  ...props
}: InputGroupProps) {

  return (

    <div
      role="group"
      className={cn(
        "flex",
        "w-full",
        "items-center",
        "rounded-xl",
        "border border-white/10",
        "bg-[#101012]",
        "transition-colors",
        "focus-within:border-white/20",
        className
      )}
      {...props}
    />

  )

}