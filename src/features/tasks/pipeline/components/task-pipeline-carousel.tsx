"use client"

import type { RefObject } from "react"

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
  // Opcional: si el padre (TaskPipelineBoard) necesita acceso directo
  // al nodo scrolleable (ej. para espejar scroll en tiempo real con
  // el selector de arriba), le pasa su propio ref acá en vez de que
  // este componente cree uno interno sin que nadie más lo vea.
  containerRef?: RefObject<HTMLDivElement | null>
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
// La sincronización de ESTADO (swipe -> avisa afuera, cambio
// externo -> se desliza solo) vive en useSnapCarouselSync,
// compartida con PipelineProcessSelector. El espejado en TIEMPO
// REAL entre los dos carruseles (para que se muevan juntos al
// instante, no con el delay del debounce) vive en TaskPipelineBoard,
// que es quien tiene acceso a los refs de ambos.
export function TaskPipelineCarousel({
  value,
  onChange,
  tasks,
  columns,
  expandedKey,
  onToggleCard,
  activeOverlayKey,
  onOverlayOpenChange,
  containerRef: externalContainerRef,
}: Props) {

  const { containerRef } = useSnapCarouselSync({
    value,
    onChange,
    order: PIPELINE_PROCESS_ORDER,
    containerRef: externalContainerRef,
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
