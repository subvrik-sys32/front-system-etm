/**
 * SSOT — botones de chrome del EntityToolbar / DesktopTopBar.
 * Misma huella que EntityToolbarSearch (lupa): 32×32, círculo, bg-chrome.
 * EntityToggle NO usa esto (diseño segmentado Día/Semana/Mes).
 */
export const TOOLBAR_CHROME_ICON_BTN =
  "relative flex size-8 shrink-0 touch-none items-center justify-center overflow-visible rounded-full bg-chrome text-muted-foreground shadow-xs backdrop-blur-xl transition-all duration-200 hover:text-foreground"

export const TOOLBAR_CHROME_ICON_BTN_ACTIVE =
  "bg-muted text-foreground"

/** Icon size dentro del círculo chrome */
export const TOOLBAR_CHROME_ICON_SIZE = 14 as const
