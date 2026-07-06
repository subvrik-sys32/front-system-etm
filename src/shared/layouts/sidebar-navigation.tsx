"use client"

import { usePathname,useSearchParams } from "next/navigation"

import { NAVIGATION } from "./navigation"
import { getNavItemMeta } from "./sidebar-nav-item-meta"
import { SidebarItem } from "./sidebar-item"
import { SidebarSection } from "./sidebar-section"

import type { ProcessCounts } from "./hooks/use-sidebar-counts"

type SidebarNavigationProps={
  projectsCount:number
  activeTasksCount:number
  processCounts:ProcessCounts
}

export function SidebarNavigation({
  projectsCount,
  activeTasksCount,
  processCounts,
}:SidebarNavigationProps){

  const pathname=usePathname()
  const searchParams=useSearchParams()

  return(

    <div
      className="erp-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-3 scrollbar-gutter-stable"
      style={{
        maskImage:
          "linear-gradient(to bottom,transparent,black 16px,black calc(100% - 16px),transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom,transparent,black 16px,black calc(100% - 16px),transparent)",
      }}
    >

      {NAVIGATION.map(section=>(

        <SidebarSection
          key={section.title}
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

      ))}

    </div>

  )

}