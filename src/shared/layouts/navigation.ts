import {
  FolderKanban,
  ClipboardList,
  Scissors,
  FoldHorizontal,
  Wrench,
  PaintBucket,
  Package,
  Truck,
  Users,
} from "lucide-react"

export const NAVIGATION = [

  {
    title: "Gestión",
    items: [
      {
        label: "Proyectos",
        href: "/projects",
        icon: FolderKanban,
      },
      {
        label: "Tareas",
        href: "/tasks",
        icon: ClipboardList,
      },
    ],
  },

  {
    title: "Producción",
    items: [
      {
        label: "Corte",
        href: "/processes/ct",
        icon: Scissors,
      },
      {
        label: "Plegado",
        href: "/processes/pl",
        icon: FoldHorizontal,
      },
      {
        label: "Soldadura",
        href: "/processes/sd",
        icon: Wrench,
      },
      {
        label: "Pintura",
        href: "/processes/pt",
        icon: PaintBucket,
      },
      {
        label: "Ensamble",
        href: "/processes/en",
        icon: Package,
      },
      {
        label: "Despacho",
        href: "/processes/ds",
        icon: Truck,
      },
    ],
  },

  {
    title: "Administración",
    items: [
      {
        label: "Usuarios",
        href: "/admin/users",
        icon: Users,
      },
    ],
  },

] as const