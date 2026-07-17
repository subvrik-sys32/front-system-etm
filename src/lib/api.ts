import axios from "axios"

// Sin barra al final, sin importar cómo esté seteada la variable
// en Vercel (fácil de pegar por error con "/" al final). Usar esto
// en vez de leer process.env.NEXT_PUBLIC_API_URL directo cada vez
// que se arma una URL a mano (no vía axios) — axios normaliza
// automáticamente baseURL + path, pero una concatenación cruda con
// template string no, y eso ya causó un bug real: "...com//ruta"
// con doble barra, que el backend no matcheaba (404).
export const apiBaseUrl =
  (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "")

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})