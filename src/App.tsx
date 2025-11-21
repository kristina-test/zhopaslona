import React from 'react'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'

function App() {
  return (
    <div className="flex h-screen bg-blue-100">
      <LeftPanel />
      <RightPanel />
    </div>
  )
}

export default App

