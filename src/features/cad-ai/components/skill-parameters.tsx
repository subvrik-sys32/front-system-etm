"use client"

import { useState } from "react"
import { SlidersHorizontal, ChevronDown, ChevronUp, Loader2, RefreshCw } from "lucide-react"
import { cn } from "@/shared/utils/utils"
import type { Skill } from "../types"

interface SkillParametersProps {
  skill: Skill
  params: Record<string, number | string>
  onParamsChange: (params: Record<string, number | string>) => void
  onRegenerate: () => void
  loading: boolean
}

const EASE = "duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
const CARD =
  `rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] transition-colors ${EASE}`
const FIELD_WRAP = "flex items-center gap-2 rounded-lg bg-foreground/5 px-3 py-2"

export function SkillParameters({ skill, params, onParamsChange, onRegenerate, loading }: SkillParametersProps) {
  const [expanded, setExpanded] = useState(true)

  const handleChange = (name: string, value: string) => {
    const num = parseFloat(value)
    onParamsChange({ ...params, [name]: isNaN(num) ? value : num })
  }

  if (skill.parameters.length === 0) return null

  return (
    <div className={cn("overflow-hidden", CARD)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex w-full items-center justify-between px-3 py-2.5 text-xs font-semibold text-foreground transition-colors ${EASE} hover:bg-foreground/[0.04]`}
      >
        <span className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Parámetros · {skill.name}
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-1 space-y-2">
          {skill.parameters.map(param => (
            <div key={param.name} className="flex items-center gap-2">
              <label className="flex-1 text-xs text-muted-foreground truncate" title={param.label}>
                {param.label}
                {param.unit && <span className="ml-0.5 opacity-60">({param.unit})</span>}
              </label>
              <div className={cn(FIELD_WRAP, "w-24 py-1.5")}>
                <input
                  type="number"
                  value={params[param.name] ?? ""}
                  onChange={e => handleChange(param.name, e.target.value)}
                  className="w-full bg-transparent text-xs text-right outline-none"
                />
              </div>
            </div>
          ))}
          <button
            onClick={onRegenerate}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium transition-colors ${EASE} hover:bg-primary/20 disabled:opacity-50`}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {loading ? "Regenerando..." : "Regenerar"}
          </button>
        </div>
      )}
    </div>
  )
}