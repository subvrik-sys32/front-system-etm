"use client"

import { useEffect, type MutableRefObject } from "react"
import type { CanvasTool } from "../types/types"

type Params = {
  spaceHeldRef: MutableRefObject<boolean>
  selectedPieceIndices: number[]
  rotationStep: number
  onRotateSelected?: (indices: number[], deg: number) => void
  onDeleteSelected?: (indices: number[]) => void
  onSelectPiece?: (index: number | null, additive: boolean) => void
  setCanvasTool: (tool: CanvasTool) => void
  resetMeasureTool: () => void
}

export function useCanvasKeyboard({
  spaceHeldRef,
  selectedPieceIndices,
  rotationStep,
  onRotateSelected,
  onDeleteSelected,
  onSelectPiece,
  setCanvasTool,
  resetMeasureTool,
}: Params) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      if (e.code === "Space") {
        e.preventDefault()
        spaceHeldRef.current = true
        return
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedPieceIndices.length > 0 && onDeleteSelected) {
          e.preventDefault()
          onDeleteSelected(selectedPieceIndices)
        }
        return
      }
      if (e.key === "v" || e.key === "V") {
        setCanvasTool("select")
        return
      }
      if (e.key === "h" || e.key === "H") {
        setCanvasTool("pan")
        return
      }
      if (e.key === "Escape") {
        onSelectPiece?.(null, false)
        resetMeasureTool()
        setCanvasTool("select")
        return
      }
      if (e.key !== "r" && e.key !== "R") return
      if (selectedPieceIndices.length === 0 || !onRotateSelected) return
      e.preventDefault()
      const deg = e.shiftKey ? -rotationStep : rotationStep
      onRotateSelected(selectedPieceIndices, deg)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") spaceHeldRef.current = false
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [
    spaceHeldRef,
    selectedPieceIndices,
    rotationStep,
    onRotateSelected,
    onDeleteSelected,
    onSelectPiece,
    setCanvasTool,
    resetMeasureTool,
  ])
}