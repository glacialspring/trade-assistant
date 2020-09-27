import React, { useState, useLayoutEffect, useRef, useImperativeHandle } from 'react'

const lime = '#66bb6a'
const green = '#26a69a'
const red = '#ef5350'
const gray = '#758696'
const orange = '#f57c00'
const blue = '#1976d2'

const Chart = props => {
  const {
    candles,
    width: canvasW,
    height: canvasY,
    isSettingStop,
    isSettingTarget,
    stop,
    targets,
    onSetStop,
    onSetTarget,
  } = props
  const isEditing = isSettingStop || isSettingTarget
  const currentPrice = candles[candles.length-1].close

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
  }
  const onMouseLeave = () => {
    setCursor(undefined)
  }

  // stops
  const onPlaceStop = e => {
    const y = e.clientY - origin.current.y
    let stop_ = -(y + margin - canvasY) / drawableH * height + min
    stop_ = Number(stop_.toFixed(2))
    onSetStop(stop_)
  }
  // targets
  const onPlaceTarget = e => {
    const y = e.clientY - origin.current.y
    let target_ = -(y + margin - canvasY) / drawableH * height + min
    target_ = Number(target_.toFixed(2))
    onSetTarget(target_)
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
  const currentY = canvasY - (currentPrice - min)/height * drawableH - margin

  const stopY = stop && canvasY - (stop-min)/height * drawableH - margin

  const renderCandle = cd => {
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
    )
  }

  return (
    <div
      ref={ containerRef }
      onMouseMove={ onMouseMove }
      onMouseLeave={ onMouseLeave }
      onClick={ isSettingStop ? onPlaceStop : (isSettingTarget ? onPlaceTarget : undefined ) }
      style={{position: 'relative'}}
    >
      <label style={{
          color: gray,
          fontSize: 13,
          position: 'absolute',
          right: -7,
          top: currentY,
          transform: 'translate(100%, -50%)',
        }}
      >
        { currentPrice }
      </label>
      { isEditing && cursor &&
        <label style={{
            color: 'white',
            position: 'absolute',
            fontSize: 13,
            right: -7,
            top: cursor.y,
            transform: 'translate(100%, -50%)',
          }}
        >
          { (-(cursor.y + margin - canvasY) / drawableH * height + min).toFixed(2) }
        </label>
      }
      { targets.map( target => {
        const y = canvasY - (target-min)/height * drawableH - margin
        return (
          <label style={{
              color: lime,
              position: 'absolute',
              fontSize: 13,
              right: -7,
              top: y,
              transform: 'translate(100%, -50%)',
            }}
          >
            { target.toFixed(2) }
          </label>
        )})
      }
      { stop &&
        <label style={{
            color: orange,
            position: 'absolute',
            fontSize: 13,
            right: -7,
            top: canvasY - (stop-min)/height * drawableH - margin,
            transform: 'translate(100%, -50%)',
          }}
        >
          { stop.toFixed(2) }
        </label>
      }
      <svg height={ canvasY } width={ canvasW }>
        { candles.map(renderCandle) }
        <line x1="0" y1={ currentY } x2={ canvasW } y2={ currentY } stroke={ blue } stroke-width="1" stroke-dasharray="1,2" />
        { isEditing && cursor &&
          <>
            <line x1="0" y1={ cursor.y } x2={ canvasW } y2={ cursor.y } stroke={ gray } stroke-width="1" stroke-dasharray="5,6" />
          </>
        }
        { stop &&
          <line x1="0" y1={ stopY } x2={ canvasW } y2={ stopY } stroke={ orange } stroke-width="1" stroke-dasharray="3,6" />
        }
        { targets.map(target => {
          const y = canvasY - (target-min)/height * drawableH - margin
          return (
            <line x1="0" y1={ y } x2={ canvasW } y2={ y } stroke={ lime } stroke-width="1" stroke-dasharray="3,6" />
          )})
        }
      </svg>
    </div>
  )
}

export default Chart
