import { authService } from "@/features/auth/services/auth.service"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { usePermissionStore } from "@/features/permissions/store/permission-store"

import type { RealtimeEvent } from "../types/realtime-event"

// Antes los permisos de un usuario ya logueado se cargaban UNA SOLA
// vez, al iniciar sesión (bootstrap) — si un admin le sacaba o
// agregaba un permiso al rol de esa persona MIENTRAS estaba
// conectada, su sesión seguía con los permisos viejos hasta que
// refrescara la página a mano. El backend ya manda este evento
// SOLO a los usuarios conectados con el rol afectado
// (targetRoles), así que si esto llega, es relevante para mí —
// alcanza con volver a pedir /auth/me y pisar los stores, mismo
// mecanismo que usa el bootstrap inicial.
export function rolePermissionsHandler(
  _event: RealtimeEvent,
) {

  authService.me()
    .then(({ user, permissions }) => {

      useAuthStore.getState().setUser(user)
      usePermissionStore.getState().setPermissions(permissions)

    })
    .catch(() => {
      // No crítico: en el peor caso, la próxima navegación (que ya
      // dispara sus propios chequeos contra el backend) va a
      // encontrar el 403 real si hiciera falta.
    })

}