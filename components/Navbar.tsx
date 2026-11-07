'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Sword, 
  Copy, 
  Check, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  KeyRound, 
  UserCheck,
  X,
  Lock,
  BookOpen,
  MessageSquare
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import ServerStatusBadge from './ServerStatusBadge'

export default function Navbar() {
  const pathname = usePathname()
  const { user, loginAsDeveloper, loginAsPlayer, logout } = useAuth()
  
  const [copied, setCopied] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginTab, setLoginTab] = useState<'developer' | 'player'>('developer')
  const [devPassword, setDevPassword] = useState('')
  const [playerNickname, setPlayerNickname] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const copyServerIp = () => {
    navigator.clipboard.writeText('mcravi.m-c.kr')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDevLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    const success = loginAsDeveloper(devPassword)
    if (success) {
      setShowLoginModal(false)
      setDevPassword('')
      alert('👑 개발자 권한으로 로그인되었습니다. 이제 공식 위키를 수정할 수 있습니다!')
    } else {
      setErrorMsg('개발자 비밀번호가 일치하지 않습니다. (힌트: 지정된 암호 입력)')
    }
  }

  const handlePlayerLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!playerNickname.trim()) {
      setErrorMsg('닉네임을 입력해주세요.')
      return
    }
    loginAsPlayer(playerNickname.trim())
    setShowLoginModal(false)
    setPlayerNickname('')
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* 좌측: 로고 & 메인 메뉴 */}
          <div className="flex items-center space-x-4 sm:space-x-6 shrink-0">
            <Link href="/" className="flex items-center space-x-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Sword className="w-4 h-4" />
              </div>
              <div className="whitespace-nowrap">
                <span className="font-black text-base sm:text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-200">
                  라비서버 위키
                </span>
                <span className="block text-[9px] text-purple-400/80 -mt-1 font-mono tracking-widest">
                  RAVI SERVER
                </span>
              </div>
            </Link>

            {/* 메인 2대 탭: 한 줄로 깔끔하게 고정 */}
            <nav className="hidden md:flex items-center space-x-1.5 text-xs font-semibold whitespace-nowrap shrink-0">
              <Link
                href="/official"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition shrink-0 ${
                  pathname.startsWith('/official')
                    ? 'bg-purple-600/20 border border-purple-500/50 text-purple-200 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="whitespace-nowrap">📘 공식 위키</span>
              </Link>

              <Link
                href="/free-wiki"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition shrink-0 ${
                  pathname.startsWith('/free-wiki')
                    ? 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-200 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="whitespace-nowrap">✍️ 자유 위키</span>
              </Link>
            </nav>
          </div>

          {/* 우측 영역: 서버 상태 + IP 복사 + 로그인 / 권한 상태 */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 whitespace-nowrap">
            
            {/* 실시간 서버 온라인 뱃지 */}
            <ServerStatusBadge />

            {/* 서버 IP 복사 버튼 */}
            <button
              onClick={copyServerIp}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-mono text-purple-300 transition whitespace-nowrap shrink-0"
              title="클릭하여 서버 주소 복사"
            >
              <span className="whitespace-nowrap">mcravi.m-c.kr</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            </button>

            {/* 로그인 상태 */}
            {user.role === 'developer' ? (
              <div className="flex items-center space-x-1.5 bg-purple-950/90 border border-purple-500/50 px-2.5 py-1.5 rounded-xl text-xs font-bold text-purple-200 whitespace-nowrap shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="whitespace-nowrap">👑 개발자</span>
                <button
                  onClick={logout}
                  className="ml-1 text-slate-400 hover:text-red-400 transition"
                  title="로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            ) : user.role === 'player' ? (
              <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 whitespace-nowrap shrink-0">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap truncate max-w-[100px]">🎮 {user.name}</span>
                <button
                  onClick={logout}
                  className="ml-1 text-slate-400 hover:text-red-400 transition"
                  title="로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">로그인</span>
              </button>
            )}
          </div>
        </div>

        {/* 모바일 탭 네비게이션 */}
        <div className="flex md:hidden border-t border-slate-800/80 px-4 py-2 space-x-2 text-xs whitespace-nowrap">
          <Link
            href="/official"
            className={`flex-1 py-1.5 text-center rounded-lg font-semibold whitespace-nowrap ${
              pathname.startsWith('/official') ? 'bg-purple-600/30 text-purple-300' : 'text-slate-400'
            }`}
          >
            📘 공식 위키
          </Link>
          <Link
            href="/free-wiki"
            className={`flex-1 py-1.5 text-center rounded-lg font-semibold whitespace-nowrap ${
              pathname.startsWith('/free-wiki') ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-400'
            }`}
          >
            ✍️ 자유 위키
          </Link>
        </div>
      </header>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl text-slate-100">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>🔐</span>
                <span>라비서버 위키 로그인</span>
              </h3>
              <button
                onClick={() => { setShowLoginModal(false); setErrorMsg('') }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 탭 전환 */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl mb-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setLoginTab('developer'); setErrorMsg('') }}
                className={`py-2 rounded-lg transition flex items-center justify-center space-x-1 ${
                  loginTab === 'developer'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>개발자 로그인</span>
              </button>
              <button
                type="button"
                onClick={() => { setLoginTab('player'); setErrorMsg('') }}
                className={`py-2 rounded-lg transition flex items-center justify-center space-x-1 ${
                  loginTab === 'player'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>플레이어 로그인</span>
              </button>
            </div>

            {/* 1. 개발자 로그인 폼 */}
            {loginTab === 'developer' ? (
              <form onSubmit={handleDevLogin} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-purple-300">
                      개발자 암호 입력
                    </label>
                    <span className="text-[11px] text-slate-500">
                      공식 위키 수정 전용
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="암호를 입력하세요"
                      value={devPassword}
                      onChange={(e) => setDevPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    💡 <strong>ravi23control</strong>을 입력하면 개발자로 인증되어 공식 위키 문서를 수정할 수 있습니다.
                  </p>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 p-2.5 rounded-xl">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition"
                >
                  개발자 인증하기
                </button>
              </form>
            ) : (
              /* 2. 플레이어 로그인 폼 */
              <form onSubmit={handlePlayerLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-indigo-300 mb-1.5">
                    마인크래프트 닉네임
                  </label>
                  <input
                    type="text"
                    placeholder="인게임 닉네임 입력 (예: Steve, 라비용사)"
                    value={playerNickname}
                    onChange={(e) => setPlayerNickname(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-2">
                    🎮 비밀번호 없이 닉네임만 입력하면 자유 위키 작성 및 게시판 글쓰기가 가능합니다.
                  </p>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 p-2.5 rounded-xl">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
                >
                  플레이어로 접속하기
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
