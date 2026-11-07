'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { INITIAL_OFFICIAL_DOCS } from '@/lib/wikiData'
import { useAuth } from '@/lib/auth'
import { 
  Sword, 
  Copy, 
  Check, 
  BookOpen, 
  MessageSquare, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  Sparkles,
  Lock,
  ExternalLink
} from 'lucide-react'

export default function HomePage() {
  const { user, isDeveloper } = useAuth()
  const [copied, setCopied] = useState(false)

  const copyServerIp = () => {
    navigator.clipboard.writeText('mcravi.m-c.kr')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1">
        
        {/* 히어로 헤더 */}
        <section className="py-16 sm:py-20 border-b border-slate-800/80 bg-gradient-to-b from-purple-950/20 via-slate-950 to-slate-950 text-center">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>마인크래프트 JE 1.21.x 대응 RPG</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
              라비서버 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">위키 & 커뮤니티</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-8">
              진화하는 RAVI서버, 마인크래프트 RPG의 재미를 잇다.<br />
              공식 가이드와 유저 참여형 자유 위키를 한곳에서 만나보세요.
            </p>

            {/* 서버 IP 복사 버튼 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={copyServerIp}
                className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition transform hover:-translate-y-0.5"
              >
                <span className="font-mono">mcravi.m-c.kr</span>
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4 text-purple-200" />}
                <span className="text-xs bg-purple-700 px-2 py-0.5 rounded-lg text-purple-200">
                  {copied ? '복사 완료!' : 'IP 복사'}
                </span>
              </button>

              <a
                href="https://discord.com/invite/qeZCRqqbhs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-sm transition"
              >
                <span>공식 디스코드</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>
          </div>
        </section>

        {/* 2대 핵심 코너 카드 분리: 공식 위키 vs 자유 위키/게시판 */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 1. 공식 위키 코너 카드 */}
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-purple-500/40 hover:border-purple-500/80 transition-all shadow-xl flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-950 border border-purple-500/50 text-purple-300">
                    🔒 개발자 전용 수정
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white group-hover:text-purple-300 transition mb-3">
                  📘 공식 위키
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  라비서버 개발진이 직접 검증하고 공식 관리하는 정식 가이드입니다.<br />
                  접속 방법, 서버 이용 수칙, RPG 시스템 개요를 확인할 수 있으며, <strong>개발자 로그인 후 수정</strong>이 가능합니다.
                </p>

                {/* 뼈대 문서 바로가기 링크 */}
                <div className="space-y-2 mb-6">
                  {INITIAL_OFFICIAL_DOCS.map(doc => (
                    <Link
                      key={doc.slug}
                      href={`/official/${doc.slug}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-300 transition"
                    >
                      <span className="font-semibold flex items-center space-x-2">
                        <span>{doc.icon}</span>
                        <span>{doc.title}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/official"
                className="flex items-center justify-center space-x-2 w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition"
              >
                <span>공식 위키 전체보기</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 2. 자유 위키 / 게시판 코너 카드 */}
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-indigo-500/40 hover:border-indigo-500/80 transition-all shadow-xl flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-950 border border-indigo-500/50 text-indigo-300">
                    🎮 플레이어 자유 참여
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition mb-3">
                  ✍️ 자유 위키 & 게시판
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  플레이어들이 직접 작성하고 나누는 소통의 장입니다.<br />
                  닉네임만 입력하면 누구나 사냥터 꿀팁, 파티 모집, 질문답변 글을 자유롭게 남기고 추천할 수 있습니다.
                </p>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2 mb-6">
                  <div className="flex items-center space-x-2 text-indigo-300 font-semibold">
                    <span>✨ 자유 위키 참여 기능:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                    <li>플레이어 닉네임으로 즉시 글 작성 및 공유</li>
                    <li>꿀팁 공략, Q&A, 레이드 파티원 모집</li>
                    <li>유익한 글에 대한 유저 추천(좋아요) 기능</li>
                  </ul>
                </div>
              </div>

              <Link
                href="/free-wiki"
                className="flex items-center justify-center space-x-2 w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
              >
                <span>자유 위키 / 게시판 입장하기</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </section>

        {/* 로그인 권한 안내 섹션 */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔐</span>
              <div>
                <p className="text-slate-200 font-semibold">
                  개발자 로그인 안내: 상단 [로그인] 버튼 ➔ [개발자 로그인] 탭에서 암호 <code className="text-purple-300 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-500/40 font-mono">ravi23control</code> 입력 시 공식 위키 수정 권한이 부여됩니다.
                </p>
                <p className="text-slate-500 mt-0.5">
                  일반 플레이어는 [플레이어 로그인] 탭에서 마인크래프트 닉네임만 적으면 자유 위키/게시판에 글을 남길 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-400">마인크래프트 RPG 라비서버 (mcravi.m-c.kr) 공식 위키</p>
      </footer>
    </div>
  )
}
