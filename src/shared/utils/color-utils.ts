export function hexToRgb(
  hex: string
) {

  const clean =
    hex.replace(
      "#",
      ""
    )

  return {

    r:
      parseInt(
        clean.slice(0, 2),
        16
      ) || 0,

    g:
      parseInt(
        clean.slice(2, 4),
        16
      ) || 0,

    b:
      parseInt(
        clean.slice(4, 6),
        16
      ) || 0,

  }

}

export function rgbToHex(
  r: number,
  g: number,
  b: number
) {

  return (

    "#" +

    [r, g, b]

      .map(
        value =>

          Math.max(
            0,
            Math.min(
              255,
              value
            )
          )

            .toString(16)

            .padStart(
              2,
              "0"
            )
      )

      .join("")

  )

}