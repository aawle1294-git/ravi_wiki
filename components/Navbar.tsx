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
      alert('👑 개발자 권한으로 로그인되었습니다. 이제 공식 위키를 자유롭게 수정하고 새 문서를 추가할 수 있습니다.')
    } else {
      setErrorMsg('개발자 암호가 올바르지 않습니다.')
    }
  }

  const handlePlayerLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!playerNickname.trim()) {
      setErrorMsg('마인크래프트 닉네임을 입력해주세요.')
      return
    }
    loginAsPlayer(playerNickname.trim())
    setShowLoginModal(false)
    setPlayerNickname('')
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#090a0f]/80 backdrop-blur-2xl border-b border-white/[0.08] text-zinc-100 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* 좌측: 로고 & 메인 세그먼트 메뉴 */}
          <div className="flex items-center space-x-3 sm:space-x-6 shrink-0">
            <Link href="/" className="flex items-center space-x-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-[0_2px_12px_rgba(99,102,241,0.3)] group-hover:scale-105 transition-transform shrink-0 ring-1 ring-white/20">
                <Sword className="w-4 h-4 text-white" />
              </div>
              <div className="whitespace-nowrap flex flex-col leading-tight">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm sm:text-base tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                    라비서버
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    WIKI
                  </span>
                </div>
                <span className="text-[9px] text-zinc-500 font-mono tracking-wider">
                  mcravi.m-c.kr
                </span>
              </div>
            </Link>

            {/* 메인 2대 탭: 모던 세그먼트 버튼 */}
            <nav className="hidden md:flex items-center space-x-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-semibold whitespace-nowrap shrink-0">
              <Link
                href="/official"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                  pathname.startsWith('/official')
                    ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.1]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="whitespace-nowrap">공식 가이드</span>
              </Link>

              <Link
                href="/free-wiki"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                  pathname.startsWith('/free-wiki')
                    ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.1]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span className="whitespace-nowrap">자유 게시판</span>
              </Link>
            </nav>
          </div>

          {/* 우측 도구: 실시간 서버 상태 + IP 복사 + 디스코드 + 로그인 */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 whitespace-nowrap">
            
            {/* 실시간 서버 온라인 뱃지 */}
            <ServerStatusBadge />

            {/* 서버 IP 원클릭 복사 버튼 */}
            <button
              onClick={copyServerIp}
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-xs font-mono text-zinc-300 transition-all whitespace-nowrap shrink-0 active:scale-95"
              title="클릭하여 서버 주소 복사"
            >
              <span className="whitespace-nowrap font-medium text-[11px]">mcravi.m-c.kr</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
            </button>

            {/* 공식 디스코드 바로가기 버튼 */}
            <a
              href="https://discord.com/invite/qeZCRqqbhs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#828cf7] hover:text-white text-xs font-medium transition-all shrink-0 group active:scale-95 shadow-[0_0_12px_rgba(88,101,242,0.12)]"
              title="라비서버 공식 디스코드 커뮤니티 입장"
            >
              <svg className="w-3.5 h-3.5 fill-[#5865F2] group-hover:fill-white transition-colors shrink-0" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span className="font-semibold text-[11px]">디스코드</span>
            </a>

            {/* 로그인 / 사용자 상태 */}
            {user.role === 'developer' ? (
              <div className="flex items-center space-x-1.5 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-1.5 rounded-full text-xs font-semibold text-indigo-200 whitespace-nowrap shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="whitespace-nowrap text-[11px]">개발자</span>
                <button
                  onClick={logout}
                  className="ml-1 text-zinc-400 hover:text-rose-400 transition"
                  title="로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            ) : user.role === 'player' ? (
              <div className="flex items-center space-x-1.5 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1.5 rounded-full text-xs font-semibold text-zinc-200 whitespace-nowrap shrink-0">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap text-[11px] truncate max-w-[80px]">{user.name}</span>
                <button
                  onClick={logout}
                  className="ml-1 text-zinc-400 hover:text-rose-400 transition"
                  title="로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap shrink-0 active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap text-[11px]">로그인</span>
              </button>
            )}
          </div>
        </div>

        {/* 모바일 탭 바 (모바일에서만 노출, 깔끔한 1줄) */}
        <div className="flex md:hidden border-t border-white/[0.06] px-3 py-2 space-x-2 text-xs whitespace-nowrap bg-[#090a0f]/90">
          <Link
            href="/official"
            className={`flex-1 py-1.5 text-center rounded-lg font-medium whitespace-nowrap transition-colors text-xs ${
              pathname.startsWith('/official') ? 'bg-white/[0.08] text-white border border-white/[0.1]' : 'text-zinc-400'
            }`}
          >
            📘 공식 가이드
          </Link>
          <Link
            href="/free-wiki"
            className={`flex-1 py-1.5 text-center rounded-lg font-medium whitespace-nowrap transition-colors text-xs ${
              pathname.startsWith('/free-wiki') ? 'bg-white/[0.08] text-white border border-white/[0.1]' : 'text-zinc-400'
            }`}
          >
            ✍️ 자유 게시판
          </Link>
          <button
            onClick={copyServerIp}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-zinc-300 bg-white/[0.04] border border-white/[0.06]"
          >
            {copied ? 'IP복사됨' : 'IP복사'}
          </button>
        </div>
      </header>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl text-zinc-100 border border-white/[0.1]">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-5">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>🔐</span>
                <span>라비서버 위키 로그인</span>
              </h3>
              <button
                onClick={() => { setShowLoginModal(false); setErrorMsg('') }}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 탭 전환 */}
            <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-1 rounded-xl mb-5 text-xs font-semibold border border-white/[0.05]">
              <button
                type="button"
                onClick={() => { setLoginTab('developer'); setErrorMsg('') }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  loginTab === 'developer'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>개발자 로그인</span>
              </button>
              <button
                type="button"
                onClick={() => { setLoginTab('player'); setErrorMsg('') }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  loginTab === 'player'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
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
                    <label className="text-xs font-semibold text-indigo-300">
                      개발자 암호
                    </label>
                    <span className="text-[10px] text-zinc-500">
                      공식 문서 작성/수정
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="암호를 입력하세요"
                      value={devPassword}
                      onChange={(e) => setDevPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                    💡 <strong>ravi23control</strong> 입력 시 개발자로 인증되어 공식 위키 문서를 수정할 수 있습니다.
                  </p>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-xl">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
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
                    placeholder="인게임 닉네임 (예: Steve, 라비용사)"
                    value={playerNickname}
                    onChange={(e) => setPlayerNickname(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                  />
                  <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                    🎮 닉네임만 입력하면 별도 가입 없이 자유 게시판 작성 및 댓글 소통이 가능합니다.
                  </p>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-xl">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
                >
                  플레이어로 입장하기
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
