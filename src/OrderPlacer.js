import React, { useState, useEffect, useRef } from 'react'
import Chart from './components/chart/chart'
import candles from './components/chart/TSLA_short'
// import checkmark from './assets/images/checkmark.svg'

const lime = '#66bb6a'
const blue = '#1976d2'
const blueHover = "#1e88e5"
const gray = '#2a2e39'
const orange = '#f57c00'
const red = '#ef5350'

const OrderPlacer = () => {
  const currentPrice = candles[candles.length-1].close
  const [isSettingStop, setIsSettingStop] = useState( false )
  const [isSettingTarget, setIsSettingTarget] = useState( false )
  const isEditing = isSettingStop || isSettingTarget
  const escapeSetPrice = e => {
    if ( e.key === 'Escape' ) {
      setIsSettingTarget(false)
      setIsSettingStop(false)
    }
  }
  useEffect(() => {
    window.addEventListener('keydown', escapeSetPrice)
    return () => {
      window.removeEventListener('keydown', escapeSetPrice)
    }
  }, [])

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
  const onEditTarget = idx => e => {
    e.stopPropagation()
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

  // hard stop
  const [stopPerc, setStopPerc] = useState()
  const onChangeStopPerc = e => {
    const perc = Number(e.target.value.replace(/[^\d]/g, ''))
    setStopPerc(perc)
  }
  const onKeyDownStopPerc = e => {
    if ( e.key === 'Backspace' ) {
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      if ( start === end && start-1 === String(stopPerc).length ) {
        e.preventDefault()
        setStopPerc(Number(String(stopPerc).substring(0,start-2)))
      }
    }
  }

  // hard target
  const [targetPercs, setTargetPercs] = useState([])
  const onChangeTargetPerc = e => {
    const perc = Number(e.target.value.replace(/[^\d]/g, ''))
    const newPercs = targetPercs.slice()
    newPercs[currentTier] = perc
    setTargetPercs(newPercs)
  }
  const onKeyDownTargetPerc = e => {
    if ( e.key === 'Backspace' ) {
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const current = targetPercs[currentTier]
      if ( start === end && start-1 === String(current).length ) {
        e.preventDefault()
        const newPercs = targetPercs.slice()
        newPercs[currentTier] = Number(String(current).substring(0,start-2))
        setTargetPercs(newPercs)
      }
    }
  }

  let isReady = stop !== undefined && stopPerc !== undefined
  if ( isReady ) {
    let i = 0
    for (const target of targets) {
      if ( target === undefined ) {
        break
      }
      if ( targetPercs[i] === undefined ) {
        break
      }
      i++
    }
    isReady = i === 3
  }

  const [isLive, setIsLive] = useState(false)
  const onPlaceOrder = () => {
    if ( !isReady ) {
      return
    }
    setIsLive(true)
  }

  const renderSubOrder = idx => {
    const targetPerc = targetPercs[idx]
    const target = targets[idx]
    const riskReward = riskRewards[idx]

    return (
      <div style={{ width: 120, margin: idx !== 0 && idx !== 2 && '0 10px', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <input style={{
            backgroundColor: 'black',
            borderStyle: 'solid',
            borderColor: targetPerc ? 'white' : 'gray',
            borderWidth: 1,
            borderRadius: 4,
            color: targetPerc ? 'white' : 'gray',
            fontSize: 16,
            padding: '10px 5px',
            textAlign: 'center',
            marginBottom: 10,
          }}
          value={ targetPerc !== undefined ? `${targetPerc}%` : undefined }
          type="text"
          placeholder="Hard Target%"
          onFocus={ () => setCurrentTier(idx) }
          onChange={ onChangeTargetPerc }
          onKeyDown={ onKeyDownTargetPerc }
        />
        <button style={{
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderColor: isSettingTarget ? gray : target ? 'white' : 'gray',
            borderWidth: 1,
            borderRadius: 4,
            color: isSettingTarget ? gray : target ? 'white' : 'gray',
            fontSize: 16,
            padding: '10px 5px',
            cursor: isSettingTarget ? 'default' : 'pointer',
          }}
          onClick={ onEditTarget(idx) }
          disabled={ isSettingTarget }
        >
          { target ? `Target: $${ target.toFixed(2) }` : 'Stock Target' }
          {/* { !isSettingTarget && target && <img style={{ width: 20, position: 'absolute', transform: 'translate(2px, -3px)' }} src={checkmark} alt="checkmark" /> } */}
        </button>
        { riskReward &&
          <p style={{ fontSize: 13, textAlign: 'center', color: 'white', marginTop: 2 }}>
            <label style={{ color: 'gray' }}>Risk-Reward</label> { riskReward.toFixed(2) }
          </p>
        }
        { isLive &&
          <button style={{
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              borderWidth: 1,
              borderColor: red,
              borderRadius: 4,
              color: red,
              fontSize: 16,
              padding: '10px 5px',
              marginBottom: 20,
              fontWeight: 300,
              cursor: 'pointer',
            }}
          >
            CLOSE OUT
          </button>
        }
      </div>
    )
  }

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', padding: 20 }}
      onClick={ () => {
        setIsSettingTarget(false)
        setIsSettingStop(false)
      }}
    >
      <div style={{ borderColor: isEditing ? blue : gray, borderWidth: 3, borderStyle: 'solid', marginRight: 60 }}>
        <Chart
          candles={ candles }
          width={700}
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
        <h2 style={{ position: 'relative', fontSize: '2.5em', color: 'white', fontWeight: 300, letterSpacing: 3, lineHeight: 1, textAlign: 'center', margin: '0 0 20px' }}>
          TSLA
          { isLive &&
            <span style={{ position: 'absolute', color: 'lime', fontWeight: 'bold', fontSize: 14 }}>
              <span style={{ fontSize: 24 }}>•</span>LIVE
            </span>
          }
        </h2>
        <input style={{
            backgroundColor: 'black',
            borderStyle: 'solid',
            borderColor: 'gray',
            borderWidth: 1,
            borderRadius: 4,
            color: 'gray',
            fontSize: 16,
            padding: '10px 5px',
            textAlign: 'center',
            marginBottom: 10,
          }}
          type="text"
          placeholder="Strike"
        />
        <input style={{
            backgroundColor: 'black',
            borderStyle: 'solid',
            borderColor: stopPerc ? 'white' : 'gray',
            borderWidth: 1,
            borderRadius: 4,
            color: stopPerc ? 'white' : 'gray',
            fontSize: 16,
            padding: '10px 5px',
            marginBottom: 10,
            textAlign: 'center',
          }}
          value={ stopPerc !== undefined ? `${stopPerc}%` : undefined }
          type="text"
          placeholder="Hard Stop%"
          onChange={ onChangeStopPerc }
          onKeyDown={ onKeyDownStopPerc }
        />
        <button style={{
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderColor: isSettingStop ? gray : stop ? 'white' : 'gray',
            borderWidth: 1,
            borderRadius: 4,
            color: isSettingStop ? gray : stop ? 'white' : 'gray',
            padding: '10px 5px',
            fontSize: 16,
            marginBottom: 10,
            cursor: isSettingStop ? 'default' : 'pointer',
          }}
          onClick={ e => {
            e.stopPropagation()
            setIsSettingStop( true )
          }}
          disabled={ isSettingStop }
        >
          { stop ? `Stop: $${ stop.toFixed(2) }` : 'Stock Price Stop' }
          {/* { !isSettingStop && stop && <img style={{ width: 20, position: 'absolute', transform: 'translate(2px, -3px)' }} src={checkmark} alt="checkmark" /> } */}
        </button>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          { renderSubOrder(0) }
          { renderSubOrder(1) }
          { renderSubOrder(2) }
        </div>
        { isLive?
          <button style={{
              backgroundColor: red,
              borderStyle: 'none',
              borderRadius: 4,
              color: 'white',
              fontSize: 24,
              padding: '10px 5px',
              marginTop: 10,
              fontWeight: 300,
              cursor: 'pointer',
            }}
          >
            CLOSE OUT ALL
          </button>
          :
          <button style={{
              backgroundColor: isReady ? blue : 'transparent',
              borderStyle: isReady ? 'none' : 'solid',
              borderColor: gray,
              borderWidth: 1,
              borderRadius: 4,
              color: isReady ? 'white' : gray,
              fontSize: 24,
              padding: '10px 5px',
              marginTop: 10,
              fontWeight: 300,
              cursor: isReady ? 'pointer' : 'default',
            }}
            disabled={ !isReady }
            onClick={ onPlaceOrder }
          >
            PLACE ORDER
          </button>
        }
      </div>
    </div>
  )
}

export default OrderPlacer
