export function formatDate(date?: string | null) {
  if (!date) return "-"

  const d = new Date(date)

  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// "YYYY-MM-DD" -> Date local (mediodía, no medianoche, para
// evitar que un redondeo de reloj lo empuje al día anterior).
// OJO: no usar `new Date(str)` acá — eso parsea como UTC y en
// timezones con offset negativo (ej. Perú, UTC-5) corre la fecha
// un día para atrás al mostrarla en local.
export function parseISODate(value?: string | null): Date | null {

  if (!value) {
    return null
  }

  const [year, month, day] = value.split("-").map(Number)

  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day, 12)

}

// Date -> "YYYY-MM-DD" usando los componentes LOCALES (no
// toISOString(), que convierte a UTC y puede correr el día).
export function toISODateString(date: Date | null): string {

  if (!date) {
    return ""
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`

}