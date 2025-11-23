interface ImageGenerationRequest {
  modelUri: string
  generationOptions: {
    seed: string
    aspectRatio: {
      widthRatio: string
      heightRatio: string
    }
  }
  messages: Array<{
    text: string
  }>
}

interface ImageGenerationResponse {
  id: string
  createdAt: string
  createdBy: string
  modifiedAt: string
  done: boolean
  response?: {
    image: string
  }
  error?: {
    message: string
    code: number
  }
}

const API_KEY = import.meta.env.VITE_YANDEX_API_KEY
const MODEL_URI = import.meta.env.VITE_YANDEX_MODEL_URI
// Use proxy to avoid CORS issues
const BASE_URL = import.meta.env.DEV ? '/api/yandex' : 'https://llm.api.cloud.yandex.net'

export async function generateImage(text: string): Promise<string> {
  if (!API_KEY || !MODEL_URI) {
    throw new Error('Yandex API credentials are not configured. Please check your .env file.')
  }

  // Step 1: Start image generation
  const requestBody: ImageGenerationRequest = {
    modelUri: MODEL_URI,
    generationOptions: {
      seed: '1863',
      aspectRatio: {
        widthRatio: '2',
        heightRatio: '1'
      }
    },
    messages: [
      {
        text: text
      }
    ]
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }
  
  // In dev mode, send API key via custom header for proxy
  if (import.meta.env.DEV) {
    headers['X-Yandex-Api-Key'] = API_KEY
  } else {
    headers['Authorization'] = `Api-Key ${API_KEY}`
  }

  const generateResponse = await fetch(
    `${BASE_URL}/foundationModels/v1/imageGenerationAsync`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    }
  )

  if (!generateResponse.ok) {
    const errorText = await generateResponse.text()
    throw new Error(`Failed to start image generation: ${generateResponse.status} - ${errorText}`)
  }

  const generateData: ImageGenerationResponse = await generateResponse.json()
  
  if (generateData.error) {
    throw new Error(`API Error: ${generateData.error.message}`)
  }

  const operationId = generateData.id

  // Step 2: Poll for completion
  let attempts = 0
  const maxAttempts = 60 // 5 minutes max (5 sec intervals)

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds

    const statusHeaders: HeadersInit = {}
    
    // In dev mode, send API key via custom header for proxy
    if (import.meta.env.DEV) {
      statusHeaders['X-Yandex-Api-Key'] = API_KEY
    } else {
      statusHeaders['Authorization'] = `Api-Key ${API_KEY}`
    }

    const statusResponse = await fetch(
      `${BASE_URL}/operations/${operationId}`,
      {
        method: 'GET',
        headers: statusHeaders
      }
    )

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text()
      throw new Error(`Failed to check status: ${statusResponse.status} - ${errorText}`)
    }

    const statusData: ImageGenerationResponse = await statusResponse.json()

    if (statusData.error) {
      throw new Error(`API Error: ${statusData.error.message}`)
    }

    if (statusData.done && statusData.response?.image) {
      return statusData.response.image
    }

    if (statusData.done && !statusData.response?.image) {
      throw new Error('Image generation completed but no image was returned')
    }

    attempts++
  }

  throw new Error('Image generation timeout - operation took too long')
}

