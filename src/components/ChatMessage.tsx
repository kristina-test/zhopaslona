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
  isUser?: boolean
}

const ChatMessage: React.FC<ChatMessageProps> = ({ text, imageUrl, isLoading, searchLinks, isUser = false }) => {
  if (isUser) {
    // User message - right aligned with pink icon
    return (
      <div className="flex justify-end mb-4 w-full">
        <div className="flex items-start gap-2 max-w-[70%]">
          <div className="bg-blue-500 rounded-lg px-4 py-2 shadow-md">
            <p className="text-white text-sm">{text}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-pink-400 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">K</span>
          </div>
        </div>
      </div>
    )
  }

  // AI message - left aligned with yellow icon
  return (
    <div className="flex justify-start mb-4 w-full">
      <div className="flex items-start gap-2 max-w-[70%]">
        <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-sm">Ч</span>
        </div>
        <div className="bg-blue-500 rounded-lg px-4 py-2 shadow-md">
          {isLoading ? (
            <div className="text-white text-sm">Загрузка...</div>
          ) : imageUrl ? (
            <div className="mb-2">
              <img
                src={imageUrl}
                alt="Generated"
                className="max-w-full h-auto rounded"
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                }}
              />
            </div>
          ) : null}
          {text && (
            <p className="text-white text-sm mb-2">{text}</p>
          )}
          {searchLinks && searchLinks.length > 0 && (
            <div className="mt-2 space-y-1">
              {searchLinks.map((link, index) => (
                <div key={index} className="text-white text-sm">
                  {index + 1}. <a href={link.url} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                    Ссылка
                  </a>
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

