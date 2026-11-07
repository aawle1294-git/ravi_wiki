'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { INITIAL_OFFICIAL_DOCS } from '@/lib/wikiData'
import { 
  Sword, 
  Copy, 
  Check, 
  BookOpen, 
  MessageSquare, 
  ArrowRight, 
  Sparkles,
  ExternalLink,
  Users,
  Shield,
  Zap,
  Flame
} from 'lucide-react'

export default function HomePage() {
  const [copied, setCopied] = useState(false)

  const copyServerIp = () => {
    navigator.clipboard.writeText('mcravi.m-c.kr')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col text-zinc-100 selection:bg-purple-500/30 selection:text-purple-200">
      <Navbar />

      <main className="flex-1">
        
        {/* 히어로 헤더 섹션 */}
        <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden text-center">
          
          {/* 배경 앰비언트 글로우 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-purple-600/15 via-indigo-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* 상단 뱃지 */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-medium mb-6 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
              <span>마인크래프트 JE 1.21.x 대응 정통 RPG</span>
            </div>

            {/* 타이틀 & 슬로건 */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-5">
              라비서버{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-300">
                위키 & 커뮤니티
              </span>
            </h1>
            
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed mb-9">
              진화하는 RAVI서버, 마인크래프트 RPG의 재미를 잇다.<br className="hidden sm:inline" />
              개발진 공식 가이드와 유저 참여형 자유 위키를 한곳에서 만나보세요.
            </p>

            {/* 서버 IP 복사 버튼 & 디스코드 버튼 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={copyServerIp}
                className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-[0_0_25px_rgba(147,51,234,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="font-mono tracking-wide font-bold">mcravi.m-c.kr</span>
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4 text-purple-200" />}
                <span className="text-[11px] bg-black/20 px-2 py-0.5 rounded-md text-purple-100 font-normal">
                  {copied ? '복사 완료!' : 'IP 복사'}
                </span>
              </button>

              <a
                href="https://discord.com/invite/qeZCRqqbhs"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] text-zinc-200 font-medium text-sm transition-all"
              >
                <svg className="w-4 h-4 fill-[#5865F2]" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>공식 디스코드 입장</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
              </a>
            </div>
          </div>
        </section>

        {/* 2대 코너 탭 카드 섹션 */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* 1. 공식 위키 카드 */}
            <div className="glass-panel glass-panel-hover p-7 sm:p-9 rounded-3xl flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-sm">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300">
                    🔒 개발자 전용 수정
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-300 transition-colors mb-2.5">
                  📘 공식 위키
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                  라비서버 개발진이 직접 검증하고 공식 관리하는 정식 가이드입니다.<br />
                  접속 방법, 필수 수칙, 직업과 장비 시스템을 확인할 수 있으며, <strong>개발자 로그인 후 수정</strong>이 가능합니다.
                </p>

                {/* 뼈대 문서 바로가기 링크 */}
                <div className="space-y-2 mb-6">
                  {INITIAL_OFFICIAL_DOCS.map(doc => (
                    <Link
                      key={doc.slug}
                      href={`/official/${doc.slug}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-purple-500/30 text-xs text-zinc-300 transition-all"
                    >
                      <span className="font-medium flex items-center space-x-2">
                        <span>{doc.icon}</span>
                        <span>{doc.title}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/official"
                className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-white/[0.05] hover:bg-purple-600 hover:text-white border border-white/[0.08] hover:border-transparent text-zinc-200 font-semibold text-xs transition-all shadow-sm"
              >
                <span>공식 위키 전체보기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2. 자유 위키 & 게시판 카드 */}
            <div className="glass-panel glass-panel-hover p-7 sm:p-9 rounded-3xl flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-300">
                    🎮 플레이어 자유 참여
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-2.5">
                  ✍️ 자유 위키 & 게시판
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                  플레이어들이 직접 작성하고 나누는 열린 소통 공간입니다.<br />
                  인게임 닉네임만 입력하면 누구나 사냥터 꿀팁, 파티 모집, 질문답변 글을 자유롭게 남기고 추천할 수 있습니다.
                </p>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-xs text-zinc-400 space-y-2 mb-6">
                  <div className="flex items-center space-x-1.5 text-indigo-300 font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>자유 위키 참여 기능:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-1 text-[11px] leading-relaxed">
                    <li>플레이어 닉네임으로 비밀번호 없이 즉시 글 작성</li>
                    <li>꿀팁 공략, Q&A, 레이드 파티원 모집</li>
                    <li>유익한 글에 대한 추천(좋아요) 및 실시간 댓글 소통</li>
                  </ul>
                </div>
              </div>

              <Link
                href="/free-wiki"
                className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-white/[0.05] hover:bg-indigo-600 hover:text-white border border-white/[0.08] hover:border-transparent text-zinc-200 font-semibold text-xs transition-all shadow-sm"
              >
                <span>자유 위키 / 게시판 입장하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </section>

        {/* 대형 디스코드 커뮤니티 배너 섹션 */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-[#5865F2]/25 bg-gradient-to-r from-[#5865F2]/10 via-[#5865F2]/5 to-transparent backdrop-blur-xl">
            
            {/* 디스코드 배경 워터마크 로고 */}
            <div className="absolute right-4 -bottom-8 opacity-10 pointer-events-none select-none">
              <svg className="w-64 h-64 fill-[#5865F2]" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] text-[11px] font-semibold">
                  <span>DISCORD COMMUNITY</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  라비서버 공식 디스코드에서 함께하세요
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                  실시간 서버 점검 공지, 업데이트 패치노트, 실시간 이벤트 및 유저 간 파티 매칭이 디스코드에서 가장 빠르게 진행됩니다.
                </p>
              </div>

              <a
                href="https://discord.com/invite/qeZCRqqbhs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-sm shadow-[0_0_20px_rgba(88,101,242,0.4)] transition-all transform hover:-translate-y-0.5 shrink-0"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>디스코드 서버 참가하기</span>
              </a>
            </div>
          </div>
        </section>

        {/* 로그인 권한 안내 섹션 */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🔐</span>
              <div>
                <p className="text-zinc-300 font-medium">
                  개발자 로그인 안내: 상단 [로그인] ➔ [개발자 로그인] 탭에서 암호 <code className="text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30 font-mono">ravi23control</code> 입력 시 공식 위키 수정 권한이 부여됩니다.
                </p>
                <p className="text-zinc-500 mt-0.5 text-[11px]">
                  일반 플레이어는 [플레이어 로그인] 탭에서 마인크래프트 닉네임만 적으면 자유 위키에 글을 남길 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-white/[0.06] bg-[#060709] py-8 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-zinc-400">마인크래프트 RPG 라비서버 (mcravi.m-c.kr) 공식 위키</p>
          <p className="text-[11px]">모든 게임 콘텐츠의 저작권은 라비서버 및 Mojang Studios에 있습니다.</p>
        </div>
      </footer>
    </div>
  )
}
