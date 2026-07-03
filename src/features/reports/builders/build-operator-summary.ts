import type{
  OperatorSummaryRow,
  TimeTrackingRow,
}from"../types/reports.types"

export function buildOperatorSummary(
  rows:TimeTrackingRow[],
):OperatorSummaryRow[]{

  const map=
    new Map<
      string,
      OperatorSummaryRow
    >()

  for(const row of rows){

    if(
      row.operatorName===
      "Sin asignar"
    ){

      continue

    }

    const summary=
      map.get(
        row.operatorName,
      )??{

        operatorName:
          row.operatorName,

        stepsAssigned:0,
        stepsCompleted:0,

        totalDurationMinutes:0,

        avgDurationMinutes:0,

        totalPiecesOutput:0,

        piecesPerHour:0,

      }

    summary.stepsAssigned++

    if(
      row.status==="COMPLETED"||
      row.status==="REVIEWED"
    ){

      summary.stepsCompleted++

    }

    if(
      row.durationMinutes!==null
    ){

      summary.totalDurationMinutes+=
        row.durationMinutes

    }

    if(
      row.piecesOutput!==null
    ){

      summary.totalPiecesOutput+=
        row.piecesOutput

    }

    map.set(
      row.operatorName,
      summary,
    )

  }

  const summaries=
    Array.from(
      map.values(),
    )

  for(const summary of summaries){

    summary.avgDurationMinutes=

      summary.stepsCompleted>0

        ?Math.round(

          summary.totalDurationMinutes/

          summary.stepsCompleted,

        )

        :0

    const hours=

      summary.totalDurationMinutes/

      60

    summary.piecesPerHour=

      hours>0

        ?Math.round(

          summary.totalPiecesOutput/

          hours,

        )

        :0

  }

  return summaries.sort(

    (a,b)=>

      b.piecesPerHour-

      a.piecesPerHour,

  )

}