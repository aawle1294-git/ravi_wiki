'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ravi_theme') as Theme | null
      if (saved === 'light' || saved === 'dark') {
        setThemeState(saved)
        applyTheme(saved)
      } else {
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
        const initial = prefersLight ? 'light' : 'dark'
        setThemeState(initial)
        applyTheme(initial)
      }
    } catch (e) {
      // localStorage 불가 환경 대비 fallback
      applyTheme('dark')
    }
  }, [])

  const applyTheme = (t: Theme) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(t)
    root.style.colorScheme = t
  }

  const setTheme = (t: Theme) => {
    setThemeState(t)
    try {
      localStorage.setItem('ravi_theme', t)
    } catch (e) {}
    applyTheme(t)
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

