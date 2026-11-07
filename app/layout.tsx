import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth'

export const metadata: Metadata = {
  title: '라비서버 위키 | 마인크래프트 RPG RAVI SERVER',
  description: '마인크래프트 레전드 RPG 라비서버(mcravi.m-c.kr) 공식 위키 및 자유 커뮤니티',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-purple-500 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
