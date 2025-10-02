export interface User {
  id: string
  email: string
  name: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
}

export const getStoredAuth = (): { token: string | null; user: User | null } => {
  if (typeof window === "undefined") return { token: null, user: null }

  try {
    const token = localStorage.getItem("auth_token")
    const userStr = localStorage.getItem("auth_user")
    const user = userStr ? JSON.parse(userStr) : null

    return { token, user }
  } catch (error) {
    console.error("[v0] Failed to parse stored auth data:", error)
    // Clear corrupted data
    clearStoredAuth()
    return { token: null, user: null }
  }
}

export const setStoredAuth = (token: string, user: User) => {
  try {
    localStorage.setItem("auth_token", token)
    localStorage.setItem("auth_user", JSON.stringify(user))
  } catch (error) {
    console.error("[v0] Failed to store auth data:", error)
  }
}

export const clearStoredAuth = () => {
  try {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
  } catch (error) {
    console.error("[v0] Failed to clear auth data:", error)
  }
}
