"use client"

import {
  useEffect,
} from "react"

type Props = {
  focusedId?: string
  setExpandedRowId: (id: string | null) => void
  focusToken?: string
}

export function useFocusedRow({
  focusedId,
  setExpandedRowId,
  focusToken,
}: Props) {

  useEffect(() => {

    if (!focusedId) {
      return
    }

    setExpandedRowId(
      focusedId
    )

    const selector =
      `[data-expanded-row-id="${focusedId}"]`

    const scrollToRow = (el: HTMLElement) => {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }

    // Si el nodo ya está en el DOM (caso normal cuando la fila
    // no estaba colapsada), no hace falta observar nada.
    const existing =
      document.querySelector<HTMLElement>(selector)

    if (existing) {
      scrollToRow(existing)
      return
    }

    // Si no existe todavía, es porque setExpandedRowId dispara un
    // render async y el nodo se monta después. En vez de sondear
    // a ciegas, observamos el DOM y reaccionamos apenas aparezca.
    const observer = new MutationObserver(() => {

      const el =
        document.querySelector<HTMLElement>(selector)

      if (el) {
        scrollToRow(el)
        observer.disconnect()
      }

    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Salvavidas: si por lo que sea el nodo nunca aparece
    // (id inválido, fila filtrada, etc.), no dejamos el
    // observer corriendo para siempre.
    const timeout = setTimeout(() => {
      observer.disconnect()
    }, 3000)

    return () => {
      observer.disconnect()
      clearTimeout(timeout)
    }

  }, [
    focusedId,
    setExpandedRowId,
    focusToken,
  ])

}