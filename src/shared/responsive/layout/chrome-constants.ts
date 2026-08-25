// shared/responsive/layout/chrome-constants.ts

/**
 * Aire entre el borde superior del viewport y el chrome del topbar.
 * Mismo valor en mobile y desktop (safe-area se suma aparte).
 */
export const TOP_PAD_PX = 10

/** @deprecated usar TOP_PAD_PX */
export const DESKTOP_TOP_PAD_PX = TOP_PAD_PX

/** Altura del contenido del topbar mobile (h-14), sin pad ni safe-area. */
export const TOP_BAR_CONTENT_HEIGHT_PX = 56

/**
 * Reserva top mobile = contenido + respiro.
 * Los consumers suman env(safe-area-inset-top) cuando aplica.
 */
export const TOP_BAR_HEIGHT_PX = TOP_BAR_CONTENT_HEIGHT_PX + TOP_PAD_PX

/** Bottom nav + FAB clearance. */
export const BOTTOM_NAV_HEIGHT_PX = 80

/** pt-1 + h-10 input + mb-2 (mismo gap que empty mt-2). */
export const PAGE_SEARCH_BAR_HEIGHT_PX = 52

/**
 * Reserva top desktop = blur del topbar (~64) + pad.
 * Antes 64; +pad para no pegar al browser.
 */
export const DESKTOP_TOP_BAR_HEIGHT_PX = 64 + TOP_PAD_PX
