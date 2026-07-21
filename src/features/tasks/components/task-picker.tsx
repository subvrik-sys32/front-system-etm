"use client"

import {
  useMemo,
  useRef,
  useState,
} from "react"

import {
  Check,
  Search,
} from "lucide-react"

import {
  cn,
} from "@/shared/utils/utils"

import {
  useResponsive,
} from "@/shared/responsive/hooks/use-responsive"

import {
  Input,
} from "@/components/ui/input"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  DynamicBadge,
} from "@/shared/ui/badge/dynamic-badge"

import {
  VerticalScroll,
} from "@/shared/ui/vertical-scroll/vertical-scroll"

import {
  useTasks,
} from "@/features/tasks/hooks/use-tasks"

type Props = {
  projectId: string
  value: string
  onChange: (value: string) => void
}

export function TaskPicker({
  projectId,
  value,
  onChange,
}: Props) {

  const [
    open,
    setOpen,
  ] = useState(false)

  const [
    query,
    setQuery,
  ] = useState("")

  const {
    isMobile,
    isCompact,
  } = useResponsive()

  const inputRef =
    useRef<HTMLInputElement>(null)

  const {
    tasks,
  } = useTasks()

  const tasksForProject =
    useMemo(
      () =>
        tasks.filter(
          task =>
            task.project.id === projectId,
        ),
      [
        tasks,
        projectId,
      ],
    )

  const selected =
    useMemo(
      () =>
        tasksForProject.find(
          task =>
            task.id === value,
        ),
      [
        tasksForProject,
        value,
      ],
    )

  const filteredTasks =
    useMemo(() => {

      const search =
        query
          .trim()
          .toLowerCase()

      if (!search) {
        return tasksForProject
      }

      return tasksForProject.filter(
        task =>

          [

            String(task.taskNumber),

            task.reference,

          ].some(
            text =>

              text
                .toLowerCase()
                .includes(search),
          ),
      )

    }, [
      tasksForProject,
      query,
    ])

  const sortedTasks =
    useMemo(() => {

      if (!value) {

        return filteredTasks

      }

      const selectedIndex =
        filteredTasks.findIndex(
          task =>
            task.id === value,
        )

      if (selectedIndex < 0) {

        return filteredTasks

      }

      const selectedTask =
        filteredTasks[
          selectedIndex
        ]

      return [

        selectedTask,

        ...filteredTasks.slice(
          0,
          selectedIndex,
        ),

        ...filteredTasks.slice(
          selectedIndex + 1,
        ),

      ]

    }, [
      filteredTasks,
      value,
    ])

  return (

    <Popover
      open={open}
      onOpenChange={nextOpen => {

        setOpen(nextOpen)

        if (!nextOpen) {

          return

        }

        setQuery("")

        if (isCompact) {
          return
        }

        // Autofoco solo en desktop/laptop — en mobile y tablet
        // abriría el teclado automáticamente apenas se muestra
        // el popover, sin que el usuario haya tocado el campo.
        requestAnimationFrame(
          () => inputRef.current?.focus(),
        )

      }}
    >

      <PopoverTrigger asChild>

        <button
          type="button"
          className="outline-none"
        >

          <DynamicBadge
            label={

              selected

                ? `#${String(selected.taskNumber).padStart(3, "0")} · ${selected.reference}`

                : "Sin tarea puntual"

            }
            color="#64748B"
            icon="circle"
            width="project"
            showChevron
            chevronOpen={open}
          />

        </button>

      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "rounded-2xl bg-[#101012] p-4 shadow-2xl",
          isMobile
            ? "w-[calc(100vw-2rem)] max-w-none"
            : "w-140",
        )}
      >

        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">

          <Search
            size={15}
            className="text-neutral-500"
          />

          <Input
            ref={inputRef}
            value={query}
            onChange={event =>
              setQuery(
                event.target.value,
              )
            }
            placeholder="Buscar tarea..."
            className="border-0 bg-transparent shadow-none"
          />

        </div>

        <VerticalScroll className="pr-2">

          <div className="space-y-3">

            {!query.trim() && (

              <button
                type="button"
                onClick={() => {

                  onChange("")

                  setQuery("")

                  setOpen(false)

                }}
                className={cn(
                  "w-full rounded-2xl p-4 text-left transition-all",
                  !value
                    ? "bg-white/[0.07] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_30px_rgba(0,0,0,0.25)]"
                    : "bg-white/3 hover:bg-white/5",
                )}
              >

                <div className="flex items-center justify-between gap-4">

                  <p className="text-sm font-bold text-neutral-100">

                    Sin tarea puntual

                  </p>

                  {!value && (

                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">

                      <Check
                        size={13}
                        className="text-white"
                      />

                    </div>

                  )}

                </div>

              </button>

            )}

            {filteredTasks.length === 0 && (

              <div className="py-8 text-center text-sm text-neutral-500">

                No se encontraron tareas

              </div>

            )}

            {sortedTasks.map(task => {

              const isSelected =
                task.id === value

              return (

                <button
                  key={task.id}
                  type="button"
                  onClick={() => {

                    onChange(task.id)

                    setQuery("")

                    setOpen(false)

                  }}
                  className={cn(
                    "w-full rounded-2xl p-4 text-left transition-all",
                    isSelected
                      ? "bg-white/[0.07] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_30px_rgba(0,0,0,0.25)]"
                      : "bg-white/3 hover:bg-white/5",
                  )}
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-bold text-neutral-100">

                        #
                        {String(task.taskNumber).padStart(3, "0")}

                      </p>

                      <p
                        title={task.reference}
                        className="mt-1 truncate text-xs text-neutral-500"
                      >

                        {task.reference}

                      </p>

                    </div>

                    {isSelected && (

                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">

                        <Check
                          size={13}
                          className="text-white"
                        />

                      </div>

                    )}

                  </div>

                </button>

              )

            })}

          </div>

        </VerticalScroll>

      </PopoverContent>

    </Popover>

  )

}