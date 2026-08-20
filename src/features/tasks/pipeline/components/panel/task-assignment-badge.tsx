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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { WorkflowStep } from "@/features/workflow/types/workflow.types"
import type { User } from "@/features/users/types/user.types"

type Props = {
  step: WorkflowStep
  onUnsummon: (stepId: string) => void
  unsummoning?: boolean
  /** Solo icono + chevron (cabecera de asignado ya muestra el nombre). */
  iconOnly?: boolean
}

const itemClass =
  "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-foreground/10 hover:text-foreground focus:bg-foreground/10 focus:text-foreground"

const dangerItemClass =
  "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-500/10 hover:text-red-600 focus:bg-red-500/10 focus:text-red-600 dark:text-red-400 dark:hover:bg-red-500/20 dark:hover:text-red-400 dark:focus:bg-red-500/20 dark:focus:text-red-400"

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
      // interceptor global
    }
  }

  const tone = invited
    ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
    : "bg-emerald-500/22 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"

  const StatusIcon = invited ? Clock3 : UserCheck

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        sideOffset={4}
        onClick={e => e.stopPropagation()}
        onPointerDownOutside={(e) => {
          e.preventDefault()
          setOpen(false)
        }}
        onCloseAutoFocus={e => e.preventDefault()}
        className="z-50 min-w-36 rounded-xl border-0 bg-popover p-1 text-popover-foreground shadow-xl"
      >
        {!invited && candidates.length > 0 && (
          <>
            <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Cambiar operario
            </div>
            {candidates.map(user => (
              <DropdownMenuItem
                key={user.id}
                onSelect={() => void handleReassign(user)}
                className={itemClass}
              >
                <UserRoundCog size={13} className="shrink-0" />
                <span className="truncate">{user.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1 h-px bg-foreground/10" />
          </>
        )}

        <DropdownMenuItem
          onSelect={() => onUnsummon(step.id)}
          className={dangerItemClass}
        >
          <X size={13} className="shrink-0" />
          {invited ? "Cancelar invitación" : "Desconvocar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}