'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types'

const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

const API_BASE_URL = (() => {
  if (rawApiBaseUrl) {
    return rawApiBaseUrl.replace(/\/$/, '')
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001'
  }

  return ''
})()

export const buildApiUrl = (path: string) => {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isLoading: boolean
  hasPermission: (resource: string, action: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('gov-auth-token')
    const savedUser = localStorage.getItem('gov-auth-user')
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        localStorage.removeItem('gov-auth-token')
        localStorage.removeItem('gov-auth-user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const contentType = response.headers.get('content-type') ?? ''
      const isJson = contentType.includes('application/json')
      const data = isJson ? await response.json() : null

      if (!response.ok) {
        const message = data?.message ?? 'Unable to reach authentication service. Ensure the API server is running.'
        return { success: false, message }
      }

      if (data?.success) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('gov-auth-token', data.token)
        localStorage.setItem('gov-auth-user', JSON.stringify(data.user))
        return { success: true, message: 'Login successful' }
      } else {
        return { success: false, message: data.message || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: 'Cannot reach authentication service. Start the Express API (npm run server:dev) or set NEXT_PUBLIC_API_BASE_URL.',
      }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('gov-auth-token')
    localStorage.removeItem('gov-auth-user')
    
    // Call logout endpoint
    if (token) {
      fetch(buildApiUrl('/api/auth/logout'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).catch(console.error)
    }
  }

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false
    
    // Admin has all permissions
    if (user.role === 'ADMIN') return true
    
    // Check specific permissions
    return user.permissions.some(
      permission => {
        if (typeof permission === 'string') {
          return permission === `${resource}:${action}` || permission === action
        }

        return permission.resource === resource && permission.action === action
      }
    )
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    hasPermission,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}