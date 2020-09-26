import React, { useState, useLayoutEffect, useRef } from 'react'

const lime = '#66bb6a'
const green = '#26a69a'
const red = '#ef5350'
const gray = '#758696'
const orange = '#f57c00'

const Chart = props => {
  const {
    candles,
    width: canvasW,
    height: canvasY,
  } = props

  // touch
  const containerRef = useRef()
  const origin = useRef()
  useLayoutEffect(() => {
    const { x, y } = containerRef.current.getBoundingClientRect()
    origin.current = { x,y }
  })
  const [cursor, setCursor] = useState()
  const onMouseMove = e => {
    setCursor({ x: e.clientX - origin.current.x, y: e.clientY - origin.current.y })
    console.log(cursor)
  }
  const onMouseLeave = () => {
    setCursor(undefined)
  }

  // stops
  const [stops, setStops] = useState([])
  const onPlaceStop = e => {
    const y = e.clientY - origin.current.y
    const stop = -(y + margin - canvasY) / drawableH * height
    setStops([...stops, stop])
  }
  // targets
  const [targets, setTargets] = useState([])
  const onPlaceTarget = e => {
    const y = e.clientY - origin.current.y
    const target = -(y + margin - canvasY) / drawableH * height
    setTargets([...targets, target])
  }

  // draw
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

  const margin = 10
  const drawableW = canvasW-2*margin
  const drawableH = canvasY-2*margin
  const candleWidth = drawableW / candles.length * 0.6
  const width = endTs - startTs
  const height = max - min

  return (
    <div
      ref={ containerRef }
      onMouseMove={ onMouseMove }
      onMouseLeave={ onMouseLeave }
      onClick={ onPlaceTarget }
    >
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
          const color = c > o ? green : red

          return (
            <polygon
              points={`${x-candleW_2},${yt} ${x},${yt} ${x},${yh} ${x},${yt} ${x+candleW_2},${yt} ${x+candleW_2},${yb} ${x},${yb} ${x},${yl} ${x},${yb} ${x-candleW_2},${yb}`}
              fill={ color }
              stroke={ color }
              stroke-width="1"
            />
          )})
        }
        { cursor &&
          <>
            <line x1="0" y1={ cursor.y } x2={ canvasW } y2={ cursor.y } stroke={ gray } stroke-width="1" stroke-dasharray="5,6" />
          </>
        }
        { stops.map( stop => {
            const y = canvasY - stop/height * drawableH - margin
            return (
              <line x1="0" y1={ y } x2={ canvasW } y2={ y } stroke={ orange } stroke-width="2" stroke-dasharray="2,6" />
            )
          })
        }
        { targets.map( target => {
            const y = canvasY - target/height * drawableH - margin
            return (
              <line x1="0" y1={ y } x2={ canvasW } y2={ y } stroke={ lime } stroke-width="2" stroke-dasharray="2,6" />
            )
          })
        }
      </svg>
    </div>
  )
}

export default Chart
