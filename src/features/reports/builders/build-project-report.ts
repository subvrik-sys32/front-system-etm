import type{
  ProjectReport,
}from"../types/project-report.types"

import type{
  TimeTrackingRow,
}from"../types/reports.types"

export function buildProjectReport(
  rows:TimeTrackingRow[],
):ProjectReport[]{

  const map=
    new Map<
      string,
      TimeTrackingRow[]
    >()

  for(const row of rows){

    const list=
      map.get(
        row.projectName,
      )??[]

    list.push(row)

    map.set(
      row.projectName,
      list,
    )

  }

  return Array.from(
    map.entries(),
  ).map(([projectName,rows])=>{

    const operators=
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
      )

    const tasks=
      new Set(
        rows.map(
          row=>
            row.taskId,
        ),
      )

    const processes=
      new Set(
        rows.map(
          row=>
            row.processCode,
        ),
      )

    return{

      projectName,

      clientName:
        rows[0].clientName,

      tasks:
        tasks.size,

      operators:
        operators.size,

      processes:
        processes.size,

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

      totalPiecesExpected:
        rows.reduce(
          (sum,row)=>
            sum+
            row.piecesExpected,
          0,
        ),

      totalPiecesOutput:
        rows.reduce(
          (sum,row)=>
            sum+
            (row.piecesOutput??0),
          0,
        ),

      totalDurationMinutes:
        rows.reduce(
          (sum,row)=>
            sum+
            (row.durationMinutes??0),
          0,
        ),

      rows,

    }

  })

}