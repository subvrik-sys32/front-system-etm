"use client"

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

import {
  setQueryClient,
} from "@/lib/query-client"

type Props = {
  children: React.ReactNode
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,        // el realtime mantiene la cache al día;
                                      // esto solo protege datos que no dependen de eventos SSE
        // false: en mobile, "focus" de ventana dispara MUCHO más
        // seguido que en desktop (bloquear/desbloquear el teléfono,
        // cambiar de app y volver, etc.) — cada uno de esos focos
        // relanzaba TODAS las queries activas en paralelo, sintiéndose
        // como un delay random "sin tocar nada". El realtime (SSE) ya
        // mantiene la cache al día; esta red de seguridad hacía más
        // daño que beneficio, sobre todo en mobile.
        refetchOnWindowFocus: false,
        gcTime: 1000 * 60 * 30,
        retry: 1,
      },
    },
  })
}

// Singleton fuera de React — se crea UNA sola vez por carga de módulo,
// sin importar cuántas veces StrictMode invoque el render.
let browserQueryClient: QueryClient | undefined

function getOrCreateBrowserQueryClient() {
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
    setQueryClient(browserQueryClient)
  }
  return browserQueryClient
}

export function QueryProvider({ children }: Props) {
  const queryClient = getOrCreateBrowserQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}