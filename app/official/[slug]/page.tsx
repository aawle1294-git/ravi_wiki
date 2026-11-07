'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import WikiMarkdownRenderer from '@/components/WikiMarkdownRenderer'
import { OfficialDoc } from '@/lib/wikiData'
import { getOfficialDocBySlug, getOfficialDocs, saveOfficialDoc } from '@/lib/db'
import { useAuth } from '@/lib/auth'
import { 
  BookOpen, 
  ShieldCheck, 
  Lock, 
  Edit3, 
  Save, 
  X, 
  ChevronRight, 
  Clock, 
  CheckCircle2
} from 'lucide-react'

export default function OfficialDocDetailPage() {
  const params = useParams()
  const slug = (params?.slug as string) || 'getting-started'
  const { isDeveloper } = useAuth()

  const [doc, setDoc] = useState<OfficialDoc | null>(null)
  const [allDocs, setAllDocs] = useState<OfficialDoc[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getOfficialDocBySlug(slug).then(d => {
      if (d) {
        setDoc(d)
        setEditTitle(d.title)
        setEditContent(d.content)
      }
    })

    getOfficialDocs().then(list => {
      setAllDocs(list)
    })
  }, [slug])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!doc || !isDeveloper) return

    setIsSaving(true)
    const updated: OfficialDoc = {
      ...doc,
      title: editTitle.trim(),
      content: editContent.trim(),
      updatedAt: new Date().toISOString().split('T')[0]
    }

    const success = await saveOfficialDoc(updated)
    if (success) {
      setDoc(updated)
      setIsEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } else {
      alert('저장 중 오류가 발생했습니다.')
    }
    setIsSaving(false)
  }

  if (!doc) {
    return (
      <div className="min-h-screen flex flex-col text-zinc-100">
        <Navbar />
        <div className="text-center py-24 text-zinc-500 text-xs">공식 문서를 불러오는 중입니다...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col text-zinc-100">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {/* 상단 브레드크럼 및 상태 바 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07] mb-7">
          <div className="flex items-center space-x-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-white transition">홈</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <Link href="/official" className="hover:text-white transition">공식 가이드</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-200 font-medium truncate max-w-[200px]">{doc.title}</span>
          </div>

          <div className="flex items-center space-x-3">
            {isDeveloper ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full font-semibold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>개발자 권한</span>
                </span>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>문서 편집</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-xs text-zinc-400 bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-full">
                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                <span>공식 문서는 개발자만 수정 가능합니다</span>
              </div>
            )}
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>문서 수정 내용이 성공적으로 저장되었습니다!</span>
          </div>
        )}

        {/* 2단 그리드: 좌측 공식 목차 + 우측 본문/편집창 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* 좌측 사이드바 */}
          <aside className="hidden lg:block lg:col-span-1 space-y-4">
            <div className="glass-panel rounded-2xl p-4 sticky top-24">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>공식 가이드 목록</span>
              </h3>
              <ul className="space-y-1 text-xs">
                {allDocs.map(item => (
                  <li key={item.slug}>
                    <Link
                      href={`/official/${item.slug}`}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition ${
                        item.slug === slug
                          ? 'bg-white/[0.08] border border-white/[0.12] text-white font-bold'
                          : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-4 border-t border-white/[0.06] space-y-2">
                <Link
                  href="/free-wiki"
                  className="flex items-center justify-center space-x-1.5 w-full py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-zinc-300 text-xs font-medium transition"
                >
                  <span>✍️ 자유 게시판 가기</span>
                </Link>

                <a
                  href="https://discord.com/invite/jRkzZZ9kXp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-1.5 w-full py-2 rounded-xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#828cf7] text-xs font-medium transition"
                >
                  <span>디스코드 질문하기</span>
                </a>
              </div>
            </div>
          </aside>

          {/* 본문 영역 */}
          <article className="lg:col-span-3 min-w-0 w-full">
            {isEditing ? (
              /* 개발자 전용 편집 폼 */
              <form onSubmit={handleSave} className="glass-panel border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center space-x-2">
                    <Edit3 className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-bold text-white">공식 위키 문서 편집기 (개발자 전용)</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">문서 제목</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    문서 본문 (GitHub Flavored Markdown)
                  </label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={18}
                    required
                    className="w-full p-4 rounded-xl bg-black/40 border border-white/[0.1] text-zinc-200 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-y"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-zinc-500">
                    👑 저장 시 데이터베이스에 영구 반영됩니다.
                  </span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] text-xs font-semibold"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? '저장 중...' : '수정 내용 저장'}</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* 문서 읽기 모드 */
              <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-xl w-full min-w-0">
                
                {/* 메타 정보 */}
                <div className="flex items-center space-x-3 text-xs text-zinc-400 pb-5 mb-6 border-b border-white/[0.07]">
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>라비서버 공식 문서</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>최종 수정: {doc.updatedAt}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 font-medium text-[11px]">
                    {doc.category}
                  </span>
                </div>

                {/* 마크다운 렌더링 */}
                <WikiMarkdownRenderer content={doc.content} />
              </div>
            )}
          </article>
        </div>
      </main>
    </div>
  )
}
