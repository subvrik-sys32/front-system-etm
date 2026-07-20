"use client"

import {
  create,
} from "zustand"

type PermissionStore={

  permissions:Set<string>

  setPermissions:(
    permissions:string[],
  )=>void

  clear:()=>void

  has:(
    code:string,
  )=>boolean

}

export const usePermissionStore=

  create<PermissionStore>()(

    (set,get)=>({

      permissions:new Set(),

      setPermissions:permissions=>

        set({

          permissions:new Set(
            permissions
          ),

        }),

      clear:()=>

        set({

          permissions:new Set(),

        }),

      has:code=>

        get()
          .permissions
          .has(code),

    }),

  )