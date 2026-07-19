"use client"

import { useEffect, useRef, useState, useCallback } from "react"

/**
 * Mide el ancho REAL del contenedor (no el viewport) usando
 * ResizeObserver. Usa un callback ref en vez de useRef + useEffect
 * con deps vacías: si el nodo del DOM cambia (remount, key change,
 * render condicional), un useEffect con [] nunca se vuelve a
 * ejecutar y el observer queda apuntando a un nodo viejo o nunca
 * llega a crearse. El callback ref se dispara cada vez que React
 * attachea/detachea el nodo, así que siempre observamos el nodo
 * correcto.
 */
export function useContainerWidth<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null)
  const [width, setWidth] = useState<number | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)

  const setRef = useCallback((node: T | null) => {
    // Si había un observer de un nodo anterior, lo cortamos primero
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    ref.current = node

    if (node) {
      // Medición inicial sincrónica — no esperamos al primer
      // callback del ResizeObserver para tener un valor
      setWidth(node.getBoundingClientRect().width)

      const observer = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (!entry) return
        setWidth(entry.contentRect.width)
      })

      observer.observe(node)
      observerRef.current = observer
    }
  }, [])

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  return { ref: setRef, width }
}