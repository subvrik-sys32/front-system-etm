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
        href: "/processes?code=ct",
        icon: Scissors,
      },
      {
        label: "Plegado",
        href: "/processes?code=pl",
        icon: FoldHorizontal,
      },
      {
        label: "Soldadura",
        href: "/processes?code=sd",
        icon: Wrench,
      },
      {
        label: "Pintura",
        href: "/processes?code=pt",
        icon: PaintBucket,
      },
      {
        label: "Ensamble",
        href: "/processes?code=en",
        icon: Package,
      },
      {
        label: "Despacho",
        href: "/processes?code=ds",
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