import { useCallback, useMemo, useRef } from "react"
import { computeBounds } from "../utils/geometry-utils"
import type { Entity, Point, ViewState } from "../types/types"

/**
 * Cámara zoom/pan. Sin rotación de vista: X siempre horizontal, Y vertical.
 * La plancha apaisada en viewport estrecho se escala; no se gira el mundo.
 */
export function useCanvasView() {
  const viewRef = useRef<ViewState>({ scale: 1, offsetX: 0, offsetY: 0, rotationDeg: 0 })
  const userInteractedRef = useRef(false)

  const localToScreen = useCallback((canvas: HTMLCanvasElement | null, p: Point): Point => {
    if (!canvas) return { x: 0, y: 0 }
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    const { scale, offsetX, offsetY } = viewRef.current
    return {
      x: w / 2 + offsetX + p.x * scale,
      y: h / 2 + offsetY + p.y * scale,
    }
  }, [])

  const screenToLocal = useCallback(
    (canvas: HTMLCanvasElement | null, clientX: number, clientY: number): Point | null => {
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      const cssW = canvas.clientWidth || rect.width
      const cssH = canvas.clientHeight || rect.height
      const sx = cssW / (rect.width || 1)
      const sy = cssH / (rect.height || 1)
      const { scale, offsetX, offsetY } = viewRef.current
      const cx = (clientX - rect.left) * sx - cssW / 2 - offsetX
      const cy = (clientY - rect.top) * sy - cssH / 2 - offsetY
      return { x: cx / scale, y: cy / scale }
    },
    [],
  )

  const fitToBounds = useCallback(
    (
      canvas: HTMLCanvasElement | null,
      bounds: { minX: number; minY: number; maxX: number; maxY: number } | null,
      padding = 0.9,
      _opts?: { preferPortrait?: boolean; allowAutoRotate?: boolean },
    ) => {
      if (!canvas || !bounds) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w === 0 || h === 0) return

      const drawW = bounds.maxX - bounds.minX || 1
      const drawH = bounds.maxY - bounds.minY || 1
      const scale = Math.min((w / drawW) * padding, (h / drawH) * padding)
      const centerX = (bounds.minX + bounds.maxX) / 2
      const centerY = (bounds.minY + bounds.maxY) / 2

      viewRef.current = {
        scale,
        offsetX: -centerX * scale,
        offsetY: -centerY * scale,
        rotationDeg: 0,
      }
    },
    [],
  )

  const fitToSheetOrEntities = useCallback(
    (
      canvas: HTMLCanvasElement | null,
      entities: Entity[],
      sheetSize?: { width: number; height: number },
      preferPortrait = false,
    ) => {
      if (!canvas) return

      const STROKE_PAD_MM = 3
      const bounds = sheetSize
        ? {
            minX: -STROKE_PAD_MM,
            minY: -STROKE_PAD_MM,
            maxX: sheetSize.width + STROKE_PAD_MM,
            maxY: sheetSize.height + STROKE_PAD_MM,
          }
        : computeBounds(entities)

      if (!bounds) return

      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w === 0 || h === 0) return

      const chromeTop = preferPortrait ? 56 : 48
      const chromeBottom = preferPortrait ? 64 : 52
      const chromeSide = preferPortrait ? 16 : 24
      const usableW = Math.max(1, w - chromeSide * 2)
      const usableH = Math.max(1, h - chromeTop - chromeBottom)

      const drawW = bounds.maxX - bounds.minX || 1
      const drawH = bounds.maxY - bounds.minY || 1
      const padding = 0.92
      const scale = Math.min((usableW / drawW) * padding, (usableH / drawH) * padding)

      const centerX = (bounds.minX + bounds.maxX) / 2
      const centerY = (bounds.minY + bounds.maxY) / 2
      const visualBiasY = (chromeBottom - chromeTop) / 2

      viewRef.current = {
        scale,
        offsetX: -centerX * scale,
        offsetY: -centerY * scale + visualBiasY,
        rotationDeg: 0,
      }
    },
    [],
  )

  const focusEntities = useCallback(
    (canvas: HTMLCanvasElement | null, entities: Entity[], padding = 0.6) => {
      fitToBounds(canvas, computeBounds(entities), padding)
    },
    [fitToBounds],
  )

  const zoomAt = useCallback(
    (canvas: HTMLCanvasElement | null, clientX: number, clientY: number, factor: number) => {
      if (!canvas) return
      userInteractedRef.current = true
      const rect = canvas.getBoundingClientRect()
      const cx = clientX - rect.left - rect.width / 2
      const cy = clientY - rect.top - rect.height / 2
      const { scale, offsetX, offsetY } = viewRef.current
      const newScale = scale * factor
      viewRef.current = {
        scale: newScale,
        offsetX: cx - (cx - offsetX) * factor,
        offsetY: cy - (cy - offsetY) * factor,
        rotationDeg: 0,
      }
    },
    [],
  )

  const zoomBy = useCallback((factor: number) => {
    userInteractedRef.current = true
    viewRef.current = {
      ...viewRef.current,
      scale: viewRef.current.scale * factor,
      rotationDeg: 0,
    }
  }, [])

  const panBy = useCallback((dx: number, dy: number, startOffsetX: number, startOffsetY: number) => {
    userInteractedRef.current = true
    viewRef.current = {
      ...viewRef.current,
      offsetX: startOffsetX + dx,
      offsetY: startOffsetY + dy,
      rotationDeg: 0,
    }
  }, [])

  const allowAutoFit = useCallback(() => {
    userInteractedRef.current = false
  }, [])

  const hasUserInteracted = useCallback(() => userInteractedRef.current, [])

  const markUserInteracted = useCallback(() => {
    userInteractedRef.current = true
  }, [])

  return useMemo(
    () => ({
      viewRef,
      localToScreen,
      screenToLocal,
      fitToBounds,
      fitToSheetOrEntities,
      focusEntities,
      zoomAt,
      zoomBy,
      panBy,
      allowAutoFit,
      hasUserInteracted,
      markUserInteracted,
    }),
    [
      localToScreen,
      screenToLocal,
      fitToBounds,
      fitToSheetOrEntities,
      focusEntities,
      zoomAt,
      zoomBy,
      panBy,
      allowAutoFit,
      hasUserInteracted,
      markUserInteracted,
    ],
  )
}