// Cada columna de contenido usa minmax(piso, fr) — no un px fijo —
// para que el ancho quede repartido de forma proporcional dentro
// del grid interno de cada card (ver entity-table-card-row.tsx,
// que es el único modo de fila que usa EntityTable hoy).
//
// Las únicas en px fijo son las de solo-ícono (drag, expand,
// actions): su contenido nunca cambia de tamaño, no tiene sentido
// que "crezcan".
export const TABLE_WIDTHS={

  drag:"40px",
  expand:"40px",
  actions:"120px",

  id:"minmax(60px,0.5fr)",
  projectCode:"minmax(70px,0.6fr)",
  delivery:"minmax(90px,0.7fr)",

  small:"minmax(110px,1fr)",
  medium:"minmax(130px,1.2fr)",
  large:"minmax(160px,1.4fr)",

  reference:"minmax(140px,2fr)",
  email:"minmax(140px,2fr)",

} as const