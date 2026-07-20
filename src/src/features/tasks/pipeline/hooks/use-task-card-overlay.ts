"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

import {
  useLongPress,
} from "./use-long-press"

type Props = {
  enabled: boolean
  onOpenChange?: (
    open: boolean,
  ) => void
}

export function useTaskCardOverlay({
  enabled,
  onOpenChange,
}: Props) {
  const [
    overlayOpen,
    setOverlayOpenState,
  ] =
    useState(false)

  const overlayOpenRef =
    useRef(overlayOpen)

  const onOpenChangeRef =
    useRef(onOpenChange)

  overlayOpenRef.current =
    overlayOpen

  onOpenChangeRef.current =
    onOpenChange

  const setOverlayOpen =
    useCallback(
      (open: boolean) => {
        setOverlayOpenState(open)

        onOpenChangeRef.current?.(
          open,
        )
      },
      [],
    )

  const closeOverlay =
    useCallback(
      () =>
        setOverlayOpen(false),
      [
        setOverlayOpen,
      ],
    )

  useEffect(() => {
    return () => {
      if (overlayOpenRef.current) {
        onOpenChangeRef.current?.(false)
      }
    }
  }, [])

  const {
    bind,
    pressed,
  } =
    useLongPress({
      onLongPress: () => {
        if (enabled) {
          setOverlayOpen(true)
        }
      },
    })

  return {
    bind,
    pressed,
    overlayOpen,
    closeOverlay,
  }
}