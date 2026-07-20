import type{
  ProcessReport,
}from"../types/process-report.types"

import type{
  TimeTrackingRow,
}from"../types/reports.types"

export function buildProcessReport(
  rows:TimeTrackingRow[],
):ProcessReport[]{

  const map=
    new Map<
      string,
      TimeTrackingRow[]
    >()

  for(const row of rows){

    const list=
      map.get(
        row.processCode,
      )??[]

    list.push(row)

    map.set(
      row.processCode,
      list,
    )

  }

  return Array.from(
    map.values(),
  ).map(rows=>{

    const first=
      rows[0]

    return{

      processCode:
        first.processCode,

      processLabel:
        first.processLabel,

      operators:
        new Set(
          rows
            .filter(
              row=>
                row.operatorName!=="Sin asignar",
            )
            .map(
              row=>
                row.operatorName,
            ),
        ).size,

      tasks:
        new Set(
          rows.map(
            row=>
              row.taskId,
          ),
        ).size,

      completed:
        rows.filter(
          row=>
            row.status==="COMPLETED",
        ).length,

      reviewed:
        rows.filter(
          row=>
            row.status==="REVIEWED",
        ).length,

      pending:
        rows.filter(
          row=>
            row.status==="PENDING",
        ).length,

      progress:
        rows.filter(
          row=>
            row.status==="PROGRESS",
        ).length,

      paused:
        rows.filter(
          row=>
            row.status==="PAUSED",
        ).length,

      queue:
        rows.filter(
          row=>
            row.status==="QUEUE",
        ).length,

      totalDurationMinutes:
        rows.reduce(
          (sum,row)=>
            sum+
            (row.durationMinutes??0),
          0,
        ),

      totalPiecesOutput:
        rows.reduce(
          (sum,row)=>
            sum+
            (row.piecesOutput??0),
          0,
        ),

      rows,

    }

  })

}