import React, { useState } from 'react'
import ChatMessage from './ChatMessage'
import { generateImage, searchByImage } from '../services/yandexApi'

interface SearchLink {
  url: string
  pageUrl: string
}

interface ChatItem {
  id: number
  text: string
  imageUrl?: string
  base64Image?: string
  isLoading: boolean
  error?: string
  awaitingConfirmation?: boolean
  searchLinks?: SearchLink[]
  isSearching?: boolean
}

const RightPanel: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return

    const userText = inputText.trim()
    setInputText('')

    // Check if user is responding to confirmation
    const lowerText = userText.toLowerCase()
    if (lowerText === 'да' || lowerText === 'нет') {
      // Find the last message awaiting confirmation
      const lastMessageIndex = chatHistory.length - 1
      if (lastMessageIndex >= 0 && chatHistory[lastMessageIndex].awaitingConfirmation) {
        const lastMessage = chatHistory[lastMessageIndex]
        
        if (lowerText === 'да' && lastMessage.base64Image) {
          // Start search by image
          setChatHistory(prev =>
            prev.map((msg, idx) =>
              idx === lastMessageIndex
                ? { ...msg, awaitingConfirmation: false, isSearching: true }
                : msg
            )
          )

          try {
            const results = await searchByImage(lastMessage.base64Image)
            
            // Extract url and pageUrl from results
            const links: SearchLink[] = results.map((item) => ({
              url: item.url,
              pageUrl: item.pageUrl
            }))

            setChatHistory(prev =>
              prev.map((msg, idx) =>
                idx === lastMessageIndex
                  ? { ...msg, isSearching: false, searchLinks: links }
                  : msg
              )
            )
          } catch (error) {
            console.error('Error searching by image:', error)
            setChatHistory(prev =>
              prev.map((msg, idx) =>
                idx === lastMessageIndex
                  ? {
                      ...msg,
                      isSearching: false,
                      error: error instanceof Error ? error.message : 'Ошибка поиска по изображению'
                    }
                  : msg
              )
            )
            alert(error instanceof Error ? error.message : 'Ошибка поиска по изображению')
          }
        } else if (lowerText === 'нет') {
          // User declined, remove confirmation state
          setChatHistory(prev =>
            prev.map((msg, idx) =>
              idx === lastMessageIndex
                ? { ...msg, awaitingConfirmation: false }
                : msg
            )
          )
        }
      }
      return
    }

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
      
      // Store base64 image (without data URL prefix for API call)
      const base64Image = imageUrl.startsWith('data:') 
        ? imageUrl.split(',')[1]
        : imageUrl

      setChatHistory(prev => {
        const updated = prev.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, imageUrl: displayImageUrl, base64Image, isLoading: false, awaitingConfirmation: true }
            : msg
        )
        
        // Add confirmation message
        const confirmationMessage: ChatItem = {
          id: Date.now() + 1,
          text: 'подтвердите дизайн. Да/Нет',
          isLoading: false
        }
        
        return [...updated, confirmationMessage]
      })
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
                isLoading={item.isLoading || item.isSearching}
                searchLinks={item.searchLinks}
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
