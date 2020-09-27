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
  const [targets, setTargets] = useState([])
  const [riskRewards, setRiskRewards] = useState([])
  const refreshRiskReward = () => {
    const newRiskRewards = []
    for (const target of targets) {
      if ( stop !== undefined && target !== undefined ) {
        newRiskRewards.push(( target - currentPrice ) / ( currentPrice - stop ))
      }
    }
    setRiskRewards(newRiskRewards)
  }
  const onSetStop = stop_ => {
    if ( stop_ > currentPrice ) {
      alert('stop is higher than current price')
      setIsSettingStop(false)
      return
    }
    setStop(stop_)
    setIsSettingStop( false )
  }
  const [currentTier, setCurrentTier] = useState()
  const onEditTarget = idx => () => {
    setCurrentTier(idx)
    setIsSettingTarget( true )
  }
  const onSetTarget = target_ => {
    if ( target_ < currentPrice ) {
      alert( 'target is less than current price' )
      setIsSettingTarget(false)
      return
    }
    const newTargets = targets.slice()
    newTargets[currentTier] = target_
    setTargets(newTargets)
    setIsSettingTarget( false )
  }
  useEffect(refreshRiskReward, [currentPrice, stop, targets])

  const renderSubOrder = idx => {
    const target = targets[idx]
    const riskReward = riskRewards[idx]

    return (
      <div style={{ width: 200, margin: 15, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <button style={{
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderColor: isSettingTarget ? gray : lime,
            borderWidth: 1,
            borderRadius: 4,
            color: isSettingTarget ? gray : lime,
            fontSize: 16,
            padding: '10px 5px',
          }}
          onClick={ onEditTarget(idx) }
          disabled={ isSettingTarget }
        >
          { target ? `Edit Price Target: ${ target }` : 'Set Stock Price Target' }
        </button>
        { riskReward &&
          <p style={{ fontSize: 13, textAlign: 'center', color: 'white', marginTop: 2 }}>
            <label style={{ color: 'gray' }}>Risk Reward</label> { riskReward.toFixed(2) }
          </p>
        }
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ borderColor: isEditing ? blue : gray, borderWidth: 3, borderStyle: 'solid', margin: 20, marginRight: 40 }}>
        <Chart
          candles={ candles }
          width={600}
          height={500}
          isSettingStop={ isSettingStop }
          isSettingTarget={ isSettingTarget }
          stop={ stop }
          targets={ targets }
          onSetStop={ onSetStop }
          onSetTarget={ onSetTarget }
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button style={{
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderColor: isSettingStop ? gray : orange,
            borderWidth: 1,
            borderRadius: 4,
            color: isSettingStop ? gray : orange,
            padding: '10px 5px',
            fontSize: 16,
            margin: 15,
            marginTop: 20,
            marginBottom: 0,
          }}
          onClick={ () => setIsSettingStop( true ) }
          disabled={ isSettingStop }
        >
          { stop ? `Edit Price Stop: ${ stop }` : 'Set Stock Price Stop' }
        </button>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          { renderSubOrder(0) }
          { renderSubOrder(1) }
          { renderSubOrder(2) }
        </div>
        <button style={{
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderColor: 'white',
            borderWidth: 1,
            borderRadius: 4,
            color: 'white',
            fontSize: 16,
            padding: '10px 5px',
            margin: 15,
            marginTop: 0,
          }}
        >
          Place Order
        </button>
      </div>
    </div>
  )
}

export default OrderPlacer
