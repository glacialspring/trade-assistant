import React from 'react'


const Chart = props => {
  const { candles } = props

  let min = 1000000000
  let max = -1
  for (const cd of candles) {
    if ( cd.high > max ) {
      max = cd.high
    }
    if ( cd.low < min ) {
      min = cd.low
    }
  }
  const startTs = candles[0].datetime
  const endTs = candles[candles.length-1].datetime

  const canvasW = 1000
  const canvasY = 500
  const margin = 10
  const drawableW = canvasW-2*margin
  const drawableH = canvasY-2*margin
  const candleWidth = drawableW / candles.length * 0.6
  const width = endTs - startTs
  const height = max - min

  return (
    <svg height={ canvasY } width={ canvasW }>
      { candles.map(cd => {
        const {
          open: o,
          close: c,
          low: l,
          high: h,
          datetime: ts,
        } = cd
        const x = (ts - startTs) / width * drawableW + margin
        const yo = canvasY - (o - min)/height * drawableH - margin
        const yc = canvasY - (c - min)/height * drawableH - margin
        const yl = canvasY - (l - min)/height * drawableH - margin
        const yh = canvasY - (h - min)/height * drawableH - margin
        const candleW_2 = candleWidth / 2
        const yt = Math.min(yo, yc)
        const yb = Math.max(yo, yc)
        const color = c > o ? '#26a69a' : '#ef5350'

        return (
          <polygon
            points={`${x-candleW_2},${yt} ${x},${yt} ${x},${yh} ${x},${yt} ${x+candleW_2},${yt} ${x+candleW_2},${yb} ${x},${yb} ${x},${yl} ${x},${yb} ${x-candleW_2},${yb}`}
            fill={ color }
            stroke={ color }
            stroke-width="1"
          />
        )})
      }
    </svg>
  )
}

export default Chart
