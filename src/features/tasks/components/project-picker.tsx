"use client"

import {
  useMemo,
  useRef,
  useState,
} from "react"

import {
  Check,
  Search,
} from "lucide-react"

import {
  formatDate,
} from "@/shared/utils/date-format"

import {
  cn,
} from "@/shared/utils/utils"

import {
  Input,
} from "@/components/ui/input"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  DynamicBadge,
} from "@/shared/ui/badge/dynamic-badge"

import {
  useProjects,
} from "@/features/projects/hooks/use-projects"

type Props={
  value:string
  onChange:(value:string)=>void
}

export function ProjectPicker({
  value,
  onChange,
}:Props){

  const[open,setOpen]=useState(false)
  const[query,setQuery]=useState("")

  const inputRef=
    useRef<HTMLInputElement>(null)

  const{
    projects,
  }=useProjects()

  const selected=
    useMemo(
      ()=>projects.find(
        project=>
          project.id===value,
      ),
      [
        projects,
        value,
      ],
    )

  const filteredProjects=
    useMemo(()=>{

      const search=
        query
          .trim()
          .toLowerCase()

      if(!search){
        return projects
      }

      return projects.filter(
        project=>

          [

            project.projectCode,

            project.name,

            project.client?.name ?? "",

            project.pm?.name ?? "",

          ].some(
            text=>

              text
                .toLowerCase()
                .includes(search),
          ),
      )

    },[
      projects,
      query,
    ])

  const sortedProjects=
    useMemo(()=>{

      if(!value){

        return filteredProjects

      }

      const selectedIndex=
        filteredProjects.findIndex(
          project=>
            project.id===value,
        )

      if(selectedIndex<0){

        return filteredProjects

      }

      const selectedProject=
        filteredProjects[
          selectedIndex
        ]

      return[

        selectedProject,

        ...filteredProjects.slice(
          0,
          selectedIndex,
        ),

        ...filteredProjects.slice(
          selectedIndex+1,
        ),

      ]

    },[
      filteredProjects,
      value,
    ])

  return(

    <Popover
      open={open}
      onOpenChange={nextOpen=>{

        setOpen(nextOpen)

        if(!nextOpen){

          return

        }

        setQuery("")

        requestAnimationFrame(
          ()=>inputRef.current?.focus(),
        )

      }}
    >

      <PopoverTrigger asChild>

        <button
          type="button"
          className="outline-none"
        >

          <DynamicBadge
            label={
              selected

                ?`${selected.projectCode} · ${selected.name}`

                :"Seleccionar proyecto"
            }
            color={"#64748B"}
            icon="project"
            width="project"
            showChevron
            chevronOpen={open}
          />

        </button>

      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-140 rounded-2xl border border-white/10 bg-[#101012] p-4 shadow-2xl"
      >

        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">

          <Search
            size={15}
            className="text-neutral-500"
          />

          <Input
            ref={inputRef}
            value={query}
            onChange={event=>
              setQuery(
                event.target.value,
              )
            }
            placeholder="Buscar proyecto..."
            className="border-0 bg-transparent shadow-none"
          />

        </div>

        <div className="erp-scrollbar h-90 overflow-y-auto pr-2">

          <div className="space-y-3">

            {filteredProjects.length===0&&(

              <div className="py-8 text-center text-sm text-neutral-500">

                No se encontraron proyectos

              </div>

            )}

            {sortedProjects.map(project=>{

              const isSelected=
                project.id===value

              return(

                <button
                  key={project.id}
                  type="button"
                  onClick={()=>{

                    onChange(project.id)

                    setQuery("")

                    setOpen(false)

                  }}
                  className={cn(
                    "w-full rounded-2xl p-4 text-left transition-all",
                    isSelected
                      ?"bg-white/[0.07] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_30px_rgba(0,0,0,0.25)]"
                      :"bg-white/3 hover:bg-white/5",
                  )}
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-bold text-neutral-100">

                        {project.projectCode}

                      </p>

                      <p
                        title={project.name}
                        className="mt-1 truncate text-xs text-neutral-500"
                      >

                        {project.name}

                      </p>

                    </div>

                    {isSelected&&(

                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">

                        <Check
                          size={13}
                          className="text-white"
                        />

                      </div>

                    )}

                  </div>

                  <div className="mt-3 flex flex-wrap gap-3">

                    {project.client&&(

                      <DynamicBadge
                        label={project.client.name}
                        color={project.client.color}
                        icon={project.client.icon}
                      />

                    )}

                    {project.pm&&(

                      <DynamicBadge
                        label={project.pm.name}
                        color={project.pm.color}
                        icon={project.pm.icon}
                      />

                    )}

                    <DynamicBadge
                      label={
                        project.deliveryDate
                          ? formatDate(project.deliveryDate)
                          : "Sin fecha"
                      }
                      color="#64748B"
                      icon="clock"
                    />

                  </div>

                </button>

              )

            })}

          </div>

        </div>

      </PopoverContent>

    </Popover>

  )

}