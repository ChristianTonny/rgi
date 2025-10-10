'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  hasPermission: () => boolean
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

const DEMO_USERS: Record<string, User> = {
  'minister@gov.rw': {
    id: '1',
    email: 'minister@gov.rw',
    name: 'Hon. Minister of ICT',
    role: 'MINISTER',
    ministry: 'ICT',
    permissions: ['READ', 'UPDATE'],
    createdAt: new Date(),
    isActive: true,
  },
  'ps@gov.rw': {
    id: '2',
    email: 'ps@gov.rw',
    name: 'Permanent Secretary',
    role: 'PERMANENT_SECRETARY',
    ministry: 'Finance',
    permissions: ['READ', 'UPDATE'],
    createdAt: new Date(),
    isActive: true,
  },
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('demo-user') : null
      if (raw) {
        const parsed = JSON.parse(raw)
        setUser({ ...parsed, createdAt: new Date(parsed.createdAt) })
      }
    } catch (error) {
      console.error('Failed to restore demo session', error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (user) {
      const serialisableUser = {
        ...user,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      }
      window.localStorage.setItem('demo-user', JSON.stringify(serialisableUser))
    } else {
      window.localStorage.removeItem('demo-user')
    }
  }, [user])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 400))

    const normalizedEmail = email.trim().toLowerCase()
    const match = DEMO_USERS[normalizedEmail]

    if (!match || password !== 'password123') {
      setIsLoading(false)
      return {
        success: false,
        message: 'Invalid demo credentials. Use minister@gov.rw or ps@gov.rw with password123.',
      }
    }

    setUser({ ...match, createdAt: new Date() })
    setIsLoading(false)
    return { success: true, message: 'Logged in with demo account' }
  }

  const logout = () => {
    setUser(null)
  }

  const hasPermission = () => true

  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    hasPermission,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

