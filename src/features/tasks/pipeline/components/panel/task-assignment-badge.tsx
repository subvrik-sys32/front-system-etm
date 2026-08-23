"use client"

import { useMemo, useState } from "react"
import { UserCheck, Clock3, X, UserRoundCog, ChevronDown } from "lucide-react"
import { toast } from "sonner"

import { useUsersDirectory } from "@/features/users/hooks/use-users-directory"
import { useAreaOperators } from "@/features/areas/hooks/use-area-operators"
import { useWorkflowSummon } from "@/features/workflow/hooks/use-workflow-summon"
import { Spinner } from "@/shared/ui/spinner/spinner"
import { cn } from "@/shared/utils/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import type { WorkflowStep } from "@/features/workflow/types/workflow.types"
import type { User } from "@/features/users/types/user.types"

type Props = {
  step: WorkflowStep
  onUnsummon: (stepId: string) => void
  unsummoning?: boolean
  iconOnly?: boolean
}

const itemClass =
  "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-sm text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"

const dangerItemClass =
  "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/20 dark:hover:text-red-400"

/**
 * Desktop: popover. Mobile: bottom sheet (contrato Popover del design system).
 */
export function TaskAssignmentBadge({
  step,
  onUnsummon,
  unsummoning,
  iconOnly = false,
}: Props) {
  const { users } = useUsersDirectory()
  const operators = useAreaOperators(step.processCode)
  const { reassign, reassigning } = useWorkflowSummon()
  const [open, setOpen] = useState(false)

  const invited = step.invitedOperatorId
    ? (users as User[]).find(u => u.id === step.invitedOperatorId)
    : null

  const assigned =
    !invited && step.assignedById
      ? (users as User[]).find(u => u.id === step.operatorId)
      : null

  const person = invited ?? assigned
  const busy = unsummoning || reassigning
  const currentId = person?.id

  const candidates = useMemo(
    () => operators.map(o => o.user).filter(u => u.id !== currentId),
    [operators, currentId],
  )

  if (!person) {
    return null
  }

  async function handleReassign(user: User) {
    try {
      await reassign({ stepId: step.id, operatorId: user.id })
      toast.success(`Reasignado a ${user.name}`)
      setOpen(false)
    } catch {
      toast.error("No se pudo reasignar")
    }
  }

  const tone = invited
    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
    : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"

  const StatusIcon = invited ? Clock3 : UserCheck

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={busy}
          aria-label="Opciones de asignación"
          onClick={e => e.stopPropagation()}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full text-xs font-medium transition-opacity",
            tone,
            busy && "pointer-events-none opacity-60",
            iconOnly
              ? "h-7 min-w-9 gap-0.5 px-2"
              : "h-7 gap-1.5 py-0 pl-2.5 pr-2",
          )}
        >
          {busy ? (
            <Spinner size={12} />
          ) : (
            <>
              <StatusIcon size={13} strokeWidth={2.25} className="block shrink-0" />
              {!iconOnly && (
                <span className="max-w-20 truncate leading-none">
                  {person.name}
                </span>
              )}
              <ChevronDown
                size={iconOnly ? 11 : 12}
                strokeWidth={2.5}
                className="block shrink-0 opacity-70"
              />
            </>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={4}
        floatingClassName="w-56"
        className="gap-0 p-1.5"
        onClick={e => e.stopPropagation()}
      >
        {!invited && candidates.length > 0 && (
          <>
            <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Cambiar operario
            </p>
            {candidates.map(user => (
              <button
                key={user.id}
                type="button"
                className={itemClass}
                onClick={() => void handleReassign(user)}
              >
                <UserRoundCog size={14} className="shrink-0" />
                <span className="truncate">{user.name}</span>
              </button>
            ))}
            <div className="my-1 h-px bg-foreground/10" />
          </>
        )}

        <button
          type="button"
          className={dangerItemClass}
          onClick={() => {
            onUnsummon(step.id)
            setOpen(false)
          }}
        >
          <X size={14} className="shrink-0" />
          {invited ? "Cancelar invitación" : "Desconvocar"}
        </button>
      </PopoverContent>
    </Popover>
  )
}
