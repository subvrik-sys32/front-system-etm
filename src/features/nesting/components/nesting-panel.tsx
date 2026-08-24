"use client"

import type { ReactNode } from "react"
import { LayoutGrid, Layers, Info, SlidersHorizontal } from "lucide-react"

import type { EntityExpandedToggleOption } from "@/shared/ui/entity-expanded-row/entity-expanded-toggle"
import { ToolSidebar } from "@/shared/ui/tool-side-panel"

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
  widthClassName?: string
  className?: string
}

export function NestingPanel({
  activePanel,
  onActivePanelChange,
  pieces,
  projectMaterial,
  layers,
  inspector,
  footer,
  widthClassName,
  className,
}: NestingPanelProps) {
  return (
    <ToolSidebar
      value={activePanel}
      onChange={onActivePanelChange}
      options={PANEL_OPTIONS}
      footer={footer}
      widthClassName={widthClassName}
      className={className}
      panels={[
        { value: "sheet-pieces", overflow: "fill", content: pieces },
        {
          value: "project-material",
          overflow: "scroll",
          content: projectMaterial,
        },
        { value: "layers", overflow: "scroll", content: layers },
        { value: "inspector", overflow: "scroll", content: inspector },
      ]}
    />
  )
}
