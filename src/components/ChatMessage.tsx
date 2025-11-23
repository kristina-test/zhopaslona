import React from 'react'

interface ChatMessageProps {
  text: string
  imageUrl?: string
  isLoading?: boolean
}

const ChatMessage: React.FC<ChatMessageProps> = ({ text, imageUrl, isLoading }) => {
  return (
    <div className="flex gap-4 mb-4 w-full">
      {/* Left side: Image */}
      <div className="flex-shrink-0">
        {isLoading ? (
          <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border-2 border-gray-300 shadow-md">
            <div className="text-gray-500 text-sm">Загрузка...</div>
          </div>
        ) : imageUrl ? (
          <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border-2 border-gray-300 shadow-md overflow-hidden">
            <img
              src={imageUrl}
              alt="Generated"
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
                if (target.parentElement) {
                  const fallback = target.parentElement.querySelector('.fallback-text')
                  if (fallback) {
                    fallback.classList.remove('hidden')
                  }
                }
              }}
            />
            <div className="hidden fallback-text text-gray-500 text-sm text-center px-4">
              Ошибка загрузки изображения
            </div>
          </div>
        ) : (
          <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border-2 border-gray-300 shadow-md">
            <div className="text-gray-500 text-sm text-center px-4">
              Ожидание изображения...
            </div>
          </div>
        )}
      </div>

      {/* Right side: Text - in one line */}
      <div className="flex-1 flex items-center">
        <div 
          className="bg-white rounded-lg p-4 shadow-md max-w-md"
          title={text}
        >
          <p className="text-gray-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
            {text}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage

