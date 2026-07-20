export function formatDate(date?: string | null) {
  if (!date) return "-"

  const d = new Date(date)

  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}