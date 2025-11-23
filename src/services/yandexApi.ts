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

interface SearchResultItem {
  url: string
  format: string
  width: string
  height: string
  passage: string
  host: string
  pageTitle: string
  pageUrl: string
}


export async function searchByImage(base64Image: string): Promise<SearchResultItem[]> {
  const FOLDER_ID = import.meta.env.VITE_YANDEX_FOLDER_ID
  const API_KEY = import.meta.env.VITE_YANDEX_API_KEY

  if (!FOLDER_ID || !API_KEY) {
    throw new Error('Yandex API credentials are not configured. Please check your .env file.')
  }

  // Remove data URL prefix if present
  const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '')

  // Create body.json content
  const bodyData = {
    folderId: FOLDER_ID,
    data: cleanBase64,
    page: "1"
  }

  const bodyJson = JSON.stringify(bodyData, null, 2)

  // Save body.json to project folder via API endpoint
  try {
    await fetch('/api/save-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename: 'body.json',
        content: bodyJson
      })
    })
  } catch (error) {
    console.log('Could not save body.json:', error)
  }

  // Make the search request
  const searchUrl = 'https://searchapi.api.cloud.yandex.net/v2/image/search_by_image'
  
  const response = await fetch(searchUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Api-Key ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: bodyJson
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to search by image: ${response.status} - ${errorText}`)
  }

  const result: any = await response.json()

  // Save result.json to project folder via API endpoint
  const resultJson = JSON.stringify(result, null, 2)
  try {
    await fetch('/api/save-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename: 'result.json',
        content: resultJson
      })
    })
  } catch (error) {
    console.log('Could not save result.json:', error)
  }

  // Handle different response formats:
  // 1. Object with results array: { results: [...] }
  // 2. Array directly: [...]
  // 3. Single object: { url: ..., pageUrl: ... }
  let results: SearchResultItem[] = []
  if (Array.isArray(result)) {
    results = result
  } else if (result.results && Array.isArray(result.results)) {
    results = result.results
  } else if (result.url && result.pageUrl) {
    // Single object
    results = [result]
  }

  return results
}

