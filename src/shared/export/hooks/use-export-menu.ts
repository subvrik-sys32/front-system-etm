"use client"

import{
  useState,
}from"react"

import type{
  ExportFormat,
}from"../types/export.types"

export function useExportMenu(){

  const[
    open,
    setOpen,
  ]=useState(false)

  const[
    selectedFormat,
    setSelectedFormat,
  ]=useState<
    ExportFormat|
    undefined
  >()

  function handleBack(){

    setSelectedFormat(
      undefined,
    )

  }

  function handleFormatSelect(
    format:ExportFormat,
  ){

    setSelectedFormat(
      format,
    )

  }

  function handleClose(){

    setSelectedFormat(
      undefined,
    )

    setOpen(false)

  }

  return{

    open,
    setOpen,

    selectedFormat,

    handleBack,

    handleClose,

    handleFormatSelect,

  }

}