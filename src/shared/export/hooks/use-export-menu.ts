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
    setOpenRaw,
  ]=useState(false)

  const[
    selectedFormat,
    setSelectedFormat,
  ]=useState<
    ExportFormat|
    undefined
  >()

  function setOpen(next:boolean){

    setOpenRaw(next)

    if(!next){

      setSelectedFormat(
        undefined,
      )

    }

  }

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

    setOpenRaw(false)

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