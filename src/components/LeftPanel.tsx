import React from 'react'
import ChatList from './ChatList'

const LeftPanel: React.FC = () => {
  return (
    <div className="w-80 bg-blue-100 p-4 flex flex-col gap-4">
      <div className="flex gap-3">
        <button className="w-12 h-12 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center hover:bg-blue-700 transition-colors">
          ЛК
        </button>
        <button className="flex-1 h-12 rounded-lg bg-blue-600 text-white font-medium px-4 hover:bg-blue-700 transition-colors">
          новый чат
        </button>
      </div>
      <ChatList />
    </div>
  )
}

export default LeftPanel

