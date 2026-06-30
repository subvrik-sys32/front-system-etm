"use client"

import {
  ChevronDown,
  LucideIcon,
  Plus,
  X,
} from "lucide-react"

import {
  cn,
} from "@/shared/utils/utils"

import {
  getBadgeColors,
  type BadgeVariant,
} from "@/shared/utils/badge-colors"

import {
  ENTITY_ICONS,
  type EntityIcon,
} from "@/shared/constants/entity-icons"

type DynamicBadgeProps={

  label:string

  color:string

  icon?:EntityIcon

  iconComponent?:LucideIcon

  variant?:BadgeVariant

  muted?:boolean

  active?:boolean

  placeholder?:boolean

  showChevron?:boolean

  chevronOpen?:boolean

  showRemove?:boolean

  onRemove?:()=>void

  compact?:boolean

  reserveActionsSpace?:boolean

  width?:
    | "content"
    | "field"
    | "project"
    | "process"

}

const widthClasses={

  content:"px-2.5",

  field:"w-full px-2.5",

  project:"w-[560px] px-3",

  process:"w-[90px] px-2",

} as const

export function DynamicBadge({

  label,

  color,

  icon,

  iconComponent,

  variant="subtle",

  muted=false,

  active=false,

  placeholder=false,

  showChevron=false,

  chevronOpen=false,

  showRemove=false,

  onRemove,

  compact=false,

  width="content",

  reserveActionsSpace=false,

}:DynamicBadgeProps){

  const safeHex=
    color ?? "#64748B"

  const badgeColors=
    getBadgeColors(
      safeHex,
      variant
    )

  const Icon=
    placeholder
      ? Plus
      : iconComponent
        ? iconComponent
        : icon
          ? ENTITY_ICONS[icon]
          : undefined

  const textColor=

    placeholder

      ? "rgb(140,140,140)"

      : muted

        ? "rgb(90,90,90)"

        : badgeColors.text

  const backgroundColor=

    placeholder

      ? "rgba(255,255,255,0.05)"

      : muted

        ? "rgba(255,255,255,0.05)"

        : active

          ? badgeColors.backgroundActive

          : badgeColors.background

  const boxShadow=

    active

      ? badgeColors.shadow.active

      : badgeColors.shadow.default

  const actionColor=

    muted

      ? "rgba(255,255,255,0.35)"

      : badgeColors.text

  return(

    <span
      className={cn(

        "group relative inline-flex min-w-0 select-none items-center rounded-full text-xs font-semibold uppercase tracking-[0.06em]",

        compact
          ? "h-8"
          : "min-h-8 py-1.5",

        "transition-all duration-150 ease-out",

        widthClasses[width],

      )}
      style={{

        color:textColor,

        backgroundColor,

        boxShadow:

          muted ||
          placeholder

            ? undefined

            : boxShadow,

      }}
      onMouseDown={event=>
        event.preventDefault()
      }
      onMouseEnter={(event)=>{

        if(
          muted ||
          placeholder ||
          active
        ){
          return
        }

        event.currentTarget.style.boxShadow=
          badgeColors.shadow.hover

        event.currentTarget.style.backgroundColor=
          badgeColors.backgroundHover

      }}
      onMouseLeave={(event)=>{

        if(
          muted ||
          placeholder ||
          active
        ){
          return
        }

        event.currentTarget.style.boxShadow=
          badgeColors.shadow.default

        event.currentTarget.style.backgroundColor=
          badgeColors.background

      }}
    >

      <div className="relative flex w-full items-center justify-center">

        <div
          className={cn(

            "flex min-w-0 items-center gap-1.5",

            reserveActionsSpace &&
              "pr-8"

          )}
        >

          {Icon && (

            <span className="flex shrink-0 items-center justify-center leading-none">

              <Icon
                size={14}
              />

            </span>

          )}

          <span className="min-w-0 truncate leading-none">

            {label}

          </span>

        </div>

        {(showChevron || showRemove) && (

          <div className="absolute right-0 flex items-center">

            {showChevron && (

              <ChevronDown
                size={14}
                style={{
                  color:actionColor,
                }}
                className={cn(

                  "transition-all duration-200",

                  showRemove &&
                    "opacity-50 group-hover:-translate-x-4 group-hover:opacity-0",

                  !showRemove &&
                    "opacity-50",

                  chevronOpen &&
                    "rotate-180"

                )}
              />

            )}

            {showRemove && onRemove && (

              <span
                role="button"
                tabIndex={0}
                onClick={(event)=>{

                  event.preventDefault()
                  event.stopPropagation()

                  onRemove()

                }}
                onKeyDown={(event)=>{

                  if(
                    event.key==="Enter" ||
                    event.key===" "
                  ){

                    event.preventDefault()

                    onRemove()

                  }

                }}
                style={{
                  color:actionColor,
                }}
                className="absolute right-0 cursor-pointer opacity-0 transition-all duration-200 group-hover:opacity-100"
              >

                <X
                  size={12}
                  strokeWidth={2.5}
                  className="transition-all duration-150 hover:scale-110"
                />

              </span>

            )}

          </div>

        )}

      </div>

    </span>

  )

}