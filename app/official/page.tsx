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
  ExternalLink
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
    <div className="min-h-screen flex flex-col text-zinc-900 dark:text-zinc-100">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        
        {/* 상단 헤더 */}
        <div className="glass-panel rounded-3xl p-6 sm:p-9 mb-9 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-indigo-300 text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>라비서버 공식 인증 가이드</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                📘 공식 가이드
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                서버 접속 정보, 필수 규칙, RPG 시스템 등 개발진이 직접 검증하고 관리하는 공식 문서입니다.
              </p>
            </div>

            {/* 개발자 권한 뱃지 안내 및 추가 버튼 */}
            <div className="flex flex-wrap items-center gap-2">
              {isDeveloper ? (
                <>
                  <div className="flex items-center space-x-1.5 bg-indigo-500/15 border border-indigo-500/30 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-200">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>👑 개발자 모드</span>
                  </div>
                  <Link
                    href="/official/new"
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>새 공식 문서 추가</span>
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-1.5 bg-white/[0.03] border border-white/[0.08] px-3.5 py-2 rounded-xl text-xs text-zinc-400">
                  <Lock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>읽기 전용 (개발자 암호 인증 시 수정 가능)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading ? (
          <div className="text-center py-20 text-zinc-500 text-xs">
            공식 위키 문서를 불러오는 중입니다...
          </div>
        ) : (
          /* 공식 문서 카드 그리드 */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {docs.map(doc => (
              <Link
                key={doc.slug}
                href={`/official/${doc.slug}`}
                className="glass-panel glass-panel-hover p-6 rounded-3xl transition shadow-lg flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] group-hover:scale-105 transition-transform">
                      {doc.icon}
                    </span>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300">
                      {doc.category}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-200 transition-colors mb-2">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {doc.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 group-hover:text-indigo-300 font-medium transition-colors">
                  <span>공식 문서 열람하기</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
