import React from 'react'

const RightPanel: React.FC = () => {
  return (
    <div className="flex-1 bg-blue-100 p-6 flex flex-col h-screen overflow-auto">
      <div className="flex-1 flex flex-col relative min-h-0">
        {/* Top section with message bubble and yes button */}
        <div className="flex justify-end gap-4 mb-4 relative">
          {/* User message bubble - upper right */}
          <div className="max-w-2xl">
            <div className="bg-white rounded-lg p-4 shadow-md">
              <p className="text-gray-800 text-sm">
                Найти мне футболку из хлопка, белого цвета без дизайна, рукава до
                локтей и длина до середины бедра. Мой рост 170
              </p>
            </div>
          </div>
          
          {/* Yes button - positioned to the right, slightly below the message */}
          <div className="self-end">
            <button className="w-16 h-12 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-md">
              да
            </button>
          </div>
        </div>

        {/* Image and Confirm button section - positioned below and to the left */}
        <div className="flex flex-col items-start gap-4 mb-6">
          {/* T-shirt image */}
          <div className="w-48 h-64 bg-white rounded-lg flex items-center justify-center border-2 border-gray-300 shadow-md overflow-hidden">
            <img
              src="https://via.placeholder.com/192x256/E5E7EB/9CA3AF?text=Футболка"
              alt="Футболка"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
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
              Изображение футболки
            </div>
          </div>
          
          {/* Confirm design button */}
          <button className="w-48 h-12 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-md">
            Подтвердите дизайн
          </button>
        </div>
      </div>

      {/* Input area - fixed at bottom */}
      <div className="mt-auto pt-4 relative">
        <div className="w-full h-24 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center relative shadow-md">
          <span className="text-gray-500 text-lg">Найти вещь</span>
          <button className="absolute bottom-3 right-3 w-28 h-10 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-md">
            отправить
          </button>
        </div>
      </div>
    </div>
  )
}

export default RightPanel

