import React from 'react'

interface SearchLink {
  url: string
  pageUrl: string
}

interface ChatMessageProps {
  text: string
  imageUrl?: string
  isLoading?: boolean
  searchLinks?: SearchLink[]
}

const ChatMessage: React.FC<ChatMessageProps> = ({ text, imageUrl, isLoading, searchLinks }) => {
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

      {/* Right side: Text and Links */}
      <div className="flex-1 flex items-start">
        <div className="bg-white rounded-lg p-4 shadow-md max-w-md w-full">
          <p className="text-gray-800 text-sm mb-2">
            {text}
          </p>
          {searchLinks && searchLinks.length > 0 && (
            <div className="mt-3 space-y-2">
              {searchLinks.map((link, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium text-gray-700">
                    {index + 1}. <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                      {link.url}
                    </a>
                  </div>
                  <div className="ml-4 text-gray-600">
                    <a href={link.pageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                      {link.pageUrl}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage

