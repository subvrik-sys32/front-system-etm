"use client"

import { EntityListSkeleton } from "@/shared/ui/entity-table/entity-list-skeleton"

/**
 * Skeleton de segmento protected.
 * Las páginas client también usan `loading` de React Query en tablas.
 */
export default function ProtectedLoading() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background px-3 pt-0 pb-2 text-foreground select-none tablet:px-4 desktop:px-5 desktop:pt-1 desktop:pb-3">
      <header className="mb-1 hidden min-h-10 shrink-0 items-center gap-2 desktop:flex">
        <div className="h-7 w-28 rounded-md bg-foreground/10" />
        <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
        <div className="h-4 w-40 rounded bg-foreground/5" />
      </header>
      <section className="flex min-h-0 w-full flex-1 flex-col">
        <div className="mb-2 h-10 shrink-0 rounded-xl bg-foreground/5" />
        <EntityListSkeleton variant="task" rows={8} />
      </section>
    </div>
  )
}
