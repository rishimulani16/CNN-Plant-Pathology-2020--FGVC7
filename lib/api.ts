const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = "Request failed"

    try {
      // Check if response is actually JSON
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json()
        errorMessage = error.message || errorMessage
      } else {
        // If not JSON, it might be HTML error page
        const text = await response.text()
        if (text.includes("<!DOCTYPE")) {
          errorMessage = "Backend server is not running or not accessible"
        } else {
          errorMessage = text || errorMessage
        }
      }
    } catch (parseError) {
      console.error("[v0] Failed to parse error response:", parseError)
      errorMessage = "Network error - unable to connect to server"
    }

    throw new ApiError(response.status, errorMessage)
  }

  const contentType = response.headers.get("content-type")
  if (!contentType || !contentType.includes("application/json")) {
    throw new ApiError(500, "Server returned non-JSON response")
  }

  try {
    return await response.json()
  } catch (parseError) {
    console.error("[v0] Failed to parse JSON response:", parseError)
    throw new ApiError(500, "Invalid JSON response from server")
  }
}

const isDevelopment = process.env.NODE_ENV === "development"
const useMockAPI = isDevelopment && !process.env.NEXT_PUBLIC_API_URL

const mockDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const mockApi = {
  async signup(email: string, password: string, name: string) {
    await mockDelay(1000)
    return {
      token: "mock-jwt-token-" + Date.now(),
      user: { id: "1", name, email },
    }
  },

  async login(email: string, password: string) {
    await mockDelay(800)
    if (email === "demo@example.com" && password === "demo123") {
      return {
        token: "mock-jwt-token-" + Date.now(),
        user: { id: "1", name: "Demo User", email },
      }
    }
    throw new ApiError(401, "Invalid credentials. Try demo@example.com / demo123")
  },

  async predict(imageFile: File, token: string) {
    await mockDelay(2000)

    // Mock prediction results
    const diseases = [
      { name: "Healthy", confidence: 0.92 },
      { name: "Apple Scab", confidence: 0.87 },
      { name: "Apple Rust", confidence: 0.79 },
      { name: "Multiple Diseases", confidence: 0.65 },
    ]

    const randomDisease = diseases[Math.floor(Math.random() * diseases.length)]

    return {
      result: randomDisease.name,
      confidence: randomDisease.confidence,
    }
  },
}

const makeRequest = async (url: string, options: RequestInit) => {
  try {
    const response = await fetch(url, options)
    return await handleResponse(response)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Network errors (CORS, connection refused, etc.)
    console.error("[v0] Network request failed:", error)

    if (isDevelopment) {
      throw new ApiError(
        0,
        "Cannot connect to backend server. Please check your connection and try again.",
      )
    } else {
      throw new ApiError(0, "Cannot connect to server. Please try again later.")
    }
  }
}

export const api = {
  async signup(email: string, password: string, name: string) {
    if (useMockAPI) {
      console.log("[v0] Using mock API for signup")
      return mockApi.signup(email, password, name)
    }
    return makeRequest(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })
  },

  async login(email: string, password: string) {
    if (useMockAPI) {
      console.log("[v0] Using mock API for login")
      return mockApi.login(email, password)
    }
    return makeRequest(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
  },

  async predict(imageFile: File, token: string) {
    if (useMockAPI) {
      console.log("[v0] Using mock API for prediction")
      return mockApi.predict(imageFile, token)
    }

    const formData = new FormData()
    formData.append("image", imageFile)

    return makeRequest(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
  },
}
