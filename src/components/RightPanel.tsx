import React, { useState } from 'react'
import ChatMessage from './ChatMessage'
import { generateImage } from '../services/yandexApi'

interface ChatItem {
  id: number
  text: string
  imageUrl?: string
  isLoading: boolean
  error?: string
}

const RightPanel: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return

    const userText = inputText.trim()
    setInputText('')

    // Add message to chat with loading state
    const newMessage: ChatItem = {
      id: Date.now(),
      text: userText,
      isLoading: true
    }

    setChatHistory(prev => [...prev, newMessage])
    setIsGenerating(true)

    try {
      const imageUrl = await generateImage(userText)
      
      // Update message with generated image
      // Handle base64 image - Yandex API returns base64 string
      const displayImageUrl = imageUrl.startsWith('data:') 
        ? imageUrl 
        : `data:image/png;base64,${imageUrl}`
      
      setChatHistory(prev =>
        prev.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, imageUrl: displayImageUrl, isLoading: false }
            : msg
        )
      )
    } catch (error) {
      console.error('Error generating image:', error)
      // Update message to show error
      setChatHistory(prev =>
        prev.map(msg =>
          msg.id === newMessage.id
            ? {
                ...msg,
                isLoading: false,
                imageUrl: undefined,
                error: error instanceof Error ? error.message : 'Ошибка генерации изображения'
              }
            : msg
        )
      )
      alert(error instanceof Error ? error.message : 'Ошибка генерации изображения')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex-1 bg-blue-100 p-6 flex flex-col h-screen overflow-hidden">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto mb-4">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>Введите описание вещи для поиска</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {chatHistory.map((item) => (
              <ChatMessage
                key={item.id}
                text={item.text}
                imageUrl={item.imageUrl}
                isLoading={item.isLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input area - fixed at bottom */}
      <div className="mt-auto pt-4 relative flex-shrink-0">
        <div className="w-full h-24 bg-white rounded-lg border-2 border-gray-300 relative shadow-md">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Найти вещь"
            disabled={isGenerating}
            className="w-full h-full px-4 pr-32 rounded-lg text-gray-800 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isGenerating}
            className="absolute bottom-3 right-3 w-28 h-10 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isGenerating ? '...' : 'отправить'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RightPanel
