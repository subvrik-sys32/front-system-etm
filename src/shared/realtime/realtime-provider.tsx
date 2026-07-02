"use client"

import { useEffect } from "react"

import {
  fetchEventSource,
  EventStreamContentType,
} from "@microsoft/fetch-event-source"

import { authSession } from "@/lib/auth-session"
import { useAuthStore } from "@/features/auth/store/auth-store"

import { realtimeRegistry } from "./types/realtime-registry"

export function RealtimeProvider({
  children,
}: {
  children: React.ReactNode
}) {

  const user = useAuthStore(s => s.user)

  useEffect(() => {

    // sin sesión activa, no conectamos
    if (!user) {
      return
    }

    const token = authSession.get()

    if (!token) {
      return
    }

    const controller = new AbortController()

    fetchEventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/realtime/events`,
      {

        signal: controller.signal,

        headers: {
          Authorization: `Bearer ${token}`,
        },

        openWhenHidden: true,

        async onopen(response) {

          if (
            response.ok &&
            response.headers
              .get("content-type")
              ?.includes(EventStreamContentType)
          ) {
            return
          }

          if (response.status === 401) {

            authSession.set(null)
            useAuthStore.getState().logout()

            if (typeof window !== "undefined") {
              window.location.href = "/login"
            }

          }

          throw new Error(`Realtime ${response.status}`)

        },

        onmessage(message) {

          if (!message.data || message.data.trim() === "") {
            return
          }

          const event = JSON.parse(message.data)

          if (event.type === "PING") {
            return
          }

          realtimeRegistry(event)

        },

        onclose() {
          // el navegador reintenta solo si el effect sigue montado
        },

        onerror(error) {

          // si ya hicimos logout, no seguir reintentando en loop
          if (!authSession.get()) {
            throw error // corta el retry automático de fetchEventSource
          }

        },

      },
    )

    return () => {
      controller.abort()
    }

  }, [user])

  return <>{children}</>

}