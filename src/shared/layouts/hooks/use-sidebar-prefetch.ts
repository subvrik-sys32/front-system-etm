import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { NAVIGATION } from "../navigation"

const prefetchedHrefs=
  new Set<string>()

function prefetchHref(
  router:ReturnType<typeof useRouter>,
  href:string,
){

  if(prefetchedHrefs.has(href)){
    return
  }

  prefetchedHrefs.add(href)

  router.prefetch(
    href,
  )

}

export function useSidebarPrefetch(){

  const router=useRouter()

  useEffect(()=>{

    // Prefetch eager solo para rutas SIN query params: son pocas
    // (proyectos, tareas, engineering, admin) y baratas. Las
    // variantes de /processes?code=... quedan afuera a propósito
    // — si el servidor hace un fetch distinto por cada code,
    // prefetchear las 6 al montar significa pagar ese costo para
    // páginas que el usuario puede no visitar nunca en la sesión.
    // Esas se prefetchean recién on-hover, con prefetchOnHover.
    const hrefs=
      new Set<string>()

    for(const section of NAVIGATION){

      for(const item of section.items){

        if(item.href.includes("?")){
          continue
        }

        hrefs.add(
          item.href,
        )

      }

    }

    for(const href of hrefs){

      prefetchHref(
        router,
        href,
      )

    }

  },[router])

  function prefetchOnHover(
    href:string,
  ){

    prefetchHref(
      router,
      href,
    )

  }

  return{
    prefetchOnHover,
  }

}