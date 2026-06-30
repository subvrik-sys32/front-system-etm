import {
  Input,
} from "@/components/ui/input"

import type {
  EntityEditorProps,
} from "../entity-dialog.types"

import {
  hexToRgb,
  rgbToHex,
} from "@/shared/utils/color-utils"

const channels=[
  ["r","R"],
  ["g","G"],
  ["b","B"],
] as const

export function EntityCustomColor({

  value,
  onChange,

}:EntityEditorProps){

  const rgb=
    hexToRgb(
      value.color,
    )

  function updateRgb(

    key:"r"|"g"|"b",

    nextValue:string,

  ){

    const parsed=
      Number(
        nextValue,
      )

    if(
      Number.isNaN(
        parsed,
      )
    ){

      return

    }

    const next={

      ...rgb,

      [key]:
        parsed,

    }

    onChange({

      ...value,

      color:
        rgbToHex(

          next.r,

          next.g,

          next.b,

        ),

    })

  }

  function updateHex(
    nextHex:string,
  ){

    const normalized=

      nextHex.startsWith(
        "#",
      )

        ? nextHex

        : `#${nextHex}`

    if(

      !/^#?[0-9A-Fa-f]{0,6}$/.test(
        normalized,
      )

    ){

      return

    }

    onChange({

      ...value,

      color:
        normalized,

    })

  }

  return(

    <div className="space-y-3">

      <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">

        Color personalizado

      </p>

      <div className="flex overflow-hidden rounded-xl bg-white/4">

        <div className="relative h-9 w-20 shrink-0 overflow-hidden">

          <input
            type="color"
            value={value.color}
            onChange={event=>

              updateHex(
                event.target.value,
              )

            }
            className="absolute inset-0 h-full w-full scale-150 cursor-pointer"
          />

        </div>

        <Input
          value={
            value.color.toUpperCase()
          }
          onChange={event=>

            updateHex(
              event.target.value,
            )

          }
          className="h-9 flex-1 bg-transparent px-6 text-base font-semibold uppercase tracking-wide text-neutral-200"
        />

      </div>

      <div className="grid h-9 w-full grid-cols-3 gap-4">

        {channels.map(([key,label])=>(

          <div
            key={key}
            className="space-y-1"
          >

            <Input
              value={
                rgb[key]
              }
              inputMode="numeric"
              onChange={event=>

                updateRgb(
                  key,
                  event.target.value,
                )

              }
              className="h-9 rounded-xl text-center text-sm font-semibold text-neutral-300"
            />

            <p className="text-center text-xs font-semibold text-neutral-500">

              {label}

            </p>

          </div>

        ))}

      </div>

    </div>

  )

}