import {
  useEffect,
  useRef,
} from "react"

import type {
  RefObject,
} from "react"

/**
 * Engancha un event listener nativo del DOM sobre un elemento
 * referenciado por `ref`, sin depender de la identidad de
 * `handler`.
 *
 * Por qué existe: React solo expone eventos sintéticos (p. ej.
 * `onChange` para inputs mapea al evento nativo `input`, no a
 * `change`). Cuando necesitás el evento nativo real —como
 * `change` en un `<input type="color">`, que dispara una sola
 * vez al terminar la interacción en vez de en cada frame— hay
 * que suscribirse a mano con `addEventListener`.
 *
 * Si el `handler` se pasa inline (`(e) => doThing(value)`), su
 * identidad cambia en cada render. Sin este hook, eso forzaría
 * un `removeEventListener` + `addEventListener` constante. Acá
 * guardamos el handler en un `ref` y el listener real (estable)
 * simplemente delega a `handlerRef.current`, así la suscripción
 * al DOM ocurre una única vez por (elemento, evento).
 */
export function useNativeEvent<
  T extends HTMLElement,
  K extends keyof HTMLElementEventMap,
>(
  ref: RefObject<T | null>,
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
) {

  const handlerRef=
    useRef(handler)

  useEffect(()=>{

    handlerRef.current=
      handler

  })

  useEffect(()=>{

    const element=
      ref.current

    if(
      !element
    ){

      return

    }

    function listener(
      event:HTMLElementEventMap[K],
    ){

      handlerRef.current(
        event,
      )

    }

    element.addEventListener(
      eventName,
      listener as EventListener,
    )

    return ()=>{

      element.removeEventListener(
        eventName,
        listener as EventListener,
      )

    }

  // eslint-disable-next-line react-hooks/exhaustive-deps -- el handler se lee via handlerRef, no necesita re-suscribir
  },[ref,eventName])

}