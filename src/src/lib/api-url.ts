// Normaliza NEXT_PUBLIC_API_URL sacando cualquier "/" final.
// Evita el bug de la doble barra ("https://api.x.com//realtime/events")
// cuando la env var se define con slash al final en algunos entornos.
export const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "")