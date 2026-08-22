/**
 * SSOT — botones de chrome del EntityToolbar / DesktopTopBar / TopBar móvil.
 * Contraste legible en light y dark (bg-muted, no bg-chrome que se funde en dark).
 */

/** Desktop / toolbar: 32×32 */
export const TOOLBAR_CHROME_ICON_BTN =
  "relative flex size-8 shrink-0 touch-none items-center justify-center overflow-visible rounded-full bg-muted text-foreground shadow-xs backdrop-blur-xl transition-colors duration-150 hover:bg-muted/80 hover:text-foreground"

export const TOOLBAR_CHROME_ICON_BTN_ACTIVE =
  "bg-foreground/15 text-foreground"

/** TopBar móvil (y triggers topbar): 40×40, mismo contraste */
export const TOPBAR_ICON_BTN =
  "relative flex size-10 shrink-0 items-center justify-center overflow-visible rounded-full bg-muted text-foreground shadow-xs backdrop-blur-xl transition-colors duration-150 hover:bg-muted/80 hover:text-foreground active:bg-foreground/10"

export const TOPBAR_ICON_BTN_ACTIVE =
  "bg-foreground/15 text-foreground"

/** Icon size dentro del círculo chrome desktop */
export const TOOLBAR_CHROME_ICON_SIZE = 14 as const
