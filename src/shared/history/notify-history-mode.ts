import { toast } from "sonner"

/** Aviso unificado al entrar en modo histórico (lista / deep-link / toggle). */
export function notifyHistoryMode(scope: "tareas" | "procesos" | "proyectos") {
  toast.message("Modo histórico", {
    description: `Estás viendo ${scope} finalizados. Los mensajes son de solo lectura.`,
  })
}
