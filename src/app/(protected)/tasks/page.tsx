import { TaskActions } from "@/features/tasks/components/actions/task-actions"

import {
  TaskPageContent,
} from "@/features/tasks/components/task-page-content"

type Props={
  searchParams:Promise<{
    taskId?:string
  }>
}

export default async function TasksPage({
  searchParams,
}:Props){

  const {
    taskId,
  }=await searchParams

  return(

    <main className="h-full bg-[#050505] px-8 py-10 text-white">

      <section className="space-y-6">

        <header className="flex flex-wrap items-start justify-between gap-4">

          <div className="min-w-0">

            <h1 className="text-2xl font-bold tracking-widest">
              TAREAS
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Gestión de tareas y procesos
            </p>

          </div>

          <div className="shrink-0">

            <TaskActions />

          </div>

        </header>

        <TaskPageContent
          focusedTaskId={taskId}
        />

      </section>

    </main>

  )

}