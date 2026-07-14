import type { LucideIcon } from "lucide-react"
import { Factory, FolderKanban, ClipboardList, UserRound } from "lucide-react"

// Ajustá esta ruta al import real de tu navigation.ts
// (vive junto a sidebar-navigation.tsx / app-sidebar.tsx).
import { NAVIGATION } from "@/shared/responsive/layout/navigation"

function findNavItem(href: string) {

  for (const section of NAVIGATION) {

    const item = section.items.find(i => i.href === href)

    if (item) {
      return item
    }

  }

  return undefined

}

const projectsItem = findNavItem("/projects")
const tasksItem = findNavItem("/tasks")

type BottomNavAction =
  | { type: "link"; href: string }
  | { type: "profile" }

export type BottomNavItem = {
  label: string
  icon: LucideIcon
  action: BottomNavAction
  // Prefijo de pathname para resaltar como activo (ignora query params
  // a propósito: "Producción" debe marcarse activo sin importar qué
  // proceso se esté viendo).
  matchPrefix: string
}

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [

  {
    label: projectsItem?.label ?? "Proyectos",
    icon: projectsItem?.icon ?? FolderKanban,
    action: { type: "link", href: "/projects" },
    matchPrefix: "/projects",
  },

  {
    label: tasksItem?.label ?? "Tareas",
    icon: tasksItem?.icon ?? ClipboardList,
    action: { type: "link", href: "/tasks" },
    matchPrefix: "/tasks",
  },

  {
    label: "Producción",
    icon: Factory,
    // Entra por el primer proceso configurado (Corte). Si en algún
    // momento existe una vista "hub" de producción (ej. el pipeline
    // adaptativo que armamos antes), cambiar este href a esa ruta.
    action: { type: "link", href: "/processes?code=ct" },
    matchPrefix: "/processes",
  },

  {
    label: "Perfil",
    icon: UserRound,
    action: { type: "profile" },
    matchPrefix: "__never_matches__",
  },

]