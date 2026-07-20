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
// (targetRoles), así que si esto llega, es relevante para mí.
//
// OJO: pedir /auth/me sola no alcanza. Eso actualiza los stores del
// front (lo que se ve en pantalla), pero el accessToken que se
// manda en cada request queda IGUAL — y el backend arma
// request.user.permissions a partir de lo firmado en ese token, no
// contra la base de datos. Entonces el sidebar podía mostrar una
// sección nueva pero el fetch real seguía devolviendo 403.
//
// Por eso acá se llama a /auth/refresh: reemite el token con los
// permisos al día y lo deja guardado (authService.refresh ya hace
// authSession.set internamente), y de paso devuelve el mismo
// user/permissions que /auth/me para pisar los stores.
export function rolePermissionsHandler(
  _event: RealtimeEvent,
) {

  authService.refresh()
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