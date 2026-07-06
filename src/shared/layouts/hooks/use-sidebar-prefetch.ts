import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { NAVIGATION } from "../navigation"

let hasPrefetched=false

export function useSidebarPrefetch(){

  const router=useRouter()

  useEffect(()=>{

    if(hasPrefetched){
      return
    }

    hasPrefetched=true

    for(const section of NAVIGATION){

      for(const item of section.items){

        router.prefetch(
          item.href,
        )

      }

    }

  },[router])

}