import {
  hexToRgb,
} from "@/shared/utils/color-utils"

export type BadgeVariant=
  | "subtle"
  | "solid"

export function getLuminance(
  hex:string
){

  const {r,g,b}=
    hexToRgb(hex)

  const normalize=(
    value:number
  )=>{

    const channel=
      value/255

    return channel<=0.03928

      ? channel/12.92

      : Math.pow(
          (channel+0.055)/1.055,
          2.4
        )

  }

  return (

    0.2126*
    normalize(r)

    +

    0.7152*
    normalize(g)

    +

    0.0722*
    normalize(b)

  )

}

function getContrastRatio(
  colorA:string,
  colorB:string
){

  const luminanceA=
    getLuminance(colorA)

  const luminanceB=
    getLuminance(colorB)

  const lighter=
    Math.max(
      luminanceA,
      luminanceB
    )

  const darker=
    Math.min(
      luminanceA,
      luminanceB
    )

  return (
    lighter+0.05
  )/(
    darker+0.05
  )

}

function getContrastText(
  hex:string
){

  const whiteContrast=
    getContrastRatio(
      hex,
      "#FFFFFF"
    )

  const darkContrast=
    getContrastRatio(
      hex,
      "#111827"
    )

  return whiteContrast>
    darkContrast

    ? "#FFFFFF"

    : "#111827"

}

function rgba(
  hex:string,
  alpha:number
){

  const {r,g,b}=
    hexToRgb(hex)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`

}

function tint(
  hex:string,
  amount=0.5
){

  const {r,g,b}=
    hexToRgb(hex)

  const mix=(
    value:number
  )=>

    Math.round(
      value+
      (255-value)*
      amount
    )

  return{
    r:mix(r),
    g:mix(g),
    b:mix(b),
  }

}

function tintRgba(
  hex:string,
  amount:number,
  alpha:number
){

  const tinted=
    tint(
      hex,
      amount
    )

  return `rgba(${tinted.r}, ${tinted.g}, ${tinted.b}, ${alpha})`

}

export function getBadgeColors(
  hex:string,
  variant:BadgeVariant="subtle"
){

  switch(variant){

    case "solid":

      return{

        background:hex,
        backgroundHover:hex,
        backgroundActive:hex,

        glow:rgba(
          hex,
          0.25
        ),

        text:getContrastText(
          hex
        ),

        shadow:{
          default:"none",
          hover:`0 4px 12px rgba(0,0,0,0.16)`,
          active:`0 8px 20px rgba(0,0,0,0.24)`,
        },

      }

    default:

      return{

        background:rgba(
          hex,
          0.14
        ),

        backgroundHover:rgba(
          hex,
          0.20
        ),

        backgroundActive:rgba(
          hex,
          0.28
        ),

        glow:rgba(
          hex,
          0.10
        ),

        text:tintRgba(
          hex,
          0.84,
          1
        ),

        shadow:{

          default:"none",

          hover:`
            0 0 0 1px ${rgba(hex,0.12)},
            0 4px 12px rgba(0,0,0,0.10)
          `,

          active:`
            0 0 0 1px ${rgba(hex,0.18)},
            0 8px 20px rgba(0,0,0,0.18)
          `,

        },

      }

  }

}

export function getProcessCardTextColor(
  hex:string
){

  return getBadgeColors(
    hex,
    "subtle"
  ).text

}