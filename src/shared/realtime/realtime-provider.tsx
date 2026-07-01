"use client"

import{
  useEffect,
}from"react"

import{
  fetchEventSource,
  EventStreamContentType,
}from"@microsoft/fetch-event-source"

import{
  authSession,
}from"@/lib/auth-session"

import{
  realtimeRegistry,
}from"./types/realtime-registry"

export function RealtimeProvider({
  children,
}:{
  children:React.ReactNode
}){

  useEffect(()=>{

    const token=
      authSession.get()

    if(!token){
      console.warn("[Realtime] Sin token, no se conecta")
      return
    }

    const controller=
      new AbortController()

    fetchEventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/realtime/events`,
      {

        signal:controller.signal,

        headers:{
          Authorization:`Bearer ${token}`,
        },

        openWhenHidden:true,

        async onopen(response){

          console.log(
            "[Realtime] onopen status:",
            response.status,
            "content-type:",
            response.headers.get("content-type"),
          )

          if(
            response.ok&&
            response.headers
              .get("content-type")
              ?.includes(
                EventStreamContentType,
              )
          ){

            console.log(
              "[Realtime] Connected",
            )

            return

          }

          throw new Error(
            `Realtime ${response.status}`,
          )

        },

        onmessage(message){

          console.log("[SSE RAW]", message)

          if(
            !message.data||
            message.data.trim()===""
          ){
            console.warn("[SSE] data vacía, se ignora")
            return
          }

          const event=
            JSON.parse(
              message.data,
            )
          console.log("[SSE PARSED]", event)

          if(
            event.type==="PING"
          ){
            return
          }

          realtimeRegistry(
            event,
          )

        },

        onclose(){

          console.warn(
            "[Realtime] Closed",
          )

        },

        onerror(error){

          console.error(
            "[Realtime] onerror:",
            error,
          )

        },

      },
    )

    return()=>{

      console.log("[Realtime] Cleanup: abortando conexión")
      controller.abort()

    }

  },[])

  return<>{children}</>

}