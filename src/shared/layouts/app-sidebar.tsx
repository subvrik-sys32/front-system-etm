"use client"

import { useEffect,useMemo,useRef,useState } from "react"
import { usePathname,useRouter,useSearchParams } from "next/navigation"

import { useAuthStore } from "@/features/auth/store/auth-store"
import { useProjects } from "@/features/projects/hooks/use-projects"
import { isProjectCompleted } from "@/features/projects/selectors/is-project-completed"
import { ProfileDialog,ProfilePreviewPanel } from "@/features/profile"
import { useTasks } from "@/features/tasks/hooks/use-tasks"

import { useSidebarStore } from "@/shared/stores/sidebar-store"
import { cn } from "@/shared/utils/utils"

import { NAVIGATION } from "./navigation"
import { SidebarHeader } from "./sidebar-header"
import { SidebarItem } from "./sidebar-item"
import { SidebarPresence } from "./sidebar-presence"
import { SidebarSection } from "./sidebar-section"

let hasPrefetched=false

export function AppSidebar(){

  const pathname=usePathname()
  const searchParams=useSearchParams()
  const router=useRouter()

  const mode=useSidebarStore(s=>s.mode)
  const lastVisibleMode=useSidebarStore(s=>s.lastVisibleMode)
  const close=useSidebarStore(s=>s.close)

  const user=useAuthStore(s=>s.user)
  const logout=useAuthStore(s=>s.logout)

  const[profileOpen,setProfileOpen]=useState(false)
  const[profileEditOpen,setProfileEditOpen]=useState(false)

  const{projects}=useProjects()
  const{tasks}=useTasks()

  const leaveTimeout=useRef<NodeJS.Timeout|null>(null)
  const profileRef=useRef<HTMLDivElement|null>(null)

  const preview=mode==="preview"

  const previewGeometry=
    mode==="preview"||
    (
      mode==="closed"&&
      lastVisibleMode==="preview"
    )

  const projectsCount=useMemo(
    ()=>projects.filter(
      project=>!isProjectCompleted(project),
    ).length,
    [projects],
  )

  const activeTasksCount=useMemo(
    ()=>tasks.filter(
      task=>task.workflowSteps?.some(
        step=>step.status!=="REVIEWED",
      ),
    ).length,
    [tasks],
  )

  const processCounts=useMemo(()=>{

    const counts={
      CT:0,
      PL:0,
      SD:0,
      PT:0,
      EN:0,
      DS:0,
    }

    for(const task of tasks){

      for(const step of task.workflowSteps??[]){

        if(step.status==="REVIEWED"){
          continue
        }

        if(counts[step.processCode as keyof typeof counts]!==undefined){
          counts[step.processCode as keyof typeof counts]++
        }

      }

    }

    return counts

  },[tasks])

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

  // cierra el panel de perfil al hacer click en cualquier otro lugar
  // (dentro o fuera del sidebar), no solo fuera de la ventana
  useEffect(()=>{

    if(!profileOpen){
      return
    }

    function handlePointerDown(e:PointerEvent){

      if(
        profileRef.current&&
        !profileRef.current.contains(e.target as Node)
      ){
        setProfileOpen(false)
      }

    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    )

    return ()=>document.removeEventListener(
      "pointerdown",
      handlePointerDown,
    )

  },[profileOpen])

  return(

    <aside
      onMouseEnter={()=>
        leaveTimeout.current&&
        clearTimeout(
          leaveTimeout.current,
        )
      }
      onMouseLeave={()=>{

        if(!preview){
          return
        }

        leaveTimeout.current=
          setTimeout(
            close,
            200,
          )

      }}
      className={cn(
        // sin overflow-hidden aquí: así el overlay del panel de perfil
        // (absolute, ver ProfilePreviewPanel) nunca queda recortado por
        // este contenedor, incluso si cambia la altura por zoom del navegador
        "isolate z-50 flex w-62 flex-col bg-[#0A0A0A] ring-1 ring-white/5 will-change-transform transform-gpu transition-all duration-200 ease-out",
        previewGeometry
          ?"fixed left-0 top-5 h-[calc(100vh-40px)] rounded-r-2xl border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          :"fixed left-0 top-0 h-screen border-r border-white/5",
        mode==="closed"
          ?"translate-x-[-110%]"
          :"translate-x-0",
      )}
    >

      <SidebarHeader/>

      {/* el scroll sí necesita su propio overflow para el fade + la barra,
          y overflow-hidden lateral solo aquí, no en todo el aside */}
      <div
        className="erp-scrollbar relative flex-1 overflow-x-hidden overflow-y-auto select-none px-3 py-3 [scrollbar-gutter:stable]"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent)",
        }}
      >

        {NAVIGATION.map(section=>(

          <SidebarSection
            key={section.title}
            title={section.title}
          >

            {section.items.map(item=>{

              const[itemPath,itemQuery]=
                item.href.split("?")

              const itemCode=
                itemQuery
                  ?.split("code=")[1]
                  ?.split("&")[0]

              const isActive=
                itemCode
                  ?pathname===itemPath&&
                   searchParams.get("code")===itemCode
                  :pathname===item.href

              const count=
                item.href==="/projects"
                  ?projectsCount
                  :item.href==="/tasks"
                    ?activeTasksCount
                    :itemCode==="ct"
                      ?processCounts.CT
                      :itemCode==="pl"
                        ?processCounts.PL
                        :itemCode==="sd"
                          ?processCounts.SD
                          :itemCode==="pt"
                            ?processCounts.PT
                            :itemCode==="en"
                              ?processCounts.EN
                              :itemCode==="ds"
                                ?processCounts.DS
                                :undefined

              return(

                <SidebarItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isActive}
                  count={count}
                />

              )

            })}

          </SidebarSection>

        ))}

        {/* movido adentro del scroll: ahora "EN LÍNEA" se desvanece con el
            mismo mask-image que el resto de la navegación, en vez de vivir
            fijo entre el scroll y el footer */}
        <SidebarPresence/>

      </div>

      <div className="select-none p-3">

        {/* relative: ancla el overlay del panel, que no empuja este layout */}
        <div ref={profileRef} className="relative">

          <ProfilePreviewPanel
            open={profileOpen}
            onEdit={()=>{
              setProfileOpen(false)
              setProfileEditOpen(true)
            }}
          />

          <div className="rounded-xl bg-white/3 px-3 py-3 transition-all duration-200 hover:bg-white/6">

            <div className="flex items-center justify-between gap-2">

              <div className="flex min-w-0 items-center gap-2.5">

                <div className="relative h-9 w-9 shrink-0">

                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-white/10 to-white/3 text-sm font-semibold text-white shadow-inner">

                    {user?.avatarUrl ? (

                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />

                    ) : (

                      user?.name?.[0]?.toUpperCase() ?? "?"

                    )}

                  </div>

                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-[#0A0A0A]" />

                </div>

                {user ? (

                  <p className="truncate text-sm font-semibold leading-tight text-white">
                    {user.name}
                  </p>

                ) : (

                  <div className="h-3 w-28 animate-pulse rounded bg-white/5" />

                )}

              </div>

              <button
                onClick={()=>setProfileOpen(v=>!v)}
                className="shrink-0 rounded-md px-2 py-1 text-xs text-neutral-400 transition hover:bg-white/5 hover:text-white"
              >
                Mi perfil
              </button>

            </div>

            {/* fila 2: correo al extremo izquierdo, Salir al extremo derecho,
                sin indentación bajo el avatar ni centrado */}
            <div className="mt-1.5 flex items-center justify-between gap-2">

              {user ? (

                <p className="min-w-0 truncate text-xs text-neutral-500">
                  {user.email}
                </p>

              ) : (

                <div className="h-2 w-20 animate-pulse rounded bg-white/5" />

              )}

              <button
                onClick={()=>{

                  logout()

                  requestAnimationFrame(()=>{

                    router.replace(
                      "/login",
                    )

                  })

                }}
                className="shrink-0 rounded-md px-2 py-1 text-xs text-neutral-400 transition hover:bg-white/5 hover:text-white"
              >
                Salir
              </button>

            </div>

          </div>

        </div>

      </div>

      <ProfileDialog
        open={profileEditOpen}
        onClose={()=>setProfileEditOpen(false)}
      />

    </aside>

  )

}