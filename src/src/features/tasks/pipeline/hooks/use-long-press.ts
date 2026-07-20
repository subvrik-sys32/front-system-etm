"use client"

import { useCallback, useMemo, useRef, useState } from "react"

type UseLongPressOptions = {
  onLongPress: () => void
  onPressStart?: () => void
  onCancel?: () => void
  threshold?: number
  pressedThreshold?: number
  moveTolerance?: number
}

type LongPressBind = {
  onMouseDown: (e: React.MouseEvent) => void
  onMouseMove: (e: React.MouseEvent) => void
  onMouseUp: () => void
  onMouseLeave: () => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
}

export function useLongPress({
  onLongPress,
  onPressStart,
  onCancel,
  threshold = 320,
  pressedThreshold = 150,
  moveTolerance = 10,
}: UseLongPressOptions): {
  bind: LongPressBind
  pressed: boolean
  triggered: boolean
} {

  const [pressed, setPressed] = useState(false)
  const [triggered, setTriggered] = useState(false)

  const pressedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startPos = useRef<{ x: number; y: number } | null>(null)

  function clearTimers() {

    if (pressedTimer.current) {
      clearTimeout(pressedTimer.current)
      pressedTimer.current = null
    }

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

  }

  const reset = useCallback((didCancel: boolean) => {

    clearTimers()

    startPos.current = null

    setPressed(false)

    if (didCancel && triggered) {
      onCancel?.()
    }

    setTriggered(false)

  }, [onCancel, triggered])

  const start = useCallback((x: number, y: number) => {

    startPos.current = { x, y }

    pressedTimer.current = setTimeout(() => {

      setPressed(true)

      onPressStart?.()

    }, pressedThreshold)

    longPressTimer.current = setTimeout(() => {

      setTriggered(true)

      onLongPress()

    }, threshold)

  }, [onLongPress, onPressStart, pressedThreshold, threshold])

  const move = useCallback((x: number, y: number) => {

    if (!startPos.current) {
      return
    }

    const dx = Math.abs(x - startPos.current.x)
    const dy = Math.abs(y - startPos.current.y)

    if (dx > moveTolerance || dy > moveTolerance) {
      reset(true)
    }

  }, [moveTolerance, reset])

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => start(e.clientX, e.clientY),
    [start],
  )

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => move(e.clientX, e.clientY),
    [move],
  )

  const onMouseUp = useCallback(
    () => reset(false),
    [reset],
  )

  const onMouseLeave = useCallback(
    () => reset(true),
    [reset],
  )

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {

      const touch = e.touches[0]

      start(touch.clientX, touch.clientY)

    },
    [start],
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {

      const touch = e.touches[0]

      move(touch.clientX, touch.clientY)

    },
    [move],
  )

  const onTouchEnd = useCallback(
    () => reset(false),
    [reset],
  )

  const bind: LongPressBind = useMemo(
    () => ({
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    }),
    [onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd],
  )

  return { bind, pressed, triggered }

}