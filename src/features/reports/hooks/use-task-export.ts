"use client"

import{
  useState,
}from"react"

import type{
  ExportScope,
}from"@/shared/export"

import type{
  Task,
}from"@/features/tasks/types/task.types"

import{
  buildReportModel,
}from"../builders/build-report-model"

import{
  exportOperatorWorkOrdersPdf,
}from"../exporters/export-operator-work-orders-pdf"

import{
  exportTimeTrackingExcel,
}from"../exporters/export-time-tracking-excel"

export function useTaskExport(
  tasks:Task[],
){

  const[
    exporting,
    setExporting,
  ]=useState(false)

  async function exportExcel(
    scope:ExportScope,
  ){

    setExporting(true)

    try{

      const report=
        buildReportModel(
          tasks,
          scope,
        )

      await exportTimeTrackingExcel(
        report,
      )

    }finally{

      setExporting(false)

    }

  }

  async function exportPdf(
    scope:ExportScope,
  ){

    setExporting(true)

    try{

      const report=
        buildReportModel(
          tasks,
          scope,
        )

      await exportOperatorWorkOrdersPdf(
        report,
      )

    }finally{

      setExporting(false)

    }

  }

  return{

    exporting,

    exportExcel,

    exportPdf,

  }

}