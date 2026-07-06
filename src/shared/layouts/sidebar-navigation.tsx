"use client"

import { Fragment } from "react"
import { usePathname,useSearchParams } from "next/navigation"

import { NAVIGATION } from "./navigation"
import { getNavItemMeta } from "./sidebar-nav-item-meta"
import { SidebarItem } from "./sidebar-item"
import { SidebarPresence } from "./sidebar-presence"
import { SidebarSection } from "./sidebar-section"
import { NotificationBell } from "@/features/notifications/components/notification-bell"

import type { ProcessCounts } from "./hooks/use-sidebar-counts"

type SidebarNavigationProps={
  projectsCount:number
  activeTasksCount:number
  processCounts:ProcessCounts
  presenceCollapsed:boolean
  presenceRef?:(node:HTMLDivElement|null)=>void
}

export function SidebarNavigation({
  projectsCount,
  activeTasksCount,
  processCounts,
  presenceCollapsed,
  presenceRef,
}:SidebarNavigationProps){

  const pathname=usePathname()
  const searchParams=useSearchParams()

  return(

    <div
      className="erp-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-3 scrollbar-gutter-stable"
      style={{
        maskImage:
          "linear-gradient(to bottom,transparent,black 4px,black calc(100% - 4px),transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom,transparent,black 4px,black calc(100% - 4px),transparent)",
      }}
    >

      <div className="mb-3">
        <NotificationBell />
      </div>

      {NAVIGATION.map((section,index)=>(

        <Fragment key={section.title}>

          <SidebarSection
            title={section.title}
          >

            {section.items.map(item=>{

              const{
                isActive,
                count,
              }=getNavItemMeta({
                item,
                pathname,
                searchParams,
                projectsCount,
                activeTasksCount,
                processCounts,
              })

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

          {index===NAVIGATION.length-1&&(

            <SidebarPresence
              collapsed={presenceCollapsed}
              presenceRef={presenceRef}
            />

          )}

        </Fragment>

      ))}

    </div>

  )

}