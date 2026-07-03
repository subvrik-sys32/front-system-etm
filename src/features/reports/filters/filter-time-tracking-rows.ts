import type{
  ExportScope,
}from"@/shared/export"

import type{
  TimeTrackingRow,
}from"../types/reports.types"

export function filterTimeTrackingRows(
  rows:TimeTrackingRow[],
  scope:ExportScope,
):TimeTrackingRow[]{

  switch(scope){

    case"active":

      return rows.filter(
        row=>
          row.status!=="COMPLETED"&&
          row.status!=="REVIEWED",
      )

    case"history":

      return rows.filter(
        row=>
          row.status==="COMPLETED"||
          row.status==="REVIEWED",
      )

    case"executive":

    case"all":

      return rows

  }

}