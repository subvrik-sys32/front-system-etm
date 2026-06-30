"use client"

import type {
  EntityColumn,
} from "@/shared/ui/entity-table"

import {
  DynamicBadge,
} from "@/shared/ui/badge/dynamic-badge"

import {
  TABLE_WIDTHS,
} from "@/shared/constants/table-widths"

import type {
  User,
} from "@/features/users/types/user.types"

import {
  UserRowActions,
} from "../components/actions/user-row-actions"

export function useUserColumns():
EntityColumn<User>[]{

  return [

    {
      id:"id",
      align:"center",
      title:"N°",
      width:TABLE_WIDTHS.small,
      render:(_,context)=>(

        <span className="font-semibold text-white">

          {String(context.rowIndex+1).padStart(3,"0")}

        </span>

      ),
    },

    {
      id:"name",
      align:"center",
      title:"USUARIO",
      width:TABLE_WIDTHS.large,
      render:user=>(

        <DynamicBadge
          label={user.name}
          icon={user.icon}
          color={user.color}
          width="field"
        />

      ),
    },

    {
      id:"username",
      align:"center",
      title:"USERNAME",
      width:TABLE_WIDTHS.medium,
      render:user=>(

        <span>

          {user.username ?? "-"}

        </span>

      ),
    },

    {
      id:"email",
      align:"center",
      title:"EMAIL",
      width:TABLE_WIDTHS.email,
      render:user=>(

        <span className="truncate">

          {user.email}

        </span>

      ),
    },

    {
      id:"role",
      align:"center",
      title:"ROL",
      width:TABLE_WIDTHS.large,
      render:user=>(

        <DynamicBadge
          label={user.role.name}
          icon={user.role.icon}
          color={user.role.color}
          width="field"
        />

      ),
    },

    {
      id:"active",
      align:"center",
      title:"ESTADO",
      width:TABLE_WIDTHS.small,
      render:user=>(

        <DynamicBadge
          label={
            user.active
              ? "Activo"
              : "Inactivo"
          }
          color={
            user.active
              ? "#22C55E"
              : "#EF4444"
          }
          width="field"
        />

      ),
    },

    {
      id:"actions",
      align:"center",
      title:"",
      width:TABLE_WIDTHS.actions,
      render:user=>(

        <UserRowActions
          userId={user.id}
        />

      ),
      renderOverlay:()=>null,
    },

  ]

}