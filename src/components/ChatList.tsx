import React from 'react'

interface ChatItem {
  id: number
  name: string
}

const chats: ChatItem[] = [
  { id: 1, name: 'чат 1. кэжуал вещи' },
  { id: 2, name: 'чат 2. джинса' },
  { id: 3, name: 'чат 3' },
  { id: 4, name: 'чат 4' },
  { id: 5, name: 'чат 5' },
]

const ChatList: React.FC = () => {
  return (
    <div className="flex flex-col gap-2">
      {chats.map((chat) => (
        <button
          key={chat.id}
          className="w-full h-12 rounded-lg bg-blue-600 text-white font-medium px-4 text-left hover:bg-blue-700 transition-colors"
        >
          {chat.name}
        </button>
      ))}
    </div>
  )
}

export default ChatList

