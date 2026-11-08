'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { INITIAL_OFFICIAL_DOCS } from '@/lib/wikiData'
import { useAuth } from '@/lib/auth'
import { useVersion } from '@/lib/version'
import VersionModal from '@/components/VersionModal'
import { 
  Sword, 
  Copy, 
  Check, 
  BookOpen, 
  MessageSquare, 
  ArrowRight, 
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
  Flame,
  Radio,
  ChevronRight,
  Edit3,
  Save,
  X,
  Clock
} from 'lucide-react'

export default function HomePage() {
  const { isDeveloper } = useAuth()
  const { selectedVersion, activeInfo, currentVersionInfo, legacyVersionInfo } = useVersion()
  const [copied, setCopied] = useState(false)
  const [showVersionModal, setShowVersionModal] = useState(false)

  // 메인 부제목 설정 상태
  const [subtitle, setSubtitle] = useState('진화하는 마인크래프트 RPG, 라비서버의 모든 것.\n개발진 공식 시스템 가이드와 유저 참여형 자유 게시판을 한곳에서 만나보세요.')
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false)
  const [tempSubtitle, setTempSubtitle] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('ravi_site_subtitle')
    if (saved) {
      setSubtitle(saved)
    }
  }, [])

  const startEditSubtitle = () => {
    setTempSubtitle(subtitle)
    setIsEditingSubtitle(true)
  }

  const saveSubtitle = () => {
    if (!tempSubtitle.trim()) return
    setSubtitle(tempSubtitle.trim())
    localStorage.setItem('ravi_site_subtitle', tempSubtitle.trim())
    setIsEditingSubtitle(false)
  }

  const copyServerIp = () => {
    navigator.clipboard.writeText('mcravi.m-c.kr')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <main className="flex-1">
        
        {/* 1. 히어로 섹션 (절제되고 질리지 않는 모던 테마) */}
        <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden text-center">
          
          {/* 미세한 앰비언트 글로우 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[320px] bg-indigo-500/[0.08] blur-[120px] pointer-events-none -z-10" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* 공식 서버 심볼 엠블럼 로고 */}
            <div className="flex justify-center mb-8">
              <div className="relative group inline-block">
                {/* 금빛 & 인디고 앰비언트 후광 글로우 */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-amber-500/25 via-indigo-500/30 to-purple-500/25 blur-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <img
                  src="/logo.png?v=3"
                  alt="라비서버 공식 엠블럼 로고"
                  className="relative w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.7)] border border-amber-500/20 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* 상단 뱃지: 지금 & 옛날 버전 스위처 연동 */}
            <button
              onClick={() => setShowVersionModal(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-indigo-500/40 text-zinc-300 text-xs font-medium mb-6 backdrop-blur-md shadow-sm transition active:scale-95 group"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${selectedVersion === 'current' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
              <span className="text-zinc-200 font-semibold font-mono">JE {activeInfo.name}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-indigo-300">{activeInfo.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-300 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* 메인 타이틀 */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-[1.12] mb-5">
              라비서버{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 dark:from-zinc-100 dark:via-indigo-200 dark:to-zinc-400">
                위키 & 커뮤니티
              </span>
            </h1>
            
            {/* 서브 카피 (부제목) - 개발자 인라인 설정 지원 */}
            {isEditingSubtitle ? (
              <div className="max-w-xl mx-auto mb-9 p-4 rounded-2xl bg-black/60 border border-white/[0.15] shadow-xl text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-indigo-300 flex items-center space-x-1">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>홈 부제목 설정</span>
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setIsEditingSubtitle(false)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 text-xs font-medium"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={saveSubtitle}
                      className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                    >
                      <Save className="w-3 h-3" />
                      <span>저장</span>
                    </button>
                  </div>
                </div>
                <textarea
                  value={tempSubtitle}
                  onChange={(e) => setTempSubtitle(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                />
              </div>
            ) : (
              <div className="relative group/subtitle inline-block max-w-xl mx-auto mb-9">
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {subtitle}
                </p>
                {isDeveloper && (
                  <button
                    type="button"
                    onClick={startEditSubtitle}
                    className="opacity-60 hover:opacity-100 transition-opacity absolute -right-9 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 shadow-sm"
                    title="홈 부제목 수정 (개발자 전용)"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* 핵심 CTA 버튼 그룹: IP 원클릭 복사 & 공식 디스코드 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              {/* 서버 IP 복사 버튼 */}
              <button
                onClick={copyServerIp}
                className="w-full sm:w-auto flex-1 flex items-center justify-between space-x-3 px-5 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-zinc-200 font-medium text-sm transition-all shadow-sm active:scale-[0.98] group"
                title="클릭하여 서버 주소 복사"
              >
                <div className="flex items-center space-x-2 text-left">
                  <span className="text-xs text-zinc-500 font-mono">IP:</span>
                  <span className="font-mono font-semibold text-white group-hover:text-indigo-200 transition-colors">
                    mcravi.m-c.kr
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">복사됨!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>복사</span>
                    </>
                  )}
                </div>
              </button>

              {/* 공식 디스코드 버튼 */}
              <a
                href="https://discord.com/invite/jRkzZZ9kXp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold text-sm transition-all shadow-sm hover:shadow-[0_0_20px_rgba(88,101,242,0.35)] active:scale-[0.98] shrink-0"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>디스코드 참가</span>
              </a>
            </div>

            {/* 핵심 스펙 미니 뱃지들 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto mt-12 pt-8 border-t border-white/[0.06] text-xs text-zinc-400">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="block text-[11px] text-zinc-500 mb-0.5">서버 플랫폼</span>
                <span className="font-semibold text-zinc-200">Java Edition</span>
              </div>
              <button
                type="button"
                onClick={() => setShowVersionModal(true)}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-indigo-500/30 transition text-left cursor-pointer group/ver"
                title="클릭하여 지금 & 옛날 버전 비교 / 설정"
              >
                <div className="flex items-center justify-between">
                  <span className="block text-[11px] text-zinc-500 mb-0.5">접속 버전</span>
                  <span className="text-[9px] text-indigo-400 group-hover/ver:underline">비교</span>
                </div>
                <span className="font-semibold text-zinc-200 font-mono flex items-center space-x-1">
                  <span>{activeInfo.name}</span>
                  <span className="text-[10px] text-zinc-400">({selectedVersion === 'current' ? '지금' : '옛날'})</span>
                </span>
              </button>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="block text-[11px] text-zinc-500 mb-0.5">게임 장르</span>
                <span className="font-semibold text-zinc-200">정통 판타지 RPG</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="block text-[11px] text-zinc-500 mb-0.5">공식 커뮤니티</span>
                <span className="font-semibold text-[#828cf7]">디스코드 채널</span>
              </div>
            </div>

            {/* 지금 버전 vs 옛날 버전 퀵 배너 */}
            <div className="mt-6 max-w-2xl mx-auto p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>버전 시스템:</span>
                    <span className="text-emerald-400 font-mono">지금({currentVersionInfo.name})</span>
                    <span className="text-zinc-500">vs</span>
                    <span className="text-amber-400 font-mono">옛날({legacyVersionInfo.name})</span>
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {activeInfo.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVersionModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-zinc-200 hover:text-white transition whitespace-nowrap shrink-0 flex items-center space-x-1 self-start sm:self-auto"
              >
                <span>버전 전환 및 비교</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>

          </div>
        </section>

        {/* 2. 2대 코너 탭 카드 섹션 (공식 가이드 vs 자유 게시판) */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* 1) 공식 가이드 카드 */}
            <div className="glass-panel glass-panel-hover p-7 sm:p-8 rounded-3xl flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-400">
                    개발자 전용 수정
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-indigo-200 transition-colors mb-2">
                  📘 공식 가이드
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                  라비서버 개발진이 직접 검증하고 공식 관리하는 정식 가이드입니다.<br />
                  접속 규칙, 명령어, 직업과 장비 시스템을 체계적으로 확인할 수 있습니다.
                </p>

                {/* 뼈대 문서 바로가기 링크 */}
                <div className="space-y-2 mb-6">
                  {INITIAL_OFFICIAL_DOCS.map(doc => (
                    <Link
                      key={doc.slug}
                      href={`/official/${doc.slug}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/[0.1] text-xs text-zinc-300 transition-all group/item"
                    >
                      <span className="font-medium flex items-center space-x-2">
                        <span>{doc.icon}</span>
                        <span className="group-hover/item:text-white transition-colors">{doc.title}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover/item:text-indigo-300 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/official"
                className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-white/[0.04] hover:bg-indigo-600 hover:text-white border border-white/[0.08] hover:border-transparent text-zinc-300 font-semibold text-xs transition-all shadow-sm"
              >
                <span>공식 가이드 전체보기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2) 자유 게시판 카드 */}
            <div className="glass-panel glass-panel-hover p-7 sm:p-8 rounded-3xl flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-400">
                    플레이어 자유 참여
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-violet-200 transition-colors mb-2">
                  ✍️ 자유 위키 & 게시판
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                  플레이어들이 직접 작성하고 소통하는 열린 광장입니다.<br />
                  인게임 닉네임만 입력하면 누구나 사냥터 꿀팁, 파티원 모집, Q&A 글을 남길 수 있습니다.
                </p>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-xs text-zinc-400 space-y-2 mb-6">
                  <div className="flex items-center space-x-1.5 text-violet-300 font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>자유 게시판 주요 기능:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-1 text-[11px] leading-relaxed">
                    <li>인게임 닉네임으로 별도 가입 없이 즉시 글 작성</li>
                    <li>사냥터 공략, 초보자 가이드, 레이드 파티원 모집</li>
                    <li>유익한 글에 대한 추천(좋아요) 및 실시간 댓글 토론</li>
                  </ul>
                </div>
              </div>

              <Link
                href="/free-wiki"
                className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-white/[0.04] hover:bg-violet-600 hover:text-white border border-white/[0.08] hover:border-transparent text-zinc-300 font-semibold text-xs transition-all shadow-sm"
              >
                <span>자유 게시판 바로가기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </section>

        {/* 3. 공식 디스코드 연동 배너 섹션 (모던하고 질리지 않는 디자인) */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative overflow-hidden rounded-3xl p-7 sm:p-10 border border-[#5865F2]/20 bg-gradient-to-r from-[#5865F2]/[0.08] via-transparent to-transparent backdrop-blur-xl">
            
            {/* 디스코드 배경 워터마크 로고 */}
            <div className="absolute right-4 -bottom-10 opacity-[0.06] pointer-events-none select-none">
              <svg className="w-72 h-72 fill-[#5865F2]" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#5865F2]/15 border border-[#5865F2]/30 text-[#828cf7] text-[11px] font-semibold">
                  <span>OFFICIAL DISCORD</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  라비서버 공식 디스코드 커뮤니티
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                  실시간 서버 점검 공지, 업데이트 패치노트, 실시간 이벤트 알림 및 파티원 매칭이 디스코드 채널에서 가장 빠르게 진행됩니다.
                </p>
              </div>

              <a
                href="https://discord.com/invite/jRkzZZ9kXp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-sm shadow-[0_0_20px_rgba(88,101,242,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>디스코드 채널 참가</span>
              </a>
            </div>
          </div>
        </section>

        {/* 4. 권한 및 팁 안내 섹션 */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-3">
              <span className="text-xl">🔐</span>
              <div>
                <p className="text-zinc-300 font-medium">
                  공식 위키 편집: 서버 개발진은 상단 <strong>[로그인]</strong> ➔ <strong>[개발자 로그인]</strong>에서 전용 암호 인증 후 공식 가이드를 수정할 수 있습니다.
                </p>
                <p className="text-zinc-500 mt-1 text-[11px]">
                  일반 플레이어는 닉네임만 입력하면 자유 위키에 글과 댓글을 남길 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 버전 선택 및 비교 모달 */}
      <VersionModal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
      />

      {/* 푸터 */}
      <footer className="border-t border-white/[0.06] bg-[#07080c] py-8 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center space-y-2">
          <img src="/logo.png?v=3" alt="라비서버 로고" className="w-9 h-9 rounded-xl opacity-90 mb-1 object-cover shadow-sm" />
          <p className="font-semibold text-zinc-400">마인크래프트 RPG 라비서버 (mcravi.m-c.kr) 공식 위키</p>
          <p className="text-[11px]">모든 게임 콘텐츠의 저작권은 라비서버 및 Mojang Studios에 있습니다.</p>
        </div>
      </footer>
    </div>
  )
}
