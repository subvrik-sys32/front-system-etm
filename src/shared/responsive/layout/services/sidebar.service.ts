import { api } from "@/lib/api"

import type { SidebarCounts } from "../types/sidebar-counts.types"

export const sidebarService = {

  getCounts: (signal?: AbortSignal) =>
    api
      .get<SidebarCounts>("/sidebar/counts", { signal })
      .then(r => r.data),

}