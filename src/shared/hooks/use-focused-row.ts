"use client"

import {
  useEffect,
} from "react"

type Props={
  focusedId?:string
  setExpandedRowId:(id:string|null)=>void
}

export function useFocusedRow({
  focusedId,
  setExpandedRowId,
}:Props){

  useEffect(()=>{

    if(!focusedId){
      return
    }

    setExpandedRowId(
      focusedId
    )

    let attempts=0

    const interval=
      setInterval(()=>{

        const expanded=
          document.querySelector(
            `[data-expanded-row-id="${focusedId}"]`
          ) as HTMLElement | null

        if(!expanded){

          attempts++

          if(
            attempts>=20
          ){

            clearInterval(
              interval
            )

          }

          return

        }

        expanded.scrollIntoView({

          behavior:"smooth",

          block:"center",

        })

        clearInterval(
          interval
        )

      },50)

    return()=>
      clearInterval(
        interval
      )

  },[
    focusedId,
    setExpandedRowId,
  ])

}