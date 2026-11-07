'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { OfficialDoc } from '@/lib/wikiData'
import { getOfficialDocs } from '@/lib/db'
import { useAuth } from '@/lib/auth'
import { 
  BookOpen, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  PlusCircle,
  Sparkles
} from 'lucide-react'

export default function OfficialWikiIndexPage() {
  const { isDeveloper } = useAuth()
  const [docs, setDocs] = useState<OfficialDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOfficialDocs().then(data => {
      setDocs(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        
        {/* 상단 헤더 */}
        <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-10 mb-10 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>라비서버 공식 인증 가이드</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
                📘 공식 위키 코너
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl">
                서버 접속 정보, 필수 규칙, RPG 핵심 시스템 등 개발진이 직접 검증하고 관리하는 공식 문서입니다.
              </p>
            </div>

            {/* 개발자 권한 뱃지 안내 및 추가 버튼 */}
            <div className="flex flex-wrap items-center gap-2">
              {isDeveloper ? (
                <>
                  <div className="flex items-center space-x-2 bg-purple-950 border border-purple-500/60 px-4 py-2.5 rounded-2xl text-xs font-bold text-purple-200 shadow-lg shadow-purple-500/20">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>👑 개발자 모드 (수정 가능)</span>
                  </div>
                  <Link
                    href="/official/new"
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>새 공식 문서 추가</span>
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl text-xs text-slate-400">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>읽기 전용 (개발자 로그인 시 수정 가능)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            공식 위키 문서를 불러오는 중입니다...
          </div>
        ) : (
          /* 공식 문서 카드 그리드 */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {docs.map(doc => (
              <Link
                key={doc.slug}
                href={`/official/${doc.slug}`}
                className="group p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:border-purple-500/50 hover:bg-slate-900/80 transition shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl p-2.5 rounded-2xl bg-slate-800/70 border border-slate-700/50 group-hover:scale-110 transition-transform">
                      {doc.icon}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300">
                      {doc.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition mb-2">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-purple-400 font-semibold">
                  <span>공식 문서 열람하기</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
