"use client"

import type { ReactNode } from "react"

import {
  EntityExpandedToggle,
  type EntityExpandedToggleOption,
} from "@/shared/ui/entity-expanded-row/entity-expanded-toggle"
import { cn } from "@/shared/utils/utils"
import {
  TOOL_SIDEBAR_ASIDE,
  TOOL_SIDEBAR_CONTENT_FILL,
  TOOL_SIDEBAR_CONTENT_SCROLL,
  TOOL_SIDEBAR_INNER,
} from "./chrome"

export type ToolSidebarPanel<T extends string> = {
  value: T
  content: ReactNode
  overflow?: "fill" | "scroll"
}

export type ToolSidebarProps<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: EntityExpandedToggleOption<T>[]
  panels: ToolSidebarPanel<T>[]
  footer?: ReactNode
  className?: string
  widthClassName?: string
}

/**
 * Única entidad UX de sidebar de herramienta.
 * Nesting y plantillas solo pasan options + content.
 */
export function ToolSidebar<T extends string>({
  value,
  onChange,
  options,
  panels,
  footer,
  className,
  widthClassName,
}: ToolSidebarProps<T>) {
  const active = panels.find(p => p.value === value) ?? panels[0]
  const overflow = active?.overflow ?? "scroll"

  return (
    <aside className={cn(TOOL_SIDEBAR_ASIDE, widthClassName, className)}>
      <div className={TOOL_SIDEBAR_INNER}>
        <EntityExpandedToggle
          value={value}
          onChange={onChange}
          options={options}
        />
        <div
          className={
            overflow === "fill"
              ? TOOL_SIDEBAR_CONTENT_FILL
              : TOOL_SIDEBAR_CONTENT_SCROLL
          }
        >
          {active?.content ?? null}
        </div>
        {footer ? (
          <div className="mt-auto w-full shrink-0 pt-1">{footer}</div>
        ) : null}
      </div>
    </aside>
  )
}
