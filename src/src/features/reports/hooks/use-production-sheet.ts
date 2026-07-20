"use client"

import{
  useState,
}from"react"

import type{
  ProcessTask,
}from"@/features/processes/types/process.types"

import type{
  ProcessCode,
}from"@/features/tasks/types/task.types"

import type{
  ProductionScope,
}from"../types/production.types"

import{
  buildProductionSheet,
}from"../builders/build-production-sheet"

import{
  exportProductionSheetPdf,
}from"../exporters/export-production-sheet-pdf"

import{
  exportProductionSheetExcel,
}from"../exporters/export-production-sheet-excel"

export function useProductionSheet(

  tasks:ProcessTask[],

  processCode:ProcessCode,

){

  const[
    exporting,
    setExporting,
  ]=useState(false)

  async function exportPdf(
    scope:ProductionScope,
  ){

    try{

      setExporting(true)

      const sheet=
        buildProductionSheet(
          tasks,
          processCode,
          scope,
        )

      await exportProductionSheetPdf(
        sheet,
      )

    }finally{

      setExporting(false)

    }

  }

  async function exportExcel(
    scope:ProductionScope,
  ){

    try{

      setExporting(true)

      const sheet=
        buildProductionSheet(
          tasks,
          processCode,
          scope,
        )

      await exportProductionSheetExcel(
        sheet,
      )

    }finally{

      setExporting(false)

    }

  }

  return{

    exporting,

    exportPdf,

    exportExcel,

  }

}