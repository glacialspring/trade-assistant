import React, { useState, useEffect, useRef } from 'react'
import Chart from './components/chart/chart'
import candles from './components/chart/TSLA_short'

const lime = '#66bb6a'
const blue = '#1976d2'
const gray = '#2a2e39'
const orange = '#f57c00'

const OrderPlacer = () => {
  const currentPrice = candles[candles.length-1].close
  const [isSettingStop, setIsSettingStop] = useState( false )
  const [isSettingTarget, setIsSettingTarget] = useState( false )
  const isEditing = isSettingStop || isSettingTarget

  const [stop, setStop] = useState()
  const [target, setTarget] = useState()
  const [riskReward, setRiskReward] = useState()
  const refreshRiskReward = () => {
    if ( stop !== undefined && target !== undefined ) {
      setRiskReward(( target - currentPrice ) / ( currentPrice - stop ))
    }
  }
  const onSetStop = stop_ => {
    setStop(stop_)
    setIsSettingStop( false )
  }
  const onSetTarget = target_ => {
    setTarget(target_)
    setIsSettingTarget( false )
  }
  useEffect(refreshRiskReward, [currentPrice, stop, target])

  const chartRef = useRef()

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ borderColor: isEditing ? blue : gray, borderWidth: 3, borderStyle: 'solid', margin: 20 }}>
        <Chart
          ref={ chartRef }
          candles={ candles }
          width={1000}
          height={500}
          isSettingStop={ isSettingStop }
          isSettingTarget={ isSettingTarget }
          onSetStop={ onSetStop }
          onSetTarget={ onSetTarget }
        />
      </div>
      <div style={{ margin: 20, marginLeft: 40, display: 'flex', flexDirection: 'column' }}>
        <button style={{
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderColor: isSettingStop ? gray : orange,
            borderWidth: 1,
            borderRadius: 4,
            color: isSettingStop ? gray : orange,
            fontSize: '1.5em',
            padding: '10px 20px',
            marginBottom: 10,
          }}
          onClick={ () => setIsSettingStop( true ) }
          disabled={ isSettingStop }
        >
          { stop ? `Stop: ${ stop }` : 'Set Stop' }
        </button>
        <button style={{
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderColor: isSettingTarget ? gray : lime,
            borderWidth: 1,
            borderRadius: 4,
            color: isSettingTarget ? gray : lime,
            fontSize: '1.5em',
            padding: '10px 20px',
          }}
          onClick={ () => setIsSettingTarget( true ) }
          disabled={ isSettingTarget }
        >
          { target ? `Target: ${ target }` : 'Set Target' }
        </button>
        { riskReward &&
          <p style={{ color: 'white' }}>
            <label>Risk Reward</label> { riskReward.toFixed(2) }
          </p>
        }
      </div>
    </div>
  )
}

export default OrderPlacer
