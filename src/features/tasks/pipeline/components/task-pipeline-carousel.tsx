"use client"

import type { ProcessCode, Task } from "@/features/tasks/types/task.types"

import { useSnapCarouselSync } from "@/shared/hooks/use-snap-carousel-sync"

import { PIPELINE_PROCESS_ORDER } from "../utils/process-columns"
import { TaskProcessColumn } from "../table/task-process-column"

type Props = {
  value: ProcessCode
  onChange: (code: ProcessCode) => void
  tasks: Task[]
  columns: Map<ProcessCode, Task[]>
  expandedKey: string | null
  onToggleCard: (key: string) => void
  activeOverlayKey: string | null
  onOverlayOpenChange: (key: string, isOpen: boolean) => void
}

// Carrusel real para el CONTENIDO, no solo para el selector de
// arriba: las 6 columnas de proceso viven una al lado de la otra
// con scroll-snap, sincronizadas con "value" en ambas direcciones —
// swipear acá mueve el selector de arriba, y tocar el selector (o
// sus flechas) desliza esto. Antes el contenido solo se
// "reemplazaba" en el lugar cuando cambiaba activeProcess, sin
// ningún movimiento — el selector se sentía como un carrusel pero
// las cards de abajo pegaban un salto, no un solo gesto fluido.
//
// La sincronización (swipe -> avisa afuera, cambio externo -> se
// desliza solo) vive en useSnapCarouselSync, compartido con
// PipelineProcessSelector — antes esta misma lógica estaba copiada
// dos veces.
export function TaskPipelineCarousel({
  value,
  onChange,
  tasks,
  columns,
  expandedKey,
  onToggleCard,
  activeOverlayKey,
  onOverlayOpenChange,
}: Props) {

  const { containerRef } = useSnapCarouselSync({
    value,
    onChange,
    order: PIPELINE_PROCESS_ORDER,
  })

  return (

    <div
      ref={containerRef}
      className="hide-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-contain scroll-smooth"
    >

      {PIPELINE_PROCESS_ORDER.map(code => (

        <div
          key={code}
          className="w-full shrink-0 snap-center"
        >

          <TaskProcessColumn
            processCode={code}
            tasks={columns.get(code) ?? []}
            allTasks={tasks}
            expandedKey={expandedKey}
            onToggleCard={onToggleCard}
            activeOverlayKey={activeOverlayKey}
            onOverlayOpenChange={onOverlayOpenChange}
            contentOnly
          />

        </div>

      ))}

    </div>

  )

}