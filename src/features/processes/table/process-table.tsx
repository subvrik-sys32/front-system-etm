"use client"

import {
  useMemo,
} from "react"

import {
  useHydrated,
} from "@/shared/hooks/use-hydrated"

import {
  useFocusedRow,
} from "@/shared/hooks/use-focused-row"

import {
  EntityTable,
  EntityOverlayRow,
  EntityTableContent,
} from "@/shared/ui/entity-table"

import {
  EntityTableLoading,
} from "@/shared/ui/entity-table/entity-table-loading"

import {
  EntityDnDContext,
} from "@/shared/ui/entity-table/features/dnd/entity-dnd-context"

import {
  EntitySortableRow,
} from "@/shared/ui/entity-table/features/dnd/entity-sortable-row"

import {
  useEntityExpand,
} from "@/shared/ui/entity-table/features/expansion"

import {
  useFilterStore,
} from "@/shared/filter/store/filter-store"

import {
  filterProcess,
} from "@/shared/filter/selectors/filter-process"

import {
  processAccess,
} from "../access/process-access"

import {
  buildProcessColumns,
} from "./build-process-columns"

import {
  ProcessExpandedRow,
} from "../components/expanded-row/process-expanded-row"

import {
  useProcessDnD,
} from "../hooks/use-process-dnd"

import {
  useProcessSearch,
} from "../hooks/use-process-search"

import type {
  ProcessDefinition,
  ProcessTask,
} from "../types/process.types"

type Props={
  processDefinition:ProcessDefinition
  processTasks:ProcessTask[]
  search:string
  loading:boolean
  focusedTaskId?:string
  showHistory:boolean
}

export function ProcessTable({
  processDefinition,
  processTasks,
  search,
  loading,
  focusedTaskId,
  showHistory,
}:Props){

  const hydrated=
    useHydrated()

  const columns=
    useMemo(
      ()=>buildProcessColumns(),
      [],
    )

  const expand=
    useEntityExpand()

  useFocusedRow({
    focusedId:focusedTaskId,
    setExpandedRowId:expand.setExpandedRowId,
  })

  const filteredTasks=
    useProcessSearch(
      processTasks,
      search,
    )

  const processFilters=
    useFilterStore(
      state=>state.filters.processes,
    )

  const visibleTasks=
    useMemo(
      ()=>filterProcess({
        processTasks:filteredTasks,
        filters:processFilters,
      }),
      [
        filteredTasks,
        processFilters,
      ],
    )

  const completedTasks=
    useMemo(
      ()=>visibleTasks.filter(
        task=>
          task.workflowStep?.status==="REVIEWED",
      ),
      [
        visibleTasks,
      ],
    )

  const activeTasks=
    useMemo(
      ()=>visibleTasks.filter(
        task=>
          task.workflowStep?.status!=="REVIEWED",
      ),
      [
        visibleTasks,
      ],
    )

  const displayedTasks=
    useMemo(
      ()=>showHistory
        ?[
            ...completedTasks,
            ...activeTasks,
          ]
        :activeTasks,
      [
        showHistory,
        completedTasks,
        activeTasks,
      ],
    )

  const{
    activeTask,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  }=useProcessDnD({
    processTasks:displayedTasks,
  })

  const templateColumns=
    useMemo(
      ()=>columns
        .map(column=>column.width)
        .join(" "),
      [
        columns,
      ],
    )

  const ids=
    useMemo(
      ()=>displayedTasks.map(
        task=>processAccess.task(task).id,
      ),
      [
        displayedTasks,
      ],
    )

  if(!hydrated||loading){

    return(

      <EntityTableLoading
        label="Cargando procesos..."
      />

    )

  }

  return(

    <EntityDnDContext
      ids={ids}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      overlay={
        activeTask&&(
          <EntityOverlayRow
            templateColumns={templateColumns}
          >
            <EntityTableContent
              item={activeTask}
              rowIndex={0}
              columns={columns}
              isExpanded={false}
              toggleExpanded={()=>{}}
              mode="overlay"
            />
          </EntityOverlayRow>
        )
      }
    >

      <EntityTable
        data={displayedTasks}
        columns={columns}
        rowId={item=>processAccess.task(item).id}
        expandedRowId={expand.expandedRowId}
        onExpandedRowChange={expand.setExpandedRowId}
        renderExpandedRow={item=>(
          <ProcessExpandedRow
            processTask={item}
          />
        )}
        renderRow={(
          item,
          content,
          templateColumns,
        )=>(
          <EntitySortableRow
            id={processAccess.task(item).id}
            templateColumns={templateColumns}
          >
            {content}
          </EntitySortableRow>
        )}
        emptyMessage={`Sin tareas en ${processDefinition.label}`}
      />

    </EntityDnDContext>

  )

}