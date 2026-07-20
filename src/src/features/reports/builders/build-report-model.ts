import type{
  ExportScope,
}from"@/shared/export"

import type{
  Task,
}from"@/features/tasks/types/task.types"

import type{
  ReportModel,
}from"../types/report-model.types"

import{
  buildKpis,
}from"./build-kpis"

import{
  buildOperatorReport,
}from"./build-operator-report"

import{
  buildProcessReport,
}from"./build-process-report"

import{
  buildProjectReport,
}from"./build-project-report"

import{
  buildTimeTrackingRows,
}from"./build-time-tracking-rows"

export function buildReportModel(
  tasks:Task[],
  scope:ExportScope,
):ReportModel{

  const rows=
    buildTimeTrackingRows(
      tasks,
      scope,
    )

  return{

    rows,

    kpis:
      buildKpis(rows),

    operators:
      buildOperatorReport(rows),

    projects:
      buildProjectReport(rows),

    processes:
      buildProcessReport(rows),

  }

}