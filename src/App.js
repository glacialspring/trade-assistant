import React from 'react'
import Chart from './components/chart/chart'
import candles from './components/chart/TSLA_short'

const App = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ borderColor: '#2a2e39', borderWidth: 3, borderStyle: 'solid', margin: 20 }}>
        <Chart candles={ candles } width={1000} height={500} />
      </div>
    </div>
  )
}

export default App
