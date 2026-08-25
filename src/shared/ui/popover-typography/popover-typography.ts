/**
 * Tipografía de paneles popover (presencia, mensajes, notificaciones).
 * Misma escala que SidebarRow (`text-xs`) y SearchField.
 *
 * Escala:
 *  - title   → título del panel
 *  - primary → nombre / línea principal de fila
 *  - body    → snippet / vacío
 *  - meta    → hora, estado, contexto (un paso más suave)
 *  - action  → Limpiar / Ver más / Ver todos
 */
export const POPOVER_TITLE = "text-xs font-semibold tracking-tight text-foreground"
export const POPOVER_PRIMARY = "text-xs font-medium text-foreground"
export const POPOVER_BODY = "text-xs text-muted-foreground"
export const POPOVER_META = "text-[11px] text-muted-foreground"
export const POPOVER_ACTION = "text-xs font-medium text-muted-foreground"
export const POPOVER_EMPTY = "text-xs text-muted-foreground"
