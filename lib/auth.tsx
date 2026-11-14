'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type UserRole = 'guest' | 'player' | 'developer'

export interface UserSession {
  role: UserRole
  name: string
  avatar?: string
}

export interface AuthResult {
  success: boolean
  message?: string
  notRegistered?: boolean
}

export interface NicknameStatus {
  exists: boolean
  nickname?: string
  avatar?: string
  registeredAt?: string
  isReserved?: boolean
  isDevName?: boolean
  message?: string
}

interface AuthContextType {
  user: UserSession
  loginAsDeveloper: (password: string, nickname?: string) => Promise<boolean>
  loginAsPlayer: (nickname: string, password: string) => Promise<AuthResult>
  registerPlayer: (nickname: string, password: string) => Promise<AuthResult>
  checkNicknameStatus: (nickname: string) => Promise<NicknameStatus>
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
    const savedAvatar = localStorage.getItem('ravi_user_avatar')

    if (savedRole === 'developer') {
      setUser({
        role: 'developer',
        name: savedName || '서버 개발자',
        avatar: savedAvatar || '/logo.png'
      })
    } else if (savedRole === 'player' && savedName) {
      setUser({
        role: 'player',
        name: savedName,
        avatar: savedAvatar || `https://crafthead.net/helm/${encodeURIComponent(savedName)}/32`
      })
    }
  }, [])

  // 🛠️ 개발자 로그인 및 인증 (서버 API 검증, 닉네임 및 스킨 연동)
  const loginAsDeveloper = async (password: string, nickname?: string): Promise<boolean> => {
    try {
      const targetNickname = nickname?.trim() || (user.name !== '방문자' ? user.name : '')
      const res = await fetch('/api/auth/verify-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, nickname: targetNickname }),
      })
      const data = await res.json()
      if (data.success) {
        const finalName = data.nickname || targetNickname || '서버 개발자'
        const finalAvatar = data.avatar || (finalName === '서버 개발자' ? '/logo.png' : `https://crafthead.net/helm/${encodeURIComponent(finalName)}/32`)
        const devSession: UserSession = {
          role: 'developer',
          name: finalName,
          avatar: finalAvatar
        }
        setUser(devSession)
        localStorage.setItem('ravi_user_role', 'developer')
        localStorage.setItem('ravi_user_name', finalName)
        localStorage.setItem('ravi_user_avatar', finalAvatar)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  // 🔍 마인크래프트 닉네임 등록 여부 확인
  const checkNicknameStatus = async (nickname: string): Promise<NicknameStatus> => {
    try {
      if (!nickname.trim()) return { exists: false }
      const res = await fetch(`/api/auth/player?nickname=${encodeURIComponent(nickname.trim())}`)
      const data = await res.json()
      return {
        exists: Boolean(data.exists),
        nickname: data.nickname,
        avatar: data.avatar,
        registeredAt: data.registeredAt,
        isReserved: data.isReserved,
        isDevName: data.isDevName,
        message: data.message
      }
    } catch {
      return { exists: false }
    }
  }

  // 🎮 마인크래프트 닉네임 플레이어 로그인 (비밀번호 검증)
  const loginAsPlayer = async (nickname: string, password: string): Promise<AuthResult> => {
    try {
      if (!nickname.trim()) {
        return { success: false, message: '마인크래프트 닉네임을 입력해주세요.' }
      }
      if (!password || password.length < 4) {
        return { success: false, message: '비밀번호는 최소 4자 이상이어야 합니다.' }
      }

      const res = await fetch('/api/auth/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          nickname: nickname.trim(),
          password
        }),
      })

      const data = await res.json()

      if (data.success) {
        const userRole: UserRole = data.role === 'developer' ? 'developer' : 'player'
        const playerSession: UserSession = {
          role: userRole,
          name: data.nickname || nickname.trim(),
          avatar: data.avatar || `https://crafthead.net/helm/${encodeURIComponent(nickname.trim())}/32`
        }
        setUser(playerSession)
        localStorage.setItem('ravi_user_role', userRole)
        localStorage.setItem('ravi_user_name', playerSession.name)
        localStorage.setItem('ravi_user_avatar', playerSession.avatar || '')
        return { success: true, message: data.message }
      }

      return {
        success: false,
        message: data.error || '로그인에 실패했습니다.',
        notRegistered: Boolean(data.notRegistered)
      }
    } catch (e: any) {
      return { success: false, message: e.message || '네트워크 오류가 발생했습니다.' }
    }
  }

  // ✨ 신규 마인크래프트 닉네임 등록 (최초 비밀번호 설정)
  const registerPlayer = async (nickname: string, password: string): Promise<AuthResult> => {
    try {
      if (!nickname.trim()) {
        return { success: false, message: '마인크래프트 닉네임을 입력해주세요.' }
      }
      if (!password || password.length < 4) {
        return { success: false, message: '비밀번호는 최소 4자 이상이어야 합니다.' }
      }

      const res = await fetch('/api/auth/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          nickname: nickname.trim(),
          password
        }),
      })

      const data = await res.json()

      if (data.success) {
        const playerSession: UserSession = {
          role: 'player',
          name: data.nickname || nickname.trim(),
          avatar: data.avatar || `https://crafthead.net/helm/${encodeURIComponent(nickname.trim())}/32`
        }
        setUser(playerSession)
        localStorage.setItem('ravi_user_role', 'player')
        localStorage.setItem('ravi_user_name', playerSession.name)
        localStorage.setItem('ravi_user_avatar', playerSession.avatar || '')
        return { success: true, message: data.message }
      }

      return {
        success: false,
        message: data.error || '닉네임 등록에 실패했습니다.'
      }
    } catch (e: any) {
      return { success: false, message: e.message || '네트워크 오류가 발생했습니다.' }
    }
  }

  // 🚪 로그아웃
  const logout = () => {
    setUser({ role: 'guest', name: '방문자' })
    localStorage.removeItem('ravi_user_role')
    localStorage.removeItem('ravi_user_name')
    localStorage.removeItem('ravi_user_avatar')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAsDeveloper,
        loginAsPlayer,
        registerPlayer,
        checkNicknameStatus,
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
