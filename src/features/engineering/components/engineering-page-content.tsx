"use client"

import { useMemo, useState } from "react"
import { useFocusedRow } from "@/shared/hooks/use-focused-row"
import { useFocusSettleStore } from "@/shared/focus/store/focus-settle-store"
import { useQueryClient } from "@tanstack/react-query"

import { AppListScroll } from "@/shared/ui/vertical-scroll/app-list-scroll"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { usePageToolbar } from "@/shared/responsive/navigation/hooks/use-page-toolbar"
import { cn } from "@/shared/utils/utils"

import { ContextPicker } from "@/features/tasks/components/context-picker"
import { useUsersDirectory } from "@/features/users/hooks/use-users-directory"
import type { User } from "@/features/users/types/user.types"

import { useEngineeringTasks } from "../hooks/use-engineering-tasks"
import { useEngineeringViewStore } from "../store/engineering-view-store"
import { isEngineeringUser } from "../utils/is-engineering-user"
import type { EngineeringProcessCode } from "../constants/engineering-process-definitions"
import type { EngineeringTask } from "../types/engineering-task.types"

import { EngineeringViewToggle } from "./engineering-view-toggle"
import { EngineeringProcessBoard } from "./engineering-process-board"
import { EngineeringUserList } from "./engineering-user-list"
import { EngineeringTaskDialog } from "./engineering-task-dialog"

function EntryCountBadge({
  count,
  compact = false,
}: {
  count: number
  compact?: boolean
}) {
  if (compact) {
    return (
      <div
        className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/5 px-2 text-xs font-semibold tabular-nums text-muted-foreground"
        title={`${count} ${count === 1 ? "tarea" : "tareas"}`}
      >
        {count}
      </div>
    )
  }
  return (
    <div className="flex h-9 min-w-28 items-center justify-center rounded-xl bg-foreground/5 px-3 text-sm font-medium text-muted-foreground">
      {count} {count === 1 ? "tarea" : "tareas"}
    </div>
  )
}

type PageProps = {
  focusedTaskId?: string
  focusToken?: string
}

export function EngineeringPageContent({
  focusedTaskId,
  focusToken,
}: PageProps = {}) {

  const queryClient = useQueryClient()
  const viewMode = useEngineeringViewStore(s => s.viewMode)

  const { users } = useUsersDirectory()
  const [projectId, setProjectId] = useState("")

  // Dialog state (create/edit from board, list, FAB)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<EngineeringTask | null>(null)
  const [defaultProcess, setDefaultProcess] = useState<
    EngineeringProcessCode | undefined
  >()
  const [defaultAssigneeId, setDefaultAssigneeId] = useState<
    string | undefined
  >()
  const [lockProcess, setLockProcess] = useState(false)
  const [lockAssignee, setLockAssignee] = useState(false)

  const filters = useMemo(
    () => (projectId ? { projectId } : {}),
    [projectId],
  )
  const { tasks, loading } = useEngineeringTasks(filters)

  const [focusedExpandedId, setFocusedExpandedId] = useState<string | null>(null)
  const markSettled = useFocusSettleStore(s => s.markSettled)
  useFocusedRow({
    focusedId: focusedTaskId,
    expandedRowId: focusedExpandedId,
    setExpandedRowId: setFocusedExpandedId,
    focusToken,
    onSettled: () => {
      if (focusToken) markSettled(focusToken)
    },
  })

  const listUsers = useMemo(
    () => (users as User[]).filter(isEngineeringUser),
    [users],
  )

  function openCreate(opts?: {
    processCode?: EngineeringProcessCode
    assigneeId?: string
  }) {
    setEditingTask(null)
    setDefaultProcess(opts?.processCode)
    setDefaultAssigneeId(opts?.assigneeId)
    setLockProcess(!!opts?.processCode)
    setLockAssignee(!!opts?.assigneeId)
    setDialogOpen(true)
  }

  function openEdit(task: EngineeringTask) {
    setEditingTask(task)
    setDefaultProcess(undefined)
    setDefaultAssigneeId(undefined)
    setLockProcess(false)
    setLockAssignee(false)
    setDialogOpen(true)
  }

  const { isMobile, isCompact } = useResponsive()

  // Igual bitácora: móvil/compact → TopBar sin toggle; toggle en el scroll.
  usePageToolbar(isMobile || isCompact ? null : <EngineeringViewToggle />)

  const body = (
    <div className="flex w-full flex-col gap-2 select-none">
      {/* Móvil: misma jerarquía que Bitácora (Producción | Ingeniería | Equipo) */}
      {(isMobile || isCompact) && (
        <div className="mt-2 mb-2 shrink-0">
          <EngineeringViewToggle compact fullWidth />
        </div>
      )}

      {/* Picker + contador */}
      <div className="mb-3 flex min-w-0 shrink-0 items-center gap-2 tablet:hidden">
        <div className="min-w-0 flex-1 overflow-hidden">
          <ContextPicker
            mode="projects"
            value={{ projectId, taskId: "" }}
            onChange={v => setProjectId(v.projectId)}
          />
        </div>
        <EntryCountBadge count={tasks.length} compact />
      </div>

      <div className="mb-3 hidden shrink-0 tablet:grid tablet:grid-cols-[1fr_auto_1fr] tablet:items-center tablet:gap-4">
        <div />
        <div className="min-w-0 max-w-md justify-self-center">
          <ContextPicker
            mode="projects"
            value={{ projectId, taskId: "" }}
            onChange={v => setProjectId(v.projectId)}
          />
        </div>
        <div className="flex items-center justify-end gap-2 justify-self-end">
          <EntryCountBadge count={tasks.length} />
        </div>
      </div>

      {viewMode === "processes" ? (
        <div className="flex w-full flex-col max-md:mt-2">
          <EngineeringProcessBoard
            focusedTaskId={focusedTaskId}
            tasks={tasks}
            loading={loading}
            onCreateInProcess={code => openCreate({ processCode: code })}
            onEditTask={openEdit}
          />
        </div>
      ) : (
        <div className="flex w-full flex-col max-md:mt-2">
          <EngineeringUserList
            users={listUsers}
            tasks={tasks}
            loading={loading}
            onEditTask={openEdit}
            onCreateForUser={userId => openCreate({ assigneeId: userId })}
          />
        </div>
      )}
    </div>
  )

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col select-none">
      <AppListScroll>
        {body}
      </AppListScroll>


      <EngineeringTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        task={editingTask}
        defaultProcessCode={defaultProcess}
        defaultProjectId={projectId || undefined}
        defaultAssigneeId={defaultAssigneeId}
        lockProcess={lockProcess}
        lockAssignee={lockAssignee}
      />
    </div>
  )
}
