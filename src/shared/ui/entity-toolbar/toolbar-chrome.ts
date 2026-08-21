/**
 * SSOT — botones de chrome del EntityToolbar / DesktopTopBar / TopBar móvil.
 * Contraste legible en light y dark (no text-muted lavado).
 */

/** Desktop / toolbar: 32×32 */
export const TOOLBAR_CHROME_ICON_BTN =
  "relative flex size-8 shrink-0 touch-none items-center justify-center overflow-visible rounded-full bg-chrome text-foreground/80 shadow-xs backdrop-blur-xl transition-colors duration-150 hover:bg-muted hover:text-foreground"

export const TOOLBAR_CHROME_ICON_BTN_ACTIVE =
  "bg-muted text-foreground"

/** TopBar móvil (y triggers topbar): 40×40, mismo contraste */
export const TOPBAR_ICON_BTN =
  "relative flex size-10 shrink-0 items-center justify-center overflow-visible rounded-full bg-chrome text-foreground/80 shadow-xs backdrop-blur-xl transition-colors duration-150 hover:bg-muted hover:text-foreground active:bg-muted"

export const TOPBAR_ICON_BTN_ACTIVE =
  "bg-muted text-foreground"

/** Icon size dentro del círculo chrome desktop */
export const TOOLBAR_CHROME_ICON_SIZE = 14 as const
