import type{
  OperatorReport,
}from"../types/operator-report.types"

import type{
  TimeTrackingRow,
}from"../types/reports.types"

import{
  buildOperatorSummary,
}from"./build-operator-summary"

export function buildOperatorReport(
  rows:TimeTrackingRow[],
):OperatorReport[]{

  const summaries=
    buildOperatorSummary(
      rows,
    )

  return summaries.map(
    summary=>({

      operatorName:
        summary.operatorName,

      summary,

      rows:rows.filter(
        row=>
          row.operatorName===
          summary.operatorName,
      ),

    }),
  )

}