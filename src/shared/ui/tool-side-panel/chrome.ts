/**
 * Chrome visual del sidebar de herramienta (Nesting desktop).
 * Única fuente — Nesting y CAD plantillas deben usar estas clases.
 */
export const TOOL_SIDEBAR_ASIDE =
  "flex h-full min-h-0 w-80 shrink-0 flex-col overflow-hidden rounded-2xl bg-muted p-3 shadow-xs dark:bg-foreground/5"

export const TOOL_SIDEBAR_INNER =
  "flex h-full min-h-0 flex-col gap-3 overflow-hidden"

/** Superficie de contenido bajo el toggle (tabs). */
export const TOOL_SIDEBAR_CONTENT_SCROLL =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-2xl bg-background p-3 dark:bg-foreground/[0.06]"

export const TOOL_SIDEBAR_CONTENT_FILL =
  "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-background p-3 dark:bg-foreground/[0.06]"

/** Sección colapsable (PROYECTO / CONFIG / PARÁMETROS) */
export const TOOL_SIDE_SECTION =
  "flex flex-col rounded-xl bg-muted/80 p-1 transition-colors dark:bg-foreground/5"

export const TOOL_SIDE_SECTION_TITLE =
  "text-xs font-semibold uppercase tracking-widest text-muted-foreground"

export const TOOL_SIDE_FIELD_LABEL =
  "text-xs font-medium text-muted-foreground"

/** Input del sidebar — text-xs, misma huella Nesting */
export const TOOL_SIDE_INPUT =
  "h-9 w-full rounded-lg border-0 bg-background/50 px-3 text-xs text-foreground outline-none ring-0 focus-visible:ring-1 focus-visible:ring-primary/30"

export const TOOL_SIDE_INPUT_CENTER = `${TOOL_SIDE_INPUT} text-center tabular-nums`
