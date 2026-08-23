"use client"

import type { ReactNode } from "react"
import { LayoutGrid, Layers, Info, SlidersHorizontal } from "lucide-react"

import {
  TOOL_SIDEBAR_CONTENT_FILL,
  TOOL_SIDEBAR_CONTENT_SCROLL,
  TOOL_SIDEBAR_INNER,
} from "@/shared/ui/tool-side-panel/chrome"
import {
  EntityExpandedToggle,
  type EntityExpandedToggleOption,
} from "@/shared/ui/entity-expanded-row/entity-expanded-toggle"

export type NestingPanelView =
  | "sheet-pieces"
  | "project-material"
  | "layers"
  | "inspector"

const PANEL_OPTIONS: EntityExpandedToggleOption<NestingPanelView>[] = [
  {
    value: "project-material",
    label: "Proyecto y Material",
    icon: SlidersHorizontal,
  },
  { value: "sheet-pieces", label: "Piezas", icon: LayoutGrid },
  { value: "layers", label: "Capas", icon: Layers },
  { value: "inspector", label: "Inspector", icon: Info },
]

export interface NestingPanelProps {
  activePanel: NestingPanelView
  onActivePanelChange: (v: NestingPanelView) => void
  pieces: ReactNode
  projectMaterial: ReactNode
  layers: ReactNode
  inspector: ReactNode
  footer?: ReactNode
}

/**
 * Panel lateral nesting.
 * Zona de contenido: min-h-0 + overflow-y-auto (única fuente de scroll).
 * Footer (Nestear) siempre visible fuera del scroller.
 */
export function NestingPanel({
  activePanel,
  onActivePanelChange,
  pieces,
  projectMaterial,
  layers,
  inspector,
  footer,
}: NestingPanelProps) {
  return (
    <div className={TOOL_SIDEBAR_INNER}>
      <EntityExpandedToggle
        value={activePanel}
        onChange={onActivePanelChange}
        options={PANEL_OPTIONS}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activePanel === "sheet-pieces" && (
          <div className={TOOL_SIDEBAR_CONTENT_FILL}>
            {pieces}
          </div>
        )}
        {activePanel === "project-material" && (
          <div className={TOOL_SIDEBAR_CONTENT_SCROLL}>
            {projectMaterial}
          </div>
        )}
        {activePanel === "layers" && (
          <div className={TOOL_SIDEBAR_CONTENT_SCROLL}>
            {layers}
          </div>
        )}
        {activePanel === "inspector" && (
          <div className={TOOL_SIDEBAR_CONTENT_SCROLL}>
            {inspector}
          </div>
        )}
      </div>

      {footer && <div className="mt-auto shrink-0 pt-1">{footer}</div>}
    </div>
  )
}