// Cada columna de contenido usa minmax(piso, fr) — no un px fijo —
// para que TODAS puedan achicarse/crecer juntas y proporcionalmente
// con el ancho real disponible. El contenedor de la tabla
// (TableScrollContainer) tiene "min-w-full" en el grid interno, así
// que el "fr" tiene de dónde repartir espacio real: si sobra ancho,
// las columnas crecen proporcional en vez de dejar un hueco vacío.
//
// Esto solo aplica al modo grilla normal (ancho del contenedor por
// encima de COMPACT_BREAKPOINT_PX en entity-table.tsx). Por debajo
// de ese punto, la fila entera cambia a modo card — no se oculta
// ninguna columna ni se depende de scroll horizontal (ver
// entity-table-card-row.tsx).
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