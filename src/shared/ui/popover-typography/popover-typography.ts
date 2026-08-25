/**
 * Tipografía de paneles popover (presencia, mensajes, notificaciones).
 * Alineada al SearchField: `text-sm` en contenido principal
 * (`sm:text-sm` del input de búsqueda).
 *
 * Escala:
 *  - title   → título del panel
 *  - primary → nombre / línea principal de fila
 *  - body    → snippet / vacío
 *  - meta    → hora, estado, contexto
 *  - action  → Limpiar / Ver más / Ver todos
 */
export const POPOVER_TITLE = "text-sm font-semibold tracking-tight text-foreground"
export const POPOVER_PRIMARY = "text-sm font-medium text-foreground"
export const POPOVER_BODY = "text-sm text-muted-foreground"
export const POPOVER_META = "text-xs text-muted-foreground"
export const POPOVER_ACTION = "text-xs font-medium text-muted-foreground"
export const POPOVER_EMPTY = "text-sm text-muted-foreground"
