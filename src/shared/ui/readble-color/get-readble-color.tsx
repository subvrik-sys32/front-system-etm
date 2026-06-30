export function getReadableColor(hex:string){

  const clean=
    hex.replace("#","")

  const r=
    parseInt(clean.slice(0,2),16)

  const g=
    parseInt(clean.slice(2,4),16)

  const b=
    parseInt(clean.slice(4,6),16)

  const luminance=
    (0.299*r)+(0.587*g)+(0.114*b)

  return luminance<140
    ? lightenColor(hex,0.35)
    : hex

}

function lightenColor(
  hex:string,
  amount:number
){

  const clean=
    hex.replace("#","")

  const r=
    parseInt(clean.slice(0,2),16)

  const g=
    parseInt(clean.slice(2,4),16)

  const b=
    parseInt(clean.slice(4,6),16)

  const nr=
    Math.round(
      r+(255-r)*amount
    )

  const ng=
    Math.round(
      g+(255-g)*amount
    )

  const nb=
    Math.round(
      b+(255-b)*amount
    )

  return `#${[
    nr,
    ng,
    nb,
  ]
    .map(v=>
      v
        .toString(16)
        .padStart(2,"0")
    )
    .join("")}`

}