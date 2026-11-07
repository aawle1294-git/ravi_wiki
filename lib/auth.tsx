'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type UserRole = 'guest' | 'player' | 'developer'

export interface UserSession {
  role: UserRole
  name: string
  avatar?: string
}

interface AuthContextType {
  user: UserSession
  loginAsDeveloper: (password: string) => Promise<boolean>
  loginAsPlayer: (nickname: string) => boolean
  logout: () => void
  isDeveloper: boolean
  isPlayer: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>({
    role: 'guest',
    name: '방문자',
  })

  // 세션 복원
  useEffect(() => {
    const savedRole = localStorage.getItem('ravi_user_role') as UserRole
    const savedName = localStorage.getItem('ravi_user_name')

    if (savedRole === 'developer') {
      setUser({ role: 'developer', name: savedName || '서버 개발자' })
    } else if (savedRole === 'player' && savedName) {
      setUser({ role: 'player', name: savedName })
    }
  }, [])

  // 🛠️ 개발자 로그인 (보안: 클라이언트 번들에 암호를 노출하지 않고 서버 API로 검증)
  const loginAsDeveloper = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/verify-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.success) {
        const devSession: UserSession = { role: 'developer', name: '서버 개발자' }
        setUser(devSession)
        localStorage.setItem('ravi_user_role', 'developer')
        localStorage.setItem('ravi_user_name', '서버 개발자')
        return true
      }
      return false
    } catch {
      return false
    }
  }

  // 🎮 플레이어 로그인 (닉네임 입력)
  const loginAsPlayer = (nickname: string): boolean => {
    if (nickname.trim()) {
      const playerSession: UserSession = { role: 'player', name: nickname.trim() }
      setUser(playerSession)
      localStorage.setItem('ravi_user_role', 'player')
      localStorage.setItem('ravi_user_name', nickname.trim())
      return true
    }
    return false
  }

  // 🚪 로그아웃
  const logout = () => {
    setUser({ role: 'guest', name: '방문자' })
    localStorage.removeItem('ravi_user_role')
    localStorage.removeItem('ravi_user_name')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAsDeveloper,
        loginAsPlayer,
        logout,
        isDeveloper: user.role === 'developer',
        isPlayer: user.role === 'player' || user.role === 'developer',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
