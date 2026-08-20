import axios from "axios"

/** Extrae mensaje legible de errores Nest/axios del módulo CAD AI. */
export function cadErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string | string[] }
      | undefined
    const msg = data?.message
    if (Array.isArray(msg) && msg.length > 0) return msg.join(", ")
    if (typeof msg === "string" && msg.trim()) return msg
    if (err.message) return err.message
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}
